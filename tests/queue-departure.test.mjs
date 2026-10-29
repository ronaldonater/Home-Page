import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {installQueueDeparture} from '../osu-wrapped/src/queue-departure.js';
test('only page departure signals the live queue task, with keepalive fallback',async()=>{
 const handlers=new Map(),sent=[],fallback=[];let task={loading:true,client:'task'};
 const remove=installQueueDeparture({target:{addEventListener:(key,fn)=>handlers.set(key,fn),removeEventListener:key=>handlers.delete(key)},navigatorImpl:{sendBeacon:url=>{sent.push(url);return false;}},fetchImpl:async(url,options)=>fallback.push({url,options}),current:()=>task,base:'/custom-api'});
 assert.deepEqual([...handlers.keys()],['pagehide']);handlers.get('pagehide')();
 assert.equal(sent[0],'/custom-api/wrapped/depart?client=task');assert.equal(fallback[0].options.keepalive,true);assert.equal(fallback[0].options.method,'POST');
 task.loading=false;handlers.get('pagehide')();assert.equal(sent.length,1);remove();assert.equal(handlers.size,0);
});
test('queue SQL releases departures, prioritizes timely returns, preserves work locks and is safe to rerun',async t=>{
 let PGlite;try{({PGlite}=await import('@electric-sql/pglite'));}catch{t.skip('Optional local PostgreSQL test engine is not installed');return;}
 const db=new PGlite(),sql=readFileSync(new URL('../scripts/sql/review-queue.sql',import.meta.url),'utf8');
 try{
  await db.exec(sql);
  const claim=async(job,client=job)=> (await db.query('SELECT wrapped_review_claim_v2($1,$2,$3,$4) AS job',['budget',job,'worker-'+job,client])).rows[0].job;
  const depart=(job,client=job)=>db.query('SELECT wrapped_review_depart($1,$2::text[],$3)',['budget',[job],client]);
  const unlock=job=>db.query('UPDATE wrapped_review_jobs SET worker_id=NULL,work_until=NULL WHERE job_key=$1',[job]);
  assert.equal((await claim('a')).status,'active');await unlock('a');assert.equal((await claim('b')).status,'queued');
  await depart('a','wrong-client');assert.equal((await claim('b')).position,2);
  await db.query("UPDATE wrapped_review_jobs SET last_seen_at=clock_timestamp()-interval '110 seconds' WHERE job_key='a'");
  await depart('a');assert.equal((await claim('b')).status,'active');
  assert.equal((await claim('c')).status,'queued');assert.equal((await claim('a','returned-a')).position,2);
  await db.query("UPDATE wrapped_review_jobs SET state='complete',expires_at=clock_timestamp()+interval '15 minutes',result='saved',work_until=NULL WHERE job_key='b'");
  assert.equal((await claim('c')).status,'queued');assert.equal((await claim('a','returned-a')).status,'active');
  await depart('a','a');assert.equal((await claim('a','returned-a')).status,'processing');
  // A genuine departure while a worker is running retains its lock until that batch ends.
  await depart('a','returned-a');assert.equal((await claim('c')).status,'queued');
  await db.query("UPDATE wrapped_review_jobs SET state=CASE WHEN departed_until IS NOT NULL THEN 'queued' ELSE state END,work_until=NULL,worker_id=NULL WHERE job_key='a'");
  assert.equal((await claim('c')).status,'active');
  // Expired departure grace gives no priority and removes the abandoned job.
  await db.query("UPDATE wrapped_review_jobs SET departed_until=clock_timestamp()-interval '1 second',resume_until=clock_timestamp()-interval '1 second' WHERE job_key='a'");
  assert.equal((await claim('a','late-a')).position,2);
  assert.equal((await db.query("SELECT resume_until FROM wrapped_review_jobs WHERE job_key='a'")).rows[0].resume_until,null);
  await db.exec(sql);assert.equal((await db.query("SELECT result FROM wrapped_review_jobs WHERE job_key='b'")).rows[0].result,'saved');
  assert.equal((await db.query("SELECT relrowsecurity FROM pg_class WHERE relname='wrapped_review_jobs'")).rows[0].relrowsecurity,true);
 }finally{await db.close();}
});


test('departure endpoint requires a session, same origin and valid browser task without fetching osu data',async()=>{
 const {handler}=await import('../netlify/functions/wrapped/api-handler.mjs');
 const {reviewQueue}=await import('../netlify/functions/wrapped/review-queue.mjs');
 const {seal}=await import('../netlify/functions/wrapped/security.mjs');
 const keys=['WRAPPED_SESSION_SECRET','WRAPPED_OSU_REDIRECT_URI'],saved=keys.map(key=>process.env[key]),original=reviewQueue.depart,oldFetch=globalThis.fetch;
 process.env.WRAPPED_SESSION_SECRET='test-queue-encryption-secret-at-least-32-characters';process.env.WRAPPED_OSU_REDIRECT_URI='https://example.test/api/auth/callback';
 let called;reviewQueue.depart=async(...args)=>{called=args;};globalThis.fetch=async()=>{throw Error('No upstream /api/osu-wrapped calls for departures');};
 const client='12345678-1234-1234-1234-123456789abc';
 const session=seal({kind:'session',token:'private',userId:42,playmode:'osu',exp:Date.now()+60000});
 const event={path:'/api/osu-wrapped/wrapped/depart',httpMethod:'POST',headers:{origin:'https://example.test',cookie:'wrapped_session='+session},queryStringParameters:{client}};
 const run=e=>handler(e,{now:()=>Date.parse('2026-12-01')});
 try{
  assert.equal((await run({...event,httpMethod:'GET'})).statusCode,405);
  assert.equal((await run({...event,headers:{origin:event.headers.origin}})).statusCode,401);
  assert.equal((await run({...event,headers:{...event.headers,origin:'https://other.test'}})).statusCode,403);
  assert.equal((await run({...event,queryStringParameters:{client:'bad'}})).statusCode,400);
  assert.equal((await run(event)).statusCode,200);assert.deepEqual(called,[42,client]);
 }finally{reviewQueue.depart=original;globalThis.fetch=oldFetch;keys.forEach((key,i)=>{if(saved[i]===undefined)delete process.env[key];else process.env[key]=saved[i];});}
});
