/* ============================================================
   Purposeful Living After 60 — shared front-end script
   Handles: year stamp, header scroll state, mobile menu,
   reveal-on-scroll, and the newsletter form (front-end only).
   ============================================================ */
(function () {
  'use strict';

  // ---- current year in footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // ---- header scroll state ----
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- mobile menu toggle ----
  var toggle = document.getElementById('menuToggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- reveal on scroll ----
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.14 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      // Fallback: just show everything
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }
  }

  // ---- newsletter signup (front-end only) ----
  // Newsletter + contact forms are handled natively by Netlify Forms
  // (data-netlify="true"). On submit, Netlify captures the data and
  // redirects the visitor to /thanks.html. No JS interception needed —
  // intercepting here would PREVENT Netlify from receiving the submission.
  // If you ever move off Netlify, wire these forms to your provider's
  // endpoint instead.
})();
