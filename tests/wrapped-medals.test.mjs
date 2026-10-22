import test from 'node:test';
import assert from 'node:assert/strict';
import {selectRarestMedal,createRarityService} from '../netlify/functions/wrapped/medals.mjs';
import {rarestMedalMarkup,medalImageUrl} from '../osu-wrapped/src/medals.js';
const row=(id,rarity)=>({MedalID:id,Name:'Medal '+id,Rarity:rarity,Link:'https://assets.ppy.sh/medals/web/test-'+id+'.png'});
const earned=(id,date='2026-06-01T00:00:00Z')=>({achievement_id:id,achieved_at:date});
test('rarest medal uses UTC year and smallest finite ownership percentage',()=>{
 const result=selectRarestMedal([earned(1),earned(2),earned(3,'2025-12-31T23:59:59Z'),earned(4,'2027-01-01T00:00:00Z')],[row(1,5),row(2,.03),row(3,.001),row(4,.0001)]);
 assert.equal(result.rarestMedal.id,2);assert.equal(result.rarestMedal.rarityPercent,.03);assert.equal(result.rarestMedalStatus,'available');
 assert.equal(selectRarestMedal([earned(1,'2025-12-31T23:30:00-01:00')],[row(1,0)]).rarestMedal.rarityPercent,0);
});
test('missing, partial, and invalid rarity data are not fabricated',()=>{
 assert.equal(selectRarestMedal([],[]).rarestMedalStatus,'none');assert.equal(selectRarestMedal(undefined,[]).rarestMedalStatus,'unavailable');
 assert.equal(selectRarestMedal([earned(1),earned(2)],[row(1,2)]).rarestMedalStatus,'partial');
 for(const value of [null,'',NaN,Infinity,-1,101])assert.equal(selectRarestMedal([earned(1)],[row(1,value)]).rarestMedal,null);
 const result=selectRarestMedal([earned(1)],[{...row(1,2),Link:'https://evil.example/medal.png'}]);assert.equal(result.rarestMedal,null);
});
test('rarity lookups share a daily cache, avoid requests for no medals, and fail gracefully',async()=>{
 let calls=0;const service=createRarityService({fetchImpl:async()=>{calls++;return Response.json([row(1,.2)]);}});
 await service([]);assert.equal(calls,0);
 const results=await Promise.all([service([earned(1)]),service([earned(1)])]);assert.equal(calls,1);assert.equal(results[0].rarestMedal.id,1);await service([earned(1)]);assert.equal(calls,1);
 const broken=createRarityService({fetchImpl:async()=>{throw Error('offline');}});assert.equal((await broken([earned(1)])).rarestMedalStatus,'unavailable');
});
test('medal displays escape names and only use safe same-origin image URLs',()=>{
 const data=selectRarestMedal([earned(1)],[{...row(1,.2),Name:'<script>bad</script>'}]);
 const html=rarestMedalMarkup(data);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Osekai-tracked'));assert.match(medalImageUrl(data.rarestMedal),/\/medal-image\?file=test-1.png$/);assert.equal(medalImageUrl({image:'https://evil.example/test.png'}),'');
});
