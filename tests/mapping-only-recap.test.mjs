import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecap} from '../osu-wrapped/src/recap.js';
test('mapping-only recap renders mapping details without score-based placeholders',async()=>{
 const labels=[];const ctx=new Proxy({measureText:t=>({width:t.length*8}),fillText:t=>labels.push(t)}, {get:(target,key)=>key in target?target[key]:(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
 const canvas={getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))};
 const oldDocument=globalThis.document,oldPath=globalThis.Path2D;
 globalThis.document={createElement:()=>canvas};globalThis.Path2D=class{};
 try{const blob=await createRecap({sampleCount:0,user:{id:0,username:'Mapper'},mapping:{status:'ready',created:2,ranked:0,totalPlays:419}});
 assert.equal(blob.type,'image/png');assert.equal(canvas.height,1022);assert.ok(labels.includes('First Draft Society'));assert.ok(labels.includes('419'));assert.ok(!labels.includes('FAVORITE MOD'));assert.ok(!labels.includes('AVERAGE ACCURACY'));
 }finally{globalThis.document=oldDocument;globalThis.Path2D=oldPath;}
});
