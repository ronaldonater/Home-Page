const songCoversData =[
    {
        url: "https://www.youtube.com/embed/KfpwzmEuAL4",
        title: "\"This December\" - Ricky Montgomery",
        date: "Dec 22, 2025",
        views: "Recently Uploaded!"
    },
    {
        url: "https://www.youtube.com/embed/1CQ3mMtB6Ec",
        title: "\"Honey\" - Big Time Rush",
        date: "Aug 9, 2022",
        views: "2.2K views"
    },
    {
        url: "https://www.youtube.com/embed/8FE7TDufSoc",
        title: "\"Nobody Can Save Me\" - Linkin Park",
        date: "Jan 22, 2021",
        views: "2.1K views"
    }
];

const COVERS_PER_PAGE = 2;
let currentCoverPage = 1;

// Concert data
const concertData = [
    {
        title: "Ricky Montgomery - \"Montgomery Ricky\" 10 Year Anniversary Tour",
        venue: "Brooklyn Steel, New York",
        date: "March 28th, 2026",
        stars: "★★★★★",
        score: "5/5"
    },
    {
        title: "Big Time Rush - Forever Tour",
        venue: "Madison Square Garden, New York",
        date: "June 30, 2022",
        stars: "★★★★★",
        score: "5/5"
    },
    {
        title: "PURPLE KISS - A Violet to Remember",
        venue: "Queens Theatre, New York",
        date: "October 10, 2025",
        stars: "★★★★★",
        score: "5/5"
    },
    {
        title: "LE SSERAFIM - Flame Rises",
        venue: "Prudential Center, New Jersey",
        date: "September 3, 2025",
        stars: "★★★★★",
        score: "5/5"
    },
    {
        title: "Linkin Park - From Zero",
        venue: "Barclays Center, New York",
        date: "September 16, 2024",
        stars: "★★★★☆",
        score: "4/5"
    },
    {
        title: "KISS OF LIFE - Kiss Road",
        venue: "Hammerstein Ballroom, New York",
        date: "November 22, 2024",
        stars: "★★★★☆",
        score: "4/5"
    },
    {
        title: "BABYMETAL & Dethklok - BABYKLOK Tour",
        venue: "Hammerstein Ballroom, New York",
        date: "September 15, 2023",
        stars: "★★★★☆",
        score: "4/5"
    },
    {
        title: "TWICE - This Is For World Tour",
        venue: "UBS Arena, New York",
        date: "February 20, 2026",
        stars: "★★★★☆",
        score: "4/5"
    },
    {
        title: "BABYMETAL - BABYMETAL World Tour 2024",
        venue: "Terminal 5, New York",
        date: "November 18, 2024",
        stars: "★★★★☆",
        score: "4/5"
    },
    {
        title: "Big Time Rush",
        venue: "Hammerstein Ballroom, New York",
        date: "December 18, 2021",
        stars: "★★★★☆",
        score: "4/5"
    },
    {
        title: "ITZY - 2nd World Tour 'Born To Be'",
        venue: "Prudential Center, New Jersey",
        date: "June 23, 2024",
        stars: "★★★☆☆",
        score: "3/5"
    }
];

const CONCERTS_PER_PAGE = 6;
let currentPage = 1;

