import {openRecapViewer} from './recap-viewer.js';
import {createRecap} from './recap.js';
export const shareMessage=data=>'My '+data.year+' osu! Wrapped is here! My year in rhythm, one beat at a time.\n\nGet yours now at: https://ronaldonater.com/osu-wrapped';
export function openCardShare(data,{onClose,layout='portrait',chooseLayout=true,downloadOnly=false}={}){
 if(document.querySelector('.card-share-dialog'))return;
 const dialog=document.createElement('dialog');dialog.className='card-share-dialog'+(downloadOnly?' card-download-dialog':'');dialog.setAttribute('aria-labelledby','card-share-title');
 dialog.innerHTML='<h2 id="card-share-title">Share your Wrapped</h2><label for="card-share-message">Your message</label><textarea id="card-share-message" rows="5"></textarea><div class="card-share-actions"><button data-copy>Copy message</button><button data-copy-image disabled>Copy image</button><button data-download disabled>Download card</button><button data-native hidden disabled>Share card…</button></div><p>Copy the image and paste it into your post, or download the card to attach it. Twitter and Bluesky open with your message.</p><div class="card-share-platforms"></div><p data-status role="status">Preparing your card…</p><button data-close>Close</button>';
 dialog.querySelector('h2').textContent=downloadOnly?'Download your recap card':'Share your Wrapped';
 const selector=document.createElement('div');selector.className='recap-layout-picker';selector.setAttribute('role','group');selector.setAttribute('aria-label','Recap card layout');
 for(const variant of ['portrait','landscape']){const button=document.createElement('button');button.type='button';button.dataset.recapLayout=variant;button.textContent=variant==='portrait'?'Portrait':'Landscape';button.setAttribute('aria-pressed',String(layout===variant));button.disabled=!chooseLayout;button.onclick=()=>{if(layout===variant)return;layout=variant;prepare();};selector.append(button);}
 const preview=document.createElement('div');preview.className='recap-choice-preview';preview.setAttribute('aria-live','polite');
 dialog.querySelector('h2').after(selector,preview);
 const message=dialog.querySelector('textarea');message.value=shareMessage(data);
 const status=dialog.querySelector('[data-status]');let file=null,url=null,generation=0,expanded=null;
 for(const [name,base,key] of [['Twitter / X','https://twitter.com/intent/tweet','text'],['Bluesky','https://bsky.app/intent/compose','text']]){const link=document.createElement('a');link.textContent=name;link.target='_blank';link.rel='noopener noreferrer';const update=()=>{const target=new URL(base);target.searchParams.set(key,message.value);link.href=target.href;};update();message.addEventListener('input',update);dialog.querySelector('.card-share-platforms').append(link);}
 dialog.querySelector('[data-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(message.value);status.textContent='Message copied.';}catch{message.focus();message.select();status.textContent='Select and copy the message above.';}};
 dialog.querySelector('[data-download]').onclick=()=>{if(!url)return;const a=document.createElement('a');a.href=url;a.download=file.name;a.click();};
 const copyImage=dialog.querySelector('[data-copy-image]');
 copyImage.onclick=async()=>{if(!file)return;if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined'){status.textContent='Image copying is unavailable in this browser. Download the card to attach it instead.';return;}try{await navigator.clipboard.write([new ClipboardItem({'image/png':file})]);status.textContent='Image copied! Paste it into your post.';}catch{status.textContent='Could not copy the image. Download the card to attach it instead.';}};
 const native=dialog.querySelector('[data-native]');native.onclick=async()=>{try{await navigator.share({files:[file],title:'My osu! Wrapped',text:message.value});status.textContent='Share sheet closed.';}catch(error){if(error.name!=='AbortError')status.textContent='Could not share directly. Download the card and attach it to your post.';}};
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 let outsidePress=false;
 const outside=event=>{const bounds=dialog.getBoundingClientRect();return event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom;};
 dialog.addEventListener('pointerdown',event=>{outsidePress=event.target===dialog&&outside(event);});
 dialog.addEventListener('pointercancel',()=>{outsidePress=false;});
 dialog.addEventListener('click',event=>{if(outsidePress&&event.target===dialog&&outside(event))dialog.close();outsidePress=false;});

 const previous=document.activeElement;dialog.addEventListener('close',()=>{generation++;expanded?.close();if(url)URL.revokeObjectURL(url);dialog.remove();if(previous?.isConnected)previous.focus();onClose?.();},{once:true});
 document.body.append(dialog);dialog.showModal();
 const cards=new Map();
 function prepare(){
  const current=++generation,variant=layout;expanded?.close();file=null;dialog.querySelector('[data-download]').disabled=true;copyImage.disabled=true;native.hidden=true;native.disabled=true;
  for(const button of selector.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.recapLayout===variant));
  preview.textContent='Preparing '+variant+' preview…';status.textContent='Preparing your card…';
  if(!cards.has(variant))cards.set(variant,createRecap(data,{layout:variant}).catch(error=>{cards.delete(variant);throw error;}));
  cards.get(variant).then(blob=>{if(!dialog.isConnected||current!==generation)return;if(url)URL.revokeObjectURL(url);file=new File([blob],'osu-wrapped-'+data.year+'-'+variant+'.png',{type:'image/png'});url=URL.createObjectURL(blob);const image=document.createElement('img');image.src=url;image.alt=variant+' recap card preview';const expand=document.createElement('button');expand.type='button';expand.className='recap-preview-expand';expand.setAttribute('aria-label','Expand '+variant+' recap card');expand.title='Click to expand and zoom';expand.append(image);expand.onclick=()=>{if(expanded)return;expanded=openRecapViewer(url,{alt:variant+' recap card',trigger:expand,onClose:()=>{expanded=null;}});};preview.replaceChildren(expand);dialog.querySelector('[data-download]').disabled=false;copyImage.disabled=false;if(navigator.canShare?.({files:[file]})){native.hidden=false;native.disabled=false;}status.textContent='Your '+variant+' card is ready.';}).catch(()=>{if(dialog.isConnected&&current===generation){preview.textContent='Preview unavailable.';status.textContent='Could not prepare the card. Close this panel and try again.';}});
 }
 prepare();
}
