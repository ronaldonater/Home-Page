import {updateReleaseAccess} from './release-state.js';
const releaseAt=Date.parse('2026-11-29T00:00:00Z');
const root=document.querySelector('#app');let timer,offset=0,checking=false,lastCheck=0;
function countdown(){
 root.innerHTML='<main class="release-screen"><div class="release-orbit" aria-hidden="true"></div><section class="release-card"><span class="eyebrow">YOUR YEAR IN RHYTHM</span><h1><span class="release-osu">osu!</span> Wrapped <span>2026</span></h1><p class="release-intro">Your year. One more countdown.</p><div class="release-clock" role="timer" aria-label="Time until release">'+['Days','Hours','Minutes','Seconds'].map((label,i)=>'<div><strong data-count="'+i+'">00</strong><span>'+label+'</span></div>').join('')+'</div><p class="release-date">November 29, 2026 &middot; 00:00 UTC</p><p class="release-message" role="status"></p><a class="release-admin" href="/api/osu-wrapped/auth/login">If you&#39;re an admin, login here.</a></section></main>';
 if(new URLSearchParams(location.search).get('error')==='admin')message('This account does not have early access. See you at release!');
}
function message(text){root.querySelector('.release-message').textContent=text;}
function tick(){
 const seconds=Math.max(0,Math.ceil((releaseAt-Date.now()-offset)/1000));
 const values=[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
 root.querySelectorAll('[data-count]').forEach((node,i)=>node.textContent=String(values[i]).padStart(2,'0'));
 if(Date.now()-lastCheck>=(!seconds?15000:30000))check();
}
async function check(){
 if(checking)return;checking=true;lastCheck=Date.now();
 try{
  const response=await fetch('/api/osu-wrapped/release',{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)throw Error('Release status unavailable');
  const status=await response.json();
  if(!Number.isFinite(status.serverNow)||status.releaseAt!=='2026-11-29T00:00:00.000Z')throw Error('Invalid release status');
  offset=status.serverNow-Date.now();
  if(status.allowed===true){
   // Visitors admitted by the temporary override return to the countdown when it is restored.
   if(status.publicAccess===true&&!status.admin&&status.serverNow<releaseAt){
    const accessTimer=setInterval(async()=>{if(document.hidden)return;try{const response=await fetch('/api/osu-wrapped/release',{cache:'no-store',credentials:'same-origin'});if(!response.ok)return;const current=await response.json();if(current.allowed===false){clearInterval(accessTimer);location.reload();}else if(current.serverNow>=releaseAt)clearInterval(accessTimer);}catch{}},30000);
   }
   updateReleaseAccess(status);clearInterval(timer);document.removeEventListener('visibilitychange',visible);await import('./main.js');return;}
  if(!root.querySelector('.release-screen'))countdown();
 }catch{message('Unable to check release access. Retrying shortly.');}
 finally{checking=false;}
}
function visible(){if(!document.hidden)check();}
countdown();timer=setInterval(tick,1000);tick();check();document.addEventListener('visibilitychange',visible);
