import test from 'node:test';
import assert from 'node:assert/strict';
import {createSlideImagePool} from '../src/slide-image-pool.js';
test('nearby image preload deduplicates URLs, bounds concurrent work, and waits for decoding',async()=>{
 const images=[];let decodeDone;
 class FakeImage {constructor(){images.push(this);}decode(){return new Promise(resolve=>decodeDone=resolve);}}
 const pool=createSlideImagePool([['a','b'],['a','c'],['d'],['e'],['far']],{ImageImpl:FakeImage,concurrency:2});
 try{pool.prepare(0);assert.deepEqual(images.map(i=>i.src),['a','b']);assert.equal(images[0].referrerPolicy,'no-referrer');images[0].onload();await Promise.resolve();assert.equal(images.length,2);decodeDone();await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(images.map(i=>i.src),['a','b','c']);images[1].onerror();assert.deepEqual(images.map(i=>i.src),['a','b','c','d']);pool.prepare(0);assert.equal(images.length,4);pool.dispose();images[2].onerror?.();assert.equal(images.length,4);pool.prepare(4);assert.equal(images.length,4);}finally{pool.dispose();}
});
test('a stalled image cannot block subsequent preloading',async()=>{
 const images=[];class FakeImage {constructor(){images.push(this);}}
 const pool=createSlideImagePool([['stalled','next']],{ImageImpl:FakeImage,concurrency:1,timeout:5});
 try{pool.prepare(0);await new Promise(resolve=>setTimeout(resolve,15));assert.deepEqual(images.map(i=>i.src),['stalled','next']);}finally{pool.dispose();}
});
