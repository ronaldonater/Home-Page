export function openBeatmap(score){
 if(!Number.isSafeInteger(score.beatmapId)||score.beatmapId<=0||document.querySelector('.beatmap-viewer-dialog'))return;
 const source='https://preview.tryz.id.vn/?b='+score.beatmapId,focusBefore=document.activeElement;
 const dialog=document.createElement('dialog');dialog.className='replay-dialog beatmap-viewer-dialog';dialog.setAttribute('aria-label','Watch beatmap');
 const header=document.createElement('div');header.className='replay-header';
 const title=document.createElement('h2');title.textContent='Watch beatmap · '+score.title;
 const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.setAttribute('aria-label','Close beatmap viewer');close.onclick=()=>dialog.close();header.append(title,close);
 const note=document.createElement('p');note.className='replay-note';note.textContent='Previewing the most-played difficulty in the selected gamemode. Powered by JoSu! Beatmap Viewer.';
 const fallback=document.createElement('a');fallback.className='replay-score-link';fallback.href=source;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='Open viewer in a new tab ↗︎';
 const frame=document.createElement('iframe');frame.title='Beatmap preview · '+score.title;frame.referrerPolicy='no-referrer';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-pointer-lock');frame.allow='autoplay; fullscreen';frame.allowFullscreen=true;
 dialog.append(header,note,fallback,frame);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{frame.src='about:blank';dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});
 dialog.showModal();frame.src=source;close.focus();
}
