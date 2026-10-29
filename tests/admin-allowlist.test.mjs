import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdminAllowlist,adminAllowlist} from '../netlify/functions/wrapped/admin-allowlist.mjs';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {ADMIN_USER_ID} from '../netlify/functions/wrapped/release-gate.mjs';
import {seal} from '../netlify/functions/wrapped/security.mjs';
function store(){const users=new Map();let calls=0;const service=createAdminAllowlist({query:async(url,sql,params)=>{calls++;assert.equal(url,'test-db');if(sql.startsWith('INSERT'))users.set(params[0],{user_id:params[0],username:params[1],added_at:'2026-10-28'});else if(sql.startsWith('DELETE'))users.delete(params[0]);else if(sql.includes('WHERE user_id'))return users.has(params[0])?[users.get(params[0])]:[];else return [...users.values()];return [];}});return {service,users,calls:()=>calls};}
test('persistent allowlist applies changes immediately and owner access is permanent',async()=>{
 const db=store();assert.equal(await db.service.has(ADMIN_USER_ID),true);assert.equal(db.calls(),0);
 assert.equal(await db.service.has(123,'test-db'),false);await db.service.add({id:123,username:'Tester'},'test-db');assert.equal(await db.service.has(123,'test-db'),true);
 await db.service.add({id:123,username:'Renamed'},'test-db');assert.equal((await db.service.list('test-db')).length,1);assert.equal((await db.service.list('test-db'))[0].username,'Renamed');
 await db.service.remove(123,'test-db');assert.equal(await db.service.has(123,'test-db'),false);
 await assert.rejects(db.service.remove(ADMIN_USER_ID,'test-db'),{status:400});await assert.rejects(db.service.add({id:ADMIN_USER_ID,username:'owner'},'test-db'),{status:400});
 assert.equal(await db.service.has(123),false);await assert.rejects(db.service.list(),{status:503});
 const failed=createAdminAllowlist({query:async()=>{throw Error('database down');}});assert.equal(await failed.has(123,'test-db'),false);assert.equal(await failed.has(ADMIN_USER_ID,'test-db'),true);
});
test('only owner can list or change admins; origin and session checks protect mutations',async()=>{
 process.env.WRAPPED_SESSION_SECRET='admin-panel-tests-at-least-32-characters';process.env.WRAPPED_OSU_REDIRECT_URI='https://example.com/api/osu-wrapped/auth/callback';process.env.WRAPPED_DATABASE_URL='test-db';
 const db=store(),original={...adminAllowlist},realFetch=globalThis.fetch;Object.assign(adminAllowlist,db.service);
 const event=(path,extra={})=>({path,httpMethod:'GET',headers:{},...extra});const headers=id=>({cookie:'wrapped_session='+seal({kind:'session',token:'secret-token',userId:id,exp:Date.now()+60000})});
 const run=(path,extra={},released=false)=>handler(event('/api/osu-wrapped'+path,extra),{now:()=>Date.parse(released?'2026-12-01T00:00:00Z':'2026-10-28T00:00:00Z')});
 globalThis.fetch=async url=>{assert.ok(String(url).includes('/users/'));return {ok:true,json:async()=>({id:123,username:'Tester'})};};
 try{
  assert.equal((await run('/admin/users')).statusCode,401);
  for(const released of [false,true])assert.equal((await run('/admin/users',{headers:headers(123)},released)).statusCode,403);
  const owner=headers(ADMIN_USER_ID);const list=await run('/admin/users',{headers:owner});assert.equal(list.statusCode,200);assert.equal(JSON.parse(list.body).users[0].owner,true);
  assert.equal((await run('/admin/users',{httpMethod:'POST',headers:{...owner,origin:'https://evil.example'},queryStringParameters:{action:'add',user:'Tester'}})).statusCode,403);assert.equal(db.users.size,0);
  const request={httpMethod:'POST',headers:{...owner,origin:'https://example.com'},queryStringParameters:{action:'add',user:'Tester'}};
  const added=await run('/admin/users',request);assert.equal(added.statusCode,200);assert.equal(JSON.parse(added.body).users[1].id,123);assert.equal(added.headers['Cache-Control'],'no-store');
  const status=JSON.parse((await run('/release',{headers:headers(123)})).body);assert.equal(status.allowed,true);assert.equal(status.owner,false);
  assert.equal((await run('/admin/users',{headers:headers(123)})).statusCode,403);
  const remove=await run('/admin/users',{...request,queryStringParameters:{action:'remove',user:'123'}});assert.equal(remove.statusCode,200);assert.equal(db.users.size,0);
  assert.equal(JSON.parse((await run('/release',{headers:headers(123)})).body).allowed,false);
  assert.equal((await run('/admin/users',{...request,queryStringParameters:{action:'remove',user:String(ADMIN_USER_ID)}})).statusCode,400);
  assert.equal(JSON.parse((await run('/release',{headers:owner},true)).body).owner,true);
 }finally{Object.assign(adminAllowlist,original);globalThis.fetch=realFetch;}
});
