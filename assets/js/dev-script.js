// Matrix background animation
class MatrixAnimation {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.paused = false;
        this.frame = null;
        this.lastFrame = 0;
        this.toggle = document.getElementById('matrix-pause');
        this.init();
        this.animate();
        this.toggle?.addEventListener('click', () => this.setPaused(!this.paused));
        document.fonts?.ready.then(() => this.alignControl());
        
        // Handle window resize
        window.addEventListener('resize', () => this.init());
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
        this.alignControl();
    }
    
    alignControl() {
        const home = document.querySelector('.navbar a[href="/"]');
        if (home && this.toggle) {
            const bounds = home.getBoundingClientRect();
            this.toggle.style.left = (bounds.left + bounds.width / 2) + 'px';
        }
    }

    setPaused(paused) {
        this.paused = paused;
        cancelAnimationFrame(this.frame);
        this.frame = null;
        if (this.toggle) {
            const label = paused ? 'Resume background' : 'Pause background';
            this.toggle.setAttribute('aria-label', label);
            this.toggle.title = label;
            this.toggle.setAttribute('aria-pressed', String(paused));
        }
        if (!paused) { this.lastFrame = 0; this.animate(); }
    }

    animate(now = 0) {
        if (this.paused) return;
        this.frame = requestAnimationFrame(time => this.animate(time));
        if (now - this.lastFrame < 1000 / 30) return;
        this.lastFrame = now;
        // Semi-transparent black background for fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Green text
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = `${this.fontSize}px 'Fira Code', monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters[Math.floor(Math.random() * this.characters.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            this.ctx.fillText(text, x, y);
            
            // Reset drop to top randomly
            if (y > this.canvas.height && Math.random() > 0.99) {
                this.drops[i] = 0;
            }
            
            this.drops[i] += 0.6;
        }
        

    }
}

// Initialize matrix animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MatrixAnimation();
    
    // Add staggered fade-in animation to elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add typing effect to profile name
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        const originalText = profileName.textContent;
        profileName.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                profileName.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }
    
    // Add glitch effect to section title
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        setInterval(() => {
            if (Math.random() > 0.95) {
                sectionTitle.style.textShadow = '2px 0 #ff0000, -2px 0 #00ffff';
                setTimeout(() => {
                    sectionTitle.style.textShadow = '0 0 15px rgba(0, 255, 0, 0.5)';
                }, 100);
            }
        }, 2000);
    }
    
    // Add hover sound effect simulation (visual feedback)
    const interactiveElements = document.querySelectorAll('.social-link, .project-link, .nav-btn');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.textShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.textShadow = '';
        });
    });
    
});

// Console easter egg
console.log(`
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║     Welcome to the Developer Page    ║
    ║                                      ║
    ║     > Initializing matrix...         ║
    ║     > Loading profile data...        ║
    ║     > Connecting to GitHub...        ║
    ║     > System ready.                  ║
    ║                                      ║
    ║     Type 'help()' for commands       ║
    ║                                      ║
    ╚══════════════════════════════════════╝
`);

// Console commands
window.help = () => {
    console.log(`
Available commands:
- matrix.stop() - Stop matrix animation
- matrix.start() - Start matrix animation
- glitch() - Trigger glitch effect
- konami() - Enter konami code
    `);
};

window.matrix = {
    stop: () => {
        document.getElementById('matrix-canvas').style.display = 'none';
        console.log('Matrix animation stopped');
    },
    start: () => {
        document.getElementById('matrix-canvas').style.display = 'block';
        console.log('Matrix animation started');
    }
};

window.glitch = () => {
    const elements = document.querySelectorAll('h1, h2, h3');
    elements.forEach(el => {
        el.style.animation = 'glitch 0.5s ease-in-out';
        setTimeout(() => {
            el.style.animation = '';
        }, 500);
    });
};

// Add glitch keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }
`;
document.head.appendChild(style);
// Keep manual navigation and autoplay on the same seamless ticker timeline.
{
 const display=document.querySelector('.tech-display');
 const track=display?.querySelector('.tech-track');
 const row=track?.querySelector('.tech-grid');
 const toggle=document.querySelector('.tech-scroll-toggle');
 if(row&&toggle){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const duplicate=row.cloneNode(true);duplicate.setAttribute('aria-hidden','true');track.append(duplicate);
  let motion=null,duration=0,hovered=false,navigation=null;
  const sync=()=>{
   const paused=display.classList.contains('tech-scroll-paused');
   toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Resume scrolling':'Pause scrolling';
   if(motion){if(navigation||paused||hovered||display.contains(document.activeElement)||document.hidden)motion.pause();else motion.play();}
  };
  const setup=()=>{
   if(navigation){cancelAnimationFrame(navigation);navigation=null;}
   const progress=duration&&motion?Number(motion.currentTime||0)%duration/duration:0;
   motion?.cancel();motion=null;
   if(!reduced.matches&&row.offsetWidth){
    duration=row.offsetWidth/32*1000;
    motion=track.animate([{transform:'translateX(0)'},{transform:'translateX(-'+row.offsetWidth+'px)'}],{duration,iterations:Infinity,easing:'linear'});
    motion.currentTime=progress*duration;sync();
   }
  };
  const navigate=direction=>{
   if(navigation)return;
   const tags=[...row.children],cycle=row.offsetWidth;
   if(!cycle||!tags.length)return;
   const origin=row.getBoundingClientRect().left;
   const offsets=tags.map(tag=>tag.getBoundingClientRect().left-origin);
   const current=reduced.matches?display.scrollLeft:((Number(motion?.currentTime||0)/1000*32)%cycle+cycle)%cycle;
   const target=direction>0?(offsets.find(offset=>offset>current+1)??cycle):([...offsets].reverse().find(offset=>offset<current-1)??offsets.at(-1)-cycle);
   if(reduced.matches){display.scrollTo({left:Math.max(0,target),behavior:'instant'});return;}
   if(!motion)return;
   motion.pause();
   const start=performance.now(),distance=target-current;
   const step=now=>{
    const progress=Math.min(1,(now-start)/300),eased=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
    const position=current+distance*eased;
    motion.currentTime=((position%cycle+cycle)%cycle)/32*1000;
    if(progress<1)navigation=requestAnimationFrame(step);
    else{navigation=null;sync();}
   };
   navigation=requestAnimationFrame(step);
  };
  display.querySelector('.tech-scroll-prev').addEventListener('click',()=>navigate(-1));
  display.querySelector('.tech-scroll-next').addEventListener('click',()=>navigate(1));
  display.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();navigate(event.key==='ArrowLeft'?-1:1);}});
  toggle.addEventListener('click',()=>{display.classList.toggle('tech-scroll-paused');sync();});
  display.addEventListener('mouseenter',()=>{hovered=true;sync();});
  display.addEventListener('mouseleave',()=>{hovered=false;sync();});
  display.addEventListener('focusin',sync);
  display.addEventListener('focusout',()=>queueMicrotask(sync));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',setup);
  new ResizeObserver(setup).observe(row);
  setup();
 }
}
