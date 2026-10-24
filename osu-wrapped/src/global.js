import {favoriteModIcons} from './mod-icons.js';
import {formatScoreAccuracy} from './accuracy.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modeNames={osu:'osu!',taiko:'osu!taiko',fruits:'osu!catch',mania:'osu!mania'};
const grade=rank=>({X:'SS',XH:'SS',SSH:'SS',SH:'S'})[rank]||rank||'';
const gradeColor=rank=>({XH:'silver',SSH:'silver',SH:'silver',X:'gold',SS:'gold',S:'gold',A:'green',B:'blue',C:'purple',D:'red'})[rank]||'silver';
function safeCover(value){try{const url=new URL(value);return url.origin==='https://assets.ppy.sh'?url.href:'';}catch{return '';}}
export function globalPlaysMarkup(data,{story=false}={}){
 if(!data)return '<div class="global-empty" role="status">Global plays are temporarily unavailable. Try the Global Stats tab again later.</div>';
 if(!data.top?.length)return '<div class="global-empty">No recorded 2026 plays returned for this mode.</div>';
 return '<ol class="global-plays'+(story?' global-plays-story':'')+'">'+data.top.slice(0,story?5:25).map((row,index)=>{const cover=safeCover(row.cover),date=new Date(row.date).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'});const url=Number.isSafeInteger(row.scoreId)&&row.scoreId>0?'https://osu.ppy.sh/scores/'+row.scoreId:'https://osu.ppy.sh/beatmaps/'+encodeURIComponent(row.beatmapId);return '<li><span class="global-place">'+String(index+1).padStart(2,'0')+'</span><a class="global-thumbnail" href="'+escape(url)+'" target="_blank" rel="noopener noreferrer" aria-label="Open score for '+escape(row.title)+'">'+(cover?'<img src="'+escape(cover)+'" alt="" loading="lazy"/>':'')+'<b class="global-grade global-grade-'+gradeColor(row.rank)+'">'+escape(grade(row.rank))+'</b></a><div class="global-song"><a class="global-score-link" href="'+url+'" target="_blank" rel="noopener noreferrer">'+escape(row.title)+'</a><span><a href="https://osu.ppy.sh/users/'+encodeURIComponent(row.userId)+'" target="_blank" rel="noopener noreferrer">'+escape(row.username)+'</a> · '+escape(story?row.mods:[row.artist,row.version,row.mods].filter(Boolean).join(' · '))+'</span>'+(story?'<small>'+escape([row.artist,row.version].filter(Boolean).join(' · '))+'</small>':'')+(!story?'<small>Mapped by '+escape(row.creator||'Unknown mapper')+'</small><small>Set '+escape(date)+' · UTC</small>':'')+'</div><div class="global-result"><a class="global-pp-link" href="'+escape(url)+'" target="_blank" rel="noopener noreferrer" title="'+escape(row.pp)+' pp" aria-label="Open score: '+escape(row.pp)+' pp"><strong>'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(row.pp)+' <small>pp</small></strong></a><span class="play-accuracy">'+formatScoreAccuracy(row.accuracy)+' accuracy</span>'+(!story?'<button type="button" class="global-replay-button" data-global-replay-index="'+index+'"'+(row.replayAvailable===false?' disabled title="No replay is available for this score"':'')+'>▷ Watch replay</button>':'')+''+(story?'<span>'+escape(date)+' · UTC</span>':'')+'</div></li>';}).join('')+'</ol>';
}
export function globalDashboard(data,mode,{loading=false,error=false}={}){
 const footer=(note,updated)=>'<footer class="global-panel-footer"><p class="global-source">'+escape(note)+'</p><small class="global-updated">'+(updated?'Updated '+escape(new Date(updated).toLocaleString()):'')+(data?.stale?' · Cached data; refresh is temporarily unavailable.':'')+'</small></footer>';
 const loadingText=label=>'<p role="status">Loading '+label+'…</p>';
 return '<section class="global-dashboard" aria-label="Global stats"><div class="global-section-header"><span class="eyebrow">THE WIDER RHYTHM · 2026</span><h3>A year of standout plays.</h3><p>Explore the top recorded PP plays for '+escape(modeNames[mode]||mode)+'.</p></div><div class="global-community-stats"><article class="stat"><span>NEW ACCOUNTS IN 2026</span><strong>12M+</strong><small>New accounts created worldwide</small></article><a class="stat global-peak-users-link" href="https://www.reddit.com/r/osugame/comments/1weff89/osu_has_peaked_above_21k_users_online_today/" target="_blank" rel="noopener noreferrer" aria-label="Peak active users in 2026: approximately 21 thousand. View Reddit source."><span>PEAK ACTIVE USERS IN 2026 ↗</span><strong>~21K</strong><small>September 9, 2026 · concurrent users</small></a><article class="stat"><span>RANKED PLAYS SUBMITTED IN 2026</span><strong>1.7B+</strong><small>Over 1.7 billion ranked plays submitted</small></article><article class="stat"><span>MAPSETS RANKED IN 2026</span><strong>'+(Number.isSafeInteger(data?.rankedMappers?.totalSets)?new Intl.NumberFormat('en-US').format(data.rankedMappers.totalSets):loading?'…':'—')+'</strong><small>'+escape(modeNames[mode]||mode)+' · unique currently ranked sets</small></article></div>'+
 '<article class="panel global-leaderboard"><div class="panel-heading"><h3>Top 25 recorded PP plays</h3><span class="pill">'+escape(modeNames[mode]||mode)+'</span></div>'+(loading?loadingText('global plays'):globalPlaysMarkup(data))+(error?'<button type="button" class="button secondary" data-global-retry>Try again</button>':'')+footer(data?.coverage||'2026 plays within osu!’s current top 1,000 PP rankings; coverage may be incomplete.',data?.updatedAt)+'</article>'+
 '<article class="panel global-player-panel"><div class="panel-heading"><h3>Most plays in the top 25</h3><span class="pill">Player rankings</span></div>'+(loading?loadingText('player rankings'):globalPlayerLeadersMarkup(data)+popularMapperLeadersMarkup(data))+footer('Players: appearances in the selected mode’s 2026 top 25 PP plays; highest PP orders tied counts. Mappers: unique mapsets hosted in the popular top 25; names order tied counts. Tied counts share a rank.',data?.updatedAt)+'</article>'+
 '<article class="panel global-popular-panel"><div class="panel-heading"><h3>Most popular beatmaps ranked in 2026</h3><span class="pill">Top 25 mapsets</span></div>'+(loading?loadingText('popular beatmaps'):popularBeatmapsetsMarkup(data))+footer('Ranked in 2026, ordered by lifetime mapset plays. Includes mapsets with the selected gamemode; counts combine all difficulties and modes in each set.',data?.updatedAt)+'</article>'+
 '<article class="panel global-ranked-mappers"><div class="panel-heading"><h3>Most ranked sets in 2026</h3><span class="pill">Mapper rankings</span></div>'+(loading?loadingText('mapper rankings'):rankedMappersMarkup(data,{footer:false}))+footer((data?.rankedMappers?.coverage||'Currently ranked mapsets with a 2026 ranked date (UTC), counted once under their hosts in each native gamemode.')+' Tied counts share a rank; names order ties.',data?.rankedMappers?.updatedAt)+'</article><article class="panel global-mod-panel"><div class="panel-heading"><h3>Most-used mods in the global top 25</h3><span class="pill">Individual mods</span></div>'+(loading?loadingText('mod usage'):globalModUsageMarkup(data))+footer('Each mod counts once per score in the selected mode’s global top 25. CL is excluded; unmodified scores count as No Mod. Scores can contain multiple mods, so percentages may total over 100%. Tied counts share a rank.',data?.updatedAt)+'</article><article class="panel global-genre-panel"><div class="panel-heading"><h3>Top genres in the most-played top 25</h3><span class="pill">Top 10 genres</span></div>'+(loading?loadingText('genre rankings'):popularGenresMarkup(data))+footer('Genres assigned on osu! for the 25 most-played mapsets ranked in 2026 in the selected mode. Each unique mapset counts once, regardless of playcount. Percentages use all included mapsets; missing metadata appears as Unknown genre. Only genres present are shown, up to 10. Tied counts share a rank.',data?.updatedAt)+'</article></section>';
}

export function globalPlayerLeaders(data){
 const players=new Map();
 for(const row of (data?.top||[]).slice(0,25)){
  if(!Number.isSafeInteger(row.userId)||row.userId<=0)continue;
  const player=players.get(row.userId)||{userId:row.userId,username:row.username,count:0,bestPP:0};
  player.count++;player.bestPP=Math.max(player.bestPP,row.pp||0);players.set(row.userId,player);
 }
 const sorted=[...players.values()].sort((a,b)=>b.count-a.count||b.bestPP-a.bestPP||a.userId-b.userId);
 let rank=0,lastCount=null;return sorted.slice(0,5).map((player,index)=>{if(player.count!==lastCount)rank=index+1;lastCount=player.count;return {...player,rank};});
}
export function globalPlayerLeadersMarkup(data){
 if(!data)return '<p class="global-empty">Global player rankings are temporarily unavailable.</p>';
 const leaders=globalPlayerLeaders(data);if(!leaders.length)return '<p class="global-empty">No eligible 2026 plays available to rank players.</p>';
 return '<ol class="global-player-leaders">'+leaders.map(player=>'<li><span class="global-player-place">'+String(player.rank).padStart(2,'0')+'</span><a href="https://osu.ppy.sh/users/'+player.userId+'" target="_blank" rel="noopener noreferrer"><img src="https://a.ppy.sh/'+player.userId+'" alt="" loading="lazy" width="40" height="40"/><b>'+escape(player.username)+'</b></a><span><strong>'+player.count+'</strong> '+(player.count===1?'play':'plays')+'</span></li>').join('')+'</ol>';
}

export function popularBeatmapUrl(row,mode){
 const base='https://osu.ppy.sh/beatmapsets/'+encodeURIComponent(row.id);
 const validMode=Object.hasOwn(modeNames,mode),validId=Number.isSafeInteger(row.beatmapId)&&row.beatmapId>0;
 if(validMode)return base+'#'+mode+(validId?'/'+row.beatmapId:'');
 return validId?'https://osu.ppy.sh/beatmaps/'+row.beatmapId:base;
}
export function popularBeatmapsetsMarkup(data,{story=false}={}){
 const rows=data?.popularBeatmapsets;if(!Array.isArray(rows))return '<p class="global-empty">Popular beatmaps are temporarily unavailable.</p>'+(story?'':'<button type="button" class="button secondary" data-global-retry>Try again</button>');
 if(!rows.length)return '<p class="global-empty">No beatmapsets ranked in 2026 were found for this mode.</p>';
 return '<ol class="global-popular-list">'+rows.slice(0,story?5:25).map((row,index)=>{const cover=safeCover(row.cover);return '<li><div class="popular-map-row"><span class="global-place">'+String(index+1).padStart(2,'0')+'</span>'+(cover?'<img src="'+escape(cover)+'" alt="" loading="lazy"/>':'<span class="popular-cover-placeholder"></span>')+'<span class="popular-map-info"><b><a class="popular-map-link" href="'+popularBeatmapUrl(row,data?.mode)+'" target="_blank" rel="noopener noreferrer">'+escape(row.title)+'</a></b><small>'+escape(row.artist)+' · Mapped by <a class="popular-mapper-link" href="https://osu.ppy.sh/users/'+encodeURIComponent(row.creatorId||row.creator)+'" target="_blank" rel="noopener noreferrer">'+escape(row.creator)+'</a></small><small>Ranked '+escape(new Date(row.rankedDate).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'}))+' · UTC</small></span><span class="popular-play-count"><b>'+new Intl.NumberFormat('en-US').format(row.plays)+'</b><small>lifetime plays</small>'+(!story&&Number.isSafeInteger(row.beatmapId)&&row.beatmapId>0?'<a class="watch-beatmap" data-beatmap-index="'+index+'" href="https://preview.tryz.id.vn/?b='+row.beatmapId+'" target="_blank" rel="noopener noreferrer" title="Preview the most-played difficulty in the selected gamemode">▷ Watch beatmap</a>':'')+'</span></div></li>';}).join('')+'</ol>';
}

export function rankedMappersMarkup(data,{story=false,footer=true}={}){
 const ranking=data?.rankedMappers;if(!ranking?.top)return '<p class="global-empty">Mapper rankings are temporarily unavailable.</p>';
 if(!ranking.top.length)return '<p class="global-empty">No matching ranked mapsets were found for this mode.</p>';
 return '<ol class="global-player-leaders">'+ranking.top.slice(0,story?5:10).map(mapper=>'<li><span class="global-player-place">'+String(mapper.rank).padStart(2,'0')+'</span><a href="https://osu.ppy.sh/users/'+mapper.userId+'" target="_blank" rel="noopener noreferrer"><img src="https://a.ppy.sh/'+mapper.userId+'" alt="" loading="lazy" width="40" height="40"/><b>'+escape(mapper.username)+'</b></a><span><strong>'+mapper.count+'</strong> '+(mapper.count===1?'set':'sets')+'</span></li>').join('')+'</ol>'+(story||!footer?'':'<p class="global-source">'+escape(ranking.coverage)+' Tied counts share a rank; names order ties.</p><small class="global-updated">'+new Intl.NumberFormat('en-US').format(ranking.totalSets)+' mapsets · '+new Intl.NumberFormat('en-US').format(ranking.totalMappers)+' hosts · Updated '+escape(new Date(ranking.updatedAt).toLocaleString())+'</small>');
}

export function popularMapperLeaders(data){
 const counts=new Map();const seen=new Set();
 for(const row of (data?.popularBeatmapsets||[]).slice(0,25)){
  if(seen.has(row.id))continue;seen.add(row.id);
  if(!Number.isSafeInteger(row.creatorId)||row.creatorId<=0)continue;
  const mapper=counts.get(row.creatorId)||{userId:row.creatorId,username:row.creator,count:0};mapper.count++;counts.set(row.creatorId,mapper);
 }
 const sorted=[...counts.values()].sort((a,b)=>b.count-a.count||a.username.localeCompare(b.username,'en')||a.userId-b.userId);let rank=0,last=null;
 return sorted.slice(0,5).map((mapper,index)=>{if(mapper.count!==last)rank=index+1;last=mapper.count;return {...mapper,rank};});
}
export function popularMapperLeadersMarkup(data,{story=false}={}){
 const leaders=popularMapperLeaders(data);
 return '<section class="popular-mapper-leaders" aria-label="Mapper appearances in popular beatmaps">'+(story?'':'<h4>Most mapsets in the popular top 25</h4>')+(leaders.length?'<ol class="global-player-leaders">'+leaders.map(mapper=>'<li><span class="global-player-place">'+String(mapper.rank).padStart(2,'0')+'</span><a href="https://osu.ppy.sh/users/'+mapper.userId+'" target="_blank" rel="noopener noreferrer"><img src="https://a.ppy.sh/'+mapper.userId+'" alt="" loading="lazy" width="40" height="40"/><b>'+escape(mapper.username)+'</b></a><span><strong>'+mapper.count+'</strong> '+(mapper.count===1?'set':'sets')+'</span></li>').join('')+'</ol>':'<p class="global-empty">Popular mapper rankings are temporarily unavailable.</p>')+'</section>';
}

export function globalModUsage(data){
 const scores=(data?.top||[]).slice(0,25),counts=new Map();
 for(const score of scores){const raw=Array.isArray(score.mods)?score.mods:typeof score.mods==='string'?score.mods.split(/[,\s]+/):[];
  const mods=new Set(raw.map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&/^[A-Z0-9]{1,6}$/.test(mod)&&mod!=='CL'));
  if(mods.has('NC'))mods.delete('DT');if(mods.has('PF'))mods.delete('SD');if(mods.size>1)mods.delete('NM');if(!mods.size)mods.add('NM');
  for(const mod of mods)counts.set(mod,(counts.get(mod)||0)+1);
 }
 let rank=0,last=null;return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([mod,count],index)=>{if(count!==last)rank=index+1;last=count;return {mod,count,total:scores.length,percentage:count/scores.length*100,rank};});
}
export function globalModUsageMarkup(data,{story=false}={}){
 const mods=globalModUsage(data);if(!mods.length)return '<p class="global-empty">No global scores are available to rank mods.</p>';
 return '<ol class="global-mod-usage">'+mods.slice(0,story?5:mods.length).map(row=>'<li><span class="global-place">'+String(row.rank).padStart(2,'0')+'</span><span class="global-mod-name">'+favoriteModIcons({mods:[row.mod]})+'<b>'+escape(row.mod==='NM'?'No Mod':row.mod)+'</b></span><span class="global-mod-count" title="'+row.percentage.toFixed(2)+'% of '+row.total+' scores"><strong>'+row.count+'</strong> '+(row.count===1?'play':'plays')+'<small>'+row.percentage.toFixed(2)+'%</small></span></li>').join('')+'</ol>';
}

const genreNames={1:'Unspecified',2:'Video Game',3:'Anime',4:'Rock',5:'Pop',6:'Other',7:'Novelty',9:'Hip Hop',10:'Electronic',11:'Metal',12:'Classical',13:'Folk',14:'Jazz'};
export function popularGenreRankings(data){
 const rows=data?.popularBeatmapsets;if(!Array.isArray(rows))return [];
 const seen=new Set(),counts=new Map();let total=0;
 for(const row of rows){if(!Number.isSafeInteger(row.id)||row.id<=0||seen.has(row.id))continue;if(total===25)break;seen.add(row.id);total++;const id=Number.isSafeInteger(row.genreId)&&Object.hasOwn(genreNames,row.genreId)?row.genreId:null;counts.set(id,(counts.get(id)||0)+1);}
 const sorted=[...counts].map(([id,count])=>({id,name:id===null?'Unknown genre':genreNames[id],count,total,percentage:count/total*100})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 let rank=0,last=null;return sorted.slice(0,10).map((row,i)=>{if(row.count!==last)rank=i+1;last=row.count;return {...row,rank};});
}
export function popularGenresMarkup(data,{story=false}={}){
 if(!Array.isArray(data?.popularBeatmapsets))return '<p class="global-empty">Genre rankings are temporarily unavailable.</p>';
 const rows=popularGenreRankings(data).slice(0,story?5:10);if(!rows.length)return '<p class="global-empty">No popular mapsets available to rank genres.</p>';
 return '<ol class="global-genre-list">'+rows.map(row=>'<li><span class="global-place">'+String(row.rank).padStart(2,'0')+'</span><b>'+(row.id!==null?'<a class="global-genre-link" href="https://osu.ppy.sh/beatmapsets?g='+row.id+(Object.hasOwn(modeNames,data?.mode)?'&amp;m='+({osu:0,taiko:1,fruits:2,mania:3})[data.mode]:'')+'" target="_blank" rel="noopener noreferrer">'+escape(row.name)+'</a>':escape(row.name))+'</b><span class="global-genre-count"><strong>'+row.count+'</strong> '+(row.count===1?'mapset':'mapsets')+'<small>'+row.percentage.toFixed(2)+'% of '+row.total+'</small></span></li>').join('')+'</ol>';
}
