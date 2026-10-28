import test from 'node:test';
import assert from 'node:assert/strict';
import {comboInfo,comboLabel,comboMarkup} from '../osu-wrapped/src/score-combo.js';
import {summarize} from '../osu-wrapped/src/summary.js';
import {normalizeGlobalScores} from '../netlify/functions/wrapped/global-stats.mjs';
import {globalPlaysMarkup} from '../osu-wrapped/src/global.js';
import {demo} from '../osu-wrapped/src/demo.js';
import {experienceSlides} from '../osu-wrapped/src/experience.js';
test('combo display validates counts and only highlights confirmed full combos',()=>{
 assert.deepEqual(comboInfo({max_combo:1234,is_perfect_combo:true}),{combo:1234,fullCombo:true});
 assert.equal(comboLabel({combo:1234,fullCombo:true}),'1,234×');
 assert.equal(comboInfo({max_combo:999,perfect:true}).fullCombo,true);
 for(const score of [{max_combo:1234,accuracy:1,rank:'X'},{max_combo:1234,is_perfect_combo:false},{max_combo:1234,perfect:'1'},{max_combo:-1,perfect:true},{max_combo:1.5,perfect:true},{max_combo:0,perfect:true},{passed:false,max_combo:1234,perfect:true}])assert.equal(comboInfo(score).fullCombo,false);
 assert.equal(comboLabel({}),'Combo unavailable');assert.ok(comboMarkup({combo:1234,fullCombo:true}).includes('is-full-combo'));
});
test('personal and global normalization retain combo metadata and render it in both global lists',()=>{
 const raw={id:1,user_id:2,beatmap_id:3,ruleset_id:0,ended_at:'2026-01-01',pp:300,accuracy:.99,max_combo:1234,is_perfect_combo:true,mods:[],beatmap:{id:3},beatmapset:{title:'Song'}};
 const personal=summarize({id:2,username:'Player'},[raw],'osu');assert.equal(personal.top[0].combo,1234);assert.equal(personal.top[0].fullCombo,true);
 const top=normalizeGlobalScores([raw]);assert.equal(top[0].combo,1234);assert.equal(top[0].fullCombo,true);
 for(const story of [false,true])assert.ok(globalPlaysMarkup({top},{story}).includes('1,234×'));
 const data=demo();data.top=[{...data.top[0],combo:1234,fullCombo:true}];data.globalStats={mode:'osu',top};
 const slides=experienceSlides(data);for(const slide of slides.filter(s=>s.layout==='plays'||s.layout==='global-plays'||s.layout==='global-score'||s.eyebrow==='THE ONE TO REMEMBER'))assert.ok(slide.body.includes('1,234×'),slide.layout||slide.eyebrow);
});
