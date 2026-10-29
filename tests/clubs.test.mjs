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
const oneMap=()=>sample().map((row,i)=>({...row,beatmap:{id:i+1},beatmapset:{...row.beatmapset,id:1,user_id:1,artist:'Artist '+i}}));
const fixture={
 slowtempo:[sample(i=>i===19?[]:[i%2?'HT':'DC'])],
 moddedonly:[sample(i=>[['HD'],['HR'],['DT'],['EZ'],['HT']][i%5]).map(row=>({...row,beatmapset:{}}))],
 shortmaps:[sample(i=>i%2?[]:['HT']).map(row=>({...row,beatmap:{total_length:60}}))],longmaps:[sample(i=>i%2?[]:['HT']).map(row=>({...row,beatmap:{total_length:300}}))],
 onemap:[oneMap()],
 replay:[sample(['HT']),'osu',[],{replayViews:50000,replayMonths:6}],
 choke:[decorate(sample(['HT']),{statistics:{miss:1}})],
 oneshot:[sample(i=>i===19?[]:['PF'])],overdrive:[sample(i=>i===19?[]:['DT'])],hardmode:[sample(i=>i===19?[]:['HR'])],afterdark:[sample(i=>i===19?[]:['HD'])],nomod:[sample([])],easy:[sample(i=>i===19?[]:['EZ'])],safetynet:[sample(i=>i===19?[]:['NF'])],
 precision:[sample(mixed,1)],closeenough:[sample(mixed,.7)],repeat:[sample(),'osu',regular],quality:[sample(),'osu',Array.from({length:6},(_,i)=>({available:true,count:i===0?1:0}))],
 artistloyalist:[sample().map(row=>({...row,beatmapset:{...row.beatmapset,artist:"Favorite artist"}}))],loyalist:[loyal()],wanderer:[diverse()],timecapsule:[maps(2016)],class2026:[maps(2026)],crowdfavorites:[crowd(),'osu',[],{popularBeatmapsets:catalogue}],
 stable:[decorate(sample(['HT']),{legacy_score_id:123})],lazer:[decorate(sample(['HT']),{legacy_score_id:null,type:'solo_score',build_id:456})],allrounder:[sample()]
};
test('all twenty-seven clubs can be primary based on signal strength',()=>{assert.equal(Object.keys(CLUBS).length,27);for(const [id,args] of Object.entries(fixture)){const result=assignClub(...args);assert.equal(result.id,id,id);assert.ok(Number.isFinite(result.strength));assert.ok(!result.secondary||result.secondary.id!==id);}});
test('all twenty-seven clubs can also be secondary when a stronger signal qualifies',()=>{
 const cases={moddedonly:[sample(mixed,1).map(row=>({...row,beatmapset:{}}))],shortmaps:[sample(i=>i%2?[]:['HT'],1).map(row=>({...row,beatmap:{total_length:60}}))],longmaps:[sample(i=>i%2?[]:['HT'],1).map(row=>({...row,beatmap:{total_length:300}}))],onemap:[oneMap().map(row=>({...row,accuracy:1}))],replay:[sample(mixed,1),'osu',[],{replayViews:50000,replayMonths:6}],choke:[decorate(sample(['HT'],1),(row,i)=>({statistics:{miss:i<12?1:0}}))]};
 for(const [id,mod] of Object.entries({slowtempo:'HT',oneshot:'SD',overdrive:'DT',hardmode:'HR',afterdark:'HD',nomod:'NM',easy:'EZ',safetynet:'NF'}))cases[id]=[sample(i=>i<16?[mod]:[],1)];
 cases.precision=[maps(2016,.995)];cases.closeenough=[maps(2016,.85)];cases.repeat=[sample(mixed,1),'osu',regular];cases.quality=[sample(['MU']),'osu',[{available:true,count:50}]];
 cases.loyalist=[loyal().map(s=>({...s,accuracy:1}))];cases.wanderer=[diverse().map(s=>({...s,accuracy:1}))];cases.timecapsule=[maps(2016,1).map((row,i)=>i<14?row:{...row,beatmapset:{...row.beatmapset,ranked_date:"2020-01-01"}})];cases.class2026=[maps(2026,1).map((row,i)=>i<14?row:{...row,beatmapset:{...row.beatmapset,ranked_date:"2020-01-01"}})];cases.crowdfavorites=[crowd().map(s=>({...s,accuracy:1})),'osu',[],{popularBeatmapsets:catalogue}];
 cases.stable=[decorate(maps(2016).map(row=>({...row,mods:['HT']})),{legacy_score_id:123})];cases.lazer=[decorate(maps(2016).map(row=>({...row,mods:['HT']})),{legacy_score_id:null,type:'solo_score'})];cases.allrounder=[maps(2016)];
 for(const [id,args] of Object.entries(cases))assert.equal(assignClub(...args).secondary?.id,id,id);
});
test('mod preferences act as a low-weight supplemental signal',()=>{const result=assignClub(decorate(sample(['HR']),{legacy_score_id:123}),'osu',[{available:true,count:50}]);assert.equal(result.id,'stable');assert.equal(result.secondary.id,'moddedonly');assert.ok(result.matches.some(row=>row.id==='hardmode'));assert.ok(result.matches.some(row=>row.id==='quality'));});
test('thresholds, mode restrictions, CL exclusion, and one-score eligibility remain intact',()=>{
 assert.equal(assignClub([]),null);assert.ok(assignClub(sample(['CL']).slice(0,1)).matches.some(row=>row.id==='nomod'));assert.ok(clubMarkup({club:null}).includes('At least one'));
 assert.ok(!assignClub(sample(['HR']),'mania').matches.some(row=>row.id==='hardmode'));assert.ok(!assignClub(sample(['SO']),'mania').matches.some(row=>row.id==='safetynet'));
 assert.ok(!assignClub(sample(mixed,.80).slice(0,9)).matches.some(row=>row.id==='closeenough'));assert.ok(!assignClub(sample(mixed,.95),'fruits').matches.some(row=>row.id==='closeenough'));assert.ok(assignClub(sample(mixed,.949),'fruits').matches.some(row=>row.id==='closeenough'));
 assert.ok(!assignClub(sample(),'osu',[{available:false,count:50}]).matches.some(row=>row.id==='quality'));assert.ok(!assignClub(sample(),'osu',[{available:true,count:0}]).matches.some(row=>row.id==='quality'));
});
test('stronger shares win within and across families with deterministic ties',()=>{const rows=sample(i=>i<16?['HR','HD']:['HD']);const result=assignClub(rows);assert.equal(result.id,'moddedonly');assert.equal(result.secondary.id,'afterdark');assert.ok(result.matches.some(row=>row.id==='hardmode'));assert.deepEqual(result,assignClub(rows));assert.deepEqual(result.matches.map(r=>r.id),assignClub([...rows].reverse()).matches.map(r=>r.id));});
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
 for(const entry of Object.values(CLUBS))assert.ok(clubLegendMarkup(data).includes(entry.name));assert.equal(new Set(Object.values(CLUB_COLORS)).size,27);
});

