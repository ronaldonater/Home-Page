import {releaseAccess} from './release-state.js';
export function openAdminPanel(base='/api'){
 if(!releaseAccess.owner||document.querySelector('.admin-dialog'))return;
 const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='replay-dialog admin-dialog';dialog.setAttribute('aria-labelledby','admin-title');
 const header=document.createElement('div');header.className='replay-header';const title=document.createElement('h2');title.id='admin-title';title.textContent='Early access admins';const close=document.createElement('button');close.type='button';close.textContent='Close ×';close.onclick=()=>dialog.close();header.append(title,close);
 const intro=document.createElement('p');intro.className='replay-note';intro.textContent='Give users early access through their osu! account. Only ronaldonater can manage this list.';
 const form=document.createElement('form');form.className='admin-add';const input=document.createElement('input');input.type='text';input.name='user';input.placeholder='osu! username or user ID';input.setAttribute('aria-label','osu! username or user ID');input.required=true;input.maxLength=32;input.autocomplete='off';const add=document.createElement('button');add.type='submit';add.textContent='Add admin';form.append(input,add);
 const status=document.createElement('p');status.className='admin-status';status.setAttribute('role','status');
 const releaseBox=document.createElement('section');releaseBox.className='notice';
 const releaseLabel=document.createElement('p');releaseLabel.textContent='Loading countdown settings…';
 const releaseButton=document.createElement('button');releaseButton.type='button';releaseButton.className='button secondary';releaseButton.disabled=true;
 releaseBox.append(releaseLabel,releaseButton);let publicAccess=false;
 async function loadRelease(action){
  releaseButton.disabled=true;
  try{const response=await fetch(base+'/admin/release'+(action?'?action='+action:''),{method:action?'POST':'GET',credentials:'same-origin',cache:'no-store',signal:controller?.signal});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load release settings.');if(closed)return;
   publicAccess=data.publicAccess;releaseLabel.textContent=data.scheduledRelease?'Official release is public.':publicAccess?'Countdown disabled - all visitors have access.':'Countdown enabled - only early access admins can enter.';
   releaseButton.textContent=publicAccess?'Restore countdown':'Disable countdown and open access';releaseButton.disabled=data.scheduledRelease===true;
  }catch(error){if(!closed){releaseLabel.textContent=error.message;releaseButton.textContent='Reload release settings';releaseButton.disabled=false;}}
 }
 releaseButton.onclick=()=>loadRelease(releaseButton.textContent==='Reload release settings'?null:publicAccess?'restore':'open');
 const list=document.createElement('div');list.className='admin-list';let busy=false,closed=false,controller=null;
 async function request(query='',method='GET'){
  const response=await fetch(base+'/admin/users'+query,{method,credentials:'same-origin',cache:'no-store',signal:controller?.signal});let body;try{body=await response.json();}catch{throw Error('Unable to read the admin response.');}if(!response.ok)throw Error(body.error||'Unable to update admins.');return body;
 }
 function render(users){list.replaceChildren();for(const user of users){const row=document.createElement('div');row.className='admin-row';const identity=document.createElement('div');identity.className='admin-identity';
 const avatar=document.createElement('span');avatar.className='admin-avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent=[...String(user.username||'?')][0].toUpperCase();
 if(Number.isSafeInteger(user.id)&&user.id>0){const image=document.createElement('img');image.src='https://a.ppy.sh/'+user.id;image.alt='';image.width=40;image.height=40;image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';image.addEventListener('error',()=>image.remove(),{once:true});avatar.append(image);}
 const copy=document.createElement('div');const name=document.createElement('strong');name.textContent=user.username;const detail=document.createElement('small');detail.textContent='osu! ID '+user.id+(user.owner?' · Permanent owner':' · Early access');copy.append(name,detail);identity.append(avatar,copy);row.append(identity);
  if(user.owner){const badge=document.createElement('span');badge.className='pill';badge.textContent='Owner';row.append(badge);}else{const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+user.username+' from admins');remove.onclick=()=>mutate('?action=remove&user='+encodeURIComponent(user.id));row.append(remove);}list.append(row);}}
 async function refresh(){if(busy||closed||document.hidden)return;busy=true;controller=new AbortController();try{const data=await request();if(!closed){render(data.users);await loadRelease();status.textContent='Changes take effect on the next server request.';}}catch(error){if(!closed)status.textContent=error.message;}finally{busy=false;}}
 async function mutate(query){if(busy||closed)return;busy=true;form.querySelectorAll('input,button').forEach(el=>el.disabled=true);list.querySelectorAll('button').forEach(el=>el.disabled=true);status.textContent='Saving…';controller=new AbortController();try{const data=await request(query,'POST');if(!closed){render(data.users);input.value='';status.textContent='Admin list updated.';}}catch(error){if(!closed)status.textContent=error.message;}finally{busy=false;form.querySelectorAll('input,button').forEach(el=>el.disabled=false);list.querySelectorAll('button').forEach(el=>el.disabled=false);}}
 form.onsubmit=event=>{event.preventDefault();if(input.value.trim())mutate('?action=add&user='+encodeURIComponent(input.value.trim()));};
 dialog.append(header,intro,releaseBox,form,status,list);document.body.append(dialog);dialog.showModal();input.focus();refresh();const timer=setInterval(refresh,10000);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>{closed=true;clearInterval(timer);controller?.abort();dialog.remove();if(previous?.isConnected)previous.focus();},{once:true});
}
