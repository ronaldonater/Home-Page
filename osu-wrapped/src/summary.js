import {skillsetSummary} from './skillsets.js';
import {comboInfo} from './score-combo.js';
import {beatmapAverages} from './beatmap-averages.js';
import {assignClub} from './clubs.js';
import {favoriteMod,modRankings} from './mods.js';
export const YEAR = 2026;
export const inYear = value => typeof value === 'string' && new Date(value).getUTCFullYear() === YEAR;
export function summarize(user, best, mode, clubContext={}) {
  const months = Array.from({length:12}, (_,i) => ({month:i,count:0,available:false}));
  for (const row of user.monthly_playcounts || []) if(inYear(row.start_date)) {
    const m = new Date(row.start_date).getUTCMonth(); months[m].count += row.count; months[m].available = true;
  }
  const replayRows=Array.isArray(user.replays_watched_counts)?user.replays_watched_counts.filter(row=>inYear(row.start_date)&&Number.isSafeInteger(row.count)&&row.count>=0):null;
  const replayViews=replayRows?replayRows.reduce((sum,row)=>sum+row.count,0):null;
  const replayMonths=replayRows?new Set(replayRows.map(row=>new Date(row.start_date).getUTCMonth())).size:0;
  const unique = new Map();
  for(const score of best) if(inYear(score.ended_at || score.created_at)) unique.set(String(score.id),score);
  const scores = [...unique.values()];
  const passed = scores.filter(s=>s.passed !== false);
  const comboScore = passed.reduce((best,score)=>!best || (score.max_combo||0)>(best.max_combo||0)?score:best,null);
  const top = passed.filter(s=>Number.isFinite(s.pp)).sort((a,b)=>b.pp-a.pp).slice(0,25);
  const group = key => Object.entries(scores.reduce((all,s)=>{
    const name = s.beatmapset?.[key]; if(name) all[name]=(all[name]||0)+1; return all;
  },Object.create(null))).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,10).map(([name,count])=>({name,count}));
  return {skillsets:skillsetSummary(scores,mode),beatmapAverages:beatmapAverages(scores,mode),year:YEAR,mode,generatedAt:new Date().toISOString(),user:{id:user.id,username:user.username,avatar:user.avatar_url,country:user.country_code,pp:user.statistics?.pp,rank:user.statistics?.global_rank},months,
    playcount:months.some(m=>m.available)?months.reduce((s,m)=>s+m.count,0):null,
    replayViews,
    medals:Array.isArray(user.user_achievements)?user.user_achievements.filter(a=>inYear(a.achieved_at)).length:null,
    accuracy:passed.length?passed.reduce((s,p)=>s+p.accuracy*100,0)/passed.length:null,
    combo:comboScore?(comboScore.max_combo||0):null,
    comboScoreId:comboScore?.id ?? null,
    comboScore:comboScore?{id:comboScore.id,title:comboScore.beatmapset?.title||'Unknown beatmap',artist:comboScore.beatmapset?.artist||'Unknown artist',creator:comboScore.beatmapset?.creator||'Unknown mapper',version:comboScore.beatmap?.version||'',cover:comboScore.beatmapset?.covers?.['cover@2x']||comboScore.beatmapset?.covers?.cover}:null,
    favoriteMod:favoriteMod(scores),
    modUsage:modRankings(scores),
    club:assignClub(scores,mode,months,{...clubContext,replayViews,replayMonths}),
    top:top.map(s=>({id:s.id,bpm:Number.isFinite(s.beatmap?.bpm)?s.beatmap.bpm:Number.isFinite(s.beatmapset?.bpm)?s.beatmapset.bpm:null,replayAvailable:s.has_replay!==false,beatmapId:s.beatmap?.id,previewUrl:s.beatmapset?.preview_url,title:s.beatmapset?.title||'Unknown beatmap',artist:s.beatmapset?.artist||'Unknown artist',creator:s.beatmapset?.creator||'Unknown mapper',version:s.beatmap?.version||'',pp:s.pp,accuracy:s.accuracy*100,...comboInfo(s),rank:s.rank,date:s.ended_at||s.created_at,mods:formatMods(s.mods),cover:s.beatmapset?.covers?.['cover@2x']})),
    mappers:group('creator').map(mapper=>({...mapper,userId:scores.find(s=>s.beatmapset?.creator===mapper.name && Number.isSafeInteger(s.beatmapset?.user_id) && s.beatmapset.user_id>0)?.beatmapset.user_id ?? null})),artists:group('artist').map(artist=>{const song=scores.find(s=>s.beatmapset?.artist===artist.name && (s.beatmapset?.preview_url||s.beatmapset?.covers?.['cover@2x']));return {...artist,previewUrl:song?.beatmapset?.preview_url,cover:song?.beatmapset?.covers?.['cover@2x']};}),sampleCount:scores.length,passedCount:passed.length,
    coverage:'All score statistics and mapper/artist rankings use only deduplicated 2026 scores found in your current top 200 best plays. This is a partial sample, not your complete year. Mapper credits use the beatmapset creator; guest difficulty creators may differ. Counts are observed scores, not all map attempts.'};
}

export function formatMods(mods = []) {
  const names = (mods || []).map(mod => typeof mod === 'string' ? mod : mod.acronym);
  const hd = names.indexOf('HD');
  const hr = names.indexOf('HR');
  if (hd > -1 && hr > -1 && hd > hr) {
    names.splice(hd, 1);
    names.splice(hr, 0, 'HD');
  }
  return names.join(', ') || 'NM';
}
