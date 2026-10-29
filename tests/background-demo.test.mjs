import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../osu-wrapped/src/main.js',import.meta.url),'utf8');
function harness(){
 let options,resolve,reject,requests=0,renders=0,stories=0;
 const notice={innerHTML:''},globalCalls=[];
 const context=vm.createContext({data:null,mode:'osu',modeChosen:true,connected:true,loading:false,liveLoading:false,liveData:null,liveClient:null,crypto:{randomUUID:()=>'12345678-1234-1234-1234-123456789abc'},liveMode:'osu',liveError:'',error:'',statsView:'user',scrollAfterLoad:true,tagProgress:null,waitingProgress:null,detailsProgress:null,loadPhase:'core',globalErrors:new Set(),
  loadReview:opts=>{requests++;options=opts;return new Promise((res,rej)=>{resolve=res;reject=rej;});},
  canViewWrapped:()=>true,completionSound:{play:()=>{}},render:()=>{renders++;},scrollToStats:()=>{},firstExperience:()=>true,startExperience:()=>{stories++;},window:{localStorage:{}},
  demo:mode=>({demo:true,mode,user:{username:'Demo'}}),escape:value=>String(value),document:{querySelector:selector=>selector==='[data-background-wrapped]'?notice:null},
  loadGlobal:async(mode,settings)=>{globalCalls.push({mode,settings});return {mode,top:[]};},preloadArtistImages:async()=>{},preloadModIcons:async()=>{}
 });
 vm.runInContext(source.slice(source.indexOf('function backgroundWrappedText()'),source.indexOf('function loadingMarkup()')),context);
 const demoLine=source.split('\n').find(line=>line.includes("forEach(el=>el.onclick=")&&line.includes("'#demo,#demo-bottom'"));
 vm.runInContext('switchDemo='+demoLine.split('el.onclick=')[1].replace(/\);\s*$/,''),context);
 const personalLine=source.split('\n').find(line=>line.includes("querySelector('#get-wrapped')?.addEventListener"));
 vm.runInContext('switchPersonal='+personalLine.split("addEventListener('click',")[1].replace(/\);\s*$/,''),context);
 return {context,notice,globalCalls,get options(){return options;},get requests(){return requests;},get renders(){return renders;},get stories(){return stories;},resolve,reject,
  complete:data=>resolve({data}),fail:error=>reject(error),personal:()=>context.switchPersonal({preventDefault(){}})};
}
test('demo switching preserves queued live work and restores its latest progress without restarting',async()=>{
 const h=harness(),work=h.context.load();
 h.options.onProgress('waiting',{phase:'core',queue:true,message:'Queue position 2'});
 h.context.switchDemo();assert.equal(h.context.data.demo,true);assert.equal(h.context.loading,false);assert.equal(h.context.liveLoading,true);
 const rendered=h.renders;h.options.onProgress('tags',{checked:4,total:10});assert.equal(h.renders,rendered);
 h.personal();assert.equal(h.context.loading,true);assert.equal(h.context.loadPhase,'tags');assert.equal(h.context.tagProgress.checked,4);
 await h.context.load();assert.equal(h.requests,1);
 h.context.switchDemo();h.context.mode='mania';
 const result={mode:'osu',user:{username:'Real'}};h.complete(result);await work;
 assert.equal(h.context.data.demo,true);assert.equal(h.context.mode,'mania');assert.equal(h.stories,0);assert.match(h.notice.innerHTML,/ready/);
 h.personal();assert.equal(h.context.data,result);assert.equal(h.context.mode,'osu');assert.equal(h.requests,1);assert.equal(h.stories,1);
 h.context.switchDemo();h.personal();assert.equal(h.context.data,result);assert.equal(h.requests,1);
});
test('live preparation bypasses demo global data while demo is displayed',async()=>{
 const h=harness(),work=h.context.load();h.context.switchDemo();
 await h.options.prepare({mode:'taiko',artists:[]});assert.equal(h.globalCalls[0].mode,'taiko');assert.equal(h.globalCalls[0].settings.live,true);
 h.complete({mode:'taiko'});await work;
});
test('background failure leaves demo intact and is shown on returning to personal view',async()=>{
 const h=harness(),work=h.context.load();h.context.switchDemo();h.fail(Error('Session expired'));await work;
 assert.equal(h.context.data.demo,true);assert.equal(h.context.error,'');assert.match(h.notice.innerHTML,/attention/);
 h.personal();assert.equal(h.context.error,'Session expired');assert.equal(h.requests,1);
});
test('live global requests cannot substitute demo snapshots or rerender an open demo',()=>{
 assert.match(source,/if\(data\?\.demo&&!live\)return demoGlobal/);
 assert.ok(!source.includes('button.disabled=loading;'));
 assert.match(source,/if\(!data\?\.demo&&statsView==='global'&&mode===selectedMode\)render/);
});
