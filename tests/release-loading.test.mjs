import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const source=(await readFile(new URL('../osu-wrapped/src/release-entry.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/,'').replace("await import('./main.js')","await loadMain()");
async function start(outcome){
 let resolve;const reply=new Promise(done=>resolve=done);let loaded=0;
 const message={textContent:''};const root={innerHTML:'',querySelector(selector){if(selector==='.release-message')return message;if(selector==='.release-clock')return this.innerHTML.includes('role="timer"')?{}:null;return null;},querySelectorAll(){return [];}};
 const context={document:{querySelector:()=>root,addEventListener(){},removeEventListener(){},hidden:false},location:{search:'',reload(){}},URLSearchParams,Date,setInterval:()=>1,clearInterval(){},fetch:()=>reply,updateReleaseAccess(){},loadMain:async()=>{loaded++;root.innerHTML='APP';}};
 runInNewContext(source,context);
 assert.match(root.innerHTML,/Loading osu! Wrapped/);assert.ok(!root.innerHTML.includes('November 29'));assert.ok(!root.innerHTML.includes('login here'));
 resolve(outcome);await new Promise(done=>setImmediate(done));return {root,message,loaded};
}
const status=allowed=>({ok:true,json:async()=>({allowed,serverNow:Date.parse('2026-10-30T00:00:00Z'),releaseAt:'2026-11-29T00:00:00.000Z'})});
test('access check opens admitted visitors without rendering the countdown',async()=>{const result=await start(status(true));assert.equal(result.loaded,1);assert.equal(result.root.innerHTML,'APP');});
test('countdown only renders after access is denied',async()=>{const result=await start(status(false));assert.equal(result.loaded,0);assert.match(result.root.innerHTML,/November 29/);assert.match(result.root.innerHTML,/login here/);});
test('failed access check stays neutral with a retry message',async()=>{const result=await start({ok:false});assert.equal(result.loaded,0);assert.match(result.root.innerHTML,/Loading osu! Wrapped/);assert.match(result.message.textContent,/Retrying/);});
