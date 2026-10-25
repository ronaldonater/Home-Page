const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CLUBS={
 overdrive:{name:'Overdrive',motto:'The song wasn’t fast enough.',icon:'M31 36L49 50L31 64ZM51 36L69 50L51 64Z'},
 precision:{name:'Precision Society',motto:'Every hit has to count.',icon:'M50 20V34M50 66V80M20 50H34M66 50H80M35 50A15 15 0 1 0 65 50A15 15 0 1 0 35 50'},
 hardmode:{name:'HR Headquarters',motto:'Comfort zones are overrated.',icon:'M26.5 67L43.5 47L54.5 58L73.5 33M58.5 33H73.5V48'},
 afterdark:{name:'Afterdark',motto:'You know the notes before they disappear.',icon:'M65 25A30 30 0 1 0 75 68A31 31 0 0 1 65 25Z'},
 loyalist:{name:'Mapper Loyalists',motto:'You know who makes your favorite patterns.',icon:'M30 27.5H70V72.5H30ZM40 39.5H60M40 50.5H60M40 61.5H53'},
 wanderer:{name:'The Wanderers',motto:'Your next favorite could be anywhere.',icon:'M62 35L54 56L34 66L43 45ZM50 20V26M50 74V80M20 50H26M74 50H80'},
 nomod:{name:'No Mod, No Problem',motto:'Just you and the beatmap.',icon:'M29 50A21 21 0 1 0 71 50A21 21 0 1 0 29 50M40 51L47 58L62 42'},
 repeat:{name:'The Repeat Offenders',motto:'One more try became a lifestyle.',icon:'M72 40A24 24 0 0 0 30 32L23 41M23 25V41H39M28 60A24 24 0 0 0 70 68L77 59M61 59H77V75'},
 easy:{name:'EZ Does It',motto:'Smaller score. Bigger mind games.',icon:'M28 34H72L42 66H72M28 50H58'},
 closeenough:{name:'Close Enough Club',motto:'Not every hit was perfect. The story still counts.',icon:'M29 50A21 21 0 1 0 71 50A21 21 0 1 0 29 50M37 51L47 61L64 40M31 24L25 18M69 24L75 18'},
 oneshot:{name:'One Shot Society',motto:'One miss. Back to the beginning.',icon:'M30 50A20 20 0 1 0 70 50A20 20 0 1 0 30 50M50 23V35M50 65V77M23 50H35M65 50H77M43 50L49 56L60 43'},
 safetynet:{name:'Safety Net Society',motto:'A little backup. Another chance to play.',icon:'M50 22L73 31V49Q73 67 50 78Q27 67 27 49V31ZM38 49L47 58L63 40'},
 quality:{name:'Quality Over Quantity',motto:'A few plays. A lasting impression.',icon:'M50 22L58 40L78 43L63 57L67 78L50 68L33 78L37 57L22 43L42 40ZM40 50L48 58L61 43'},
 timecapsule:{name:'Time Capsule',motto:'Great patterns never get old.',icon:'M29 27H71M29 73H71M34 27Q34 42 50 50Q66 58 66 73M66 27Q66 42 50 50Q34 58 34 73'},
 class2026:{name:'Class of 2026',motto:'Freshly ranked. Already unforgettable.',icon:'M27 30H73V75H27ZM37 23V37M63 23V37M27 43H73M39 56L47 64L62 51'},
 crowdfavorites:{name:'Crowd Favorites',motto:'The community hits different. You agree.',icon:'M35 53A15 15 0 1 0 65 53A15 15 0 1 0 35 53M50 29V21M71 35L77 29M79 53H87M29 35L23 29M21 53H13M39 54L47 62L62 45'},
 stable:{name:'Stable Loyalists',motto:'A classic client. Your kind of rhythm.',icon:'M27 35H73V65H27ZM38 44H62M38 54H54M39 74H61M50 65V74'},
 lazer:{name:'Lazer Pioneers',motto:'The next chapter is already yours.',icon:'M56 21L29 55H47L42 79L72 42H53Z'},
 allrounder:{name:'All-Rounder',motto:'A little of everything. A style all your own.',icon:'M50 22.5L58 41.5L79 42.5L63 55.5L69 77.5L50 65.5L31 77.5L37 55.5L21 42.5L42 41.5Z'}
};
export const CLUB_COLORS={overdrive:'#ff9a66',precision:'#8edcff',hardmode:'#ff777f',afterdark:'#bd9aff',loyalist:'#b7e58b',wanderer:'#71dfcb',nomod:'#ffd46b',repeat:'#f6ac69',allrounder:'#fa82b5',easy:'#87d89a',closeenough:'#f2bf78',safetynet:'#9db7ff',oneshot:'#d4e579',quality:'#f5d88a',timecapsule:'#dcb995',class2026:'#83e5cf',crowdfavorites:'#e0a0ef',stable:'#e9c38a',lazer:'#ff95c8'};
export function scoreClient(score){
 if(typeof score.is_lazer==='boolean')return score.is_lazer?'lazer':'stable';
 if(Number.isSafeInteger(score.legacy_score_id)&&score.legacy_score_id>0)return 'stable';
 if(Object.hasOwn(score,'legacy_score_id')&&score.legacy_score_id===null&&(score.type==='solo_score'||(Number.isSafeInteger(score.build_id)&&score.build_id>0)))return 'lazer';
 return null;
}
export function assignClub(scores,mode='osu',months=[],{popularBeatmapsets=null}={}){
 const total=scores.length;if(total<1)return null;
 const families={overdrive:0,hardmode:0,afterdark:0,nomod:0,easy:0,safetynet:0,oneshot:0},hosts=new Map(),hostSets=new Map(),artists=new Set(),modPatterns=new Set();
 for(const score of scores){const mods=new Set((score.mods||[]).map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&/^[A-Z0-9]{1,6}$/.test(mod)&&mod!=='CL'));
  modPatterns.add([...mods].sort().join(',')||'NM');
  if(mods.has('DT')||mods.has('NC'))families.overdrive++;if(mode!=='mania'&&mods.has('HR'))families.hardmode++;if(mods.has('HD')||mods.has('FL'))families.afterdark++;if(!mods.size||(mods.size===1&&mods.has('NM')))families.nomod++;
  if(mods.has('SD')||mods.has('PF'))families.oneshot++;if(mods.has('EZ'))families.easy++;if(mods.has('NF')||(mode==='osu'&&mods.has('SO')))families.safetynet++;
  const host=score.beatmapset?.user_id||score.beatmapset?.creator;if(host){const key=String(host);hosts.set(key,(hosts.get(key)||0)+1);const setId=score.beatmapset?.id??score.beatmap?.beatmapset_id;if(Number.isSafeInteger(setId)&&setId>0){if(!hostSets.has(key))hostSets.set(key,new Set());hostSets.get(key).add(setId);}}if(score.beatmapset?.artist)artists.add(score.beatmapset.artist.toLocaleLowerCase('en'));
 }
 const thresholds={overdrive:.4,hardmode:.4,afterdark:.5,nomod:.6,easy:.4,safetynet:.5,oneshot:.4};
 const preferences=Object.entries(families).filter(([key,count])=>count/total>=thresholds[key]).sort((a,b)=>b[1]-a[1]||Object.keys(families).indexOf(a[0])-Object.keys(families).indexOf(b[0]));
 const passed=scores.filter(s=>s.passed!==false&&Number.isFinite(s.accuracy)&&s.accuracy>=0&&s.accuracy<=1),accuracy=passed.length?passed.reduce((sum,s)=>sum+s.accuracy*100,0)/passed.length:null;
 const accuracyThreshold=({osu:99,taiko:99,fruits:99.5,mania:98})[mode]??99;
 const lowAccuracyThreshold=mode==='fruits'?95:90;
 const lowAccuracy=passed.length>=10&&accuracy<lowAccuracyThreshold;
 const precise=passed.length>=10&&accuracy+1e-9>=accuracyThreshold,loyalCount=Math.max(0,...[...hosts].filter(([host,count])=>count>=3&&(hostSets.get(host)?.size||0)>=2).map(([,count])=>count)),loyal=loyalCount/total>=.25,diverse=hosts.size>=10&&artists.size>=10&&hosts.size/total>=.5&&artists.size/total>=.5;
 const activity=months.filter(m=>m.available===true&&Number.isFinite(m.count)&&m.count>=0),plays=activity.reduce((sum,m)=>sum+m.count,0),regularMonths=activity.filter(m=>m.count>=500).length;
 const eligibleMaps=scores;
 const mapId=score=>score.beatmapset?.id??score.beatmap?.beatmapset_id;
 const rankedYear=score=>typeof score.beatmapset?.ranked_date==='string'?new Date(score.beatmapset.ranked_date).getUTCFullYear():NaN;
 const oldCount=eligibleMaps.filter(score=>rankedYear(score)>=2007&&rankedYear(score)<=2016).length,newCount=eligibleMaps.filter(score=>rankedYear(score)===2026).length;
 const popularIds=new Set((Array.isArray(popularBeatmapsets)?popularBeatmapsets:[]).slice(0,25).map(row=>row.id).filter(id=>Number.isSafeInteger(id)&&id>0));
 const popularMatches=eligibleMaps.filter(score=>popularIds.has(mapId(score))),popularUnique=new Set(popularMatches.map(mapId)).size;
 const clients=scores.map(scoreClient),exclusiveClient=clients.every(client=>client==='stable')?'stable':clients.every(client=>client==='lazer')?'lazer':null;
 const candidates=[];
 const clamp=value=>Math.max(0,Math.min(1,value));
 const add=(id,baseStrength,reason,support=1)=>{
  const activitySignal=id==='repeat'||id==='quality';
  const evidenceCount=activitySignal?activity.length:(id==='precision'||id==='closeenough'?passed.length:total);
  const evidenceWeight=activitySignal?.75+.25*clamp(evidenceCount/6):.5+.5*clamp(evidenceCount/20);
  candidates.push({id,baseStrength:Math.round(baseStrength*1000)/1000,evidenceCount,evidenceWeight,strength:Math.round(baseStrength*evidenceWeight*1000)/1000,reason,support});
 };
 const shareStrength=(share,threshold,base=70,range=30)=>base+range*clamp((share-threshold)/(1-threshold));
 for(const [id,count] of preferences){const label={overdrive:'DT or NC',hardmode:'HR',afterdark:'HD or FL',nomod:'No Mod',easy:'EZ',oneshot:'SD or PF',safetynet:mode==='osu'?'SO or NF':'NF'}[id];add(id,shareStrength(count/total,thresholds[id],40,15),count+' of '+total+' selected scores ('+(count/total*100).toFixed(1)+'%) use '+label+'.',count/total);}
 if(precise)add('precision',70+30*clamp((accuracy-accuracyThreshold)/(100-accuracyThreshold)),'Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, meeting the '+accuracyThreshold+'% threshold for this mode.',passed.length/total);
 if(lowAccuracy)add('closeenough',70+30*clamp((lowAccuracyThreshold-accuracy)/15),'Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, below the '+lowAccuracyThreshold+'% threshold for this mode.',passed.length/total);
 if(plays>=10000&&regularMonths>=6)add('repeat',55+25*(.7*clamp((plays-10000)/40000)+.3*clamp((regularMonths-6)/6)),plays.toLocaleString('en-US')+' recorded 2026 plays, with at least 500 plays in '+regularMonths+' months.',regularMonths/12);
 if(activity.length&&plays>0&&plays<100)add('quality',55+25*clamp((99-plays)/98),plays.toLocaleString('en-US')+' recorded '+(plays===1?'play':'plays')+' in available 2026 monthly profile history (all modes).',activity.length/12);
 if(loyal)add('loyalist',shareStrength(loyalCount/total,.25,60,35),loyalCount+' of '+total+' selected scores ('+(loyalCount/total*100).toFixed(1)+'%) come from one mapset host.',loyalCount/total);
 if(diverse)add('wanderer',60+25*clamp((Math.min(hosts.size,artists.size)/total-.5)/.5),total+' selected scores span '+hosts.size+' mapper hosts and '+artists.size+' artists.',Math.min(hosts.size,artists.size)/total);
 if(exclusiveClient)add(exclusiveClient,62,'All '+total+' eligible 2026 '+(total===1?'score was':'scores were')+' set on osu!'+(exclusiveClient==='stable'?'stable':'lazer')+' (100% of your available current top-200 sample).');
 if(eligibleMaps.length>=5){
  for(const [id,count,threshold,qualifies] of [['crowdfavorites',popularMatches.length,.4,popularUnique>=3],['timecapsule',oldCount,.6,true],['class2026',newCount,.6,true]]){
   if(qualifies&&count/total>=threshold)add(id,shareStrength(count/total,threshold,68,28),count+' of '+total+' eligible 2026 scores from your current top 200 ('+(count/total*100).toFixed(1)+'%) '+(id==='crowdfavorites'?'are on '+popularUnique+' distinct mapsets in this mode’s 2026 popular top 25.':id==='timecapsule'?'are on mapsets ranked in 2016 or earlier.':'are on mapsets ranked in 2026.'),count/total);
  }
 }
 const maxModShare=Math.max(...Object.values(families))/total;
 if(modPatterns.size>=3&&maxModShare<.4&&hosts.size>=5&&artists.size>=5)add('allrounder',60+20*(.4*clamp((.4-maxModShare)/.4)+.3*clamp(hosts.size/total)+.3*clamp(artists.size/total)),'Your '+total+' selected scores span '+modPatterns.size+' mod combinations, '+hosts.size+' mapper hosts, and '+artists.size+' artists, with no mod family reaching 40%.',1-maxModShare);
 if(!candidates.length)add('allrounder',0,'No qualifying specialist signal stands out in your '+total+' selected scores.');
 const order=Object.keys(CLUBS);
 candidates.sort((a,b)=>b.strength-a.strength||b.support-a.support||order.indexOf(a.id)-order.indexOf(b.id));
 const [primary,secondary]=candidates;
 return {...primary,total,provisional:total<20,sampleNote:total<20?'Provisional - based on '+total+' eligible '+(total===1?'score':'scores')+'; patterns become more reliable with a larger sample.':null,secondary:secondary?{...secondary}:null,matches:candidates,badge:null};
}

