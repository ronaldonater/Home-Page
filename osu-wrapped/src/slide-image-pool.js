// Keep nearby slide images fetched and decoded without loading the whole deck at once.
export function createSlideImagePool(sources,{ImageImpl=Image,timeout=6000,concurrency=3}={}){
 const entries=new Map(),queue=[];let active=0,disposed=false;
 function pump(){while(!disposed&&active<concurrency&&queue.length){const entry=queue.shift();active++;const image=new ImageImpl();entry.image=image;image.decoding='async';image.referrerPolicy='no-referrer';let settled=false;
  const done=()=>{if(settled)return;settled=true;clearTimeout(entry.timer);image.onload=image.onerror=null;entry.stop=null;active--;pump();};entry.stop=done;entry.timer=setTimeout(done,timeout);
  image.onload=()=>{if(image.decode)Promise.resolve().then(()=>image.decode()).catch(()=>{}).then(done);else done();};image.onerror=done;image.src=entry.src;
 }}
 return {prepare(index){if(disposed)return;const nearby=[index,index+1,index+2,index+3,index-1];for(const i of nearby)for(const src of sources[i]||[]){if(!src||entries.has(src))continue;const entry={src};entries.set(src,entry);queue.push(entry);}pump();},dispose(){disposed=true;queue.length=0;for(const entry of entries.values())entry.stop?.();entries.clear();}};
}
