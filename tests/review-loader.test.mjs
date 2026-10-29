import test from 'node:test';
import assert from 'node:assert/strict';
import {loadReview,validReview} from '../osu-wrapped/src/review-loader.js';
import {createReviewCore} from '../netlify/functions/wrapped/review-core.mjs';
const core={user:{id:1,username:'Player'},mode:'osu',sampleCount:2,top:[],months:[],mappers:[],artists:[],mapping:{status:'pending'},skillsets:{total:2,checked:2,tagged:0,rows:[]}};
const full={...core,loadingStatus:{complete:true},mapping:{status:'ready',created:0},rarestMedalStatus:'none'};
test('review stays unresolved until all details and artwork finish, with real loading stages',async()=>{
 const stages=[];let release;const ready=new Promise(resolve=>release=resolve);let settled=false;
 const task=loadReview({url:'/api/wrapped',fetchImpl:async url=>Response.json(url.includes('stage=core')?core:full),onProgress:phase=>stages.push(phase),prepare:()=>ready}).then(value=>{settled=true;return value;});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(settled,false);assert.deepEqual(stages,['core','tags','details','artwork']);release();assert.deepEqual((await task).data,full);
});
test('transient detail errors and incomplete service readiness retry without exposing a partial profile',async()=>{
 let clock=0,details=0,prepared=false;const waits=[];
 const result=await loadReview({url:'/api/wrapped',now:()=>clock,sleep:async ms=>{assert.equal(prepared,false);waits.push(ms);clock+=ms;},prepare:()=>prepared=true,fetchImpl:async url=>{
  if(url.includes('stage=core'))return Response.json(core);details++;
  if(details===1)return Response.json({error:'Busy'},{status:503,headers:{'Retry-After':'20'}});
  return Response.json(details===2?{...full,loadingStatus:{complete:false}}:full);
 }});assert.equal(details,3);assert.deepEqual(waits,[20000,60000]);assert.equal(prepared,true);assert.deepEqual(result.data,full);
});
test('authentication failures stop instead of automatically retrying',async()=>{
 let sleeps=0;await assert.rejects(loadReview({url:'/api/wrapped',sleep:async()=>sleeps++,fetchImpl:async()=>Response.json({error:'Sign in again'},{status:401})}),/Sign in again/);assert.equal(sleeps,0);assert.equal(validReview({}),false);
});
test('tag checks progress in batches, including successful maps without any tags',async()=>{
 let checked=0;const progress=[],calls=[];
 const result=await loadReview({url:'/api/wrapped',onProgress:(phase,value)=>{if(phase==='tags'&&value)progress.push(value.checked);},fetchImpl:async url=>{
  const stage=new URL(url,'https://test').searchParams.get('stage');calls.push(stage);
  if(stage==='core')return Response.json({...core,skillsets:{total:2,checked:0,tagged:0,rows:[]}});
  if(stage==='tags')return Response.json({...core,skillsets:{total:2,checked:++checked,tagged:0,rows:[]}});return Response.json(full);
 }});assert.deepEqual(calls,['core','tags','tags','full']);assert.deepEqual(progress,[0,1,2]);assert.equal(result.data.skillsets.tagged,0);
});
test('stalled tag checks and artwork errors automatically wait and recover',async()=>{
 let clock=0,tags=0,artwork=0;const waits=[];
 await loadReview({url:'/api/wrapped',now:()=>clock,sleep:async ms=>{waits.push(ms);clock+=ms;},prepare:()=>{if(++artwork===1)throw Error('Not ready');},fetchImpl:async url=>{
  if(url.includes('stage=core'))return Response.json({...core,skillsets:{total:2,checked:0,tagged:0,rows:[]}});
  if(url.includes('stage=tags'))return Response.json(++tags===1?{...core,skillsets:{total:2,checked:0,tagged:0,rows:[]}}:core);return Response.json(full);
 }});assert.deepEqual(waits,[60000,5000]);assert.equal(artwork,2);
});
test('mapper eligibility must be ready even with no scores',async()=>{
 let clock=0,calls=0;const mapped={...full,sampleCount:0,mapping:{status:'ready',created:1},skillsets:{total:0,checked:0,rows:[]}};
 const result=await loadReview({url:'/api/wrapped',now:()=>clock,sleep:async ms=>clock+=ms,fetchImpl:async()=>Response.json(++calls===1?{...mapped,mapping:{status:'unavailable'}}:mapped)});assert.equal(result.data.mapping.created,1);assert.equal(clock,60000);
});
test('core cache reuses preferred and explicit modes, isolates tokens, and excludes failures',async()=>{
 let count=0;const service=createReviewCore();const osu=async path=>{count++;return path.startsWith('/me')?{id:1,username:'Player',playmode:'mania'}:[];};
 await service('token',undefined,osu);await service('token','mania',osu);assert.equal(count,3);await service('other','mania',osu);assert.equal(count,6);
 const failed=createReviewCore();await assert.rejects(failed('token','osu',async path=>path.startsWith('/me')?{id:1,username:'Player'}:null),/Incomplete score/);assert.equal((await failed('token','osu',osu)).best.length,0);
});


test('successful detail batches continue promptly and report their progress',async()=>{
 let calls=0;const waits=[],progress=[];
 const result=await loadReview({url:'/api/wrapped',sleep:async ms=>waits.push(ms),onProgress:(phase,value)=>{if(phase==='details'&&value)progress.push(value.checks[0].checked);},fetchImpl:async url=>{
  if(url.includes('stage=core'))return Response.json(core);
  calls++;return Response.json(calls<3?{...full,loadingStatus:{complete:false,retryAfterMs:1100,checks:[{name:'Mod-adjusted attributes',complete:false,checked:calls,total:3}]}}:full);
 }});
 assert.deepEqual(waits,[1100,1100]);assert.ok(progress.includes(1)&&progress.includes(2));assert.deepEqual(result.data,full);
});

test('unchanged detail batches back off instead of polling continuously',async()=>{
 let calls=0;const waits=[];
 await loadReview({url:'/api/wrapped',sleep:async ms=>waits.push(ms),fetchImpl:async url=>{
  if(url.includes('stage=core'))return Response.json(core);
  return Response.json(++calls<4?{...full,loadingStatus:{complete:false,retryAfterMs:1100,checks:[{name:'Mapping catalogue',complete:false,checked:1}]}}:full);
 }});assert.deepEqual(waits,[1100,2200,4400]);
});
