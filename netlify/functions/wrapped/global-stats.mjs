import mapperSnapshot from './data/ranked-mappers.json' with {type:'json'};
import {imageBytes} from './hardening.mjs';
const modes={osu:0,taiko:1,fruits:2,mania:3};
function decodeAttribute(value){return value.replace(/&quot;|&#0*39;|&#x0*27;|&lt;|&gt;|&amp;/gi,entity=>({'&quot;':'"','&lt;':'<','&gt;':'>','&amp;':'&'}[entity.toLowerCase()]||"'"));}
export function parseOfficialScores(html){
 for(const match of html.matchAll(/data-props="([^"]*)"/g)){
  let data;try{data=JSON.parse(decodeAttribute(match[1]));}catch{continue;}
  if(Array.isArray(data.scores))return data.scores;
 }
 throw Error('Official rankings data unavailable');
}
export function normalizeGlobalScores(rows,mode='osu'){
 if(!Array.isArray(rows))throw Error('Invalid global scores');const seen=new Set();
 return rows.filter(row=>[row.id,row.user_id,row.beatmap_id].every(id=>Number.isSafeInteger(id)&&id>0)&&Number.isFinite(row.pp)&&row.pp>0&&new Date(row.ended_at).getUTCFullYear()===2026&&row.ruleset_id===modes[mode])
 .sort((a,b)=>b.pp-a.pp).filter(row=>{const key=row.user_id+':'+row.beatmap_id;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,25)
 .map(row=>{let cover=null;try{const url=new URL(row.beatmapset?.covers?.cover);if(url.origin==='https://assets.ppy.sh'&&/^\/beatmaps\/\d+\/covers\/cover(?:@2x)?\.(?:jpg|png|jpeg)$/.test(url.pathname))cover=url.href;}catch{}
 const names=(row.mods||[]).map(mod=>mod.acronym).filter(name=>typeof name==='string'&&name!=='CL');
 return {scoreId:row.id,bpm:Number.isFinite(row.beatmap?.bpm)?row.beatmap.bpm:Number.isFinite(row.beatmapset?.bpm)?row.beatmapset.bpm:null,replayAvailable:row.has_replay!==false,previewUrl:typeof row.beatmapset?.preview_url==='string'?row.beatmapset.preview_url:null,userId:row.user_id,username:row.user?.username||'Player #'+row.user_id,beatmapId:row.beatmap_id,title:row.beatmapset?.title||'Beatmap #'+row.beatmap_id,artist:row.beatmapset?.artist||'',version:row.beatmap?.version||'',creator:row.beatmapset?.creator||'',cover,pp:row.pp,accuracy:Number.isFinite(row.accuracy)&&row.accuracy>=0&&row.accuracy<=1?row.accuracy*100:null,mods:names.filter(name=>!(name==='DT'&&names.includes('NC'))&&!(name==='SD'&&names.includes('PF'))).join(', ')||'NM',rank:typeof row.rank==='string'?row.rank:'',date:new Date(row.ended_at).toISOString()};});
}
export function createGlobalService({fetchImpl=(...args)=>fetch(...args),now=()=>Date.now()}={}){
 const cache=new Map(),pending=new Map(),popularCache=new Map(),popularPending=new Map();let appToken=null;
 async function fetchPopular(mode,credentials){
  try{
   if(!credentials.clientId||!credentials.clientSecret)return null;
   if(!appToken||appToken.expires<=now()){
    const response=await fetchImpl('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:credentials.clientId,client_secret:credentials.clientSecret,grant_type:'client_credentials',scope:'public'}),signal:AbortSignal.timeout(5000)});
    if(!response.ok)return null;const token=await response.json();if(typeof token.access_token!=='string'||!Number.isFinite(token.expires_in))return null;appToken={value:token.access_token,expires:now()+Math.max(0,token.expires_in-60)*1000};
   }
   const query=new URLSearchParams({q:'ranked>=2026-01-01 ranked<2027-01-01',s:'ranked',m:String(modes[mode]),sort:'plays_desc'});
   const response=await fetchImpl('https://osu.ppy.sh/api/v2/beatmapsets/search?'+query,{headers:{Authorization:'Bearer '+appToken.value,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(7000)});
   if(!response.ok)return null;const result=JSON.parse((await imageBytes(response,3*1024*1024)).toString('utf8'));
   if(result.search?.sort!=='plays_desc')return null;
   return normalizePopularBeatmapsets(result.beatmapsets,mode);
  }catch{return null;}
 }

 async function popular(mode,credentials={}){
  if(!Object.hasOwn(modes,mode))return null;
  const stored=popularCache.get(mode);if(stored&&stored.expires>now())return stored.rows;
  if(popularPending.has(mode))return popularPending.get(mode);
  const task=fetchPopular(mode,credentials).then(rows=>{if(Array.isArray(rows))popularCache.set(mode,{rows,expires:now()+900000});return rows;}).finally(()=>popularPending.delete(mode));popularPending.set(mode,task);return task;
 }
 const load=async function globalStats(mode,credentials={}){
  if(!Object.hasOwn(modes,mode))return {statusCode:400,body:{error:'Invalid game mode'}};
  const stored=cache.get(mode);if(stored&&stored.expires>now())return {statusCode:200,body:stored.data};if(pending.has(mode))return pending.get(mode);
  const task=(async()=>{try{
   let rows=[],top=[];
   for(let page=1;page<=10;page++){
    const url='https://osu.ppy.sh/rankings/top-plays/'+mode+'?page='+page;
    const response=await fetchImpl(url,{redirect:'error',headers:{Accept:'text/html'},signal:AbortSignal.timeout(7000)});
    if(!response.ok)throw Error('Official leaderboard unavailable');
    const scores=parseOfficialScores((await imageBytes(response,3*1024*1024)).toString('utf8'));rows.push(...scores);top=normalizeGlobalScores(rows,mode);
    if(top.length>=25||scores.length<100)break;
   }
   const popularBeatmapsets=await popular(mode,credentials);
   const data={year:2026,mode,top,popularBeatmapsets,rankedGenres:Array.isArray(mapperSnapshot.modes[mode]?.genres)?{rows:mapperSnapshot.modes[mode].genres,totalSets:mapperSnapshot.modes[mode].totalSets,updatedAt:mapperSnapshot.updatedAt}:null,rankedMappers:{...mapperSnapshot.modes[mode],updatedAt:mapperSnapshot.updatedAt,coverage:mapperSnapshot.coverage},source:'osu!',sourceUrl:'https://osu.ppy.sh/rankings/top-plays/'+mode,updatedAt:new Date(now()).toISOString(),coverage:'2026 plays within osu!’s current top 1,000 PP rankings, not a complete annual archive. Only each player’s highest-PP play per difficulty is shown, regardless of mod combination.'};
   cache.set(mode,{data,expires:now()+15*60000});return {statusCode:200,body:data};
  }catch{if(stored)return {statusCode:200,body:{...stored.data,stale:true}};return {statusCode:503,body:{error:'Global plays are temporarily unavailable. Your personal Wrapped is still available.'}};}finally{pending.delete(mode);}})();pending.set(mode,task);return task;
 };
 load.popularBeatmapsets=popular;
 return load;
}
export const globalStats=createGlobalService();

export function normalizePopularBeatmapsets(rows,mode='osu'){
 if(!Array.isArray(rows))throw Error('Invalid beatmap search');
 return [...new Map(rows.filter(row=>Number.isSafeInteger(row.id)&&row.id>0&&row.status==='ranked'&&new Date(row.ranked_date).getUTCFullYear()===2026&&Number.isSafeInteger(row.play_count)&&row.play_count>=0).map(row=>[row.id,row])).values()].sort((a,b)=>b.play_count-a.play_count).slice(0,25).map(row=>({id:row.id,genreId:Number.isSafeInteger(row.genre_id)&&row.genre_id>0?row.genre_id:null,beatmapId:(row.beatmaps||[]).filter(map=>map.mode===mode&&map.convert!==true&&Number.isSafeInteger(map.id)&&map.id>0).sort((a,b)=>(b.playcount||0)-(a.playcount||0)||a.id-b.id)[0]?.id??null,previewUrl:typeof row.preview_url==='string'?row.preview_url:null,title:row.title||'Unknown beatmap',artist:row.artist||'Unknown artist',creator:row.creator||'Unknown mapper',creatorId:Number.isSafeInteger(row.user_id)&&row.user_id>0?row.user_id:null,plays:row.play_count,rankedDate:row.ranked_date,cover:row.covers?.cover||null}));
}
