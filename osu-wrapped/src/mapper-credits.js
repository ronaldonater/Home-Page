// Difficulty credits are authoritative when provided; the set host is the fallback.
export function difficultyMappers(score){
 const owners=Array.isArray(score.beatmap?.owners)?score.beatmap.owners:[];
 const unique=new Map();
 for(const owner of owners)if(Number.isSafeInteger(owner?.id)&&owner.id>0&&typeof owner.username==='string'&&owner.username.trim())unique.set(owner.id,{name:owner.username,userId:owner.id});
 if(unique.size)return [...unique.values()];
 const name=score.beatmapset?.creator,id=score.beatmapset?.user_id;
 const knownId=Number.isSafeInteger(id)&&id>0?id:null;
 return (typeof name==='string'&&name.trim())||knownId!==null?[{name:typeof name==='string'&&name.trim()?name:'Unknown mapper',userId:knownId}]:[];
}
export function rankDifficultyMappers(scores){
 const rows=new Map();
 for(const score of scores)for(const mapper of difficultyMappers(score)){
  const key=mapper.userId===null?'name:'+mapper.name:'id:'+mapper.userId;
  const row=rows.get(key)||{...mapper,count:0};row.count++;rows.set(key,row);
 }
 return [...rows.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)).slice(0,10);
}
