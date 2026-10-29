import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../osu-wrapped/src/data/demo-images.json' with {type:'json'};
import {savedBeatmapCover} from '../osu-wrapped/src/beatmap-cover.js';
import {demo} from '../osu-wrapped/src/demo.js';
import {globalDashboard} from '../osu-wrapped/src/global.js';
import {experienceSlides} from '../osu-wrapped/src/experience.js';
import {createRecap} from '../osu-wrapped/src/recap.js';

test('live reuse requires an exact saved beatmap background and never reuses avatars or medals',()=>{
 const cover=demo().top[0].cover;assert.equal(savedBeatmapCover(cover),manifest.assets[cover]);
 for(const value of [cover+'?changed=1',cover+'#changed','https://assets.ppy.sh/beatmaps/99999999/covers/cover.jpg','javascript:alert(1)',null])assert.equal(savedBeatmapCover(value),value);
 for(const remote of Object.keys(manifest.assets).filter(value=>value.startsWith('https://a.ppy.sh/')||value.includes('/medals/')))assert.equal(savedBeatmapCover(remote),remote);
});

test('live slides and global covers use matching local backgrounds but keep live avatars',()=>{
 const data=demo();data.demo=false;for(const artist of data.artists)delete artist.demoImage;
 const slides=experienceSlides(data);for(const slide of slides)if(slide.artwork)assert.match(slide.artwork,/^\/osu-wrapped\/images\/demo\//);
 const html=globalDashboard(data.globalStats,'osu');assert.ok(html.includes('src="/osu-wrapped/images/demo/'));assert.match(html,/src="https:\/\/a\.ppy\.sh\//);
});

test('both live recap formats reuse cover files while avatar and medal requests stay on their original paths',async()=>{
 const original={document:globalThis.document,Image:globalThis.Image,Path2D:globalThis.Path2D},requests=[];
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:value=>({width:String(value).length*6})},{get:(target,key)=>target[key]||(()=>{})});
 globalThis.document={createElement:()=>({getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))})};globalThis.Path2D=class{};
 globalThis.Image=class{constructor(){this.naturalWidth=200;this.naturalHeight=100;}set src(value){if(value){requests.push(value);queueMicrotask(()=>this.onload?.());}}};
 try{const data=demo();data.demo=false;for(const artist of data.artists)delete artist.demoImage;for(const layout of ['portrait','landscape'])await createRecap(data,{layout});
  assert.ok(requests.some(value=>value.startsWith('/osu-wrapped/images/demo/')));assert.ok(requests.some(value=>value.includes('/avatar?id=')));assert.ok(requests.some(value=>value.includes('/medal-image?')));assert.ok(!requests.some(value=>value.includes('/cover?')));
 }finally{Object.assign(globalThis,original);}
});


test('local cover reuse preserves song preview fallback from the original mapset URL',()=>{
 const data=demo();data.demo=false;delete data.top[0].previewUrl;
 const id=new URL(data.top[0].cover).pathname.match(/\/beatmaps\/(\d+)\//)[1];
 const slide=experienceSlides(data).find(slide=>slide.eyebrow==='THE ONE TO REMEMBER');assert.equal(slide.preview,'https://b.ppy.sh/preview/'+id+'.mp3');
});
