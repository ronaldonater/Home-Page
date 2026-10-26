// Intentionally undisclosed UI: run secret() in the browser console.
export function installSecret({audioUrl='/sounds/wysi.mp3'}={}){
 let stop=null;
 function secret(){
  stop?.();
  const canvas=document.createElement('canvas');canvas.className='secret-727-rain';canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return;}
  const audio=new Audio(audioUrl);audio.volume=.7;
  const particles=[],colors=['#fa82b5','#8edcff','#ffd46b','#b7e58b','#ffffff'];
  // Rasterize emoji/text once; frame rendering only copies small cached sprites.
  const sprites=[];
  for(const text of ['🫵','727'])for(const color of (text==='🫵'?['#ffffff']:colors)){
   const sprite=document.createElement('canvas');sprite.width=100;sprite.height=64;
   const paint=sprite.getContext('2d');if(!paint)continue;
   paint.font='800 40px "Segoe UI",sans-serif';paint.textAlign='center';paint.textBaseline='middle';paint.fillStyle=color;paint.fillText(text,50,32);sprites.push(sprite);
  }
  let frame=0,last=0,spawn=0,ended=false,fadeTimer=0;
  const resize=()=>{const ratio=1;canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
  const cleanup=()=>{if(ended)return;ended=true;cancelAnimationFrame(frame);clearTimeout(timeout);clearTimeout(fadeTimer);audio.pause();audio.removeAttribute('src');audio.load();canvas.remove();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',hidden);document.removeEventListener('keydown',escape);if(stop===cleanup)stop=null;};
  const fade=()=>{if(ended||fadeTimer)return;canvas.classList.add('secret-727-fading');fadeTimer=setTimeout(cleanup,850);};
  const hidden=()=>{if(document.hidden)cleanup();};
  const escape=event=>{if(event.key==='Escape')cleanup();};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(time){
   if(last&&time-last<1000/30){frame=requestAnimationFrame(tick);return;}
   const dt=last?Math.min((time-last)/1000,.075):0;last=time;spawn+=dt;
   const interval=reduced?.3:.09,limit=reduced?12:40;
   if(spawn>=interval){spawn=0;if(particles.length<limit){const emoji=Math.random()<.5;particles.push({sprite:sprites[emoji?0:1+Math.floor(Math.random()*(sprites.length-1))],x:Math.random()*innerWidth,y:-60,scale:reduced?.7:.65+Math.random()*.35,speed:reduced?60:130+Math.random()*140});}}
   ctx.clearRect(0,0,innerWidth,innerHeight);
   for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.y+=p.speed*dt;if(p.y>innerHeight+64){particles.splice(i,1);continue;}ctx.drawImage(p.sprite,p.x-50*p.scale,p.y,100*p.scale,64*p.scale);}
   frame=requestAnimationFrame(tick);
  }
  const timeout=setTimeout(fade,30000);stop=cleanup;resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',hidden);document.addEventListener('keydown',escape);
  audio.addEventListener('ended',fade,{once:true});audio.addEventListener('error',cleanup,{once:true});
  audio.play().catch(()=>{cleanup();console.info('Click the page once, then run secret() again to allow audio.');});
  frame=requestAnimationFrame(tick);
  console.info('%cI told you not to. Now look what you did. 🫵 727 🫵', 'color:#ffd46b;font-size:14px;font-weight:bold;');
  return 'WYSI!';
 }
 Object.defineProperty(window,'secret',{configurable:true,value:secret});
 console.info('%cWhatever you do, DO NOT run "secret()".', 'color:#fa82b5;font-size:14px;font-weight:bold;');
}
