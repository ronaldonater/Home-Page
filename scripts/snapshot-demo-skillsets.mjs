// Manual capture only. Visitors read the saved lists without API or queue work.
import fs from 'node:fs/promises';
import {createOsuApi} from '../netlify/functions/wrapped/osu-api.mjs';
import {createSkillsetEnricher} from '../netlify/functions/wrapped/skillset-tags.mjs';
import {buildDemo} from './demo-source.mjs';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const clientId=process.env.OSU_CLIENT_ID||process.env.WRAPPED_OSU_CLIENT_ID,clientSecret=process.env.OSU_CLIENT_SECRET||process.env.WRAPPED_OSU_CLIENT_SECRET,databaseUrl=process.env.DATABASE_URL||process.env.WRAPPED_DATABASE_URL;
if(!clientId||!clientSecret||!databaseUrl)throw Error('Existing osu! credentials and shared database configuration are required.');
const api=createOsuApi({lane:'snapshot',requireSharedBudget:true,config:()=>({clientId,databaseUrl}),fetchImpl:(url,options)=>fetch(url,{...options,signal:AbortSignal.any([options.signal,AbortSignal.timeout(15000)])})});
async function get(url,options={}){const response=await api(url,{...options,signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('Demo tag capture failed: '+response.status);return response.json();}
const auth=await get('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:clientSecret,grant_type:'client_credentials',scope:'public'})});
if(!auth.access_token)throw Error('No snapshot token');
const target=new URL('../osu-wrapped/src/data/demo-snapshot.json',import.meta.url),fixturePath=new URL('../osu-wrapped/src/data/demo-beatmaps.json',import.meta.url);
const snapshot=JSON.parse(await fs.readFile(target,'utf8')),fixtures=JSON.parse(await fs.readFile(fixturePath,'utf8')),saved=new Map(),capturedAt=new Date().toISOString();
for(const [mode,data] of Object.entries(snapshot.modes)){
 const maps=fixtures[mode];
 for(const map of maps){if(!saved.has(map.id))saved.set(map.id,await get('https://osu.ppy.sh/api/v2/beatmapsets/'+map.id,{headers:{Authorization:'Bearer '+auth.access_token,Accept:'application/json','x-api-version':'20220705'}}));}
 const enrich=createSkillsetEnricher({fetchImpl:async url=>Response.json(saved.get(Number(String(url).split('/').at(-1))))});
 const scores=maps.map((map,i)=>({id:i+1,ended_at:'2026-06-01',beatmapset:{id:map.id},beatmap:{id:map.beatmap.id}}));
 const tagged=await enrich(scores,mode,'saved');if(tagged.some(score=>score.wrappedSkillsets.status!=='ready'))throw Error('Incomplete saved tag metadata for '+mode);
 fixtures[mode]=maps.map((map,i)=>({...map,wrappedSkillsets:tagged[i].wrappedSkillsets}));
 data.skillsets=buildDemo(mode,fixtures[mode],data.globalStats.popularBeatmapsets).skillsets;data.skillsetsSnapshotAt=capturedAt;
 console.log(mode+': saved '+data.skillsets.rows.length+' skillsets and their matching difficulties');
}
await fs.writeFile(new URL('../osu-wrapped/src/data/demo-snapshot.json.tmp',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
await fs.writeFile(new URL('../osu-wrapped/src/data/demo-beatmaps.json.tmp',import.meta.url),JSON.stringify(fixtures,null,2)+'\n');
await fs.rename(new URL('../osu-wrapped/src/data/demo-snapshot.json.tmp',import.meta.url),target);await fs.rename(new URL('../osu-wrapped/src/data/demo-beatmaps.json.tmp',import.meta.url),fixturePath);
console.log('Saved all demo skillset map lists; existing global/profile snapshots preserved.');
