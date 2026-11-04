import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from '../osu-wrapped/src/summary.js';
import {demo} from '../osu-wrapped/src/demo.js';
import {skillsetMapsMarkup} from '../osu-wrapped/src/skillsets.js';
const score=(id,pp,owner=2,artist='Artist')=>({id,ended_at:'2026-02-01',passed:true,accuracy:.99,pp,mods:[],beatmap:{id,version:'Diff '+id,owners:[{id:owner,username:'Mapper '+owner}]},beatmapset:{id:100+id,title:'Map '+id,creator:'Host',user_id:1,artist}});
test('favorite panels cover the full sample, match guest credits, and keep collaborators',()=>{
 const scores=Array.from({length:29},(_,i)=>score(i+1,200-i));scores[28].beatmap.owners.push({id:3,username:'Mapper 3'});
 const data=summarize({},scores,'mania');const i=data.mappers.findIndex(row=>row.userId===2),j=data.mappers.findIndex(row=>row.userId===3);
 assert.equal(data.top.length,25);assert.equal(data.favoriteScoreMaps.mappers[i].length,29);assert.equal(data.favoriteScoreMaps.mappers[j][0].id,29);assert.equal(data.favoriteScoreMaps.artists[0].length,29);
 const html=skillsetMapsMarkup({maps:data.favoriteScoreMaps.mappers[j]},'mania');assert.ok(html.includes('#mania/29'));assert.ok(html.includes('Diff 29'));assert.ok(html.includes('Mapper 2, Mapper 3'));
});
test('favorite lists keep highest PP per difficulty, include no-PP scores, and separate artists',()=>{
 const low=score(1,50),high={...score(2,100),beatmap:{...score(1,100).beatmap,version:'Highest PP'}};
 const data=summarize({},[low,high,score(3,null,2,'Other')],'osu');
 assert.equal(data.favoriteScoreMaps.mappers[0].length,2);assert.equal(data.favoriteScoreMaps.mappers[0][0].version,'Highest PP');
 const i=data.artists.findIndex(row=>row.name==='Other');assert.equal(data.favoriteScoreMaps.artists[i][0].id,3);
});
test('offline demo includes favorite lists for every displayed mapper and artist',()=>{
 for(const mode of ['osu','taiko','fruits','mania']){const data=demo(mode);for(const kind of ['mappers','artists']){assert.equal(data.favoriteScoreMaps[kind].length,data[kind].length);assert.ok(data.favoriteScoreMaps[kind].every(maps=>maps.length>0));}}
});

test('equal mapper and artist counts use highest associated PP across the full selection',()=>{
 const a=score(1,50,2,'Alpha'),z=score(2,500,3,'Zulu');
 const missing=score(3,null,4,'Missing');
 const data=summarize({},[a,z,missing],'osu');
 assert.deepEqual(data.mappers.map(row=>row.userId),[3,2,4]);assert.deepEqual(data.artists.map(row=>row.name),['Zulu','Alpha','Missing']);
 assert.equal(data.favoriteScoreMaps.mappers[0][0].id,2);assert.equal(data.favoriteScoreMaps.artists[0][0].id,2);
 const more=score(4,1,2,'Alpha');const counted=summarize({},[a,z,missing,more],'osu');
 assert.equal(counted.mappers[0].userId,2);assert.equal(counted.artists[0].name,'Alpha');
 const exact=summarize({},[score(5,100,2,'Alpha'),score(6,100,3,'Zulu')],'osu');assert.deepEqual(exact.artists.map(row=>row.name),['Alpha','Zulu']);
});
