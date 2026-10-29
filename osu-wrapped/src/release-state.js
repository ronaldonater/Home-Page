export function createReleaseAccess({now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout,onRelease=()=>{}}={}){
 const state={owner:false};let deadline=0,timer;
 function expire(){state.owner=false;onRelease();}
 function check(){const remaining=deadline-now();if(remaining<=0){expire();return;}timer=schedule(check,Math.min(remaining,60000));}
 return {state,update(status){if(timer!==undefined)cancel(timer);const remaining=Date.parse(status.releaseAt)-status.serverNow;state.owner=status.owner===true&&Number.isFinite(remaining)&&remaining>0;if(!state.owner){if(remaining<=0)expire();return;}deadline=now()+remaining;check();}};
}
const access=createReleaseAccess({onRelease:()=>{
 document.querySelectorAll('[data-admin]').forEach(button=>button.remove());
 document.querySelector('.admin-dialog')?.close();
}});
export const releaseAccess=access.state;
export const updateReleaseAccess=status=>access.update(status);
