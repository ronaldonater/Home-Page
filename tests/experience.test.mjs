import test from 'node:test';
import assert from 'node:assert/strict';
import {usesOpeningMusic,canViewWrapped,openExperience,experienceSlides,experienceKey,firstExperience,markExperience,quizOptions} from '../osu-wrapped/src/experience.js';
import {demo} from '../osu-wrapped/src/demo.js';
const player=id=>({...demo(),demo:false,user:{...demo().user,id,username:'<script>alert(1)</script>'}});
test('story has thirty slides with two interactive quizzes and escapes user-supplied names',()=>{
 const slides=experienceSlides(player(101));assert.equal(slides.length,30);assert.ok(slides.findIndex(s=>s.layout==='beatmap-averages')<slides.findIndex(s=>s.layout==='personal-mods'));assert.ok(slides.find(s=>s.layout==='beatmap-averages').body.includes('Mod-adjusted'));assert.equal(slides.filter(s=>s.quiz).length,2);assert.ok(slides.filter(s=>!s.quiz).every(s=>s.duration>=5000));assert.ok(!slides[0].title.includes('<script>'));assert.ok(slides[0].title.includes('&lt;script&gt;'));assert.ok(slides.some(s=>s.note.includes('top 200')));
});
test('first experience is recorded per account and year, not repeated on another mode',()=>{
 const values=new Map();const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 const data=player(102);assert.equal(firstExperience(data,storage),true);markExperience(data,storage);assert.equal(firstExperience(data,storage),false);assert.equal(firstExperience({...data,mode:'mania'},storage),false);assert.equal(values.get(experienceKey(data)),'seen');assert.equal(firstExperience({...data,year:2027},storage),true);assert.equal(firstExperience(player(103),storage),true);
});
test('demo never consumes first-sign-in state and blocked storage still works in-memory',()=>{
 const storage={getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}};
 assert.equal(firstExperience(demo(),storage),false);
 const data=player(104);assert.equal(firstExperience(data,storage),true);markExperience(data,storage);assert.equal(firstExperience(data,storage),false);
});
test('story handles missing score and profile history without invented results',()=>{
 const data=player(105);data.top=[];data.mappers=[];data.artists=[];data.months=[];data.accuracy=null;data.combo=null;data.playcount=null;
 const slides=experienceSlides(data);assert.ok(slides.find(s=>s.eyebrow==='THE ONE TO REMEMBER').body.includes('No 2026 PP scores'));assert.ok(slides.find(s=>s.title==='Your mappers.').body.includes('No mapper'));assert.ok(!slides.some(s=>s.body.includes('NaN')));
});

test('quiz choices include a winner, stay unique, and use at most four real entries',()=>{
 const rows=[{name:'Top',count:9},...Array.from({length:7},(_,i)=>({name:'Other '+i,count:7-i}))];
 const choices=quizOptions(rows,()=>.3);assert.equal(choices.length,4);assert.ok(choices.some(r=>r.name==='Top'));assert.equal(new Set(choices.map(r=>r.name)).size,4);assert.ok(choices.every(r=>rows.some(source=>source.name===r.name)));assert.deepEqual(quizOptions([]),[]);assert.deepEqual(quizOptions([rows[0]]),[]);
});
test('quizzes immediately precede reveals and support ties without inventing extra options',()=>{
 const data=player(200);data.mappers=[{name:'One',count:3},{name:'Two',count:3}];data.artists=[];
 const slides=experienceSlides(data);const index=slides.findIndex(s=>s.quiz);assert.equal(slides[index].quiz.kind,'mapper');assert.equal(slides[index].quiz.tied,true);assert.equal(slides[index].quiz.options.length,2);assert.equal(slides[index+1].title,'Your mappers.');assert.ok(!slides.some(s=>s.quiz?.kind==='artist'));
});

test('genre slide follows the ranked mapset total and shows at most five genres with its source explained',()=>{const data=player(555);data.globalStats={rankedGenres:{totalSets:12,rows:[2,3,4,5,6,7,9,10,11,12,13,14].map(id=>({id,count:1}))}};const slides=experienceSlides(data);const index=slides.findIndex(s=>s.layout==='global-genres');assert.ok(index>0);assert.equal(slides[index-1].title,'New patterns.<br>More ways to play.');assert.equal((slides[index].body.match(/<li>/g)||[]).length,5);assert.ok(slides[index].note.includes('Each mapset counts once'));});

 test('zero eligible scores and no eligible uploads cannot open or consume a Wrapped experience',()=>{
 const empty={...player(98765),sampleCount:0,mapping:{status:'ready',created:0}};
 assert.equal(canViewWrapped(empty),false);
 assert.equal(firstExperience(empty),false);
 assert.equal(openExperience(empty),undefined);
 markExperience(empty);
 assert.equal(firstExperience({...empty,sampleCount:1}),true);
 assert.equal(canViewWrapped({...empty,sampleCount:1}),true);
 });

test('mapping slide uses supplied counts after club and before community, and omits missing data',()=>{
 const data=player(777);data.mapping={status:'ready',created:12,ranked:3,mostPopular:{previewUrl:'https://b.ppy.sh/preview/123.mp3'}};const slides=experienceSlides(data),index=slides.findIndex(slide=>slide.layout==='mapping');
 assert.ok(index>0);assert.equal(slides[index-1].layout,'club');assert.equal(slides[index+1].layout,'global-intro');assert.ok(slides[index].body.includes('data-count="12"'));assert.ok(slides[index].body.includes('data-count="3"'));assert.ok(slides[index].note.includes('across all modes'));assert.equal(slides[index].preview,'https://b.ppy.sh/preview/123.mp3');assert.equal(slides[index].syncToPreview,true);
 data.mapping={status:'unavailable'};assert.ok(!experienceSlides(data).some(slide=>slide.layout==='mapping'));
 data.mapping={status:'ready',created:0,ranked:0};assert.ok(!experienceSlides(data).some(slide=>slide.layout==='mapping'));
});

test('mapping-only users can open Wrapped without score-based slides or consuming blocked-user state',()=>{
 const data={...player(9922),sampleCount:0,top:[],mappers:[],artists:[],club:null,mapping:{status:'ready',created:2,ranked:0,totalPlays:400}};
 assert.equal(canViewWrapped(data),true);
 const slides=experienceSlides(data);assert.equal(slides[1].layout,'mapping');assert.equal(slides[2].layout,'global-intro');
 assert.ok(!slides.some(slide=>['flow','plays','personal-mods','club','quiz'].includes(slide.layout)));
 assert.ok(!slides.some(slide=>slide.eyebrow==='THE ONE TO REMEMBER'));
 assert.match(slides.at(-1).note,/score-based sections are omitted/);
 for(const mapping of [{status:'unavailable'},{status:'ready',created:0},{status:'ready',created:-1},{status:'ready',created:'2'}])assert.equal(canViewWrapped({...data,mapping}),false);
});

test('opening music follows the personal mods boundary when slides are inserted',()=>{
 const slides=experienceSlides(player(107));
 const mods=slides.findIndex(slide=>slide.layout==='personal-mods');
 assert.ok(mods>=4);
 for(let i=0;i<=mods;i++)assert.equal(usesOpeningMusic(slides,i),true);
 assert.equal(usesOpeningMusic(slides,mods+1),slides[mods+1].eyebrow==='A LITTLE RECOGNITION');
 const shifted=[slides[0],{layout:'extra'},...slides.slice(1)];
 assert.equal(usesOpeningMusic(shifted,mods+1),true);
 assert.equal(usesOpeningMusic([{layout:'opening'},{layout:'mapping'}],1),false);
});
