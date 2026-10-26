import test from 'node:test';
import assert from 'node:assert/strict';
import {createMappingClubCommunity,recordMappingClubCommunity} from '../netlify/functions/wrapped/mapping-community.mjs';
import {mappingCommunityMarkup} from '../osu-wrapped/src/mapping-clubs.js';
const config={databaseUrl:'postgresql://test',trackingSecret:'test-only-stable-tracking-key-32-characters'};
const summary=(id=1,club='draft')=>({user:{id},year:2026,mode:'all',club:{id:club}});
function database(){const records=new Map();return {records,query:async(url,sql,p)=>{if(sql.startsWith('INSERT')){assert.match(sql,/wrapped_mapping_club_assignments/);records.set(p.slice(0,3).join(':'),{club_id:p[3],version:p[4]});return [];}const counts=new Map();for(const row of records.values())if(row.version===p[2])counts.set(row.club_id,(counts.get(row.club_id)||0)+1);return [...counts].map(([club_id,count])=>({club_id,count}));}};}
test('mapping tracking records pseudonymous unique mappers and updates their club',async()=>{
 let now=0;const db=database(),record=createMappingClubCommunity({query:db.query,now:()=>now});
 assert.equal(await record(summary()),null);
 let result=await record(summary(),config);assert.equal(result.total,1);assert.equal(result.clubs.find(c=>c.id==='draft').percentage,100);
 await record(summary(1,'ranked'),config);assert.equal(db.records.size,1);
 now=61000;result=await record(summary(2,'soundtrack'),config);assert.equal(result.total,2);assert.equal(result.clubs.find(c=>c.id==='ranked').percentage,50);
 assert.match([...db.records.keys()][0],/^[a-f0-9]{64}:2026:all$/);
 for(const data of [{...summary(),demo:true},summary(0),{...summary(),mode:'mania'},summary(4,'invalid')])assert.equal(await record(data,config),null);
 assert.equal(db.records.size,2);
});
test('mapping failures remain nonfatal and users without uploads never register',async()=>{
 let calls=0;const record=createMappingClubCommunity({query:async()=>{calls++;throw Error('private');}});
 assert.deepEqual(await record(summary(),config),{status:'unavailable'});await record(summary(),config);assert.equal(calls,1);
 assert.equal(await recordMappingClubCommunity(summary(),{status:'ready',created:0},config),null);
 assert.equal(await recordMappingClubCommunity({...summary(),demo:true},{status:'ready',created:1},config),null);
});
test('mapping percentages identify their separate all-mode mapper population',()=>{
 const html=mappingCommunityMarkup({community:{status:'ready',total:2,clubs:[{id:'draft',percentage:50}]}},'draft');
 assert.match(html.replace(/<[^>]*>/g,''),/50\.0%/);assert.match(html,/participating mappers/);assert.match(html,/all modes/);
 assert.equal(mappingCommunityMarkup({},'draft'),'');
});