export function clubCommunityMarkup(data){
 const community=data?.clubCommunity;if(data?.demo||!community)return '';
 if(community.status==='collecting')return '<p class="club-community">Community club percentages unlock after '+escape(community.minimum)+' participants for this mode.</p>';
 if(community.status!=='ready')return '<p class="club-community">Community club percentages are temporarily unavailable.</p>';
 const row=community.clubs?.find(row=>row.id===data.club?.id);if(!row)return '';
 return '<p class="club-community">You’re among <strong>'+row.percentage.toFixed(1)+'%</strong> of Wrapped participants with this primary club.<small>Based on '+community.total.toLocaleString('en-US')+' participants · '+escape(community.mode)+' · '+community.year+' · updates may take a minute</small></p>';
}
export function secondaryClubMarkup(result){
 const secondary=result?.secondary,club=CLUBS[secondary?.id];if(!club)return '';
 return '<div class="club-secondary club-'+secondary.id+'"><span class="club-secondary-icon" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="'+club.icon+'"/></svg></span><div><span class="club-secondary-caption">SECONDARY ARCHETYPE</span><b>'+club.name+'</b><p>'+escape(secondary.reason)+'</p></div></div>';
}
export function clubMarkup(data,{story=false}={}){
 const result=data?.club,club=CLUBS[result?.id];if(!club)return '<div class="club-pending"><h3>Your club is taking shape.</h3><p>At least one available 2026 score is needed to assign a playstyle club.</p></div>';
 return '<div class="playstyle-club club-'+result.id+(story?' club-reveal':'')+'"><div class="club-emblem" aria-hidden="true"><span class="club-emblem-orbit"></span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="43" stroke-width="1" opacity=".4"/><path d="'+club.icon+'"/></svg></div><div class="club-copy"><span class="club-caption">YOUR PLAYSTYLE CLUB</span><h3>'+club.name+'</h3><p class="club-motto">'+club.motto+'</p>'+'<p class="club-reason">'+escape(result.reason)+'</p>'+(result.sampleNote?'<p class="club-sample-note">'+escape(result.sampleNote)+'</p>':'')+secondaryClubMarkup(result)+clubCommunityMarkup(data)+(story?'':'<button type="button" class="club-legend-trigger" data-club-legend aria-haspopup="dialog">How your club was chosen ↗</button>')+'</div></div>';
}

