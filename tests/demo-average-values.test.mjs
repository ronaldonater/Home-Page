import test from 'node:test';
import assert from 'node:assert/strict';
import {demo} from '../osu-wrapped/src/demo.js';
import {beatmapAveragesMarkup,beatmapAverageRows} from '../osu-wrapped/src/beatmap-averages.js';
test('all demos have numeric averages for every displayed ruleset metric',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){const data=demo(mode),rows=beatmapAverageRows(data);assert.ok(rows.length>=5);for(const row of rows){assert.notEqual(row.adjusted,'—',mode+': '+row.label);assert.notEqual(row.base,'—',mode+': '+row.label);assert.ok(row.count>0);}assert.ok(!beatmapAveragesMarkup(data).includes('Unavailable'));}
});
test('missing averages display an em dash on the stats page and recap',()=>{
 const data=demo();for(const metric of Object.values(data.beatmapAverages.metrics))for(const kind of ['base','adjusted'])metric[kind]={value:null,count:0};
 assert.ok(beatmapAveragesMarkup(data).includes('>—</strong>'));assert.ok(beatmapAverageRows(data).every(row=>row.base==='—'&&row.adjusted==='—'));assert.ok(!beatmapAveragesMarkup(data).includes('Unavailable'));
});
