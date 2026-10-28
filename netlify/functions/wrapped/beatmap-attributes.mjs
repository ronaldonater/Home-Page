export function createBeatmapAttributeEnricher({fetchImpl=fetch,now=Date.now}={}){
 const cache=new Map(),pending=new Map();
 return async function enrich(scores,mode,token){
  const unique=new Map();for(const score of scores){if(new Date(score.ended_at||score.created_at).getUTCFullYear()!==2026)continue;unique.set(String(score.id),score);}
  const rows=[...unique.values()].slice(0,200),requests=new Map();
  for(const score of rows){const id=score.beatmap?.id;if(!Number.isSafeInteger(id)||id<=0)continue;const mods=(score.mods||[]).map(m=>typeof m==='string'?{acronym:m}:m).filter(m=>m&&m.acronym!=='CL'&&m.acronym!=='NM').sort((a,b)=>a.acronym.localeCompare(b.acronym));if(!mods.length&&(!score.beatmap?.mode||score.beatmap.mode===mode))continue;const key=JSON.stringify([id,mode,mods]);requests.set(key,{id,mods});}
  const results=new Map(),signal=AbortSignal.timeout(3500);let cursor=0,misses=0,rateLimited=false;const entries=[...requests];
  await Promise.all(Array.from({length:Math.min(4,entries.length)},async()=>{while(cursor<entries.length&&!signal.aborted&&!rateLimited){const [key,{id,mods}]=entries[cursor++],stored=cache.get(key);if(stored?.until>now()){results.set(key,stored.value);continue;}
   if(!pending.has(key)){if(misses++>=24)continue;const task=(async()=>{try{const response=await fetchImpl('https://osu.ppy.sh/api/v2/beatmaps/'+id+'/attributes',{method:'POST',headers:{Authorization:'Bearer '+token,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({mods,ruleset:mode}),signal,redirect:'error'});if(response.status===429)rateLimited=true;if(!response.ok)return null;const value=(await response.json())?.attributes;if(!value||!Number.isFinite(value.star_rating)||value.star_rating<0)return null;return value;}catch{return null;}})().then(value=>{cache.set(key,{value,until:now()+(value?86400000:60000)});if(cache.size>1000)cache.delete(cache.keys().next().value);return value;}).finally(()=>pending.delete(key));pending.set(key,task);}
   results.set(key,await pending.get(key));
  }}));
  return scores.map(score=>{const id=score.beatmap?.id,mods=(score.mods||[]).map(m=>typeof m==='string'?{acronym:m}:m).filter(m=>m&&m.acronym!=='CL'&&m.acronym!=='NM').sort((a,b)=>a.acronym.localeCompare(b.acronym));const value=results.get(JSON.stringify([id,mode,mods]));return value?{...score,wrappedAttributes:value}:score;});
 };
}
export const enrichBeatmapAttributes=createBeatmapAttributeEnricher();
