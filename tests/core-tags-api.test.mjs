import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {seal} from '../netlify/functions/wrapped/security.mjs';
test('tag loading stage reuses core scores and confirms untagged difficulties',async()=>{
 process.env.WRAPPED_SESSION_SECRET='core-tags-test-secret-at-least-32-characters';const original=globalThis.fetch,calls=[];
 globalThis.fetch=async url=>{calls.push(String(url));if(String(url).endsWith('/me/osu'))return Response.json({id:123,username:'Player'});if(String(url).includes('/scores/best?'))return Response.json(new URL(url).searchParams.get('offset')==='0'?[{id:1,ended_at:'2026-06-01',pp:100,passed:true,accuracy:.98,mods:[],beatmap:{id:9,mode:'osu',beatmapset_id:77},beatmapset:{id:77}}]:[]);if(String(url).endsWith('/beatmapsets/77'))return Response.json({id:77,related_tags:[],beatmaps:[{id:9,mode:'osu',top_tag_ids:[]}]});throw Error('Unexpected endpoint');};
 const headers={cookie:'wrapped_session='+seal({kind:'session',token:'core-tags-token',exp:Date.now()+60000})};
 const run=stage=>handler({path:'/api/wrapped',httpMethod:'GET',headers,queryStringParameters:{mode:'osu',stage}},{now:()=>Date.parse('2026-12-01')});
 try{const core=await run('core');assert.equal(core.statusCode,200);assert.equal(JSON.parse(core.body).skillsets.checked,0);assert.equal(calls.length,3);const tags=await run('tags');assert.equal(tags.statusCode,200);const stats=JSON.parse(tags.body).skillsets;assert.equal(stats.checked,1);assert.equal(stats.tagged,0);assert.equal(calls.length,4);}finally{globalThis.fetch=original;}
});
