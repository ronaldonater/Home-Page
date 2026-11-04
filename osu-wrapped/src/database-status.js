// Report explicit backend database failures once per page load.
export function createDatabaseReporter({warn=(...args)=>console.warn(...args)}={}){
 let reported=false;
 return (response,body)=>{
  if(reported)return;
  const features=[];
  if(response.headers?.get('x-wrapped-database-status')==='unavailable')features.push('profile queue / completed-results cache');
  if(body?.clubCommunity?.status==='unavailable')features.push('playstyle club community percentages');
  if(body?.mapping?.community?.status==='unavailable')features.push('mapping club community percentages');
  if(!features.length)return;reported=true;
  warn('[osu! Wrapped] Neon/database feature unavailable: '+features.join(', ')+'. Wrapped can continue using its fallback; community percentages may be unavailable. This can indicate a connection, configuration, or SQL setup problem. Check Netlify function logs for details. This warning is shown once per page load.');
 };
}
export const reportDatabaseStatus=createDatabaseReporter();
