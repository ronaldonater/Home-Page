import {ADMIN_USER_ID} from './release-gate.mjs';
async function neonQuery(url,text,params){const {neon}=await import('@neondatabase/serverless');return neon(url).query(text,params,{fetchOptions:{signal:AbortSignal.timeout(2500)}});}
export function createAdminAllowlist({query=neonQuery}={}){
 function configured(url){if(!url){const error=Error('Admin storage is not configured. Configure the existing database connection and run scripts/sql/admin-allowlist.sql.');error.status=503;throw error;}}
 const valid=id=>Number.isSafeInteger(id)&&id>0;
 return {
  async has(id,url){if(id===ADMIN_USER_ID)return true;if(!valid(id)||!url)return false;try{return (await query(url,'SELECT user_id FROM wrapped_release_admins WHERE user_id=$1',[id])).length===1;}catch{return false;}},
  async list(url){configured(url);try{return await query(url,'SELECT user_id, username, added_at FROM wrapped_release_admins ORDER BY added_at, user_id',[]);}catch{const error=Error('Admin storage is unavailable. Run scripts/sql/admin-allowlist.sql in Neon and check the database connection.');error.status=503;throw error;}},
  async add(user,url){configured(url);if(!valid(user?.id)||user.id===ADMIN_USER_ID||typeof user.username!=='string'||!user.username.trim()||user.username.length>64)throw Object.assign(Error('Invalid account or permanent owner account.'),{status:400});await query(url,'INSERT INTO wrapped_release_admins (user_id,username,added_by) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO UPDATE SET username=EXCLUDED.username',[user.id,user.username,ADMIN_USER_ID]);},
  async remove(id,url){configured(url);if(!valid(id)||id===ADMIN_USER_ID)throw Object.assign(Error('The owner account cannot be removed.'),{status:400});await query(url,'DELETE FROM wrapped_release_admins WHERE user_id=$1',[id]);}
 };
}
export const adminAllowlist=createAdminAllowlist();
