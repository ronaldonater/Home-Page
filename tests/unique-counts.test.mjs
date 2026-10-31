import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from '../osu-wrapped/src/summary.js';
import {uniqueCountText} from '../osu-wrapped/src/unique-counts.js';
import {experienceSlides} from '../osu-wrapped/src/experience.js';
import {demo} from '../osu-wrapped/src/demo.js';
const score=i=>({id:i,ended_at:'2026-01-01T00:00:00Z',pp:i===30?null:100+i,accuracy:.98,passed:true,mods:[],beatmap:{id:i,owners:[{id:i,username:'Guest '+i}]},beatmapset:{id:i,creator:'Host',user_id:999,artist:'Artist '+i}});
test('unique totals use every deduplicated selected score, beyond top 25 plays and top 10 rankings',()=>{
 const scores=Array.from({length:30},(_,i)=>score(i+1));scores.push(scores[0],{...score(100),ended_at:'2025-01-01T00:00:00Z'});
 const result=summarize({id:42,username:'Player'},scores,'osu');assert.equal(result.top.length,25);assert.equal(result.mappers.length,10);assert.equal(result.artists.length,10);
 assert.deepEqual(result.uniqueCounts,{mappers:30,artists:30,beatmaps:30,mapsets:30});
 const notes=experienceSlides(result).map(row=>row.note).join(' ');assert.match(notes,/30 unique mappers across all selected scores/);assert.match(notes,/30 unique artists across all selected scores/);assert.match(notes,/30 unique mapsets/);assert.ok(!notes.includes('unique difficulties'));
});
test('same difficulty and collaborators are unique by ID; host fallback and shared mapsets count correctly',()=>{
 const a=score(1),b={...score(2),beatmap:a.beatmap,beatmapset:a.beatmapset},c={...score(3),beatmap:{id:3,owners:[{id:1,username:'Guest 1'},{id:1,username:'Guest 1'},{id:2,username:'Guest 2'}]},beatmapset:a.beatmapset};
 assert.deepEqual(summarize({},[a,b,c],'osu').uniqueCounts,{mappers:2,artists:1,beatmaps:2,mapsets:1});
 assert.equal(uniqueCountText({},'mappers'),'');assert.equal(uniqueCountText({uniqueCounts:{mappers:1}},'mappers'),'1 unique mapper');
});
test('frozen demos have full-sample totals without live requests',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){const data=demo(mode);assert.deepEqual(data.uniqueCounts,{mappers:10,artists:10,beatmaps:10,mapsets:10});assert.ok(uniqueCountText(data,'plays'));}
});

test('Top Plays slide shows only unique mapsets, never the redundant difficulty total',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){
  const data=demo(mode);data.uniqueCounts={...data.uniqueCounts,beatmaps:29,mapsets:23};
  const slide=experienceSlides(data).find(slide=>slide.layout==='plays');
  assert.match(slide.note,/23 unique mapsets/);assert.ok(!slide.note.includes('unique difficulties'));assert.ok(!slide.body.includes('unique difficulties'));assert.ok(!slide.note.includes('29'));
 }
});
