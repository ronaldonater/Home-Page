// Manual maintainer task; never runs in a visitor's browser or during a build.
import fs from 'node:fs/promises';
import {createOsuApi} from '../netlify/functions/wrapped/osu-api.mjs';
import {createGlobalService} from '../netlify/functions/wrapped/global-stats.mjs';
import {createSkillsetEnricher} from '../netlify/functions/wrapped/skillset-tags.mjs';
import {buildDemo} from './demo-source.mjs';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const clientId=process.env.OSU_CLIENT_ID||process.env.WRAPPED_OSU_CLIENT_ID,clientSecret=process.env.OSU_CLIENT_SECRET||process.env.WRAPPED_OSU_CLIENT_SECRET;
if(!clientId||!clientSecret)throw Error('osu! app credentials are required to refresh the saved demo.');
const api=createOsuApi({config:()=>({})});
const response=await api('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:clientSecret,grant_type:'client_credentials',scope:'public'}),signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Demo snapshot authentication failed: '+response.status);
const token=await response.json();if(!token.access_token)throw Error('Missing snapshot access token');
const global=createGlobalService({fetchImpl:(url,options)=>String(url)==='https://osu.ppy.sh/oauth/token'?Promise.resolve(Response.json(token)):api(url,options)});
const tags=createSkillsetEnricher({fetchImpl:api});
const fixtures=JSON.parse(await fs.readFile(new URL('../osu-wrapped/src/data/demo-beatmaps.json',import.meta.url),'utf8'));
const snapshotAt=new Date().toISOString(),snapshot={snapshotAt,modes:{}};
for(const mode of ['osu','taiko','fruits','mania']){
 console.log(mode+': saving global rankings and demo tags');
 const listing=await global(mode,{clientId,clientSecret});if(listing.statusCode!==200||!listing.body.top.length||!Array.isArray(listing.body.popularBeatmapsets)||!listing.body.popularBeatmapsets.length)throw Error('Incomplete global snapshot for '+mode);
 const maps=fixtures[mode],scores=maps.map((map,i)=>({id:i+1,ended_at:'2026-06-01',beatmapset:{id:map.id},beatmap:{id:map.beatmap.id}}));let tagged;
 for(let attempt=0;attempt<12;attempt++){
  tagged=await tags(scores,mode,token.access_token);
  const checked=tagged.filter(score=>score.wrappedSkillsets.status==='ready').length;
  console.log(mode+': '+checked+'/'+scores.length+' demo difficulties checked');
  if(checked===scores.length)break;if(attempt===11)throw Error('Incomplete skillset snapshot for '+mode);
 }
 const demoMaps=maps.map((map,i)=>({...map,wrappedSkillsets:tagged[i].wrappedSkillsets}));
 const data=buildDemo(mode,demoMaps,listing.body.popularBeatmapsets);
 data.snapshotAt=snapshotAt;data.generatedAt=snapshotAt;data.globalStats={...listing.body,demoSnapshot:true,snapshotAt};
 // Use the saved beatmap-cover fallback directly instead of live artist lookups.
 for(const artist of data.artists)artist.demoImage=artist.cover||'';
 snapshot.modes[mode]=data;
}
const target=new URL('../osu-wrapped/src/data/demo-snapshot.json',import.meta.url),temp=new URL('../osu-wrapped/src/data/demo-snapshot.json.tmp',import.meta.url);
await fs.writeFile(temp,JSON.stringify(snapshot,null,2)+'\n');await fs.rename(temp,target);
console.log('Saved all four demo modes: '+snapshotAt);
