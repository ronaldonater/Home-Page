import {savedBeatmapCover} from './beatmap-cover.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const skillsetLabel=name=>({alt:'Alt',speedjack:'Speedjacks',wristjack:'Wristjacks'}[name]||name.replace(/[_-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()));
export function skillsetSummary(scores,mode='osu'){
 let checked=0,tagged=0;const counts=new Map(),maps=new Map();
 for(const score of scores){const value=score.wrappedSkillsets;if(value?.status!=='ready'||value.mode!==mode)continue;checked++;
  const names=[...new Set((value.names||[]).filter(name=>typeof name==='string'&&/^skillset\/[a-z][a-z0-9_-]{0,50}$/.test(name)))];
  if(names.length)tagged++;for(const name of names){
   counts.set(name,(counts.get(name)||0)+1);
   const id=score.beatmap?.id??score.beatmap_id;if(!Number.isSafeInteger(id)||id<=0)continue;
   if(!maps.has(name))maps.set(name,new Map());const entries=maps.get(name),existing=entries.get(id);
   if(existing){existing.count++;continue;}
   const set=score.beatmapset||{};entries.set(id,{id,setId:set.id??score.beatmap?.beatmapset_id,title:set.title||'Unknown beatmap',artist:set.artist||'Unknown artist',creator:set.creator||'Unknown mapper',version:score.beatmap?.version||'Unknown difficulty',cover:set.covers?.['cover@2x']||set.covers?.cover||null,count:1});
  }
 }
 const total=scores.length;return {status:checked===total&&total?'ready':checked?'partial':'unavailable',total,checked,tagged,rows:[...counts].map(([tag,count])=>({tag,name:skillsetLabel(tag.slice(9)),count,maps:[...(maps.get(tag)?.values()||[])],percentage:total?count/total*100:0})).sort((a,b)=>b.count-a.count||a.tag.localeCompare(b.tag))};
}
export function skillsetCoverage(stats){return stats.tagged+' of '+stats.total+' selected scores have community skillset tags · '+stats.checked+' checked';}
export function skillsetsMarkup(data,{story=false}={}){
 const stats=data?.skillsets;if(!stats?.total||(!story&&!stats.rows?.length))return '';
 const rows=story?(stats.rows||[]).slice(0,5):(stats.rows||[]);
 const scroll=!story&&rows.length>5;
 return '<section class="panel skillsets-panel"><div class="panel-heading"><div><span class="eyebrow">YOUR SIGNATURE PATTERNS</span><h3>Your main skillsets.</h3></div><span class="pill">Community tags</span></div>'+(rows.length?'<ol class="skillset-list'+(scroll?' skillset-list-scroll':'')+'"'+(scroll?' tabindex="0" aria-label="Skillset rankings"':'')+'>'+rows.map((row,i)=>'<li'+(!story?' class="skillset-map-entry" data-skillset-maps="'+escape(row.tag||'')+'" tabindex="0" aria-haspopup="dialog" aria-label="View '+escape(row.name)+' beatmaps"':'')+'><span class="position">'+String(i+1).padStart(2,'0')+'</span><strong><a href="https://osu.ppy.sh/beatmapsets?q='+encodeURIComponent('tag=""'+row.tag+'""')+'&amp;m='+({osu:0,taiko:1,fruits:2,mania:3}[data.mode]??0)+'" target="_blank" rel="noopener noreferrer">'+escape(row.name)+'</a></strong><span class="skillset-numbers"><b>'+row.percentage.toFixed(1)+'%</b><small>'+row.count+' '+(row.count===1?'score':'scores')+'</small></span>'+'</li>').join('')+'</ol>':'<p class="muted">'+(stats.checked?'No community skillset tags were found for the checked scores.':'Community skillset tags are currently unavailable.')+'</p>')+'<p class="skillset-coverage">'+escape(skillsetCoverage(stats))+'</p>'+(story?'':'<p class="muted skillset-explanation">Based on community tags for the exact difficulties in your selected scores. Multiple skillsets can apply to one score, so percentages may total over 100%. These describe map patterns, not measured skill proficiency.</p>')+'</section>';
}

export function skillsetMapCover(map){
 let cover=map.cover;
 try{const url=new URL(cover);if(url.origin!=='https://assets.ppy.sh'||url.username||url.password||!/^\/beatmaps\/[1-9]\d*\/covers\/[^/]+\.(?:jpg|jpeg|png|webp)$/i.test(url.pathname))cover=null;}catch{cover=null;}
 if(!cover&&Number.isSafeInteger(map.setId)&&map.setId>0)cover='https://assets.ppy.sh/beatmaps/'+map.setId+'/covers/cover@2x.jpg';
 return cover?savedBeatmapCover(cover):null;
}
export function skillsetMapsMarkup(row,mode='osu'){
 const maps=Array.isArray(row?.maps)?row.maps.filter(map=>Number.isSafeInteger(map.id)&&map.id>0):[];
 if(!maps.length)return '<p class="muted">Beatmap details are not included in this saved review. Newly generated reviews include their matching selected beatmaps.</p>';
 const ruleset=['osu','taiko','fruits','mania'].includes(mode)?mode:'osu';
 return '<ol class="skillset-map-list">'+maps.map(map=>{
  const href=Number.isSafeInteger(map.setId)&&map.setId>0?'https://osu.ppy.sh/beatmapsets/'+map.setId+'#'+ruleset+'/'+map.id:'https://osu.ppy.sh/beatmaps/'+map.id;
  const cover=skillsetMapCover(map);
  return '<li><a href="'+href+'" target="_blank" rel="noopener noreferrer">'+(cover?'<img class="skillset-map-cover" src="'+escape(cover)+'" alt="" width="88" height="60" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>':'')+'<div class="skillset-map-copy"><strong>'+escape(map.title)+'</strong><span>'+escape(map.artist)+'</span><small>Mapped by '+escape(map.creator)+'</small></div></a><span class="skillset-map-difficulty">'+escape(map.version)+'</span></li>';
 }).join('')+'</ol>';
}
export function openSkillsetMaps(data,tag){
 const row=data?.skillsets?.rows?.find(row=>row.tag===tag);if(!row||document.querySelector('.skillset-maps-dialog'))return;
 const panelTitle=({'skillset/jumps':'Jump','skillset/streams':'Stream'}[tag]||row.name)+' beatmaps';
 const focusBefore=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog skillset-maps-dialog';dialog.setAttribute('aria-label',panelTitle);
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.textContent=panelTitle;const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.onclick=()=>dialog.close();header.append(title,close);
 const note=document.createElement('p');note.className='replay-note';note.textContent='Your selected beatmap difficulties tagged '+tag+'.';
 const list=document.createElement('div');list.innerHTML=skillsetMapsMarkup(row,data.mode);
 list.querySelectorAll('.skillset-map-cover').forEach(img=>img.addEventListener('error',()=>img.remove(),{once:true}));
 dialog.append(header,note,list);document.body.append(dialog);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
