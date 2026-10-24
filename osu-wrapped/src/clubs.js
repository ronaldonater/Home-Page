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
 easy:{name:'EZ Does It',motto:'Smaller numbers. Bigger mind games.',icon:'M28 34H72L42 66H72M28 50H58'},
 closeenough:{name:'Close Enough Club',motto:'Not every hit was perfect. The story still counts.',icon:'M29 50A21 21 0 1 0 71 50A21 21 0 1 0 29 50M37 51L47 61L64 40M31 24L25 18M69 24L75 18'},
 safetynet:{name:'Safety Net Society',motto:'A little backup. Another chance to play.',icon:'M50 22L73 31V49Q73 67 50 78Q27 67 27 49V31ZM38 49L47 58L63 40'},
 quality:{name:'Quality Over Quantity',motto:'A few plays. A lasting impression.',icon:'M50 22L58 40L78 43L63 57L67 78L50 68L33 78L37 57L22 43L42 40ZM40 50L48 58L61 43'},
 timecapsule:{name:'Time Capsule',motto:'Great patterns never get old.',icon:'M29 27H71M29 73H71M34 27Q34 42 50 50Q66 58 66 73M66 27Q66 42 50 50Q34 58 34 73'},
 class2026:{name:'Class of 2026',motto:'Freshly ranked. Already unforgettable.',icon:'M27 30H73V75H27ZM37 23V37M63 23V37M27 43H73M39 56L47 64L62 51'},
 crowdfavorites:{name:'Crowd Favorites',motto:'The community hits different. You agree.',icon:'M35 53A15 15 0 1 0 65 53A15 15 0 1 0 35 53M50 29V21M71 35L77 29M79 53H87M29 35L23 29M21 53H13M39 54L47 62L62 45'},
 allrounder:{name:'All-Rounder',motto:'A little of everything. A style all your own.',icon:'M50 22.5L58 41.5L79 42.5L63 55.5L69 77.5L50 65.5L31 77.5L37 55.5L21 42.5L42 41.5Z'}
};
export function assignClub(scores,mode='osu',months=[],{popularBeatmapsets=null}={}){
 const total=scores.length;if(total<1)return null;
 const families={overdrive:0,hardmode:0,afterdark:0,nomod:0,easy:0,safetynet:0},hosts=new Map(),artists=new Set();
 for(const score of scores){const mods=new Set((score.mods||[]).map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&/^[A-Z0-9]{1,6}$/.test(mod)&&mod!=='CL'));
  if(mods.has('DT')||mods.has('NC'))families.overdrive++;if(mode!=='mania'&&mods.has('HR'))families.hardmode++;if(mods.has('HD')||mods.has('FL'))families.afterdark++;if(!mods.size||(mods.size===1&&mods.has('NM')))families.nomod++;
  if(mods.has('EZ'))families.easy++;if(mods.has('NF')||(mode==='osu'&&mods.has('SO')))families.safetynet++;
  const host=score.beatmapset?.user_id||score.beatmapset?.creator;if(host)hosts.set(String(host),(hosts.get(String(host))||0)+1);if(score.beatmapset?.artist)artists.add(score.beatmapset.artist.toLocaleLowerCase('en'));
 }
 const thresholds={overdrive:.4,hardmode:.4,afterdark:.5,nomod:.6,easy:.4,safetynet:.5};
 const preferences=Object.entries(families).filter(([key,count])=>count/total>=thresholds[key]).sort((a,b)=>b[1]-a[1]||Object.keys(families).indexOf(a[0])-Object.keys(families).indexOf(b[0]));
 const passed=scores.filter(s=>s.passed!==false&&Number.isFinite(s.accuracy)&&s.accuracy>=0&&s.accuracy<=1),accuracy=passed.length?passed.reduce((sum,s)=>sum+s.accuracy*100,0)/passed.length:null;
 const accuracyThreshold=({osu:99,taiko:99,fruits:99.5,mania:98})[mode]??99;
 const lowAccuracyThreshold=mode==='fruits'?95:90;
 const lowAccuracy=passed.length>=10&&accuracy<lowAccuracyThreshold;
 const precise=passed.length>=10&&accuracy+1e-9>=accuracyThreshold,loyalCount=Math.max(0,...hosts.values()),loyal=loyalCount/total>=.25,diverse=hosts.size>=10&&artists.size>=10&&hosts.size/total>=.5&&artists.size/total>=.5;
 const activity=months.filter(m=>m.available===true&&Number.isFinite(m.count)&&m.count>=0),plays=activity.reduce((sum,m)=>sum+m.count,0),regularMonths=activity.filter(m=>m.count>=500).length;
 const eligibleMaps=scores;
 const mapId=score=>score.beatmapset?.id??score.beatmap?.beatmapset_id;
 const rankedYear=score=>typeof score.beatmapset?.ranked_date==='string'?new Date(score.beatmapset.ranked_date).getUTCFullYear():NaN;
 const oldCount=eligibleMaps.filter(score=>rankedYear(score)>=2007&&rankedYear(score)<=2016).length,newCount=eligibleMaps.filter(score=>rankedYear(score)===2026).length;
 const popularIds=new Set((Array.isArray(popularBeatmapsets)?popularBeatmapsets:[]).slice(0,25).map(row=>row.id).filter(id=>Number.isSafeInteger(id)&&id>0));
 const popularMatches=eligibleMaps.filter(score=>popularIds.has(mapId(score))),popularUnique=new Set(popularMatches.map(mapId)).size;
 const mapClub=eligibleMaps.length>=5?(popularMatches.length/eligibleMaps.length>=.4&&popularUnique>=3?'crowdfavorites':oldCount/eligibleMaps.length>=.6?'timecapsule':newCount/eligibleMaps.length>=.6?'class2026':null):null;
 let id,reason;
 if(activity.length&&plays>0&&plays<100){id='quality';reason=plays.toLocaleString('en-US')+' recorded '+(plays===1?'play':'plays')+' in available 2026 monthly profile history (all modes). A little rhythm goes a long way.';}
 else if(mapClub){id=mapClub;const count=id==='crowdfavorites'?popularMatches.length:id==='timecapsule'?oldCount:newCount;reason=count+' of '+eligibleMaps.length+' eligible 2026 scores from your current top 200 ('+(count/eligibleMaps.length*100).toFixed(1)+'%) '+(id==='crowdfavorites'?'are on '+popularUnique+' distinct mapsets in this mode’s 2026 popular top 25.':id==='timecapsule'?'are on mapsets ranked in 2016 or earlier.':'are on mapsets ranked in 2026.');}
 else if(preferences.length){const [key,count]=preferences[0];id=key;const label={overdrive:'DT or NC',hardmode:'HR',afterdark:'HD or FL',nomod:'No Mod',easy:'EZ',safetynet:mode==='osu'?'SO or NF':'NF'}[key];reason=count+' of '+total+' selected scores ('+(count/total*100).toFixed(1)+'%) use '+label+'.';}
 else if(precise){id='precision';reason='Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, meeting the '+accuracyThreshold+'% threshold for this mode.';}
 else if(lowAccuracy){id='closeenough';reason='Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, below the '+lowAccuracyThreshold+'% threshold for this mode.';}
 else if(plays>=10000&&regularMonths>=6){id='repeat';reason=plays.toLocaleString('en-US')+' plays recorded in 2026, with at least 500 plays in '+regularMonths+' months. One more try kept becoming another.';}
 else if(loyal){id='loyalist';reason=loyalCount+' of '+total+' selected scores ('+(loyalCount/total*100).toFixed(1)+'%) come from one mapset host.';}
 else if(diverse){id='wanderer';reason=total+' selected scores span '+hosts.size+' mapper hosts and '+artists.size+' artists.';}
 else{id='allrounder';reason='No single mod preference or specialist signal dominates your '+total+' selected scores.';}
 return {id,total,reason,badge:precise&&id!=='precision'?'Precision-minded':null};
}
export function clubCommunityMarkup(data){
 const community=data?.clubCommunity;if(data?.demo||!community)return '';
 if(community.status==='collecting')return '<p class="club-community">Community club percentages unlock after '+escape(community.minimum)+' participants for this mode.</p>';
 if(community.status!=='ready')return '<p class="club-community">Community club percentages are temporarily unavailable.</p>';
 const row=community.clubs?.find(row=>row.id===data.club?.id);if(!row)return '';
 return '<p class="club-community">You’re among <strong>'+row.percentage.toFixed(1)+'%</strong> of Wrapped participants in this club.<small>Based on '+community.total.toLocaleString('en-US')+' participants · '+escape(community.mode)+' · '+community.year+' · updates may take a minute</small></p>';
}
export function clubMarkup(data,{story=false}={}){
 const result=data?.club,club=CLUBS[result?.id];if(!club)return '<div class="club-pending"><h3>Your club is taking shape.</h3><p>At least one available 2026 score is needed to assign a playstyle club.</p></div>';
 return '<div class="playstyle-club club-'+result.id+(story?' club-reveal':'')+'"><div class="club-emblem" aria-hidden="true"><span class="club-emblem-orbit"></span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="43" stroke-width="1" opacity=".4"/><path d="'+club.icon+'"/></svg></div><div class="club-copy"><span class="club-caption">YOUR PLAYSTYLE CLUB</span><h3>'+club.name+'</h3><p class="club-motto">'+club.motto+'</p>'+(result.badge?'<span class="club-trait">'+escape(result.badge)+'</span>':'')+'<p class="club-reason">'+escape(result.reason)+'</p>'+clubCommunityMarkup(data)+(story?'':'<button type="button" class="club-legend-trigger" data-club-legend aria-haspopup="dialog">How your club was chosen ↗</button>')+'</div></div>';
}

