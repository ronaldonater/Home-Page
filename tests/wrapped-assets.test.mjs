import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const source=readFileSync(new URL('../osu-wrapped/src/experience.js',import.meta.url),'utf8');
test('story media references use the deployed Wrapped subdirectory and exist',()=>{
 assert.doesNotMatch(source,/["']\/(?:sounds|images)\//);
 const assets=[...source.matchAll(/\/osu-wrapped\/(?:sounds|images)\/[a-zA-Z0-9_.-]+\.(?:mp3|wav|jpg|svg)/g)].map(match=>match[0]);
 for(const required of ['tick.mp3','impact.mp3','swoosh.mp3','club-charge.wav','club-reveal.wav','ohnepixel-peak-thumbnail.jpg'])assert.ok(assets.some(asset=>asset.endsWith('/'+required)),required);
 for(const asset of assets)assert.ok(existsSync(new URL('..'+asset,import.meta.url)),asset);
});
