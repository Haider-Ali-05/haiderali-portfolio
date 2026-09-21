// 3D & 4D Effects Initialization
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize WebGL Background (Vanta.js Net)
    setTimeout(() => {
        if (typeof VANTA !== 'undefined' && document.getElementById('vanta-bg')) {
            VANTA.NET({
                el: "#vanta-bg",
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x00f0ff,
                backgroundColor: 0x0a0e1a,
                points: 12.00,
                maxDistance: 22.00,
                spacing: 18.00,
                showDots: true
            });
        }
    }, 100);

    // 2. Initialize VanillaTilt (3D Hover Glare)
    const tiltElements = document.querySelectorAll('.glass, .project-card, .timeline-card, .skill-category, .tool-card');
    if (typeof VanillaTilt !== 'undefined' && tiltElements.length > 0) {
        VanillaTilt.init(tiltElements, {
            max: 8,
            speed: 400,
            glare: true,
            "max-glare": 0.15,
            perspective: 1000,
            scale: 1.02
        });
    }

    // 3. Initialize GSAP Scroll Choreography
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from("#hero .hero-text > *", {
            y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "back.out(1.7)", delay: 0.5
        });

        gsap.from("#hero .hero-image", {
            x: 50, opacity: 0, duration: 1.5, ease: "power3.out", delay: 0.8
        });

        document.querySelectorAll('.section').forEach(sec => {
            if (sec.id !== 'hero') {
                gsap.from(sec.querySelectorAll('.section-title, .section-subtitle'), {
                    scrollTrigger: { trigger: sec, start: "top 80%" },
                    y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
                });
            }
        });

        gsap.from(".timeline-item", {
            scrollTrigger: { trigger: ".timeline", start: "top 75%" },
            x: -50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.2)"
        });

        gsap.from(".project-card", {
            scrollTrigger: { trigger: ".projects-grid", start: "top 80%" },
            y: 50, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)"
        });
        
        gsap.from(".skill-bar-fill", {
            scrollTrigger: { trigger: ".skills-categories", start: "top 85%" },
            width: 0, duration: 1.5, stagger: 0.1, ease: "power3.inOut"
        });
    }
});
