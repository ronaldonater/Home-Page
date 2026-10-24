import test from 'node:test';
import assert from 'node:assert/strict';
import {favoriteMod,favoriteModLabel,favoriteModPercentage,modRankings} from '../osu-wrapped/src/mods.js';
import {summarize} from '../osu-wrapped/src/summary.js';
test('favorite mod counts individual mods once per score across API representations',()=>{
 const result=favoriteMod([{mods:['HD','HR','HD']},{mods:[{acronym:'HD'},{acronym:'DT'}]},{mods:['HR']}]);assert.deepEqual(result,{mods:['HD','HR'],count:2,total:3});assert.equal(favoriteModLabel(result),'HD / HR');
});
test('favorite mod supports No Mod, ties, and empty score selections',()=>{
 assert.equal(favoriteMod([]),null);assert.deepEqual(favoriteMod([{mods:[]},{mods:[]},{mods:['HD']}]),{mods:['NM'],count:2,total:3});assert.equal(favoriteModLabel(favoriteMod([{mods:[]}])), 'No Mod');
});
test('favorite mod uses deduplicated year-filtered scores beyond top 25',()=>{
 const score=(id,date,mods)=>({id,ended_at:date,mods,passed:true,pp:100-id,accuracy:1,max_combo:10});
 const scores=Array.from({length:30},(_,i)=>score(i,'2026-06-01T00:00:00Z',['HD']));scores.push(score(29,'2026-06-01T00:00:00Z',['HD']),score(99,'2025-06-01T00:00:00Z',['HR']));
 const result=summarize({id:1,username:'test'},scores,'osu');assert.equal(result.top.length,25);assert.deepEqual(result.favoriteMod,{mods:['HD'],count:30,total:30});
});

test('Classic is excluded and CL-only scores count as No Mod',()=>{assert.deepEqual(favoriteMod([{mods:['CL','HD']},{mods:[{acronym:'CL'},{acronym:'HD'}]}]),{mods:['HD'],count:2,total:2});assert.deepEqual(favoriteMod([{mods:['CL']},{mods:[{acronym:'CL'}]},{mods:[]}]),{mods:['NM'],count:3,total:3});});

test('favorite mod tooltip reports a percentage of the selected scores',()=>{assert.equal(favoriteModPercentage({count:23,total:29,mods:['HR']}),'79.31% of selected scores');assert.equal(favoriteModPercentage({count:2,total:3,mods:['HD','HR']}),'66.67% of selected scores per tied mod');assert.equal(favoriteModPercentage(null),'Percentage unavailable');});

test('personal mod rankings report counts, percentages and ties across the entire selected sample',()=>{const rows=modRankings([{mods:['HD','HR','HD','CL']},{mods:[{acronym:'HD'}]},{mods:['CL']},{mods:[]}]);assert.deepEqual(rows.map(r=>[r.mod,r.count,r.percentage,r.rank]),[['HD',2,50,1],['NM',2,50,1],['HR',1,25,3]]);assert.deepEqual(modRankings([]),[]);});
