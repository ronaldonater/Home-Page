import test from 'node:test';
import assert from 'node:assert/strict';
import {assignClub,CLUBS,clubMarkup,clubLegendMarkup} from '../osu-wrapped/src/clubs.js';
const scores=(mods,accuracy=.97)=>Array.from({length:20},(_,i)=>({mods:typeof mods==='function'?mods(i):mods,accuracy,passed:true,beatmapset:{user_id:i+1,creator:'Host '+i,artist:'Artist '+i}}));
const mixed=i=>[['HD'],['HR'],['DT'],['EZ'],['HT']][i%5];
test('clubs use percentage preferences, union mod families and exclude Classic',()=>{assert.equal(assignClub(scores(['DT','NC'])).id,'overdrive');assert.equal(assignClub(scores(['HD','FL'])).id,'afterdark');assert.equal(assignClub(scores(['HR'])).id,'hardmode');assert.equal(assignClub(scores(['CL'])).id,'nomod');assert.equal(assignClub(scores(i=>i<8?['DT']:['EZ'])).id,'overdrive');});
test('accuracy clubs use mode-specific passed-score thresholds and optional precision traits',()=>{assert.equal(assignClub(scores(mixed,.995),'osu').id,'precision');assert.equal(assignClub(scores(mixed,.985),'mania').id,'precision');assert.notEqual(assignClub(scores(mixed,.99),'fruits').id,'precision');const fast=assignClub(scores(['DT'],.995));assert.equal(fast.id,'overdrive');assert.equal(fast.badge,'Precision-minded');assert.notEqual(assignClub(scores(['HR']),'mania').id,'hardmode');});
test('loyalist, wanderer and all-rounder clubs remain reachable without dominant mods',()=>{const loyal=scores(mixed);loyal.slice(0,8).forEach(s=>s.beatmapset.user_id=1);assert.equal(assignClub(loyal).id,'loyalist');assert.equal(assignClub(scores(mixed)).id,'wanderer');const varied=scores(mixed);varied.forEach((s,i)=>{s.beatmapset.user_id=i%8+1;s.beatmapset.artist='Artist '+i%8;});assert.equal(assignClub(varied).id,'allrounder');assert.equal(Object.keys(CLUBS).length,9);});
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

test('club legend includes all nine clubs and highlights the assigned club',()=>{const html=clubLegendMarkup({club:{id:'repeat'}});for(const club of Object.values(CLUBS))assert.ok(html.includes(club.name));assert.equal((html.match(/class="club-legend-card /g)||[]).length,9);assert.equal((html.match(/Your club<\/span>/g)||[]).length,1);const card=clubMarkup({club:{id:'repeat',total:20,reason:'Activity'}});assert.ok(card.includes('data-club-legend'));assert.ok(!card.includes('<details'));assert.ok(!clubMarkup({club:{id:'repeat',total:20,reason:'Activity'}},{story:true}).includes('data-club-legend'));});
