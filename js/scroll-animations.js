// ===== GSAP ScrollTrigger Animations =====
// Loaded after GSAP + ScrollTrigger CDN

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero parallax fruit SVGs
  gsap.utils.toArray('.hero-bg-fruits svg').forEach((svg, i) => {
    gsap.to(svg, {
      y: -80 - (i * 30),
      rotation: 10 + (i * 5),
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });

  // Grown section parallax
  gsap.utils.toArray('.grown-bg svg').forEach((svg, i) => {
    gsap.to(svg, {
      y: -60 - (i * 20),
      scrollTrigger: {
        trigger: '.grown',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });

  // Dare section — background color shift
  const dare = document.querySelector('.dare');
  if (dare) {
    gsap.to(dare, {
      background: 'linear-gradient(180deg, #0c1425 0%, #0a1a2a 50%, #0c1425 100%)',
      scrollTrigger: {
        trigger: dare,
        start: 'top center',
        end: 'bottom center',
        scrub: true,
      }
    });
  }

  // Product cards stagger
  gsap.utils.toArray('.product-card').forEach((card, i) => {
    gsap.from(card, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.08,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Phil cards slide in
  gsap.utils.toArray('.phil-card').forEach((card, i) => {
    gsap.from(card, {
      x: i % 2 === 0 ? -30 : 30,
      opacity: 0,
      duration: 0.6,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Heritage era dots
  gsap.utils.toArray('.era-dot').forEach((dot, i) => {
    gsap.from(dot, {
      scale: 0,
      duration: 0.5,
      delay: i * 0.2,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: dot,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // FPE steps
  gsap.utils.toArray('.fpe-step').forEach((step, i) => {
    gsap.from(step, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.15,
      scrollTrigger: {
        trigger: '.fpe-steps',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Ingredient cards
  gsap.utils.toArray('.ingredient-card').forEach((card, i) => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      rotation: -3,
      duration: 0.6,
      delay: i * 0.12,
      scrollTrigger: {
        trigger: '.ingredient-row',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Product page feature cards
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      delay: i * 0.06,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Clinical stat numbers
  gsap.utils.toArray('.clinical-stat .number').forEach(num => {
    gsap.from(num, {
      innerText: 0,
      snap: { innerText: 1 },
      duration: 1.5,
      scrollTrigger: {
        trigger: num,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });
});
