import test from 'node:test';
import assert from 'node:assert/strict';
import {assignClub,isChokeScore,scoreClient,CLUBS,CLUB_COLORS,clubMarkup,clubLegendMarkup} from '../osu-wrapped/src/clubs.js';
const mixed=i=>[['HD'],['HR'],['DT'],['EZ'],['HT']][i%5];
const sample=(mods=mixed,accuracy=.97)=>Array.from({length:20},(_,i)=>({id:i+1,mods:typeof mods==='function'?mods(i):mods,accuracy,passed:true,pp:200-i,beatmapset:{id:i+1,user_id:i%8+1,artist:'Artist '+(i%8)}}));
const decorate=(rows,extra)=>rows.map((row,i)=>({...row,...(typeof extra==='function'?extra(row,i):extra)}));
const maps=(year,accuracy=.97)=>sample(mixed,accuracy).map((s,i)=>({...s,beatmapset:{...s.beatmapset,ranked_date:year+'-01-01T00:00:00Z'}}));
const diverse=()=>sample().map((s,i)=>({...s,beatmapset:{...s.beatmapset,user_id:i+1,artist:'Artist '+i}}));
const loyal=()=>sample().map(s=>({...s,beatmapset:{...s.beatmapset,user_id:1}}));
const regular=Array.from({length:12},()=>({available:true,count:5000}));
const crowd=()=>maps(2026).map((s,i)=>i<16?s:{...s,beatmapset:{...s.beatmapset,ranked_date:'2020-01-01T00:00:00Z'}});
const catalogue=Array.from({length:16},(_,i)=>({id:i+1}));
const fixture={
 replay:[sample(['HT']),'osu',[],{replayViews:50000,replayMonths:6}],
 choke:[decorate(sample(['HT']),{statistics:{miss:1}})],
 oneshot:[sample(['PF'])],overdrive:[sample(['DT'])],hardmode:[sample(['HR'])],afterdark:[sample(['HD'])],nomod:[sample([])],easy:[sample(['EZ'])],safetynet:[sample(['NF'])],
 precision:[sample(mixed,1)],closeenough:[sample(mixed,.7)],repeat:[sample(),'osu',regular],quality:[sample(),'osu',Array.from({length:6},(_,i)=>({available:true,count:i===0?1:0}))],
 loyalist:[loyal()],wanderer:[diverse()],timecapsule:[maps(2016)],class2026:[maps(2026)],crowdfavorites:[crowd(),'osu',[],{popularBeatmapsets:catalogue}],
 stable:[decorate(sample(['HT']),{legacy_score_id:123})],lazer:[decorate(sample(['HT']),{legacy_score_id:null,type:'solo_score',build_id:456})],allrounder:[sample()]
};
test('all twenty-one clubs can be primary based on signal strength',()=>{assert.equal(Object.keys(CLUBS).length,21);for(const [id,args] of Object.entries(fixture)){const result=assignClub(...args);assert.equal(result.id,id,id);assert.ok(Number.isFinite(result.strength));assert.ok(!result.secondary||result.secondary.id!==id);}});
test('all twenty-one clubs can also be secondary when a stronger signal qualifies',()=>{
 const cases={replay:[sample(mixed,1),'osu',[],{replayViews:50000,replayMonths:6}],choke:[decorate(sample(['HT'],1),{statistics:{miss:1}})]};
 for(const [id,mod] of Object.entries({oneshot:'SD',overdrive:'DT',hardmode:'HR',afterdark:'HD',nomod:'NM',easy:'EZ',safetynet:'NF'}))cases[id]=[sample(i=>i<16?[mod]:['HT'],1)];
 cases.precision=[maps(2016,.99)];cases.closeenough=[maps(2016,.89)];cases.repeat=[sample(mixed,1),'osu',regular];cases.quality=[sample(['DT']),'osu',[{available:true,count:50}]];
 cases.loyalist=[loyal().map(s=>({...s,accuracy:1}))];cases.wanderer=[diverse().map(s=>({...s,accuracy:1}))];cases.timecapsule=[maps(2016,1)];cases.class2026=[maps(2026,1)];cases.crowdfavorites=[crowd().map(s=>({...s,accuracy:1})),'osu',[],{popularBeatmapsets:catalogue}];
 cases.stable=[decorate(maps(2016).map(row=>({...row,mods:['HT']})),{legacy_score_id:123})];cases.lazer=[decorate(maps(2016).map(row=>({...row,mods:['HT']})),{legacy_score_id:null,type:'solo_score'})];cases.allrounder=[maps(2016)];
 for(const [id,args] of Object.entries(cases))assert.equal(assignClub(...args).secondary?.id,id,id);
});
test('mod preferences act as a low-weight supplemental signal',()=>{const result=assignClub(decorate(sample(['HR']),{legacy_score_id:123}),'osu',[{available:true,count:50}]);assert.equal(result.id,'stable');assert.equal(result.secondary.id,'hardmode');assert.ok(result.matches.some(row=>row.id==='quality'));});
test('thresholds, mode restrictions, CL exclusion, and one-score eligibility remain intact',()=>{
 assert.equal(assignClub([]),null);assert.ok(assignClub(sample(['CL']).slice(0,1)).matches.some(row=>row.id==='nomod'));assert.ok(clubMarkup({club:null}).includes('At least one'));
 assert.ok(!assignClub(sample(['HR']),'mania').matches.some(row=>row.id==='hardmode'));assert.ok(!assignClub(sample(['SO']),'mania').matches.some(row=>row.id==='safetynet'));
 assert.ok(!assignClub(sample(mixed,.80).slice(0,9)).matches.some(row=>row.id==='closeenough'));assert.ok(!assignClub(sample(mixed,.95),'fruits').matches.some(row=>row.id==='closeenough'));assert.ok(assignClub(sample(mixed,.949),'fruits').matches.some(row=>row.id==='closeenough'));
 assert.ok(!assignClub(sample(),'osu',[{available:false,count:50}]).matches.some(row=>row.id==='quality'));assert.ok(!assignClub(sample(),'osu',[{available:true,count:0}]).matches.some(row=>row.id==='quality'));
});
test('stronger shares win within and across families with deterministic ties',()=>{const rows=sample(i=>i<16?['HR','HD']:['HD']);const result=assignClub(rows);assert.equal(result.id,'afterdark');assert.equal(result.secondary.id,'hardmode');assert.deepEqual(result,assignClub(rows));assert.deepEqual(result.matches.map(r=>r.id),assignClub([...rows].reverse()).matches.map(r=>r.id));});
test('map matches use all eligible scores and do not infer missing dates or popularity',()=>{
 const rows=Array.from({length:100},(_,i)=>({...sample()[0],id:i+1,pp:i<25?1000-i:null,beatmapset:{id:i+1,ranked_date:(i<25?'2026':'2010')+'-01-01T00:00:00Z'}}));const result=assignClub(rows);assert.ok(result.matches.find(r=>r.id==='timecapsule').reason.includes('75 of 100'));
 assert.ok(!assignClub(maps(2017)).matches.some(r=>r.id==='timecapsule'));assert.ok(!assignClub(maps(2026).slice(0,4)).matches.some(r=>r.id==='class2026'));assert.ok(!assignClub(sample()).matches.some(r=>r.id==='class2026'||r.id==='crowdfavorites'));
 const duplicate=maps(2026).map(s=>({...s,beatmapset:{...s.beatmapset,id:1}}));assert.ok(!assignClub(duplicate,'osu',[],{popularBeatmapsets:catalogue}).matches.some(r=>r.id==='crowdfavorites'));
});
test('client matching requires confirmed metadata and rejects mixed or unknown samples',()=>{
 assert.equal(scoreClient({mods:['CL']}),null);assert.equal(scoreClient({legacy_score_id:null}),null);assert.equal(scoreClient({legacy_score_id:123}),'stable');assert.equal(scoreClient({legacy_score_id:null,type:'solo_score'}),'lazer');
 const rows=decorate(sample(),{legacy_score_id:123});delete rows[0].legacy_score_id;assert.ok(!assignClub(rows).matches.some(r=>r.id==='stable'));
});
test('generic secondary is rendered with its own identity, escaped reason and legend role',()=>{
 const club=assignClub(decorate(maps(2016).map(row=>({...row,mods:['HT']})),{legacy_score_id:123}));club.secondary.reason='<script>bad</script>';const data={club};const html=clubMarkup(data);assert.ok(html.includes('SECONDARY ARCHETYPE'));assert.ok(html.includes('Stable Loyalists'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(clubLegendMarkup(data).includes('>Secondary</span>'));
 for(const entry of Object.values(CLUBS))assert.ok(clubLegendMarkup(data).includes(entry.name));assert.equal(new Set(Object.values(CLUB_COLORS)).size,21);
});

test('mod strength is 40-55 and yields to stronger accuracy and map preferences',()=>{const modOnly=assignClub(sample(['HR']));assert.equal(modOnly.strength,55);const precise=assignClub(sample(['HR'],.995));assert.equal(precise.id,'precision');assert.equal(precise.secondary.id,'hardmode');const oldMaps=assignClub(maps(2016).map(s=>({...s,mods:['HR']})));assert.equal(oldMaps.id,'timecapsule');assert.equal(oldMaps.secondary.id,'hardmode');const minimum=assignClub(sample(i=>i<8?['HR']:['HT']));assert.equal(minimum.matches.find(row=>row.id==='hardmode').strength,40);});

test('both activity clubs share a 55-80 scale with unchanged qualification thresholds',()=>{const strength=(id,months)=>assignClub(sample(),'osu',months).matches.find(row=>row.id===id)?.baseStrength;assert.equal(strength('quality',[{available:true,count:99}]),55);assert.equal(strength('quality',[{available:true,count:1}]),80);assert.ok(strength('quality',[{available:true,count:50}])>55);assert.equal(strength('quality',[{available:true,count:100}]),undefined);const minimum=Array.from({length:6},(_,i)=>({available:true,count:i===0?7500:500}));assert.equal(strength('repeat',minimum),55);assert.equal(strength('repeat',regular),80);assert.equal(strength('repeat',minimum.slice(0,5)),undefined);});

test('small samples remain eligible but get reduced evidence weight and provisional messaging',()=>{
 const small=assignClub(sample(['HR']).slice(0,1)),large=assignClub(sample(['HR']));assert.equal(small.id,'hardmode');assert.ok(small.strength<large.strength);assert.equal(large.strength,55);assert.equal(small.provisional,true);assert.equal(large.provisional,false);assert.ok(clubMarkup({club:small}).includes('Provisional'));assert.equal(small.evidenceCount,1);
});
test('mapper loyalty needs repeated evidence across multiple mapsets',()=>{
 assert.ok(!assignClub(loyal().slice(0,1)).matches.some(row=>row.id==='loyalist'));const oneMap=loyal().map(row=>({...row,beatmapset:{...row.beatmapset,id:1}}));assert.ok(!assignClub(oneMap).matches.some(row=>row.id==='loyalist'));assert.ok(assignClub(loyal()).matches.some(row=>row.id==='loyalist'));
});
test('balanced All-Rounder needs mod, artist, and mapper variety',()=>{
 assert.ok(assignClub(sample()).matches.some(row=>row.id==='allrounder'));const singleArtist=sample().map(row=>({...row,beatmapset:{...row.beatmapset,artist:'One artist'}}));const result=assignClub(singleArtist);assert.ok(!result.matches.some(row=>row.id==='allrounder'&&row.baseStrength>0));assert.equal(result.id,'allrounder');assert.equal(result.baseStrength,0);
});
test('accuracy uses passed-score evidence while activity uses available months',()=>{
 const rows=sample(mixed,1);rows.slice(10).forEach(row=>row.passed=false);const accuracy=assignClub(rows).matches.find(row=>row.id==='precision');assert.equal(accuracy.evidenceCount,10);assert.equal(accuracy.evidenceWeight,.75);const one=assignClub(sample(),'osu',[{available:true,count:50}]).matches.find(row=>row.id==='quality');const six=assignClub(sample(),'osu',Array.from({length:6},()=>({available:true,count:8}))).matches.find(row=>row.id==='quality');assert.ok(six.evidenceWeight>one.evidenceWeight);
});

test('legend match strength uses personal evidence-adjusted strength separately from community share',()=>{const club=assignClub(sample(['HR']));const html=clubLegendMarkup({club});assert.equal((html.match(/class="club-compatibility"/g)||[]).length,21);assert.ok(html.includes('HR Headquarters match strength: 55.0'));assert.ok(html.includes('Lazer Pioneers match strength: 0.0'));assert.ok(clubLegendMarkup({}).includes('HR Headquarters match strength: —'));assert.ok(html.includes('not a probability or community share'));});

test('balanced All-Rounder has a 60-80 base range while fallback stays zero',()=>{const result=assignClub(sample());assert.equal(result.id,'allrounder');assert.ok(result.baseStrength>=60&&result.baseStrength<=80);const unknown=sample().map(row=>({...row,mods:['HT'],beatmapset:{}}));const fallback=assignClub(unknown);assert.equal(fallback.id,'allrounder');assert.equal(fallback.baseStrength,0);assert.equal(fallback.strength,0);});

test('SD and PF share one signal with a 40 percent threshold',()=>{
 for(const mods of [['SD'],['PF'],['SD','PF'],[{acronym:'PF'}]]){
 const result=assignClub(sample(i=>i<8?mods:['HT']));
 const match=result.matches.find(row=>row.id==='oneshot');assert.ok(match);assert.equal(match.baseStrength,40);assert.ok(match.reason.startsWith('8 of 20'));
 }
 assert.ok(!assignClub(sample(i=>i<7?['SD']:['HT'])).matches.some(row=>row.id==='oneshot'));
});

test('choke evidence uses actual misses and reported slider breaks without combo inference',()=>{
 assert.ok(isChokeScore({passed:true,statistics:{miss:1}},'mania'));
 assert.ok(isChokeScore({passed:true,statistics:{count_miss:1}}));
 assert.ok(isChokeScore({passed:true,statistics:{miss:0,large_tick_miss:1}}));
 assert.ok(isChokeScore({passed:true,statistics:{miss:0,combo_break:1}}));
 for(const row of [{passed:false,statistics:{miss:1}},{passed:true,statistics:{miss:0},max_combo:100},{passed:true,statistics:{miss:0,large_tick_miss:2}},{passed:true,statistics:{}},{passed:true,statistics:{miss:0,small_tick_miss:1}}])assert.equal(isChokeScore(row),false);
 assert.equal(isChokeScore({passed:true,statistics:{miss:0,large_tick_miss:1}},'mania'),false);
 const enough=decorate(sample(['HT']).slice(0,10),(_,i)=>({statistics:{miss:i<3?1:0}}));assert.ok(assignClub(enough).matches.some(row=>row.id==='choke'));
 assert.ok(!assignClub(enough.slice(0,4)).matches.some(row=>row.id==='choke'));
});

test('Replay Society uses received views and logarithmic activity strength with valid evidence',()=>{
 const signal=(views,months=6)=>assignClub(sample(['HT']),'osu',[],{replayViews:views,replayMonths:months}).matches.find(c=>c.id==='replay');
 assert.equal(signal(499),undefined);assert.equal(signal(null),undefined);assert.equal(signal(-1),undefined);assert.equal(signal(500,0),undefined);
 assert.equal(signal(500).baseStrength,55);assert.equal(signal(5000).baseStrength,67.5);assert.equal(signal(50000).baseStrength,80);assert.equal(signal(500000).baseStrength,80);
 assert.ok(signal(500,1).strength<signal(500,6).strength);assert.equal(signal(500,6).evidenceCount,6);
});
