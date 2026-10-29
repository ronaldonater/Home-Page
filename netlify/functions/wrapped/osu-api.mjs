import {createSharedOsuFetch} from './shared-osu-cache.mjs';
import {createHash} from 'node:crypto';
import {imageBytes} from './hardening.mjs';
const delay=(ms,signal)=>new Promise((resolve,reject)=>{if(signal?.aborted)return reject(signal.reason);const stop=()=>{clearTimeout(timer);reject(signal.reason);};const timer=setTimeout(()=>{signal?.removeEventListener('abort',stop);resolve();},ms);signal?.addEventListener('abort',stop,{once:true});});
const admission=`INSERT INTO wrapped_api_budget (budget_key,next_at) VALUES ($1,clock_timestamp()+interval '1100 milliseconds') ON CONFLICT (budget_key) DO UPDATE SET next_at=clock_timestamp()+interval '1100 milliseconds' WHERE wrapped_api_budget.next_at<=clock_timestamp() RETURNING budget_key`;
async function databaseQuery(url,sql,params){const {neon}=await import('@neondatabase/serverless');return neon(url).query(sql,params,{fetchOptions:{signal:AbortSignal.timeout(2000)}});}
export const apiBudget={query:databaseQuery};
export function createOsuApi({fetchImpl=(...args)=>fetch(...args),now=Date.now,sleep=delay,query=(...args)=>apiBudget.query(...args),config=()=>({databaseUrl:process.env.WRAPPED_DATABASE_URL,clientId:process.env.WRAPPED_OSU_CLIENT_ID})}={}){
 let tail=Promise.resolve(),next=0,cooldown=0,databaseRetryAt=0,cachedBytes=0;const cache=new Map(),pending=new Map();
 async function request(url,options){
  const signal=options.signal;signal?.throwIfAborted();
  const previous=tail;let release;tail=new Promise(resolve=>release=resolve);
  try{
   // Serialize starts, not response downloads. Aborted queue entries never contact osu!.
   await previous;signal?.throwIfAborted();
   if(now()<cooldown)return new Response(null,{status:429,headers:{'Retry-After':String(Math.ceil((cooldown-now())/1000))}});
   if(now()<next)await sleep(next-now(),signal);signal?.throwIfAborted();
   if(now()<cooldown)return new Response(null,{status:429});
   const cfg=config(),key=createHash('sha256').update('osu-api:'+String(cfg.clientId||'default')).digest('hex');
   if(cfg.databaseUrl&&now()>=databaseRetryAt){
    try{while(!(await query(cfg.databaseUrl,admission,[key])).length){await sleep(1100,signal);signal?.throwIfAborted();}}
    catch(error){if(signal?.aborted)throw error;databaseRetryAt=now()+60000;}
   }
   signal?.throwIfAborted();next=now()+1100;
   const result=fetchImpl(url,options);release();release=null;
   const response=await result;
   if(response.status===429){const raw=response.headers.get('retry-after');const seconds=Number(raw);const until=raw&&Number.isFinite(seconds)?now()+Math.max(0,seconds)*1000:Date.parse(raw);cooldown=Math.max(cooldown,Number.isFinite(until)?until:now()+60000);
    if(cfg.databaseUrl&&now()>=databaseRetryAt)try{await query(cfg.databaseUrl,"UPDATE wrapped_api_budget SET next_at=GREATEST(next_at,to_timestamp($2 / 1000.0)) WHERE budget_key=$1",[key,cooldown]);}catch{}
   }
   return response;
  }finally{release?.();}
 }
 return async function osuFetch(input,options={}){
  const url=new URL(String(input));if(url.origin!=='https://osu.ppy.sh'||(!url.pathname.startsWith('/api/v2/')&&url.pathname!=='/oauth/token'))return fetchImpl(input,options);
  const match=options.method&&options.method!=='GET'?null:url.pathname.match(/^\/api\/v2\/beatmapsets\/([1-9]\d*)$/);
  if(!match)return request(input,options);
  const key=match[1],saved=cache.get(key);options.signal?.throwIfAborted();
  const responseFrom=value=>new Response(value.bytes,{status:200,headers:value.headers});
  if(saved?.until>now())return responseFrom(saved);
  if(pending.has(key)){const value=await pending.get(key);options.signal?.throwIfAborted();return responseFrom(value);}
  const task=(async()=>{const response=await request(input,{...options,headers:{...Object.fromEntries(new Headers(options.headers)),'x-api-version':'20220705'}});if(!response.ok){const error=new Error('Beatmapset temporarily unavailable');error.response=response;throw error;}const value={bytes:await imageBytes(response,1024*1024),headers:{'content-type':'application/json'},until:now()+21600000};if(cache.has(key))cachedBytes-=cache.get(key).bytes.length;cache.set(key,value);cachedBytes+=value.bytes.length;while(cache.size>128||cachedBytes>32*1024*1024){const oldest=cache.keys().next().value;cachedBytes-=cache.get(oldest).bytes.length;cache.delete(oldest);}return value;})();pending.set(key,task);
  try{return responseFrom(await task);}catch(error){if(error.response)return error.response.clone();throw error;}finally{pending.delete(key);}
 };
}
export const osuFetch=createSharedOsuFetch(createOsuApi());
