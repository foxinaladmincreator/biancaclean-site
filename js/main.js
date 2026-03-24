// ===== NAV SCROLL =====
const nav = document.getElementById('navbar');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===== SCROLL REVEAL (IntersectionObserver) =====
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
}

// ===== UTM CAPTURE =====
function getUTMSource() {
  const params = new URLSearchParams(window.location.search);
  const parts = [];
  const src = params.get('utm_source');
  const med = params.get('utm_medium');
  const camp = params.get('utm_campaign');
  if (src) parts.push('src=' + src);
  if (med) parts.push('med=' + med);
  if (camp) parts.push('camp=' + camp);
  return parts.length ? parts.join('&') : null;
}

// ===== SIGNUP FORM =====
document.querySelectorAll('.signup-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const successEl = form.parentElement.querySelector('.signup-success');
    const errorEl = form.parentElement.querySelector('.signup-error');
    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    const body = { name, email };
    const source = getUTMSource();
    if (source) body.source = source;

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        if (successEl) { successEl.style.display = 'block'; }
        form.reset();
      } else if (res.status === 409) {
        if (successEl) {
          successEl.textContent = "You're already on the list!";
          successEl.style.display = 'block';
        }
        form.reset();
      } else {
        const d = await res.json().catch(() => ({}));
        if (errorEl) {
          errorEl.textContent = d.error || 'Something went wrong.';
          errorEl.style.display = 'block';
        }
      }
    } catch {
      if (errorEl) {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.style.display = 'block';
      }
    }
  });
});
