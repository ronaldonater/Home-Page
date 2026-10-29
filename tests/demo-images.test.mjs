import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import manifest from '../osu-wrapped/src/data/demo-images.json' with {type:'json'};
import {demoAsset,demoMarkup} from '../osu-wrapped/src/demo-images.js';
import {demo} from '../osu-wrapped/src/demo.js';
import {experienceSlides} from '../osu-wrapped/src/experience.js';
import {globalDashboard} from '../osu-wrapped/src/global.js';
import {createRecap} from '../osu-wrapped/src/recap.js';

test('every saved demo image mapping points to a bundled file and live markup is unchanged',()=>{
 assert.ok(Object.keys(manifest.assets).length>300);
 for(const [remote,local] of Object.entries(manifest.assets)){assert.match(local,/^\/osu-wrapped\/images\/demo\/[a-z0-9.-]+$/);assert.ok(existsSync(new URL('..'+local,import.meta.url)));assert.equal(demoAsset(remote),local);assert.equal(demoMarkup('<img src="'+remote+'"/>',false),'<img src="'+remote+'"/>');}
 const data=demo();assert.match(demoAsset('/api/cover?url='+encodeURIComponent(data.top[0].cover)),/^\/osu-wrapped\/images\/demo\//);assert.match(demoAsset('/api/osu-wrapped/avatar?id='+data.mappers[0].userId),/^\/osu-wrapped\/images\/demo\//);
});

test('all four demo slideshows and global dashboards render bundled image sources',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){
  const data=demo(mode),slides=experienceSlides(data);const html=slides.map(slide=>slide.body).join('')+demoMarkup(globalDashboard(data.globalStats,mode));
  for(const image of html.matchAll(/<img[^>]+src="([^"]+)"/g))assert.match(image[1],/^\/osu-wrapped\/images\//);
  for(const slide of slides)if(slide.artwork)assert.match(slide.artwork,/^\/osu-wrapped\/images\/demo\//);
 }
});

test('portrait and landscape demo recap images use local artwork rather than API proxies',async()=>{
 const original={document:globalThis.document,Image:globalThis.Image,Path2D:globalThis.Path2D};const requests=[];
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:value=>({width:String(value).length*6})},{get:(target,key)=>target[key]||(()=>{})});
 globalThis.document={createElement:()=>({getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))})};globalThis.Path2D=class{};
 globalThis.Image=class{constructor(){this.naturalWidth=200;this.naturalHeight=100;}set src(value){if(value){requests.push(value);queueMicrotask(()=>this.onload?.());}}};
 try{for(const layout of ['portrait','landscape'])await createRecap(demo(),{layout});assert.ok(requests.length>20);for(const source of requests)assert.match(source,/^\/osu-wrapped\/images\/(?:demo|mods)\//);}finally{Object.assign(globalThis,original);}
});
