// pagehide signals actual navigation/closure, not a switch to another tab or demo.
export function installQueueDeparture({target=window,navigatorImpl=navigator,fetchImpl=fetch,current,base='/api'}={}){
 const depart=()=>{
  const task=current();if(!task?.loading||!task.client)return;
  const url=base+'/wrapped/depart?client='+encodeURIComponent(task.client);
  try{if(navigatorImpl.sendBeacon?.(url))return;}catch{}
  try{Promise.resolve(fetchImpl(url,{method:'POST',credentials:'same-origin',keepalive:true})).catch(()=>{});}catch{}
 };
 target.addEventListener('pagehide',depart);
 return ()=>target.removeEventListener('pagehide',depart);
}
