import fs from 'node:fs/promises';
try{process.loadEnvFile();}catch(error){if(error.code!=='ENOENT')throw error;}
const clientId=process.env.OSU_CLIENT_ID||process.env.WRAPPED_OSU_CLIENT_ID,clientSecret=process.env.OSU_CLIENT_SECRET||process.env.WRAPPED_OSU_CLIENT_SECRET;
if(!clientId||!clientSecret)throw Error('osu! app credentials required to refresh demo metadata');
async function request(url,options={}){const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('osu! request failed: '+response.status);return response.json();}
const token=await request('https://osu.ppy.sh/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:clientSecret,grant_type:'client_credentials',scope:'public'})});
const output=new URL('../osu-wrapped/src/data/demo-beatmaps.json',import.meta.url),fixtures=JSON.parse(await fs.readFile(output,'utf8'));
for(const [mode,sets] of Object.entries(fixtures)){
 for(const set of sets){
  const map=await request('https://osu.ppy.sh/api/v2/beatmaps/'+set.beatmap.id,{headers:{Authorization:'Bearer '+token.access_token,Accept:'application/json'}});
  if(map.id!==set.beatmap.id||map.mode!==mode)throw Error('Unexpected demo beatmap metadata');
  for(const key of ['difficulty_rating','ar','drain','accuracy','total_length','hit_length','cs','bpm','max_combo'])if(Number.isFinite(map[key]))set.beatmap[key]=map[key];
  const result=await request('https://osu.ppy.sh/api/v2/beatmaps/'+map.id+'/attributes',{method:'POST',headers:{Authorization:'Bearer '+token.access_token,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({mods:['HD','DT'],ruleset:mode})});
  const attrs=result.attributes;if(Number.isFinite(attrs?.star_rating))set.modAttributes={HDDT:attrs};
 }
 console.log(mode+': refreshed '+sets.length+' existing demo beatmaps');
}
await fs.writeFile(new URL('demo-beatmaps.json.tmp',output),JSON.stringify(fixtures,null,2)+'\n');await fs.rename(new URL('demo-beatmaps.json.tmp',output),output);
