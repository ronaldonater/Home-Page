import test from 'node:test';
import assert from 'node:assert/strict';
import {mappingCounts,createMappingStats} from '../netlify/functions/wrapped/mapping-stats.mjs';
import {mappingStatsMarkup} from '../osu-wrapped/src/mapping.js';
const row=(id,extra={})=>({id,user_id:42,submitted_date:'2026-05-01T00:00:00Z',status:'pending',...extra});
test('mapping counts deduplicate hosted mapsets and use submission year, not ranking year',()=>{
 const data=mappingCounts([row(1,{status:'ranked',ranked_date:'2027-01-01'}),row(1,{status:'ranked'}),row(2),row(3,{status:'loved'}),row(4,{user_id:99}),row(5,{submitted_date:'2025-12-31T23:59:59Z',status:'ranked',ranked_date:'2026-01-01'}),row(6,{submitted_date:null})],42);
 assert.equal(data.status,'ready');assert.equal(data.created,3);assert.equal(data.ranked,1);
});
test('mapping service paginates all hosted categories and shares cache across mode changes',async()=>{
 let calls=0;
 const fetchImpl=async url=>{calls++;const type=url.match(/beatmapsets\/(\w+)/)[1],offset=Number(new URL(url).searchParams.get('offset'));return {ok:true,json:async()=>type==='ranked'?(offset===0?Array.from({length:100},(_,i)=>row(i+1,{status:'ranked'})):[row(101,{status:'ranked'})]):type==='pending'?[row(102)]:[]};};
 const service=createMappingStats({fetchImpl,now:()=>10000});
 const result=await service(42,'private-token');assert.equal(result.created,102);assert.equal(result.ranked,101);assert.equal(calls,5);
 assert.deepEqual(await service(42,'new-token'),result);assert.equal(calls,5);assert.ok(!JSON.stringify(result).includes('token'));
});
test('failed or incomplete catalogue never becomes a zero count',async()=>{
 const failed=createMappingStats({fetchImpl:async()=>({ok:false})});assert.deepEqual(await failed(42,'token'),{status:'unavailable'});
 const repeated=createMappingStats({fetchImpl:async()=>({ok:true,json:async()=>Array.from({length:100},(_,i)=>row(i+1))})});assert.equal((await repeated(42,'token')).status,'unavailable');
 const empty=createMappingStats({fetchImpl:async()=>({ok:true,json:async()=>[]})});assert.equal((await empty(42,'token')).created,0);
});
test('mapping panel explains cohort and gracefully handles missing statistics',()=>{
 const html=mappingStatsMarkup({mapping:{status:'ready',created:12,ranked:3}});assert.ok(html.includes('12'));assert.ok(html.includes('currently ranked'));assert.ok(html.includes('All modes'));assert.ok(mappingStatsMarkup({mapping:{status:'unavailable'}}).includes('temporarily unavailable'));assert.equal(mappingStatsMarkup({}), '');
});

test('mapping preview selects the most played eligible mapset',()=>{const result=mappingCounts([row(1,{play_count:50}),row(2,{play_count:900}),row(3,{play_count:99999,submitted_date:'2025-01-01'})],42);assert.equal(result.mostPopular.id,2);assert.equal(result.mostPopular.previewUrl,'https://b.ppy.sh/preview/2.mp3');assert.equal(mappingCounts([],42).mostPopular,null);});

test('mapping lifetime plays sum the eligible cohort and preserve missing metadata',()=>{assert.equal(mappingCounts([row(1,{play_count:20}),row(1,{play_count:20}),row(2,{play_count:30}),row(3,{play_count:900,submitted_date:'2025-01-01'})],42).totalPlays,50);assert.equal(mappingCounts([row(1)],42).totalPlays,null);assert.equal(mappingCounts([],42).totalPlays,0);});
