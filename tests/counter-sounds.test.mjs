import test from 'node:test';
import assert from 'node:assert/strict';
import {createCounterSounds} from '../osu-wrapped/src/counter-sounds.js';
class Player{constructor(){this.paused=true;this.currentTime=0;this.plays=0;}load(){}play(){this.paused=false;this.plays++;return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){}}
const parameter=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){}});
test('counter predecodes once, trims silence and uses bounded immediate audio voices',async()=>{
 let time=0,requests=0,context;const starts=[],voices=[];const sample=new Float32Array(2000);sample[10]=.1;
 class Context{constructor(){context=this;this.state='running';this.currentTime=3;this.destination={};this.gains=[];}createGain(){const gain={gain:parameter(),connect(){},disconnect(){}};this.gains.push(gain);return gain;}decodeAudioData(){return Promise.resolve({duration:2,length:2000,sampleRate:1000,numberOfChannels:1,getChannelData:()=>sample});}createBufferSource(){const source={playbackRate:parameter(),connect(){},disconnect(){},start(...args){starts.push(args);},stop(){this.stopped=true;}};voices.push(source);return source;}resume(){return Promise.resolve();}close(){return Promise.resolve();}}
 const sound=createCounterSounds('tick',{AudioClass:Player,Context,now:()=>time,fetchImpl:async()=>{requests++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(0)};}});
 await new Promise(resolve=>setTimeout(resolve,0));sound.play(0);assert.equal(requests,1);assert.equal(starts.length,1);assert.equal(starts[0][0],3);assert.ok(Math.abs(starts[0][1]-.008)<.00001);assert.equal(voices[0].playbackRate.value,.5);
 time=20;sound.play(.5);assert.equal(starts.length,1);time=50;sound.play(1);assert.equal(starts.length,2);assert.equal(voices[1].playbackRate.value,1.6);
 sound.setVolume(.5);assert.equal(context.gains[0].gain.value,.15);sound.setMuted(true);time=100;sound.play(1);assert.equal(starts.length,2);assert.equal(context.gains[0].gain.value,0);
 sound.setMuted(false);context.state='suspended';sound.play(.5);assert.equal(starts.length,2);context.state='running';time=150;sound.play(.5);assert.equal(starts.length,3);
 sound.stop();assert.ok(voices.every(voice=>voice.stopped));sound.dispose();time=200;sound.play(1);assert.equal(starts.length,3);
});
test('fallback skips busy players instead of repeatedly interrupting the same sample',()=>{
 const players=[];class Audio extends Player{constructor(){super();players.push(this);}}
 let time=0;const sound=createCounterSounds('tick',{AudioClass:Audio,Context:null,now:()=>time});sound.play(0);time=20;sound.play(1);assert.equal(players[0].plays,1);assert.equal(players[1].plays,0);time=50;sound.play(1);assert.equal(players[0].plays,1);assert.equal(players[1].plays,1);sound.dispose();
});
