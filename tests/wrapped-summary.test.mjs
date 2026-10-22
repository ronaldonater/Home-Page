import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize,inYear,formatMods} from '../osu-wrapped/src/summary.js';
import {seal,unseal} from '../netlify/functions/wrapped/security.mjs';
const score=(id,date,pp=100)=>({id,ended_at:date,pp,accuracy:.98,max_combo:400,passed:true,beatmapset:{creator:'Mapper',artist:'Artist'}});
test('year uses UTC boundaries',()=>{assert.equal(inYear('2025-12-31T23:59:59Z'),false);assert.equal(inYear('2026-01-01T00:00:00Z'),true);assert.equal(inYear('2027-01-01T00:00:00Z'),false);});
test('filters years, deduplicates best scores, excludes failures from PP and accuracy',()=>{const s=score(1,'2026-02-03T00:00:00Z');const fail={...score(2,s.ended_at,900),passed:false,accuracy:.1};const r=summarize({monthly_playcounts:[{start_date:'2025-01-01',count:999},{start_date:'2026-01-01',count:10}],user_achievements:[{achieved_at:s.ended_at}]},[s,score(3,'2025-01-01'),s,fail],'osu');assert.equal(r.sampleCount,2);assert.equal(r.accuracy,98);assert.equal(r.top.length,1);assert.equal(r.top[0].pp,100);assert.equal(r.playcount,10);assert.equal(r.medals,1);assert.equal(r.mappers[0].count,2);assert.equal(r.replayViews,null);});
test('empty score data is unavailable, not fabricated zero',()=>{const r=summarize({},[],'mania');assert.equal(r.accuracy,null);assert.equal(r.combo,null);assert.equal(r.playcount,null);assert.deepEqual(r.top,[]);});
test('sessions reject tampering and expiry',()=>{process.env.WRAPPED_SESSION_SECRET='test-secret-32-characters-long-enough';const token=seal({token:'private',exp:Date.now()+60000});assert.equal(unseal(token).token,'private');assert.equal(unseal(token.slice(0,-5)+'abcde'),null);assert.equal(unseal(seal({exp:Date.now()-1})),null);});


test('all score rankings use 2026 best scores beyond the first page',()=>{
 const best=Array.from({length:200},(_,i)=>score(i+1,i<100?'2025-06-01T00:00:00Z':'2026-06-01T00:00:00Z',500-i));
 const r=summarize({},best,'osu');
 assert.equal(r.top.length,25);assert.equal(r.top[0].id,101);assert.equal(r.top[0].pp,400);assert.ok(!r.top.some(s=>s.id===999));assert.equal(r.sampleCount,100);assert.equal(r.mappers[0].count,100);assert.equal(r.artists[0].count,100);
});

test('HD precedes HR with comma-separated mods without mutating input',()=>{
 const mods=[{acronym:'HR'},{acronym:'DT'},{acronym:'HD'}];
 assert.equal(formatMods(mods),'HD, HR, DT');
 assert.equal(mods[0].acronym,'HR');
 assert.equal(formatMods(['HD','HR']),'HD, HR');
 assert.equal(formatMods(['DT','HR']),'DT, HR');
 assert.equal(formatMods([]),'NM');
});

test('aggregation includes the two-hundredth best score when set in 2026',()=>{
 const best=Array.from({length:200},(_,i)=>score(i+1,i===199?'2026-10-01T00:00:00Z':'2025-06-01T00:00:00Z',1001-i));
 const result=summarize({},best,'osu');
 assert.equal(result.sampleCount,1);assert.equal(result.top[0].id,200);assert.equal(result.mappers[0].count,1);assert.equal(result.artists[0].count,1);
});

test('highest combo links to its source score even outside top 25 PP plays',()=>{
 const best=Array.from({length:30},(_,i)=>({...score(i+1,'2026-06-01T00:00:00Z',300-i),max_combo:i===29?2000:400}));
 const result=summarize({},best,'osu');assert.equal(result.combo,2000);assert.equal(result.comboScoreId,30);assert.ok(!result.top.some(s=>s.id===30));assert.equal(summarize({},[],'osu').comboScoreId,null);
});
