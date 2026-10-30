// Manual maintainer capture. Demo visitors play these static previews without third-party requests.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {demo} from '../osu-wrapped/src/demo.js';
import {experienceSlides} from '../osu-wrapped/src/experience.js';
import {imageBytes} from '../netlify/functions/wrapped/hardening.mjs';
const urls=[...new Set(['osu','taiko','fruits','mania'].flatMap(mode=>experienceSlides({...demo(mode),demo:false}).map(slide=>slide.preview).filter(Boolean)))];
const folder=new URL('../osu-wrapped/sounds/demo/',import.meta.url);await fs.mkdir(folder,{recursive:true});const assets={};let bytesTotal=0;
for(const source of urls){
 const url=new URL(source);if(url.origin!=='https://b.ppy.sh'||url.username||url.password||!/^\/preview\/[1-9]\d*\.mp3$/.test(url.pathname))throw Error('Unexpected demo preview URL');
 let bytes,extension;
 for(let attempt=0;attempt<3;attempt++)try{
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Preview download failed: '+response.status);
  const type=response.headers.get('content-type')?.split(';')[0].toLowerCase();if(!['audio/mpeg','audio/mp3','audio/ogg','application/ogg','application/octet-stream'].includes(type))throw Error('Unexpected audio format');
  bytes=await imageBytes(response,5*1024*1024);extension=bytes.subarray(0,4).toString()==='OggS'?'ogg':(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224))?'mp3':null;if(!extension)throw Error('Invalid preview audio');break;
 }catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,1000));}
 const name=createHash('sha256').update(source).digest('hex').slice(0,24)+'.'+extension;await fs.writeFile(new URL(name,folder),bytes);assets[source]='/osu-wrapped/sounds/demo/'+name;bytesTotal+=bytes.length;console.log(Object.keys(assets).length+'/'+urls.length+' demo previews saved');
}
const target=new URL('../osu-wrapped/src/data/demo-audio.json',import.meta.url),temp=new URL('../osu-wrapped/src/data/demo-audio.json.tmp',import.meta.url);await fs.writeFile(temp,JSON.stringify({capturedAt:new Date().toISOString(),assets},null,2)+'\n');await fs.rename(temp,target);console.log(JSON.stringify({previews:urls.length,bytes:bytesTotal}));
