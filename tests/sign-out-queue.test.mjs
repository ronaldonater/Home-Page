import test from 'node:test';
import assert from 'node:assert/strict';
import {requestSignOut} from '../osu-wrapped/src/sign-out.js';
import {createReviewQueue,reviewQueue} from '../netlify/functions/wrapped/review-queue.mjs';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {seal} from '../netlify/functions/wrapped/security.mjs';
import {loadReview} from '../osu-wrapped/src/review-loader.js';
const client='12345678-1234-1234-1234-123456789abc';
test('queued sign-out warns; cancel preserves polling and queue without a request',async()=>{
 let stopped=0,calls=0;let warning='';const result=await requestSignOut({queued:true,client,beforeRequest:()=>stopped++,confirmImpl:text=>{warning=text;return false;},fetchImpl:async()=>{calls++;}});
 assert.equal(result,false);assert.equal(stopped,0);assert.equal(calls,0);assert.match(warning,/remove you from the queue/);
});
test('confirmed queued sign-out stops polling first; unqueued sign-out does not warn',async()=>{
 const events=[];assert.equal(await requestSignOut({queued:true,client,confirmImpl:()=>true,beforeRequest:()=>events.push('stop'),fetchImpl:async(url,options)=>{events.push('request');assert.ok(url.includes('client='+client));assert.equal(options.method,'POST');return {ok:true};}}),true);assert.deepEqual(events,['stop','request']);
 await requestSignOut({queued:false,confirmImpl:()=>{throw Error('must not warn');},fetchImpl:async()=>({ok:true})});
});
test('queue sign-out affects only that authenticated account and browser, preserves work locks, and clears return priority',async()=>{
 let sql,args;const queue=createReviewQueue({config:()=>({databaseUrl:'db',clientId:1,secret:'a-long-secret-with-at-least-32-characters'}),query:async(url,text,params)=>{sql=text;args=params;return [];}});
 assert.equal((await queue.signOut(42,client)).status,'removed');assert.equal(args[1].length,4);assert.equal(args[2],client);assert.match(sql,/client_id=\$3/);assert.match(sql,/state<>'complete'/);assert.match(sql,/resume_until=NULL/);assert.match(sql,/work_until>clock_timestamp/);assert.ok(!sql.includes('work_until=NULL'));
 await assert.rejects(queue.signOut(42,'invalid'),{status:400});
});
test('logout releases the queue before clearing the cookie and still checks origin',async()=>{
 process.env.WRAPPED_SESSION_SECRET='a-long-secret-with-at-least-32-characters';process.env.WRAPPED_OSU_REDIRECT_URI='https://example.com/api/auth/callback';
 const original=reviewQueue.signOut;let called;
 reviewQueue.signOut=async(...args)=>{called=args;};
 const event={path:'/api/auth/logout',httpMethod:'POST',headers:{origin:'https://example.com',cookie:'wrapped_session='+seal({kind:'session',token:'private',userId:42,exp:Date.now()+60000})},queryStringParameters:{client}};
 try{const r=await handler(event,{now:()=>Date.parse('2026-12-01')});assert.equal(r.statusCode,200);assert.deepEqual(called,[42,client]);assert.ok(r.headers['Set-Cookie'].includes('Max-Age=0'));called=null;
 assert.equal((await handler({...event,headers:{...event.headers,origin:'https://evil.test'}})).statusCode,403);assert.equal(called,null);
 }finally{reviewQueue.signOut=original;}
});
test('aborting a queued loader exits without retrying or rejoining',async()=>{
 const controller=new AbortController();let calls=0;
 await assert.rejects(loadReview({url:'/api/wrapped',signal:controller.signal,fetchImpl:async()=>{calls++;return Response.json({queue:{status:'queued',position:2,retryAfter:10}},{status:202});},onQueue:status=>{assert.equal(status,'queued');controller.abort();}}),{name:'AbortError'});assert.equal(calls,1);
});
