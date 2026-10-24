export function modRankings(scores){
 const counts=new Map();for(const score of scores){const mods=new Set((Array.isArray(score.mods)?score.mods:[]).map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&mod!=='CL'&&/^[A-Z0-9]{1,6}$/.test(mod)));if(!mods.size)mods.add('NM');for(const mod of mods)counts.set(mod,(counts.get(mod)||0)+1);}
 let rank=0,last=null;return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([mod,count],index)=>{if(count!==last)rank=index+1;last=count;return {mod,count,total:scores.length,percentage:count/scores.length*100,rank};});
}
export function favoriteMod(scores){const ranking=modRankings(scores);if(!ranking.length)return null;const count=ranking[0].count;return {mods:ranking.filter(row=>row.count===count).map(row=>row.mod).sort(),count,total:scores.length};}
export const favoriteModLabel=value=>value?.mods?.length?value.mods.map(mod=>mod==='NM'?'No Mod':mod).join(' / '):'Unavailable';
export const favoriteModNote=value=>value?value.count+' of '+value.total+' selected scores'+(value.mods.length>1?' each · tied':''):'No selected scores available';

export const favoriteModPercentage=value=>Number.isFinite(value?.count)&&Number.isFinite(value?.total)&&value.total>0?(value.count/value.total*100).toFixed(2)+'% of selected scores'+(value.mods.length>1?' per tied mod':''):'Percentage unavailable';
