import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from '../osu-wrapped/src/summary.js';
const score={id:1,ended_at:'2026-01-01',passed:true,accuracy:.97,mods:['HT'],pp:100};
test('replay club sums only valid 2026 rows and uses distinct observed months',()=>{
 const data=summarize({id:1,username:'Test',replays_watched_counts:[{start_date:'2026-01-01',count:500},{start_date:'2025-01-01',count:99999},{start_date:'2026-02-01',count:-1},{start_date:'2026-03-01',count:'9999'}]},[score],'osu');
 assert.equal(data.replayViews,500);assert.equal(data.club.id,'replay');assert.equal(data.club.evidenceCount,1);
 assert.equal(summarize({id:1,username:'Test'},[score],'osu').club.matches.some(c=>c.id==='replay'),false);
 assert.equal(summarize({id:1,username:'Test',replays_watched_counts:[{start_date:'2026-01-01',count:50000}]},[],'osu').club,null);
});
