import {osuFetch} from './osu-api.mjs';
import {imageBytes} from './hardening.mjs';
export function createMapperEnricher({fetchImpl=osuFetch,now=Date.now}={}){
 const cache=new Map();
 return async function enrich(scores,token){
  const ids=[...new Set(scores.filter(s=>new Date(s.ended_at||s.created_at).getUTCFullYear()===2026&&!Array.isArray(s.beatmap?.owners)).map(s=>s.beatmap?.id??s.beatmap_id).filter(id=>Number.isSafeInteger(id)&&id>0))];
  const pending=ids.filter(id=>!(cache.get(id)?.until>now()));
  const signal=AbortSignal.timeout(6000);
  for(let i=0;i<pending.length&&!signal.aborted;i+=50){
   const batch=pending.slice(i,i+50),url=new URL('https://osu.ppy.sh/api/v2/beatmaps');for(const id of batch)url.searchParams.append('ids[]',String(id));
   try{
    const response=await fetchImpl(url.href,{headers:{Authorization:'Bearer '+token,Accept:'application/json','x-api-version':'20220705'},signal,redirect:'error'});
    if(!response.ok)break;
    const data=JSON.parse((await imageBytes(response,2*1024*1024)).toString('utf8'));if(!Array.isArray(data.beatmaps))break;
    const found=new Map(data.beatmaps.filter(map=>batch.includes(map.id)).map(map=>[map.id,map]));
    for(const id of batch){const row=found.get(id);if(row&&!Array.isArray(row.owners))continue;cache.set(id,{owners:row?.owners||[],until:now()+21600000});}
    while(cache.size>4096)cache.delete(cache.keys().next().value);
   }catch{break;}
  }
  const remaining=ids.filter(id=>!(cache.get(id)?.until>now()));
  const result=scores.map(score=>{const saved=cache.get(score.beatmap?.id??score.beatmap_id);return !Array.isArray(score.beatmap?.owners)&&saved?.until>now()?{...score,beatmap:{...score.beatmap,owners:saved.owners}}:score;});
  return Object.defineProperties(result,{complete:{value:remaining.length===0},progress:{value:{checked:ids.length-remaining.length,total:ids.length,retryAfterMs:1100}}});
 };
}
export const enrichMapperCredits=createMapperEnricher();
