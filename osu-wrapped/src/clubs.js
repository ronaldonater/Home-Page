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
 allrounder:{name:'All-Rounder',motto:'A little of everything. A style all your own.',icon:'M50 22.5L58 41.5L79 42.5L63 55.5L69 77.5L50 65.5L31 77.5L37 55.5L21 42.5L42 41.5Z'}
};
export function assignClub(scores,mode='osu',months=[]){
 const total=scores.length;if(total<1)return null;
 const families={overdrive:0,hardmode:0,afterdark:0,nomod:0},hosts=new Map(),artists=new Set();
 for(const score of scores){const mods=new Set((score.mods||[]).map(mod=>typeof mod==='string'?mod:mod?.acronym).filter(mod=>typeof mod==='string'&&/^[A-Z0-9]{1,6}$/.test(mod)&&mod!=='CL'));
  if(mods.has('DT')||mods.has('NC'))families.overdrive++;if(mode!=='mania'&&mods.has('HR'))families.hardmode++;if(mods.has('HD')||mods.has('FL'))families.afterdark++;if(!mods.size||(mods.size===1&&mods.has('NM')))families.nomod++;
  const host=score.beatmapset?.user_id||score.beatmapset?.creator;if(host)hosts.set(String(host),(hosts.get(String(host))||0)+1);if(score.beatmapset?.artist)artists.add(score.beatmapset.artist.toLocaleLowerCase('en'));
 }
 const thresholds={overdrive:.4,hardmode:.4,afterdark:.5,nomod:.6};
 const preferences=Object.entries(families).filter(([key,count])=>count/total>=thresholds[key]).sort((a,b)=>b[1]-a[1]||Object.keys(families).indexOf(a[0])-Object.keys(families).indexOf(b[0]));
 const passed=scores.filter(s=>s.passed!==false&&Number.isFinite(s.accuracy)&&s.accuracy>=0&&s.accuracy<=1),accuracy=passed.length?passed.reduce((sum,s)=>sum+s.accuracy*100,0)/passed.length:null;
 const accuracyThreshold=({osu:99,taiko:99,fruits:99.5,mania:98})[mode]??99;
 const precise=passed.length>=10&&accuracy+1e-9>=accuracyThreshold,loyalCount=Math.max(0,...hosts.values()),loyal=loyalCount/total>=.25,diverse=hosts.size>=10&&artists.size>=10&&hosts.size/total>=.5&&artists.size/total>=.5;
 const activity=months.filter(m=>m.available===true&&Number.isFinite(m.count)&&m.count>=0),plays=activity.reduce((sum,m)=>sum+m.count,0),regularMonths=activity.filter(m=>m.count>=500).length;
 let id,reason;
 if(preferences.length){const [key,count]=preferences[0];id=key;const label={overdrive:'DT or NC',hardmode:'HR',afterdark:'HD or FL',nomod:'No Mod'}[key];reason=count+' of '+total+' selected scores ('+(count/total*100).toFixed(1)+'%) use '+label+'.';}
 else if(precise){id='precision';reason='Your average accuracy is '+accuracy.toFixed(2)+'% across '+passed.length+' passed scores, meeting the '+accuracyThreshold+'% threshold for this mode.';}
 else if(plays>=10000&&regularMonths>=6){id='repeat';reason=plays.toLocaleString('en-US')+' plays recorded in 2026, with at least 500 plays in '+regularMonths+' months. One more try kept becoming another.';}
 else if(loyal){id='loyalist';reason=loyalCount+' of '+total+' selected scores ('+(loyalCount/total*100).toFixed(1)+'%) come from one mapset host.';}
 else if(diverse){id='wanderer';reason=total+' selected scores span '+hosts.size+' mapper hosts and '+artists.size+' artists.';}
 else{id='allrounder';reason='No single mod preference or specialist signal dominates your '+total+' selected scores.';}
 return {id,total,reason,badge:precise&&id!=='precision'?'Precision-minded':null};
}
export function clubMarkup(data,{story=false}={}){
 const result=data?.club,club=CLUBS[result?.id];if(!club)return '<div class="club-pending"><h3>Your club is taking shape.</h3><p>At least one available 2026 score is needed to assign a playstyle club.</p></div>';
 return '<div class="playstyle-club club-'+result.id+(story?' club-reveal':'')+'"><div class="club-emblem" aria-hidden="true"><span class="club-emblem-orbit"></span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="43" stroke-width="1" opacity=".4"/><path d="'+club.icon+'"/></svg></div><div class="club-copy"><span class="club-caption">YOUR PLAYSTYLE CLUB</span><h3>'+club.name+'</h3><p class="club-motto">'+club.motto+'</p>'+(result.badge?'<span class="club-trait">'+escape(result.badge)+'</span>':'')+'<p class="club-reason">'+escape(result.reason)+'</p>'+(story?'':'<button type="button" class="club-legend-trigger" data-club-legend aria-haspopup="dialog">How your club was chosen ↗</button>')+'</div></div>';
}

const clubSignals={
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
export function clubLegendMarkup(data){
 return '<div class="club-legend-grid">'+Object.entries(CLUBS).map(([id,club])=>'<article class="club-legend-card club-'+id+'"'+(data?.club?.id===id?' aria-label="'+escape(club.name)+', your club"':'')+'><div class="club-legend-heading"><svg aria-hidden="true" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="'+club.icon+'"/></svg><h3>'+club.name+'</h3>'+(data?.club?.id===id?'<span class="club-legend-current">Your club</span>':'')+'</div><p class="club-legend-motto">'+club.motto+'</p><p>'+clubSignals[id]+'</p></article>').join('')+'</div>';
}
export function openClubLegend(data){
 if(document.querySelector('.club-legend-dialog'))return;
 const focusBefore=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog club-legend-dialog';dialog.setAttribute('aria-labelledby','club-legend-title');
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.id='club-legend-title';title.textContent='Playstyle club legend';const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.addEventListener('click',()=>dialog.close());header.append(title,close);
 const content=document.createElement('div');content.className='club-legend-content';
 const current=document.createElement('p');current.className='replay-note';current.textContent=data?.club?('Your club: '+CLUBS[data.club.id].name+'. '+data.club.reason):'One available 2026 score is enough to receive a club.';
 const legend=document.createElement('div');legend.innerHTML=clubLegendMarkup(data);
 const rules=document.createElement('p');rules.className='replay-note';rules.textContent='How selection works: the highest qualifying mod percentage wins (ties: Overdrive, HR Headquarters, Afterdark, No Mod). Otherwise we check Precision Society, The Repeat Offenders, Mapper Loyalists, then The Wanderers; All-Rounder is the fallback. Mod percentages and accuracy use deduplicated 2026 scores in your current top 200 for the selected mode. CL is excluded; CL-only scores count as No Mod. Repeat Offenders uses recorded monthly playcounts. These clubs describe the available data, not your complete play history.';
 content.append(current,legend,rules);dialog.append(header,content);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
