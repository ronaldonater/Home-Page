import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const pages=[['index.html','/'],['pages/dev.html','/dev'],['pages/social.html','/social'],['pages/osu-ahr.html','/osu-ahr'],['osu-wrapped/index.html','/osu-wrapped/']];
test('every public page has unique canonical metadata and is included in the sitemap',()=>{
 const sitemap=read('sitemap.xml'),titles=new Set(),descriptions=new Set();
 for(const [file,path] of pages){const html=read(file),url='https://ronaldonater.com'+path;
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1,file);
 assert.ok(html.includes('href="'+url+'"'),file);assert.ok(sitemap.includes('<loc>'+url+'</loc>'),file);
 const title=html.match(/<title>([^<]+)<\/title>/)?.[1],description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(title&&description,file);titles.add(title);descriptions.add(description);
 assert.ok(html.includes('content="index,follow,max-image-preview:large"'),file);assert.ok(!/content="noindex/.test(html),file);
 }assert.equal(titles.size,pages.length);assert.equal(descriptions.size,pages.length);
});
test('public navigation uses discoverable links and crawling rules keep APIs separate',()=>{
 for(const file of ['index.html','pages/dev.html','pages/social.html'])assert.ok(!read(file).includes('onclick="window.location.href='),file);
 const home=read('index.html');assert.ok(home.includes('href="/dev"'));assert.ok(home.includes('href="/social"'));
 const dev=read('pages/dev.html');assert.ok(dev.includes('href="/osu-ahr"'));assert.ok(dev.includes('href="https://ronaldonater.com/osu-wrapped/"'));
 const robots=read('robots.txt');assert.ok(robots.includes('Allow: /'));assert.ok(robots.includes('Sitemap: https://ronaldonater.com/sitemap.xml'));assert.ok(robots.includes('Disallow: /api/'));
});
