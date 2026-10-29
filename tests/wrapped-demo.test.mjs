import test from 'node:test';
import assert from 'node:assert/strict';
import {demo,demoGlobal,demoSnapshotAt} from '../osu-wrapped/src/demo.js';
test('all mode demos use real native maps, covers and previews while remaining fictional profiles',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){const data=demo(mode);assert.equal(data.demo,true);assert.equal(data.mapping.status,'ready');assert.ok(data.mapping.created>0);assert.equal(data.user.id,0);assert.equal(data.sampleCount,75);assert.equal(data.mappers.length,10);assert.equal(new Set(data.mappers.map(mapper=>mapper.userId)).size,10);assert.equal(data.top.length,25);
 for(const score of data.top){assert.ok(Number.isSafeInteger(score.beatmapId));assert.match(score.cover,/^https:\/\/assets\.ppy\.sh\/beatmaps\/\d+\//);assert.match(score.previewUrl,/^https:\/\/b\.ppy\.sh\/preview\/\d+\.mp3$/);assert.ok(score.title&&score.artist&&score.creator&&score.version);}
 assert.ok(data.artists.every(row=>row.cover&&row.previewUrl));assert.ok(data.mappers.every(row=>Number.isSafeInteger(row.userId)));
 }
});


test('saved demos contain completed tags and global data without any live service or artwork wait',()=>{
 const oldFetch=globalThis.fetch,oldImage=globalThis.Image;
 globalThis.fetch=()=>{throw Error('Demo must not fetch data');};globalThis.Image=class{constructor(){throw Error('Demo must not wait for images');}};
 try{for(const mode of ['osu','taiko','fruits','mania']){
  const data=demo(mode),global=demoGlobal(mode);assert.equal(data.snapshotAt,demoSnapshotAt);assert.equal(data.generatedAt,demoSnapshotAt);
  assert.equal(data.skillsets.checked,data.sampleCount);assert.ok(data.skillsets.rows.length>0);assert.equal(global.mode,mode);
  assert.equal(global.top.length,25);assert.equal(global.popularBeatmapsets.length,25);assert.ok(global.rankedGenres.rows.length>0);assert.ok(global.rankedMappers.totalSets>0);
  assert.ok(data.artists.every(artist=>artist.demoImage));
 }}finally{globalThis.fetch=oldFetch;globalThis.Image=oldImage;}
});

test('demo copies cannot mutate the saved profile or global snapshot',()=>{
 const original=demo(),changed=demo();changed.user.username='Changed';changed.globalStats.top.length=0;changed.skillsets.rows.length=0;
 assert.deepEqual(demo(),original);const global=demoGlobal();global.top.length=0;assert.equal(demoGlobal().top.length,25);
});
