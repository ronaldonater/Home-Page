export function favoriteMod(scores){
 if(!scores.length)return null;const counts=new Map();
 for(const score of scores){const mods=new Set((Array.isArray(score.mods)?score.mods:[]).map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&mod!=='CL'&&/^[A-Z0-9]{1,6}$/.test(mod)));if(!mods.size)mods.add('NM');for(const mod of mods)counts.set(mod,(counts.get(mod)||0)+1);}
 const count=Math.max(...counts.values());return {mods:[...counts].filter(([,n])=>n===count).map(([mod])=>mod).sort(),count,total:scores.length};
}
export const favoriteModLabel=value=>value?.mods?.length?value.mods.map(mod=>mod==='NM'?'No Mod':mod).join(' / '):'Unavailable';
export const favoriteModNote=value=>value?value.count+' of '+value.total+' selected scores'+(value.mods.length>1?' each · tied':''):'No selected scores available';

export const favoriteModPercentage=value=>Number.isFinite(value?.count)&&Number.isFinite(value?.total)&&value.total>0?(value.count/value.total*100).toFixed(2)+'% of selected scores'+(value.mods.length>1?' per tied mod':''):'Percentage unavailable';
