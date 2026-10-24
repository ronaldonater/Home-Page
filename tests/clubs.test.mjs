import test from 'node:test';
import assert from 'node:assert/strict';
import {assignClub,CLUBS,clubMarkup,clubLegendMarkup} from '../osu-wrapped/src/clubs.js';
const scores=(mods,accuracy=.97)=>Array.from({length:20},(_,i)=>({mods:typeof mods==='function'?mods(i):mods,accuracy,passed:true,beatmapset:{user_id:i+1,creator:'Host '+i,artist:'Artist '+i}}));
const mixed=i=>[['HD'],['HR'],['DT'],['EZ'],['HT']][i%5];
test('clubs use percentage preferences, union mod families and exclude Classic',()=>{assert.equal(assignClub(scores(['DT','NC'])).id,'overdrive');assert.equal(assignClub(scores(['HD','FL'])).id,'afterdark');assert.equal(assignClub(scores(['HR'])).id,'hardmode');assert.equal(assignClub(scores(['CL'])).id,'nomod');assert.equal(assignClub(scores(i=>i<8?['DT']:['HT'])).id,'overdrive');});
test('accuracy clubs use mode-specific passed-score thresholds and optional precision traits',()=>{assert.equal(assignClub(scores(mixed,.995),'osu').id,'precision');assert.equal(assignClub(scores(mixed,.985),'mania').id,'precision');assert.notEqual(assignClub(scores(mixed,.99),'fruits').id,'precision');const fast=assignClub(scores(['DT'],.995));assert.equal(fast.id,'overdrive');assert.equal(fast.badge,'Precision-minded');assert.notEqual(assignClub(scores(['HR']),'mania').id,'hardmode');});
test('loyalist, wanderer and all-rounder clubs remain reachable without dominant mods',()=>{const loyal=scores(mixed);loyal.slice(0,8).forEach(s=>s.beatmapset.user_id=1);assert.equal(assignClub(loyal).id,'loyalist');assert.equal(assignClub(scores(mixed)).id,'wanderer');const varied=scores(mixed);varied.forEach((s,i)=>{s.beatmapset.user_id=i%8+1;s.beatmapset.artist='Artist '+i%8;});assert.equal(assignClub(varied).id,'allrounder');assert.equal(Object.keys(CLUBS).length,16);});
test('one score qualifies for a club, empty samples stay pending and explanations are escaped',()=>{assert.equal(assignClub([]),null);assert.equal(assignClub(scores(['DT']).slice(0,1)).id,'overdrive');assert.equal(assignClub(scores([]).slice(0,1)).id,'nomod');assert.ok(clubMarkup({club:null}).includes('At least one'));assert.ok(clubMarkup({club:{id:'overdrive',total:20,reason:'<script>bad</script>'}}).includes('&lt;script&gt;'));});

test('repeat offenders uses recorded yearly activity, requires six regular months and respects specialist priority',()=>{
 const months=Array.from({length:6},()=>({available:true,count:1700}));
 assert.equal(assignClub(scores(mixed),'osu',months).id,'repeat');
 assert.equal(assignClub(scores(mixed),'osu',months.slice(0,5)).id,'wanderer');
 assert.equal(assignClub(scores(mixed),'osu',months.map(m=>({...m,count:500}))).id,'wanderer');
 assert.equal(assignClub(scores(mixed),'osu',months.map(m=>({...m,available:false}))).id,'wanderer');
 assert.equal(assignClub(scores(['DT']),'osu',months).id,'overdrive');
 assert.equal(assignClub(scores(mixed,.995),'osu',months).id,'precision');
});

