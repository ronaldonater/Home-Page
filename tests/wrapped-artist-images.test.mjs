import test from 'node:test';
import assert from 'node:assert/strict';
import {createArtistImageService} from '../netlify/functions/wrapped/artist-images.mjs';
test('artist artwork validates names and only fetches an exact artist on an approved image host',async()=>{
 let calls=0;const service=createArtistImageService({fetchImpl:async()=>{calls++;return Response.json({artists:[{strArtist:'Someone Else',strArtistThumb:'https://r2.theaudiodb.com/images/media/artist/thumb/test.jpg'}]});}});
 assert.equal((await service('')).statusCode,400);assert.equal(calls,0);assert.equal((await service('Artist')).statusCode,404);assert.equal((await service('Artist')).statusCode,404);assert.equal(calls,1);
 const hostile=createArtistImageService({fetchImpl:async()=>Response.json({artists:[{strArtist:'Artist',strArtistThumb:'https://example.com/private.jpg'}]})});assert.equal((await hostile('Artist')).statusCode,404);
});
test('artist artwork caches successful bounded image downloads and coalesces requests',async()=>{
 const urls=[];const service=createArtistImageService({fetchImpl:async url=>{urls.push(url);return urls.length===1?Response.json({artists:[{strArtist:'Artist',strArtistThumb:'https://r2.theaudiodb.com/images/media/artist/thumb/test.jpg'}]}):new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/jpeg'}});}});
 const [first,second]=await Promise.all([service('Artist'),service('ARTIST')]);assert.equal(first.statusCode,200);assert.deepEqual(first,second);assert.equal(first.isBase64Encoded,true);assert.equal(urls.length,2);assert.ok(urls[1].endsWith('/small'));assert.equal((await service('Artist')).statusCode,200);assert.equal(urls.length,2);
});
test('artist artwork rejects oversized downloads and limits uncached upstream lookups',async()=>{
 let calls=0;const service=createArtistImageService({fetchImpl:async()=>{calls++;return Response.json({artists:null});}});for(let n=0;n<25;n++)await service('Artist '+n);assert.equal((await service('Another')).statusCode,429);assert.equal(calls,25);
 const large=createArtistImageService({fetchImpl:async()=>new Response('x',{headers:{'content-length':'600000'}})});assert.equal((await large('Artist')).statusCode,502);
});
