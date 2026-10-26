// Mapping clubs describe hosted 2026 submissions, independently of playstyle clubs.
export const MAPPING_CLUBS=[
 {id:'soundtrack',name:'Crowd Pleasers',motto:'Someone’s next favorite started in your editor.',rule:'At least 100,000 combined all-time plays on your 2026 submissions.',color:'#ffd46b',symbol:'♫',matches:m=>Number.isSafeInteger(m.totalPlays)&&m.totalPlays>=100000},
 {id:'ranked',name:'Ranked & Recognized',motto:'Your patterns earned their place.',rule:'At least 3 of your 2026 submissions are currently ranked.',color:'#b7e58b',symbol:'★',matches:m=>m.ranked>=3},
 {id:'breakthrough',name:'Ranked Debut',motto:'Your ideas made the ranked list.',rule:'At least 1 of your 2026 submissions is currently ranked. Earlier ranked mapsets do not affect eligibility.',color:'#c4a3ff',symbol:'◇',matches:m=>m.ranked>=1},
 {id:'factory',name:'Pattern Factory',motto:'The editor barely had time to close.',rule:'At least 10 mapsets first submitted in 2026.',color:'#ffad76',symbol:'▦',matches:m=>m.created>=10},
 {id:'gems',name:'Hidden Gems',motto:'Great patterns don’t always make the spotlight.',rule:'At least 5 mapsets first submitted in 2026, with none currently ranked.',color:'#67ded0',symbol:'◆',matches:m=>m.created>=5&&m.ranked===0},
 {id:'draft',name:'First Draft Society',motto:'Every mapper starts with one idea.',rule:'At least 1 mapset first submitted in 2026. This need not be your first-ever mapset.',color:'#8edcff',symbol:'✎',matches:m=>m.created>=1}
];
// Keep every icon inside the same centered 24x24 artboard (4..20 safe area).
// New mapping logos should use this renderer rather than font/emoji glyphs.
const mappingIconPaths={
 ranked:'M12 3L14.8 8.7L21 9.6L16.5 14L17.6 20.2L12 17.3L6.4 20.2L7.5 14L3 9.6L9.2 8.7Z',
 soundtrack:'M10 10A2 2 0 1 0 14 10A2 2 0 1 0 10 10M9 21V16L5 11M15 21V16L19 11M9 16Q12 13 15 16M3 8A1.5 1.5 0 1 0 6 8A1.5 1.5 0 1 0 3 8M18 8A1.5 1.5 0 1 0 21 8A1.5 1.5 0 1 0 18 8M4 20V14L2 11M20 20V14L22 11M12 3V5M7 3L8 5M17 3L16 5',
 breakthrough:'M6 9A6 6 0 1 0 18 9A6 6 0 1 0 6 9M9 9L11 11L15 7M8 14L6 21L12 18L18 21L16 14',
 factory:'M4 20V10L10 6V10L16 6V20ZM16 10H20V20H4M7 14H8M11 14H12M7 17H8M11 17H12',
 gems:'M7 4H17L21 10L12 21L3 10ZM3 10H21M7 4L9 10L12 21L15 10L17 4',
 draft:'M5 15L16 4L20 8L9 19L4 20ZM14 6L18 10M5 15L9 19'
};
export function mappingClubArtwork(id){return {path:mappingIconPaths[id]||mappingIconPaths.draft,x:0,y:id==='ranked'?.4:id==='factory'?-1:0};}
export function mappingClubIcon(id){
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path transform="'+(id==='ranked'?'translate(0 .4)':id==='soundtrack'?'translate(0 0)':id==='factory'?'translate(0 -1)':'translate(0 0)')+'" d="'+(mappingIconPaths[id]||mappingIconPaths.draft)+'"/></svg>';
}
export function mappingClubMatches(mapping){
 if(mapping?.status!=='ready'||!Number.isSafeInteger(mapping.created)||mapping.created<1)return [];
 return MAPPING_CLUBS.filter(club=>club.matches(mapping));
}
export const assignMappingClub=mapping=>mappingClubMatches(mapping)[0]||null;
export function mappingCommunityMarkup(mapping,clubId){
 const community=mapping?.community;
 if(!community)return '';
 if(community.status!=='ready')return '<p class="mapping-community">Mapping community percentages are temporarily unavailable.</p>';
 const row=community.clubs?.find(row=>row.id===clubId);
 if(!row||!Number.isFinite(row.percentage)||!Number.isSafeInteger(community.total)||community.total<1)return '';
 return '<div class="mapping-community"><span class="mapping-community-label">COMMUNITY SHARE</span><strong>'+row.percentage.toFixed(1)+'<span>%</span></strong><span class="mapping-community-description">of participating mappers share this club</span><small>'+community.total.toLocaleString('en-US')+' mapper'+(community.total===1?'':'s')+' · all modes · 2026</small><span class="mapping-community-refresh">Updates may take a minute</span></div>';
}
export function mappingClubMarkup(mapping,{legend=false}={}){
 if(mapping?.status!=='ready'||!mapping.created)return '';
 const matches=mappingClubMatches(mapping),club=matches[0];
 const badge=club?'<div class="mapping-club-badge mapping-club-'+club.id+'"><span class="mapping-club-symbol" aria-hidden="true">'+mappingClubIcon(club.id)+'</span><div><small>YOUR MAPPING CLUB</small><strong>'+club.name+'</strong><p>'+club.motto+'</p><p class="mapping-club-criteria">'+club.rule+'</p></div></div>':'<div class="mapping-club-badge"><div><small>YOUR MAPPING CLUB</small><strong>Your mapping identity is taking shape.</strong><p>None of the six club requirements are met yet. Keep creating!</p></div></div>';
 const button=legend?'<button type="button" class="club-legend-trigger mapping-legend-trigger" data-mapping-legend aria-haspopup="dialog">How your club was chosen ↗︎</button>':'';
 const community=mappingCommunityMarkup(mapping,club?.id);
 return badge.replace('</div></div>',button+'</div>'+(community?'<div class="mapping-club-community-side">'+community+'</div>':'')+'</div>');
}
export function mappingLegendMarkup(mapping){
 const matches=mappingClubMatches(mapping),primary=matches[0];
 return '<div class="mapping-club-grid">'+MAPPING_CLUBS.map(c=>'<article class="mapping-club-'+c.id+'"><h4><span class="mapping-club-legend-icon">'+mappingClubIcon(c.id)+'</span>'+c.name+'</h4><p>'+c.motto+'</p><small>'+c.rule+'</small><b'+(c===primary?' class="mapping-club-current"':'')+'>'+(matches.includes(c)?(c===primary?'Your mapping club':'Also qualifies'):'Not yet qualified')+'</b>'+mappingCommunityMarkup(mapping,c.id)+'</article>').join('')+'</div>';
}
export function openMappingLegend(mapping){
 if(document.querySelector('.mapping-legend-dialog'))return;
 const focusBefore=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='replay-dialog club-legend-dialog mapping-legend-dialog';
 dialog.setAttribute('aria-labelledby','mapping-legend-title');
 const header=document.createElement('div');header.className='replay-header';
 const title=document.createElement('h2');title.id='mapping-legend-title';title.textContent='Mapping club legend';
 const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.addEventListener('click',()=>dialog.close());header.append(title,close);
 const content=document.createElement('div');content.className='club-legend-content';
 const scope=document.createElement('p');scope.className='replay-note';scope.textContent='Based on your hosted mapsets first submitted in 2026 (UTC), across all modes. Ranked status and playcounts are current. Mapping clubs are independent of playstyle clubs.';
 const legend=document.createElement('div');legend.innerHTML=mappingLegendMarkup(mapping);
 const rules=document.createElement('p');rules.className='replay-note';rules.textContent='How selection works: the first qualifying club in the order shown becomes your primary mapping club. Other qualifying clubs are marked “Also qualifies.” Community percentages count each participating mapper’s primary mapping club once across all game modes.';
 const community=document.createElement('div');community.className='mapping-legend-community';
 const primary=assignMappingClub(mapping),stats=mapping?.community,row=stats?.clubs?.find(entry=>entry.id===primary?.id);
 if(primary&&stats?.status==='ready'&&row&&Number.isFinite(row.percentage)&&Number.isSafeInteger(stats.total)&&stats.total>0){
  community.classList.add('mapping-club-'+primary.id);
  const message=document.createElement('p');message.append('You’re among ');const percentage=document.createElement('strong');percentage.textContent=row.percentage.toFixed(1)+'%';message.append(percentage,' of participating mappers with this primary club.');
  const detail=document.createElement('small');detail.textContent='Based on '+stats.total.toLocaleString('en-US')+' mapper'+(stats.total===1?'':'s')+' - all modes - 2026 - updates may take a minute';community.append(message,detail);
 }else{community.innerHTML=mappingCommunityMarkup(mapping,primary?.id);}
 content.append(scope,community,legend,rules);dialog.append(header,content);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
