import {artistCover} from './artist-fallback.js';
const cache=new Map();
const key=(artist,base)=>base+':'+artist.name+':'+artistCover(artist.cover);
export function artistImageSource(artist,base='/api/osu-wrapped'){
 if(Object.hasOwn(artist,'demoImage'))return artistCover(artist.demoImage);
 const cached=cache.get(key(artist,base));
 if(cached?.expires>Date.now()&&cached.source!==undefined)return cached.source;
 return base+'/artist-image?name='+encodeURIComponent(artist.name);
}
function loadImage(src,timeout){return new Promise(resolve=>{
 if(!src||timeout<=0){resolve(false);return;}
 const image=new Image();let settled=false;
 const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(ok);};
 const timer=setTimeout(()=>done(false),timeout);image.referrerPolicy='no-referrer';
 image.onload=()=>{if(image.decode)image.decode().then(()=>done(true),()=>done(true));else done(true);};image.onerror=()=>done(false);image.src=src;
});}
export async function preloadArtistImages(artists=[],{base='/api/osu-wrapped',timeout=4500}={}){
 const deadline=Date.now()+timeout,rows=[...new Map(artists.slice(0,10).filter(a=>typeof a?.name==='string').map(a=>[key(a,base),a])).values()];let cursor=0;
 await Promise.all(Array.from({length:Math.min(4,rows.length)},async()=>{
  while(cursor<rows.length){const artist=rows[cursor++],id=key(artist,base),saved=cache.get(id);
   if(saved?.expires>Date.now()){if(saved.pending)await saved.pending;continue;}
   if(Object.hasOwn(artist,'demoImage')){cache.set(id,{expires:Date.now()+600000,source:artistCover(artist.demoImage)});continue;}
   const entry={expires:Date.now()+600000};cache.set(id,entry);
   entry.pending=(async()=>{
    const primary=base+'/artist-image?name='+encodeURIComponent(artist.name),fallback=artistCover(artist.cover);
    if(await loadImage(primary,Math.min(2500,Math.max(0,deadline-Date.now()-700))))entry.source=primary;
    else if(await loadImage(fallback,Math.max(0,deadline-Date.now())))entry.source=fallback;
    else{entry.source='';entry.expires=Date.now()+30000;}
   })();await entry.pending;delete entry.pending;
  }
 }));
 if(cache.size>100)for(const id of [...cache.keys()].slice(0,cache.size-100))cache.delete(id);
}
