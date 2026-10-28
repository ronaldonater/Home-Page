import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecap} from '../osu-wrapped/src/recap.js';
import {createLandscapeRecap} from '../osu-wrapped/src/recap-landscape.js';
test('landscape exports keep score and mapping-only content in a wide canvas',async()=>{
 const labels=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:s=>({width:String(s).length*8}),fillText:s=>labels.push(String(s))},{get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))};
 const previousDocument=globalThis.document,previousPath=globalThis.Path2D,previousImage=globalThis.Image;
 globalThis.document={createElement:()=>canvas};globalThis.Path2D=class{};globalThis.Image=class{set src(value){if(value)queueMicrotask(()=>this.onerror?.());}};
 try{
  const data={year:2026,mode:'osu',sampleCount:1,user:{id:0,username:'Player'},top:[{title:'My score',artist:'Artist',creator:'Mapper',version:'Hard',pp:123,accuracy:99,rank:'S',mods:'HD',date:'2026-01-01'}],mappers:[],artists:[],months:[],favoriteMod:{mods:['HD']}};
  await createRecap(data,{layout:'landscape'});assert.ok(canvas.width>canvas.height);assert.ok(labels.includes('My score'));assert.ok(labels.includes('YOUR TOP 5 PLAYS'));
  labels.length=0;
  await createRecap({sampleCount:0,user:{id:0,username:'Mapper'},mapping:{status:'ready',created:2,ranked:0,totalPlays:419}},{layout:'landscape'});
  assert.equal(canvas.width,2400);assert.equal(canvas.height,1000);assert.ok(labels.includes('YOUR MAPPING YEAR / ALL MODES'));assert.ok(labels.includes('First Draft Society'));assert.ok(!labels.includes('YOUR TOP 5 PLAYS'));
 }finally{globalThis.document=previousDocument;globalThis.Path2D=previousPath;globalThis.Image=previousImage;}
});

test('landscape preserves portrait artwork, trait reasons, grades and explanatory labels',async()=>{
 const labels=[],drawn=[],calls=[];
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:s=>({width:String(s).length*6}),fillText:s=>labels.push(String(s)),drawImage:img=>drawn.push(img)},{get:(target,key)=>target[key]||(()=>{})});
 const canvas={getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))};
 const previousDocument=globalThis.document,previousPath=globalThis.Path2D;
 globalThis.document={createElement:()=>canvas};globalThis.Path2D=class{};
 const picture={naturalWidth:200,naturalHeight:100};
 const assets=Object.fromEntries(['avatarImage','coverImage','artistImage','recapMedalImage','recapModImage'].map(key=>[key,async value=>{calls.push([key,value]);return picture;}]));
 try{
  await createLandscapeRecap({year:2026,mode:'osu',sampleCount:29,user:{id:1,username:'Player'},accuracy:99.14,playcount:5729,combo:1715,medals:14,replayViews:35,months:[{month:1,available:true,count:1203}],favoriteMod:{mods:['HR'],count:23,total:29},top:[{title:'Cherry Pop',artist:'Kano',version:'Hard',creator:'Sotarks',cover:'cover',pp:399,accuracy:99.55,rank:'SH',mods:'HD, HR',date:'2026-08-09'}],mappers:[{name:'Sotarks',userId:2,count:4}],artists:[{name:'Kano',cover:'artist-cover',count:3}],club:{id:'wanderer',reason:'Primary reason',secondary:{id:'precision',reason:'Secondary reason'}},rarestMedal:{name:'Efflorescence',rarityPercent:7.27685,earnedAt:'2026-07-07'},mapping:{status:'ready',created:2,ranked:0,totalPlays:424,mostPopular:{title:'My upload',artist:'Artist',plays:317,cover:'upload'}}},assets);
  for(const expected of ['AVERAGE ACCURACY','Monthly profile history · all modes','Dated achievements · all modes','Primary reason','Secondary reason','399 pp','S','4','3','My upload','317 all-time plays'])assert.ok(labels.includes(expected),expected);
  assert.ok(calls.some(([key,value])=>key==='avatarImage'&&value===2));assert.ok(calls.some(([key,value])=>key==='artistImage'&&value==='Kano'));assert.ok(calls.some(([key,value])=>key==='recapModImage'&&value==='HR'));assert.ok(drawn.length>=7);
 }finally{globalThis.document=previousDocument;globalThis.Path2D=previousPath;}
});
