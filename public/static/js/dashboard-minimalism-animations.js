/**
 * MuseFlow Dashboard - Minimalism Animations
 * GSAP ScrollTrigger for smooth scroll-based animations
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Initializing Minimalism Animations...');
    
    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.warn('⚠️ GSAP not loaded, animations disabled');
        return;
    }
    
    // ======================================
    // 🎯 Fade-in animations for cards
    // ======================================
    
    const cards = gsap.utils.toArray('.glass-card');
    cards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: index * 0.05,
            ease: 'power2.out'
        });
    });
    
    // ======================================
    // 📊 Stats number count-up animation
    // ======================================
    
    const statValues = document.querySelectorAll('.glass-card div[style*="font-size: 2.5rem"]');
    statValues.forEach(stat => {
        const text = stat.textContent.trim();
        const numericMatch = text.match(/(\d+)/);
        
        if (numericMatch) {
            const finalValue = parseInt(numericMatch[0]);
            const suffix = text.replace(/\d+/g, '');
            
            gsap.from(stat, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 80%',
                    once: true
                },
                textContent: 0,
                duration: 1.5,
                ease: 'power2.out',
                snap: { textContent: 1 },
                onUpdate: function() {
                    const value = Math.ceil(this.targets()[0].textContent);
                    stat.textContent = value + suffix;
                }
            });
        }
    });
    
    // ======================================
    // 🗓️ Timeline cards slide-in
    // ======================================
    
    const timelineDays = gsap.utils.toArray('.timeline-day');
    if (timelineDays.length > 0) {
        gsap.from(timelineDays, {
            scrollTrigger: {
                trigger: '.timeline-container',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -40,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
    
    // ======================================
    // 🎨 Module cards scale-in
    // ======================================
    
    const moduleCards = gsap.utils.toArray('.module-card');
    moduleCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.95,
            duration: 0.6,
            delay: index * 0.08,
            ease: 'back.out(1.2)'
        });
    });
    
    // ======================================
    // 🚨 Alert cards slide-in from left
    // ======================================
    
    const alertCards = gsap.utils.toArray('.alert-card');
    alertCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -30,
            duration: 0.5,
            delay: index * 0.1,
            ease: 'power2.out'
        });
    });
    
    // ======================================
    // 🎴 Exhibition cards
    // ======================================
    
    const exhibitionCards = gsap.utils.toArray('.exhibition-card');
    exhibitionCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 40,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power2.out'
        });
    });
    
    // ======================================
    // 👥 Activity items
    // ======================================
    
    const activityItems = gsap.utils.toArray('.activity-item');
    activityItems.forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            x: -20,
            duration: 0.4,
            delay: index * 0.05,
            ease: 'power2.out'
        });
    });
    
    // ======================================
    // 🔍 Genspark AI Search focus animation
    // ======================================
    
    const searchInput = document.getElementById('genspark-ai-search');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            gsap.to(searchInput.parentElement, {
                scale: 1.01,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        searchInput.addEventListener('blur', () => {
            gsap.to(searchInput.parentElement, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
    
    // ======================================
    // 🎯 Section titles fade-in
    // ======================================
    
    const sectionTitles = gsap.utils.toArray('.main-container h2');
    sectionTitles.forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out'
        });
    });
    
    // ======================================
    // 🎨 Genspark icon cards hover effect
    // ======================================
    
    const iconCards = document.querySelectorAll('.genspark-icon-card');
    iconCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.genspark-icon-wrapper');
            if (icon) {
                gsap.to(icon, {
                    scale: 1.1,
                    rotation: 5,
                    duration: 0.3,
                    ease: 'back.out(1.5)'
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.genspark-icon-wrapper');
            if (icon) {
                gsap.to(icon, {
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    });
    
    // ======================================
    // 🎯 Navbar scroll effect
    // ======================================
    
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        ScrollTrigger.create({
            start: 'top top',
            end: '+=100',
            onUpdate: (self) => {
                if (self.progress > 0.1) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }
    
    // ======================================
    // 📱 Responsive check
    // ======================================
    
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        // Reduce animation delays on mobile for faster perception
        ScrollTrigger.config({
            autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
        });
    }
    
    console.log('✅ Minimalism Animations Ready');
    console.log(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`🎬 Animated elements: ${cards.length + moduleCards.length + alertCards.length + exhibitionCards.length + activityItems.length}`);
});

// ======================================
// 🎨 Smooth scroll for anchor links
// ======================================

document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href^="#"]');
    if (target) {
        e.preventDefault();
        const id = target.getAttribute('href').substring(1);
        const element = document.getElementById(id);
        if (element) {
            gsap.to(window, {
                scrollTo: { y: element, offsetY: 80 },
                duration: 0.8,
                ease: 'power2.inOut'
            });
        }
    }
});