test('mod strength is 40-55 and yields to stronger accuracy and map preferences',()=>{const modOnly=assignClub(sample(['HR']));assert.equal(modOnly.matches.find(row=>row.id==='hardmode').strength,55);const precise=assignClub(sample(['HR'],.995));assert.equal(precise.id,'precision');assert.equal(precise.secondary.id,'moddedonly');const oldMaps=assignClub(maps(2016).map(s=>({...s,mods:['HR']})));assert.equal(oldMaps.id,'timecapsule');assert.equal(oldMaps.secondary.id,'moddedonly');const minimum=assignClub(sample(i=>i<8?['HR']:['HT']));assert.equal(minimum.matches.find(row=>row.id==='hardmode').strength,40);});

test('both activity clubs share a 55-80 scale with unchanged qualification thresholds',()=>{const strength=(id,months)=>assignClub(sample(),'osu',months).matches.find(row=>row.id===id)?.baseStrength;assert.equal(strength('quality',[{available:true,count:99}]),55);assert.equal(strength('quality',[{available:true,count:1}]),80);assert.ok(strength('quality',[{available:true,count:50}])>55);assert.equal(strength('quality',[{available:true,count:100}]),undefined);const minimum=Array.from({length:6},(_,i)=>({available:true,count:i===0?7500:500}));assert.equal(strength('repeat',minimum),55);assert.equal(strength('repeat',regular),80);assert.equal(strength('repeat',minimum.slice(0,5)),undefined);});

