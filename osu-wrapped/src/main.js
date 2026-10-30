import {createCompletionSound} from './completion-sound.js';
import {installQueueDeparture} from './queue-departure.js';
import {savedBeatmapCover} from './beatmap-cover.js';
import {demoMarkup} from './demo-images.js';
import {loadReview} from './review-loader.js';
import {skillsetsMarkup,openSkillsetMaps} from './skillsets.js';
import {releaseAccess} from './release-state.js';
import {openAdminPanel} from './admin.js';
import {comboMarkup} from './score-combo.js';
import {beatmapAveragesMarkup} from './beatmap-averages.js';
import {preloadModIcons} from './mod-preload.js';
import {preloadArtistImages,artistImageSource} from './artist-preload.js';
import {installSecret} from './secret.js';
installSecret({audioUrl:'/osu-wrapped/sounds/wysi.mp3'});
import packageInfo from '../package.json' with {type:'json'};
import {mappingOnly} from './eligibility.js';
import {openMappingLegend} from './mapping-clubs.js';
import {artistCover,bindArtistFallback} from './artist-fallback.js';
import {mappingStatsMarkup} from './mapping.js';
import {openCredits} from './credits.js';
import {clubMarkup,openClubLegend} from './clubs.js';
import {openModBreakdown} from './mod-breakdown.js';
import {openBeatmap} from './beatmap-viewer.js';
import {globalDashboard} from './global.js';
import {favoriteModIcons} from './mod-icons.js';
import {favoriteModLabel,favoriteModNote} from './mods.js';
import {rarestMedalMarkup} from './medals.js';
import {accuracyRank,formatScoreAccuracy} from './accuracy.js';
import {openCardShare} from './share.js';
import {openExperience,firstExperience,markExperience,canViewWrapped} from './experience.js';
import {openReplay} from './replay.js';

