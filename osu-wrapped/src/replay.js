const VIEWER_ORIGIN='https://www.replayviewer.com';
export function openReplay(score,apiBase='/api',{globalMode=null}={}){
 const dialog=document.createElement('dialog');dialog.className='replay-dialog';
 const header=document.createElement('div');header.className='replay-header';
 const title=document.createElement('h2');title.textContent='Watch replay · '+score.title;
 const close=document.createElement('button');close.type='button';close.textContent='Close ×';
 header.append(title,close);
 const note=document.createElement('p');note.className='replay-note';note.textContent='Powered by ReplayViewer. The selected replay file is shared with this third-party viewer; your osu! login token stays on our server. Lazer-specific mods may not be supported.';
 const status=document.createElement('p');status.className='replay-status';status.setAttribute('role','status');status.textContent='Downloading replay…';
 const fallback=document.createElement('a');fallback.href='https://osu.ppy.sh/scores/'+encodeURIComponent(score.id);fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='Open original score ↗';fallback.className='replay-score-link';
 const frame=document.createElement('iframe');frame.title='ReplayViewer for '+score.title;frame.referrerPolicy='no-referrer';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads allow-pointer-lock');frame.allow='autoplay; fullscreen';
 dialog.append(header,note,status,fallback,frame);document.body.append(dialog);
 const controller=new AbortController();let ready=false,bytes=null,sent=false;
 const deadline=setTimeout(()=>{controller.abort();status.textContent='The replay viewer timed out. Close the panel and try again.';},45000);
 const send=()=>{if(ready && bytes && !sent){sent=true;status.textContent='Processing replay in ReplayViewer…';frame.contentWindow.postMessage({type:'replayviewer:load',osr:bytes,skin:'YUGEN'},VIEWER_ORIGIN,[bytes]);bytes=null;}};
 const receive=event=>{if(event.origin!==VIEWER_ORIGIN || event.source!==frame.contentWindow)return;
  const message=event.data;if(!message||typeof message!=='object')return;
  if(message.type==='replayviewer:ready'){ready=true;send();}
  if(message.type==='replayviewer:loaded'){clearTimeout(deadline);status.textContent='Replay ready. Use the viewer controls to play.';}
  if(message.type==='replayviewer:error'){clearTimeout(deadline);status.textContent='ReplayViewer could not load this replay: '+String(message.message||'Unknown error').slice(0,240);}
 };
 window.addEventListener('message',receive);
 close.onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{controller.abort();clearTimeout(deadline);window.removeEventListener('message',receive);frame.src='about:blank';dialog.remove();},{once:true});
 dialog.showModal();frame.src=VIEWER_ORIGIN+'/?embed';
 fetch(apiBase+(globalMode?'/global-replay?mode='+encodeURIComponent(globalMode)+'&id=':'/replay?id=')+encodeURIComponent(score.id),{signal:controller.signal}).then(async response=>{
  if(!response.ok){let message='Replay unavailable.';try{message=(await response.json()).error||message;}catch{}throw Error(message);}
  bytes=await response.arrayBuffer();status.textContent='Waiting for ReplayViewer…';send();
 }).catch(error=>{if(!dialog.isConnected)return;clearTimeout(deadline);status.textContent=error.name==='AbortError'?'Replay loading timed out. Please try again.':error.message;});
}
