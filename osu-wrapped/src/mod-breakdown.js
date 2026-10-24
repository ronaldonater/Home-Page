import {favoriteModIcons} from './mod-icons.js';
export function personalModsMarkup(data,{story=false}={}){
 const rows=data?.modUsage;if(!Array.isArray(rows)||!rows.length)return '<p class="global-empty">No selected scores available to rank mods.</p>';
 return '<ol class="global-mod-usage personal-mod-usage">'+rows.slice(0,story?5:rows.length).map(row=>'<li><span class="global-place">'+row.rank.toString().padStart(2,'0')+'</span><span class="global-mod-name">'+favoriteModIcons({mods:[row.mod]})+'<b>'+ (row.mod==='NM'?'No Mod':row.mod)+'</b></span><span class="global-mod-count"><strong>'+row.count+'</strong> '+(row.count===1?'score':'scores')+'<small>'+row.percentage.toFixed(2)+'% of '+row.total+'</small></span></li>').join('')+'</ol>';
}
export function openModBreakdown(data){
 if(document.querySelector('.mod-breakdown-dialog'))return;const focusBefore=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog mod-breakdown-dialog';dialog.setAttribute('aria-label','Your mod rankings');
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.textContent='Your mod rankings';const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.onclick=()=>dialog.close();header.append(title,close);
 const list=document.createElement('div');list.innerHTML=personalModsMarkup(data);
 const note=document.createElement('p');note.className='replay-note';note.textContent='Individual mods across your available 2026 scores in the current top 200, for the selected mode. Each mod counts once per score. CL is excluded; CL-only scores count as No Mod. Multiple mods can appear on a score, so percentages may total over 100%. Tied counts share a rank.';
 dialog.append(header,list,note);document.body.append(dialog);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});dialog.showModal();close.focus();
}
