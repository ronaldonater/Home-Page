// Uploaded mapsets are dated by submitted_date; local creation history is not public.
export function mappingCounts(rows,userId){
 const sets=new Map();
 for(const row of rows)if(Number.isSafeInteger(row.id)&&row.id>0&&row.user_id===userId&&typeof row.submitted_date==='string'&&new Date(row.submitted_date).getUTCFullYear()===2026)sets.set(row.id,row);
 const popular=[...sets.values()].sort((a,b)=>(Number.isFinite(b.play_count)?b.play_count:0)-(Number.isFinite(a.play_count)?a.play_count:0)||a.id-b.id)[0];
 const mostPopular=popular?{id:popular.id,title:popular.title||'Untitled mapset',artist:popular.artist||'Unknown artist',status:popular.status,cover:popular.covers?.['cover@2x']||popular.covers?.cover||null,plays:Number.isFinite(popular.play_count)?popular.play_count:0,previewUrl:'https://b.ppy.sh/preview/'+popular.id+'.mp3'}:null;
 const playCounts=[...sets.values()].map(row=>row.play_count);
 const totalPlays=playCounts.every(value=>Number.isSafeInteger(value)&&value>=0)?playCounts.reduce((sum,value)=>sum+value,0):null;
 const genreCount=new Set([...sets.values()].map(row=>Number(row.genre?.id??row.genre_id)).filter(id=>[2,3,4,5,6,7,9,10,11,12,13,14].includes(id))).size;
 return {status:'ready',genreCount,created:sets.size,totalPlays,ranked:[...sets.values()].filter(row=>row.status==='ranked').length,mostPopular};
}
export function createMappingStats({fetchImpl=fetch,now=Date.now}={}){
 const cache=new Map();
 return async function mappingStats(userId,token){
  if(!Number.isSafeInteger(userId)||userId<=0)return {status:'unavailable'};
  const saved=cache.get(userId);if(saved&&saved.until>now())return saved.value;
  try{
   const signal=AbortSignal.timeout(8000);
   const groups=await Promise.all(['ranked','loved','pending','graveyard'].map(async type=>{
    const rows=[],pages=new Set();
    for(let page=0;page<40;page++){
     const response=await fetchImpl('https://osu.ppy.sh/api/v2/users/'+userId+'/beatmapsets/'+type+'?limit=100&offset='+page*100,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal,redirect:'error'});
     if(!response.ok)throw Error('Mapping catalogue unavailable');
     const chunk=await response.json();if(!Array.isArray(chunk))throw Error('Invalid mapping catalogue');
     const signature=chunk.map(row=>row.id).join(',');if(chunk.length&&pages.has(signature))throw Error('Repeated mapping page');pages.add(signature);
     rows.push(...chunk);if(chunk.length<100)return rows;
    }
    throw Error('Incomplete mapping catalogue');
   }));
   const value={...mappingCounts(groups.flat(),userId),updatedAt:new Date(now()).toISOString()};
   cache.set(userId,{until:now()+15*60*1000,value});if(cache.size>128)cache.delete(cache.keys().next().value);
   return value;
  }catch{return {status:'unavailable'};}
 };
}
export const mappingStats=createMappingStats();