// Social page animations and interactions
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Add hover effects to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(-3px) scale(1)';
        });
    });
    
    // Add click animations to content boxes
    const contentBoxes = document.querySelectorAll('.content-box');
    contentBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            // Don't trigger if clicking on a button or any element inside a pagination control
            if (e.target.closest('.pagination-btn') || e.target.classList.contains('view-more-btn')) return;
            
            box.style.transform = 'scale(0.98)';
            setTimeout(() => {
                box.style.transform = '';
            }, 100);
        });
    });
    
    // Add sparkle effect on hover for interest tags
    const interestTags = document.querySelectorAll('.interest-tag, .hobby-tag');
    interestTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            createSparkle(tag);
        });
    });
    
    // Sparkle effect function
    function createSparkle(element) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#a855f7';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
        
        document.body.appendChild(sparkle);
        
        // Animate sparkle
        sparkle.animate([
            { transform: 'scale(0) rotate(0deg)', opacity: 1 },
            { transform: 'scale(1) rotate(180deg)', opacity: 1 },
            { transform: 'scale(0) rotate(360deg)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            sparkle.remove();
        };
    }
    
    // Initialize paginations
    initializeConcertPagination();
    initializeCoversPagination();

    function initializeCoversPagination() {
        const coversList = document.getElementById('coversList');
        const prevCoverBtn = document.getElementById('prevCoverBtn');
        const nextCoverBtn = document.getElementById('nextCoverBtn');
        const coverPageNumber = document.getElementById('coverPageNumber');
        const coverItemCount = document.getElementById('coverItemCount');

        function renderCovers() {
            coversList.innerHTML = '';
            const totalPages = Math.ceil(songCoversData.length / COVERS_PER_PAGE);
            const startIdx = (currentCoverPage - 1) * COVERS_PER_PAGE;
            const endIdx = startIdx + COVERS_PER_PAGE;
            const covers = songCoversData.slice(startIdx, endIdx);

            covers.forEach((cover, idx) => {
                const coverItem = document.createElement('div');
                coverItem.className = 'cover-item';
                coverItem.style.opacity = '0';
                coverItem.style.transform = 'translateY(10px)';

                coverItem.innerHTML = `
                    <div class="youtube-embed">
                        <iframe src="${cover.url}" 
                                title="${cover.title.replace(/"/g, '&quot;')}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowfullscreen>
                        </iframe>
                    </div>
                    <div class="cover-info">
                        <h4>${cover.title}</h4>
                        <p>${cover.date}</p>
                    </div>
                    <div class="cover-stats">
                        <span class="views">${cover.views}</span>
                    </div>
                `;

                coversList.appendChild(coverItem);

                // Re-use staggered fade-in animation
                setTimeout(() => {
                    coverItem.style.transition = 'all 0.4s ease';
                    coverItem.style.opacity = '1';
                    coverItem.style.transform = 'translateY(0)';
                }, idx * 50);
            });

            // Update pagination info
            coverPageNumber.textContent = `Page ${currentCoverPage} of ${totalPages}`;
            coverItemCount.textContent = `Showing ${startIdx + 1}-${Math.min(endIdx, songCoversData.length)} of ${songCoversData.length}`;

            // Update button states
            prevCoverBtn.disabled = currentCoverPage === 1;
            nextCoverBtn.disabled = currentCoverPage === totalPages;
        }

        prevCoverBtn.addEventListener('click', () => {
            if (currentCoverPage > 1) {
                currentCoverPage--;
                renderCovers();
                coversList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        nextCoverBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(songCoversData.length / COVERS_PER_PAGE);
            if (currentCoverPage < totalPages) {
                currentCoverPage++;
                renderCovers();
                coversList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        renderCovers();
    }

    function initializeConcertPagination() {
        const concertList = document.getElementById('concertList');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageNumber = document.getElementById('pageNumber');
        const itemCount = document.getElementById('itemCount');

        function renderConcerts() {
            concertList.innerHTML = '';
            const totalPages = Math.ceil(concertData.length / CONCERTS_PER_PAGE);
            const startIdx = (currentPage - 1) * CONCERTS_PER_PAGE;
            const endIdx = startIdx + CONCERTS_PER_PAGE;
            const concerts = concertData.slice(startIdx, endIdx);

            concerts.forEach((concert, idx) => {
                const concertItem = document.createElement('div');
                concertItem.className = 'concert-item';
                concertItem.style.opacity = '0';
                concertItem.style.transform = 'translateY(10px)';

                concertItem.innerHTML = `
                    <div class="concert-info">
                        <h4>${concert.title}</h4>
                        <div class="venue">${concert.venue}</div>
                        <div class="date">${concert.date}</div>
                    </div>
                    <div class="rating">
                        <span class="stars">${concert.stars}</span>
                        <span class="score">${concert.score}</span>
                    </div>
                `;

                concertList.appendChild(concertItem);

                setTimeout(() => {
                    concertItem.style.transition = 'all 0.4s ease';
                    concertItem.style.opacity = '1';
                    concertItem.style.transform = 'translateY(0)';
                }, idx * 50);
            });

            pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;
            itemCount.textContent = `Showing ${startIdx + 1}-${Math.min(endIdx, concertData.length)} of ${concertData.length}`;

            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderConcerts();
                concertList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(concertData.length / CONCERTS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderConcerts();
                concertList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        renderConcerts();
    }

    // Add parallax effect to sakura petals based on mouse movement
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
        
        const petals = document.querySelectorAll('.sakura-petal');
        petals.forEach((petal, index) => {
            const speed = (index + 1) * 0.02;
            const x = (mouseX - 50) * speed;
            const y = (mouseY - 50) * speed;
            
            petal.style.transform += ` translate(${x}px, ${y}px)`;
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all content boxes
    contentBoxes.forEach(box => {
        observer.observe(box);
    });
});

// Console easter egg
console.log(`
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║        Welcome to Social Page        ║
    ║                                      ║
    ║     🌸 Sakura petals falling...     ║
    ║     🎵 Music vibes loading...       ║
    ║     🎮 Gaming stats ready...        ║
    ║     ✨ Social links active...       ║
    ║                                      ║
    ║     Type 'sakura.stop()' to pause   ║
    ║     Type 'sparkle()' for magic      ║
    ║                                      ║
    ╚══════════════════════════════════════╝
`);

// Console commands
window.sakura = {
    stop: () => {
        const petals = document.querySelectorAll('.sakura-petal');
        petals.forEach(petal => {
            petal.style.animationPlayState = 'paused';
        });
        console.log('🌸 Sakura animation paused');
    },
    start: () => {
        const petals = document.querySelectorAll('.sakura-petal');
        petals.forEach(petal => {
            petal.style.animationPlayState = 'running';
        });
        console.log('🌸 Sakura animation resumed');
    }
};

window.sparkle = () => {
    const tags = document.querySelectorAll('.interest-tag, .hobby-tag');
    tags.forEach((tag, index) => {
        setTimeout(() => {
            const event = new Event('mouseenter');
            tag.dispatchEvent(event);
        }, index * 100);
    });
    console.log('✨ Sparkle effect triggered!');
};