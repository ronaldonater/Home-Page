import {osuFetch} from './osu-api.mjs';
import {imageBytes} from './hardening.mjs';
export function createSkillsetEnricher({fetchImpl=osuFetch,now=()=>Date.now()}={}){
 const cache=new Map(),pending=new Map();
 return async function enrich(scores,mode,token){
  const modes={osu:0,taiko:1,fruits:2,mania:3};
  const setOf=s=>s.beatmapset?.id??s.beatmap?.beatmapset_id;
  const selected=scores.filter(s=>new Date(s.ended_at||s.created_at).getUTCFullYear()===2026).slice(0,200);
  const ids=[...new Set(selected.map(setOf).filter(id=>Number.isSafeInteger(id)&&id>0))];
  const results=new Map(),signal=AbortSignal.timeout(4000);let cursor=0,misses=0,rateLimited=false;
  for(const id of ids){const stored=cache.get(id);if(stored?.until>now())results.set(id,stored.value);}
  await Promise.all(Array.from({length:Math.min(4,ids.length)},async()=>{
   while(cursor<ids.length&&!signal.aborted&&!rateLimited){const id=ids[cursor++],cached=cache.get(id);if(cached?.until>now()){results.set(id,cached.value);continue;}
    if(!pending.has(id)){if(misses++>=24)continue;
     const task=(async()=>{try{
      const response=await fetchImpl('https://osu.ppy.sh/api/v2/beatmapsets/'+id,{headers:{Authorization:'Bearer '+token,Accept:'application/json','x-api-version':'20220705'},signal,redirect:'error'});
      if(response.status===429)rateLimited=true;if(response.status===404)return new Map(selected.filter(score=>setOf(score)===id).map(score=>[(score.beatmap?.id??score.beatmap_id)+':'+mode,[]]));if(!response.ok)return null;
      const data=JSON.parse((await imageBytes(response,1024*1024)).toString('utf8'));
      if(data.id!==id||!Array.isArray(data.related_tags)||!Array.isArray(data.beatmaps))return null;
      const catalogue=new Map(data.related_tags.filter(tag=>Number.isSafeInteger(tag.id)&&typeof tag.name==='string').map(tag=>[tag.id,tag]));
      const maps=new Map();for(const map of [...data.beatmaps,...(Array.isArray(data.converts)?data.converts:[])]){
       if(!Number.isSafeInteger(map.id)||!Array.isArray(map.top_tag_ids))continue;
       const tags=map.top_tag_ids.filter(row=>Number.isSafeInteger(row.tag_id)&&Number.isFinite(row.count)&&row.count>0).map(row=>catalogue.get(row.tag_id));
       if(tags.some(tag=>!tag))continue;
       for(const [modeName,ruleId] of Object.entries(modes)){
        // Native tags are never reinterpreted as skillsets for converted modes.
        if(map.mode!==modeName)continue;
        maps.set(map.id+':'+modeName,tags.filter(tag=>(tag.ruleset_id===null||tag.ruleset_id===ruleId)&&/^skillset\/[a-z][a-z0-9_-]{0,50}$/.test(tag.name)).map(tag=>tag.name));
       }
      }return maps;
     }catch{return null;}})().then(value=>{if(!value&&signal.aborted)return value;cache.set(id,{value,until:now()+(value?21600000:60000)});if(cache.size>512)cache.delete(cache.keys().next().value);return value;}).finally(()=>pending.delete(id));pending.set(id,task);
    }
    results.set(id,await pending.get(id));
   }
  }));
  return scores.map(score=>{const mapId=score.beatmap?.id??score.beatmap_id,names=results.get(setOf(score))?.get(mapId+':'+mode);return {...score,wrappedSkillsets:names?{status:'ready',mode,names}:{status:'unavailable',mode,names:[]}};});
 };
}
export const enrichSkillsetTags=createSkillsetEnricher();
