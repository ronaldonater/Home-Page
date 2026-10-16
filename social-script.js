const songCoversData =[
    {
        url: "https://www.youtube.com/embed/KfpwzmEuAL4",
        title: "\"This December\" - Ricky Montgomery",
        date: "Dec 22, 2025",
        views: "641 views"
    },
    {
        url: "https://www.youtube.com/embed/1CQ3mMtB6Ec",
        title: "\"Honey\" - Big Time Rush",
        date: "Aug 9, 2022",
        views: "2.5K views"
    },
    {
        url: "https://www.youtube.com/embed/8FE7TDufSoc",
        title: "\"Nobody Can Save Me\" - Linkin Park",
        date: "Jan 22, 2021",
        views: "2.2K views"
    }
];

const COVERS_PER_PAGE = 2;
let currentCoverPage = 1;

async function refreshCoverViews(coversList) {
    try {
        const response = await fetch('/.netlify/functions/youtube-views', {
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!data.views || typeof data.views !== 'object') return;
        for (const cover of songCoversData) {
            const videoId = new URL(cover.url).pathname.split('/').pop();
            const count = data.views[videoId];
            if (typeof count !== 'string' || !/^\d+$/.test(count)) continue;
            const number = BigInt(count);
            cover.views = `${number.toLocaleString('en-US')} ${number === 1n ? 'view' : 'views'}`;
        }
        // Update only the labels, so playing videos are not reloaded.
        coversList.querySelectorAll('[data-video-id]').forEach(label => {
            const cover = songCoversData.find(item => item.url.endsWith('/' + label.dataset.videoId));
            if (cover) label.textContent = cover.views;
        });
    } catch {
        // Keep the existing counts when offline, unconfigured, or rate-limited.
    }
}

// Concert data
const concertData = [
    {
        title: "NMIXX - EPISODE 1: ZERO FRONTIER",
        venue: "Brooklyn Paramount, New York",
        date: "March 31st, 2026",
        stars: "★★★★★",
        videoUrl: "https://www.youtube.com/watch?v=cPn697Bu3IE",
        review: `This was the second concert I've ever camped out for, and it was so worth it! I went to this show with a friend from X/Twitter, and not only did we get the front row, but I also had a hilarious interaction with my bias, Lily. She reacted to a joke flag I made for her, and actually found it so funny that she talked about it on a [livestream](https://www.instagram.com/p/DeAl894OdEn/) the next day! What an absolute dream come true. I was on cloud nine for days just knowing I was memorable to one of my favorite idols. 😭

In terms of the show itself, it exceeded expectations. NMIXX is one of the best, if not the best, K-pop groups around when it comes to live vocals. Their "weakest" singer could easily be a main vocalist in her own right. Their choreography and energy were unmatched. There was one brief moment where Sullyoon unfortunately tripped on stage, but she recovered so gracefully it was like nothing happened and made sure to reassure everyone she was okay right after.

**Are the VIP Perks Worth It?**

I obviously had to get the highest tier of VIP, and the perks were genuinely unique and worth the price. The top tier included an autographed poster from all the members, plus everything from the standard VIP tiers:

• A tour-branded wireless charger

• A tour-branded pen and mini journal

• A tour-branded pouch bag

• An exclusive photocard set

• Soundcheck access

• The classic VIP lanyard

As far as VIP packages that don't involve meeting the members go, this easily takes the #1 spot. I actually find myself using the wireless charger and pen all the time!

**The Verdict**

Overall, I highly recommend catching their show if they come to your city. You won't regret it!`, // Add your written review here.
        score: "5/5"
    },
    {
        title: "Ricky Montgomery - \"Montgomery Ricky\" 10 Year Anniversary Tour",
        venue: "Brooklyn Steel, New York",
        date: "March 28th, 2026",
        stars: "★★★★★",
        videoUrl: "https://www.youtube.com/watch?v=QT86KgzxB8I",
        review: `I’ve known about Ricky Montgomery since the pandemic, but I only really took a deep dive into his discography a year prior to this show. It didn't take long for me to fall completely in love with his sound. So, when he announced a limited three-show run to celebrate his 10th anniversary, I knew I had to be there.

This turned out to be one of my all-time favorite shows. Ricky is an incredible live performer; his vocals, guitar playing, and energy are top-tier, but his fan service is what really sets him apart. You can tell he genuinely wants everyone in the room to feel included. He even brought a fan on stage to play acoustic guitar alongside him for a rendition of "Mr. Loverman."

**A Rare Setlist**

Since this was the 10th-anniversary celebration of his debut album, Montgomery Ricky, the setlist was a massive treat. He played every single song off the album, including the live debut of "Last Night"! We also got to hear an incredible unreleased track titled "Change."

My favorite unexpected moment was when he swapped out a song on the setlist for "Unknown Phantom." Someone on his team thought they saw a fan dressed in the costume from the music video. It ended up being a false alarm, but he played it anyway, making it the only time the song was performed on the entire tour.

**The VIP Experience: Intimate Soundcheck & Q&A**

I grabbed the highest VIP tier for this night, which included a soundcheck and a Q&A session. The soundcheck had a wonderfully intimate vibe; Ricky took requests and played two songs on his acoustic guitar, encouraging the crowd to sing along. Getting to ask him a direct question about how to get started with songwriting process during the Q&A was an absolute highlight for me.

The top VIP tier also included the standard VIP merchandise:

• A tour poster

• A tour-branded mini flag

• A star keychain

To be honest, these were probably my least favorite VIP items I've received. They don't offer much practical use compared to other packages, though I’m sure other fans loved them.

**The Verdict**

Overall, this night at Brooklyn Steel was completely unforgettable. I will absolutely be in the crowd the next time he comes around after his upcoming third album drops!
`, // Add your written review here.
        score: "5/5"
    },
    {
        title: "Big Time Rush - Forever Tour",
        venue: "Madison Square Garden, New York",
        date: "June 30, 2022",
        stars: "★★★★★",
        videoUrl: "https://www.youtube.com/watch?v=u8-_dt4uckc",
        review: `This was one of the earliest concerts I ever attended, and it set the bar incredibly high, in fact, it held the title of my all-time favorite show for five solid years!

Big Time Rush has an unbeatable stage presence, breaking up the setlist with fun, creative segments between songs. Their live vocals and signature harmonies are exactly as amazing as you’d hope, and they definitely still have the choreography down.

The atmosphere inside Madison Square Garden was electric. Playing to a sold-out MSG crowd is an incredible feat, especially considering they had been on hiatus and out of the limelight for so long. One of the most impactful moments happened during their track "Fall." Right after Logan sang the lyric, "Selling out The Garden-", the guys took a deliberate pause to embrace and take in the magnitude of the milestone before jumping right back into their high-energy performance.

The crowd interaction was next-level. During "Time of Our Life" and "Paralyzed," the members actually left the stage and went right into the audience. I was lucky enough to get close to Carlos during "Time of Our Life" and super close to Kendall during "Paralyzed", he practically pointed the mic right in my face at one point! (Check out the embedded video above to see exactly what I mean).

The surprises didn't end there. They brought out special guest Maffio to teach the crowd the basic choreography for "Dale Pa'Ya," which was an unreleased collaboration at the time. We all got to dance along as they performed it live for the very first time.

**The Verdict**

Overall, this was an unforgettable experience that hit every single box. Big Time Rush proved that night they are so much more than just a "Nickelodeon band."`, // Add your written review here.
        score: "5/5"
    },
    {
        title: "PURPLE KISS - A Violet to Remember",
        venue: "Queens Theatre, New York",
        date: "October 10, 2025",
        stars: "★★★★★",
        videoUrl: "https://www.youtube.com/watch?v=TU-OL9q_eYw",
        review: "", // Add your written review here.
        score: "5/5"
    },
    {
        title: "LE SSERAFIM - Flame Rises",
        thirdPartyFootage: true,
        venue: "Prudential Center, New Jersey",
        date: "September 3, 2025",
        stars: "★★★★★",
        videoUrl: "https://www.youtube.com/watch?v=HXOIDhbS2Hs",
        review: "", // Add your written review here.
        score: "5/5"
    },
    {
        title: "Linkin Park - From Zero",
        venue: "Barclays Center, New York",
        date: "September 16, 2024",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=qQj0Zle_WQk",
        review: "", // Add your written review here.
        score: "4/5"
    },
    {
        title: "KISS OF LIFE - Kiss Road",
        venue: "Hammerstein Ballroom, New York",
        date: "November 22, 2024",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=Ftc2_cfc-kI",
        review: "", // Add your written review here.
        score: "4/5"
    },
    {
        title: "BABYMETAL & Dethklok - BABYKLOK Tour",
        venue: "Hammerstein Ballroom, New York",
        date: "September 15, 2023",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=1cAvptJ0qU0",
        review: "", // Add your written review here.
        score: "4/5"
    },
    {
        title: "TWICE - This Is For World Tour",
        venue: "UBS Arena, New York",
        date: "February 20, 2026",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=v8BsXEO7q9E",
        review: "", // Add your written review here.
        score: "4/5"
    },
    {
        title: "BABYMETAL - BABYMETAL World Tour 2024",
        venue: "Terminal 5, New York",
        date: "November 18, 2024",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=659Xnb1tYt4",
        review: "", // Add your written review here.
        score: "4/5"
    },
    {
        title: "Big Time Rush",
        venue: "Hammerstein Ballroom, New York",
        date: "December 18, 2021",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=KXSfsf4z9b4",
        review: "", // Add your written review here.
        score: "4/5"
    },
    {
        title: "ITZY - 2nd World Tour 'Born To Be'",
        venue: "Prudential Center, New Jersey",
        date: "June 23, 2024",
        stars: "★★★☆☆",
        videoUrl: "https://www.youtube.com/watch?v=pBAgozuTa9g",
        review: "", // Add your written review here.
        score: "3/5"
    },
    {
        title: "Guns N' Roses' World Tour 2026",
        thirdPartyFootage: true,
        venue: "MetLife Stadium, New Jersey",
        date: "August 12, 2026",
        stars: "★★★☆☆",
        videoUrl: "https://www.youtube.com/watch?v=q3ic_sVqZeY",
        review: "", // Add your written review here.
        score: "3/5"
    }
];

const CONCERTS_PER_PAGE = 5;
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
            if (e.target.closest('button, a')) return;
            
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

        if (!coversList) return;

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
                        <span class="views" data-video-id="${new URL(cover.url).pathname.split('/').pop()}">${cover.views}</span>
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
        refreshCoverViews(coversList);
        setInterval(() => {
            if (!document.hidden) refreshCoverViews(coversList);
        }, 60 * 60 * 1000);
    }

    function initializeConcertPagination() {
        const concertList = document.getElementById('concertList');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageNumber = document.getElementById('pageNumber');
        const itemCount = document.getElementById('itemCount');

        if (!concertList) return;

        function renderConcerts() {
            concertList.innerHTML = '';
            const totalPages = Math.ceil(concertData.length / CONCERTS_PER_PAGE);
            const startIdx = (currentPage - 1) * CONCERTS_PER_PAGE;
            const endIdx = startIdx + CONCERTS_PER_PAGE;
            const concerts = concertData.slice(startIdx, endIdx);

            concerts.forEach((concert, idx) => {
                const concertItem = document.createElement('button');
                concertItem.type = 'button';
                concertItem.setAttribute('aria-haspopup', 'dialog');
                concertItem.setAttribute('aria-label', `Open footage and review: ${concert.title}`);
                concertItem.addEventListener('click', () => openConcertDetails(concert));
                concertItem.className = 'concert-item';
                concertItem.style.opacity = '0';
                concertItem.style.transform = 'translateY(10px)';

                concertItem.innerHTML = `
                    <span class="concert-info">
                        <strong class="concert-title">${concert.title}</strong>
                        <span class="venue">${concert.venue}</span>
                        <span class="date">${concert.date}</span>
                        <span class="concert-open-hint">Footage &amp; review →</span>
                    </span>
                    <span class="rating">
                        <span class="stars">${concert.stars}</span>
                        <span class="score">${concert.score}</span>
                    </span>
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