test('small samples remain eligible but get reduced evidence weight and provisional messaging',()=>{
 const small=assignClub(sample(['HR']).slice(0,1)),large=assignClub(sample(['HR']));assert.equal(small.id,'moddedonly');assert.ok(small.strength<large.strength);assert.equal(large.strength,60);assert.equal(small.provisional,true);assert.equal(large.provisional,false);assert.ok(clubMarkup({club:small}).includes('Provisional'));assert.equal(small.evidenceCount,1);
});
test('mapper loyalty needs repeated evidence across multiple mapsets',()=>{
 assert.ok(!assignClub(loyal().slice(0,1)).matches.some(row=>row.id==='loyalist'));const oneMap=loyal().map(row=>({...row,beatmapset:{...row.beatmapset,id:1}}));assert.ok(!assignClub(oneMap).matches.some(row=>row.id==='loyalist'));assert.ok(assignClub(loyal()).matches.some(row=>row.id==='loyalist'));
});
test('balanced All-Rounder needs mod, artist, and mapper variety',()=>{
 assert.ok(assignClub(sample()).matches.some(row=>row.id==='allrounder'));const singleArtist=sample().map(row=>({...row,beatmapset:{...row.beatmapset,artist:'One artist'}}));const result=assignClub(singleArtist);assert.ok(!result.matches.some(row=>row.id==='allrounder'&&row.baseStrength>0));assert.equal(result.id,'artistloyalist');assert.equal(result.baseStrength,80);
});
test('accuracy uses passed-score evidence while activity uses available months',()=>{
 const rows=sample(mixed,1);rows.slice(10).forEach(row=>row.passed=false);const accuracy=assignClub(rows).matches.find(row=>row.id==='precision');assert.equal(accuracy.evidenceCount,10);assert.equal(accuracy.evidenceWeight,.75);const one=assignClub(sample(),'osu',[{available:true,count:50}]).matches.find(row=>row.id==='quality');const six=assignClub(sample(),'osu',Array.from({length:6},()=>({available:true,count:8}))).matches.find(row=>row.id==='quality');assert.ok(six.evidenceWeight>one.evidenceWeight);
});

test('legend match strength uses personal evidence-adjusted strength separately from community share',()=>{const club=assignClub(sample(['HR']));const html=clubLegendMarkup({club});assert.equal((html.match(/class="club-compatibility"/g)||[]).length,27);assert.ok(html.includes('Hardrock Headquarters match strength: 55.0'));assert.ok(html.includes('Lazer Pioneers match strength: 0.0'));assert.ok(clubLegendMarkup({}).includes('Hardrock Headquarters match strength: —'));assert.ok(html.includes('not a probability or community share'));});

test('balanced All-Rounder has a 60-80 base range while fallback stays zero',()=>{const result=assignClub(sample());assert.equal(result.id,'allrounder');assert.ok(result.baseStrength>=60&&result.baseStrength<=80);const unknown=sample().map(row=>({...row,mods:row.id%2?[]:['MU'],beatmapset:{}}));const fallback=assignClub(unknown);assert.equal(fallback.id,'allrounder');assert.equal(fallback.baseStrength,0);assert.equal(fallback.strength,0);});

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

test('playstyle legend uses CSP-safe color classes without inline style attributes',()=>{
 const html=clubLegendMarkup({});assert.doesNotMatch(html,/\sstyle=/);
 for(const id of Object.keys(CLUBS))assert.ok(html.includes('club-legend-card club-'+id+'"'));
});

test('artist loyalty needs matching credits across distinct mapsets and mirrors mapper strength',()=>{
 const rows=sample().map((row,i)=>({...row,beatmapset:{...row.beatmapset,artist:i<5?(i%2?' Favorite ARTIST ':'favorite artist'):'Other '+i}}));
 const match=assignClub(rows).matches.find(row=>row.id==='artistloyalist');assert.ok(match);assert.equal(match.baseStrength,55);
 assert.ok(!assignClub(rows.map(row=>({...row,beatmapset:{...row.beatmapset,id:1}}))).matches.some(row=>row.id==='artistloyalist'));
 assert.ok(!assignClub(rows.slice(0,2)).matches.some(row=>row.id==='artistloyalist'));
 assert.ok(!assignClub(rows.map(row=>({...row,beatmapset:{...row.beatmapset,artist:'  '}}))).matches.some(row=>row.id==='artistloyalist'));
});

