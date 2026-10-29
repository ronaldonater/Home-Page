import test from 'node:test';
import assert from 'node:assert/strict';
import {skillsetSummary,skillsetsMarkup} from '../osu-wrapped/src/skillsets.js';
import {createSkillsetEnricher} from '../netlify/functions/wrapped/skillset-tags.mjs';
const score=(id=10,set=1)=>({id,ended_at:'2026-05-01T00:00:00Z',beatmap:{id,beatmapset_id:set}});
const fixture={id:1,related_tags:[{id:1,name:'skillset/jumps',ruleset_id:0},{id:2,name:'skillset/streams',ruleset_id:null},{id:3,name:'skillset/tech',ruleset_id:3},{id:4,name:'theme/anime',ruleset_id:null}],beatmaps:[{id:10,mode:'osu',top_tag_ids:[{tag_id:1,count:5},{tag_id:2,count:4},{tag_id:3,count:3},{tag_id:4,count:6}]},{id:11,mode:'osu',top_tag_ids:[]},{id:12,mode:'mania',top_tag_ids:[{tag_id:3,count:4}]}]};
test('skillsets use exact difficulty and ruleset with cached set requests',async()=>{
 let requests=0;const enrich=createSkillsetEnricher({fetchImpl:async()=>{requests++;return Response.json(fixture);}});
 const result=await enrich([score(),score(11),score(99)],'osu','token');
 assert.equal(requests,1);assert.deepEqual(result[0].wrappedSkillsets.names,['skillset/jumps','skillset/streams']);
 assert.deepEqual(result[1].wrappedSkillsets,{status:'ready',mode:'osu',names:[]});assert.equal(result[2].wrappedSkillsets.status,'unavailable');
 assert.deepEqual((await enrich([score(12)],'mania','token'))[0].wrappedSkillsets.names,['skillset/tech']);assert.equal(requests,1);
 assert.equal((await enrich([score(10)],'mania','token'))[0].wrappedSkillsets.status,'unavailable');
});
test('skillset percentages use all selected scores, deduplicate tags and report incomplete coverage',()=>{
 const scores=[{wrappedSkillsets:{status:'ready',mode:'osu',names:['skillset/jumps','skillset/jumps','skillset/streams','ordinary']}},{wrappedSkillsets:{status:'ready',mode:'osu',names:[]}},{wrappedSkillsets:{status:'ready',mode:'mania',names:['skillset/tech']}},{}];
 const stats=skillsetSummary(scores,'osu');assert.equal(stats.checked,2);assert.equal(stats.tagged,1);assert.equal(stats.status,'partial');assert.equal(stats.rows[0].percentage,25);assert.equal(stats.rows[0].count,1);
 assert.match(skillsetsMarkup({skillsets:stats}),/1 of 4 selected scores/);assert.equal(skillsetSummary([{tags:'skillset/jumps'}]).rows.length,0);
});
test('tag enrichment failures preserve score data and uncached requests are bounded',async()=>{
 let requests=0;const enrich=createSkillsetEnricher({fetchImpl:async()=>{requests++;return new Response('',{status:503});}});
 const result=await enrich(Array.from({length:40},(_,i)=>score(i+1,i+1)),'osu','token');assert.equal(requests,24);assert.ok(result.every(s=>s.wrappedSkillsets.status==='unavailable'));
 const malformed=createSkillsetEnricher({fetchImpl:async()=>Response.json({id:1,beatmaps:fixture.beatmaps})});assert.equal((await malformed([score()],'osu','token'))[0].wrappedSkillsets.status,'unavailable');
});
test('old scores are not fetched and zero-vote tags do not count',async()=>{
 let requests=0;const enrich=createSkillsetEnricher({fetchImpl:async()=>{requests++;return Response.json({...fixture,beatmaps:[{id:10,mode:'osu',top_tag_ids:[{tag_id:1,count:0}]}]});}});
 await enrich([{...score(),ended_at:'2025-01-01'}],'osu','token');assert.equal(requests,0);
 const result=await enrich([score()],'osu','token');assert.deepEqual(result[0].wrappedSkillsets.names,[]);
});


test('summary filters and deduplicates eligible scores before ranking skillsets',async()=>{
 const {summarize}=await import('../osu-wrapped/src/summary.js');const tagged={...score(),pp:100,wrappedSkillsets:{status:'ready',mode:'osu',names:['skillset/jumps']}};
 const result=summarize({},[tagged,tagged,{...tagged,id:20,ended_at:'2025-01-01'}],'osu');assert.equal(result.skillsets.total,1);assert.equal(result.skillsets.rows[0].count,1);
});
test('skillset slide is conditional and both recap formats render its rankings',async()=>{
 const {experienceSlides}=await import('../osu-wrapped/src/experience.js');const {createRecap}=await import('../osu-wrapped/src/recap.js');
 const data={year:2026,mode:'osu',sampleCount:1,user:{id:0,username:'Player'},top:[],mappers:[],artists:[],months:[],skillsets:{total:1,checked:1,tagged:1,rows:[{name:'Jumps',count:1,percentage:100}]}};
 assert.ok(experienceSlides(data).some(s=>s.layout==='skillsets'));assert.ok(!experienceSlides({...data,skillsets:{total:1,rows:[]}}).some(s=>s.layout==='skillsets'));
 const labels=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:s=>({width:String(s).length*6}),fillText:s=>labels.push(String(s))},{get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))};
 const old={document:globalThis.document,Path2D:globalThis.Path2D,Image:globalThis.Image};
 globalThis.document={createElement:()=>canvas};globalThis.Path2D=class{};globalThis.Image=class{set src(value){if(value)queueMicrotask(()=>this.onerror?.());}};
 try{for(const layout of ['portrait','landscape']){labels.length=0;await createRecap(data,{layout});assert.ok(labels.includes('YOUR MAIN SKILLSETS'));assert.ok(labels.includes('Jumps'));assert.ok(labels.includes('100.0%'));}}finally{Object.assign(globalThis,old);}
});

test('dashboard includes every skillset in a five-row scrolling list while slides keep the top five',()=>{
 const data={skillsets:{total:10,checked:10,tagged:10,rows:Array.from({length:8},(_,i)=>({name:'Pattern '+i,count:1,percentage:10}))}};
 const dashboard=skillsetsMarkup(data);assert.equal((dashboard.match(/<li>/g)||[]).length,8);assert.match(dashboard,/skillset-list-scroll/);assert.match(dashboard,/tabindex="0"/);
 const slide=skillsetsMarkup(data,{story:true});assert.equal((slide.match(/<li>/g)||[]).length,5);assert.ok(!slide.includes('skillset-list-scroll'));
 assert.ok(!skillsetsMarkup({skillsets:{...data.skillsets,rows:data.skillsets.rows.slice(0,5)}}).includes('skillset-list-scroll'));
});
