import {scoreBeatmapValues} from './beatmap-averages.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const CLUBS={
 overdrive:{name:'Overdrive',motto:'The song wasn’t fast enough.',icon:'M31 36L49 50L31 64ZM51 36L69 50L51 64Z'},
 slowtempo:{name:'Easy Tempo',motto:'Good music deserves a little more time.',icon:'M49 36L31 50L49 64ZM69 36L51 50L69 64Z'},
 precision:{name:'Precision Society',motto:'Every hit has to count.',icon:'M50 20V34M50 66V80M20 50H34M66 50H80M35 50A15 15 0 1 0 65 50A15 15 0 1 0 35 50'},
 hardmode:{name:'Hardrock Headquarters',motto:'Comfort zones are overrated.',icon:'M35 47V25Q35 19 40 19Q45 19 45 25V45Q45 39 50 39Q55 39 55 45Q55 39 60 39Q65 39 65 45V25Q65 19 70 19Q75 19 75 25V59Q75 79 56 81Q42 81 36 69L26 52Q23 46 28 43Q32 41 35 47L43 59M45 45V54Q45 60 50 60Q55 60 55 54V45M55 54Q55 60 60 60Q65 60 65 54V45'},
 afterdark:{name:'Afterdark',motto:'You know the notes before they disappear.',icon:'M65 25A30 30 0 1 0 75 68A31 31 0 0 1 65 25Z'},
 loyalist:{name:'Mapper Loyalists',motto:'You know who makes your favorite patterns.',icon:'M23 63V55C23 41 32 31 44 30M56 30C68 31 77 41 77 55V63M44 48V29Q50 26 56 29V48M33 52V62M67 52V62M20 63H80Q83 63 83 67V70H17V67Q17 63 20 63Z'},
 artistloyalist:{name:'Artist Loyalists',motto:'You know who makes your favorite songs.',icon:'M43 66V30L72 24V59M43 38L72 32M43 66C43 76 25 79 25 69C25 60 43 57 43 66ZM72 59C72 69 54 72 54 62C54 53 72 50 72 59Z'},
 onemap:{name:'One-Map Wonders',motto:'Different difficulties. Same obsession.',icon:'M20 31L40 23L60 31L80 23V69L60 77L40 69L20 77ZM40 23V69M60 31V77M27 48L33 44M47 47L53 51M67 53L73 47'},
 shortmaps:{name:'Short & Sweet',motto:'Straight to the good part.',icon:'M39 22H61M50 22V30M68 31L74 25M27 55A23 23 0 1 0 73 55A23 23 0 1 0 27 55M50 41V55L60 61'},
 longmaps:{name:'Long Haul Club',motto:'You’re here for the whole song.',icon:'M28 22H72M28 78H72M33 22V31C33 41 43 44 50 50C57 56 67 59 67 69V78M67 22V31C67 41 57 44 50 50C43 56 33 59 33 69V78M40 32H60L50 42ZM40 70L50 60L60 70Z'},
 wanderer:{name:'The Wanderers',motto:'Your next favorite could be anywhere.',icon:'M62 35L54 56L34 66L43 45ZM50 20V26M50 74V80M20 50H26M74 50H80'},
 nomod:{name:'No Mod, No Problem',motto:'Just you and the beatmap.',icon:'M29 50A21 21 0 1 0 71 50A21 21 0 1 0 29 50M40 51L47 58L62 42'},
 replay:{name:'Replay Society',motto:'Your plays deserve another look.',icon:'M22 50Q50 18 78 50Q50 82 22 50ZM43 38L62 50L43 62Z'},
 repeat:{name:'The Repeat Offenders',motto:'One more try became a lifestyle.',icon:'M72 40A24 24 0 0 0 30 32L23 41M23 25V41H39M28 60A24 24 0 0 0 70 68L77 59M61 59H77V75'},
 easy:{name:'EZ Does It',motto:'Smaller score. Bigger mind games.',icon:'M28 34H72L42 66H72M28 50H58'},
 closeenough:{name:'Close Enough Club',motto:'Not every hit was perfect. The story still counts.',icon:'M22 50A28 28 0 1 0 78 50A28 28 0 1 0 22 50M34 50A16 16 0 1 0 66 50A16 16 0 1 0 34 50M47 50A3 3 0 1 0 53 50A3 3 0 1 0 47 50M58 34L68 44M58 44L68 34'},
 choke:{name:'Choke Artists',motto:'One note away. Every time.',icon:'M47 30C35 13 15 25 20 43C24 57 39 69 50 78C61 69 76 57 80 43C85 25 65 13 53 30M51 32L45 43L55 49L46 62L50 78'},
 oneshot:{name:'One Shot Society',motto:'One miss. Back to the beginning.',icon:'M30 50A20 20 0 1 0 70 50A20 20 0 1 0 30 50M50 23V35M50 65V77M23 50H35M65 50H77M43 50L49 56L60 43'},
 safetynet:{name:'Safety Net Society',motto:'A little backup. Another chance to play.',icon:'M50 22L73 31V49Q73 67 50 78Q27 67 27 49V31ZM38 49L47 58L63 40'},
 quality:{name:'Quality Over Quantity',motto:'A few plays. A lasting impression.',icon:'M50 22L58 40L78 43L63 57L67 78L50 68L33 78L37 57L22 43L42 40ZM40 50L48 58L61 43'},
 timecapsule:{name:'Time Capsule',motto:'Great patterns never get old.',icon:'M29 27H71M29 73H71M34 27Q34 42 50 50Q66 58 66 73M66 27Q66 42 50 50Q34 58 34 73'},
 class2026:{name:'Class of 2026',motto:'Freshly ranked. Already unforgettable.',icon:'M18 40L50 25L82 40L50 55ZM30 46V64Q50 79 70 64V46M82 40V64M78 72L82 62L86 72Z'},
 crowdfavorites:{name:'Crowd Favorites',motto:'The community hits different. You agree.',icon:'M50 35L39 24C30 14 41 8 50 18C59 8 70 14 61 24ZM42 51A8 8 0 1 0 58 51A8 8 0 1 0 42 51M36 79V74C36 59 64 59 64 74V79ZM23 55A6 6 0 1 0 35 55A6 6 0 1 0 23 55M65 55A6 6 0 1 0 77 55A6 6 0 1 0 65 55M29 79H18V74Q18 64 29 64M71 79H82V74Q82 64 71 64'},
 stable:{name:'Stable Loyalists',motto:'A classic client. Your kind of rhythm.',icon:'M27 35H73V65H27ZM38 44H62M38 54H54M39 74H61M50 65V74'},
 lazer:{name:'Lazer Pioneers',motto:'The next chapter is already yours.',icon:'M50 20V80M20 50H80M29 29L71 71M29 71L71 29'},
 moddedonly:{name:'Modded Only',motto:'Vanilla was never on the menu.',icon:'M42 22H58V42H78V58H58V78H42V58H22V42H42Z'},
 allrounder:{name:'All-Rounder',motto:'A little of everything. A style all your own.',icon:'M50 22.5L58 41.5L79 42.5L63 55.5L69 77.5L50 65.5L31 77.5L37 55.5L21 42.5L42 41.5Z'}
};
export const CLUB_COLORS={slowtempo:'#9cc9ea',overdrive:'#ff9a66',precision:'#8edcff',hardmode:'#ff777f',afterdark:'#bd9aff',loyalist:'#b7e58b',artistloyalist:'#a6b8f5',onemap:'#c9a5e8',shortmaps:'#f3a98c',longmaps:'#8bc9c1',wanderer:'#71dfcb',nomod:'#ffd46b',moddedonly:'#a8d4f0',replay:'#ffffff',repeat:'#f6ac69',allrounder:'#fa82b5',easy:'#87d89a',closeenough:'#f2bf78',safetynet:'#9db7ff',oneshot:'#d4e579',choke:'#e8a6b2',quality:'#f5d88a',timecapsule:'#dcb995',class2026:'#83e5cf',crowdfavorites:'#e0a0ef',stable:'#e9c38a',lazer:'#ff95c8'};
export function scoreClient(score){
 if(typeof score.is_lazer==='boolean')return score.is_lazer?'lazer':'stable';
 if(Number.isSafeInteger(score.legacy_score_id)&&score.legacy_score_id>0)return 'stable';
 if(Object.hasOwn(score,'legacy_score_id')&&score.legacy_score_id===null&&(score.type==='solo_score'||(Number.isSafeInteger(score.build_id)&&score.build_id>0)))return 'lazer';
 return null;
}
// Stable aggregate combo cannot reveal an exact sliderbreak count.
export function isChokeScore(score,mode='osu'){
 if(score.passed!==true)return false;
 const stats=score.statistics||{},miss=stats.miss??stats.count_miss;
 if(!Number.isInteger(miss)||miss<0)return false;
 if(miss===1)return true;
 if(miss!==0||mode!=='osu')return false;
 const tick=stats.large_tick_miss,combo=stats.combo_break;
 if(tick===undefined&&combo===undefined)return false;
 if([tick,combo].some(value=>value!==undefined&&(!Number.isInteger(value)||value<0)))return false;
 return (tick??0)+(combo??0)===1;
}
export function assignClub(scores,mode='osu',months=[],{popularBeatmapsets=null,replayViews=null,replayMonths=0}={}){
 const total=scores.length;if(total<1)return null;
 const families={overdrive:0,slowtempo:0,hardmode:0,afterdark:0,nomod:0,easy:0,safetynet:0,oneshot:0},hosts=new Map(),hostSets=new Map(),artistCounts=new Map(),artistSets=new Map(),mapsetScores=new Map(),mapsetDiffs=new Map(),artists=new Set(),modPatterns=new Set();
 for(const score of scores){const mods=new Set((score.mods||[]).map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&/^[A-Z0-9]{1,6}$/.test(mod)&&mod!=='CL'));
  modPatterns.add([...mods].sort().join(',')||'NM');
  if(mods.has('HT')||mods.has('DC'))families.slowtempo++;if(mods.has('DT')||mods.has('NC'))families.overdrive++;if(mode!=='mania'&&mods.has('HR'))families.hardmode++;if(mods.has('HD')||mods.has('FL')||(mode==='mania'&&(mods.has('FI')||mods.has('CO'))))families.afterdark++;if(!mods.size||(mods.size===1&&mods.has('NM')))families.nomod++;
  if(mods.has('SD')||mods.has('PF')||mods.has('AC'))families.oneshot++;if(mods.has('EZ'))families.easy++;if(mods.has('NF')||(mode==='osu'&&mods.has('SO')))families.safetynet++;
  const setId=score.beatmapset?.id??score.beatmap?.beatmapset_id,diffId=score.beatmap?.id??score.beatmap_id;
  if(Number.isSafeInteger(setId)&&setId>0){mapsetScores.set(setId,(mapsetScores.get(setId)||0)+1);if(Number.isSafeInteger(diffId)&&diffId>0){if(!mapsetDiffs.has(setId))mapsetDiffs.set(setId,new Set());mapsetDiffs.get(setId).add(diffId);}}
  const host=score.beatmapset?.user_id||score.beatmapset?.creator;if(host){const key=String(host);hosts.set(key,(hosts.get(key)||0)+1);const setId=score.beatmapset?.id??score.beatmap?.beatmapset_id;if(Number.isSafeInteger(setId)&&setId>0){if(!hostSets.has(key))hostSets.set(key,new Set());hostSets.get(key).add(setId);}}if(typeof score.beatmapset?.artist==='string'){
   const artist=score.beatmapset.artist.trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
   if(artist){artists.add(artist);artistCounts.set(artist,(artistCounts.get(artist)||0)+1);const setId=score.beatmapset?.id??score.beatmap?.beatmapset_id;if(Number.isSafeInteger(setId)&&setId>0){if(!artistSets.has(artist))artistSets.set(artist,new Set());artistSets.get(artist).add(setId);}}
  }
 }
 const thresholds={slowtempo:.4,overdrive:.4,hardmode:.4,afterdark:.5,nomod:.6,easy:.4,safetynet:.5,oneshot:.4};
 const preferences=Object.entries(families).filter(([key,count])=>count/total>=thresholds[key]).sort((a,b)=>b[1]-a[1]||Object.keys(families).indexOf(a[0])-Object.keys(families).indexOf(b[0]));
 const passed=scores.filter(s=>s.passed!==false&&Number.isFinite(s.accuracy)&&s.accuracy>=0&&s.accuracy<=1),accuracy=passed.length?passed.reduce((sum,s)=>sum+s.accuracy*100,0)/passed.length:null;
 const accuracyThreshold=({osu:99,taiko:99,fruits:99.5,mania:98})[mode]??99;
 const lowAccuracyThreshold=mode==='fruits'?95:90;
 const lowAccuracy=passed.length>0&&passed.length/total>=.5&&accuracy<lowAccuracyThreshold;
 const precise=passed.length>0&&passed.length/total>=.5&&accuracy+1e-9>=accuracyThreshold,loyalCount=Math.max(0,...[...hosts].filter(([host,count])=>(hostSets.get(host)?.size||0)>=2).map(([,count])=>count)),loyal=loyalCount/total>=.25,diverse=hosts.size>=10&&artists.size>=10&&hosts.size/total>=.5&&artists.size/total>=.5;
 const activity=months.filter(m=>m.available===true&&Number.isFinite(m.count)&&m.count>=0),plays=activity.reduce((sum,m)=>sum+m.count,0);
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
  const activitySignal=id==='repeat'||id==='quality'||id==='replay';
  const evidenceCount=id==='replay'?Math.min(12,Math.max(0,replayMonths)):activitySignal?activity.length:(id==='precision'||id==='closeenough'?passed.length:total);
  const evidenceWeight=activitySignal?.75+.25*clamp(evidenceCount/6):.5+.5*clamp(evidenceCount/20);
  candidates.push({id,baseStrength:Math.round(baseStrength*1000)/1000,evidenceCount,evidenceWeight,strength:Math.round(baseStrength*evidenceWeight*1000)/1000,reason,support});
 };
 const shareStrength=(share,threshold,base=70,range=30)=>base+range*clamp((share-threshold)/(1-threshold));
 for(const [id,count] of preferences){const label={slowtempo:'HT or DC',overdrive:'DT or NC',hardmode:'HR',afterdark:mode==='mania'?'HD, FL, FI or CO':'HD or FL',nomod:'No Mod',easy:'EZ',oneshot:'SD, PF or AC',safetynet:mode==='osu'?'SO or NF':'NF'}[id];add(id,shareStrength(count/total,thresholds[id],40,15),count+' of '+total+' selected scores ('+(count/total*100).toFixed(1)+'%) use '+label+'.',count/total);}
 if(families.nomod===0)add('moddedonly',60,'All '+total+' selected '+(total===1?'score uses':'scores use')+' at least one gameplay mod (0 No Mod scores).');
 const chokeCount=scores.filter(score=>isChokeScore(score,mode)).length;
 if(chokeCount/total>=.3)add('choke',shareStrength(chokeCount/total,.3,70,25),chokeCount+' of '+total+' selected scores ('+(chokeCount/total*100).toFixed(1)+'%) are one-miss passes or passes with one reported slider combo-break event.',chokeCount/total);
 if(precise)add('precision',65+25*clamp((accuracy-accuracyThreshold)/(100-accuracyThreshold)),'Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, meeting the '+accuracyThreshold+'% threshold for this mode.',passed.length/total);
 if(lowAccuracy)add('closeenough',65+25*clamp((lowAccuracyThreshold-accuracy)/15),'Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, below the '+lowAccuracyThreshold+'% threshold for this mode.',passed.length/total);
 if(Number.isSafeInteger(replayViews)&&replayViews>=500&&Number.isInteger(replayMonths)&&replayMonths>=1&&replayMonths<=12)add('replay',55+25*clamp(Math.log10(replayViews/500)/2),replayViews.toLocaleString('en-US')+' views of your replays by others in available 2026 monthly profile history (all modes). This does not count replays you watched or unique viewers.',replayMonths/12);
 if(plays>=10000)add('repeat',55+25*clamp((plays-10000)/40000),plays.toLocaleString('en-US')+' recorded 2026 plays across available monthly profile history (all modes).',activity.length/12);
 if(activity.length&&plays>0&&plays<100)add('quality',55+25*clamp((99-plays)/98),plays.toLocaleString('en-US')+' recorded '+(plays===1?'play':'plays')+' in available 2026 monthly profile history (all modes).',activity.length/12);
 if(loyal)add('loyalist',shareStrength(loyalCount/total,.25,55,25),loyalCount+' of '+total+' selected scores ('+(loyalCount/total*100).toFixed(1)+'%) come from one mapset host.',loyalCount/total);
 const artistLoyalCount=Math.max(0,...[...artistCounts].filter(([artist,count])=>(artistSets.get(artist)?.size||0)>=2).map(([,count])=>count));
 if(artistLoyalCount/total>=.25)add('artistloyalist',shareStrength(artistLoyalCount/total,.25,55,25),artistLoyalCount+' of '+total+' selected scores ('+(artistLoyalCount/total*100).toFixed(1)+'%) feature one song artist.',artistLoyalCount/total);
 const oneMapCount=Math.max(0,...[...mapsetScores].filter(([id])=>(mapsetDiffs.get(id)?.size||0)>=2).map(([,count])=>count));
 if(oneMapCount/total>=.25)add('onemap',shareStrength(oneMapCount/total,.25,55,25),oneMapCount+' of '+total+' selected scores ('+(oneMapCount/total*100).toFixed(1)+'%) come from one mapset, across at least two distinct difficulties.',oneMapCount/total);
 if(diverse)add('wanderer',60+25*clamp((Math.min(hosts.size,artists.size)/total-.5)/.5),total+' selected scores span '+hosts.size+' mapper hosts and '+artists.size+' artists.',Math.min(hosts.size,artists.size)/total);
 if(exclusiveClient)add(exclusiveClient,62,'All '+total+' eligible 2026 '+(total===1?'score was':'scores were')+' set on osu!'+(exclusiveClient==='stable'?'stable':'lazer')+' (100% of your available current top-200 sample).');
 if(eligibleMaps.length){
  for(const [id,count,threshold,qualifies] of [['crowdfavorites',popularMatches.length,.4,popularUnique>=2],['timecapsule',oldCount,.6,true],['class2026',newCount,.6,true]]){
   if(qualifies&&count/total>=threshold)add(id,shareStrength(count/total,threshold,68,28),count+' of '+total+' eligible 2026 scores from your current top 200 ('+(count/total*100).toFixed(1)+'%) '+(id==='crowdfavorites'?'are on '+popularUnique+' distinct mapsets in this mode’s 2026 popular top 25.':id==='timecapsule'?'are on mapsets ranked in 2016 or earlier.':'are on mapsets ranked in 2026.'),count/total);
  }
 }
 if(total){
  const durations=scores.map(score=>scoreBeatmapValues(score,mode).adjusted.length);
  const shortCount=durations.filter(length=>Number.isFinite(length)&&length>0&&length<=90).length;
  const longCount=durations.filter(length=>Number.isFinite(length)&&length>=210).length;
  for(const [id,count,label] of [['shortmaps',shortCount,'1:30 or shorter'],['longmaps',longCount,'3:30 or longer']]){
   if(count/total>=.6)add(id,shareStrength(count/total,.6,55,25),count+' of '+total+' selected scores ('+(count/total*100).toFixed(1)+'%) are on maps '+label+' after speed mods.',count/total);
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
 return '<div class="playstyle-club club-'+result.id+(story?' club-reveal':'')+'"><div class="club-emblem" aria-hidden="true"><span class="club-emblem-orbit"></span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="43" stroke-width="1" opacity=".4"/><path d="'+club.icon+'"/></svg></div><div class="club-copy"><span class="club-caption">YOUR PLAYSTYLE CLUB</span><h3>'+club.name+'</h3><p class="club-motto">'+club.motto+'</p>'+'<p class="club-reason">'+escape(result.reason)+'</p>'+(result.sampleNote?'<p class="club-sample-note">'+escape(result.sampleNote)+'</p>':'')+secondaryClubMarkup(result)+clubCommunityMarkup(data)+(story?'':'<button type="button" class="club-legend-trigger" data-club-legend aria-haspopup="dialog">How your club was chosen ↗︎</button>')+'</div></div>';
}

const clubSignals={
 slowtempo:'HT or DC on at least 40% of selected scores.',
 choke:'At least 30% of selected scores are passes with exactly one miss, or osu!standard passes with no misses and exactly one reported slider combo-break event.',
 oneshot:'SD, PF or AC on at least 40% of selected scores.',
 stable:'100% of selected scores are confirmed osu!stable scores.',
 lazer:'100% of selected scores are confirmed osu!lazer scores.',
 timecapsule:'At least 60% of selected scores are on mapsets ranked in 2016 or earlier.',
 class2026:'At least 60% of selected scores are on mapsets ranked in 2026.',
 crowdfavorites:'At least 40% of selected scores are on this mode’s 25 most-played mapsets ranked in 2026, spanning at least two distinct mapsets.',
 quality:'1-99 recorded plays across available 2026 monthly profile counts (all modes). Unavailable or zero history does not qualify.',
 easy:'EZ on at least 40% of selected scores.',
 closeenough:'At least 50% of selected scores are valid passes, averaging below 90% accuracy in osu!, taiko, or mania, or below 95% in catch.',
 safetynet:'SO or NF on at least 50% of selected scores (NF only outside osu!).',
 overdrive:'DT or NC on at least 40% of selected scores.',
 hardmode:'HR on at least 40% of selected scores. This club does not apply to mania.',
 afterdark:'HD or FL (also FI or CO in osu!mania) on at least 50% of selected scores.',
 moddedonly:'Every selected score uses at least one gameplay mod, with zero No Mod scores.',
 nomod:'No Mod on at least 60% of selected scores.',
 precision:'Average accuracy of at least 99% in osu! or taiko, 99.5% in catch, or 98% in mania, with valid passed scores covering at least 50% of selected scores.',
 replay:'At least 500 recorded views of your replays by others in available 2026 monthly profile history (all modes).',
 repeat:'At least 10,000 recorded 2026 plays across available monthly profile counts (all modes).',
 loyalist:'At least 25% of selected scores belong to one mapset host, across at least two distinct mapsets. Guest difficulties count under the host.',
 shortmaps:'At least 60% of selected scores are on maps 1:30 or shorter. Uses mod-adjusted total map length, including breaks.',
 longmaps:'At least 60% of selected scores are on maps 3:30 or longer. Uses mod-adjusted total map length, including breaks.',
 onemap:'At least 25% of selected scores come from one mapset, spanning at least two distinct beatmap difficulties.',
 artistloyalist:'At least 25% of selected scores feature one song artist, across at least two distinct mapsets. Artist credits are matched as listed on the mapsets.',
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
// Display order follows strength ranges, with All-Rounder always last; assignment ties keep CLUBS order.
export const CLUB_LEGEND_ORDER=['timecapsule','class2026','crowdfavorites','choke','precision','closeenough','wanderer','loyalist','artistloyalist','onemap','shortmaps','longmaps','repeat','quality','replay','stable','lazer','moddedonly','overdrive','slowtempo','hardmode','afterdark','nomod','easy','safetynet','oneshot','allrounder'];
export function clubLegendMarkup(data){
 return '<div class="club-legend-grid">'+CLUB_LEGEND_ORDER.map(id=>[id,CLUBS[id]]).map(([id,club])=>'<article class="club-legend-card club-'+id+'"'+(data?.club?.id===id?' aria-label="'+escape(club.name)+', your club"':'')+'>'+clubCompatibility(data,id)+'<div class="club-legend-heading"><svg aria-hidden="true" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="'+club.icon+'"/></svg><h3>'+club.name+'</h3>'+(data?.club?.id===id?'<span class="club-legend-current">Your club</span>':data?.club?.secondary?.id===id?'<span class="club-legend-current">Secondary</span>':'')+'</div><p class="club-legend-motto">'+club.motto+'</p><p>'+clubSignals[id]+'</p>'+legendCommunity(data,id)+'</article>').join('')+'</div>';
}
export function openClubLegend(data){
 if(document.querySelector('.club-legend-dialog'))return;
 const focusBefore=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog club-legend-dialog';dialog.setAttribute('aria-labelledby','club-legend-title');
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.id='club-legend-title';title.textContent='Playstyle club legend';const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.addEventListener('click',()=>dialog.close());header.append(title,close);
 const content=document.createElement('div');content.className='club-legend-content';
 const community=document.createElement('div');community.innerHTML=clubCommunityMarkup(data);
 const scope=document.createElement('p');scope.className='replay-note';scope.textContent='Selected scores are the deduplicated 2026 scores found in your current top 200 for the selected game mode, not necessarily all 200 scores. Accuracy uses valid passed selected scores. Playcount clubs use monthly profile history across all modes.';
 const legend=document.createElement('div');legend.innerHTML=clubLegendMarkup(data);
 const rules=document.createElement('p');rules.className='replay-note';rules.textContent='How selection works: all qualifying clubs compete for either role. The strongest signal becomes your primary club; the next distinct match becomes your secondary archetype. Mod shares score 40-55; Modded Only has a fixed base of 60, map shares 68-96, accuracy signals 65-90, mapper, artist, and single-mapset loyalty 55-80, artist/mapper diversity 60-85, map-length preferences 55-80, sustained activity 55-80, low playcounts 55-80, confirmed client exclusivity 62, and a varied All-Rounder mix 60-80. Choke Artists 70-95; Replay Society 55-80. These are base strength ranges. Score-based strength is multiplied by 0.5 + 0.5 × min(evidence scores / 20, 1), using valid passed scores for accuracy. Replay Society base strength is 55 at 500, 67.5 at 5,000, and 80 at 50,000+ views, with logarithmic growth. Replay Society uses replay-history months instead of playcount-history months. Activity strength is multiplied by 0.75 + 0.25 × min(available months / 6, 1). Small samples remain eligible but are marked provisional below 20 scores. Strength grows above each qualification threshold. These are design weights, not statistically calibrated probabilities. Exact ties use supporting score coverage, then a fixed order for repeatable results. All-Rounder also remains the fallback when no signal qualifies. Client choice or playcount cannot automatically override a stronger signal. All score-based signals use selected scores; accuracy uses valid passed selected scores, and monthly activity is profile-wide. CL is excluded; missing metadata does not qualify. Community percentages count primary clubs only.';
 const compatibilityNote=document.createElement('p');compatibilityNote.className='replay-note';compatibilityNote.textContent='Clubs are listed by general base strength range (highest maximum first, then highest minimum), not a fixed assignment priority. All-Rounder is always shown last; its balanced strength is 60-80 and its fallback strength is 0. Match strength is your evidence-adjusted club score out of 100, not a probability. Non-qualifying clubs show 0; missing review data shows a dash. Community percentages at the bottom show how many participants received each primary club.';
 content.append(scope,compatibilityNote,community,legend,rules);dialog.append(header,content);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
