import test from 'node:test';
import assert from 'node:assert/strict';
import {handler as appHandler} from '../netlify/functions/wrapped/api-handler.mjs';
const handler=event=>appHandler(event,{now:()=>Date.parse('2026-12-01T00:00:00Z')});
import {seal} from '../netlify/functions/wrapped/security.mjs';
process.env.WRAPPED_SESSION_SECRET='test-session-secret-at-least-32-characters';
const event=(path,extra={})=>({path,headers:{},httpMethod:'GET',...extra});
test('API requires a session and validates rulesets',async()=>{
 assert.equal((await handler(event('/api/wrapped'))).statusCode,401);
 const headers={cookie:`wrapped_session=${seal({kind:'session',token:'test',exp:Date.now()+10000})}`};
 assert.equal((await handler(event('/api/wrapped',{headers,queryStringParameters:{mode:'invalid'}}))).statusCode,400);
});
test('OAuth rejects invalid state before exchanging any token',async()=>{
 const r=await handler(event('/api/auth/callback',{queryStringParameters:{code:'bad',state:'bad'}}));
 assert.equal(r.statusCode,302);assert.equal(r.headers.Location,'/osu-wrapped/?error=login');
});
test('logout rejects cross-origin requests',async()=>{
 process.env.WRAPPED_OSU_REDIRECT_URI='https://example.netlify.app/api/auth/callback';
 assert.equal((await handler(event('/api/auth/logout',{httpMethod:'POST',headers:{origin:'https://attacker.example'}}))).statusCode,403);
 const r=await handler(event('/api/auth/logout',{httpMethod:'POST',headers:{origin:'https://example.netlify.app'}}));
 assert.equal(r.statusCode,200);assert.match(r.headers['Set-Cookie'],/Max-Age=0/);
});
test('wrapped fetch uses authenticated identity and selected mode',async()=>{
 const original=globalThis.fetch;const requests=[];
 globalThis.fetch=async(url,options)=>{requests.push([url,options.headers.Authorization]);return {ok:true,json:async()=>url.includes('/me/')?{id:123,username:'test',monthly_playcounts:[]}:[]};};
 try{
 const headers={cookie:`wrapped_session=${seal({kind:'session',token:'private-token',exp:Date.now()+10000})}`};
 const r=await handler(event('/.netlify/functions/wrapped-api/wrapped',{headers,queryStringParameters:{mode:'mania'}}));
 requests.splice(0,requests.length,...requests.filter(([url])=>url.includes('/me/')||url.includes('/scores/best?')));
 assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).mode,'mania');assert.equal(requests.length,3);assert.ok(requests[0][0].endsWith('/me/mania'));assert.ok(requests[1][0].includes('/users/123/'));assert.ok(requests[1][0].includes('offset=0'));assert.ok(requests[2][0].includes('offset=100'));assert.deepEqual(requests.slice(1).map(([url])=>Number(new URL(url).searchParams.get('offset'))),Array.from({length:2},(_,i)=>i*100));assert.ok(requests.slice(1).every(([url])=>new URL(url).searchParams.get('legacy_only')==='0'));assert.ok(requests.slice(1).every(([url])=>url.includes('/scores/best?')));assert.equal(requests[0][1],'Bearer private-token');assert.equal(r.headers['Cache-Control'],'no-store');assert.ok(!r.body.includes('private-token'));
 }finally{globalThis.fetch=original;}
});


test('avatar endpoint returns canvas-safe image bytes and rejects invalid IDs',async()=>{
 assert.equal((await handler(event('/api/avatar',{queryStringParameters:{id:'https://bad.example'}}))).statusCode,400);
 const original=globalThis.fetch;
 let requested;
 globalThis.fetch=async url=>{requested=url;return new Response(new Uint8Array([137,80,78,71]),{headers:{'content-type':'image/png'}});};
 try{
 const result=await handler(event('/api/avatar',{queryStringParameters:{id:'123'}}));
 assert.equal(requested,'https://a.ppy.sh/123');assert.equal(result.statusCode,200);assert.equal(result.headers['Content-Type'],'image/png');assert.equal(result.isBase64Encoded,true);assert.equal(Buffer.from(result.body,'base64').length,4);
 globalThis.fetch=async()=>new Response('<html>error</html>',{headers:{'content-type':'text/html'}});
 assert.equal((await handler(event('/api/avatar',{queryStringParameters:{id:'123'}}))).statusCode,502);
 }finally{globalThis.fetch=original;}
});

test('recap covers proxy only accepts osu beatmap cover images',async()=>{
 for(const url of ['https://example.com/image.jpg','https://assets.ppy.sh/other.jpg','https://assets.ppy.sh.evil.example/beatmaps/1/covers/cover.jpg']){
  assert.equal((await handler(event('/api/cover',{queryStringParameters:{url}}))).statusCode,400);
 }
 const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://assets.ppy.sh/beatmaps/123/covers/cover@2x.jpg');assert.equal(options.redirect,'error');return new Response(new Uint8Array([255,216,255]),{headers:{'content-type':'image/jpeg'}});};
 try{const result=await handler(event('/api/cover',{queryStringParameters:{url:'https://assets.ppy.sh/beatmaps/123/covers/cover@2x.jpg?1738291000#cache'}}));assert.equal(result.statusCode,200);assert.equal(result.isBase64Encoded,true);assert.equal(result.headers['Content-Type'],'image/jpeg');}finally{globalThis.fetch=original;}
});

test('initial Wrapped uses the profile preferred mode with a safe fallback',async()=>{
 const original=globalThis.fetch;
 try{for(const [preferred,expected] of [['mania','mania'],['taiko','taiko'],['fruits','fruits'],['invalid','osu'],[undefined,'osu']]){
 const requests=[];globalThis.fetch=async url=>{requests.push(url);return {ok:true,json:async()=>url.endsWith('/me')?{id:123,username:'test',playmode:preferred,monthly_playcounts:[]}:[]};};
 const headers={cookie:'wrapped_session='+seal({kind:'session',token:'test-token-'+String(preferred),exp:Date.now()+30000})};
 const response=await handler(event('/api/wrapped',{headers}));assert.equal(response.statusCode,200);assert.equal(JSON.parse(response.body).mode,expected);assert.ok(requests[0].endsWith('/me'));assert.ok(requests.filter(url=>url.includes('/scores/best?')).every(url=>new URL(url).searchParams.get('mode')===expected));
 }}finally{globalThis.fetch=original;}
});
