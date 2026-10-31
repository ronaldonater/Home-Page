export async function requestSignOut({base='/api',queued=false,client=null,beforeRequest=()=>{},confirmImpl=message=>window.confirm(message),fetchImpl=fetch}={}){
 if(queued&&!confirmImpl('Your Wrapped is currently in the queue. Signing out will remove you from the queue. You will have to join again when you return. Are you sure you want to sign out?'))return false;
 beforeRequest();
 const response=await fetchImpl(base+'/auth/logout'+(client?'?client='+encodeURIComponent(client):''),{method:'POST',credentials:'same-origin'});
 if(!response.ok)throw Error('Could not sign out. Try again.');return true;
}
