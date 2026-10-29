import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewQueue} from '../netlify/functions/wrapped/review-queue.mjs';
import {createSharedOsuFetch} from '../netlify/functions/wrapped/shared-osu-cache.mjs';
import {encryptReview,decryptReview} from '../netlify/functions/wrapped/review-storage.mjs';
import {loadReview} from '../osu-wrapped/src/review-loader.js';
const secret='test-queue-encryption-secret-at-least-32-characters',cfg={databaseUrl:'private',secret,clientId:123};
const full={user:{id:42,username:'Player'},mode:'osu',sampleCount:1,top:[],months:[],mappers:[],artists:[],skillsets:{total:1,checked:1,rows:[]},loadingStatus:{complete:true}};

test('queue identifies a user/mode without storing their identity or credentials and preserves completed reviews',async()=>{
 let params,status='active';const writes=[];
 const query=async(url,sql,args)=>{if(sql.startsWith('SELECT')){params=args;return [{job:status==='complete'?{status,result:encryptReview(full,secret)}:{status,position:2}}];}writes.push(args);return [{job_key:'saved'}];};
 const queue=createReviewQueue({config:()=>cfg,query});
 const ticket=await queue.claim(42,'osu'),firstKey=params[1];assert.equal(ticket.status,'active');assert.match(firstKey,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(params).includes('Player'));
 await queue.release(ticket,full);assert.equal(writes[0][3],true);assert.deepEqual(decryptReview(writes[0][4],secret),full);assert.ok(!writes[0][4].includes('Player'));
 await queue.claim(42,'osu');assert.equal(params[1],firstKey);await queue.claim(42,'mania');assert.notEqual(params[1],firstKey);
 status='complete';assert.deepEqual((await queue.claim(42,'osu')).data,full);
 status='queued';assert.deepEqual(await queue.claim(42,'osu'),{status:'queued',position:2,retryAfter:10});
});

test('database outage reports unavailable for loader fallback; no database keeps local setup working',async()=>{
 const queue=createReviewQueue({config:()=>cfg,query:async()=>{throw Error('offline');}});
 assert.equal((await queue.claim(42,'osu')).status,'unavailable');
 assert.equal((await createReviewQueue({config:()=>({})}).claim(42,'osu')).status,'disabled');
});

test('incomplete batches release the work lock without completing the profile; stale workers cannot commit',async()=>{
 let args;const queue=createReviewQueue({config:()=>cfg,query:async(url,sql,value)=>{args=value;return [{job_key:'saved'}];}});
 await queue.release({status:'active',budget:'a',job:'b',worker:'c'},{loadingStatus:{complete:false}});assert.equal(args[3],false);assert.equal(args[4],null);
 const stale=createReviewQueue({config:()=>cfg,query:async()=>[]});await assert.rejects(stale.release({status:'active'},full),/resumed/);
});

test('shared successful JSON responses survive server-instance changes, keep personal tokens isolated, and share map metadata',async()=>{
 const cache=new Map();let calls=0;const keys=[];
 const query=async(url,sql,params)=>{keys.push(params[0]);if(sql.startsWith('SELECT'))return cache.has(params[0])?[{payload:cache.get(params[0])}]:[];cache.set(params[0],params[1]);return [];};
 const options={config:()=>cfg,query},fetchImpl=async()=>{calls++;return Response.json({id:42,username:'Player'});};
 const a=createSharedOsuFetch(fetchImpl,options),b=createSharedOsuFetch(fetchImpl,options);
 const auth=token=>({headers:{Authorization:'Bearer '+token}});
 await a('https://osu.ppy.sh/api/v2/me',auth('one'));assert.equal((await b('https://osu.ppy.sh/api/v2/me',auth('one')).then(r=>r.json())).id,42);assert.equal(calls,1);
 await b('https://osu.ppy.sh/api/v2/me',auth('two'));assert.equal(calls,2);
 await a('https://osu.ppy.sh/api/v2/beatmapsets/77',auth('one'));await b('https://osu.ppy.sh/api/v2/beatmapsets/77',{headers:{...auth('two').headers,'x-api-version':'20220705'}});assert.equal(calls,3);
 assert.ok([...cache.values()].every(value=>!value.includes('Player')));assert.ok(keys.every(value=>/^[a-f0-9]{64}$/.test(value)));
});

test('shared cache excludes failed responses, OAuth exchanges and replay downloads',async()=>{
 let queries=0,calls=0;const api=createSharedOsuFetch(async()=>{calls++;return new Response(null,{status:503});},{config:()=>cfg,query:async()=>{queries++;return [];}});
 await api('https://osu.ppy.sh/api/v2/me');assert.equal(queries,1);
 await api('https://osu.ppy.sh/oauth/token',{method:'POST'});await api('https://osu.ppy.sh/api/v2/scores/1/download');assert.equal(queries,1);assert.equal(calls,3);
});

test('queued profiles poll with a position and remain hidden until admitted and completely prepared',async()=>{
 let coreCalls=0,prepared=false;const progress=[],waits=[];
 const result=await loadReview({url:'/api/wrapped',sleep:async ms=>{waits.push(ms);assert.equal(prepared,false);},onProgress:(phase,value)=>{if(value?.message)progress.push(value.message);},prepare:()=>prepared=true,fetchImpl:async url=>{
  if(url.includes('stage=core')&&++coreCalls<3)return Response.json({queue:{status:coreCalls===1?'queued':'processing',position:2,retryAfter:3}},{status:202});
  return Response.json(full);
 }});assert.deepEqual(waits,[3000,3000]);assert.ok(progress.some(value=>value.includes('number 2')));assert.ok(progress.some(value=>value.includes('already')));assert.equal(prepared,true);assert.deepEqual(result.data,full);
});


