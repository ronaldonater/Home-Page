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
            // Don't trigger if clicking on a button
            if (e.target.classList.contains('view-more-btn')) return;
            
            box.style.transform = 'scale(0.98)';
            setTimeout(() => {
                box.style.transform = 'translateY(-5px)';
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
    
    // Add smooth scrolling for view more buttons
    const viewMoreBtns = document.querySelectorAll('.view-more-btn');
    viewMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add click animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'translateY(-2px)';
            }, 100);
            
            // Check if this is the concerts section
            const boxTitle = btn.closest('.content-box').querySelector('.box-title').textContent;
            if (boxTitle.includes('Concert List')) {
                expandConcertList(btn);
            } else {
                console.log('View more clicked for:', boxTitle);
            }
        });
    });
    
    // Function to expand concert list
    function expandConcertList(button) {
        const concertList = button.closest('.content-box').querySelector('.concert-list');
        
        // Additional concert data
        const additionalConcerts = [
            {
                title: "ITZY - 2nd World Tour 'Born To Be'",
                venue: "Prudential Center, New Jersey",
                date: "June 23, 2024",
                stars: "★★★☆☆",
                score: "3/5"
            }
        ];
        
        // Add fade-out animation to button
        button.style.transition = 'all 0.3s ease';
        button.style.opacity = '0';
        button.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            let addedConcerts = [];
            
            // Add new concert items with staggered animation
            additionalConcerts.forEach((concert, index) => {
                setTimeout(() => {
                    const concertItem = document.createElement('div');
                    concertItem.className = 'concert-item';
                    concertItem.classList.add('additional-concert');
                    concertItem.style.opacity = '0';
                    concertItem.style.transform = 'translateY(20px)';
                    
                    concertItem.innerHTML = `
                        <div class="concert-info">
                            <h4>${concert.title}</h4>
                            <p class="venue">${concert.venue}</p>
                            <p class="date">${concert.date}</p>
                        </div>
                        <div class="rating">
                            <span class="stars">${concert.stars}</span>
                            <span class="score">${concert.score}</span>
                        </div>
                    `;
                    
                    // Add hover effects to new items
                    concertItem.addEventListener('mouseenter', () => {
                        concertItem.style.background = 'rgba(168, 85, 247, 0.2)';
                        concertItem.style.transform = 'translateX(5px)';
                    });
                    
                    concertItem.addEventListener('mouseleave', () => {
                        concertItem.style.background = 'rgba(168, 85, 247, 0.1)';
                        concertItem.style.transform = 'translateX(0)';
                    });
                    
                    concertList.appendChild(concertItem);
                    addedConcerts.push(concertItem);
                    
                    // Animate in the new item
                    setTimeout(() => {
                        concertItem.style.transition = 'all 0.5s ease';
                        concertItem.style.opacity = '1';
                        concertItem.style.transform = 'translateY(0)';
                    }, 50);
                    
                }, index * 150); // Stagger the animations
            });
            
            // Add "View Less Concerts" button after all items are added
            setTimeout(() => {
                const viewLessBtn = document.createElement('button');
                viewLessBtn.className = 'view-more-btn';
                viewLessBtn.textContent = 'View Less Concerts ←';
                viewLessBtn.style.opacity = '0';
                viewLessBtn.style.transform = 'translateY(10px)';
                
                // Add click handler for view less functionality
                viewLessBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    collapseConcertList(viewLessBtn, addedConcerts);
                });
                
                // Insert the button after the concert list
                concertList.parentNode.appendChild(viewLessBtn);
                
                // Animate in the view less button
                setTimeout(() => {
                    viewLessBtn.style.transition = 'all 0.3s ease';
                    viewLessBtn.style.opacity = '1';
                    viewLessBtn.style.transform = 'translateY(0)';
                }, 100);
                
                // Remove the original button
                button.remove();
            }, additionalConcerts.length * 150 + 500);
            
        }, 300); // Wait for button fade-out
    }
    
    // Function to collapse concert list
    function collapseConcertList(button, addedConcerts) {
        // Add click animation to button
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'translateY(-2px)';
        }, 100);
        
        // Fade out and remove additional concerts with staggered animation
        addedConcerts.reverse().forEach((concert, index) => {
            setTimeout(() => {
                concert.style.transition = 'all 0.4s ease';
                concert.style.opacity = '0';
                concert.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    concert.remove();
                }, 400);
            }, index * 100);
        });
        
        // After all concerts are removed, replace with "View More Concerts" button
        setTimeout(() => {
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.className = 'view-more-btn';
            viewMoreBtn.textContent = 'View More Concerts →';
            viewMoreBtn.style.opacity = '0';
            viewMoreBtn.style.transform = 'translateY(10px)';
            
            // Add click handler for view more functionality
            viewMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add click animation
                viewMoreBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    viewMoreBtn.style.transform = 'translateY(-2px)';
                }, 100);
                
                // Check if this is the concerts section
                const boxTitle = viewMoreBtn.closest('.content-box').querySelector('.box-title').textContent;
                if (boxTitle.includes('Concert List')) {
                    expandConcertList(viewMoreBtn);
                }
            });
            
            // Replace the view less button with view more button
            button.parentNode.replaceChild(viewMoreBtn, button);
            
            // Animate in the view more button
            setTimeout(() => {
                viewMoreBtn.style.transition = 'all 0.3s ease';
                viewMoreBtn.style.opacity = '1';
                viewMoreBtn.style.transform = 'translateY(0)';
            }, 100);
            
        }, addedConcerts.length * 100 + 500);
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