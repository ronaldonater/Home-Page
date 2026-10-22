import {favoriteModIcons} from './mod-icons.js';
import {favoriteModLabel,favoriteModNote,favoriteModPercentage} from './mods.js';
import {rarestMedalMarkup} from './medals.js';
import {accuracyRank} from './accuracy.js';
import {openCardShare} from './share.js';
import {createRecap} from './recap.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>value==null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value);
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const seen=new Set();
export const experienceKey=data=>'osu-wrapped:experience:'+data.year+':'+data.user.id;
export function firstExperience(data,storage){
 if(!data || data.demo)return false;
 const key=experienceKey(data);if(seen.has(key))return false;
 try{if(storage?.getItem(key))return false;}catch{}
 return true;
}
export function markExperience(data,storage){
 if(data.demo)return;const key=experienceKey(data);seen.add(key);try{storage?.setItem(key,'seen');}catch{}
}
export function experienceSlides(data){
 const best=data.top[0];const available=data.months.filter(m=>m.available);const peak=available.reduce((a,b)=>!a||b.count>a.count?b:a,null);
 const count=(value,suffix='')=>'<strong class="story-number"'+(Number.isFinite(value)?' data-count="'+value+'"':'')+'>'+number(value)+'</strong>'+ (suffix?'<span class="story-unit">'+escape(suffix)+'</span>':'');
 const ranking=(rows,unit,avatars=false)=>'<ol class="story-ranking'+' story-mapper-ranking'+'">'+rows.slice(0,5).map((row,i)=>'<li><span class="story-place">0'+(i+1)+'</span>'+(avatars?storyMapperAvatar(row):storyArtistAvatar(row))+'<b>'+escape(row.name)+'</b><span>'+number(row.count)+' '+(unit==='scores' && row.count===1?'score':unit)+'</span></li>').join('')+'</ol>';
 const slides = [
 {theme:'pink',eyebrow:'PRESS PLAY ON YOUR YEAR',title:'<span class="story-opening-heading">'+storyUserAvatar(data.user)+'<span>'+escape(data.user.username)+'’s<br>2026.</span></span>',body:'<div class="story-record" aria-hidden="true">◎</div><p>One more try.<br>A whole year of you.</p>',note:(data.demo?'Fictional demo · ':'')+'Your osu! year in rhythm. · Music: cYsmix - Triangles',duration:5500},
 {theme:'lime',eyebrow:'YOU KEPT COMING BACK',title:'You hit play.',body:count(data.playcount,'plays in 2026')+'<p>'+ (peak?'<b>'+months[peak.month]+'</b> led the way with <b>'+number(peak.count)+' plays.</b>':'No monthly activity returned yet.')+'</p>',note:'Available monthly profile history · all modes',duration:6500},
 {theme:'lavender',eyebrow:'FINDING YOUR FLOW',title:'Precision.<br>Persistence.',body:'<div class="story-duo"><div><strong>'+ (data.accuracy==null?'—':data.accuracy.toFixed(2)+'%')+'</strong><span class="story-accuracy-label">average accuracy'+(Number.isFinite(data.accuracy)?storyGrade(accuracyRank(data.accuracy)):'')+'</span></div><div><strong>'+number(data.combo)+'×</strong><span>highest combo</span></div></div><div class="story-favorite-mod"><span>FAVORITE MOD</span><b>'+favoriteModIcons(data.favoriteMod)+escape(favoriteModLabel(data.favoriteMod))+'</b><small><span class="favorite-mod-count" tabindex="0" title="'+favoriteModPercentage(data.favoriteMod)+'">'+escape(favoriteModNote(data.favoriteMod))+'</span> · 2026 selection</small></div>',note:'Passed 2026 scores in your current top 200 · selected mode',duration:6500},
 {theme:'night',eyebrow:'A LITTLE RECOGNITION',title:'You made<br>your mark.',body:'<div class="story-duo"><div>'+count(data.medals)+'<span>medals unlocked</span></div><div>'+count(data.replayViews)+'<span>replay watches</span></div></div>'+rarestMedalMarkup(data),note:'Dated achievements and monthly replay history · all modes',duration:6000},
 {theme:'pink',preview:storyPreview(best),artwork:storyCover(best?.cover),eyebrow:'THE ONE TO REMEMBER',title:best?escape(best.title):'Your next best<br>is waiting.',body:best?'<div class="story-score-heading">'+count(Math.round(best.pp),'pp')+storyGrade(best.rank)+'</div><p><b>'+escape(best.artist)+'</b><br>'+escape(best.version)+'<br>Mapped by '+escape(best.creator)+'</p><div class="story-tags">'+escape(best.mods)+' · '+best.accuracy.toFixed(2)+'% · '+number(best.combo)+'×</div><p class="story-score-date">'+storyDate(best.date)+'</p>':'<p>No 2026 PP scores were found in your current top 200.</p>',note:'Highest 2026 PP found in your current top 200 · selected mode',duration:7000},
 {theme:'night',preview:storyPreview(best),layout:'plays',eyebrow:'PERSONAL BEST MATERIAL',title:'Your top five.',body:storyPlays(data.top)+(!data.top.length?'<p>No 2026 PP scores available.</p>':''),note:'2026 scores in your current top 200 · selected mode',duration:8000},
 {theme:'lime',eyebrow:'BEHIND THE PATTERNS',title:'Your mappers.',body:ranking(data.mappers,'scores',true)+(!data.mappers.length?'<p>No mapper rankings available.</p>':''),note:'2026 score counts in your current top 200 · mapset creator credits',duration:8000},
 {theme:'lavender',preview:storyPreview(data.artists[0])||storyPreview(data.top.find(score=>score.artist===data.artists[0]?.name)),eyebrow:'THE SOUNDTRACK TO YOUR YEAR',title:'Your artists.',body:ranking(data.artists,'scores')+(!data.artists.length?'<p>No artist rankings available.</p>':''),note:'2026 score counts in your current top 200 · not total song plays · Artist images: TheAudioDB.com',duration:8000},
 {theme:'pink',layout:'final',eyebrow:'SAME TIME NEXT YEAR?',title:'That was<br>your 2026.',body:'<p>Every new best starts<br>with one more try.</p><div class="story-finish"><button type="button" data-story-save>↓ Save recap card</button><button type="button" data-story-share class="card-share-icon" title="Share card" aria-label="Share recap card"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg></button><button type="button" data-story-review>Explore my numbers ↗</button><a class="story-donate" href="https://ko-fi.com/ronaldonater" target="_blank" rel="noopener noreferrer">Donate <span aria-hidden="true">♡</span></a></div>',note:number(data.sampleCount)+' scores dated in 2026 from your current top 200. Profile history is separate; this is not a full annual score archive. Year to date until 2027. · Music: nekodex - circles!',duration:8000}
 ];
 for(const [kind,title,rows] of [['mapper','Your mappers.',data.mappers],['artist','Your artists.',data.artists]]){const quiz=makeQuiz(rows,kind);if(quiz){const reveal=slides.findIndex(slide=>slide.title===title);slides.splice(reveal,0,quiz);}}
 return slides;
}
export function openExperience(data,{onSave,onReview}={}){
 if(document.querySelector('.story-dialog'))return;
 const slides=experienceSlides(data);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const mobile=matchMedia('(max-width:720px)').matches;
 const dialog=document.createElement('dialog');dialog.className='story-dialog'+(mobile?' story-mobile':'');dialog.setAttribute('aria-label','Your osu! Wrapped experience');
 dialog.innerHTML='<div class="story-shell"><div class="story-orb story-orb-one"></div><div class="story-orb story-orb-two"></div><div class="story-progress" aria-label="Story slides">'+slides.map((s,i)=>'<button type="button" data-story-step="'+i+'" aria-label="Go to slide '+(i+1)+'"><progress max="1000" value="0"></progress></button>').join('')+'</div><div class="story-top"><span>osu! wrapped / 2026'+(data.demo?' · DEMO':'')+'</span><div><button type="button" data-story-mute aria-label="Mute slide audio" title="Mute audio" aria-pressed="false"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/><g class="story-speaker-waves"><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></g><path class="story-speaker-muted" d="m16 9 6 6m0-6-6 6"/></svg></button><button type="button" data-story-pause aria-label="Pause experience">Pause Ⅱ</button><button type="button" data-story-close aria-label="Close experience">Close ×</button></div></div><div class="story-stage"></div><div class="story-bottom"><button type="button" data-story-prev aria-label="Previous slide">← Back</button><span class="story-counter" role="status" aria-live="polite"></span><button type="button" data-story-next>Next →</button></div></div>';
 document.body.append(dialog);
 const stage=dialog.querySelector('.story-stage'),shell=dialog.querySelector('.story-shell'),pause=dialog.querySelector('[data-story-pause]'),next=dialog.querySelector('[data-story-next]');
 const stageSize=new ResizeObserver(()=>stage.style.setProperty('--story-stage-height',stage.clientHeight+'px'));stageSize.observe(stage);
 let index=0,elapsed=0,paused=reduced,last=performance.now(),raf=0,touchX=null;
 const openingSong="/osu-wrapped/sounds/triangles.mp3";
 const ambientSong="/osu-wrapped/sounds/ambient.mp3";
 let ambientAudio=null;
 const finaleSong="/osu-wrapped/sounds/circles.mp3";
 let introActive=false,introMotion=[],introEnd=4200;
 let muted=false,closing=false;
 const closeAudio=new Audio("/osu-wrapped/sounds/close.mp3");closeAudio.preload="auto";
 let previewAudio=null,openingAudio=null;
 const previewFades=new Map();
 function fadePreview(audio,target,duration=650){
  clearInterval(previewFades.get(audio));previewFades.delete(audio);
  const start=audio.volume,began=performance.now();
  const timer=setInterval(()=>{const fraction=Math.min(1,(performance.now()-began)/duration);const eased=fraction*fraction*(3-2*fraction);audio.volume=start+(target-start)*eased;if(fraction===1){clearInterval(timer);previewFades.delete(audio);if(target===0)audio.pause();}},20);
  previewFades.set(audio,timer);
 }
 function syncPreview(){if(closing||!previewAudio)return;const audio=previewAudio;if(document.hidden){clearInterval(previewFades.get(audio));previewFades.delete(audio);audio.pause();audio.volume=0;}else if(paused)fadePreview(audio,0,350);else{audio.play().catch(error=>{if(error.name!=='AbortError'&&previewAudio===audio&&!document.hidden&&!closing&&!paused){paused=true;pauseLabel();}});fadePreview(audio,audio===ambientAudio?.22:.35);}}
 const visibilityChanged=()=>{last=performance.now();syncPreview();};
 document.addEventListener("visibilitychange",visibilityChanged);
 let quizAudio=null;
 const stampAudio=new Audio("/osu-wrapped/sounds/hit.mp3");stampAudio.preload="auto";stampAudio.volume=.65;let stampPlayed=false;
 function playQuizSound(correct){if(quizAudio){quizAudio.pause();quizAudio.currentTime=0;}quizAudio=new Audio('/osu-wrapped/sounds/'+(correct?'pass':'miss')+'.mp3');quizAudio.volume=.65;quizAudio.muted=muted;quizAudio.play().catch(()=>{});}
 let recapPreview=null;
 const answers=new Map();
 const progress=[...dialog.querySelectorAll('progress')];let counters=[],ppGrade=null;
 function show(i){if(closing)return;introMotion.forEach(animation=>animation.cancel());introMotion=[];shell.querySelector(".story-intro")?.remove();introActive=false;introEnd=4200;stampAudio.pause();stampAudio.currentTime=0;stampPlayed=false;index=Math.max(0,Math.min(slides.length-1,i));elapsed=0;last=performance.now();const slide=slides[index];shell.className='story-shell story-theme-'+slide.theme;
  shell.querySelector('.story-backdrop')?.remove();
  if(slide.artwork){const image=document.createElement('img');image.className='story-backdrop';image.src=slide.artwork;image.alt='';image.referrerPolicy='no-referrer';image.addEventListener('error',()=>{if(image.parentElement){image.remove();shell.classList.remove('story-has-artwork');}},{once:true});shell.prepend(image);shell.classList.add('story-has-artwork');}
  stage.innerHTML='<div class="story-slide'+(slide.layout==='plays'?' story-slide-plays':slide.quiz?' story-slide-quiz':'')+'"><span class="story-eyebrow">'+slide.eyebrow+'</span><h2>'+slide.title+'</h2><div class="story-body">'+slide.body+'</div><p class="story-footnote">'+escape(slide.note)+'</p></div>';
  if(slide.layout==='final'){
   const container=stage.querySelector('.story-slide');container.classList.add('story-slide-final');
   const content=document.createElement('div');while(container.firstChild)content.append(container.firstChild);container.append(content);
   const preview=document.createElement('div');preview.className='story-recap-preview';preview.setAttribute('aria-live','polite');preview.textContent='Preparing your card…';container.append(preview);
   recapPreview??=createRecap(data).then(blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);})).catch(()=>{recapPreview=null;return null;});
   recapPreview.then(source=>{if(!preview.isConnected)return;if(!source){preview.textContent='Use Save recap card to try generating your card again.';return;}const image=document.createElement('img');image.src=source;image.alt=data.user.username+'’s '+data.year+' recap card preview';preview.replaceChildren(image);});
  }
  stage.querySelectorAll('.story-mapper-avatar img,.story-user-avatar img,.story-artist-avatar img,.rarest-medal>img').forEach(image=>{image.addEventListener('error',()=>image.remove(),{once:true});if(image.complete&&image.naturalWidth===0)image.remove();});
  counters=[...stage.querySelectorAll('[data-count]')].map(el=>({el,value:Number(el.dataset.count)}));
  ppGrade=stage.querySelector('.story-score-heading .story-score-grade,.story-accuracy-label .story-score-grade');
  progress.forEach((p,n)=>p.value=n<index?1000:0);
  dialog.querySelectorAll('[data-story-step]').forEach((button,n)=>button.setAttribute('aria-current',n===index?'step':'false'));
  dialog.querySelector('[data-story-prev]').disabled=index===0;next.textContent=slide.quiz?(answers.has(index)?'See my '+slide.quiz.kind+'s →':'Skip & reveal →'):index===slides.length-1?'Done ✓':'Next →';
  dialog.querySelector('.story-counter').textContent=(index+1)+' / '+slides.length;
  if(slide.quiz){stage.querySelectorAll('[data-quiz-choice]').forEach(button=>button.addEventListener('click',()=>{if(answers.has(index))return;const choice=Number(button.dataset.quizChoice);answers.set(index,choice);elapsed=0;last=performance.now();renderAnswer();button.classList.add('quiz-selected-blink');playQuizSound(slide.quiz.options[choice].count===slide.quiz.topCount);}));renderAnswer();}
  const audioSource=slide.layout==='final'?finaleSong:index<4?openingSong:(slide.quiz||slide.title==='Your mappers.')?ambientSong:slide.preview;
  if(previewAudio?.src!==new URL(audioSource||"",location.href).href){if(previewAudio)fadePreview(previewAudio,0);previewAudio=null;if(audioSource){previewAudio=audioSource===openingSong?(openingAudio??=new Audio(openingSong)):audioSource===ambientSong?(ambientAudio??=new Audio(ambientSong)):new Audio(audioSource);previewAudio.loop=true;previewAudio.volume=0;previewAudio.muted=muted;}}
  if(index===0&&previewAudio)previewAudio.currentTime=0;
  if(index===0&&!reduced&&!paused){
   if(previewAudio)previewAudio.currentTime=0;introActive=true;const intro=document.createElement('div');intro.className='story-intro';intro.innerHTML='<div class="story-intro-logo"><img src="/osu-wrapped/images/osu-intro-logo.svg" alt="osu!" width="200" height="200"/></div><div class="story-intro-flash"></div>';shell.append(intro);
   const logo=intro.querySelector('.story-intro-logo');
   introMotion=[intro.animate([{backgroundColor:'#15101e'},{backgroundColor:'#15101e',offset:.72},{backgroundColor:'transparent',offset:.75},{backgroundColor:'transparent'}],{duration:4200,fill:'both'}),logo.animate([{opacity:0,transform:'scale(.35)'},{opacity:1,transform:'scale(1.04)',offset:.22},{transform:'scale(1)',offset:.4},{transform:'scale(.94)',offset:.6},{transform:'scale(1.12)',offset:.72},{transform:'scale(.98)',offset:.82},{opacity:1,transform:'scale(1.2)',offset:.91},{opacity:0,transform:mobile?'scale(2.2)':'scale(3.4)'}],{duration:3150,fill:'both',easing:'cubic-bezier(.2,.7,.2,1)'}),intro.querySelector('.story-intro-flash').animate([{opacity:0},{opacity:0,offset:.7},{opacity:1,offset:.75,easing:'ease-out'},{opacity:0}],{duration:4200,fill:'both'})];
   const animate=(element,frames)=>introMotion.push(element.animate(frames,{duration:4200,fill:'both'}));
   const glow=document.createElement('div');glow.className='story-intro-glow';intro.prepend(glow);
   animate(glow,[{opacity:0,transform:'scale(.4)'},{opacity:.8,transform:'scale(1)',offset:.35},{opacity:1,transform:'scale(1.3)',offset:.65},{opacity:0,transform:'scale(2)',offset:.76},{opacity:0}]);
   for(let ring=0;ring<(mobile?2:3);ring++){
    const element=document.createElement('div');element.className='story-intro-ring';intro.prepend(element);
    const start=.06+ring*.13;
    animate(element,[{opacity:0,transform:'scale(.35)'},{opacity:0,transform:'scale(.35)',offset:start},{opacity:.65,transform:'scale(.65)',offset:start+.08},{opacity:0,transform:'scale(2.7)',offset:.72+ring*.025},{opacity:0,transform:'scale(3)'}]);
   }
   for(let dot=0;dot<(mobile?4:8);dot++){
    const orbit=document.createElement('div');orbit.className='story-intro-orbit';orbit.innerHTML='<i></i>';intro.prepend(orbit);
    const angle=dot*(mobile?90:45);
    animate(orbit,[{opacity:0,transform:'rotate('+angle+'deg) scale(1.6)'},{opacity:.75,transform:'rotate('+(angle+60)+'deg) scale(1)',offset:.3},{opacity:.8,transform:'rotate('+(angle+140)+'deg) scale(.8)',offset:.63},{opacity:0,transform:'rotate('+(angle+170)+'deg) scale(2.7)',offset:.76},{opacity:0}]);
   }
   for(let spark=0;spark<(mobile?6:16);spark++){
    const element=document.createElement('div');element.className='story-intro-spark';intro.prepend(element);
    const angle=spark*Math.PI*2/(mobile?6:16),x=Math.cos(angle),y=Math.sin(angle);
    animate(element,[{opacity:0,transform:'translate('+x*90+'px,'+y*90+'px) scale(.3)'},{opacity:0,offset:.53},{opacity:.9,transform:'translate('+x*150+'px,'+y*150+'px) scale(1)',offset:.6},{opacity:0,transform:'translate('+x*650+'px,'+y*650+'px) scale(.2)',offset:.76},{opacity:0}]);
   }
   const controlInk=getComputedStyle(shell).getPropertyValue('--story-ink').trim();
   for(const control of shell.querySelectorAll('.story-top,.story-bottom,.story-progress button'))introMotion.push(control.animate([{color:'#fff'},{color:'#fff',offset:.75,easing:'ease-out'},{color:controlInk}],{duration:4200,fill:'both'}));
   introMotion.forEach(animation=>animation.pause());
  }
  if(slide.layout==='final'&&!reduced&&!paused){
   introActive=true;introEnd=13000;if(previewAudio){previewAudio.currentTime=0;previewAudio.loop=false;}
   const finale=document.createElement('div');finale.className='story-intro story-finale';finale.innerHTML='<div class="story-finale-aura"></div><div class="story-finale-copy"><span>ONE MORE TRY.</span><strong>ONE UNFORGETTABLE YEAR.</strong><b>2026</b></div><div class="story-finale-curtain"></div>';shell.append(finale);
   const animate=(element,frames)=>introMotion.push(element.animate(frames,{duration:13000,fill:'both'}));
   animate(finale,[{opacity:1},{opacity:1,offset:.975},{opacity:0}]);
   animate(finale.querySelector('.story-finale-aura'),[{opacity:.1,transform:'scale(.4)'},{opacity:.5,transform:'scale(1)',offset:.5},{opacity:1,transform:'scale(1.6)',offset:.92},{opacity:0,transform:'scale(3)'}]);
   const copy=finale.querySelector('.story-finale-copy');
   animate(copy.querySelector('span'),[{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)',offset:.12},{opacity:1,offset:.28},{opacity:0,offset:.37},{opacity:0}]);
   animate(copy.querySelector('strong'),[{opacity:0},{opacity:0,offset:.3},{opacity:1,transform:'scale(.95)',offset:.43},{opacity:1,transform:'scale(1)',offset:.65},{opacity:0,transform:'scale(1.15)',offset:.75},{opacity:0}]);
   animate(copy.querySelector('b'),[{opacity:0},{opacity:0,offset:.68},{opacity:1,transform:'scale(.7)',offset:.77},{opacity:1,transform:'scale(1)',offset:.92},{opacity:0,transform:'scale(3)'}]);
   for(let n=0;n<(mobile?3:6);n++){const ring=document.createElement('div');ring.className='story-finale-ring';finale.prepend(ring);const start=n*.1;animate(ring,[{opacity:0,transform:'scale(.2)'},{opacity:0,offset:start},{opacity:.6,transform:'scale(.5)',offset:start+.12},{opacity:0,transform:'scale(3.8)',offset:Math.min(.99,start+.48)},{opacity:0}]);}
   const glass=document.createElement('div');glass.className='story-finale-glass';glass.setAttribute('aria-hidden','true');finale.append(glass);
   const shardCount=mobile?8:18;
   for(let shard=0;shard<shardCount;shard++){
    const angle=shard*Math.PI*2/shardCount,nextAngle=(shard+1)*Math.PI*2/shardCount;
    const radius=90,cx=50,cy=50;
    const points=[[cx,cy],[cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius],[cx+Math.cos(nextAngle)*radius,cy+Math.sin(nextAngle)*radius]];
    const element=document.createElement('div');element.className='story-glass-shard';element.style.clipPath='polygon('+points.map(([x,y])=>x+'% '+y+'%').join(',')+')';glass.append(element);
    const direction=angle+Math.PI/shardCount,distance=(mobile?100:180)+(shard%4)*65;
    animate(element,[{opacity:0,transform:'translate(0,0) rotate(0deg)'},{opacity:0,offset:11.72/13},{opacity:.85,transform:'translate(0,0) rotate(0deg)',offset:11.76/13},{opacity:.6,transform:'translate('+Math.cos(direction)*distance*.35+'px,'+Math.sin(direction)*distance*.35+'px) rotate('+((shard%2?1:-1)*7)+'deg)',offset:11.96/13},{opacity:0,transform:'translate('+Math.cos(direction)*distance+'px,'+Math.sin(direction)*distance+'px) rotate('+((shard%2?1:-1)*36)+'deg)'}]);
   }
   animate(finale.querySelector('.story-finale-curtain'),[{opacity:0},{opacity:0,offset:.96},{opacity:1,offset:.98},{opacity:0}]);
   const ink=getComputedStyle(shell).getPropertyValue('--story-ink').trim();
   for(const control of shell.querySelectorAll('.story-top,.story-bottom,.story-progress button'))animate(control,[{color:'#fff'},{color:'#fff',offset:.96},{color:ink}]);
   introMotion.forEach(animation=>animation.pause());
  }
  syncPreview();

  pauseLabel();
  stage.querySelector('[data-story-share]')?.addEventListener('click',()=>{const resumeOnClose=!paused;if(resumeOnClose)toggle();openCardShare(data,{onClose:()=>{if(resumeOnClose&&dialog.open&&!closing&&paused)toggle();}});});
  stage.querySelector('[data-story-review]')?.addEventListener('click',()=>closeExperience(onReview));
  stage.querySelector('[data-story-save]')?.addEventListener('click',()=>onSave?.());
 }
 function advance(){if(index<slides.length-1)show(index+1);else closeExperience();}
 function renderAnswer(){const quiz=slides[index].quiz;if(!quiz||!answers.has(index))return;const chosen=answers.get(index),correct=quiz.options[chosen].count===quiz.topCount;
  stage.querySelectorAll('[data-quiz-choice]').forEach((button,i)=>{button.disabled=true;button.setAttribute('aria-pressed',String(i===chosen));button.classList.toggle('quiz-correct',quiz.options[i].count===quiz.topCount);button.classList.toggle('quiz-wrong',quiz.options[i].count!==quiz.topCount);});
  const result=stage.querySelector('.story-quiz-feedback');const winner=quiz.options.find(row=>row.count===quiz.topCount);
  result.textContent=(correct?'You got it! ':'Good guess! ')+(quiz.tied?'There’s a tie for first. ':winner.name+' is your top '+quiz.kind+'. ')+number(quiz.topCount)+' '+(quiz.topCount===1?'score':'scores')+' in your 2026 selection.';
  next.textContent='See my '+quiz.kind+'s →';pauseLabel();
 }
 function pauseLabel(){const waiting=slides[index].quiz&&!answers.has(index);pause.disabled=Boolean(waiting);pause.textContent=waiting?'Your turn':paused?'Play ▷':'Pause Ⅱ';pause.setAttribute('aria-label',waiting?'Choose an answer or skip':paused?'Play experience':'Pause experience');}
 function toggle(){if(closing)return;paused=!paused;last=performance.now();pauseLabel();syncPreview();}
 const keyboard=event=>{if(closing){event.preventDefault();return;}if(event.target.closest('input,textarea'))return;if(event.code==='Space' && event.target.closest('button,a'))return;if(event.key==='ArrowRight'){event.preventDefault();advance();}if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.code==='Space'){event.preventDefault();toggle();}};
 function closeExperience(afterClose){
  if(closing)return;closing=true;paused=true;cancelAnimationFrame(raf);introMotion.forEach(animation=>animation.pause());
  for(const audio of new Set([previewAudio,openingAudio,ambientAudio,...previewFades.keys()]))if(audio)fadePreview(audio,0,400);
  stampAudio.pause();quizAudio?.pause();closeAudio.muted=muted;closeAudio.volume=.65;closeAudio.currentTime=0;
  dialog.classList.add('story-closing');dialog.querySelectorAll('button').forEach(button=>button.disabled=true);
  const finish=()=>{if(!dialog.open)return;closeAudio.pause();dialog.close();afterClose?.();};
  const animation=shell.animate([{opacity:1,transform:'scale(1)'},{opacity:.75,transform:'scale(.99)',offset:.35},{opacity:0,transform:'scale(.96)'}],{duration:2847,easing:'ease-in-out',fill:'forwards'});
  closeAudio.play().catch(()=>{});animation.finished.then(finish,finish);
 }
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeExperience();});
 dialog.addEventListener('keydown',keyboard);
 const mute=dialog.querySelector('[data-story-mute]');
 mute.onclick=()=>{muted=!muted;for(const audio of new Set([previewAudio,openingAudio,ambientAudio,stampAudio,quizAudio,closeAudio,...previewFades.keys()]))if(audio)audio.muted=muted;mute.title=muted?'Unmute audio':'Mute audio';mute.setAttribute('aria-pressed',String(muted));mute.setAttribute('aria-label',muted?'Unmute slide audio':'Mute slide audio');};
 dialog.querySelector('[data-story-close]').onclick=()=>closeExperience();pause.onclick=toggle;
 dialog.querySelector('[data-story-prev]').onclick=()=>show(index-1);next.onclick=advance;
 dialog.querySelectorAll('[data-story-step]').forEach(button=>button.onclick=()=>show(Number(button.dataset.storyStep)));
 stage.addEventListener('pointerdown',event=>{if(!event.target.closest('button,a'))touchX=event.clientX;});
 stage.addEventListener('pointerup',event=>{if(touchX==null)return;const delta=event.clientX-touchX;touchX=null;if(Math.abs(delta)>45){delta<0?advance():show(index-1);}});
 stage.addEventListener('pointercancel',()=>{touchX=null;});
 function tick(now){const dt=now-last;last=now;
  if(introActive&&!paused&&!document.hidden){const time=(previewAudio?.currentTime||0)*1000;introMotion.forEach(animation=>animation.currentTime=time);if(time>=introEnd||previewAudio?.error){introActive=false;shell.querySelector('.story-intro')?.remove();introMotion.forEach(animation=>animation.cancel());introMotion=[];elapsed=0;}}
  if(!introActive&&!paused&&!document.hidden&&(!slides[index].quiz||answers.has(index))){elapsed+=Math.min(dt,200);progress[index].value=Math.min(1000,elapsed/slides[index].duration*1000);if(elapsed>=slides[index].duration){if(index===slides.length-1){elapsed=slides[index].duration;}else show(index+1);}}
  if(!reduced)for(const {el,value} of counters)el.textContent=number(Math.round(value*(paused?1:Math.min(1,elapsed/1100))));
  const gradeReady=reduced||paused||elapsed>=1100;
  if(ppGrade&&gradeReady&&!stampPlayed){stampPlayed=true;stampAudio.play().catch(()=>{});}
  ppGrade?.classList.toggle('story-grade-revealed',gradeReady);
  raf=requestAnimationFrame(tick);
 }
 const focusBefore=document.activeElement;const overflowBefore=document.body.style.overflow;
 dialog.addEventListener('close',()=>{cancelAnimationFrame(raf);closeAudio.pause();stageSize.disconnect();introMotion.forEach(animation=>animation.cancel());if(previewAudio)fadePreview(previewAudio,0);previewAudio=null;document.removeEventListener("visibilitychange",visibilityChanged);stampAudio.pause();quizAudio?.pause();quizAudio=null;document.body.style.overflow=overflowBefore;dialog.remove();if(focusBefore?.isConnected)focusBefore.focus();},{once:true});
 dialog.showModal();document.body.style.overflow='hidden';show(0);stage.tabIndex=0;stage.focus();pauseLabel();raf=requestAnimationFrame(tick);
}

