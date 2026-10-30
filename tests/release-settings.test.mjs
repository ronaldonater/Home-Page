import test from 'node:test';
import assert from 'node:assert/strict';
import {createReleaseSettings} from '../netlify/functions/wrapped/release-settings.mjs';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {releaseSettings} from '../netlify/functions/wrapped/release-settings.mjs';
import {seal} from '../netlify/functions/wrapped/security.mjs';
const before=Date.parse('2026-11-01T00:00:00Z');
test('release override persists, restores, expires cache, and fails closed before scheduled release',async()=>{
 let stored=false,clock=0,reads=0,down=false;
 const settings=createReleaseSettings({clock:()=>clock,query:async(url,text,params)=>{
  if(down)throw Error('offline');
  if(text.startsWith('UPDATE')){stored=params[0];return [{id:1}];}
  reads++;return [{public_access:stored}];
 }});
 assert.equal((await settings.status('db',before)).publicAccess,false);
 await settings.set('db',true);assert.equal((await settings.status('db',before)).publicAccess,true);
 await settings.set('db',false);assert.equal((await settings.status('db',before)).countdownEnabled,true);
 const last=reads;await settings.status('db',before);assert.equal(reads,last);
 clock=11000;down=true;assert.equal((await settings.status('db',before)).publicAccess,false);
 await assert.rejects(settings.set('db',true),/Unable to save/);
 assert.equal((await settings.status('db',Date.parse('2026-11-29T00:00:00Z'))).publicAccess,true);
 assert.equal((await settings.status(null,before)).publicAccess,false);
});
test('countdown mutations require the permanent owner, correct origin, and valid action; gate follows override',async()=>{
 process.env.WRAPPED_SESSION_SECRET='release-settings-tests-secret-at-least-32-characters';
 delete process.env.WRAPPED_REDIRECT_URI;
 process.env.WRAPPED_OSU_REDIRECT_URI='https://example.com/api/auth/callback';
 const originalStatus=releaseSettings.status,originalSet=releaseSettings.set;let open=false,writes=0;
 releaseSettings.status=async()=>({publicAccess:open,countdownEnabled:!open,scheduledRelease:false});
 releaseSettings.set=async(url,value)=>{writes++;open=value;};
 const request=(path,method='GET',id=null,action,origin='https://example.com')=>handler({path,httpMethod:method,headers:{origin,...(id?{cookie:'wrapped_session='+seal({kind:'session',token:'owner-token',userId:id,exp:Date.now()+60000})}:{})},queryStringParameters:{action}},{now:()=>before});
 try{
  assert.equal((await request('/api/admin/release','POST',null,'open')).statusCode,401);
  assert.equal((await request('/api/admin/release','POST',99,'open')).statusCode,403);
  assert.equal((await request('/api/admin/release','POST',7933825,'open','https://evil.test')).statusCode,403);
  assert.equal((await request('/api/admin/release','POST',7933825,'bad')).statusCode,400);assert.equal(writes,0);
  const redirect=process.env.WRAPPED_OSU_REDIRECT_URI;delete process.env.WRAPPED_OSU_REDIRECT_URI;
  try{const failure=await request('/api/admin/release','POST',7933825,'open');assert.equal(failure.statusCode,503);assert.match(JSON.parse(failure.body).error,/Countdown controls/);}finally{process.env.WRAPPED_OSU_REDIRECT_URI=redirect;}
  assert.equal((await request('/api/wrapped')).statusCode,423);
  assert.equal((await request('/api/admin/release','POST',7933825,'open')).statusCode,200);
  assert.equal(JSON.parse((await request('/api/release')).body).allowed,true);
  assert.equal((await request('/api/wrapped')).statusCode,401);
  assert.equal((await request('/api/admin/release','POST',7933825,'restore')).statusCode,200);
  assert.equal(JSON.parse((await request('/api/release')).body).allowed,false);
  assert.equal((await request('/api/wrapped')).statusCode,423);assert.equal(writes,2);
  releaseSettings.set=async()=>{throw Error('unexpected storage failure');};
  const failure=await request('/api/admin/release','POST',7933825,'open');assert.equal(failure.statusCode,503);assert.match(JSON.parse(failure.body).error,/countdown settings/);assert.ok(!failure.body.includes('generate your Wrapped'));
 }finally{releaseSettings.status=originalStatus;releaseSettings.set=originalSet;}
});
