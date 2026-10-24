import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {seal} from '../netlify/functions/wrapped/security.mjs';
process.env.WRAPPED_SESSION_SECRET='replay-test-only-secret-at-least-32-characters';
const event=(extra={})=>({path:'/api/replay',httpMethod:'GET',headers:{},...extra});
const headers=()=>({cookie:'wrapped_session='+seal({kind:'session',token:'private-test-token',exp:Date.now()+60000})});
test('replay downloads require login and a numeric score ID',async()=>{
 assert.equal((await handler(event())).statusCode,401);
 assert.equal((await handler(event({headers:headers(),queryStringParameters:{id:'https://example.com'}}))).statusCode,400);
});
test('replay download refuses another user’s score without downloading its replay',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async url=>{calls.push(url);return new Response(JSON.stringify(url.endsWith('/me')?{id:123}:{user_id:999,has_replay:true}),{headers:{'content-type':'application/json'}});};
 try{const result=await handler(event({headers:headers(),queryStringParameters:{id:'456'}}));assert.equal(result.statusCode,403);assert.equal(calls.length,2);assert.ok(!calls.some(url=>url.endsWith('/download')));}finally{globalThis.fetch=original;}
});
test('replay endpoint streams own replay bytes without exposing the token',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{
  assert.equal(options.headers.Authorization,'Bearer private-test-token');
  if(url.endsWith('/download')){assert.equal(options.redirect,'error');return new Response(new Uint8Array([0,1,2,3]),{headers:{'content-type':'application/octet-stream'}});}
  return new Response(JSON.stringify(url.endsWith('/me')?{id:123}:{user_id:123,has_replay:true}),{headers:{'content-type':'application/json'}});
 };
 try{const result=await handler(event({headers:headers(),queryStringParameters:{id:'456'}}));assert.equal(result.statusCode,200);assert.equal(result.isBase64Encoded,true);assert.equal(Buffer.from(result.body,'base64').length,4);assert.equal(result.headers['Cache-Control'],'no-store');assert.ok(!JSON.stringify(result).includes('private-test-token'));}finally{globalThis.fetch=original;}
});
test('unavailable replay returns a readable error before any download',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>new Response(JSON.stringify(url.endsWith('/me')?{id:123}:{user_id:123,has_replay:false}),{headers:{'content-type':'application/json'}});
 try{assert.equal((await handler(event({headers:headers(),queryStringParameters:{id:'456'}}))).statusCode,404);}finally{globalThis.fetch=original;}
});


test('global replay permits a listed public score but refuses scores outside the global list',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,options)=>{calls.push(url);
  if(url.includes('/rankings/top-plays/'))return new Response('<div data-props="'+JSON.stringify({scores:[{id:991,user_id:999,beatmap_id:20,ruleset_id:0,pp:100,ended_at:'2026-01-01T00:00:00Z'}]}).replace(/"/g,'&quot;')+'"></div>');
  if(url.endsWith('/download'))return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'application/octet-stream'}});
  if(url.endsWith('/scores/991'))return Response.json({user_id:999,has_replay:true});
  throw Error('Unexpected request');
 };
 try{
  assert.equal((await handler(event({path:'/api/osu-wrapped/global-replay',headers:headers(),queryStringParameters:{id:'991',mode:'osu'}}))).statusCode,200);
  calls.length=0;assert.equal((await handler(event({path:'/api/osu-wrapped/global-replay',headers:headers(),queryStringParameters:{id:'992',mode:'osu'}}))).statusCode,403);assert.ok(!calls.some(url=>url.endsWith('/download')));
 }finally{globalThis.fetch=original;}
});
