import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {handler} from '../netlify/functions/wrapped-api.mjs';
const event=(path,extra={})=>({path,httpMethod:'GET',headers:{},...extra});
test('Wrapped subpage uses independent routes, assets, and credentials',async()=>{
 const html=await readFile(new URL('../osu-wrapped/index.html',import.meta.url),'utf8');
 const main=await readFile(new URL('../osu-wrapped/src/main.js',import.meta.url),'utf8');
 const recap=await readFile(new URL('../osu-wrapped/src/recap.js',import.meta.url),'utf8');
 assert.ok(html.includes('/osu-wrapped/src/main.js'));assert.ok(html.includes('/osu-wrapped/src/style.css'));
 assert.ok(main.includes('/api/osu-wrapped/wrapped'));assert.ok(main.includes('href="/osu-wrapped/"'));assert.ok(main.includes('href="/"'));assert.ok(recap.includes('/api/osu-wrapped/avatar'));
 assert.equal((await handler(event('/api/osu-wrapped/wrapped'))).statusCode,401);
 assert.equal((await handler(event('/.netlify/functions/wrapped-api/wrapped'))).statusCode,401);
 process.env.OSU_CLIENT_ID='existing-social-client';process.env.OSU_CLIENT_SECRET='existing-social-secret';
 delete process.env.WRAPPED_OSU_CLIENT_ID;delete process.env.WRAPPED_OSU_CLIENT_SECRET;
 assert.equal((await handler(event('/api/osu-wrapped/auth/login'))).statusCode,503);
});
test('new OAuth client uses namespaced callback and returns to the subpage',async()=>{
 process.env.WRAPPED_OSU_CLIENT_ID='new-wrapped-client';process.env.WRAPPED_OSU_CLIENT_SECRET='new-private-secret';
 process.env.WRAPPED_OSU_REDIRECT_URI='https://ronaldonater.com/api/osu-wrapped/auth/callback';
 process.env.WRAPPED_SESSION_SECRET='test-private-session-secret-at-least-32-characters';
 const login=await handler(event('/api/osu-wrapped/auth/login'));
 const authorize=new URL(login.headers.Location);
 assert.equal(authorize.searchParams.get('client_id'),'new-wrapped-client');assert.equal(authorize.searchParams.get('redirect_uri'),process.env.WRAPPED_OSU_REDIRECT_URI);
 const cookie=login.multiValueHeaders['Set-Cookie'][0].split(';')[0];assert.ok(cookie.startsWith('wrapped_state='));
 const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.client_id,'new-wrapped-client');assert.equal(body.redirect_uri,process.env.WRAPPED_OSU_REDIRECT_URI);return new Response(JSON.stringify({access_token:'test-private-access',expires_in:3600}),{headers:{'content-type':'application/json'}});};
 try{
 const callback=await handler(event('/api/osu-wrapped/auth/callback',{headers:{cookie},queryStringParameters:{code:'test-code',state:authorize.searchParams.get('state')}}));
 assert.equal(callback.headers.Location,'/osu-wrapped/?connected=1');assert.ok(callback.multiValueHeaders['Set-Cookie'][0].startsWith('wrapped_session='));assert.ok(!JSON.stringify(callback).includes('test-private-access'));
 }finally{globalThis.fetch=original;}
});
