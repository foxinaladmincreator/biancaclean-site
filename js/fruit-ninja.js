// ===== Fruit Ninja Animation Engine =====
// GSAP-powered fruit slice animation for the hero section

(function () {
  'use strict';

  const FRUITS = [
    { name: 'pineapple', whole: 'images/fruits/pineapple.webp', halves: 'images/fruits/pineapple-halves.webp' },
    { name: 'papaya', whole: 'images/fruits/papaya.webp', halves: 'images/fruits/papaya-halves.webp' },
    { name: 'apple', whole: 'images/fruits/apple.webp', halves: 'images/fruits/apple-halves.webp' },
    { name: 'strawberry', whole: 'images/fruits/strawberry.webp', halves: 'images/fruits/strawberry-halves.webp' },
    { name: 'lemon', whole: 'images/fruits/lemon.webp', halves: 'images/fruits/lemon-halves.webp' },
    { name: 'mint', whole: 'images/fruits/mint.webp', halves: 'images/fruits/mint-halves.webp' },
  ];

  const CONFIG = {
    interval: 600,         // ms between fruit launches
    maxActive: 12,         // max simultaneous fruits (desktop)
    maxActiveMobile: 4,
    sizeMin: 180,
    sizeMax: 260,
    sizeMobile: 120,
    opacity: 0.95,
    launchDuration: 2.0,   // seconds — fruit rising
    sliceDuration: 0.2,    // seconds — slash line draw
    tumbleDuration: 1.4,   // seconds — halves falling away
  };

  let canvas, heroRect, isVisible = true, activeCount = 0, loopTimer;
  const isMobile = () => window.innerWidth <= 768;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (typeof gsap === 'undefined') return;

    canvas = document.querySelector('.fruit-ninja-canvas');
    if (!canvas) return;

    // Preload images
    FRUITS.forEach(f => {
      new Image().src = f.whole;
      new Image().src = f.halves;
    });

    if (prefersReduced) {
      showStaticFruits();
      return;
    }

    // IntersectionObserver — only animate when hero is visible
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
    // For prefers-reduced-motion: show a few static, faded fruits
    const positions = [
      { left: '8%', top: '20%' },
      { right: '10%', top: '30%' },
      { left: '12%', bottom: '25%' },
    ];
    positions.forEach((pos, i) => {
      const img = document.createElement('img');
      img.src = FRUITS[i % FRUITS.length].whole;
      img.alt = '';
      img.style.cssText = `position:absolute;width:70px;height:70px;object-fit:contain;opacity:0.3;pointer-events:none;`;
      Object.assign(img.style, pos);
      canvas.appendChild(img);
    });
  }

  function launchFruit() {
    if (!isVisible) return;
    const max = isMobile() ? CONFIG.maxActiveMobile : CONFIG.maxActive;
    if (activeCount >= max) return;

    activeCount++;
    const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const mobile = isMobile();
    const size = mobile ? CONFIG.sizeMobile : CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin);

    heroRect = canvas.getBoundingClientRect();

    // Random x position in outer 30% on each side (avoid center text)
    const side = Math.random() < 0.5 ? 'left' : 'right';
    let xPercent;
    if (side === 'left') {
      xPercent = 2 + Math.random() * 28; // 2-30%
    } else {
      xPercent = 70 + Math.random() * 28; // 70-98%
    }
    const xPx = (xPercent / 100) * heroRect.width - size / 2;

    // Create fruit element
    const el = document.createElement('img');
    el.src = fruit.whole;
    el.alt = '';
    el.className = 'fruit-ninja-item';
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;object-fit:contain;bottom:-${size}px;left:${xPx}px;opacity:0;pointer-events:none;will-change:transform,opacity;`;
    canvas.appendChild(el);

    const apexY = heroRect.height * (0.55 + Math.random() * 0.35); // 55-90% from bottom (higher up on page)
    const rotAngle = (Math.random() - 0.5) * 60;

    // Timeline: launch → slice → tumble
    const tl = gsap.timeline({
      onComplete: () => {
        cleanup(el);
      }
    });

    // Phase 1: Launch upward
    tl.to(el, {
      y: -apexY,
      rotation: rotAngle,
      opacity: CONFIG.opacity,
      duration: CONFIG.launchDuration,
      ease: 'power2.out',
    });

    // Phase 2: Slash + swap to halves
    tl.call(() => {
      drawSlash(el, size, xPx, apexY);
    });

    tl.to(el, {
      opacity: 0,
      scale: 0.8,
      duration: 0.1,
    });

    // Phase 3: Spawn halves that tumble apart
    tl.call(() => {
      spawnHalves(fruit, size, xPx, apexY, el);
    });

    // Add padding for tumble animation duration
    tl.to({}, { duration: CONFIG.tumbleDuration + 0.2 });
  }

  function drawSlash(fruitEl, size, xPx, apexY) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'fruit-slice-line');
    const fruitCenterX = xPx + size / 2;
    const fruitCenterY = canvas.offsetHeight - apexY;

    const slashLen = size * 1.5;
    const angle = -30 + Math.random() * 60; // degrees
    const rad = angle * Math.PI / 180;
    const x1 = fruitCenterX - Math.cos(rad) * slashLen / 2;
    const y1 = fruitCenterY - Math.sin(rad) * slashLen / 2;
    const x2 = fruitCenterX + Math.cos(rad) * slashLen / 2;
    const y2 = fruitCenterY + Math.sin(rad) * slashLen / 2;

    svg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;`;
    svg.innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--teal)" stroke-width="3" stroke-linecap="round" filter="url(#slashGlow)" stroke-dasharray="500" stroke-dashoffset="500"/>
    <defs><filter id="slashGlow"><feGaussianBlur stdDeviation="4" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

    canvas.appendChild(svg);
    const line = svg.querySelector('line');

    gsap.to(line, {
      strokeDashoffset: 0,
      duration: CONFIG.sliceDuration,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(svg, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => svg.remove(),
        });
      }
    });
  }

  function spawnHalves(fruit, size, xPx, apexY, originalEl) {
    const halfSize = size * 0.85;
    const baseBottom = canvas.offsetHeight - apexY - size / 2;

    // We use the halves image with clip-path to get left/right halves
    for (let i = 0; i < 2; i++) {
      const half = document.createElement('img');
      half.src = fruit.halves;
      half.alt = '';
      half.style.cssText = `position:absolute;width:${halfSize}px;height:${halfSize}px;object-fit:contain;pointer-events:none;will-change:transform,opacity;z-index:1;`;

      // Position at the fruit's current location
      const offsetX = i === 0 ? -halfSize * 0.3 : halfSize * 0.3;
      half.style.left = (xPx + size / 2 - halfSize / 2 + offsetX) + 'px';
      half.style.bottom = baseBottom + 'px';
      half.style.opacity = CONFIG.opacity;

      // Clip left or right half
      half.style.clipPath = i === 0
        ? 'inset(0 50% 0 0)'
        : 'inset(0 0 0 50%)';

      canvas.appendChild(half);

      const tumbleX = i === 0 ? -(40 + Math.random() * 60) : (40 + Math.random() * 60);
      const tumbleRot = i === 0 ? -(90 + Math.random() * 90) : (90 + Math.random() * 90);

      gsap.to(half, {
        x: tumbleX,
        y: 200 + Math.random() * 100,
        rotation: tumbleRot,
        opacity: 0,
        duration: CONFIG.tumbleDuration,
        ease: 'power1.in',
        onComplete: () => {
          half.remove();
          activeCount = Math.max(0, activeCount - 1);
        }
      });
    }

    // Only decrement once for the pair (handled in second half's onComplete)
    // Adjust: decrement only once
    activeCount++; // offset since both halves decrement
  }

  function cleanup(el) {
    if (el && el.parentNode) el.remove();
  }

  // Wait for GSAP to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  } else {
    setTimeout(init, 100);
  }
})();
