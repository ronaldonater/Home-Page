import test from 'node:test';
import assert from 'node:assert/strict';
import {createMapDateEnricher} from '../netlify/functions/wrapped/map-clubs.mjs';
import {summarize} from '../osu-wrapped/src/summary.js';
const score=(id,year=2026)=>({id,ended_at:year+'-04-01T00:00:00Z',passed:true,pp:200-id,accuracy:.97,mods:['DT'],beatmapset:{id,creator:'Mapper',artist:'Artist'}});
test('date enrichment uses the full eligible sample, caches, and preserves supplied dates without mutating scores',async()=>{
 const requests=[];const enrich=createMapDateEnricher({fetchImpl:async(url,options)=>{requests.push(url);assert.equal(options.headers.Authorization,'Bearer private');const id=Number(url.split('/').pop());return Response.json({id,ranked_date:'2010-01-01T00:00:00Z'});}});
 const rows=Array.from({length:30},(_,i)=>score(i+1));rows.push(score(99,2025));rows[0].beatmapset.ranked_date='2026-01-01T00:00:00Z';
 const result=await enrich(rows,'private');assert.equal(requests.length,29);assert.equal(result[0].beatmapset.ranked_date,'2026-01-01T00:00:00Z');assert.equal(result[1].beatmapset.ranked_date,'2010-01-01T00:00:00Z');assert.equal(rows[1].beatmapset.ranked_date,undefined);await enrich(rows,'private');assert.equal(requests.length,29);assert.ok(summarize({},result,'osu').club.matches.some(row=>row.id==='timecapsule'));
});
test('failed and mismatched map lookups do not infer a ranked year or break a review',async()=>{
 const enrich=createMapDateEnricher({fetchImpl:async url=>Number(url.split('/').pop())===1?Response.json({id:999,ranked_date:'2010-01-01T00:00:00Z'}):new Response('unavailable',{status:503})});
 const result=await enrich([score(1),score(2)],'private');assert.ok(result.every(row=>row.beatmapset.ranked_date===null));assert.ok(!summarize({},result,'osu').club.matches.some(row=>['timecapsule','class2026','crowdfavorites'].includes(row.id)));
});
