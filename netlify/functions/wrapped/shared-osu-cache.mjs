import {createHash} from 'node:crypto';
import {imageBytes} from './hardening.mjs';
import {reviewStorage,encryptReview,decryptReview} from './review-storage.mjs';
// Only successful JSON responses are stored. Credentials are never written to storage.
export function createSharedOsuFetch(fetchImpl,{query=(...args)=>reviewStorage.query(...args),config=()=>({databaseUrl:process.env.WRAPPED_DATABASE_URL,secret:process.env.WRAPPED_SESSION_SECRET}),now=Date.now}={}){
 let retryAt=0;
 return async function sharedFetch(input,options={}){
  const url=new URL(String(input)),method=(options.method||'GET').toUpperCase(),cfg=config();
  const publicMap=/^\/api\/v2\/beatmapsets\/[1-9]\d*$/.test(url.pathname)&&method==='GET';
  const attributes=/^\/api\/v2\/beatmaps\/[1-9]\d*\/attributes$/.test(url.pathname)&&method==='POST';
  const personal=method==='GET'&&(/^\/api\/v2\/me(?:\/(?:osu|taiko|fruits|mania))?$/.test(url.pathname)||/^\/api\/v2\/users\/[1-9]\d*\/(?:scores\/best|beatmapsets\/(?:ranked|loved|pending|graveyard))$/.test(url.pathname));
  if(url.origin!=='https://osu.ppy.sh'||!cfg.databaseUrl||!cfg.secret||now()<retryAt||!(publicMap||attributes||personal))return fetchImpl(input,options);
  const ttl=publicMap?21600:attributes?86400:url.pathname.includes('/beatmapsets/')?900:300;
  const auth=personal?new Headers(options.headers).get('authorization')||'':'';
  const cacheKey=createHash('sha256').update(JSON.stringify([url.href,method,options.body||'',auth,publicMap?'20220705':new Headers(options.headers).get('x-api-version')||''])).digest('hex');
  options.signal?.throwIfAborted();
  try{const rows=await query(cfg.databaseUrl,'SELECT payload FROM wrapped_review_cache WHERE cache_key=$1 AND expires_at>now()',[cacheKey]);const saved=rows[0]?.payload&&decryptReview(rows[0].payload,cfg.secret);if(typeof saved?.body==='string'){options.signal?.throwIfAborted();return new Response(saved.body,{headers:{'Content-Type':'application/json'}});}}catch(error){if(options.signal?.aborted)throw error;retryAt=now()+60000;}
  const response=await fetchImpl(input,options);
  if(now()>=retryAt&&response.ok&&response.headers.get('content-type')?.includes('application/json')){
   try{const body=(await imageBytes(response.clone(),3*1024*1024)).toString('utf8'),payload=encryptReview({body},cfg.secret);await query(cfg.databaseUrl,`INSERT INTO wrapped_review_cache(cache_key,payload,expires_at) VALUES($1,$2,now()+$3::int*interval '1 second') ON CONFLICT(cache_key) DO UPDATE SET payload=EXCLUDED.payload,expires_at=EXCLUDED.expires_at`,[cacheKey,payload,ttl]);}catch{retryAt=now()+60000;}
  }
  return response;
 };
}