import {demo,demoGlobal} from './demo.js';
const root=document.querySelector('#app');
let modeChosen=false;
let loadPhase='core',tagProgress=null,waitingProgress=null,detailsProgress=null;
let data=null,mode='osu',tab='mappers',loading=false,error='',connected=new URLSearchParams(location.search).has('connected');
const completionSound=createCompletionSound();
document.addEventListener('pointerdown',completionSound.unlock,{passive:true});
document.addEventListener('keydown',completionSound.unlock);
let liveLoading=false,liveData=null,liveMode='osu',liveError='',liveClient=null;
installQueueDeparture({base:'/api/osu-wrapped',current:()=>({loading:liveLoading,client:liveClient})});
let statsView='user';const globalCache=new Map(),globalPending=new Map(),globalErrors=new Set();
let scrollAfterLoad=connected;
function scrollToStats(instant=false){document.querySelector('#inside')?.scrollIntoView({behavior:instant||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=value=>value==null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const modes=[['osu','osu!'],['taiko','osu!taiko'],['fruits','osu!catch'],['mania','osu!mania']];
function render(){
 const existingSwitch=root.querySelector('.stats-switch');
 root.innerHTML=demoMarkup(`<header><a href="/osu-wrapped/" class="brand"><span class="brand-circle">osu!</span> wrapped<span class="edition">/ 2026</span></a><nav>${releaseAccess.owner?'<button type="button" class="nav-credits" data-admin aria-haspopup="dialog">Admin</button>':''}<a href="/">← Main site</a><a href="#inside">The experience</a><a href="#data-notes">About the data</a><button type="button" class="nav-credits" data-credits aria-haspopup="dialog">Credits & Thanks</button><!-- Donations temporarily disabled pending music permissions. <a class="donate-button" href="https://ko-fi.com/ronaldonater" target="_blank" rel="noopener noreferrer">Donate <span aria-hidden="true">♡</span></a> -->${data&&!data.demo?'<button class="quiet" id="logout">Sign out ↗︎</button>':'<a class="nav-login" href="/api/osu-wrapped/auth/login">Connect osu! ↗︎</a>'}</nav></header>
 <main><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> YOUR YEAR IN RHYTHM · 2026</div><h1>One more try.<br>One <em>unforgettable</em><br>year.</h1><p>Your profile activity. Your standout performances.<br>Revisit the 2026 scores in your current top 200.</p><div class="actions"><a class="button primary" id="get-wrapped" href="/api/osu-wrapped/auth/login">Get my Wrapped <span class="ui-external-arrow" aria-hidden="true">↗︎</span></a><button class="button secondary" id="demo">Explore a demo <span>▷</span></button></div><div class="small-note">Free. Fan-made. Powered by your osu! profile.</div></div><div class="hero-art" aria-label="Decorative osu hit circles"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><span class="art-label">KEEP YOUR RHYTHM.</span><div class="trail"></div><div class="hit hit-one">1</div><div class="hit hit-two">1</div><div class="hit hit-three">1</div><div class="hit hit-four">1</div><span class="art-star" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M20 4V36M4 20H36M9 9L31 31M9 31L31 9"/></svg></span><span class="art-score"><span class="hit-result-50">50</span> <i>300</i> 100</span><div class="art-bottom">A YEAR WORTH PLAYING BACK <span class="ui-external-arrow" aria-hidden="true">↗︎</span></div></div></section>
 <section class="review" id="inside"><div class="section-heading"><div><div class="eyebrow pink">THE REWIND</div><div class="rewind-profile">${data?`<a class="rewind-avatar" href="https://osu.ppy.sh/users/${encodeURIComponent(data.user.id)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(data.user.username)}’s osu! profile">${escape([...data.user.username][0] || '?')}${safeAvatar(data.user.avatar)?`<img src="${escape(safeAvatar(data.user.avatar))}" alt="" width="48" height="48" decoding="async" referrerpolicy="no-referrer"/>`:''}</a>`:''}<h2>${data?`${escape(data.user.username)}’s 2026`:'Your year, in full colour.'}</h2></div></div><div class="mode-picker" aria-label="Game mode">${modes.map(([id,label])=>`<button data-mode="${id}" aria-pressed="${mode===id}" ${loading?'disabled':''}>${label}</button>`).join('')}</div></div>
 ${statsSwitch()}
 ${data?.demo&&(liveLoading||liveData||liveError)?`<div class="notice background-wrapped-notice" data-background-wrapped role="status">${backgroundNoticeContents()}</div>`:''}
 ${error?`<div class="notice error" role="alert">${escape(error)}</div>`:''}
 <div id="stats-panel" role="tabpanel" aria-labelledby="stats-tab-${statsView}">${loading?loadingMarkup():statsView==='global'?globalDashboard(data?.demo?data.globalStats:globalCache.get(mode),mode,{loading:!data?.demo&&globalPending.has(mode),error:!data?.demo&&globalErrors.has(mode)}):data?dashboard():`<div class="empty-intro"><span>THE NUMBERS</span><h3>You showed up.<br>Here’s what happened.</h3><p>Your profile playcounts and medals, plus standout scores and artists from the 2026 plays in your current top 200.</p><button class="button secondary" id="demo-bottom">Take a look inside ↗︎</button><div class="empty-circles">◎<span>✦</span>◎</div></div>`}</div></section>
 <section class="data-notes" id="data-notes"><div class="eyebrow pink">A LITTLE TRANSPARENCY</div><h2>Real data. Honest limits.</h2><div class="notes-grid"><article><span>01</span><h3>Your account stays yours.</h3><p>Sign in on osu!’s official website. We never ask for your password. Your encrypted session expires automatically; signing out clears it.</p></article><article><span>02</span><h3>A year, still in progress.</h3><p>2026 runs January 1 – December 31 in UTC. Before the year ends, this is a year-to-date review. Monthly activity reflects osu!’s available profile history.</p></article><article><span>03</span><h3>No invented history.</h3><p>osu! doesn’t provide a complete annual score archive here. Accuracy, combo, PP plays and mapper/artist rankings use only 2026 scores found in your current top 200 best plays for the selected mode, including stable and lazer scores. Older scores in that list are excluded; displaced scores are not recovered. Playcounts and replay views use monthly profile history, while medals use dated profile achievements; these are profile-wide. When community club tracking is enabled, generating a review saves a pseudonymous club assignment for this year and mode to calculate participant percentages. Access tokens are not stored in the database. Profile responses and completed reviews are temporarily cached in encrypted form so loading can resume.</p></article></div><a href="https://osu.ppy.sh/docs/index.html" target="_blank" rel="noreferrer">Explore the osu! API documentation ↗︎</a></section></main><footer><a class="brand" href="/osu-wrapped/"><span class="footer-osu-logo">osu!</span><b>wrapped</b> <span class="edition">2026</span></a><span>An independent fan project. Not affiliated with ppy or osu!.</span><span class="footer-meta"><span>Made for the love of the game. ♡</span><span class="app-version" aria-label="App version ${escape(packageInfo.version)}">v${escape(packageInfo.version)}</span></span></footer>`,Boolean(data?.demo));
 if(existingSwitch){document.querySelector('.stats-switch')?.replaceWith(existingSwitch);existingSwitch.dataset.view=statsView;existingSwitch.querySelectorAll('[data-stats-view]').forEach(button=>{const active=button.dataset.statsView===statsView;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});}
 document.querySelectorAll('.score-thumbnail img, .pb-background').forEach(img=>{img.addEventListener('error',()=>img.remove(),{once:true});if(img.complete && img.naturalWidth===0)img.remove();});
 document.querySelectorAll('.mapper-avatar:not(.artist-avatar) img, .rewind-avatar img, .rarest-medal>img').forEach(img=>{img.addEventListener('error',()=>img.remove(),{once:true});if(img.complete && img.naturalWidth===0)img.remove();});
 document.querySelectorAll('#demo,#demo-bottom').forEach(el=>el.onclick=()=>{if(data&&!data.demo){liveData=data;liveMode=mode;}data=demo(mode);loading=false;error='';render();scrollToStats();});
 document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>{mode=el.dataset.mode;modeChosen=true;if(statsView==='global')loadGlobal(mode);if(data?.demo){loadDemoMode();}else if(data||connected)load();else render();});
 document.querySelector('#logout')?.addEventListener('click',async()=>{try{const r=await fetch('/api/osu-wrapped/auth/logout',{method:'POST'});if(!r.ok)throw Error('Could not sign out. Try again.');data=null;connected=false;location.href='/osu-wrapped/';}catch(e){error=e.message;render();}});
 document.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>{tab=el.dataset.tab;render();});
 document.querySelectorAll('[data-replay-index]').forEach(button=>button.addEventListener('click',()=>{const score=data?.top[Number(button.dataset.replayIndex)];if(score)openReplay(score,'/api/osu-wrapped');}));
 document.querySelectorAll('[data-global-replay-index]').forEach(button=>button.addEventListener('click',()=>{const score=(data?.demo?data.globalStats:globalCache.get(mode))?.top[Number(button.dataset.globalReplayIndex)];if(score)openReplay({...score,id:score.scoreId},'/api/osu-wrapped',{globalMode:mode});}));
 document.querySelectorAll('[data-beatmap-index]').forEach(link=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();const score=(data?.demo?data.globalStats:globalCache.get(mode))?.popularBeatmapsets?.[Number(link.dataset.beatmapIndex)];if(score)openBeatmap(score);}));
 document.querySelectorAll('[data-skillset-maps]').forEach(entry=>{entry.addEventListener('click',event=>{if(!event.target.closest('a'))openSkillsetMaps(data,entry.dataset.skillsetMaps);});entry.addEventListener('keydown',event=>{if(event.target===entry&&['Enter',' '].includes(event.key)){event.preventDefault();openSkillsetMaps(data,entry.dataset.skillsetMaps);}});});
 document.querySelector('[data-mod-breakdown]')?.addEventListener('click',()=>openModBreakdown(data));
 document.querySelector('[data-mapping-legend]')?.addEventListener('click',()=>openMappingLegend(data?.mapping));
 document.querySelector('[data-club-legend]')?.addEventListener('click',()=>openClubLegend(data));
 document.querySelector('[data-admin]')?.addEventListener('click',()=>openAdminPanel('/api/osu-wrapped'));
 document.querySelector('[data-credits]')?.addEventListener('click',openCredits);
 document.querySelector('#export')?.addEventListener('click',()=>download(JSON.stringify(data,null,2),'application/json','osu-wrapped-2026.json'));
 document.querySelectorAll('.artist-avatar img').forEach(bindArtistFallback);
 document.querySelector('#share')?.addEventListener('click',shareCard);
 document.querySelector('#social-share')?.addEventListener('click',()=>openCardShare(structuredClone(data)));
 bindBackgroundView();
 document.querySelector('#get-wrapped')?.addEventListener('click',event=>{if(liveLoading||liveData||connected){event.preventDefault();if(!data?.demo&&data){scrollToStats();return;}data=liveData;mode=liveMode;modeChosen=Boolean(liveData)||modeChosen;loading=liveLoading;error=liveError;statsView='user';render();scrollToStats();if(liveData)finishPersonalView();else if(!liveLoading&&!liveError)load();}});
 document.querySelectorAll('[data-stats-view]').forEach(button=>{button.onclick=()=>{statsView=button.dataset.statsView;render();document.querySelector('#stats-tab-'+statsView)?.focus({preventScroll:true});if(statsView==='global')loadGlobal(mode);};button.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const target=event.key==='Home'?'user':event.key==='End'?'global':statsView==='user'?'global':'user';document.querySelector('[data-stats-view="'+target+'"]')?.click();}};});
 document.querySelectorAll('[data-global-retry]').forEach(button=>button.addEventListener('click',()=>{globalCache.delete(mode);globalErrors.delete(mode);loadGlobal(mode);}));
 document.querySelector('#story-replay')?.addEventListener('click',()=>startExperience());
}
function dashboard(){
 if(!canViewWrapped(data))return `<div class="notice" role="status"><h3>No eligible scores for this mode yet.</h3><p>Your Wrapped needs at least one score dated in 2026 in your current top 200 best plays for the selected mode, or a hosted mapset first submitted in 2026. Try another game mode, or come back after setting an eligible score or submitting a mapset.</p></div>`;
 if(mappingOnly(data))return `<div class="review-meta"><span>CONNECTED · Your mapping year <span class="live-dot"></span></span><div><button id="story-replay">▷ Play Experience</button><button id="share">↓ Save recap card</button><button id="export">↓ Export JSON</button><button id="social-share" class="card-share-icon" aria-label="Share recap card">↗︎</button></div></div><div class="notice">Your mapping Wrapped is ready. You have no eligible 2026 scores in this mode, so score-based statistics and playstyle clubs are omitted. Your hosted mapsets first submitted in 2026 are included across all modes.</div>${mappingStatsMarkup(data)}`;
 const best=data.top[0];const maximum=Math.max(...data.months.map(m=>m.count),1);const peak=data.months.reduce((a,b)=>a.count>b.count?a:b);const labels=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
 return `<div class="review-meta"><span>${data.demo?'DEMO · Saved snapshot · Real beatmaps, fictional scores':'CONNECTED · Your osu! profile'} <span class="live-dot"></span></span><div><button id="story-replay">▷ Play Experience</button><button id="share">↓ Save recap card</button><button id="export">↓ Export JSON</button><button id="social-share" class="card-share-icon" title="Share card" aria-label="Share recap card"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg></button></div></div><div class="notice">${data.demo?'You’re exploring real beatmaps with fictional example scores and profile activity. Connect osu! to see your own year.':'Your 2026 year-to-date review is ready.'} Score-based stats use <strong>${num(data.sampleCount)} scores dated in 2026 from your current top 200 best plays</strong> for the selected mode. These are not your 200 best plays from 2026 or a complete annual archive. Playcounts, replay views and medals come from profile history.</div>
 <div class="stats-grid"><article class="stat featured"><span>THE TIMES YOU HIT PLAY</span><strong>${num(data.playcount)}</strong><p>plays in 2026 <span class="ui-external-arrow" aria-hidden="true">↗︎</span></p><small>Available monthly profile counts · all modes</small></article>${stat('AVERAGE ACCURACY',accuracyValue(data.accuracy),'2026 passed scores in current top 200 · unweighted mean')}${stat('HIGHEST COMBO',data.combo==null?'—':num(data.combo)+'×','2026 passed scores in current top 200',!data.demo?data.comboScoreId:null)}${stat('MEDALS UNLOCKED',num(data.medals),'Dated achievements · all modes')}${stat('REPLAYS WATCHED',num(data.replayViews),'Available monthly profile counts · all modes')}${stat('FAVORITE MOD','<span class="favorite-mod-value">'+favoriteModIcons(data.favoriteMod)+'<span>'+escape(favoriteModLabel(data.favoriteMod))+'</span></span>','<span class="favorite-mod-count">'+escape(favoriteModNote(data.favoriteMod))+(data.favoriteMod?.total>0?' ('+(data.favoriteMod.count/data.favoriteMod.total*100).toFixed(2)+'%)':'')+'</span> · 2026 scores in current top 200')}</div>
 <div class="personal-patterns-grid">${beatmapAveragesMarkup(data)}${skillsetsMarkup(data)}</div><div class="personal-highlights-grid"><article class="panel club-panel">${clubMarkup(data)}</article>
 <article class="panel rarest-medal-panel">${rarestMedalMarkup(data)}</article></div>
 <div class="middle-grid"><article class="panel activity"><div class="panel-heading"><div><span class="eyebrow">YOUR MONTHLY RHYTHM</span><h3>Consistency looks good on you.</h3></div><span class="pill">2026</span></div><div class="chart">${data.months.map((m,i)=>`<div class="bar-column"><div class="bar-track"><div class="bar ${m===peak?'peak':''} h-${Math.round(m.count/maximum*20)}" title="${labels[i]}: ${m.available?num(m.count)+' plays':'No data returned'}"><span>${num(m.count)}</span></div></div><small>${labels[i]}</small></div>`).join('')}</div><p class="chart-caption">${data.playcount?`${['January','February','March','April','May','June','July','August','September','October','November','December'][peak.month]} was your busiest month. ${num(peak.count)} reasons to press retry.`:'No monthly activity was returned for 2026.'} Empty months can indicate no activity or unavailable history.</p></article>${standoutCard(best)}</div>
 <div class="bottom-grid"><article class="panel favorites"><div class="tabs"><button data-tab="mappers" aria-pressed="${tab==='mappers'}">Favorite mappers</button><button data-tab="artists" aria-pressed="${tab==='artists'}">Favorite artists</button></div><h3>The ${tab==='mappers'?'mappers':'artists'} behind your best plays.</h3><p class="muted">Top 10 · counts of 2026 scores in your current top 200</p><ol class="favorites-list">${data[tab].map((r,i)=>`<li><span class="position">${String(i+1).padStart(2,'0')}</span>${tab==='mappers'?`<a class="favorite-name mapper-link" href="https://osu.ppy.sh/users/${encodeURIComponent(r.userId ?? r.name)}" target="_blank" rel="noopener noreferrer"><span class="mapper-avatar" aria-hidden="true">${escape([...r.name][0] || '?')}${Number.isSafeInteger(r.userId) && r.userId>0?`<img src="https://a.ppy.sh/${r.userId}" alt="" width="32" height="32" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>`:''}</span><span class="mapper-label">${escape(r.name)}</span> <span aria-hidden="true">↗︎</span></a>`:`<a class="favorite-name mapper-link" href="https://osu.ppy.sh/beatmapsets?q=${encodeURIComponent(r.name)}" target="_blank" rel="noopener noreferrer"><span class="mapper-avatar artist-avatar" aria-hidden="true">${escape([...r.name][0]||'?')}${artistImageSource(r,'/api/osu-wrapped')?`<img src="${escape(artistImageSource(r,'/api/osu-wrapped'))}" data-artist-cover="${escape(artistCover(r.cover))}" alt="" width="32" height="32" decoding="async" referrerpolicy="no-referrer"/>`:''}</span>${escape(r.name)} <span aria-hidden="true">↗︎</span></a>`}<span><b>${num(r.count)}</b> ${r.count===1?'score':'scores'}</span></li>`).join('')||'<li>No available scores to rank yet.</li>'}</ol><small>Artist images: <a href="https://www.theaudiodb.com" target="_blank" rel="noopener noreferrer">TheAudioDB</a>, with beatmap artwork as a fallback. Counts are scores in this selection, not yearly map attempts or explicit favorites. Mapper credits use the mapset creator, which may differ from the guest difficulty’s mapper.</small></article><article class="panel top-plays"><div class="panel-heading"><div><span class="eyebrow">PERSONAL BEST MATERIAL</span><h3>Your top ${data.top.length} PP plays.</h3></div><span class="pill">${escape(modes.find(m=>m[0]===mode)[1])}</span></div><p class="muted">2026 scores found in your current top 200 plays.</p><div class="score-list">${data.top.map((s,i)=>`<div class="score-entry"><a class="score" ${!data.demo && /^\d+$/.test(String(s.id))?`href="https://osu.ppy.sh/scores/${encodeURIComponent(s.id)}" target="_blank" rel="noopener noreferrer"`:''}><span class="position">${String(i+1).padStart(2,'0')}</span><span class="score-thumbnail">${safeCover(s.cover)?`<img src="${escape(safeCover(s.cover))}" alt="" width="64" height="44" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>`:''}<span class="grade ${gradeClass(s.rank)}">${escape(gradeLabel(s.rank))}</span></span><span class="song"><b>${escape(s.title)}</b><small>${escape(s.artist)} · ${escape(s.version)} · ${escape(s.mods)}</small><small class="score-mapper">Mapped by ${escape(s.creator)}</small><small class="score-date">${scoreDate(s.date)}</small></span></a><div class="score-actions"><span class="score-pp" title="${escape(s.pp)} pp">${Math.round(s.pp)}<small>pp</small></span><span class="play-accuracy">${formatScoreAccuracy(s.accuracy)} · ${comboMarkup(s)}</span>${!data.demo && /^\d+$/.test(String(s.id))?`<button type="button" class="watch-replay" data-replay-index="${i}" ${s.replayAvailable===false?'disabled title="No replay is available for this score"':''}>▷ Watch replay</button>`:''}</div></div>`).join('')||'<div class="no-scores">No 2026 PP scores found in your current top 200 for this mode. Try another mode.</div>'}</div></article></div>${mappingStatsMarkup(data)}<div class="coverage"><strong>Behind your numbers</strong><p>${escape(data.coverage)}</p><small>Generated ${escape(new Date(data.generatedAt).toLocaleString())}. Unavailable data is shown as —.</small></div>`;
}
function stat(label,value,note,scoreId=null){const linked=scoreId!=null && /^\d+$/.test(String(scoreId));const modBreakdown=label==='FAVORITE MOD';const tag=modBreakdown?'button':linked?'a':'article';return `<${tag} class="stat${modBreakdown?' stat-mod-button':''}${linked?' stat-link':''}" ${modBreakdown?'type="button" data-mod-breakdown aria-haspopup="dialog"':''} ${linked?`href="https://osu.ppy.sh/scores/${encodeURIComponent(scoreId)}" target="_blank" rel="noopener noreferrer"`: ''}><span>${label}${linked?' <span class="ui-external-arrow" aria-hidden="true">↗︎</span>':''}</span><strong>${value}</strong><small>${note}</small></${tag}>`;}
function backgroundWrappedText(){return liveLoading?'Your Wrapped is still generating in the background. Your queue position is kept while you explore this demo. Select Get my Wrapped to view progress.':liveData?'Your Wrapped is ready. Select Get my Wrapped or press View now to view it.':'Your Wrapped needs attention. Select Get my Wrapped to see the message.';}
function backgroundNoticeContents(){return '<span>'+escape(backgroundWrappedText())+'</span>'+(liveData?'<button type="button" class="button secondary" data-view-wrapped>View now</button>':'');}
function bindBackgroundView(){document.querySelector('[data-view-wrapped]')?.addEventListener('click',()=>document.querySelector('#get-wrapped')?.click());}
function updateBackgroundNotice(){const notice=document.querySelector('[data-background-wrapped]');if(notice){notice.innerHTML=backgroundNoticeContents();bindBackgroundView();}}
function finishPersonalView(){
 if(!data||data.demo)return;
 let storage;try{storage=window.localStorage;}catch{}
 const first=firstExperience(data,storage);
 if(scrollAfterLoad){scrollAfterLoad=false;scrollToStats(first);}
 if(first)startExperience();
}
async function load(){
 if(liveLoading)return;
 liveClient=crypto.randomUUID();liveLoading=true;liveData=null;liveMode=mode;liveError='';
 loading=true;tagProgress=null;waitingProgress=null;detailsProgress=null;loadPhase='core';error='';data=null;let loaded=false;render();
 try{
  const result=await loadReview({queueClient:liveClient,url:'/api/osu-wrapped/wrapped'+(modeChosen?'?mode='+encodeURIComponent(liveMode):''),onProgress:(phase,progress)=>{loadPhase=phase;if(phase==='waiting')waitingProgress=progress;else if(phase==='details'&&progress)detailsProgress=progress;else if(progress)tagProgress=progress;if(!data?.demo)render();},prepare:async body=>{liveMode=body.mode;if(globalErrors.has(body.mode))globalErrors.delete(body.mode);const [global]=await Promise.all([loadGlobal(body.mode,{live:true}),preloadArtistImages(body.artists,{base:'/api/osu-wrapped'}),preloadModIcons(body)]);if(!global)throw Error('Global statistics are still loading.');}});
  liveData=result.data;liveMode=liveData.mode;connected=true;loaded=true;
  if(canViewWrapped(liveData)&&!document.querySelector('.story-dialog'))completionSound.play({hidden:document.hidden,demo:Boolean(data?.demo),muted:document.querySelector('[data-story-mute]')?.getAttribute('aria-pressed')==='true',volume:Number(document.querySelector('[data-story-volume]')?.value??100)/100});
  if(!data?.demo){data=liveData;mode=liveMode;modeChosen=true;}
 }catch(e){liveError=e.name==='TimeoutError'?'Loading took too long while waiting for osu!. Please retry.':e.message;if(!data?.demo)error=liveError;}
 finally{liveLoading=false;loading=false;if(data?.demo)updateBackgroundNotice();else render();}
 if(loaded&&!data?.demo)finishPersonalView();
}
function loadingMarkup(){const phases=[['core','Loading profile and scores','Waiting for API allowance and retrieving your profile and current top 200 scores.'],['tags','Checking community user tags',tagProgress?tagProgress.checked+' of '+tagProgress.total+' selected scores checked. Maps with no user tags count as checked.':'Checking exact-difficulty community tags before showing your profile.'],['details','Loading additional details','Core profile, scores and user tags are ready. Checking additional map and mapping details.'],['artwork','Preparing your Wrapped','Core data is ready. Preparing artist portraits and mod icons.']];const activePhase=loadPhase==='waiting'?waitingProgress?.phase:loadPhase;const index=Math.max(0,phases.findIndex(row=>row[0]===activePhase));return '<div class="loading review-loading" role="status" aria-live="polite"><span class="spinner"></span><strong>'+(loadPhase==='waiting'?(waitingProgress?.queue?'Profile queue':'Waiting for data'):phases[index][1])+'</strong><p>'+(loadPhase==='waiting'?waitingText():phases[index][2])+'</p><ol>'+phases.map(([key,label],i)=>'<li class="'+(i<index?'complete':i===index?'active':'')+'">'+'<span class="loading-step-marker" aria-hidden="true">'+(i<index?'✓':String(i+1)+'.')+'</span><span>'+label+'</span></li>').join('')+'</ol>'+detailChecksMarkup()+'<small>Please don’t close this page while your Wrapped is queued or generating. Requests are paced to respect osu!’s API limits. Profiles with more selected scores may take longer to load, especially during busy periods.</small></div>';}


