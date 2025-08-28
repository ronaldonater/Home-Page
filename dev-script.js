// Matrix background animation
class MatrixAnimation {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.init();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.init());
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }
    
    animate() {
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
            
            this.drops[i] += 0.5;
        }
        
        requestAnimationFrame(() => this.animate());
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