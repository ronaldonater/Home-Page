import test from 'node:test';
import assert from 'node:assert/strict';
import {createBeatmapAttributeEnricher} from '../netlify/functions/wrapped/beatmap-attributes.mjs';
import {createMapDateEnricher} from '../netlify/functions/wrapped/map-clubs.mjs';
import {createSkillsetEnricher} from '../netlify/functions/wrapped/skillset-tags.mjs';
import {createMappingStats} from '../netlify/functions/wrapped/mapping-stats.mjs';
const score={id:1,ended_at:'2026-06-01',mods:['HR'],beatmap:{id:9,beatmapset_id:77,mode:'osu'},beatmapset:{id:77}};
test('attribute readiness distinguishes temporary failures from confirmed unsupported values',async()=>{
 const failed=createBeatmapAttributeEnricher({fetchImpl:async()=>new Response(null,{status:503})});assert.equal((await failed([score],'osu','token')).complete,false);
 const unsupported=createBeatmapAttributeEnricher({fetchImpl:async()=>new Response(null,{status:400})});const result=await unsupported([score],'osu','token');assert.equal(result.complete,true);assert.deepEqual(result,[score]);
 const ready=createBeatmapAttributeEnricher({fetchImpl:async()=>Response.json({attributes:{star_rating:6}})});assert.equal((await ready([score],'osu','token')).complete,true);
});
test('failed date lookups stay pending while confirmed missing maps complete checks',async()=>{
 const failed=createMapDateEnricher({fetchImpl:async()=>new Response(null,{status:503})});assert.equal((await failed([score],'token')).complete,false);
 const gone=createMapDateEnricher({fetchImpl:async()=>new Response(null,{status:404})});assert.equal((await gone([score],'token')).complete,true);
 const tags=createSkillsetEnricher({fetchImpl:async()=>new Response(null,{status:404})});assert.equal((await tags([score],'osu','token'))[0].wrappedSkillsets.status,'ready');
});
test('mapping retries reuse completed catalogue pages instead of restarting all upstream work',async()=>{
 let failed=true;const calls=[];const service=createMappingStats({fetchImpl:async url=>{const type=new URL(url).pathname.split('/').at(-1);calls.push(type);if(type==='graveyard'&&failed)return new Response(null,{status:503});return Response.json([]);}});
 assert.equal((await service(123,'token')).status,'unavailable');failed=false;assert.equal((await service(123,'token')).status,'ready');assert.equal(calls.filter(type=>type==='ranked').length,1);assert.equal(calls.filter(type=>type==='graveyard').length,2);
});
