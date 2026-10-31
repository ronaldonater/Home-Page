import test from 'node:test';
import assert from 'node:assert/strict';
import {createMapperEnricher} from '../netlify/functions/wrapped/mapper-credits.mjs';
import {summarize} from '../osu-wrapped/src/summary.js';
const score=(id,owners)=>({id,ended_at:'2026-01-01T00:00:00Z',passed:true,pp:100,accuracy:.99,mods:[],beatmap:{id,...(owners===undefined?{}:{owners})},beatmapset:{id:100+id,creator:'Host',user_id:1,artist:'Artist'}});
test('guest credits replace host rankings, collaborators count once each, and missing credits fall back',()=>{
 const rows=[score(1,[{id:2,username:'Guest'},{id:2,username:'Guest'},{id:3,username:'Collaborator'}]),score(2,[{id:2,username:'Guest'}]),score(3,[]),score(4,[{id:0,username:'invalid'}])];
 const result=summarize({},[...rows,rows[0]],'osu');
 assert.deepEqual(result.mappers,[{name:'Guest',userId:2,count:2},{name:'Host',userId:1,count:2},{name:'Collaborator',userId:3,count:1}]);
 assert.equal(result.sampleCount,4);assert.ok(result.club.matches.some(row=>row.id==='loyalist'));
});
test('credits use stable user IDs rather than merging equal display names',()=>{
 const result=summarize({},[score(1,[{id:2,username:'[deleted user]'}]),score(2,[{id:3,username:'[deleted user]'}])],'osu');assert.equal(result.mappers.length,2);
});
test('enrichment batches 200 difficulties into four paced client requests and reuses cached owners',async()=>{
 let calls=0;const enrich=createMapperEnricher({fetchImpl:async(url,options)=>{
  calls++;assert.equal(options.headers.Authorization,'Bearer token');const ids=new URL(url).searchParams.getAll('ids[]');assert.ok(ids.length<=50);
  return Response.json({beatmaps:ids.map(id=>({id:Number(id),owners:[{id:2,username:'Guest'}]}))});
 }});
 const rows=Array.from({length:200},(_,i)=>score(i+1));const result=await enrich(rows,'token');assert.equal(calls,4);assert.equal(result.complete,true);assert.equal(result[0].beatmap.owners[0].username,'Guest');assert.equal(rows[0].beatmap.owners,undefined);
 await enrich(rows,'token');assert.equal(calls,4);
 assert.deepEqual(summarize({},result,'osu').mappers,[{name:'Guest',userId:2,count:200}]);
});
test('failed enrichment retries without caching failure or silently counting the host; omitted maps use fallback',async()=>{
 let fail=true;const enrich=createMapperEnricher({fetchImpl:async()=>fail?new Response('',{status:429}):Response.json({beatmaps:[]})});
 let result=await enrich([score(1)],'token');assert.equal(result.complete,false);assert.equal(result.progress.checked,0);
 fail=false;result=await enrich([score(1)],'token');assert.equal(result.complete,true);assert.deepEqual(result[0].beatmap.owners,[]);assert.equal(summarize({},result,'osu').mappers[0].name,'Host');
});
test('supplied owners and prior-year maps do not trigger requests',async()=>{
 const enrich=createMapperEnricher({fetchImpl:()=>{throw Error('unexpected request');}});
 const old={...score(2),ended_at:'2025-01-01T00:00:00Z'};const result=await enrich([score(1,[]),old],'token');assert.equal(result.complete,true);
});

test('Mapper Loyalists follows the same guest across different hosts, without crediting an unrelated common host',()=>{
 const loyal=Array.from({length:8},(_,i)=>({...score(i+1,[{id:i<3?20:100+i,username:i<3?'Guest':'Mapper '+i}]),beatmapset:{id:i+1,creator:'Host '+i,user_id:1000+i,artist:'Artist '+i}}));
 let result=summarize({},loyal,'osu');const match=result.club.matches.find(row=>row.id==='loyalist');assert.ok(match);assert.match(match.reason,/3 of 8/);
 const unrelated=Array.from({length:10},(_,i)=>score(i+1,[{id:100+i,username:'Guest '+i}]));
 result=summarize({},unrelated,'osu');assert.ok(!result.club.matches.some(row=>row.id==='loyalist'));
});
test('Wanderers uses unique guest mappers rather than mapset hosts',()=>{
 const rows=Array.from({length:20},(_,i)=>({...score(i+1,[{id:100+i%10,username:'Guest '+(i%10)}]),beatmapset:{id:i+1,creator:'One host',user_id:1,artist:'Artist '+i}}));
 const result=summarize({},rows,'osu');const match=result.club.matches.find(row=>row.id==='wanderer');assert.ok(match);assert.match(match.reason,/10 difficulty mappers/);
 const singleGuest=rows.map(s=>({...s,beatmap:{...s.beatmap,owners:[{id:2,username:'Same guest'}]},beatmapset:{...s.beatmapset,user_id:s.id,creator:'Host '+s.id}}));
 assert.ok(!summarize({},singleGuest,'osu').club.matches.some(row=>row.id==='wanderer'));
});
