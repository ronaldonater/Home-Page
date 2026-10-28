import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreBeatmapValues,beatmapAverages,beatmapAveragesMarkup} from '../osu-wrapped/src/beatmap-averages.js';
import {summarize} from '../osu-wrapped/src/summary.js';
import {createBeatmapAttributeEnricher} from '../netlify/functions/wrapped/beatmap-attributes.mjs';
const score=(mods=[],extra={})=>({id:1,ended_at:'2026-02-01',mods,beatmap:{id:1,mode:'osu',difficulty_rating:5,ar:9,accuracy:8,drain:6,cs:4,bpm:180,total_length:180},...extra});
const close=(a,b)=>assert.ok(Math.abs(a-b)<.0001,a+' ≠ '+b);
test('base values stay intact while fixed-rate and difficulty mods adjust supported statistics',()=>{
 let row=scoreBeatmapValues(score(['DT']),'osu');assert.equal(row.base.bpm,180);assert.equal(row.adjusted.bpm,270);assert.equal(row.adjusted.length,120);close(row.adjusted.ar,10.333333333);close(row.adjusted.od,9.777777777);assert.equal(row.adjusted.stars,null);
 row=scoreBeatmapValues(score(['HR']),'osu');assert.equal(row.adjusted.ar,10);close(row.adjusted.cs,5.2);close(row.adjusted.hp,8.4);
 row=scoreBeatmapValues(score(['EZ']),'osu');assert.equal(row.adjusted.ar,4.5);assert.equal(row.adjusted.cs,2);
 row=scoreBeatmapValues(score([{acronym:'DT',settings:{speed_change:1.2}}]),'osu');assert.equal(row.adjusted.bpm,216);assert.equal(row.adjusted.length,150);
 row=scoreBeatmapValues(score([{acronym:'DA',settings:{approach_rate:10.5,circle_size:5,drain_rate:7,overall_difficulty:9}}]),'osu');assert.equal(row.adjusted.ar,10.5);assert.equal(row.adjusted.cs,5);
});
test('unsupported fields stay unavailable and official mod attributes override computed values',()=>{
 let row=scoreBeatmapValues(score(['WU']),'osu');assert.equal(row.adjusted.bpm,null);assert.equal(row.base.bpm,180);
 row=scoreBeatmapValues(score(['DT'],{wrappedAttributes:{star_rating:6.4,approach_rate:10.4,overall_difficulty:9.8}}),'osu');assert.equal(row.adjusted.stars,6.4);assert.equal(row.adjusted.ar,10.4);
 assert.equal(scoreBeatmapValues(score(),'taiko').adjusted.ar,null);assert.equal(scoreBeatmapValues(score(),'taiko').adjusted.cs,null);assert.equal(scoreBeatmapValues(score(),'fruits').adjusted.od,null);
 row=scoreBeatmapValues(score(['7K'],{beatmap:{mode:'mania',cs:4}}),'mania');assert.equal(row.adjusted.cs,7);assert.equal(row.adjusted.ar,null);
 assert.equal(scoreBeatmapValues(score(),'fruits').base.stars,null);
});
test('averages use every eligible deduplicated score and independent valid metric denominators',()=>{
 const a=score(),b=score(['DT'],{id:2,beatmap:{bpm:120,total_length:60},passed:false,pp:null}),old=score([],{id:3,ended_at:'2025-01-01'});
 const result=summarize({},[a,a,b,old],'osu');assert.equal(result.beatmapAverages.total,2);assert.equal(result.beatmapAverages.metrics.bpm.base.value,150);assert.equal(result.beatmapAverages.metrics.stars.base.count,1);assert.equal(result.beatmapAverages.metrics.ar.base.count,1);
 const empty=beatmapAverages([score([],{beatmap:{}})],'osu');assert.equal(empty.metrics.cs.base.value,null);assert.equal(empty.metrics.cs.base.count,0);
 assert.match(beatmapAveragesMarkup(result),/Your average beatmap/);assert.equal(beatmapAveragesMarkup({beatmapAverages:{total:0}}),'');
});
test('official attributes are deduplicated, cached and bounded to 24 uncached combinations',async()=>{
 let calls=0;const enrich=createBeatmapAttributeEnricher({fetchImpl:async(url,options)=>{calls++;assert.equal(options.method,'POST');assert.equal(JSON.parse(options.body).ruleset,'osu');return {ok:true,json:async()=>({attributes:{star_rating:6}})};}});
 const first=await enrich([score(['DT']),score(['DT'],{id:2})],'osu','test');assert.equal(calls,1);assert.equal(first[1].wrappedAttributes.star_rating,6);await enrich([score(['DT'])],'osu','test');assert.equal(calls,1);
 await enrich(Array.from({length:30},(_,i)=>score(['HR'],{id:i+10,beatmap:{id:i+10}})),'osu','test');assert.equal(calls,25);
});
test('difficulty failures preserve original scores and do not fabricate adjusted stars',async()=>{
 const input=[score(['DT'])],enrich=createBeatmapAttributeEnricher({fetchImpl:async()=>{throw Error('offline');}});const output=await enrich(input,'osu','test');assert.equal(output[0],input[0]);assert.equal(scoreBeatmapValues(output[0],'osu').adjusted.stars,null);
});