function storyCover(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='assets.ppy.sh'?url.href:'';}catch{return '';}}
function storyDate(value){const date=new Date(value);if(!value||Number.isNaN(date.getTime()))return 'Date unavailable';return 'Set <time datetime="'+date.toISOString()+'">'+new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date)+'</time> · UTC';}
function storyGrade(rank){const label=({X:'SS',XH:'SS',SSH:'SS',SH:'S'})[rank]||rank||'—';const color=({X:'gold',SS:'gold',S:'gold',XH:'silver',SSH:'silver',SH:'silver',A:'green',B:'blue',C:'purple',D:'red'})[rank]||'silver';return '<span class="story-score-grade story-grade-'+color+'" aria-label="Grade '+escape(label)+'">'+escape(label)+'</span>';}

function storyPlays(scores){
 return '<ol class="story-plays">'+scores.slice(0,5).map((score,i)=>{
  const cover=storyCover(score.cover);
  return '<li><span class="story-place">0'+(i+1)+'</span><span class="story-map-thumb">'+(cover?'<img src="'+escape(cover)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>':'')+storyGrade(score.rank)+'</span><div class="story-map-info"><b>'+escape(score.title)+'</b><span>'+escape(score.artist)+' · <span class="story-map-mods">'+escape(score.mods||'NM')+'</span></span><span>'+escape(score.version||'Unknown difficulty')+' · Mapped by '+escape(score.creator)+'</span></div><div class="story-map-result"><strong class="story-map-pp">'+number(Math.round(score.pp))+' <small>pp</small></strong><span class="story-map-date">'+storyDate(score.date)+'</span></div></li>';
 }).join('')+'</ol>';
}

function storyMapperAvatar(mapper){return '<span class="story-mapper-avatar" aria-hidden="true">'+escape([...mapper.name][0]||'?')+(Number.isSafeInteger(mapper.userId)&&mapper.userId>0?'<img src="https://a.ppy.sh/'+mapper.userId+'" alt="" width="40" height="40" decoding="async" referrerpolicy="no-referrer"/>':'')+'</span>';}

export function quizOptions(rows,random=Math.random){
 const unique=[...new Map(rows.filter(row=>row?.name&&Number.isFinite(row.count)).map(row=>[row.name,row])).values()].sort((a,b)=>b.count-a.count);
 if(unique.length<2)return [];
 const shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
 return shuffle([unique[0],...shuffle(unique.slice(1)).slice(0,3)]);
}
function makeQuiz(rows,kind){
 const options=quizOptions(rows);if(!options.length)return null;
 const topCount=Math.max(...options.map(row=>row.count)),tied=rows.filter(row=>row.count===topCount).length>1;
 return {theme:kind==='mapper'?'lime':'lavender',eyebrow:'BEFORE THE REVEAL · TAKE A GUESS',title:'Who was your<br>top '+kind+'?',duration:3200,quiz:{kind,options,topCount,tied},
 body:'<p class="story-quiz-prompt">Who appears most in your 2026 score selection?'+(tied?' There’s a tie - any first-place answer counts.':'')+'</p><div class="story-quiz-options">'+options.map((row,i)=>'<button type="button" data-quiz-choice="'+i+'" aria-pressed="false"><span>'+String.fromCharCode(65+i)+'</span><b>'+escape(row.name)+'</b></button>').join('')+'</div><p class="story-quiz-feedback" role="status" aria-live="polite">Take your time. The story waits for you.</p>',note:'Based on 2026 scores in your current top 200 · choose an answer or skip to the rankings.'};
}

function storyPreview(score){if(!score)return null;try{const url=new URL(score.previewUrl||"", "https://b.ppy.sh");if(url.protocol==="https:"&&url.hostname==="b.ppy.sh"&&/^\/preview\/\d+\.mp3$/.test(url.pathname)&&!url.username&&!url.password&&!url.port)return url.origin+url.pathname;}catch{}const id=storyCover(score.cover)?.match(/\/beatmaps\/(\d+)\//)?.[1];return id?"https://b.ppy.sh/preview/"+id+".mp3":null;}

function storyUserAvatar(user){let source=null;try{const url=new URL(user.avatar);if(url.protocol==="https:"&&url.hostname==="a.ppy.sh"&&!url.username&&!url.password&&!url.port)source=url.href;}catch{}if(!source&&Number.isSafeInteger(user.id)&&user.id>0)source="https://a.ppy.sh/"+user.id;return '<span class="story-user-avatar" aria-hidden="true"><span>'+escape([...user.username][0]||'?')+'</span>'+(source?'<img src="'+escape(source)+'" alt="" decoding="async" referrerpolicy="no-referrer"/>':'')+'</span>';}

function storyArtistAvatar(artist){return '<span class="story-mapper-avatar story-artist-avatar" aria-hidden="true">'+escape([...artist.name][0]||'?')+'<img src="/api/osu-wrapped/artist-image?name='+encodeURIComponent(artist.name)+'" alt="" width="40" height="40" referrerpolicy="no-referrer"/></span>';}