const clubSignals={
 timecapsule:'At least 60% of all your eligible 2026 scores from the current top 200 are on mapsets ranked in 2016 or earlier, with at least five eligible scores.',
 class2026:'At least 60% of all your eligible 2026 scores from the current top 200 are on mapsets ranked in 2026, with at least five eligible scores.',
 crowdfavorites:'At least 40% of all your eligible 2026 scores from the current top 200 are on this mode’s 25 most-played mapsets ranked in 2026, spanning at least three distinct mapsets and at least five scores.',
 quality:'1-99 recorded plays across available 2026 monthly profile counts (all modes). Takes priority over mod and other club signals; unavailable or zero history does not qualify.',
 easy:'EZ on at least 40% of selected scores.',
 closeenough:'At least 10 passed scores averaging below 90% accuracy in osu!, taiko, or mania, or below 95% in catch. Dominant mod preferences take priority.',
 safetynet:'SO or NF on at least 50% of selected scores (NF only outside osu!).',
 overdrive:'DT or NC on at least 40% of selected scores.',
 hardmode:'HR on at least 40% of selected scores. This club does not apply to mania.',
 afterdark:'HD or FL on at least 50% of selected scores.',
 nomod:'No Mod on at least 60% of selected scores.',
 precision:'Average accuracy of at least 99% in osu! or taiko, 99.5% in catch, or 98% in mania, across at least 10 passed scores.',
 repeat:'At least 10,000 recorded 2026 plays, with 500 or more plays in at least six months.',
 loyalist:'At least 25% of selected scores belong to one mapset host. Guest difficulties count under the host.',
 wanderer:'At least 10 unique mapper hosts and 10 artists; each unique-name count must be at least half your selected score count.',
 allrounder:'Your fallback club when no other qualifying preference or specialist signal takes priority.'
};
function legendCommunity(data,id){
 const community=data?.clubCommunity;if(data?.demo||community?.status!=='ready')return '';
 const row=community.clubs?.find(row=>row.id===id);return row?'<p class="club-legend-share"><strong>'+row.percentage.toFixed(1)+'%</strong> · '+row.count.toLocaleString('en-US')+' of '+community.total.toLocaleString('en-US')+' participants</p>':'';
}
export function clubLegendMarkup(data){
 return '<div class="club-legend-grid">'+Object.entries(CLUBS).map(([id,club])=>'<article class="club-legend-card club-'+id+'"'+(data?.club?.id===id?' aria-label="'+escape(club.name)+', your club"':'')+'><div class="club-legend-heading"><svg aria-hidden="true" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="'+club.icon+'"/></svg><h3>'+club.name+'</h3>'+(data?.club?.id===id?'<span class="club-legend-current">Your club</span>':'')+'</div><p class="club-legend-motto">'+club.motto+'</p><p>'+clubSignals[id]+'</p>'+legendCommunity(data,id)+'</article>').join('')+'</div>';
}
export function openClubLegend(data){
 if(document.querySelector('.club-legend-dialog'))return;
 const focusBefore=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog club-legend-dialog';dialog.setAttribute('aria-labelledby','club-legend-title');
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.id='club-legend-title';title.textContent='Playstyle club legend';const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.addEventListener('click',()=>dialog.close());header.append(title,close);
 const content=document.createElement('div');content.className='club-legend-content';
 const current=document.createElement('p');current.className='replay-note';current.textContent=data?.club?('Your club: '+CLUBS[data.club.id].name+'. '+data.club.reason):'One available 2026 score is enough to receive a club.';
 const community=document.createElement('div');community.innerHTML=clubCommunityMarkup(data);
 const legend=document.createElement('div');legend.innerHTML=clubLegendMarkup(data);
 const rules=document.createElement('p');rules.className='replay-note';rules.textContent='How selection works: Quality Over Quantity takes priority for 1-99 recorded 2026 plays when monthly history is available. Next we check Crowd Favorites, Time Capsule, then Class of 2026 using all eligible 2026 scores from the current top 200. Mapset ranking dates, not score dates or last updates, determine map age; missing dates do not count. Otherwise the highest qualifying mod percentage wins (ties: Overdrive, HR Headquarters, Afterdark, No Mod, EZ Does It, Safety Net Society). Otherwise we check Precision Society, Close Enough Club, The Repeat Offenders, Mapper Loyalists, then The Wanderers; All-Rounder is the fallback. Mod percentages and accuracy use deduplicated 2026 scores in your current top 200 for the selected mode. CL is excluded; CL-only scores count as No Mod. Repeat Offenders uses recorded monthly playcounts. These clubs describe the available data, not your complete play history.';
 content.append(current,community,legend,rules);dialog.append(header,content);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
