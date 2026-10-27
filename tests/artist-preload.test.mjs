import test from 'node:test';
import assert from 'node:assert/strict';
import {preloadArtistImages,artistImageSource} from '../osu-wrapped/src/artist-preload.js';
test('artist preload caches decoded portraits and validated cover fallbacks without repeated requests',async()=>{
 const original=globalThis.Image,requests=[];
 globalThis.Image=class{set src(value){requests.push(value);queueMicrotask(()=>value.includes('Missing')||value.includes('Broken')?this.onerror?.():this.onload?.());}decode(){return Promise.resolve();}};
 try{
 const rows=[{name:'Portrait Test'},{name:'Missing Portrait',cover:'https://assets.ppy.sh/example.jpg'},{name:'Broken Portrait',cover:'javascript:alert(1)'}];
 await preloadArtistImages(rows,{base:'/test-api'});
 assert.equal(artistImageSource(rows[0],'/test-api'),'/test-api/artist-image?name=Portrait%20Test');
 assert.equal(artistImageSource(rows[1],'/test-api'),'https://assets.ppy.sh/example.jpg');
 assert.equal(artistImageSource(rows[2],'/test-api'),'');
 const count=requests.length;await preloadArtistImages(rows,{base:'/test-api'});assert.equal(requests.length,count);
 }finally{globalThis.Image=original;}
});
test('preload stops waiting for stalled images at its deadline',async()=>{
 const original=globalThis.Image;globalThis.Image=class{set src(value){}};
 try{const row={name:'Stalled Test'};await preloadArtistImages([row],{base:'/timeout-api',timeout:15});assert.equal(artistImageSource(row,'/timeout-api'),'');}finally{globalThis.Image=original;}
});
