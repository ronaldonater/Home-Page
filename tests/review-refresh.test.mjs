import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewQueue,reviewQueue} from '../netlify/functions/wrapped/review-queue.mjs';
import {createReviewCore} from '../netlify/functions/wrapped/review-core.mjs';
import {createSharedOsuFetch} from '../netlify/functions/wrapped/shared-osu-cache.mjs';
import {seal,unseal} from '../netlify/functions/wrapped/security.mjs';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
const config=()=>({databaseUrl:'db',clientId:'client',secret:'a-long-test-secret-with-at-least-32-characters'});
test('refresh resets only the completed user/mode job and puts it at the back without resume priority',async()=>{
 const calls=[];const queue=createReviewQueue({config,query:async(url,sql,params)=>{calls.push({sql,params});return [{job_key:'reset'}];}});
 assert.equal((await queue.refresh(42,'osu')).status,'queued');await queue.refresh(42,'mania');
 assert.notEqual(calls[0].params[1],calls[1].params[1]);assert.match(calls[0].sql,/state='complete'/);assert.match(calls[0].sql,/queued_at=clock_timestamp\(\)/);assert.match(calls[0].sql,/resume_until=NULL/);assert.match(calls[0].sql,/result=NULL/);
 await assert.rejects(queue.refresh(42,'invalid'),{status:400});assert.equal(calls.length,2);
});
test('refresh never resets active jobs, fails safely during storage outages, and supports local setups',async()=>{
 const queue=createReviewQueue({config,query:async(url,sql)=>sql.startsWith('UPDATE')?[]:[{state:'active'}]});await assert.rejects(queue.refresh(42,'osu'),{status:409});
 await assert.rejects(createReviewQueue({config,query:async()=>{throw Error('offline');}}).refresh(42,'osu'),{status:503});
 assert.equal((await createReviewQueue({config:()=>({})}).refresh(42,'osu')).status,'disabled');
});
test('refresh core key retrieves new profile/scores once then reuses them across stages',async()=>{
 const core=createReviewCore();let calls=0;const osu=async path=>{calls++;return path.startsWith('/me')?{id:42,username:'Player',playmode:'osu'}:[];};
 await core('token','osu',osu);assert.equal(calls,3);await core('token','osu',osu);assert.equal(calls,3);
 await core('token','osu',osu,'refresh1');assert.equal(calls,6);await core('token','osu',osu,'refresh1');assert.equal(calls,6);
});
test('reload bypasses shared cached profile reads while preserving API scheduling and updating cache',async()=>{
 let upstream=0,reads=0,writes=0;
 const shared=createSharedOsuFetch(async()=>{upstream++;return Response.json({fresh:true});},{config,query:async(url,sql)=>{if(sql.startsWith('SELECT')){reads++;return [];}writes++;return [];}});
 const response=await shared('https://osu.ppy.sh/api/v2/users/42/scores/best?mode=osu',{cache:'reload',headers:{Authorization:'Bearer private'}});assert.deepEqual(await response.json(),{fresh:true});assert.equal(upstream,1);assert.equal(reads,0);assert.equal(writes,1);
});
test('refresh endpoint validates session, origin and mode and issues an account-bound token',async()=>{
 process.env.WRAPPED_SESSION_SECRET='a-long-test-secret-with-at-least-32-characters';process.env.WRAPPED_OSU_REDIRECT_URI='https://example.com/api/auth/callback';
 const original=reviewQueue.refresh;let called;
 reviewQueue.refresh=async(id,mode)=>{called={id,mode};return {status:'queued'};};
 const event=(extra={})=>({path:'/api/wrapped/refresh',httpMethod:'POST',headers:{origin:'https://example.com',cookie:'wrapped_session='+seal({kind:'session',token:'private',userId:42,exp:Date.now()+60000})},queryStringParameters:{mode:'osu'},...extra});
 const run=e=>handler(e,{now:()=>Date.parse('2026-12-01T00:00:00Z')});
 try{
  assert.equal((await run(event({httpMethod:'GET'}))).statusCode,405);
  assert.equal((await run(event({headers:{}}))).statusCode,401);
  const wrong=event();wrong.headers.origin='https://evil.test';assert.equal((await run(wrong)).statusCode,403);
  assert.equal((await run(event({queryStringParameters:{mode:'bad'}}))).statusCode,400);
  const r=await run(event());assert.equal(r.statusCode,200);assert.deepEqual(called,{id:42,mode:'osu'});const saved=unseal(JSON.parse(r.body).refreshToken);assert.equal(saved.userId,42);assert.equal(saved.mode,'osu');assert.equal(saved.kind,'review-refresh');
  const badToken=await run({...event(),path:'/api/wrapped',httpMethod:'GET',queryStringParameters:{mode:'mania',refreshToken:JSON.parse(r.body).refreshToken}});assert.equal(badToken.statusCode,403);
 }finally{reviewQueue.refresh=original;}
});
