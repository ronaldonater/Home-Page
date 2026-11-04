import test from 'node:test';
import assert from 'node:assert/strict';
import {createDatabaseDiagnostics} from '../netlify/functions/wrapped/database-diagnostics.mjs';
import {createDatabaseReporter} from '../osu-wrapped/src/database-status.js';
test('server database warnings omit secrets, retain safe SQL codes, and throttle per feature',()=>{
 let time=0;const lines=[];const report=createDatabaseDiagnostics({warn:value=>lines.push(value),now:()=>time});
 const error=Object.assign(Error('postgres://user:secret@host SQL params token-private'),{code:'42P01'});
 report('profile queue',error);report('profile queue',error);report('community',error);
 assert.equal(lines.length,2);assert.ok(lines[0].includes('42P01'));assert.ok(lines.every(line=>!line.includes('secret@')&&!line.includes('token-private')));
 time=60000;report('profile queue',error);assert.equal(lines.length,3);
});
test('browser issues only one warning across repeated failures and different features',()=>{
 const lines=[];const report=createDatabaseReporter({warn:value=>lines.push(value)});
 report(new Response(),{clubCommunity:{status:'disabled'}});assert.equal(lines.length,0);
 const response=new Response(null,{headers:{'X-Wrapped-Database-Status':'unavailable'}});
 const body={clubCommunity:{status:'unavailable'},mapping:{community:{status:'unavailable'}},user:{username:'private-name'}};
 report(response,body);report(response,body);report(new Response(),{clubCommunity:{status:'unavailable'}});
 assert.equal(lines.length,1);assert.ok(lines[0].includes('fallback'));assert.ok(!lines[0].includes('private-name'));
});