function waitingText(){return escape(waitingProgress?.message||'Waiting for data.')+(waitingProgress?.queue?' Checking again in ':' Retrying automatically in ')+Math.max(0,Math.ceil(((waitingProgress?.until||Date.now())-Date.now())/1000))+' seconds.';}
function detailChecksMarkup(){if(!detailsProgress?.checks?.length||!['details','waiting'].includes(loadPhase))return '';return '<ul class="loading-details">'+detailsProgress.checks.map(check=>'<li class="'+(check.complete?'complete':'active')+'">'+escape(check.name)+': '+(check.unavailable?'Temporarily unavailable':check.complete?'Ready':Number.isInteger(check.checked)?check.checked+(Number.isInteger(check.total)?' / '+check.total:' '+escape(check.unit||'checked')):'Waiting')+'</li>').join('')+'</ul>';}
setInterval(()=>{if(loading&&loadPhase==='waiting'){const paragraph=document.querySelector('.review-loading>p');if(paragraph)paragraph.innerHTML=waitingText();}},1000);


async function startExperience(){if(loading||!canViewWrapped(data)||document.querySelector('.story-dialog'))return;const sourceData=data,snapshot=structuredClone(data);if(snapshot.demo){openExperience(snapshot,{onSave:shareCard,onReview:()=>{statsView='user';render();scrollToStats();}});return;}const button=document.querySelector('#story-replay');if(button)button.disabled=true;try{const [global]=await Promise.all([loadGlobal(snapshot.mode),preloadArtistImages(snapshot.artists,{base:'/api/osu-wrapped'}),preloadModIcons(snapshot)]);if(loading||data!==sourceData)return;snapshot.globalStats=global;openExperience(snapshot,{onSave:shareCard,onReview:()=>{statsView='user';render();scrollToStats();}});let storage;try{storage=window.localStorage;}catch{}markExperience(snapshot,storage);}finally{if(button?.isConnected)button.disabled=false;}}
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function shareCard(layout){
 if(!canViewWrapped(data))return;
 openCardShare(structuredClone(data),{downloadOnly:true,layout:typeof layout==='string'?layout:'portrait',chooseLayout:true});
}

