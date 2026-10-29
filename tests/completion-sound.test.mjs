import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompletionSound} from '../osu-wrapped/src/completion-sound.js';
test('completion chime requires an unlocked context and an away/demo completion, respecting mute and volume',()=>{
 const starts=[],levels=[],tones=[];let created=0;
 const context={state:'suspended',currentTime:1,destination:{},resume(){this.state='running';return Promise.resolve();},createOscillator(){const tone={frequency:{},connect(){},disconnect(){},start(time){starts.push(time);},stop(){}};tones.push(tone);return tone;},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(level){levels.push(level);},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
 const sound=createCompletionSound({contextFactory:()=>{created++;return context;}});
 assert.equal(sound.play({hidden:true}),false);assert.equal(created,0);
 sound.unlock();assert.equal(created,1);
 assert.equal(sound.play(),false);assert.equal(sound.play({demo:true,muted:true}),false);assert.equal(sound.play({hidden:true,volume:0}),false);
 assert.equal(sound.play({demo:true,volume:.5}),true);assert.equal(starts.length,2);assert.deepEqual(levels,[.065,.065]);
 tones.forEach(tone=>tone.onended());context.state='suspended';assert.equal(sound.play({hidden:true}),false);assert.equal(starts.length,2);
});
test('unsupported audio does not interrupt generation',()=>{const sound=createCompletionSound({contextFactory:()=>null});sound.unlock();assert.equal(sound.play({demo:true}),false);});