test('club legend includes all sixteen clubs and highlights the assigned club',()=>{const html=clubLegendMarkup({club:{id:'repeat'}});for(const club of Object.values(CLUBS))assert.ok(html.includes(club.name));assert.equal((html.match(/class="club-legend-card /g)||[]).length,16);assert.equal((html.match(/Your club<\/span>/g)||[]).length,1);const card=clubMarkup({club:{id:'repeat',total:20,reason:'Activity'}});assert.ok(card.includes('data-club-legend'));assert.ok(!card.includes('<details'));assert.ok(!clubMarkup({club:{id:'repeat',total:20,reason:'Activity'}},{story:true}).includes('data-club-legend'));});

test('EZ and safety clubs count score percentages, union SO/NF, and respect mode applicability',()=>{assert.equal(assignClub(scores(['EZ'])).id,'easy');assert.equal(assignClub(scores(i=>i<8?['EZ']:['HT'])).id,'easy');assert.notEqual(assignClub(scores(i=>i<7?['EZ']:['HT'])).id,'easy');assert.equal(assignClub(scores(['NF','SO'])).id,'safetynet');assert.equal(assignClub(scores(i=>i<10?['NF']:['HT'])).id,'safetynet');assert.notEqual(assignClub(scores(['SO']),'mania').id,'safetynet');assert.equal(assignClub(scores(['NF']),'mania').id,'safetynet');});
test('lower accuracy requires ten valid passed scores and mode-specific thresholds',()=>{assert.equal(assignClub(scores(mixed,.899)).id,'closeenough');assert.notEqual(assignClub(scores(mixed,.90)).id,'closeenough');assert.equal(assignClub(scores(mixed,.949),'fruits').id,'closeenough');assert.notEqual(assignClub(scores(mixed,.95),'fruits').id,'closeenough');assert.notEqual(assignClub(scores(mixed,.80).slice(0,9)).id,'closeenough');assert.notEqual(assignClub(scores(mixed,.80).map(s=>({...s,passed:false}))).id,'closeenough');assert.equal(assignClub(scores(['DT'],.80)).id,'overdrive');});

test('quality over quantity uses 1–99 known profile plays, with priority and no missing-history inference',()=>{const sample=scores(['DT']);for(const count of [1,50,99])assert.equal(assignClub(sample,'osu',[{available:true,count}]).id,'quality');for(const count of [0,100])assert.equal(assignClub(sample,'osu',[{available:true,count}]).id,'overdrive');assert.equal(assignClub(sample,'osu',[{available:false,count:50}]).id,'overdrive');assert.equal(assignClub(sample,'osu',[{available:true,count:NaN}]).id,'overdrive');assert.equal(assignClub(sample,'osu',[{available:true,count:60},{available:true,count:60}]).id,'overdrive');assert.equal(assignClub([], 'osu',[{available:true,count:50}]),null);});

const datedScores=year=>scores(['DT']).map((score,i)=>({...score,id:i+1,pp:200-i,beatmapset:{...score.beatmapset,id:i+1,ranked_date:year+'-01-01T00:00:00Z'}}));
test('map-age clubs use ranked year, top scores, real dates and minimum sample',()=>{
 assert.equal(assignClub(datedScores(2015)).id,'timecapsule');assert.equal(assignClub(datedScores(2026)).id,'class2026');assert.equal(assignClub(datedScores(2016)).id,'timecapsule');assert.equal(assignClub(datedScores(2017)).id,'overdrive');assert.equal(assignClub(datedScores(2026).slice(0,4)).id,'overdrive');assert.equal(assignClub(datedScores(2026).map(s=>({...s,beatmapset:{...s.beatmapset,ranked_date:null}}))).id,'overdrive');const rows=datedScores(2026);rows.slice(0,9).forEach(s=>s.beatmapset.ranked_date=null);assert.equal(assignClub(rows).id,'overdrive');assert.equal(assignClub(datedScores(2026),'osu',[{available:true,count:50}]).id,'quality');
});
test('crowd favorites matches mapset IDs and selected top-25 catalogue, with three unique sets',()=>{
 const rows=datedScores(2026),popularBeatmapsets=Array.from({length:8},(_,i)=>({id:i+1}));assert.equal(assignClub(rows,'osu',[],{popularBeatmapsets}).id,'crowdfavorites');assert.equal(assignClub(rows,'osu',[],{popularBeatmapsets:null}).id,'class2026');assert.equal(assignClub(rows.map(s=>({...s,beatmapset:{...s.beatmapset,id:1}})),'osu',[],{popularBeatmapsets}).id,'class2026');assert.equal(assignClub(rows,'osu',[],{popularBeatmapsets:[{id:100}]}).id,'class2026');
});

test('map preferences use the full eligible sample beyond score 25, including null-PP scores',()=>{
 const rows=Array.from({length:100},(_,i)=>({...datedScores(2026)[0],id:i+1,pp:i<25?1000-i:null,beatmapset:{id:i+1,ranked_date:(i<25?'2026':'2010')+'-01-01T00:00:00Z'}}));
 assert.equal(assignClub(rows).id,'timecapsule');assert.ok(assignClub(rows).reason.includes('75 of 100'));
 const reversed=rows.map((s,i)=>({...s,beatmapset:{...s.beatmapset,ranked_date:(i<25?'2010':'2026')+'-01-01T00:00:00Z'}}));assert.equal(assignClub(reversed).id,'class2026');
 const popular=Array.from({length:25},(_,i)=>({id:i+1}));const mixed=rows.map((s,i)=>({...s,beatmapset:{id:i<25?1000+i:(i%25)+1,ranked_date:'2020-01-01T00:00:00Z'}}));assert.equal(assignClub(mixed,'osu',[],{popularBeatmapsets:popular}).id,'crowdfavorites');assert.ok(assignClub(mixed,'osu',[],{popularBeatmapsets:popular}).reason.includes('75 of 100'));
});
