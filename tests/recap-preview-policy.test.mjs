import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('production image policy allows generated recap blob previews without relaxing script policy',()=>{
 const config=readFileSync(new URL('../netlify.toml',import.meta.url),'utf8');
 const policy=config.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)?.[1];assert.ok(policy);
 const images=policy.split(';').find(d=>d.trim().startsWith('img-src '));assert.ok(images.split(/\s+/).includes('blob:'));
 assert.equal(policy.split(';').find(d=>d.trim().startsWith('script-src ')).trim(),"script-src 'self'");
});
