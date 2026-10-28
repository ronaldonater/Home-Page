import fs from 'node:fs/promises';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const clientId=process.env.OSU_CLIENT_ID||process.env.WRAPPED_OSU_CLIENT_ID,clientSecret=process.env.OSU_CLIENT_SECRET||process.env.WRAPPED_OSU_CLIENT_SECRET;
if(!clientId||!clientSecret)throw Error('osu! app credentials required');
async function request(url,options={}){const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('osu! request failed: '+response.status);return response.json();}
const token=await request('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:clientSecret,grant_type:'client_credentials',scope:'public'})});
const fixtures={};
for(const [mode,id] of Object.entries({osu:0,taiko:1,fruits:2,mania:3})){
 const candidates=[],hosts=new Set();let cursor=null;
 for(let page=0;page<12;page++){
 const query=new URLSearchParams({m:id,s:'ranked',sort:'plays_desc',nsfw:'false'});if(cursor)query.set('cursor_string',cursor);
 const data=await request('https://osu.ppy.sh/api/v2/beatmapsets/search?'+query,{headers:{Authorization:'Bearer '+token.access_token,Accept:'application/json'}});
 for(const set of data.beatmapsets||[]){if(set.status!=='ranked'||!Number.isSafeInteger(set.user_id)||hosts.has(set.user_id)||!(set.beatmaps||[]).some(map=>map.mode===mode&&!map.convert))continue;hosts.add(set.user_id);candidates.push(set);if(candidates.length===10)break;}
 if(candidates.length===10||!data.cursor_string)break;cursor=data.cursor_string;
 }
 const data={beatmapsets:candidates};
 fixtures[mode]=data.beatmapsets.filter(set=>set.status==='ranked').flatMap(set=>{const maps=(set.beatmaps||[]).filter(map=>map.mode===mode&&!map.convert).sort((a,b)=>b.difficulty_rating-a.difficulty_rating);const map=maps[0];return map?[{id:set.id,title:set.title,artist:set.artist,creator:set.creator,user_id:set.user_id,ranked_date:set.ranked_date,preview_url:'https://b.ppy.sh/preview/'+set.id+'.mp3',covers:{'cover@2x':set.covers?.['cover@2x']||set.covers?.cover},beatmap:{id:map.id,mode,version:map.version,bpm:map.bpm||set.bpm,max_combo:map.max_combo,difficulty_rating:map.difficulty_rating,ar:map.ar,drain:map.drain,accuracy:map.accuracy,total_length:map.total_length,hit_length:map.hit_length,cs:map.cs}}]:[];}).slice(0,10);
 if(fixtures[mode].length<10)throw Error('Insufficient native demo maps for '+mode);
 for(const set of fixtures[mode]){const result=await request('https://osu.ppy.sh/api/v2/beatmaps/'+set.beatmap.id+'/attributes',{method:'POST',headers:{Authorization:'Bearer '+token.access_token,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({mods:['HD','DT'],ruleset:mode})});if(Number.isFinite(result.attributes?.star_rating))set.modAttributes={HDDT:result.attributes};}
 console.log(mode+': '+fixtures[mode].length+' verified native mapsets from '+new Set(fixtures[mode].map(row=>row.user_id)).size+' unique mappers');
}
const output=new URL('../osu-wrapped/src/data/demo-beatmaps.json',import.meta.url);await fs.mkdir(new URL('.',output),{recursive:true});await fs.writeFile(output,JSON.stringify(fixtures,null,2)+'\n');
