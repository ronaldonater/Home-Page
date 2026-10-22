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

• Early Entry + Merch Access

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

• Early Entry + Merch Access

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
        review: `Seeing PURPLE KISS live for the first time was incredibly special, but it’s a shame knowing it would also be my last. With their parent company announcing the group's disbandment, "A Violet to Remember" served as their official farewell tour.

I had tried to catch them the year prior, but they unfortunately didn't have a NY/NJ stop on that run. Ultimately, I'm just grateful I got to see them perform together at least once.

**The "Everything" VIP Experience**

Knowing this was my one and only chance to see the group, I had to go all out. I grabbed the "Everything" ticket, which was remarkably well-priced at $250 considering the massive list of perks included:

• Early Entry + Merch Access

• Fan-sign

• Group Photo

• Soundcheck Access

• Hi-Touch

• You+ Photo

• Selfies with all the members

A huge shoutout to the tour organizers, Leo Presents, for putting together such a stacked package!

**Intimate Setting, Incredible Performance**

As for the performance itself, PURPLE KISS absolutely killed it. Their live vocals were incredible, matched only by their top-tier dancing. The segments between songs were super fun and wholesome, carrying an extra layer of emotion given the context of the tour.

The venue was actually the smallest I've ever been in for a concert, comparable in size to a school auditorium. Honestly, that made it even better. It created a beautifully intimate setting for one of their final shows together.

**The Final Send-Off**

It's a shame we'll never get to see them perform together again, especially knowing some members have completely left the industry to pursue their own paths (like Dosie, who now works an office job for a clothing brand). If PURPLE KISS were still around, I definitely would have attended more of their shows. But at the very least, they got the proper send-off they deserved, unlike so many other groups who just disappear out of the blue.`, // Add your written review here.
        score: "5/5"
    },
    {
        title: "LE SSERAFIM - Flame Rises",
        thirdPartyFootage: true,
        venue: "Prudential Center, New Jersey",
        date: "September 3, 2025",
        stars: "★★★★★",
        videoUrl: "https://www.youtube.com/watch?v=HXOIDhbS2Hs",
        review: `This was LE SSERAFIM's first-ever concert tour in the U.S., and it couldn't have gone any better!

Heading into this concert, there was a lot of online discussion critiquing their live vocal abilities (mainly surrounding Kazuha, Sakura, and Eunchae). I have to admit, even putting my bias for the group aside, I was a little wary of this heading into the show. However, I was undoubtedly proven wrong. They sounded amazing! On top of their live vocals, their energy was absolutely contagious and stayed through the roof the entire night.

**The Verdict**

This was such an incredibly fun concert. I think it speaks volumes that this is my only 5-star rated K-Pop concert that doesn't involve having VIP perks as well. I would definitely recommend seeing them at least once, even if you're just a casual fan. You will absolutely fall in love with the members, and hopefully, their music as well!`, // Add your written review here.
        score: "5/5"
    },
    {
        title: "Linkin Park - From Zero",
        venue: "Barclays Center, New York",
        date: "September 16, 2024",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=qQj0Zle_WQk",
        review: `This was Linkin Park's first set of shows returning from hiatus with new vocalist Emily Armstrong and new drummer Colin Brittain. I was lucky enough to attend the New York stop, and I managed to go for free, though that's a story for another time.

Linkin Park is one of my all-time favorite bands. Unfortunately, I never got the opportunity to see them perform with Chester Bennington or Rob Bourdon. Despite that, I've remained fiercely loyal to the group. I didn't align with the crowds pushing back against the new direction, claiming they didn't like female vocalists or that Emily was trying to "replace" Chester.

**Tempered Expectations and a Euphoric Reality**

With absolutely no offense to Emily, I headed into this show with tempered expectations for her vocals. She was brand new to the lineup and had the monumental task of taking legacy songs and adjusting them to her own style and tone. I didn't expect her to be comfortable straight away, and that initial adjustment period showed a bit on their reveal stream. Looking back on this tour now, she has definitely found her stride and settled into the band perfectly. They’ve figured out exactly which classic tracks work for her, which ones don’t, and how to tailor the arrangements to her strengths.

Regardless of those early expectations, her live vocals that night were incredibly powerful. It was a deeply euphoric experience to finally see one of my favorite bands perform in person. Mike Shinoda hasn't lost a single step, either. He has stayed so active as a solo artist and through collaborations, and he’s still killing the game. He knows exactly how to command a crowd, and when you pair that veteran stage presence with Emily's fierce vocals, it is a perfect recipe.

Colin was great too. I was actually familiar with him beforehand since he worked with Logan Henderson (a member of another one of my all-time favorite bands, Big Time Rush) as a composer, writer, and producer during his solo career. I wasn't even aware he was a drummer, let alone how incredible he is at it!

**Top-Tier Production and a Standout Moment**

The presentation for the show was incredible, featuring atmospheric interludes and slick transitions between sections of the set, along with awesome laser and lighting effects on display throughout the night.

Still, the peak moment belongs to Emily's performance of "Waiting for the End." It was hands down one of the most beautiful things I've witnessed live. She delivers it with such raw emotion that it becomes the defining, euphoric highlight of the show, even tearing up toward the outro. She is a fan just like the rest of us, and you can tell how deeply the music resonates with her. Honestly, I'll even go as far as saying I prefer Emily's live performance of that song over Chester's.

**The Verdict**

Overall, I had an absolute blast singing my heart out to every single song all night long. While this specific show was already amazing, I have no doubt that the next time I see Linkin Park, especially now that Emily is fully settled into her role, it will easily earn that perfect 5-star rating.`, // Add your written review here.
        score: "4/5"
    },
    {
        title: "KISS OF LIFE - Kiss Road",
        venue: "Hammerstein Ballroom, New York",
        date: "November 22, 2024",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=Ftc2_cfc-kI",
        review: `KISS OF LIFE is currently my ultimate bias group in K-Pop. I've been following them quite literally since their debut, and it's crazy how consistently they continue to put out great music. Considering my emotional attachment to them, I just knew I had to try to get front row to see them; despite the fact that I've never actually gotten front row for a show before.

Thanks to some advice from a friend with experience camping for K-Pop concerts, I was able to achieve my dream and experience them from the barricade!

**The VIP Group Photo Experience**

In addition to camping out, I bought the highest VIP tier. This package allowed you to take a group photo with the members alongside a few other fans. It also included everything from the standard VIP tiers:

• Soundcheck Access

• Tour Poster

• VIP Lanyard

• Early Entry + Merch Access

I'd say the highest tier was absolutely worth it because you got to meet the idols and commemorate the moment with two high-quality pictures. It honestly didn't take that long to receive them, it took about a month, and you just had to scan the QR code on the back of your VIP lanyard to get redirected to the photo gallery for your specific show.

**Live Vocals and Encore Interactions**

In terms of the performance, their live vocals were great. Belle, especially, stood out. She truly is the Ariana Grande of K-Pop, just like everyone says! Their dancing ability was also top-notch, and the little segments between songs were incredibly fun.

If I had one critique, I do wish there had been a live band; that definitely would have elevated the concert experience even further. I understand, though, that this was their very first tour and it's still pretty early in their career.

During the encore, I got some incredibly wholesome interactions with Natty (my bias) and Julie, which capped off the night even better than I could have imagined.

**The Verdict**

Overall, this was a fantastic first world tour. I only expect bigger and better things from KISS OF LIFE as their stock continues to rise!`, // Add your written review here.
        score: "4/5"
    },
    {
        title: "BABYMETAL & Dethklok - BABYKLOK Tour",
        venue: "Hammerstein Ballroom, New York",
        date: "September 15, 2023",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=1cAvptJ0qU0",
        review: `Just a heads up: this review is definitely going to be more BABYMETAL-focused, as that’s who I specifically came to see. Though, in all fairness, Dethklok was great, and it seemed like a majority of the crowd was actually there for them and left more than satisfied with their heavy-hitting performance.

As for BABYMETAL, they were absolutely amazing live! They bring exactly the kind of crazy, infectious energy you’d expect from them, and it felt completely surreal being able to see it all happen from practically the front row. However, if you're planning on getting that close, prepare for your body to be sore and knocked around due to the mosh pits. It's definitely not for the weak! Not to mention, Su-Metal's live vocals were stellar; she really holds her own amidst all that heavy instrumentation.

**The VIP Experience: Was It Worth It?**

For this tour, I bought the lowest tier of the BABYMETAL VIP packages, which cost me nearly $230. The package included:

• Priority Entry + Early Access to Merch

• A BABYMETAL tote bag

• A BABYMETAL bandana

• A VIP Lanyard

Honestly, the gifts were just okay. They definitely aren't the worst things in the world, but they felt pretty underwhelming for the price point. I haven't found any use for the items yet, and I especially don't see myself ever using the bandana. When you compare this to the incredible value of the VIP packages from NMIXX or PURPLE KISS, it definitely falls short on the merchandise front.

**The Verdict**

Overall, this show was incredibly fun, and getting to see BABYMETAL up close was an unforgettable experience. However, I’d definitely be wary of the VIP pricing if you plan on going to any of their future shows. If I recall correctly, their VIP tiers have only gotten more expensive over the years, so just make sure the specific perks are worth the investment for you before pulling the trigger.`, // Add your written review here.
        score: "4/5"
    },
    {
        title: "TWICE - This Is For World Tour",
        venue: "UBS Arena, New York",
        date: "February 20, 2026",
        stars: "★★★★☆",
        videoUrl: "https://www.youtube.com/watch?v=v8BsXEO7q9E",
        review: `
        To preface, I'm definitely a fan of TWICE, but over time, their releases have started to stand out a bit less to me compared to some of the new-generation groups. However, I consider TWICE a definitive part of the "Big 3" when it comes to modern K-Pop acts (right alongside BLACKPINK and BTS), so I felt like I had to attend at least one of their shows, it would just feel wrong not to.

The tickets were surprisingly reasonably priced considering their massive global status. Compared to a group like BLACKPINK, you don't have to give up an arm and a leg to go see TWICE, which is awesome for the fans.

**Missing Dubu & Unmatched Stage Production**

Unfortunately, Dahyun was absent from this show due to an ankle injury, which was a real shame. She brings so much character to their stages, so her absence was definitely felt.

Despite being down a member, the stage production for this show was evidently the best out of every K-Pop act I've ever gone to see, which completely makes sense for a group of their caliber. Their live band was incredible, and it made some of the lesser-recognized songs on the setlist stand out like crazy. A perfect example of this was "Gone." I already liked the studio version, but hearing the live band arrangement took it to a whole other level.

**Jihyo's Contagious Stage Presence**

I also have to specifically mention that Jihyo stood out the most to me. Her infectious energy throughout the whole show was impossible to ignore. She completely commands the stage and gives it 110% from the first song all the way to the encore, which really elevates the entire concert experience.

**The Verdict**

The concert was great! However, compared to almost every other show I've been to, I actually got the least "post-concert depression" from this one. I think that simply comes down to the fact that TWICE isn't one of my absolute ultimate groups, so the emotional attachment just wasn't as heavy. It had absolutely nothing to do with their performance- they were truly exceptional on stage. If you are a huge fan of theirs, you should definitely make it a point to go!
        `, // Add your written review here.
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
        const sparkle = document.createElement('span');
        sparkle.setAttribute('aria-hidden', 'true');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#a855f7';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        
        // Position inside the tag so scrolling and hover transforms move them together.
        sparkle.style.left = (Math.random() * Math.max(0, element.clientWidth - 4)) + 'px';
        sparkle.style.top = (Math.random() * Math.max(0, element.clientHeight - 4)) + 'px';
        
        element.appendChild(sparkle);
        
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
