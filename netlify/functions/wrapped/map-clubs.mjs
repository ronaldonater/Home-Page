import {osuFetch} from './osu-api.mjs';
import {imageBytes} from './hardening.mjs';
export function createMapDateEnricher({fetchImpl=osuFetch,now=()=>Date.now()}={}){
 const cache=new Map();
 return async function enrichMapDates(scores,token){
  const eligible=scores.filter(score=>new Date(score.ended_at||score.created_at).getUTCFullYear()===2026);
  const seen=new Set(),selected=eligible.filter(score=>{const id=String(score.id);if(seen.has(id))return false;seen.add(id);return true;}).slice(0,200);
  const idOf=score=>score.beatmapset?.id??score.beatmap?.beatmapset_id;
  const ids=[...new Set(selected.filter(score=>!Object.hasOwn(score.beatmapset||{},'ranked_date')).map(idOf))].filter(id=>Number.isSafeInteger(id)&&id>0);
  if(!ids.length)return scores;
  const signal=AbortSignal.timeout(3000);let cursor=0;
  const work=async()=>{while(cursor<ids.length&&!signal.aborted){const id=ids[cursor++],stored=cache.get(id);if(stored&&stored.expires>now())continue;
   let date=null,ok=false;
   try{const response=await fetchImpl('https://osu.ppy.sh/api/v2/beatmapsets/'+id,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},redirect:'error',signal});
    if([400,404].includes(response.status))ok=true;
    if(response.ok){const row=JSON.parse((await imageBytes(response,512*1024)).toString('utf8'));if(row.id===id){ok=true;date=typeof row.ranked_date==='string'&&Number.isFinite(Date.parse(row.ranked_date))?row.ranked_date:null;}}
   }catch{}
   if(cache.size>=512)cache.delete(cache.keys().next().value);if(!ok&&signal.aborted)continue;cache.set(id,{date,ok,expires:now()+(ok?86400000:60000)});
  }};
  await Promise.all(Array.from({length:Math.min(4,ids.length)},work));
  const enriched=scores.map(score=>{if(Object.hasOwn(score.beatmapset||{},'ranked_date'))return score;const stored=cache.get(idOf(score));return stored&&stored.expires>now()?{...score,beatmapset:{...score.beatmapset,ranked_date:stored.date}}:score;});
  const remaining=ids.filter(id=>cache.get(id)?.ok!==true);
  const retryAfterMs=remaining.some(id=>!cache.get(id)||cache.get(id).expires<=now())?1100:remaining.length?Math.max(1100,Math.min(...remaining.map(id=>cache.get(id).expires-now()))):0;
  return Object.defineProperties(enriched,{complete:{value:!remaining.length},progress:{value:{checked:ids.length-remaining.length,total:ids.length,retryAfterMs}}});
 };
}
export const enrichMapDates=createMapDateEnricher();
