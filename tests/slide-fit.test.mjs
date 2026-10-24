import test from 'node:test';
import assert from 'node:assert/strict';
import {slideFitScale} from '../osu-wrapped/src/slide-fit.js';
test('slides fit mobile, landscape, and desktop stages without upscaling',()=>{
 for(const [cw,ch,vw,vh] of [[374,1100,390,540],[824,900,844,220],[900,680,1700,760],[300,1500,320,300]]){
  const scale=slideFitScale(cw,ch,vw,vh);assert.ok(scale>0&&scale<=1);assert.ok(cw*scale<=vw-16+1e-7);assert.ok(ch*scale<=vh-16+1e-7);
 }
 assert.equal(slideFitScale(500,300,1000,800),1);
});
test('fitting safely ignores hidden or unmeasured stages',()=>{assert.equal(slideFitScale(300,0,390,600),1);assert.equal(slideFitScale(300,500,0,600),1);assert.equal(slideFitScale(NaN,500,390,600),1);});
