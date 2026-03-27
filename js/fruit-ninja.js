// ===== Floating Fruit Animation Engine =====
// GSAP-powered floating fruit animation for the hero section

(function () {
  'use strict';

  const FRUITS = [
    'images/fruits/pineapple.webp',
    'images/fruits/papaya.webp',
    'images/fruits/apple.webp',
    'images/fruits/strawberry.webp',
    'images/fruits/lemon.webp',
    'images/fruits/mint.webp',
  ];

  const CONFIG = {
    interval: 400,
    maxActive: 18,
    maxActiveMobile: 6,
    sizeMin: 180,
    sizeMax: 280,
    sizeMobile: 120,
    opacity: 0.95,
    riseDuration: 3.5,
    fadeDuration: 1.0,
  };

  let canvas, heroRect, isVisible = true, activeCount = 0, loopTimer;
  const isMobile = () => window.innerWidth <= 768;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (typeof gsap === 'undefined') return;

    canvas = document.querySelector('.fruit-ninja-canvas');
    if (!canvas) return;

    FRUITS.forEach(src => { new Image().src = src; });

    if (prefersReduced) {
      showStaticFruits();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !loopTimer) startLoop();
      if (!isVisible && loopTimer) stopLoop();
    }, { threshold: 0.1 });
    observer.observe(canvas.closest('.hero'));

    startLoop();
  }

  function startLoop() {
    launchFruit();
    loopTimer = setInterval(launchFruit, CONFIG.interval);
  }

  function stopLoop() {
    clearInterval(loopTimer);
    loopTimer = null;
  }

  function showStaticFruits() {
    const positions = [
      { left: '5%', top: '15%' }, { right: '8%', top: '20%' },
      { left: '10%', bottom: '30%' }, { right: '12%', bottom: '20%' },
      { left: '3%', top: '50%' }, { right: '5%', top: '45%' },
    ];
    positions.forEach((pos, i) => {
      const img = document.createElement('img');
      img.src = FRUITS[i % FRUITS.length];
      img.alt = '';
      img.style.cssText = `position:absolute;width:100px;height:100px;object-fit:contain;opacity:0.4;pointer-events:none;`;
      Object.assign(img.style, pos);
      canvas.appendChild(img);
    });
  }

  function launchFruit() {
    if (!isVisible) return;
    const max = isMobile() ? CONFIG.maxActiveMobile : CONFIG.maxActive;
    if (activeCount >= max) return;

    activeCount++;
    const src = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const mobile = isMobile();
    const size = mobile ? CONFIG.sizeMobile : CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin);

    heroRect = canvas.getBoundingClientRect();

    // Random x — use full width but weight toward edges
    let xPercent;
    if (Math.random() < 0.7) {
      // 70% chance: outer edges
      const side = Math.random() < 0.5 ? 'left' : 'right';
      xPercent = side === 'left'
        ? 2 + Math.random() * 28
        : 70 + Math.random() * 28;
    } else {
      // 30% chance: anywhere
      xPercent = 5 + Math.random() * 90;
    }
    const xPx = (xPercent / 100) * heroRect.width - size / 2;

    const el = document.createElement('img');
    el.src = src;
    el.alt = '';
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;object-fit:contain;bottom:-${size}px;left:${xPx}px;opacity:0;pointer-events:none;will-change:transform,opacity;`;
    canvas.appendChild(el);

    const riseHeight = heroRect.height * (0.6 + Math.random() * 0.4);
    const drift = (Math.random() - 0.5) * 80;
    const rotAngle = (Math.random() - 0.5) * 40;

    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        activeCount = Math.max(0, activeCount - 1);
      }
    });

    // Rise up with gentle drift and rotation
    tl.to(el, {
      y: -riseHeight,
      x: drift,
      rotation: rotAngle,
      opacity: CONFIG.opacity,
      duration: CONFIG.riseDuration,
      ease: 'power1.out',
    });

    // Fade out at the top
    tl.to(el, {
      opacity: 0,
      y: `-=${heroRect.height * 0.1}`,
      duration: CONFIG.fadeDuration,
      ease: 'power2.in',
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  } else {
    setTimeout(init, 100);
  }
})();
