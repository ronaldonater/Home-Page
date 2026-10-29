import test from 'node:test';
import assert from 'node:assert/strict';
import {createReleaseAccess} from '../osu-wrapped/src/release-state.js';
const releaseAt='2026-11-29T00:00:00Z',release=Date.parse(releaseAt);
test('owner admin UI expires at the server-derived release deadline without reloading',()=>{
 let time=0,pending,expired=0;
 const access=createReleaseAccess({now:()=>time,schedule:(fn,ms)=>{pending={fn,ms};return 1;},cancel:()=>{},onRelease:()=>expired++});
 access.update({owner:true,releaseAt,serverNow:release-5000});assert.equal(access.state.owner,true);assert.equal(pending.ms,5000);
 time=5000;pending.fn();assert.equal(access.state.owner,false);assert.equal(expired,1);
});
test('public release never shows the owner admin UI and other users never get it',()=>{
 const access=createReleaseAccess({onRelease:()=>{}});
 access.update({owner:true,releaseAt,serverNow:release});assert.equal(access.state.owner,false);
 access.update({owner:false,releaseAt,serverNow:release-5000});assert.equal(access.state.owner,false);
});
