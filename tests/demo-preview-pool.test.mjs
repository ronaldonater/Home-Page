import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoPreviewPool} from '../osu-wrapped/src/demo-preview-pool.js';
test('demo players preload unique sources, reuse buffers, and release them on close',()=>{
 const made=[];
 const pool=createDemoPreviewPool([{preview:'/a.ogg'},{preview:'/a.ogg'},{preview:null},{preview:'/b.ogg'}],source=>{
  const audio={source,currentTime:12,loads:0,load(){this.loads++;},pause(){this.paused=true;},removeAttribute(key){this.removed=key;}};made.push(audio);return audio;
 });
 assert.equal(made.length,2);assert.ok(made.every(a=>a.preload==='auto'&&a.loads===1));
 assert.equal(pool.get('/a.ogg'),made[0]);assert.equal(made[0].currentTime,0);
 assert.equal(pool.get('/live.mp3'),undefined);
 pool.dispose();assert.ok(made.every(a=>a.paused&&a.removed==='src'&&a.loads===2));assert.equal(pool.get('/a.ogg'),undefined);
});