if(new URLSearchParams(location.search).has('error'))error='osu! sign-in was cancelled or expired. Please connect again.';
render();
if(connected)load();


function safeCover(value){try{const url=new URL(value);return url.protocol==='https:' && ['assets.ppy.sh','osu.ppy.sh'].includes(url.hostname)?savedBeatmapCover(url.href):'';}catch{return '';}}

function standoutCard(best){
 const linked=best && !data.demo && /^\d+$/.test(String(best.id));
 const tag=linked?'a':'article';
 const cover=safeCover(best?.cover);
 return `<${tag} class="personal-best${best?' has-score':''}" ${linked?`href="https://osu.ppy.sh/scores/${encodeURIComponent(best.id)}" target="_blank" rel="noopener noreferrer"`:''}>
 ${cover?`<img class="pb-background" src="${escape(cover)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>`:''}
 <span class="eyebrow">THE STANDOUT SCORE ${linked?'<span class="pb-open" aria-hidden="true">↗︎</span>':''}</span>
 ${best?`<span class="pb-grade ${gradeClass(best.rank)}" aria-label="Grade ${escape(gradeLabel(best.rank) || 'Unavailable')}">${escape(gradeLabel(best.rank) || '—')}</span>`:'<div class="pb-symbol">✦</div>'}
 <strong ${best?`title="${escape(best.pp)} pp"`:''}>${best?Math.round(best.pp):'—'}<small>pp</small></strong>
 <h3>${escape(best?.title||'Your next chapter awaits')}</h3>
 <p>${escape(best?.artist||'No 2026 PP scores returned')}</p>
 ${best?`<div class="pb-map-info"><span class="pb-difficulty">${escape(best.version || 'Unknown difficulty')}</span><span>Mapped by ${escape(best.creator)}</span><span class="pb-date">${scoreDate(best.date)}</span></div>`:''}
 <div class="pb-details">${best?`${escape(best.mods)} <span>${best.accuracy.toFixed(2)}% · ${comboMarkup(best)}</span>`:'Go make something memorable.'}</div>
 <small>Highest 2026 PP from your current top 200</small></${tag}>`;
}

function gradeClass(rank){return ({XH:"grade-silver",SSH:"grade-silver",SH:"grade-silver",X:"grade-gold",SS:"grade-gold",S:"grade-gold",A:"grade-green",B:"grade-blue",C:"grade-purple",D:"grade-red"})[rank] || "";}

function gradeLabel(rank){return ({SH:"S",XH:"SS",SSH:"SS",X:"SS"})[rank] || rank;}

function safeAvatar(value){try{const url=new URL(value);return url.protocol==='https:' && ['a.ppy.sh','assets.ppy.sh','osu.ppy.sh'].includes(url.hostname)?url.href:'';}catch{return '';}}

function scoreDate(value){
 const date=new Date(value);
 if(!value || Number.isNaN(date.getTime()))return 'Date unavailable';
 const label=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);
 return `Set <time datetime="${date.toISOString()}">${escape(label)}</time> · UTC`;
}

function accuracyValue(value){const rank=accuracyRank(value);return rank?'<span class="accuracy-stat-value">'+value.toFixed(2)+'% <span class="accuracy-stat-grade '+gradeClass(rank)+'" aria-label="Grade '+rank+'">'+rank+'</span></span>':'—';}

function statsSwitch(){return '<div class="stats-switch" data-view="'+statsView+'" role="tablist" aria-label="Statistics scope"><button type="button" id="stats-tab-user" data-stats-view="user" role="tab" aria-controls="stats-panel" aria-selected="'+(statsView==='user')+'" tabindex="'+(statsView==='user'?0:-1)+'">Your Stats</button><button type="button" id="stats-tab-global" data-stats-view="global" role="tab" aria-controls="stats-panel" aria-selected="'+(statsView==='global')+'" tabindex="'+(statsView==='global'?0:-1)+'">Global Stats</button></div>';}
async function loadGlobal(selectedMode,{live=false}={}){if(data?.demo&&!live)return demoGlobal(selectedMode);if(globalCache.has(selectedMode))return globalCache.get(selectedMode);if(globalPending.has(selectedMode))return globalPending.get(selectedMode);if(globalErrors.has(selectedMode))return null;const task=(async()=>{try{const response=await fetch('/api/osu-wrapped/global?version=8&mode='+encodeURIComponent(selectedMode),{cache:'no-store',signal:AbortSignal.timeout(18000)});if(!response.ok)throw Error('Global plays unavailable');const result=await response.json();if(result.mode!==selectedMode||!Array.isArray(result.top))throw Error('Invalid leaderboard');await preloadModIcons(result);globalCache.set(selectedMode,result);return result;}catch{globalErrors.add(selectedMode);return null;}finally{globalPending.delete(selectedMode);if(!data?.demo&&statsView==='global'&&mode===selectedMode)render();}})();globalPending.set(selectedMode,task);if(!data?.demo&&statsView==='global'&&mode===selectedMode)render();return task;}

function loadDemoMode(){data=demo(mode);loading=false;error='';render();}