test('authenticated API reports queue position or cached completion before doing any osu profile work',async()=>{
 const {handler}=await import('../netlify/functions/wrapped/api-handler.mjs');const {reviewQueue}=await import('../netlify/functions/wrapped/review-queue.mjs');const {seal}=await import('../netlify/functions/wrapped/security.mjs');
 const oldSecret=process.env.WRAPPED_SESSION_SECRET,oldDatabase=process.env.WRAPPED_DATABASE_URL,oldFetch=globalThis.fetch,oldClaim=reviewQueue.claim;
 process.env.WRAPPED_SESSION_SECRET=secret;process.env.WRAPPED_DATABASE_URL='configured';let requested;
 globalThis.fetch=async()=>{throw Error('Queued requests must not fetch a profile');};
 const event={path:'/api/wrapped',httpMethod:'GET',headers:{cookie:'wrapped_session='+seal({kind:'session',token:'private',userId:42,playmode:'osu',exp:Date.now()+60000})},queryStringParameters:{stage:'core',mode:'osu'}};
 const run=()=>handler(event,{now:()=>Date.parse('2026-12-01')});
 try{
  reviewQueue.claim=async(id,mode)=>{requested=[id,mode];return {status:'queued',position:3,retryAfter:10};};
  const queued=await run();assert.equal(queued.statusCode,202);assert.equal(JSON.parse(queued.body).queue.position,3);assert.deepEqual(requested,[42,'osu']);
  reviewQueue.claim=async()=>({status:'complete',data:full});assert.deepEqual(JSON.parse((await run()).body),full);
  const {apiBudget}=await import('../netlify/functions/wrapped/osu-api.mjs');const {reviewStorage}=await import('../netlify/functions/wrapped/review-storage.mjs');const oldBudget=apiBudget.query,oldStorage=reviewStorage.query;
  try{
   apiBudget.query=async()=>[{}];reviewStorage.query=async()=>[];
   globalThis.fetch=async url=>Response.json(String(url).includes('/scores/best?')?(String(url).includes('offset=0')?[{id:88,pp:100,passed:true,accuracy:.99,ended_at:'2026-06-01',mods:[],beatmap:{id:9,mode:'osu'},beatmapset:{id:77}}]:[]):{id:42,username:'Player',playmode:'osu'});
   reviewQueue.claim=async()=>({status:'unavailable'});const offline=await run();assert.equal(offline.statusCode,200);assert.equal(JSON.parse(offline.body).user.id,42);assert.equal(JSON.parse(offline.body).sampleCount,1);
  }finally{apiBudget.query=oldBudget;reviewStorage.query=oldStorage;}

 }finally{reviewQueue.claim=oldClaim;globalThis.fetch=oldFetch;if(oldSecret===undefined)delete process.env.WRAPPED_SESSION_SECRET;else process.env.WRAPPED_SESSION_SECRET=oldSecret;if(oldDatabase===undefined)delete process.env.WRAPPED_DATABASE_URL;else process.env.WRAPPED_DATABASE_URL=oldDatabase;}
});


test('losing queue storage while finishing does not discard a finished review',async()=>{
 let queries=0,clock=0;
 const queue=createReviewQueue({config:()=>cfg,query:async()=>{queries++;throw Error('offline');}},()=>clock);
 assert.deepEqual(await queue.release({status:'active',budget:'a',job:'b',worker:'c'},full),{status:'unavailable'});
 assert.equal((await queue.claim(42,'osu')).status,'unavailable');assert.equal(queries,1);
 clock=31000;await queue.claim(42,'osu');assert.equal(queries,2);
});

test('shared cache outages back off while upstream profile requests continue',async()=>{
 let queries=0,calls=0,clock=0;
 const api=createSharedOsuFetch(async()=>{calls++;return Response.json({id:42});},{config:()=>cfg,now:()=>clock,query:async()=>{queries++;throw Error('offline');}});
 await api('https://osu.ppy.sh/api/v2/me');await api('https://osu.ppy.sh/api/v2/me');assert.equal(queries,1);assert.equal(calls,2);
 clock=61000;await api('https://osu.ppy.sh/api/v2/me');assert.equal(queries,2);assert.equal(calls,3);
});


test('obsolete completed skillset caches are refreshed without changing queue keys or bypassing admission',async()=>{
 const old={...full,skillsets:{...full.skillsets,rows:[{tag:'skillset/jumps',count:1}]}};const encrypted=encryptReview(old,secret),calls=[];let reads=0;
 const queue=createReviewQueue({config:()=>cfg,query:async(url,sql,args)=>{calls.push({sql,args});if(sql.startsWith('SELECT'))return [{job:++reads===1?{status:'complete',result:encrypted}:{status:'queued',position:3}}];return [{job_key:'refreshed'}];}});
 const result=await queue.claim(42,'osu');assert.equal(result.status,'queued');assert.equal(result.position,3);
 assert.equal(calls.length,3);assert.equal(calls[0].args[1],calls[2].args[1]);assert.match(calls[1].sql,/state='complete' AND result=\$3/);assert.equal(calls[1].args[2],encrypted);
});
test('completed reviews already containing skillset maps remain cached',async()=>{
 const saved={...full,skillsets:{...full.skillsets,rows:[{tag:'skillset/jumps',count:1,maps:[{id:9,setId:77,count:1}]}]}};let reads=0;
 const queue=createReviewQueue({config:()=>cfg,query:async()=>{reads++;return [{job:{status:'complete',result:encryptReview(saved,secret)}}];}});
 assert.deepEqual((await queue.claim(42,'osu')).data,saved);assert.equal(reads,1);
});
