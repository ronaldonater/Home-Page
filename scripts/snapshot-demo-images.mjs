// Maintainer-only image capture for the existing frozen demo snapshot.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {imageBytes} from '../netlify/functions/wrapped/hardening.mjs';
const snapshot=JSON.parse(await fs.readFile(new URL('../osu-wrapped/src/data/demo-snapshot.json',import.meta.url),'utf8'));
const urls=new Set();
function walk(value){if(typeof value==='string'){try{const u=new URL(value);if(u.protocol==='https:'&&((u.hostname==='assets.ppy.sh'&&/\.(?:jpg|jpeg|png|webp|gif)$/i.test(u.pathname))||u.hostname==='a.ppy.sh'))urls.add(value);}catch{}}else if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'){for(const key of ['userId','creatorId'])if(Number.isSafeInteger(value[key])&&value[key]>0)urls.add('https://a.ppy.sh/'+value[key]);Object.values(value).forEach(walk);}}
walk(snapshot);
const folder=new URL('../osu-wrapped/images/demo/',import.meta.url);await fs.mkdir(folder,{recursive:true});
await fs.writeFile(new URL('unavailable.svg',folder),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" rx="12" fill="#292332"/><circle cx="80" cy="36" r="15" fill="#b6a9c2"/><path d="M48 86v-9a32 25 0 0 1 64 0v9" fill="#b6a9c2"/></svg>');
const assets={},missing=[];const entries=[...urls];let cursor=0,complete=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){const url=entries[cursor++];try{
 const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'follow'});
 const type=response.headers.get('content-type')?.split(';')[0],extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'}[type];
 if(!response.ok||!extension||!['assets.ppy.sh','a.ppy.sh'].includes(new URL(response.url).hostname))throw Error('Image unavailable');
 const bytes=await imageBytes(response,2*1024*1024),name=createHash('sha256').update(url).digest('hex').slice(0,24)+'.'+extension;
 await fs.writeFile(new URL(name,folder),bytes);assets[url]='/osu-wrapped/images/demo/'+name;
 }catch{assets[url]='/osu-wrapped/images/demo/unavailable.svg';missing.push(url);}
 if(++complete%25===0)console.log(complete+'/'+entries.length+' demo images saved');
}}));
const manifest={snapshotAt:snapshot.snapshotAt,capturedAt:new Date().toISOString(),assets};
await fs.writeFile(new URL('../osu-wrapped/src/data/demo-images.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log('Saved '+entries.length+' demo image mappings; '+missing.length+' unavailable images use the bundled placeholder.');
