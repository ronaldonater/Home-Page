import {modIconUrl} from './mod-icons.js';
const loaded=new Map();
export function preloadModIcons(data,{timeout=2500}={}){
 const mods=new Set(data?.favoriteMod?.mods||[]);
 for(const row of data?.modUsage||[])mods.add(row.mod);
 for(const score of data?.top||[]){
  const entries=Array.isArray(score.mods)?score.mods:String(score.mods||'').split(/[,\s]+/);
  for(const mod of entries)mods.add(typeof mod==='string'?mod:mod?.acronym);
  if(!entries.length||entries.every(mod=>mod==='CL'||!mod))mods.add('NM');
 }
 return Promise.all([...mods].map(modIconUrl).filter(Boolean).map(url=>{
  if(loaded.has(url))return loaded.get(url);
  const pending=new Promise(resolve=>{
   const image=new Image();let settled=false;
   const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=image.onerror=null;if(!ok)loaded.delete(url);resolve();};
   const timer=setTimeout(()=>done(false),timeout);
   image.onload=()=>{if(image.decode)image.decode().then(()=>done(true),()=>done(true));else done(true);};image.onerror=()=>done(false);image.src=url;
  });loaded.set(url,pending);return pending;
 }));
}
