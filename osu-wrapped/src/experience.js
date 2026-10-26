import {mappingClubMarkup} from './mapping-clubs.js';
import {artistCover,bindArtistFallback} from './artist-fallback.js';
import {slideFitScale} from './slide-fit.js';
import {clubMarkup} from './clubs.js';
import {personalModsMarkup} from './mod-breakdown.js';
import {globalPlaysMarkup,globalPlayerLeadersMarkup,popularBeatmapsetsMarkup,rankedMappersMarkup,popularMapperLeadersMarkup,globalModUsageMarkup,popularGenresMarkup,popularBeatmapUrl} from './global.js';
import {favoriteModIcons} from './mod-icons.js';
import {favoriteModLabel,favoriteModNote,favoriteModPercentage} from './mods.js';
import {rarestMedalMarkup} from './medals.js';
import {accuracyRank,formatScoreAccuracy} from './accuracy.js';
import {openCardShare} from './share.js';
import {createRecap} from './recap.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>value==null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const seen=new Set();
export const experienceKey=data=>'osu-wrapped:experience:'+data.year+':'+data.user.id;
export const canViewWrapped=data=>Number.isInteger(data?.sampleCount)&&data.sampleCount>0;
export function firstExperience(data,storage){
 if(!canViewWrapped(data) || data.demo)return false;
 const key=experienceKey(data);if(seen.has(key))return false;
 try{if(storage?.getItem(key))return false;}catch{}
 return true;
}
export function markExperience(data,storage){
 if(!canViewWrapped(data)||data.demo)return;const key=experienceKey(data);seen.add(key);try{storage?.setItem(key,'seen');}catch{}
}
export function experienceSlides(data){
 const best=data.top[0];const available=data.months.filter(m=>m.available);const peak=available.reduce((a,b)=>!a||b.count>a.count?b:a,null);
 const count=(value,suffix='')=>'<strong class="story-number"'+(Number.isFinite(value)?' data-count="'+value+'"':'')+'>'+number(value)+'</strong>'+ (suffix?'<span class="story-unit">'+escape(suffix)+'</span>':'');
 const ranking=(rows,unit,avatars=false)=>'<ol class="story-ranking'+' story-mapper-ranking'+'">'+rows.slice(0,5).map((row,i)=>'<li><span class="story-place">0'+(i+1)+'</span>'+(avatars?storyMapperAvatar(row):storyArtistAvatar(row))+'<b>'+(avatars?'<a class="story-mapper-profile" href="https://osu.ppy.sh/users/'+encodeURIComponent(Number.isSafeInteger(row.userId)&&row.userId>0?row.userId:row.name)+'" target="_blank" rel="noopener noreferrer">'+escape(row.name)+'</a>':'<a class="story-artist-search" href="https://osu.ppy.sh/beatmapsets?q='+encodeURIComponent(row.name)+'" target="_blank" rel="noopener noreferrer">'+escape(row.name)+'</a>')+'</b><span>'+number(row.count)+' '+(unit==='scores' && row.count===1?'score':unit)+'</span></li>').join('')+'</ol>';
 const slides = [
 {theme:'pink',eyebrow:'PRESS PLAY ON YOUR YEAR',title:'<span class="story-opening-heading">'+storyUserAvatar(data.user)+'<span>'+escape(data.user.username)+'’s<br>2026.</span></span>',body:'<div class="story-record" aria-hidden="true">◎</div><p>One more try.<br>A whole year of you.</p>',note:(data.demo?'Fictional demo · ':'')+'Your osu! year in rhythm. · Music: cYsmix - Triangles',duration:5500},
 {theme:'lime',eyebrow:'YOU KEPT COMING BACK',title:'You hit play.',body:'<div class="story-play-decoration" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="91" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="100" r="72" stroke="currentColor" stroke-width="10"/><path d="M83 65L137 100L83 135Z" fill="currentColor"/></svg></div>'+count(data.playcount,'plays in 2026')+'<p>'+ (peak?'<b>'+months[peak.month]+'</b> led the way with <b>'+number(peak.count)+' plays.</b>':'No monthly activity returned yet.')+'</p>',note:'Available monthly profile history · all modes',duration:6500},
 {theme:'lavender',layout:'flow',eyebrow:'FINDING YOUR FLOW',title:'Precision.<br>Persistence.',body:'<div class="story-crosshair-decoration" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none" stroke="currentColor"><circle cx="100" cy="100" r="70" stroke-width="3"/><circle cx="100" cy="100" r="44" stroke-width="8"/><path d="M100 8V64M100 136V192M8 100H64M136 100H192" stroke-width="5"/><circle cx="100" cy="100" r="7" fill="currentColor" stroke="none"/></svg></div><div class="story-duo"><div><strong>'+ (data.accuracy==null?'—':data.accuracy.toFixed(2)+'%')+'</strong><span class="story-accuracy-label">average accuracy'+(Number.isFinite(data.accuracy)?storyGrade(accuracyRank(data.accuracy)):'')+'</span><div class="story-favorite-mod"><span>FAVORITE MOD</span><b>'+favoriteModIcons(data.favoriteMod)+escape(favoriteModLabel(data.favoriteMod))+'</b><small><span class="favorite-mod-count" tabindex="0" title="'+favoriteModPercentage(data.favoriteMod)+'">'+escape(favoriteModNote(data.favoriteMod))+'</span> · 2026 selection</small></div></div><div><strong>'+number(data.combo)+'×</strong><span>highest combo</span>'+storyComboScore(data)+'</div></div>',note:'Passed 2026 scores in your current top 200 · selected mode',duration:6500},
 {theme:'lavender',layout:'personal-mods',eyebrow:'YOUR WAY TO PLAY',title:'Your mods.<br>Your rules.',body:'<div class="story-book-decoration" aria-hidden="true"><svg viewBox="0 0 240 190" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M120 48Q79 18 24 34V150Q77 133 120 163Q163 133 216 150V34Q161 18 120 48V163"/><path d="M14 48V164Q74 147 120 176Q166 147 226 164V48M43 62Q75 56 99 71M43 86Q75 80 99 95M43 110Q75 104 99 119M141 71Q165 56 197 62M141 95Q165 80 197 86M141 119Q165 104 197 110" stroke-width="3"/></svg></div>'+personalModsMarkup(data,{story:true}),note:'Most-used individual mods in your 2026 selection from the current top 200. CL excluded; unmodified scores count as No Mod. Percentages use all selected scores, and tied counts share a rank.',duration:8000},
 {theme:'night',eyebrow:'A LITTLE RECOGNITION',title:'You made<br>your mark.',body:'<div class="story-detective-decoration" aria-hidden="true"><svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="81" cy="80" r="55" stroke-width="10"/><circle cx="81" cy="80" r="40" stroke-width="2"/><path d="M121 121L176 176" stroke-width="22"/><path d="M53 72A30 30 0 0 1 75 51" stroke-width="5"/></svg></div><div class="story-duo"><div>'+count(data.medals)+'<span>medals unlocked</span></div><div>'+count(data.replayViews)+'<span>replay watches</span></div></div>'+rarestMedalMarkup(data),note:'Dated achievements and monthly replay history · all modes',duration:6000},
 {theme:'pink',beatBpm:best?.bpm,preview:storyPreview(best),artwork:storyCover(best?.cover),eyebrow:'THE ONE TO REMEMBER',title:best?escape(best.title):'Your next best<br>is waiting.',body:best?storyCrown()+'<div class="story-score-heading">'+count(Math.round(best.pp),'pp')+storyGrade(best.rank)+'</div><p><b>'+escape(best.artist)+'</b><br>'+escape(best.version)+'<br>Mapped by '+escape(best.creator)+'</p><div class="story-tags">'+escape(best.mods)+' · '+best.accuracy.toFixed(2)+'% · '+number(best.combo)+'×</div><p class="story-score-date">'+storyDate(best.date)+'</p>':'<p>No 2026 PP scores were found in your current top 200.</p>',note:'Highest 2026 PP found in your current top 200 · selected mode',duration:7000},
 {theme:'night',preview:storyPreview(best),layout:'plays',eyebrow:'PERSONAL BEST MATERIAL',title:'Your top five.',body:'<div class="story-person-decoration" aria-hidden="true"><svg viewBox="0 0 200 200" fill="currentColor"><circle cx="100" cy="59" r="37"/><path d="M25 181V166C25 130 56 110 100 110S175 130 175 166V181Z"/></svg></div>'+storyPlays(data.top,!data.demo)+(!data.top.length?'<p>No 2026 PP scores available.</p>':''),note:'2026 scores in your current top 200 · selected mode',duration:8000},
 {theme:'lime',eyebrow:'BEHIND THE PATTERNS',title:'Your mappers.',body:storyBlueprint()+ranking(data.mappers,'scores',true)+(!data.mappers.length?'<p>No mapper rankings available.</p>':''),note:'2026 score counts in your current top 200 · mapset creator credits',duration:8000},
 {theme:'lavender',preview:storyPreview(data.artists[0])||storyPreview(data.top.find(score=>score.artist===data.artists[0]?.name)),eyebrow:'THE SOUNDTRACK TO YOUR YEAR',title:'Your artists.',syncToPreview:true,body:'<div class="story-microphone-decoration" aria-hidden="true"><svg viewBox="0 0 200 220" fill="none" stroke="currentColor" stroke-linecap="round"><rect x="66" y="16" width="68" height="119" rx="34" stroke-width="8"/><path d="M46 103V110C46 145 69 163 100 163S154 145 154 110V103M100 164V198M70 202H130" stroke-width="8"/><path d="M68 62H89M111 62H132M68 82H89M111 82H132M68 102H89M111 102H132" stroke-width="4"/></svg></div>'+ranking(data.artists,'scores')+(!data.artists.length?'<p>No artist rankings available.</p>':''),note:'2026 score counts in your current top 200 · not total song plays · Artist images: TheAudioDB.com',duration:8000},
 {theme:'night',layout:'club',eyebrow:'A STYLE ALL YOUR OWN',title:'You found<br>your people.',body:clubMarkup(data,{story:true}),note:'Based on the available 2026 scores in your current top 200 for the selected mode. A playful snapshot of your style, not your complete play history.',duration:8500},
 {theme:'pink',layout:'final',eyebrow:'SAME TIME NEXT YEAR?',title:'That was<br>your 2026.',body:'<div class="story-heart-decoration" aria-hidden="true"><svg viewBox="0 0 220 200" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M110 177L35 105C-12 58 50-5 94 37L110 53L126 37C170-5 232 58 185 105Z"/></svg></div><p>Every new best starts<br>with one more try.</p><div class="story-finish"><button type="button" data-story-save>↓ Save recap card</button><button type="button" data-story-share class="card-share-icon" title="Share card" aria-label="Share recap card"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg></button><button type="button" data-story-review>Explore my numbers ↗</button><!-- Donations temporarily disabled pending music permissions. <a class="story-donate" href="https://ko-fi.com/ronaldonater" target="_blank" rel="noopener noreferrer">Donate <span aria-hidden="true">♡</span></a> --></div>',note:number(data.sampleCount)+' scores dated in 2026 from your current top 200. Profile history is separate; this is not a full annual score archive. Year to date until 2027. · Music: nekodex - circles!',duration:8000}
 ];
 const globalMode=({osu:'osu!',taiko:'osu!taiko',fruits:'osu!catch',mania:'osu!mania'})[data.mode]||data.mode;
 slides.splice(slides.length-1,0,
 {theme:'global',layout:'global-intro',eyebrow:'YOUR YEAR. OUR COMMUNITY.',title:'Beyond your<br>best plays.',body:'<div class="global-globe" aria-hidden="true"><i></i><i></i><i></i><svg class="global-network" viewBox="0 0 300 300" fill="none"><path class="global-network-link" d="M77 85Q88.5 86.53621863154517 100 94M100 94Q94 109.8277019097269 88 119M100 94Q131.5 87.9314334250137 163 97M88 119Q104 144.55375916270214 120 158M120 158Q122.5 168.96865464730507 125 187M125 187Q120 196.6633307652784 115 202M120 158Q145 145.82961913655242 170 146M125 187Q151 191.25843430899454 177 183M163 97Q177.5 88.85626565183465 192 88M192 88Q202.5 98.59683709613535 213 103M213 103Q196.5 106.15010344950595 180 118M180 118Q175 135.56785649935645 170 146M170 146Q176 152.8033353934907 182 165M182 165Q179.5 176.24178500307232 177 183M170 146Q166.5 115.560303038033 163 97M180 118Q181 147.14510407344275 182 165M182 165Q204 181.59729160350707 226 214M177 183Q201.5 205.45793072687562 226 214M226 214Q234 214.02090929970353 242 218M213 103Q227.5 172.5 242 218" stroke="currentColor" stroke-width="1.1"/><g fill="currentColor"><circle class="global-network-node" cx="77" cy="85" r="3.2"/><circle class="global-network-node" cx="100" cy="94" r="2.5"/><circle class="global-network-node" cx="88" cy="119" r="2.5"/><circle class="global-network-node" cx="120" cy="158" r="3.2"/><circle class="global-network-node" cx="125" cy="187" r="2.5"/><circle class="global-network-node" cx="115" cy="202" r="2.5"/><circle class="global-network-node" cx="163" cy="97" r="3.2"/><circle class="global-network-node" cx="192" cy="88" r="2.5"/><circle class="global-network-node" cx="213" cy="103" r="2.5"/><circle class="global-network-node" cx="180" cy="118" r="3.2"/><circle class="global-network-node" cx="170" cy="146" r="2.5"/><circle class="global-network-node" cx="182" cy="165" r="2.5"/><circle class="global-network-node" cx="177" cy="183" r="3.2"/><circle class="global-network-node" cx="226" cy="214" r="2.5"/><circle class="global-network-node" cx="242" cy="218" r="2.5"/></g><path d="M62 91L83 68L116 66L125 84L105 104L109 128L92 145L73 126ZM112 143L137 151L146 179L132 208L117 215L107 183ZM159 85L184 67L213 77L230 97L218 117L190 114L180 135L157 124L147 102ZM163 139L188 139L201 160L187 195L170 189L156 164ZM217 207L239 202L252 218L235 230L215 223Z" fill="currentColor" opacity=".12"/></svg><span class="global-signal-ring"></span><span class="global-signal-ring global-signal-ring-two"></span><span class="global-orbit-track"><b></b></span><span class="global-orbit-track global-orbit-track-two"><b></b></span></div><p>One game. Millions of stories.<br>Let’s look at the wider rhythm.</p>',note:'Global stats · '+globalMode+' · 2026 year to date',duration:5500},
 {theme:'global',layout:'global-community',tallySound:true,eyebrow:'NEW FACES. SAME RHYTHM.',title:'The community<br>keeps growing.',body:'<div class="story-growth-decoration" aria-hidden="true"><svg viewBox="0 0 220 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20V177H204" stroke-width="4"/><path d="M48 151V130M85 151V107M122 151V84M159 151V61" stroke-width="15" opacity=".5"/><path d="M39 111L82 81L114 93L190 24M151 24H190V63" stroke-width="8"/></svg></div><div class="global-community-reveal"><strong class="story-number" data-count="12">12</strong><span class="story-unit">M+</span><p>new accounts created in 2026</p><aside class="story-community-fact"><span>PUT THAT INTO PERSPECTIVE</span><p>More new accounts than the entire population of <b>Belgium</b>.</p><small><a href="https://statbel.fgov.be/en/news/1-january-2026-belgium-had-11867634-inhabitants" target="_blank" rel="noopener noreferrer">Belgium: 11.87 million residents on January 1, 2026 · Statbel ↗</a></small></aside></div>',note:'Approximate worldwide account registrations in 2026.',duration:6500},
 {theme:'global',layout:'global-peak',tallySound:true,eyebrow:'ALL ONLINE. ALL AT ONCE.',title:'A shared<br>high point.',body:'<div class="story-growth-decoration" aria-hidden="true"><svg viewBox="0 0 220 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20V177H204" stroke-width="4"/><path d="M48 151V130M85 151V107M122 151V84M159 151V61" stroke-width="15" opacity=".5"/><path d="M39 111L82 81L114 93L190 24M151 24H190V63" stroke-width="8"/></svg></div><a class="global-community-reveal global-community-source" href="https://www.reddit.com/r/osugame/comments/1weff89/osu_has_peaked_above_21k_users_online_today/" target="_blank" rel="noopener noreferrer"><strong class="story-number" data-count="21">21</strong><span class="story-unit">K+</span><p>concurrent users<br><small>September 9, 2026 · View Reddit source ↗</small></p></a><aside class="global-peak-story"><a class="global-peak-thumbnail" href="https://www.youtube.com/watch?v=GcwvzPE-02s" target="_blank" rel="noopener noreferrer"><img src="/osu-wrapped/images/ohnepixel-peak-thumbnail.jpg" alt="OhnePixel reacting to osu!’s concurrent player surge" width="1280" height="720"/></a><div><span class="global-peak-kicker">THE OHNEPIXEL EFFECT</span><p>OhnePixel discovered osu! and streamed it to his viewers, helping push the online player count past 21,000.</p><a class="global-peak-credit" href="https://www.youtube.com/watch?v=GcwvzPE-02s" target="_blank" rel="noopener noreferrer">Thumbnail by sst3w · Watch video ↗</a></div></aside>',note:'Reported peak above 21,000 users online. Approximate community-reported figure.',duration:6500},
 {theme:'global',layout:'global-community',tallySound:true,eyebrow:'ONE MORE TRY. BILLIONS OF TIMES.',title:'A year of<br>ranked plays.',body:'<div class="story-submissions-decoration" aria-hidden="true"><svg viewBox="0 0 220 220" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M38 56V187Q38 197 48 197H157M61 32H148L180 64V172Q180 181 171 181H70Q61 181 61 172Z"/><path d="M147 33V65H179M84 88H151M84 111H129M91 144L109 160L151 125"/></svg></div><div class="global-community-reveal"><strong class="story-number" data-count="1.7" data-count-decimals="1">1.7</strong><span class="story-unit">B+</span><p>ranked plays submitted in 2026</p><aside class="story-community-fact"><span>ONE BIG COMMUNITY</span><p>For every new face, about <b>142 plays</b> hit the leaderboards.</p><small>Comparing community totals, not just plays from new accounts.</small></aside></div>',note:'Over 1.7 billion ranked plays submitted worldwide in 2026.',duration:6500},
 {theme:'pink',layout:'global-score',beatBpm:data.globalStats?.top?.[0]?.bpm,preview:storyPreview(data.globalStats?.top?.[0]),artwork:storyCover(data.globalStats?.top?.[0]?.cover),eyebrow:'THE YEAR’S STANDOUT SCORE · '+escape(globalMode),title:'The highest<br>PP play.',body:storyCrown()+globalFeaturedPlay(data.globalStats),note:'Highest-PP 2026 play found in the current official top 1,000 PP rankings for the selected mode.',duration:8000},
 {theme:'global',layout:'global-plays',preview:storyPreview(data.globalStats?.top?.[0]),eyebrow:'THE WIDER RHYTHM · '+escape(globalMode),title:'Top 5 recorded PP plays.',body:storyPodium()+globalPlaysMarkup(data.globalStats,{story:true}),note:'2026 plays within the current top 1,000 PP rankings, not a complete annual archive.',duration:10000},
 {theme:'global',layout:'global-mods',eyebrow:'THE MODS BEHIND THE SCORES · '+escape(globalMode),title:'Turning up<br>the challenge.',body:'<div class="story-exclamation-decoration" aria-hidden="true"><svg viewBox="0 0 160 220" fill="currentColor"><path d="M57 22Q57 12 67 12H93Q103 12 103 22L96 142Q95 151 87 151H73Q65 151 64 142Z"/><circle cx="80" cy="187" r="20"/></svg></div>'+globalModUsageMarkup(data.globalStats,{story:true}),note:'Most-used individual mods across the global top 25 PP plays. CL excluded; unmodified scores count as No Mod. Multiple mods can appear on one score; tied counts share a rank.',duration:8000},
 {theme:'global',layout:'global-players',eyebrow:'THE PLAYERS BEHIND THE PLAYS · '+escape(globalMode),title:'Making the<br>leaderboard count.',body:storyPodium()+globalPlayerLeadersMarkup(data.globalStats),note:'Players ranked by appearances in the selected mode’s 2026 top 25 PP plays. Tied counts share a rank; highest PP orders ties.',duration:8000},
 {theme:'global',layout:'global-highlight',artwork:storyCover(data.globalStats?.popularBeatmapsets?.[0]?.cover),preview:storyPreview(data.globalStats?.popularBeatmapsets?.[0]),eyebrow:'RANKED IN 2026 · '+escape(globalMode),title:'The most-played<br>newly ranked map.',body:storyCrown()+globalFeaturedMap(data.globalStats),note:'Most lifetime plays among mapsets ranked in 2026 containing the selected mode. Counts combine all difficulties and modes in the set.',duration:8000},
 {theme:'global',layout:'global-popular',preview:storyPreview(data.globalStats?.popularBeatmapsets?.[0]),eyebrow:'THE MAPS THAT BROUGHT US BACK · '+escape(globalMode),title:'Ranked this year.<br>Played on repeat.',body:storyPodium()+popularBeatmapsetsMarkup(data.globalStats,{story:true}),note:'Mapsets ranked in 2026, ordered by lifetime plays across all difficulties and modes in each set.',duration:10000},
 {theme:'global',layout:'global-popular-mappers',eyebrow:'THE HOSTS BEHIND THE HITS · '+escape(globalMode),title:'Most mapsets in<br>the popular top 25.',body:storyPodium()+popularMapperLeadersMarkup(data.globalStats,{story:true}),note:'Mapper hosts ranked by appearances in the selected mode’s 25 most popular mapsets ranked in 2026. Tied counts share a rank; names order ties.',duration:8000},
 {theme:'global',layout:'global-community',countImpact:true,eyebrow:'A YEAR BUILT BY MAPPERS · '+escape(globalMode),title:'New patterns.<br>More ways to play.',body:storyBlueprint()+count(data.globalStats?.rankedMappers?.totalSets,'mapsets ranked in 2026'),note:'Unique currently ranked mapsets with a 2026 ranked date (UTC), containing the selected native gamemode. Each set counts once.'+(data.globalStats?.rankedMappers?.updatedAt?' Snapshot: '+new Date(data.globalStats.rankedMappers.updatedAt).toLocaleDateString('en-US',{timeZone:'UTC'})+'.':''),duration:6500},
 {theme:'global',layout:'global-genres',eyebrow:'THE SOUND OF THE COMMUNITY · '+escape(globalMode),title:'Different genres.<br>One shared rhythm.',body:'<div class="story-music-note-decoration" aria-hidden="true"><svg viewBox="0 0 220 240" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M73 185V57L179 30V159M73 89L179 62"/><ellipse cx="49" cy="188" rx="25" ry="18" transform="rotate(-20 49 188)" fill="currentColor" stroke="none"/><ellipse cx="155" cy="162" rx="25" ry="18" transform="rotate(-20 155 162)" fill="currentColor" stroke="none"/></svg></div>'+popularGenresMarkup(data.globalStats,{story:true}),note:'Top five genres across all currently ranked mapsets with a 2026 ranked date in the selected native mode. Each mapset counts once; percentages use the included mapsets. osu! genre labels; missing metadata appears as Unknown genre. Tied counts share a rank.',duration:8500},
 {theme:'global',layout:'global-mappers',eyebrow:'THE CREATORS BEHIND THE PATTERNS · '+escape(globalMode),title:'Mapping their<br>way to the top.',body:storyBlueprint()+rankedMappersMarkup(data.globalStats,{story:true}),note:'Unique mapsets ranked in 2026, counted under their hosts for the selected native gamemode. Guest difficulties excluded. Tied counts share a rank.',duration:8000});
 if(data.mapping?.status==='ready'&&data.mapping.created>0){
  const beforeCommunity=slides.findIndex(slide=>slide.layout==='global-intro');
  const popular=data.mapping.mostPopular,cover=storyCover(popular?.cover);
  const showcase=Number.isSafeInteger(popular?.id)&&popular.id>0?'<a class="mapping-story-showcase" href="https://osu.ppy.sh/beatmapsets/'+popular.id+'" target="_blank" rel="noopener noreferrer">'+(cover?'<img src="'+escape(cover)+'" alt=""/>':'<span class="mapping-story-placeholder" aria-hidden="true">♫</span>')+'<div><small>'+(data.demo?'EXAMPLE MAPSET · ORIGINAL MAPPER: '+escape(popular.creator):'YOUR MOST-PLAYED 2026 MAPSET')+'</small><b>'+escape(popular.title)+'</b><span>'+escape(popular.artist)+' · '+number(popular.plays)+' lifetime plays</span></div><span class="mapping-story-open" aria-hidden="true">↗</span></a>':'';
  slides.splice(beforeCommunity,0,{theme:'lime',layout:'mapping',preview:storyPreview(data.mapping.mostPopular),syncToPreview:Boolean(storyPreview(data.mapping.mostPopular)),eyebrow:'YOUR IDEAS. THEIR NEXT FAVORITE.',title:'You made<br>new patterns.',body:storyBlueprint()+'<div class="story-duo mapping-story-counts"><div>'+count(data.mapping.created)+'<span>mapsets first submitted in 2026</span></div><div>'+count(data.mapping.ranked)+'<span>of those are currently ranked</span></div><div>'+count(data.mapping.totalPlays)+'<span>all-time plays on these mapsets</span></div></div>'+mappingClubMarkup(data.mapping)+showcase,note:(data.demo?'Demo: fictional mapping counts and playcounts. The featured real mapset belongs to its original mapper. ':'')+'Hosted mapsets first submitted in 2026 (UTC), across all modes. Each set counts once. Excludes guest difficulties hosted by others, deleted sets, and local-only maps. Ranked status is current.',duration:7000});
 }
 for(const [kind,title,rows] of [['mapper','Your mappers.',data.mappers],['artist','Your artists.',data.artists]]){const quiz=makeQuiz(rows,kind);if(quiz){const reveal=slides.findIndex(slide=>slide.title===title);slides.splice(reveal,0,quiz);}}
 return slides;
}
export function openExperience(data,{onSave,onReview}={}){
 if(!canViewWrapped(data))return;
 if(document.querySelector('.story-dialog'))return;
 const slides=experienceSlides(data);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const mobile=matchMedia('(max-width:720px)').matches;
 const dialog=document.createElement('dialog');dialog.className='story-dialog'+(mobile?' story-mobile':'');dialog.setAttribute('aria-label','Your osu! Wrapped experience');
 dialog.innerHTML='<div class="story-shell"><div class="story-orb story-orb-one"></div><div class="story-orb story-orb-two"></div><div class="story-progress" aria-label="Story slides">'+slides.map((s,i)=>'<button type="button" data-story-step="'+i+'" aria-label="Go to slide '+(i+1)+'"><progress max="1000" value="0"></progress></button>').join('')+'</div><div class="story-top"><span>osu! wrapped / 2026'+(data.demo?' · DEMO':'')+'</span><div><button type="button" data-story-mute aria-label="Mute slide audio" title="Mute audio" aria-pressed="false"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/><g class="story-speaker-waves"><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></g><path class="story-speaker-muted" d="m16 9 6 6m0-6-6 6"/></svg></button><button type="button" data-story-pause aria-label="Pause experience">Pause Ⅱ</button><button type="button" data-story-close aria-label="Close experience">Close ×</button></div></div><div class="story-stage"></div><div class="story-bottom"><button type="button" data-story-prev aria-label="Previous slide">← Back</button><span class="story-counter" role="status" aria-live="polite"></span><button type="button" data-story-next>Next →</button></div></div>';
 document.body.append(dialog);
 const stage=dialog.querySelector('.story-stage'),shell=dialog.querySelector('.story-shell'),pause=dialog.querySelector('[data-story-pause]'),next=dialog.querySelector('[data-story-next]');
 let fitFrame=0;
 function scheduleSlideFit(){if(!fitFrame)fitFrame=requestAnimationFrame(()=>{fitFrame=0;fitCurrentSlide();});}
 function fitCurrentSlide(){
  const frame=stage.querySelector('.story-fit-frame'),content=stage.querySelector('.story-fit-content');
  if(!frame||!content||!stage.clientWidth||!stage.clientHeight)return;
  const naturalWidth=Math.max(1,stage.clientWidth-16);content.style.width=naturalWidth+'px';
  const naturalHeight=content.offsetHeight;
  const scale=slideFitScale(naturalWidth,naturalHeight,stage.clientWidth,stage.clientHeight);
  frame.style.width=(naturalWidth*scale)+'px';frame.style.height=(naturalHeight*scale)+'px';
  content.style.transform='scale('+scale+')';
 }
 const slideContentSize=new ResizeObserver(scheduleSlideFit);
 function mountSlideFit(){
  slideContentSize.disconnect();
  const slide=stage.querySelector('.story-slide');if(!slide)return;
  const frame=document.createElement('div'),content=document.createElement('div');
  frame.className='story-fit-frame';content.className='story-fit-content';slide.replaceWith(frame);content.append(slide);frame.append(content);
  stage.classList.add('story-stage-fitted');slideContentSize.observe(content);fitCurrentSlide();
 }
 const stageSize=new ResizeObserver(()=>{stage.style.setProperty('--story-stage-height',stage.clientHeight+'px');scheduleSlideFit();});stageSize.observe(stage);
 document.fonts?.ready.then(()=>{if(dialog.isConnected)scheduleSlideFit();});
 let slideAnimationsSkipped=false;
 let index=0,elapsed=0,paused=reduced,last=performance.now(),raf=0,touchX=null;
 const openingSong="/osu-wrapped/sounds/triangles.mp3";
 const ambientSong="/osu-wrapped/sounds/ambient.mp3";
 let ambientAudio=null;
 const finaleSong="/osu-wrapped/sounds/circles.mp3";
 let introActive=false,introMotion=[],introEnd=4200;
 let muted=false,closing=false;
 const clubCharge=new Audio('/osu-wrapped/sounds/club-charge.wav'),clubArrival=new Audio('/osu-wrapped/sounds/club-reveal.wav');
 for(const audio of [clubCharge,clubArrival]){audio.preload='auto';audio.volume=.6;}
 let clubSoundActive=null;
 function stopClubSound(){for(const audio of [clubCharge,clubArrival]){audio.pause();audio.currentTime=0;}clubSoundActive=null;}
 function playClubSound(audio){stopClubSound();clubSoundActive=audio;audio.muted=muted;if(!paused&&!document.hidden)audio.play().catch(()=>{});}
 function syncClubSound(){
  if(clubSoundActive){if(paused||document.hidden||closing)clubSoundActive.pause();else if(!clubSoundActive.ended)clubSoundActive.play().catch(()=>{});}
  for(const animation of stage.querySelector('.club-hatching')?.getAnimations({subtree:true})||[]){if(paused||document.hidden||closing)animation.pause();else animation.play();}
 }

 const closeAudio=new Audio("/osu-wrapped/sounds/close.mp3");closeAudio.preload="auto";
 let previewAudio=null,openingAudio=null;
 const previewFades=new Map();
 function fadePreview(audio,target,duration=650){
  clearInterval(previewFades.get(audio));previewFades.delete(audio);
  const start=audio.volume,began=performance.now();
  const timer=setInterval(()=>{const fraction=Math.min(1,(performance.now()-began)/duration);const eased=fraction*fraction*(3-2*fraction);audio.volume=start+(target-start)*eased;if(fraction===1){clearInterval(timer);previewFades.delete(audio);if(target===0)audio.pause();}},20);
  previewFades.set(audio,timer);
 }
 function syncPreview(){syncClubSound();if(paused||document.hidden||closing)impactAudio.pause();else if(impactPlayed&&!impactAudio.ended)impactAudio.play().catch(()=>{});if(paused||document.hidden||closing)swooshAudio.pause();else if(swooshStarted&&!swooshAudio.ended)swooshAudio.play().catch(()=>{swooshFallback=true;});if(paused||document.hidden||closing)stopTally();if(closing||!previewAudio)return;const audio=previewAudio;if(document.hidden){clearInterval(previewFades.get(audio));previewFades.delete(audio);audio.pause();audio.volume=0;}else if(paused)fadePreview(audio,0,350);else{audio.play().catch(error=>{if(error.name!=='AbortError'&&previewAudio===audio&&!document.hidden&&!closing&&!paused){paused=true;pauseLabel();}});fadePreview(audio,audio===ambientAudio?.22:.35);}}
 const visibilityChanged=()=>{last=performance.now();syncPreview();};
 document.addEventListener("visibilitychange",visibilityChanged);
 let quizAudio=null;
 const impactAudio=new Audio('/osu-wrapped/sounds/impact.mp3');impactAudio.preload='auto';impactAudio.volume=.55;let impactPlayed=false;
 const swooshAudio=new Audio('/osu-wrapped/sounds/swoosh.mp3');swooshAudio.preload='auto';swooshAudio.volume=.5;let peakMotion=null,swooshStarted=false,swooshFallback=false;
 const tallySounds=Array.from({length:4},()=>{const audio=new Audio('/osu-wrapped/sounds/tick.mp3');audio.preload='auto';audio.volume=.3;return audio;});let tallyIndex=0,lastTally=0;
 function stopTally(){for(const audio of tallySounds){audio.pause();audio.currentTime=0;}}
 const stampAudio=new Audio("/osu-wrapped/sounds/hit.mp3");stampAudio.preload="auto";stampAudio.volume=.65;let stampPlayed=false;
 function playQuizSound(correct){if(quizAudio){quizAudio.pause();quizAudio.currentTime=0;}quizAudio=new Audio('/osu-wrapped/sounds/'+(correct?'pass':'miss')+'.mp3');quizAudio.volume=.65;quizAudio.muted=muted;quizAudio.play().catch(()=>{});}
 let recapPreview=null;
 const answers=new Map();
 const progress=[...dialog.querySelectorAll('progress')];let counters=[],ppGrade=null,gradeBeatTime=null,clubRevealed=false;
 function lockClubSelection(slide){
  if(!slide||reduced)return;
  slide.classList.add('club-reveal-animating');
  const animations=slide.getAnimations({subtree:true}).filter(animation=>Number.isFinite(animation.effect?.getComputedTiming().endTime));
  Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{if(slide.isConnected)slide.classList.remove('club-reveal-animating');});
 }
 function show(i){if(closing)return;const focusedBeforeSlide=document.activeElement;const replacingFocusedContent=stage.contains(focusedBeforeSlide);stopClubSound();impactAudio.pause();impactAudio.currentTime=0;impactPlayed=false;swooshAudio.pause();swooshAudio.currentTime=0;swooshStarted=false;swooshFallback=false;peakMotion?.cancel();peakMotion=null;stopTally();tallyIndex=0;lastTally=0;introMotion.forEach(animation=>animation.cancel());introMotion=[];shell.querySelector(".story-intro")?.remove();introActive=false;introEnd=4200;stampAudio.pause();stampAudio.currentTime=0;stampPlayed=false;gradeBeatTime=null;index=Math.max(0,Math.min(slides.length-1,i));slideAnimationsSkipped=paused;elapsed=0;last=performance.now();const slide=slides[index];if(slideAnimationsSkipped&&slide.layout==='club'&&data.club)clubRevealed=true;shell.className='story-shell story-theme-'+slide.theme;
  shell.querySelector('.story-backdrop')?.remove();
  if(slide.artwork){const image=document.createElement('img');image.className='story-backdrop';image.src=slide.artwork;image.alt='';image.referrerPolicy='no-referrer';image.addEventListener('error',()=>{if(image.parentElement){image.remove();shell.classList.remove('story-has-artwork');}},{once:true});shell.prepend(image);shell.classList.add('story-has-artwork');}
  stage.innerHTML='<div class="story-slide'+(slide.layout==='club'?' story-slide-club':slide.layout==='personal-mods'?' story-slide-personal-mods':slide.layout==='flow'?' story-slide-flow':slide.layout==='plays'?' story-slide-plays':slide.layout==='global-intro'?' story-slide-global-intro':slide.layout==='global-plays'?' story-slide-global-plays':['global-players','global-mappers','global-popular','global-popular-mappers','global-highlight','global-score','global-community','global-peak','global-mods','global-genres'].includes(slide.layout)?' story-slide-global-players story-slide-'+slide.layout:slide.quiz?' story-slide-quiz':'')+'"><span class="story-eyebrow">'+slide.eyebrow+'</span><h2>'+slide.title+'</h2><div class="story-body">'+slide.body+'</div><p class="story-footnote">'+escape(slide.note)+'</p></div>';
  if(slide.layout==='club'&&data.club&&!clubRevealed){
   const content=stage.querySelector('.story-body'),heading=stage.querySelector('h2');heading.innerHTML='Your club<br>is waiting.';content.innerHTML="<div class=\"club-sealed\"><button type=\"button\" class=\"club-reveal-trigger\" data-club-reveal><span class=\"club-seal-visual\" aria-hidden=\"true\"><span class=\"club-seal-orbit\"></span><span class=\"club-seal-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"><path d=\"M50 8L83 26V66L50 90L17 66V26Z\"/><path d=\"M40 38C40 22 65 22 65 39C65 49 51 47 51 60\" stroke-linecap=\"round\"/><circle cx=\"51\" cy=\"71\" r=\"2\" fill=\"currentColor\"/></svg></span></span><b>Reveal my club</b><small>There’s a place for your kind of play.</small></button></div>";content.setAttribute('aria-live','polite');
   const revealButton=stage.querySelector('[data-club-reveal]');
   revealButton.addEventListener('click',()=>{
    if(revealButton.disabled)return;
    const finishReveal=()=>{
     if(!content.isConnected||closing)return;
     playClubSound(clubArrival);clubRevealed=true;elapsed=0;last=performance.now();heading.innerHTML=slide.title;
     content.innerHTML='<div class="club-reveal-burst" aria-hidden="true"></div>'+slide.body;
     stage.querySelector('.story-slide').classList.add('club-unsealed');lockClubSelection(stage.querySelector('.story-slide'));next.textContent='Next →';pauseLabel();heading.tabIndex=-1;heading.focus({preventScroll:true});
    };
    if(reduced){finishReveal();return;}
    revealButton.disabled=true;stage.querySelector('.story-slide').classList.add('club-reveal-animating');revealButton.classList.add('club-hatching');
    revealButton.querySelector('b').textContent='Something is awakening…';
    revealButton.querySelector('small').textContent='Your playstyle is taking shape.';
    revealButton.querySelector('.club-seal-visual').insertAdjacentHTML('beforeend','<span class="club-hatch-light"></span><svg class="club-hatch-cracks" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8L44 29L56 40L45 55L55 72L50 90M45 55L25 61L17 66M56 40L72 33L83 26"/></svg>');
    const visual=revealButton.querySelector('.club-seal-visual');playClubSound(clubCharge);syncClubSound();
    visual.addEventListener('animationend',event=>{if(event.target===visual&&event.animationName==='club-hatch-evolve')finishReveal();});
   });
  }
  if(slide.layout==='club'&&clubRevealed)lockClubSelection(stage.querySelector('.story-slide'));
  if(slide.layout==='global-peak'&&!reduced){const panel=stage.querySelector('.global-peak-story');peakMotion=panel.animate([{opacity:0,transform:'translateX(100px) rotate(4deg)'},{opacity:1,transform:'translateX(0) rotate(0)'}],{duration:648,fill:'both',easing:'cubic-bezier(.16,1,.3,1)'});peakMotion.pause();peakMotion.currentTime=0;}
  if(slide.layout==='final'){
   const container=stage.querySelector('.story-slide');container.classList.add('story-slide-final');
   const content=document.createElement('div');while(container.firstChild)content.append(container.firstChild);container.append(content);
   const preview=document.createElement('div');preview.className='story-recap-preview';preview.setAttribute('aria-live','polite');preview.textContent='Preparing your card…';container.append(preview);
   recapPreview??=createRecap(data).then(blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);})).catch(()=>{recapPreview=null;return null;});
   recapPreview.then(source=>{if(!preview.isConnected)return;if(!source){preview.textContent='Use Save recap card to try generating your card again.';return;}const image=document.createElement('img');image.src=source;image.alt=data.user.username+'’s '+data.year+' recap card preview';const expand=document.createElement('button');expand.type='button';expand.className='story-recap-expand';expand.setAttribute('aria-label','Expand recap card');expand.disabled=introActive;expand.title=introActive?'Available after the ending animation':'Click to expand';expand.append(image);expand.addEventListener('click',()=>expandRecap(source,expand));preview.replaceChildren(expand);});
  }
  stage.querySelectorAll('.story-mapper-avatar:not(.story-artist-avatar) img,.story-user-avatar img,.rarest-medal>img').forEach(image=>{image.addEventListener('error',()=>image.remove(),{once:true});if(image.complete&&image.naturalWidth===0)image.remove();});
  stage.querySelectorAll('.story-artist-avatar img').forEach(bindArtistFallback);
  counters=[...stage.querySelectorAll('[data-count]')].map(el=>({el,value:Number(el.dataset.count)}));
  ppGrade=stage.querySelector('.story-score-heading .story-score-grade,.story-accuracy-label .story-score-grade');
  progress.forEach((p,n)=>p.value=n<index?1000:0);
  dialog.querySelectorAll('[data-story-step]').forEach((button,n)=>button.setAttribute('aria-current',n===index?'step':'false'));
  dialog.querySelector('[data-story-prev]').disabled=index===0;next.textContent=slide.quiz?(answers.has(index)?'See my '+slide.quiz.kind+'s →':'Skip & reveal →'):index===slides.length-1?'Done ✓':'Next →';
  dialog.querySelector('.story-counter').textContent=(index+1)+' / '+slides.length;
  if(slide.quiz){stage.querySelectorAll('[data-quiz-choice]').forEach(button=>button.addEventListener('click',()=>{if(answers.has(index))return;const choice=Number(button.dataset.quizChoice);answers.set(index,choice);elapsed=0;last=performance.now();renderAnswer();button.classList.add('quiz-selected-blink');playQuizSound(slide.quiz.options[choice].count===slide.quiz.topCount);}));renderAnswer();}
  const audioSource=slide.layout==='final'?finaleSong:(index<4||slide.eyebrow==='A LITTLE RECOGNITION')?openingSong:['mapping','global-score','global-plays','global-highlight','global-popular'].includes(slide.layout)?(slide.preview||ambientSong):(slide.quiz||slide.title==='Your mappers.'||slide.layout==='personal-mods'||slide.layout==='club'||slide.layout==='mapping'||slide.layout==='global-intro'||slide.layout==='global-plays'||slide.layout==='global-players'||slide.layout==='global-popular'||slide.layout==='global-mappers'||slide.layout==='global-popular-mappers'||slide.layout==='global-highlight'||slide.layout==='global-score'||slide.layout==='global-community'||slide.layout==='global-peak'||slide.layout==='global-mods'||slide.layout==='global-genres')?ambientSong:slide.preview;
  if(previewAudio?.src!==new URL(audioSource||"",location.href).href){if(previewAudio)fadePreview(previewAudio,0);previewAudio=null;if(audioSource){previewAudio=audioSource===openingSong?(openingAudio??=new Audio(openingSong)):audioSource===ambientSong?(ambientAudio??=new Audio(ambientSong)):new Audio(audioSource);previewAudio.loop=true;previewAudio.volume=0;previewAudio.muted=muted;}}
  if(slide.syncToPreview&&previewAudio){previewAudio.currentTime=0;previewAudio.loop=false;}
  if(index===0&&previewAudio)previewAudio.currentTime=0;
  if(index===0&&!reduced&&!paused){
   if(previewAudio)previewAudio.currentTime=0;introActive=true;shell.classList.add('story-animation-active');const intro=document.createElement('div');intro.className='story-intro';intro.innerHTML='<div class="story-intro-logo"><img src="/osu-wrapped/images/osu-intro-logo.svg" alt="osu!" width="200" height="200"/></div><div class="story-intro-flash"></div>';shell.append(intro);
   const logo=intro.querySelector('.story-intro-logo');
   introMotion=[intro.animate([{backgroundColor:'#15101e'},{backgroundColor:'#15101e',offset:.72},{backgroundColor:'transparent',offset:.75},{backgroundColor:'transparent'}],{duration:4200,fill:'both'}),logo.animate([{opacity:0,transform:'scale(.35)'},{opacity:1,transform:'scale(1.04)',offset:.22},{transform:'scale(1)',offset:.4},{transform:'scale(.94)',offset:.6},{transform:'scale(1.12)',offset:.72},{transform:'scale(.98)',offset:.82},{opacity:1,transform:'scale(1.2)',offset:.91},{opacity:0,transform:mobile?'scale(2.2)':'scale(3.4)'}],{duration:3150,fill:'both',easing:'cubic-bezier(.2,.7,.2,1)'}),intro.querySelector('.story-intro-flash').animate([{opacity:0},{opacity:0,offset:.7},{opacity:1,offset:.75,easing:'ease-out'},{opacity:0}],{duration:4200,fill:'both'})];
   const animate=(element,frames)=>introMotion.push(element.animate(frames,{duration:4200,fill:'both'}));
   const glow=document.createElement('div');glow.className='story-intro-glow';intro.prepend(glow);
   animate(glow,[{opacity:0,transform:'scale(.4)'},{opacity:.8,transform:'scale(1)',offset:.35},{opacity:1,transform:'scale(1.3)',offset:.65},{opacity:0,transform:'scale(2)',offset:.76},{opacity:0}]);
   for(let ring=0;ring<(mobile?2:3);ring++){
    const element=document.createElement('div');element.className='story-intro-ring';intro.prepend(element);
    const start=.06+ring*.13;
    animate(element,[{opacity:0,transform:'scale(.35)'},{opacity:0,transform:'scale(.35)',offset:start},{opacity:.65,transform:'scale(.65)',offset:start+.08},{opacity:0,transform:'scale(2.7)',offset:.72+ring*.025},{opacity:0,transform:'scale(3)'}]);
   }
   for(let dot=0;dot<(mobile?4:8);dot++){
    const orbit=document.createElement('div');orbit.className='story-intro-orbit';orbit.innerHTML='<i></i>';intro.prepend(orbit);
    const angle=dot*(mobile?90:45);
    animate(orbit,[{opacity:0,transform:'rotate('+angle+'deg) scale(1.6)'},{opacity:.75,transform:'rotate('+(angle+60)+'deg) scale(1)',offset:.3},{opacity:.8,transform:'rotate('+(angle+140)+'deg) scale(.8)',offset:.63},{opacity:0,transform:'rotate('+(angle+170)+'deg) scale(2.7)',offset:.76},{opacity:0}]);
   }
   for(let spark=0;spark<(mobile?6:16);spark++){
    const element=document.createElement('div');element.className='story-intro-spark';intro.prepend(element);
    const angle=spark*Math.PI*2/(mobile?6:16),x=Math.cos(angle),y=Math.sin(angle);
    animate(element,[{opacity:0,transform:'translate('+x*90+'px,'+y*90+'px) scale(.3)'},{opacity:0,offset:.53},{opacity:.9,transform:'translate('+x*150+'px,'+y*150+'px) scale(1)',offset:.6},{opacity:0,transform:'translate('+x*650+'px,'+y*650+'px) scale(.2)',offset:.76},{opacity:0}]);
   }
   const controlInk=getComputedStyle(shell).getPropertyValue('--story-ink').trim();
   for(const control of shell.querySelectorAll('.story-top,.story-bottom,.story-progress button'))introMotion.push(control.animate([{color:'#fff'},{color:'#fff',offset:.75,easing:'ease-out'},{color:controlInk}],{duration:4200,fill:'both'}));
   introMotion.forEach(animation=>animation.pause());
  }
  if(slide.layout==='final'&&!reduced&&!paused){
   introActive=true;shell.classList.add('story-animation-active');introEnd=13000;if(previewAudio){previewAudio.currentTime=0;previewAudio.loop=false;}
   const finale=document.createElement('div');finale.className='story-intro story-finale';finale.innerHTML='<div class="story-finale-aura"></div><div class="story-finale-copy"><span>ONE MORE TRY.</span><strong>ONE UNFORGETTABLE YEAR.</strong><b>2026</b></div><div class="story-finale-curtain"></div>';shell.append(finale);
   const animate=(element,frames)=>introMotion.push(element.animate(frames,{duration:13000,fill:'both'}));
   animate(finale,[{opacity:1},{opacity:1,offset:.975},{opacity:0}]);
   animate(finale.querySelector('.story-finale-aura'),[{opacity:.1,transform:'scale(.4)'},{opacity:.5,transform:'scale(1)',offset:.5},{opacity:1,transform:'scale(1.6)',offset:.92},{opacity:0,transform:'scale(3)'}]);
   const copy=finale.querySelector('.story-finale-copy');
   animate(copy.querySelector('span'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)',offset:.12},{opacity:1,offset:.28},{opacity:0,offset:.37},{opacity:0}]);
   animate(copy.querySelector('strong'),[{opacity:0},{opacity:0,offset:.3},{opacity:1,transform:'scale(.95)',offset:.43},{opacity:1,transform:'scale(1)',offset:.65},{opacity:0,transform:'scale(1.15)',offset:.75},{opacity:0}]);
   animate(copy.querySelector('b'),[{opacity:0},{opacity:0,offset:.68},{opacity:1,transform:'scale(.7)',offset:.77},{opacity:1,transform:'scale(1)',offset:.92},{opacity:0,transform:'scale(3)'}]);
   for(let n=0;n<(mobile?3:6);n++){const ring=document.createElement('div');ring.className='story-finale-ring';finale.prepend(ring);const start=n*.1;animate(ring,[{opacity:0,transform:'scale(.2)'},{opacity:0,offset:start},{opacity:.6,transform:'scale(.5)',offset:start+.12},{opacity:0,transform:'scale(3.8)',offset:Math.min(.99,start+.48)},{opacity:0}]);}
   const glass=document.createElement('div');glass.className='story-finale-glass';glass.setAttribute('aria-hidden','true');finale.append(glass);
   const shardCount=mobile?8:18;
   for(let shard=0;shard<shardCount;shard++){
    const angle=shard*Math.PI*2/shardCount,nextAngle=(shard+1)*Math.PI*2/shardCount;
    const radius=90,cx=50,cy=50;
    const points=[[cx,cy],[cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius],[cx+Math.cos(nextAngle)*radius,cy+Math.sin(nextAngle)*radius]];
    const element=document.createElement('div');element.className='story-glass-shard';element.style.clipPath='polygon('+points.map(([x,y])=>x+'% '+y+'%').join(',')+')';glass.append(element);
    const direction=angle+Math.PI/shardCount,distance=(mobile?100:180)+(shard%4)*65;
    animate(element,[{opacity:0,transform:'translate(0,0) rotate(0deg)'},{opacity:0,offset:11.72/13},{opacity:.85,transform:'translate(0,0) rotate(0deg)',offset:11.76/13},{opacity:.6,transform:'translate('+Math.cos(direction)*distance*.35+'px,'+Math.sin(direction)*distance*.35+'px) rotate('+((shard%2?1:-1)*7)+'deg)',offset:11.96/13},{opacity:0,transform:'translate('+Math.cos(direction)*distance+'px,'+Math.sin(direction)*distance+'px) rotate('+((shard%2?1:-1)*36)+'deg)'}]);
   }
   animate(finale.querySelector('.story-finale-curtain'),[{opacity:0},{opacity:0,offset:.96},{opacity:1,offset:.98},{opacity:0}]);
   const ink=getComputedStyle(shell).getPropertyValue('--story-ink').trim();
   for(const control of shell.querySelectorAll('.story-top,.story-bottom,.story-progress button'))animate(control,[{color:'#fff'},{color:'#fff',offset:.96},{color:ink}]);
   introMotion.forEach(animation=>animation.pause());
  }
  mountSlideFit();
  if(replacingFocusedContent||!dialog.contains(document.activeElement)){stage.tabIndex=0;stage.focus({preventScroll:true});}
  stage.scrollTop=0;stage.scrollLeft=0;
  syncPreview();

  if(slide.layout==='club'&&data.club&&!clubRevealed)next.textContent='Skip reveal →';
  pauseLabel();
  if(slideAnimationsSkipped){
   for(const {el,value} of counters)el.textContent=el.dataset.countDecimals==='1'?value.toFixed(1):number(value);
   stampPlayed=true;impactPlayed=false;
   stage.querySelectorAll('.story-score-grade').forEach(grade=>grade.classList.add('story-grade-revealed'));
   if(peakMotion)peakMotion.currentTime=648;
   for(const animation of stage.getAnimations({subtree:true})){
    if(Number.isFinite(animation.effect?.getComputedTiming().endTime))animation.finish();
   }
   stage.querySelector('.club-reveal-animating')?.classList.remove('club-reveal-animating');
  }
  stage.querySelector('[data-story-share]')?.addEventListener('click',()=>{const resumeOnClose=!paused;if(resumeOnClose)toggle();openCardShare(data,{onClose:()=>{if(resumeOnClose&&dialog.open&&!closing&&paused)toggle();}});});
  stage.querySelector('[data-story-review]')?.addEventListener('click',()=>closeExperience(onReview));
  stage.querySelector('[data-story-save]')?.addEventListener('click',()=>onSave?.());
 }
 let expandedRecap=null;
 function expandRecap(source,trigger){
  if(expandedRecap||closing||introActive)return;const resume=!paused;if(resume)toggle();
  const viewer=document.createElement('dialog');expandedRecap=viewer;viewer.className='recap-image-viewer';viewer.setAttribute('aria-label','Expanded recap card');
  const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.setAttribute('aria-label','Close expanded recap card');close.onclick=()=>viewer.close();
  const image=document.createElement('img');image.src=source;image.alt=data.user.username+'’s '+data.year+' recap card';image.draggable=false;
  const toolbar=document.createElement('div');toolbar.className='recap-zoom-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Recap zoom controls');
  const viewport=document.createElement('div');viewport.className='recap-zoom-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Recap card. Use plus and minus to zoom, or drag to move.');
  const canvas=document.createElement('div');canvas.className='recap-zoom-canvas';canvas.append(image);viewport.append(canvas);
  let zoom=1,baseWidth=0,baseHeight=0;
  const zoomOut=document.createElement('button'),zoomIn=document.createElement('button'),reset=document.createElement('button');
  for(const button of [zoomOut,zoomIn,reset])button.type='button';
  zoomOut.textContent='−';zoomOut.setAttribute('aria-label','Zoom out');zoomIn.textContent='+';zoomIn.setAttribute('aria-label','Zoom in');reset.setAttribute('aria-label','Reset zoom to fit');
  function drawZoom(){const w=baseWidth*zoom,h=baseHeight*zoom;image.style.width=w+'px';image.style.height=h+'px';canvas.style.width=Math.max(viewport.clientWidth,w)+'px';canvas.style.height=Math.max(viewport.clientHeight,h)+'px';reset.textContent=Math.round(zoom*100)+'% · Fit';zoomOut.disabled=zoom<=1;zoomIn.disabled=zoom>=5;viewport.classList.toggle('is-zoomed',zoom>1);}
  function setZoom(value,x=viewport.clientWidth/2,y=viewport.clientHeight/2){const old=zoom;zoom=Math.max(1,Math.min(5,value));if(!baseWidth)return;const px=(viewport.scrollLeft+x-Math.max(0,(viewport.clientWidth-baseWidth*old)/2))/(baseWidth*old),py=(viewport.scrollTop+y-Math.max(0,(viewport.clientHeight-baseHeight*old)/2))/(baseHeight*old);drawZoom();viewport.scrollLeft=px*baseWidth*zoom+Math.max(0,(viewport.clientWidth-baseWidth*zoom)/2)-x;viewport.scrollTop=py*baseHeight*zoom+Math.max(0,(viewport.clientHeight-baseHeight*zoom)/2)-y;}
  function fit(){if(!image.naturalWidth)return;const scale=Math.min(viewport.clientWidth/image.naturalWidth,viewport.clientHeight/image.naturalHeight);baseWidth=image.naturalWidth*scale;baseHeight=image.naturalHeight*scale;drawZoom();}
  zoomOut.onclick=()=>setZoom(zoom/1.25);zoomIn.onclick=()=>setZoom(zoom*1.25);reset.onclick=()=>setZoom(1);
  toolbar.append(zoomOut,reset,zoomIn,close);viewer.append(toolbar,viewport);
  image.addEventListener('load',fit);const resize=new ResizeObserver(fit);resize.observe(viewport);
  viewport.addEventListener('wheel',event=>{event.preventDefault();const rect=viewport.getBoundingClientRect();setZoom(zoom*Math.exp(-event.deltaY*.002),event.clientX-rect.left,event.clientY-rect.top);},{passive:false});
  viewport.addEventListener('dblclick',event=>{const rect=viewport.getBoundingClientRect();setZoom(zoom>1?1:2,event.clientX-rect.left,event.clientY-rect.top);});
  viewer.addEventListener('keydown',event=>{if(['+','=','-','0'].includes(event.key)){event.preventDefault();event.stopPropagation();setZoom(event.key==='0'?1:event.key==='-'?zoom/1.25:zoom*1.25);}else if(event.key!=='Escape')event.stopPropagation();});
  const pointers=new Map();let previous=null;
  function gesture(){const points=[...pointers.values()];return points.length>1?{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2,d:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)}:points.length?{...points[0],d:0}:null;}
  viewport.addEventListener('pointerdown',event=>{if(event.button!==0)return;viewport.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});previous=gesture();});
  viewport.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const current=gesture();if(previous){if(current.d&&previous.d){const rect=viewport.getBoundingClientRect();setZoom(zoom*current.d/previous.d,current.x-rect.left,current.y-rect.top);}viewport.scrollLeft-=current.x-previous.x;viewport.scrollTop-=current.y-previous.y;}previous=current;});
  const release=event=>{pointers.delete(event.pointerId);previous=gesture();};viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);viewport.addEventListener('lostpointercapture',release);
  viewer.addEventListener('close',()=>resize.disconnect(),{once:true});

  viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
  viewer.addEventListener('close',()=>{viewer.remove();expandedRecap=null;if(trigger.isConnected)trigger.focus();if(resume&&dialog.open&&!closing&&paused)toggle();},{once:true});
  document.body.append(viewer);viewer.showModal();close.focus();
 }
 function advance(){if(index<slides.length-1)show(index+1);else closeExperience();}
 function renderAnswer(){const quiz=slides[index].quiz;if(!quiz||!answers.has(index))return;const chosen=answers.get(index),correct=quiz.options[chosen].count===quiz.topCount;
  stage.querySelectorAll('[data-quiz-choice]').forEach((button,i)=>{button.disabled=true;button.setAttribute('aria-pressed',String(i===chosen));button.classList.toggle('quiz-correct',quiz.options[i].count===quiz.topCount);button.classList.toggle('quiz-wrong',quiz.options[i].count!==quiz.topCount);});
  const result=stage.querySelector('.story-quiz-feedback');const winner=quiz.options.find(row=>row.count===quiz.topCount);
  result.textContent=(correct?'You got it! ':'Good guess! ')+(quiz.tied?'There’s a tie for first. ':winner.name+' is your top '+quiz.kind+'. ')+number(quiz.topCount)+' '+(quiz.topCount===1?'score':'scores')+' in your 2026 selection.';
  next.textContent='See my '+quiz.kind+'s →';pauseLabel();
 }
 function pauseLabel(){shell.classList.toggle('story-paused',paused);const waiting=(slides[index].quiz&&!answers.has(index))||(slides[index].layout==='club'&&data.club&&!clubRevealed);pause.disabled=Boolean(waiting);pause.textContent=waiting?'Your turn':paused?'Play ▷':'Pause Ⅱ';pause.setAttribute('aria-label',waiting?(slides[index].layout==='club'?'Reveal your club or skip':'Choose an answer or skip'):paused?'Play experience':'Pause experience');}
 function toggle(){if(closing)return;paused=!paused;last=performance.now();pauseLabel();syncPreview();}
 const keyboard=event=>{if(!dialog.open||expandedRecap?.open||[...document.querySelectorAll('dialog[open]')].at(-1)!==dialog)return;if(closing){event.preventDefault();return;}if(event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;if(event.code==='Space' && event.target.closest('button,a'))return;if(event.key==='ArrowRight'){event.preventDefault();advance();}if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.code==='Space'){event.preventDefault();toggle();}};
 function closeExperience(afterClose){
  if(closing)return;stopClubSound();closing=true;paused=true;cancelAnimationFrame(raf);introMotion.forEach(animation=>animation.pause());
  for(const audio of new Set([previewAudio,openingAudio,ambientAudio,...previewFades.keys()]))if(audio)fadePreview(audio,0,400);
  impactAudio.pause();swooshAudio.pause();stopTally();stampAudio.pause();quizAudio?.pause();closeAudio.muted=muted;closeAudio.volume=.65;closeAudio.currentTime=0;
  dialog.classList.add('story-closing');dialog.querySelectorAll('button').forEach(button=>button.disabled=true);
  const finish=()=>{if(!dialog.open)return;closeAudio.pause();dialog.close();afterClose?.();};
  const animation=shell.animate([{opacity:1,transform:'scale(1)'},{opacity:.75,transform:'scale(.99)',offset:.35},{opacity:0,transform:'scale(.96)'}],{duration:2847,easing:'ease-in-out',fill:'forwards'});
  closeAudio.play().catch(()=>{});animation.finished.then(finish,finish);
 }
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeExperience();});
 document.addEventListener('keydown',keyboard);
 const mute=dialog.querySelector('[data-story-mute]');
 mute.onclick=()=>{muted=!muted;clubCharge.muted=muted;clubArrival.muted=muted;for(const audio of new Set([previewAudio,openingAudio,ambientAudio,stampAudio,quizAudio,closeAudio,swooshAudio,impactAudio,...tallySounds,...previewFades.keys()]))if(audio)audio.muted=muted;mute.title=muted?'Unmute audio':'Mute audio';mute.setAttribute('aria-pressed',String(muted));mute.setAttribute('aria-label',muted?'Unmute slide audio':'Mute slide audio');};
 dialog.querySelector('[data-story-close]').onclick=()=>closeExperience();pause.onclick=toggle;
 dialog.querySelector('[data-story-prev]').onclick=()=>show(index-1);next.onclick=advance;
 dialog.querySelectorAll('[data-story-step]').forEach(button=>button.onclick=()=>show(Number(button.dataset.storyStep)));
 stage.addEventListener('pointerdown',event=>{if(!event.target.closest('button,a'))touchX=event.clientX;});
 stage.addEventListener('pointerup',event=>{if(touchX==null)return;const delta=event.clientX-touchX;touchX=null;if(Math.abs(delta)>45){delta<0?advance():show(index-1);}});
 stage.addEventListener('pointercancel',()=>{touchX=null;});
 function tick(now){const dt=now-last;last=now;
  if(introActive&&!paused&&!document.hidden){const time=(previewAudio?.currentTime||0)*1000;introMotion.forEach(animation=>animation.currentTime=time);if(time>=introEnd||previewAudio?.error){introActive=false;shell.classList.remove('story-animation-active');const expand=stage.querySelector('.story-recap-expand');if(expand){expand.disabled=false;expand.title='Click to expand';}shell.querySelector('.story-intro')?.remove();introMotion.forEach(animation=>animation.cancel());introMotion=[];elapsed=0;}}
  if(!introActive&&!paused&&!document.hidden&&(!slides[index].quiz||answers.has(index))&&!(slides[index].layout==='club'&&data.club&&!clubRevealed)){const slide=slides[index],audioTimed=slide.syncToPreview&&previewAudio&&!previewAudio.error&&Number.isFinite(previewAudio.duration)&&previewAudio.duration>0;const duration=audioTimed?previewAudio.duration*1000:slide.duration;elapsed=audioTimed?previewAudio.currentTime*1000:elapsed+Math.min(dt,200);progress[index].value=Math.min(1000,elapsed/duration*1000);if((audioTimed&&previewAudio.ended)||elapsed>=duration){if(index===slides.length-1){elapsed=slides[index].duration;}else show(index+1);}}
  if(!reduced)for(const {el,value} of counters){
   const tally=slides[index].tallySound,precision=el.dataset.countDecimals==='1'?10:1,fraction=(slideAnimationsSkipped||(paused&&!tally))?1:Math.min(1,elapsed/1100),current=Math.round(value*fraction*precision);el.textContent=precision===10?(current/10).toFixed(1):number(current);
   if(tally&&!slideAnimationsSkipped&&current!==lastTally){lastTally=current;if(!paused&&!document.hidden&&!muted){const audio=tallySounds[tallyIndex++%tallySounds.length];audio.pause();audio.preservesPitch=false;audio.mozPreservesPitch=false;audio.webkitPreservesPitch=false;audio.playbackRate=.5+Math.min(1,current/Math.max(1,value*precision))*1.1;audio.currentTime=0;audio.muted=muted;audio.play().catch(()=>{});}}
  }
  if(peakMotion&&!slideAnimationsSkipped&&!paused&&!document.hidden&&elapsed>=1500){if(!swooshStarted){swooshStarted=true;swooshAudio.muted=muted;swooshAudio.play().catch(()=>{swooshFallback=true;});}peakMotion.currentTime=swooshFallback||swooshAudio.error?Math.min(648,elapsed-1500):swooshAudio.currentTime*1000;}
  if(!slideAnimationsSkipped&&slides[index].countImpact&&!impactPlayed&&!paused&&!document.hidden&&elapsed>=1100&&counters.length){impactPlayed=true;impactAudio.muted=muted;impactAudio.play().catch(()=>{});if(!reduced)for(const {el} of counters)el.classList.add('story-count-impact');}
  const beatBpm=slides[index].beatBpm;
  const beatTimed=Number.isFinite(beatBpm)&&beatBpm>0&&previewAudio&&!previewAudio.error;
  if(ppGrade&&!stampPlayed&&!paused&&!document.hidden&&elapsed>=1100){
   if(beatTimed&&gradeBeatTime===null){const period=60/beatBpm;gradeBeatTime=(Math.floor(previewAudio.currentTime/period)+1)*period;}
   if(!beatTimed||previewAudio.currentTime>=gradeBeatTime){stampPlayed=true;stampAudio.muted=muted;stampAudio.play().catch(()=>{});ppGrade.classList.add('story-grade-revealed');}
  }
  if(reduced&&ppGrade)ppGrade.classList.add('story-grade-revealed');

  raf=requestAnimationFrame(tick);
 }
 const focusBefore=document.activeElement;const overflowBefore=document.body.style.overflow;
 dialog.addEventListener('close',()=>{document.removeEventListener('keydown',keyboard);stopClubSound();cancelAnimationFrame(raf);impactAudio.pause();swooshAudio.pause();peakMotion?.cancel();stopTally();expandedRecap?.close();closeAudio.pause();stageSize.disconnect();slideContentSize.disconnect();cancelAnimationFrame(fitFrame);introMotion.forEach(animation=>animation.cancel());if(previewAudio)fadePreview(previewAudio,0);previewAudio=null;document.removeEventListener("visibilitychange",visibilityChanged);stampAudio.pause();quizAudio?.pause();quizAudio=null;document.body.style.overflow=overflowBefore;dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});
 dialog.showModal();document.body.style.overflow='hidden';show(0);stage.tabIndex=0;stage.focus();pauseLabel();raf=requestAnimationFrame(tick);
}

