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


test('demo uses an initial for its player while frozen artist images remain demo-only',async()=>{
 const {artistImageSource}=await import('../osu-wrapped/src/artist-preload.js');
 const {demoArtistAsset}=await import('../osu-wrapped/src/demo-images.js');
 for(const mode of ['osu','taiko','fruits','mania']){
  const data=demo(mode);assert.equal(data.user.avatar,undefined);
  for(const artist of data.artists){
   const frozen=demoArtistAsset(artist);assert.ok(frozen.includes('/images/demo/'));assert.equal(artistImageSource(artist),frozen);
   const {demoImage,...live}=artist;assert.ok(!artistImageSource(live).includes('/images/demo/'));
  }
 }
 for(const path of Object.values(manifest.artists||{}))assert.ok(path.includes('/images/demo/'));
 assert.equal(demoMarkup('<img src="https://a.ppy.sh/0"/>',false),'<img src="https://a.ppy.sh/0"/>');
});


test('saved demo skillset panels include every tagged difficulty using local thumbnails without live requests',async()=>{
 const {skillsetMapsMarkup}=await import('../osu-wrapped/src/skillsets.js');
 for(const mode of ['osu','taiko','fruits','mania']){
  const data=demo(mode);assert.ok(data.skillsetsSnapshotAt);assert.ok(data.skillsets.rows.length);
  for(const row of data.skillsets.rows){
   assert.ok(row.maps.length,row.tag+' missing map details');assert.equal(row.maps.reduce((total,map)=>total+map.count,0),row.count);
   const html=skillsetMapsMarkup(row,mode);assert.ok(!html.includes('not included'));
   assert.ok(html.includes('#'+mode+'/'));
   for(const image of html.matchAll(/<img[^>]+src="([^"]+)"/g))assert.ok(image[1].includes('/images/demo/'));
  }
 }
});