test('both loyalty clubs use the same 55-80 base range',()=>{
 for(const [count,expected] of [[5,55],[20,80]]){
  const rows=sample().map((row,i)=>({...row,beatmapset:{...row.beatmapset,user_id:i<count?1:i+100,artist:i<count?'Favorite':'Other '+i}}));
  for(const id of ['loyalist','artistloyalist'])assert.equal(assignClub(rows).matches.find(row=>row.id===id)?.baseStrength,expected,id);
 }
});

test('legend lists every club once in general strength order without changing assignment order',()=>{
 const html=clubLegendMarkup({});const ids=[...html.matchAll(/class="club-legend-card club-([^" ]+)"/g)].map(match=>match[1]);
 assert.equal(ids.length,Object.keys(CLUBS).length);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(ids.slice(0,7),['timecapsule','class2026','crowdfavorites','choke','precision','closeenough','wanderer']);
 assert.ok(ids.indexOf('artistloyalist')<ids.indexOf('overdrive'));assert.equal(Object.keys(CLUBS)[0],'overdrive');assert.equal(ids.at(-1),'allrounder');
});

test('One-Map Wonders requires a quarter of scores and three confirmed distinct difficulties',()=>{
 const rows=sample().map((row,i)=>({...row,beatmap:{id:i+1},beatmapset:{...row.beatmapset,id:i<5?99:i+100}}));
 const find=rows=>assignClub(rows).matches.find(row=>row.id==='onemap');
 assert.equal(find(rows)?.baseStrength,55);assert.equal(find(oneMap())?.baseStrength,80);
 assert.ok(!find(rows.map((row,i)=>({...row,beatmap:{id:i<5?1:i+1}}))));
 assert.ok(!find(rows.map(row=>({...row,beatmap:undefined}))));
 assert.ok(!find(rows.map((row,i)=>({...row,beatmapset:{...row.beatmapset,id:i<4?99:i+100}}))));
 assert.ok(find(rows.map(row=>({...row,beatmap_id:row.beatmap.id,beatmap:{beatmapset_id:row.beatmapset.id},beatmapset:{...row.beatmapset,id:undefined}}))));
});

test('length clubs use inclusive mod-adjusted durations, full-sample shares, and five-score minimum',()=>{
 const result=(lengths,mods=[])=>assignClub(lengths.map((length,i)=>({...sample()[i],mods,beatmap:{total_length:length}}))).matches;
 const match=(lengths,id,mods)=>result(lengths,mods).find(row=>row.id===id);
 assert.equal(match([90,90,90,180,180],'shortmaps')?.baseStrength,55);
 assert.equal(match([210,210,210,180,180],'longmaps')?.baseStrength,55);
 assert.equal(match(Array(20).fill(90),'shortmaps')?.baseStrength,80);
 assert.equal(match(Array(20).fill(600),'longmaps')?.baseStrength,80);
 assert.ok(!match([90,90,90,90],'shortmaps'));assert.ok(!match([210,210,210,210],'longmaps'));
 assert.ok(!match([90,90,null,undefined,NaN],'shortmaps'));
 assert.ok(!match([210,210,Infinity,undefined,null],'longmaps'));
 assert.ok(!match(Array(5).fill(91),'shortmaps'));assert.ok(!match(Array(5).fill(209),'longmaps'));
 assert.ok(!match(Array(5).fill(0),'shortmaps'));assert.ok(!match(Array(5).fill('90'),'shortmaps'));
 assert.ok(!match(Array(5).fill(90),'shortmaps',['HT']));assert.ok(!match(Array(5).fill(210),'longmaps',['DT']));
 assert.ok(match(Array(5).fill(135),'shortmaps',['DT']));assert.ok(match(Array(5).fill(135),'shortmaps',['NC']));
 assert.ok(match(Array(5).fill(157.5),'longmaps',['HT']));assert.ok(match(Array(5).fill(157.5),'longmaps',['DC']));
 assert.ok(match(Array(5).fill(180),'shortmaps',[{acronym:'DT',settings:{speed_change:2}}]));
 assert.ok(!match(Array(5).fill(90),'shortmaps',['WU']));assert.ok(!match(Array(5).fill(300),'longmaps',['WD']));
 assert.ok(!match(Array(5).fill(90),'shortmaps',['UNKNOWN']));
});

