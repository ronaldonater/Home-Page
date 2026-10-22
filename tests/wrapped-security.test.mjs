import test from 'node:test';
import assert from 'node:assert/strict';
import api,{config} from '../netlify/functions/wrapped-api.mjs';
import {handler} from '../netlify/functions/wrapped/api-handler.mjs';
import {seal,unseal,cookie} from '../netlify/functions/wrapped/security.mjs';
import {imageBytes,callbackUrl} from '../netlify/functions/wrapped/hardening.mjs';
process.env.WRAPPED_SESSION_SECRET='security-test-only-secret-at-least-32-characters';
process.env.WRAPPED_OSU_REDIRECT_URI='https://example.com/api/auth/callback';
const event=(path,extra={})=>({path,httpMethod:'GET',headers:{},...extra});
test('API methods reject unwanted state-changing and costly requests',async()=>{
 for(const path of ['/api/wrapped','/api/avatar','/api/cover','/api/auth/login','/api/auth/callback'])assert.equal((await handler(event(path,{httpMethod:'POST'}))).statusCode,405);
 assert.equal((await handler(event('/api/auth/logout'))).statusCode,405);
});
test('cross-site subresource requests are denied but OAuth navigation remains possible',async()=>{
 const result=await handler(event('/api/wrapped',{headers:{'sec-fetch-site':'cross-site','sec-fetch-mode':'no-cors'}}));assert.equal(result.statusCode,403);
 const callback=await handler(event('/api/auth/callback',{headers:{'sec-fetch-site':'cross-site','sec-fetch-mode':'navigate'}}));assert.equal(callback.statusCode,302);
});
test('OAuth state cookies cannot be reused as session cookies',async()=>{
 const value=seal({kind:'oauth-state',state:'a'.repeat(48),exp:Date.now()+60000});
 const result=await handler(event('/api/wrapped',{headers:{cookie:'wrapped_session='+value}}));assert.equal(result.statusCode,401);
});
test('malformed Unicode OAuth state is rejected without token exchange or server error',async()=>{
 const state=seal({kind:'oauth-state',state:'a'.repeat(48),exp:Date.now()+60000});
 const result=await handler(event('/api/auth/callback',{headers:{cookie:'wrapped_state='+state},queryStringParameters:{state:'é'.repeat(48),code:'test'}}));
 assert.equal(result.statusCode,302);assert.equal(result.headers.Location,'/osu-wrapped/?error=login');
});
test('oversized cookies and non-finite expiry cannot create sessions',()=>{
 assert.equal(unseal('a'.repeat(5000)),null);assert.equal(unseal(seal({exp:'999999999999999'})),null);
});
test('production cookies are HttpOnly, Secure, SameSite and host-only',()=>{
 const value=cookie('wrapped_session','test',3600);assert.match(value,/HttpOnly/);assert.match(value,/; Secure/);assert.match(value,/SameSite=Lax/);assert.ok(!value.includes('Domain='));
});
test('callback configuration permits local HTTP only and rejects credentials and fragments',()=>{
 const previous=process.env.CONTEXT;delete process.env.CONTEXT;
 try{assert.equal(callbackUrl('http://localhost:8888/api/auth/callback').protocol,'http:');for(const value of ['http://example.com/callback','https://user:pass@example.com/callback','https://example.com/callback#x'])assert.throws(()=>callbackUrl(value));process.env.CONTEXT='production';assert.throws(()=>callbackUrl('http://localhost:8888/callback'));}finally{if(previous===undefined)delete process.env.CONTEXT;else process.env.CONTEXT=previous;}
});
test('image streaming rejects declared and chunked oversized responses before buffering everything',async()=>{
 let cancelled=false;
 const body=new ReadableStream({cancel(){cancelled=true;}});
 await assert.rejects(imageBytes(new Response(body,{headers:{'content-length':'2097153'}})));assert.equal(cancelled,true);
 let part=0,cancelledChunks=false;
 const chunks=new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(part++===0?2097152:1));},cancel(){cancelledChunks=true;}});
 await assert.rejects(imageBytes(new Response(chunks)));assert.equal(cancelledChunks,true);
 assert.equal((await imageBytes(new Response(new Uint8Array([1,2,3])))).length,3);
});
test('avatar proxy refuses upstream redirects',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{assert.equal(options.redirect,'error');return new Response(new Uint8Array([1]),{headers:{'content-type':'image/png'}});};
 try{assert.equal((await handler(event('/api/avatar',{queryStringParameters:{id:'123'}}))).statusCode,200);}finally{globalThis.fetch=original;}
});
test('Fetch API wrapper preserves auth denial and security response headers',async()=>{
 const result=await api(new Request('https://example.com/api/wrapped'));assert.equal(result.status,401);assert.equal(result.headers.get('cache-control'),'no-store');assert.equal(result.headers.get('x-content-type-options'),'nosniff');
 assert.equal(config.rateLimit.windowLimit,120);assert.deepEqual(config.rateLimit.aggregateBy,['ip','domain']);
});
