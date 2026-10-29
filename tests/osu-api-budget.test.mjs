import test from 'node:test';
import assert from 'node:assert/strict';
import {createOsuApi} from '../netlify/functions/wrapped/osu-api.mjs';
test('all API paths share spaced request starts while image hosts bypass the budget',async()=>{
 let clock=0;const starts=[];const api=createOsuApi({now:()=>clock,sleep:async ms=>{clock+=ms;},config:()=>({}),fetchImpl:async url=>{starts.push([String(url),clock]);return Response.json({});}});
 await Promise.all(['/me','/scores/1','/beatmaps/1/attributes'].map(path=>api('https://osu.ppy.sh/api/v2'+path)));
 assert.deepEqual(starts.map(row=>row[1]),[0,1100,2200]);await api('https://a.ppy.sh/1');assert.equal(starts.at(-1)[1],2200);
});
test('same beatmapset is coalesced and cached across tokens with independent readable responses',async()=>{
 let requests=0;const api=createOsuApi({config:()=>({}),fetchImpl:async()=>{requests++;return Response.json({id:1,related_tags:[],beatmaps:[]});}});
 const [a,b]=await Promise.all([api('https://osu.ppy.sh/api/v2/beatmapsets/1'),api('https://osu.ppy.sh/api/v2/beatmapsets/1',{headers:{Authorization:'Bearer other'}})]);assert.equal((await a.json()).id,1);assert.equal((await b.json()).id,1);await api('https://osu.ppy.sh/api/v2/beatmapsets/1');assert.equal(requests,1);
});
test('429 respects Retry-After and prevents further upstream requests during cooldown',async()=>{
 let clock=0,requests=0;const api=createOsuApi({now:()=>clock,sleep:async ms=>clock+=ms,config:()=>({}),fetchImpl:async()=>{requests++;return new Response(null,{status:429,headers:{'Retry-After':'60'}});}});
 await api('https://osu.ppy.sh/api/v2/me');assert.equal((await api('https://osu.ppy.sh/api/v2/me')).status,429);assert.equal(requests,1);clock=61000;await api('https://osu.ppy.sh/api/v2/me');assert.equal(requests,2);
});
test('database admission is shared across independent instances and falls back to local pacing on storage errors',async()=>{
 let clock=0,next=0;const starts=[];const options={now:()=>clock,sleep:async ms=>clock+=ms,config:()=>({databaseUrl:'private',clientId:123}),query:async()=>{if(clock<next)return [];next=clock+1100;return [{}];},fetchImpl:async()=>{starts.push(clock);return Response.json({});}};
 const a=createOsuApi(options),b=createOsuApi(options);await a('https://osu.ppy.sh/api/v2/me');await b('https://osu.ppy.sh/api/v2/me');assert.deepEqual(starts,[0,1100]);
 const failed=createOsuApi({...options,query:async()=>{throw Error('offline');}});assert.equal((await failed('https://osu.ppy.sh/api/v2/me')).status,200);assert.equal(starts.length,3);
});
test('aborted queued work never reaches osu and does not poison the queue',async()=>{
 let clock=0,count=0;const controller=new AbortController();controller.abort();const api=createOsuApi({now:()=>clock,sleep:async ms=>clock+=ms,config:()=>({}),fetchImpl:async()=>{count++;return Response.json({});}});
 await assert.rejects(api('https://osu.ppy.sh/api/v2/me',{signal:controller.signal}));await api('https://osu.ppy.sh/api/v2/me');assert.equal(count,1);
});

test('cancellation while waiting for a slot releases the queue without an upstream call',async()=>{
 let clock=0,count=0,waiting=false;const controller=new AbortController();const api=createOsuApi({now:()=>clock,config:()=>({}),sleep:async(ms,signal)=>{if(!waiting){waiting=true;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));}clock+=ms;},fetchImpl:async()=>{count++;return Response.json({});}});
 await api('https://osu.ppy.sh/api/v2/me');const pending=api('https://osu.ppy.sh/api/v2/me',{signal:controller.signal});const rejected=assert.rejects(pending);await new Promise(resolve=>setImmediate(resolve));controller.abort();await rejected;assert.equal(count,1);await api('https://osu.ppy.sh/api/v2/me');assert.equal(count,2);
});


test('database outages use paced requests, retain 429 cooldowns, and retry storage after recovery',async()=>{
 let clock=0,queries=0;const starts=[];
 const api=createOsuApi({now:()=>clock,sleep:async ms=>clock+=ms,config:()=>({databaseUrl:'private',clientId:1}),query:async()=>{queries++;if(queries===1)throw Error('offline');return [{}];},fetchImpl:async()=>{starts.push(clock);return starts.length===2?new Response(null,{status:429,headers:{'Retry-After':'60'}}):Response.json({});}});
 await api('https://osu.ppy.sh/api/v2/me');await api('https://osu.ppy.sh/api/v2/me');
 assert.deepEqual(starts,[0,1100]);assert.equal(queries,1);
 assert.equal((await api('https://osu.ppy.sh/api/v2/me')).status,429);assert.equal(starts.length,2);
 clock=62000;await api('https://osu.ppy.sh/api/v2/me');assert.equal(queries,2);assert.equal(starts.length,3);
});
