// Phoenix AC & Heating Experts - shared site JS
(function () {
  'use strict';

  // Mobile menu toggle
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('mobile-open');
      menuBtn.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.addEventListener('click', (e) => {
      const t = e.target.closest('a');
      if (t && !t.closest('.has-dropdown > a')) {
        navLinks.classList.remove('mobile-open');
        menuBtn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Form: redirect to thank-you on submit (static demo)
  document.querySelectorAll('form[data-leadform]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Basic required check
      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach((f) => {
        if (!f.value.trim()) { ok = false; f.style.borderColor = '#ff6a2c'; }
        else { f.style.borderColor = ''; }
      });
      if (!ok) return;
      const path = form.getAttribute('data-redirect') || 'thank-you.html';
      window.location.href = path;
    });
  });

  // Highlight active nav
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href || href.startsWith('#')) return;
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
