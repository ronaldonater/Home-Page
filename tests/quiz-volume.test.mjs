import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuizSounds} from '../osu-wrapped/src/quiz-sounds.js';
test('quiz volume controls Web Audio gain and fallback players without losing mute state',()=>{
 const previousAudio=globalThis.Audio,previousWindow=globalThis.window,previousFetch=globalThis.fetch;
 const players=[];const gain={gain:{value:0},connect(){}};
 globalThis.Audio=class{constructor(){players.push(this);}load(){}pause(){}removeAttribute(){}play(){return Promise.resolve();}};
 globalThis.window={AudioContext:class{constructor(){this.state='running';this.destination={};}createGain(){return gain;}close(){return Promise.resolve();}}};
 globalThis.fetch=async()=>({ok:false});
 try{const sounds=createQuizSounds(['pass','miss']);sounds.setVolume(.4);assert.equal(gain.gain.value,.65*.4);assert.ok(players.every(audio=>audio.volume===.65*.4));sounds.setMuted(true);assert.equal(gain.gain.value,0);sounds.setVolume(.2);assert.equal(gain.gain.value,0);assert.ok(players.every(audio=>audio.muted));sounds.setMuted(false);assert.equal(gain.gain.value,.65*.2);sounds.play(true);assert.equal(gain.gain.value,.65*.2);sounds.setVolume(0);assert.equal(gain.gain.value,0);sounds.dispose();}finally{globalThis.Audio=previousAudio;globalThis.window=previousWindow;globalThis.fetch=previousFetch;}
});
