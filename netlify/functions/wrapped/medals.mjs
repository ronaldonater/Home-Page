import {imageBytes} from './hardening.mjs';
const datasetUrl='https://osekai.net/medals/api/medals.php';
export function selectRarestMedal(achievements,rows,year=2026){
 const earned=(Array.isArray(achievements)?achievements:[]).filter(a=>typeof a.achieved_at==='string'&&new Date(a.achieved_at).getUTCFullYear()===year);
 if(!Array.isArray(achievements))return {rarestMedal:null,rarestMedalStatus:'unavailable'};
 if(!earned.length)return {rarestMedal:null,rarestMedalStatus:'none'};
 const medals=new Map();for(const row of rows){const id=Number(row.MedalID),rarity=typeof row.Rarity==='number'?row.Rarity:typeof row.Rarity==='string'&&row.Rarity.trim()?Number(row.Rarity):NaN;let image;try{const url=new URL(row.Link);if(url.origin==='https://assets.ppy.sh'&&!url.username&&!url.password&&/^\/medals\/web\/[a-zA-Z0-9_-]+(?:@2x)?\.png$/.test(url.pathname))image=url.origin+url.pathname;}catch{}
 if(Number.isSafeInteger(id)&&id>0&&Number.isFinite(rarity)&&rarity>=0&&rarity<=100&&typeof row.Name==='string'&&row.Name.length<=200&&image)medals.set(id,{id,name:row.Name,description:typeof row.Description==='string'?row.Description.slice(0,500):'',image,rarityPercent:rarity,url:'https://osekai.net/medals/?medal='+id});}
 let best=null,matched=0;for(const a of earned){const medal=medals.get(Number(a.achievement_id));if(!medal)continue;matched++;if(!best||medal.rarityPercent<best.rarityPercent||(medal.rarityPercent===best.rarityPercent&&medal.id<best.id))best={...medal,earnedAt:a.achieved_at};}
 return {rarestMedal:best,rarestMedalStatus:best?(matched===earned.length?'available':'partial'):'unavailable'};
}
export function createRarityService({fetchImpl=(...args)=>fetch(...args),now=()=>Date.now()}={}){
 let cache=null,pending=null,retryAfter=0;
 return async function rarity(achievements){
  if(!Array.isArray(achievements)||!achievements.some(a=>new Date(a.achieved_at).getUTCFullYear()===2026))return selectRarestMedal(achievements,[]);
  if(cache&&cache.expires>now())return {...selectRarestMedal(achievements,cache.rows),medalRarityUpdatedAt:cache.updatedAt};
  if(now()<retryAfter)return {rarestMedal:null,rarestMedalStatus:'unavailable'};
  pending??=(async()=>{const response=await fetchImpl(datasetUrl,{redirect:'error',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Medal rarity unavailable');const rows=JSON.parse((await imageBytes(response,2*1024*1024)).toString('utf8'));if(!Array.isArray(rows)||!rows.length)throw Error('Invalid medal data');cache={rows,expires:now()+86400000,updatedAt:new Date(now()).toISOString()};return cache;})();
  try{const data=await pending;return {...selectRarestMedal(achievements,data.rows),medalRarityUpdatedAt:data.updatedAt};}catch{retryAfter=now()+60000;return {rarestMedal:null,rarestMedalStatus:'unavailable'};}finally{pending=null;}
 };
}
export const rarestMedal=createRarityService();