function storyCover(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='assets.ppy.sh'?url.href:'';}catch{return '';}}
function storyDate(value){const date=new Date(value);if(!value||Number.isNaN(date.getTime()))return 'Date unavailable';return 'Set <time datetime="'+date.toISOString()+'">'+new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date)+'</time> · UTC';}
function storyGrade(rank){const label=({X:'SS',XH:'SS',SSH:'SS',SH:'S'})[rank]||rank||'—';const color=({X:'gold',SS:'gold',S:'gold',XH:'silver',SSH:'silver',SH:'silver',A:'green',B:'blue',C:'purple',D:'red'})[rank]||'silver';return '<span class="story-score-grade story-grade-'+color+'" aria-label="Grade '+escape(label)+'">'+escape(label)+'</span>';}

function storyPlays(scores,linkScores=true){
 return '<ol class="story-plays">'+scores.slice(0,5).map((score,i)=>{
  const cover=storyCover(score.cover);
  const link=linkScores&&/^[1-9]\d*$/.test(String(score.id))?'<a class="story-play-link" href="https://osu.ppy.sh/scores/'+encodeURIComponent(score.id)+'" target="_blank" rel="noopener noreferrer">':'';
  return '<li>'+link+'<span class="story-place">0'+(i+1)+'</span><span class="story-map-thumb">'+(cover?'<img src="'+escape(cover)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>':'')+storyGrade(score.rank)+'</span><div class="story-map-info"><b>'+escape(score.title)+'</b><span>'+escape(score.artist)+' · <span class="story-map-mods">'+escape(score.mods||'NM')+'</span></span><span>'+escape(score.version||'Unknown difficulty')+' · Mapped by '+escape(score.creator)+'</span></div><div class="story-map-result"><strong class="story-map-pp" title="'+escape(score.pp)+' pp">'+number(Math.round(score.pp))+' <small>pp</small></strong><span class="play-accuracy">'+formatScoreAccuracy(score.accuracy)+' accuracy</span><span class="story-map-date">'+storyDate(score.date)+'</span></div>'+(link?'</a>':'')+'</li>';
 }).join('')+'</ol>';
}

function storyMapperAvatar(mapper){return '<span class="story-mapper-avatar" aria-hidden="true">'+escape([...mapper.name][0]||'?')+(Number.isSafeInteger(mapper.userId)&&mapper.userId>0?'<img src="https://a.ppy.sh/'+mapper.userId+'" alt="" width="40" height="40" decoding="async" referrerpolicy="no-referrer"/>':'')+'</span>';}

export function quizOptions(rows,random=Math.random){
 const unique=[...new Map(rows.filter(row=>row?.name&&Number.isFinite(row.count)).map(row=>[row.name,row])).values()].sort((a,b)=>b.count-a.count);
 if(unique.length<2)return [];
 const shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
 return shuffle([unique[0],...shuffle(unique.slice(1)).slice(0,3)]);
}
function makeQuiz(rows,kind){
 const options=quizOptions(rows);if(!options.length)return null;
 const topCount=Math.max(...options.map(row=>row.count)),tied=rows.filter(row=>row.count===topCount).length>1;
 return {theme:kind==='mapper'?'lime':'lavender',eyebrow:'BEFORE THE REVEAL · TAKE A GUESS',title:'Who was your<br>top '+kind+'?',duration:3200,quiz:{kind,options,topCount,tied},
 body:'<div class="story-thought-decoration" aria-hidden="true"><svg viewBox="0 0 220 200" fill="none" stroke="currentColor" stroke-width="5"><path d="M52 126C22 126 10 97 25 76C15 48 40 24 65 29C80 7 111 9 128 25C157 10 186 29 185 52C215 61 215 99 192 110C187 138 154 147 133 132C108 151 75 145 65 128Z"/><circle cx="61" cy="163" r="13"/><circle cx="34" cy="188" r="7"/><circle cx="77" cy="80" r="5" fill="currentColor" stroke="none"/><circle cx="112" cy="80" r="5" fill="currentColor" stroke="none"/><circle cx="147" cy="80" r="5" fill="currentColor" stroke="none"/></svg></div><p class="story-quiz-prompt">Who appears most in your 2026 score selection?'+(tied?' There’s a tie - any first-place answer counts.':'')+'</p><div class="story-quiz-options">'+options.map((row,i)=>'<button type="button" data-quiz-choice="'+i+'" aria-pressed="false"><span>'+String.fromCharCode(65+i)+'</span><b>'+escape(row.name)+'</b></button>').join('')+'</div><p class="story-quiz-feedback" role="status" aria-live="polite">Take your time. The story waits for you.</p>',note:'Based on 2026 scores in your current top 200 · choose an answer or skip to the rankings.'};
}

function storyPreview(score){if(!score)return null;try{const url=new URL(score.previewUrl||"", "https://b.ppy.sh");if(url.protocol==="https:"&&url.hostname==="b.ppy.sh"&&/^\/preview\/\d+\.mp3$/.test(url.pathname)&&!url.username&&!url.password&&!url.port)return url.origin+url.pathname;}catch{}const id=storyCover(score.cover)?.match(/\/beatmaps\/(\d+)\//)?.[1];return id?"https://b.ppy.sh/preview/"+id+".mp3":null;}

function storyUserAvatar(user){let source=null;try{const url=new URL(user.avatar);if(url.protocol==="https:"&&url.hostname==="a.ppy.sh"&&!url.username&&!url.password&&!url.port)source=url.href;}catch{}if(!source&&Number.isSafeInteger(user.id)&&user.id>0)source="https://a.ppy.sh/"+user.id;return '<span class="story-user-avatar" aria-hidden="true"><span>'+escape([...user.username][0]||'?')+'</span>'+(source?'<img src="'+escape(source)+'" alt="" decoding="async" referrerpolicy="no-referrer"/>':'')+'</span>';}

function storyArtistAvatar(artist){return '<span class="story-mapper-avatar story-artist-avatar" aria-hidden="true">'+escape([...artist.name][0]||'?')+'<img src="/api/osu-wrapped/artist-image?name='+encodeURIComponent(artist.name)+'" data-artist-cover="'+escape(artistCover(artist.cover))+'" alt="" width="40" height="40" referrerpolicy="no-referrer"/></span>';}

function storyComboScore(data){
 const score=data.comboScore||data.top.find(row=>row.id===data.comboScoreId);if(!score)return '';
 const cover=storyCover(score.cover);
 const content=(cover?'<img class="story-combo-cover" src="'+escape(cover)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>':'')+'<b>'+escape(score.title)+'</b><small>'+escape([score.artist,score.version].filter(Boolean).join(' · '))+'</small><small>Mapped by '+escape(score.creator||'Unknown mapper')+'</small>';
 return !data.demo&&/^[1-9]\d*$/.test(String(score.id))?'<a class="story-combo-score" href="https://osu.ppy.sh/scores/'+encodeURIComponent(score.id)+'" target="_blank" rel="noopener noreferrer" aria-label="View highest combo score: '+escape(score.title)+'">'+content+'<small>View score ↗</small></a>':'<div class="story-combo-score">'+content+'</div>';
}

function globalFeaturedPlay(data){
 const score=data?.top?.[0];if(!score)return '<p>Global plays are temporarily unavailable.</p>';
 return '<div class="story-score-heading"><strong class="story-number" data-count="'+Math.round(score.pp)+'" title="'+escape(score.pp)+' pp">'+number(Math.round(score.pp))+'</strong><span class="story-unit">pp</span>'+storyGrade(score.rank)+'</div><a class="global-featured-player" href="https://osu.ppy.sh/users/'+encodeURIComponent(score.userId)+'" target="_blank" rel="noopener noreferrer">'+storyUserAvatar({id:score.userId,username:score.username})+'<b>'+escape(score.username)+'</b></a><a class="global-featured-score-link" href="https://osu.ppy.sh/scores/'+encodeURIComponent(score.scoreId)+'" target="_blank" rel="noopener noreferrer"><b>'+escape(score.title)+'</b><span>'+escape(score.artist)+'</span><span>'+escape(score.version)+' · Mapped by '+escape(score.creator)+'</span></a><div class="story-tags">'+escape(score.mods)+' · '+formatScoreAccuracy(score.accuracy)+' accuracy</div><p class="story-score-date">'+storyDate(score.date)+' · Click the play to view score</p>';
}

function globalFeaturedMap(data){
 const map=data?.popularBeatmapsets?.[0];if(!map)return '<p>Popular beatmaps are temporarily unavailable.</p>';
 const cover=storyCover(map.cover);
 return '<a class="global-featured-card global-popular-feature" href="'+popularBeatmapUrl(map,data?.mode)+'" target="_blank" rel="noopener noreferrer">'+(cover?'<div class="global-popular-art"><img src="'+escape(cover)+'" alt=""/><span class="global-popular-badge">#1 · RANKED IN 2026</span><span class="global-popular-rings" aria-hidden="true"></span></div>':'')+'<div class="global-featured-details"><span class="global-popular-caption">ON REPEAT, WORLDWIDE</span><div class="global-popular-count"><strong class="story-number" data-count="'+map.plays+'">'+number(map.plays)+'</strong><small>lifetime plays</small></div><b>'+escape(map.title)+'</b><span>'+escape(map.artist)+'</span><span>Mapped by '+escape(map.creator)+'</span><small>Ranked '+escape(new Date(map.rankedDate).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'}))+' · UTC · View beatmap ↗</small></div></a>';
}

function storyCrown(){return '<div class="story-crown-decoration" aria-hidden="true"><svg viewBox="0 0 200 160" fill="none" stroke="currentColor" stroke-linejoin="round"><path d="M29 111L17 39L65 72L100 18L135 72L183 39L171 111Z" stroke-width="7"/><path d="M33 132H167" stroke-width="9" stroke-linecap="round"/><circle cx="17" cy="30" r="8" fill="currentColor" stroke="none"/><circle cx="100" cy="12" r="8" fill="currentColor" stroke="none"/><circle cx="183" cy="30" r="8" fill="currentColor" stroke="none"/></svg></div>';}

function storyBlueprint(){return '<div class="story-blueprint-decoration" aria-hidden="true"><svg viewBox="0 0 240 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M29 22H211V169H29Z" stroke-width="4"/><path d="M59 23V168M89 23V168M119 23V168M149 23V168M179 23V168M30 51H210M30 81H210M30 111H210M30 141H210" stroke-width="1"/><path d="M60 137V59H116V105H180V137Z" stroke-width="5"/><path d="M60 174V187M180 174V187M61 181H179M15 59H24M15 137H24M19 60V136" stroke-width="2"/><circle cx="116" cy="59" r="6" fill="currentColor" stroke="none"/><circle cx="180" cy="105" r="6" fill="currentColor" stroke="none"/></svg></div>';}

function storyPodium(){return '<div class="story-podium-decoration" aria-hidden="true"><svg viewBox="0 0 240 200" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M18 174V101H86V174M86 174V57H154V174M154 174V123H222V174M12 180H228"/><path d="M115 86L123 80V110M114 110H132M43 124Q43 113 54 113Q65 113 65 124Q65 130 44 146H67M179 143Q181 135 190 135Q201 135 201 144Q201 151 191 151Q202 151 202 160Q202 169 190 169Q180 169 178 161" stroke-width="4" stroke-linecap="round"/><path d="M120 12L125 24L139 25L128 34L132 48L120 40L108 48L112 34L101 25L115 24Z" stroke-width="3"/></svg></div>';}
