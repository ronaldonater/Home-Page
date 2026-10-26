import test from 'node:test';
import assert from 'node:assert/strict';
import {demo} from '../osu-wrapped/src/demo.js';
test('all mode demos use real native maps, covers and previews while remaining fictional profiles',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){const data=demo(mode);assert.equal(data.demo,true);assert.equal(data.mapping.status,'ready');assert.ok(data.mapping.created>0);assert.equal(data.user.id,0);assert.equal(data.sampleCount,75);assert.equal(data.mappers.length,10);assert.equal(new Set(data.mappers.map(mapper=>mapper.userId)).size,10);assert.equal(data.top.length,25);
 for(const score of data.top){assert.ok(Number.isSafeInteger(score.beatmapId));assert.match(score.cover,/^https:\/\/assets\.ppy\.sh\/beatmaps\/\d+\//);assert.match(score.previewUrl,/^https:\/\/b\.ppy\.sh\/preview\/\d+\.mp3$/);assert.ok(score.title&&score.artist&&score.creator&&score.version);}
 assert.ok(data.artists.every(row=>row.cover&&row.previewUrl));assert.ok(data.mappers.every(row=>Number.isSafeInteger(row.userId)));
 }
});
