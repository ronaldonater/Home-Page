import test from 'node:test';
import assert from 'node:assert/strict';
import {createSecretPlayback} from '../osu-wrapped/src/secret-playback.js';
test('secret pauses a playing slideshow and resumes exactly once, including repeated starts',()=>{
 let paused=false,open=true,pauses=0,resumes=0;
 const control=createSecretPlayback({isPaused:()=>paused,isOpen:()=>open,pause:()=>{paused=true;pauses++;},resume:()=>{paused=false;resumes++;}});
 control.start();assert.equal(paused,true);assert.equal(control.active,true);control.start();assert.equal(pauses,1);control.finish();assert.equal(paused,false);assert.equal(resumes,1);control.finish();assert.equal(resumes,1);
 paused=true;control.start();control.finish();assert.equal(paused,true);assert.equal(resumes,1);
 paused=false;control.start();open=false;control.finish();assert.equal(resumes,1);
});
