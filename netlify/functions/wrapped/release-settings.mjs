import {releaseOpen} from './release-gate.mjs';
async function neonQuery(url,text,params){const {neon}=await import('@neondatabase/serverless');return neon(url).query(text,params,{fetchOptions:{signal:AbortSignal.timeout(2500)}});}
export function createReleaseSettings({query=neonQuery,clock=Date.now}={}){
 let cached=null;
 return {
  async status(url,time=Date.now()){
   if(releaseOpen(time))return {publicAccess:true,countdownEnabled:false,scheduledRelease:true};
   let open=false;
   if(url){try{
    if(cached?.url===url&&cached.until>clock())open=cached.open;
    else {const rows=await query(url,'SELECT public_access FROM wrapped_release_settings WHERE id=1',[]);open=rows[0]?.public_access===true;cached={url,open,until:clock()+10000};}
   }catch{cached=null;}}
   return {publicAccess:open,countdownEnabled:!open,scheduledRelease:false};
  },
  async set(url,open){
   if(!url)throw Object.assign(Error('Release settings storage is not configured.'),{status:503});
   if(typeof open!=='boolean')throw Object.assign(Error('Invalid release setting.'),{status:400});
   try{await query(url,'UPDATE wrapped_release_settings SET public_access=$1, updated_at=now() WHERE id=1 RETURNING id',[open]).then(rows=>{if(rows.length!==1)throw Error('Missing settings row');});cached=null;}
   catch{throw Object.assign(Error('Unable to save release settings. Run scripts/sql/release-settings.sql in Neon and check the connection.'),{status:503});}
  }
 };
}
export const releaseSettings=createReleaseSettings();
