import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createReleaseAccess} from '../osu-wrapped/src/release-state.js';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {seal} from '../netlify/functions/wrapped/security.mjs';
test('session status remains independent from owner visibility and displayed demo/profile data',async()=>{
 const access=createReleaseAccess();access.update({authenticated:true,owner:false,releaseAt:'2026-11-29T00:00:00Z',serverNow:Date.parse('2026-12-01T00:00:00Z')});assert.equal(access.state.authenticated,true);assert.equal(access.state.owner,false);
 access.update({authenticated:false,owner:false,releaseAt:'2026-11-29T00:00:00Z',serverNow:Date.parse('2026-12-01T00:00:00Z')});assert.equal(access.state.authenticated,false);
 const source=await readFile(new URL('../osu-wrapped/src/main.js',import.meta.url),'utf8');assert.ok(source.includes('${connected?\'<button class="quiet" id="logout">'));assert.ok(source.includes('connected=releaseAccess.authenticated===true||'));assert.ok(!source.includes('${data&&!data.demo?\'<button class="quiet" id="logout">'));
});
test('release status reports valid sessions on return visits without exposing tokens',async()=>{
 process.env.WRAPPED_SESSION_SECRET='a-long-test-secret-with-at-least-32-characters';
 for(const [cookie,expected] of [['',false],['wrapped_session='+seal({kind:'session',token:'private-test-token',userId:42,exp:Date.now()+60000}),true],['wrapped_session=invalid',false]]){
  const result=await handler({path:'/api/release',httpMethod:'GET',headers:{cookie}},{now:()=>Date.parse('2026-12-01T00:00:00Z')});assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).authenticated,expected);assert.ok(!result.body.includes('private-test-token'));
 }
});