test('Modded Only requires zero unmodified scores and respects CL-only and NM scores',()=>{
 const match=rows=>assignClub(rows)?.matches.find(row=>row.id==='moddedonly');
 const rows=sample(i=>i%2?['HR']:['HD']);assert.equal(match(rows)?.baseStrength,60);assert.ok(match(rows.slice(0,1)));
 for(const mods of [[],['CL'],['NM'],['CL','NM']])assert.ok(!match(rows.map((row,i)=>i===0?{...row,mods}:row)));
 assert.ok(match(rows.map(row=>({...row,mods:['CL','HD']}))));
});

test('accuracy clubs use 65-90 base strengths with unchanged thresholds',()=>{
 const strength=(accuracy,id)=>assignClub(sample(mixed,accuracy)).matches.find(row=>row.id===id)?.baseStrength;
 assert.equal(strength(.99,'precision'),65);assert.equal(strength(1,'precision'),90);
 assert.equal(strength(.75,'closeenough'),90);assert.equal(strength(.90,'closeenough'),undefined);
 assert.ok(strength(.899,'closeenough')>65);assert.ok(strength(.899,'closeenough')<66);
 assert.equal(strength(.989,'precision'),undefined);
});

test('Choke Artists scales from 70 to 95 with unchanged qualification requirements',()=>{
 const match=count=>assignClub(sample().map((row,i)=>({...row,statistics:{miss:i<count?1:0}}))).matches.find(row=>row.id==='choke');
 assert.equal(match(6)?.baseStrength,70);assert.equal(match(20)?.baseStrength,95);assert.equal(match(5),undefined);
});

test('Afterdark includes Fade In only in mania and combines qualifying mods once per score',()=>{
 const rows=sample(i=>i<5?['FI','HD']:i<10?['FI']:['HT']);
 const mania=assignClub(rows,'mania');const afterdark=mania.matches.find(row=>row.id==='afterdark');assert.ok(afterdark);assert.match(afterdark.reason,/10 of 20/);assert.match(afterdark.reason,/FI/);
 assert.ok(!assignClub(rows,'osu').matches.some(row=>row.id==='afterdark'));
 assert.ok(!assignClub(sample(i=>i<9?['FI']:['HT']),'mania').matches.some(row=>row.id==='afterdark'));
 assert.ok(assignClub(sample(['FI']),'mania').matches.some(row=>row.id==='afterdark'));
});

test('One Shot Society includes Accuracy Challenge across modes without double-counting',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){
  const rows=sample(i=>i<4?['AC','SD']:i<8?['AC']:['HT']);const result=assignClub(rows,mode);const match=result.matches.find(row=>row.id==='oneshot');assert.ok(match);assert.match(match.reason,/8 of 20/);assert.match(match.reason,/AC/);
  assert.ok(!assignClub(sample(i=>i<7?['AC']:['HT']),mode).matches.some(row=>row.id==='oneshot'));
 }
});

test('Easy Tempo combines HT and DC once per score at a 40 percent threshold',()=>{
 const rows=sample(i=>i<4?['HT','DC']:i<8?['DC']:[]);const match=assignClub(rows).matches.find(row=>row.id==='slowtempo');assert.ok(match);assert.equal(match.baseStrength,40);assert.match(match.reason,/8 of 20/);
 assert.ok(!assignClub(sample(i=>i<7?['HT']:[])).matches.some(row=>row.id==='slowtempo'));
 assert.equal(assignClub(sample(['DC'])).matches.find(row=>row.id==='slowtempo').baseStrength,55);
});

test('Afterdark includes mania Cover with the existing threshold and no double-counting',()=>{
 const rows=sample(i=>i<5?['CO','FI']:i<10?['CO']:[]);const match=assignClub(rows,'mania').matches.find(row=>row.id==='afterdark');assert.ok(match);assert.match(match.reason,/10 of 20/);assert.match(match.reason,/CO/);assert.equal(match.baseStrength,40);
 assert.ok(!assignClub(rows,'osu').matches.some(row=>row.id==='afterdark'));
 assert.ok(!assignClub(sample(i=>i<9?['CO']:[]),'mania').matches.some(row=>row.id==='afterdark'));
});