const clubSignals={
 oneshot:'SD or PF on at least 40% of selected scores.',
 stable:'100% of selected scores are confirmed osu!stable scores. Unknown client metadata or mixed clients do not qualify.',
 lazer:'100% of selected scores are confirmed osu!lazer scores. Unknown client metadata or mixed clients do not qualify.',
 timecapsule:'At least 60% of selected scores are on mapsets ranked in 2016 or earlier, with at least five selected scores.',
 class2026:'At least 60% of selected scores are on mapsets ranked in 2026, with at least five selected scores.',
 crowdfavorites:'At least 40% of selected scores are on this mode’s 25 most-played mapsets ranked in 2026, spanning at least three distinct mapsets and at least five selected scores.',
 quality:'1-99 recorded plays across available 2026 monthly profile counts (all modes). Unavailable or zero history does not qualify.',
 easy:'EZ on at least 40% of selected scores.',
 closeenough:'At least 10 passed selected scores averaging below 90% accuracy in osu!, taiko, or mania, or below 95% in catch.',
 safetynet:'SO or NF on at least 50% of selected scores (NF only outside osu!).',
 overdrive:'DT or NC on at least 40% of selected scores.',
 hardmode:'HR on at least 40% of selected scores. This club does not apply to mania.',
 afterdark:'HD or FL on at least 50% of selected scores.',
 nomod:'No Mod on at least 60% of selected scores.',
 precision:'Average accuracy of at least 99% in osu! or taiko, 99.5% in catch, or 98% in mania, across at least 10 passed selected scores.',
 repeat:'At least 10,000 recorded 2026 plays, with 500 or more plays in at least six months.',
 loyalist:'At least 25% of selected scores belong to one mapset host, with at least three matching scores across two distinct mapsets. Guest difficulties count under the host.',
 wanderer:'At least 10 unique mapper hosts and 10 artists; each unique-name count must be at least half your selected score count.',
 allrounder:'Selected scores span at least three mod combinations, five mapper hosts, and five artists, with every mod family below 40%; also the fallback if no specialist signal qualifies.'
};
function legendCommunity(data,id){
 const community=data?.clubCommunity;if(data?.demo||community?.status!=='ready')return '';
 const row=community.clubs?.find(row=>row.id===id);return row?'<p class="club-legend-share"><strong>'+row.percentage.toFixed(1)+'%</strong> · '+row.count.toLocaleString('en-US')+' of '+community.total.toLocaleString('en-US')+' participants · primary club</p>':'';
}
function clubCompatibility(data,id){
 const result=data?.club,match=result?.matches?.find(row=>row.id===id);
 const available=Array.isArray(result?.matches);
 const strength=Number.isFinite(match?.strength)?Math.max(0,Math.min(100,match.strength)):available?0:null;
 const label=strength===null?'—':strength.toFixed(1);
 const note=strength===null?'Generate a review to calculate match strength.':match?'Evidence-adjusted club strength: '+strength.toFixed(1)+' out of 100. This is a heuristic match score, not a probability or community share.':'No qualifying signal for this club in your available selected data.';
 return '<span class="club-compatibility" title="'+escape(note)+'" aria-label="'+escape(CLUBS[id].name)+' match strength: '+escape(label)+'"><strong>'+label+'</strong><small>Match strength</small></span>';
}
export function clubLegendMarkup(data){
 return '<div class="club-legend-grid">'+Object.entries(CLUBS).map(([id,club])=>'<article class="club-legend-card club-'+id+'"'+(data?.club?.id===id?' aria-label="'+escape(club.name)+', your club"':'')+'>'+clubCompatibility(data,id)+'<div class="club-legend-heading"><svg aria-hidden="true" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="'+club.icon+'"/></svg><h3>'+club.name+'</h3>'+(data?.club?.id===id?'<span class="club-legend-current">Your club</span>':data?.club?.secondary?.id===id?'<span class="club-legend-current">Secondary</span>':'')+'</div><p class="club-legend-motto">'+club.motto+'</p><p>'+clubSignals[id]+'</p>'+legendCommunity(data,id)+'</article>').join('')+'</div>';
}
export function openClubLegend(data){
 if(document.querySelector('.club-legend-dialog'))return;
 const focusBefore=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog club-legend-dialog';dialog.setAttribute('aria-labelledby','club-legend-title');
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.id='club-legend-title';title.textContent='Playstyle club legend';const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.addEventListener('click',()=>dialog.close());header.append(title,close);
 const content=document.createElement('div');content.className='club-legend-content';
 const community=document.createElement('div');community.innerHTML=clubCommunityMarkup(data);
 const scope=document.createElement('p');scope.className='replay-note';scope.textContent='Selected scores are the deduplicated 2026 scores found in your current top 200 for the selected game mode, not necessarily all 200 scores. Accuracy uses valid passed selected scores. Playcount clubs use monthly profile history across all modes.';
 const legend=document.createElement('div');legend.innerHTML=clubLegendMarkup(data);
 const rules=document.createElement('p');rules.className='replay-note';rules.textContent='How selection works: all qualifying clubs compete for either role. The strongest signal becomes your primary club; the next distinct match becomes your secondary archetype. Mod shares score 40-55, map shares 68-96, accuracy signals 70-100, mapper loyalty 60-95, artist/mapper diversity 60-85, sustained activity 55-80, low playcounts 55-80, confirmed client exclusivity 62, and a varied All-Rounder mix 60-80. These are base strength ranges. Score-based strength is multiplied by 0.5 + 0.5 × min(evidence scores / 20, 1), using valid passed scores for accuracy. Activity strength is multiplied by 0.75 + 0.25 × min(available months / 6, 1). Small samples remain eligible but are marked provisional below 20 scores. Strength grows above each qualification threshold. These are design weights, not statistically calibrated probabilities. Exact ties use supporting score coverage, then a fixed order for repeatable results. All-Rounder also remains the fallback when no signal qualifies. Client choice or playcount cannot automatically override a stronger signal. All score-based signals use selected scores; accuracy uses valid passed selected scores, and monthly activity is profile-wide. CL is excluded; missing metadata does not qualify. Community percentages count primary clubs only.';
 const compatibilityNote=document.createElement('p');compatibilityNote.className='replay-note';compatibilityNote.textContent='Match strength is your evidence-adjusted club score out of 100, not a probability. Non-qualifying clubs show 0; missing review data shows a dash. Community percentages at the bottom show how many participants received each primary club.';
 content.append(scope,compatibilityNote,community,legend,rules);dialog.append(header,content);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
