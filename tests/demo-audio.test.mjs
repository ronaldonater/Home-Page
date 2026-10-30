import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import manifest from '../osu-wrapped/src/data/demo-audio.json' with {type:'json'};
import {demo} from '../osu-wrapped/src/demo.js';
import {experienceSlides} from '../osu-wrapped/src/experience.js';

test('all saved demo previews have verified local audio files and every slide uses them',()=>{
 assert.equal(Object.keys(manifest.assets).length,14);
 for(const [remote,local] of Object.entries(manifest.assets)){
  assert.match(remote,/^https:\/\/b\.ppy\.sh\/preview\/[1-9]\d*\.mp3$/);assert.match(local,/^\/osu-wrapped\/sounds\/demo\/[a-f0-9]+\.(?:ogg|mp3)$/);
  const path=new URL('..'+local,import.meta.url);assert.ok(existsSync(path));const bytes=readFileSync(path);assert.ok(bytes.length>1000);assert.ok(bytes.subarray(0,4).toString()==='OggS'||bytes.subarray(0,3).toString()==='ID3'||bytes[0]===255);
 }
 for(const mode of ['osu','taiko','fruits','mania']){
  const data=demo(mode),saved=experienceSlides(data),live=experienceSlides({...data,demo:false});
  assert.equal(saved.length,live.length);
  for(let i=0;i<saved.length;i++)if(live[i].preview){assert.equal(saved[i].preview,manifest.assets[live[i].preview]);assert.match(live[i].preview,/^https:\/\/b\.ppy\.sh\//);}
 }
});
