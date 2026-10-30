// Maintainer-only capture: these portraits are exclusively for the saved demo.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createArtistImageService} from '../netlify/functions/wrapped/artist-images.mjs';
const snapshot=JSON.parse(await fs.readFile(new URL('../osu-wrapped/src/data/demo-snapshot.json',import.meta.url),'utf8'));
const path=new URL('../osu-wrapped/src/data/demo-images.json',import.meta.url),manifest=JSON.parse(await fs.readFile(path,'utf8'));
const folder=new URL('../osu-wrapped/images/demo/',import.meta.url),names=[...new Set(Object.values(snapshot.modes).flatMap(data=>data.artists.map(artist=>artist.name)))];
const service=createArtistImageService();manifest.artists??={};let portraits=0,fallbacks=0;
for(const name of names){
 const response=await service(name),type=response.headers['Content-Type'],extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[type];
 if(response.statusCode===200&&extension){const file='artist-'+createHash('sha256').update(name).digest('hex').slice(0,24)+'.'+extension;await fs.writeFile(new URL(file,folder),Buffer.from(response.body,'base64'));manifest.artists[name]='/osu-wrapped/images/demo/'+file;portraits++;}
 else{const artist=Object.values(snapshot.modes).flatMap(data=>data.artists).find(artist=>artist.name===name);manifest.artists[name]=manifest.assets[artist.demoImage||artist.cover]||'/osu-wrapped/images/demo/unavailable.svg';fallbacks++;}
 console.log('Saved demo artist '+(portraits+fallbacks)+'/'+names.length);
 await new Promise(resolve=>setTimeout(resolve,2600));
}
try{const response=await fetch('https://a.ppy.sh/0',{signal:AbortSignal.timeout(10000)}),bytes=Buffer.from(await response.arrayBuffer());const type=response.headers.get('content-type')?.split(';')[0],extension={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'}[type];if(!response.ok||!extension||bytes.length>2*1024*1024)throw Error('Default avatar unavailable');const file='demo-player-avatar.'+extension;await fs.writeFile(new URL(file,folder),bytes);manifest.assets['https://a.ppy.sh/0']='/osu-wrapped/images/demo/'+file;}catch{manifest.assets['https://a.ppy.sh/0']='/osu-wrapped/images/demo/unavailable.svg';}
manifest.portraitsCapturedAt=new Date().toISOString();await fs.writeFile(path,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({portraits,fallbacks,artists:names.length}));
