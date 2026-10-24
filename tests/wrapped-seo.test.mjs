import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Wrapped landing is indexable with canonical metadata and static public content',()=>{
 const html=read('osu-wrapped/index.html');
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.ok(html.includes('href="https://ronaldonater.com/osu-wrapped/"'));
 assert.ok(html.includes('content="index,follow,max-image-preview:large"'));
 assert.ok(html.includes('<h1>osu! Wrapped 2026</h1>'));
 assert.ok(html.includes('current top 200'));
 assert.ok(!html.includes('content="noindex'));
});
test('crawler files list canonical public pages and keep APIs separate',()=>{
 const robots=read('robots.txt'),sitemap=read('sitemap.xml');
 assert.ok(robots.includes('Sitemap: https://ronaldonater.com/sitemap.xml'));
 assert.ok(robots.includes('Disallow: /api/'));
 assert.ok(!robots.includes('Disallow: /osu-wrapped/'));
 assert.ok(sitemap.includes('<loc>https://ronaldonater.com/osu-wrapped/</loc>'));
 assert.ok(!sitemap.includes('/api/'));
 assert.ok(read('pages/dev.html').includes('href="https://ronaldonater.com/osu-wrapped/"'));
});
