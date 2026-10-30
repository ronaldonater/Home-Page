import {createOsuApi} from '../netlify/functions/wrapped/osu-api.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rankMapperSets} from './ranked-mappers-core.mjs';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const clientId=process.env.OSU_CLIENT_ID||process.env.WRAPPED_OSU_CLIENT_ID,clientSecret=process.env.OSU_CLIENT_SECRET||process.env.WRAPPED_OSU_CLIENT_SECRET;
if(!clientId||!clientSecret)throw Error('osu! app credentials are required to refresh mapper rankings');
const databaseUrl=process.env.DATABASE_URL||process.env.WRAPPED_DATABASE_URL;
if(!databaseUrl)throw Error('Add the existing Neon connection string as the DATABASE_URL GitHub Actions secret before running shared snapshot refreshes.');
const api=createOsuApi({lane:'snapshot',requireSharedBudget:true,config:()=>({databaseUrl,clientId}),fetchImpl:(url,options)=>fetch(url,{...options,signal:AbortSignal.any([options.signal,AbortSignal.timeout(15000)])})});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,process.argv[2]||'netlify/functions/wrapped/data/ranked-mappers.json');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function request(url,options={}){
 for(let attempt=0;attempt<8;attempt++){
  let wait=0;
  try{
   const r=await api(url,{...options,redirect:'error',signal:AbortSignal.timeout(120000)});
   if(r.ok)return r.json();
   if(r.status!==429&&r.status<500)throw Object.assign(Error('osu! request failed: '+r.status),{permanent:true});
   const retry=r.headers.get('retry-after'),seconds=Number(retry),date=Date.parse(retry);wait=retry?(Number.isFinite(seconds)?seconds*1000:Math.max(0,date-Date.now())):0;
  }catch(error){if(error.permanent)throw error;if(attempt===7)throw Error('Snapshot refresh could not obtain shared API access. Previous snapshot preserved.');}
  if(attempt<7)await pause(Math.max(Math.min(60000,5000*2**attempt),Number.isFinite(wait)?wait:0));
 }
 throw Error('osu! requests failed after retries; previous snapshot preserved');
}

const token=await request('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:clientSecret,grant_type:'client_credentials',scope:'public'})});
if(typeof token.access_token!=='string')throw Error('No osu! app token');
const rows=[],cursors=new Set();let cursor=null,expected=null,complete=false;
for(let page=0;page<400;page++){
 const query=new URLSearchParams({q:'ranked>=2026-01-01 ranked<2027-01-01',s:'ranked',sort:'ranked_asc',nsfw:'true'});if(cursor)query.set('cursor_string',cursor);
 const data=await request('https://osu.ppy.sh/api/v2/beatmapsets/search?'+query,{headers:{Authorization:'Bearer '+token.access_token,Accept:'application/json'}});
 if(!Array.isArray(data.beatmapsets)||data.search?.sort!=='ranked_asc')throw Error('Unexpected beatmap search response');
 expected=data.total;rows.push(...data.beatmapsets);cursor=data.cursor_string;
 if(!cursor){complete=true;break;}if(cursors.has(cursor))throw Error('Repeated search cursor');cursors.add(cursor);
 if((page+1)%20===0)console.log('Scanned '+rows.length+' / approximately '+expected+' mapsets');
}
if(!complete)throw Error('Catalogue scan incomplete; previous snapshot preserved');
const snapshot={...rankMapperSets(rows),updatedAt:new Date().toISOString(),source:'osu!',sourceUrl:'https://osu.ppy.sh/beatmapsets?q=ranked%3E%3D2026-01-01%20ranked%3C2027-01-01&s=ranked',coverage:'Currently ranked mapsets with a 2026 ranked date (UTC). Each unique set counts once for its host in each native gamemode it contains. Guest difficulties are not separate set credits.'};
if(!snapshot.totalSets)throw Error('Empty catalogue; previous snapshot preserved');
await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output+'.tmp',JSON.stringify(snapshot,null,2)+'\n');await fs.rename(output+'.tmp',output);console.log('Updated '+snapshot.totalSets+' sets; '+output);
