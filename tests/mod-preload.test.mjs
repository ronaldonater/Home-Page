import test from 'node:test';
import assert from 'node:assert/strict';
import {preloadModIcons} from '../osu-wrapped/src/mod-preload.js';
test('mod icons preload only known unique icons and reuse decoded images',async()=>{
 const original=globalThis.Image,requests=[];globalThis.Image=class{set src(value){requests.push(value);queueMicrotask(()=>this.onload?.());}decode(){return Promise.resolve();}};
 try{const data={favoriteMod:{mods:['HR']},modUsage:[{mod:'HR'},{mod:'HD'},{mod:'invalid'}],top:[{mods:'HD, DT'}]};
 await preloadModIcons(data);assert.equal(requests.length,3);assert.ok(requests.some(url=>url.endsWith('mod-hard-rock.svg')));await preloadModIcons(data);assert.equal(requests.length,3);
 }finally{globalThis.Image=original;}
});
test('failed mod icons do not block rendering and can be retried',async()=>{
 const original=globalThis.Image;let attempts=0;globalThis.Image=class{set src(value){attempts++;queueMicrotask(()=>this.onerror?.());}};
 try{await preloadModIcons({favoriteMod:{mods:['EZ']}});await preloadModIcons({favoriteMod:{mods:['EZ']}});assert.equal(attempts,2);}finally{globalThis.Image=original;}
});
