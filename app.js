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


  // ---- topic filter chips (Articles page) ----
  (function () {
    var chips = document.querySelectorAll('#topicChips [data-filter]');
    var posts = document.querySelectorAll('.post-grid .post[data-category]');
    var empty = document.getElementById('emptyFilter');
    if (!chips.length || !posts.length) return;

    var apply = function (topic) {
      topic = (topic || 'all').toLowerCase();
      if (topic !== 'all' && topic !== 'health' && topic !== 'retirement' && topic !== 'income') {
        topic = 'all';
      }
      var visible = 0;
      posts.forEach(function (post) {
        var match = topic === 'all' || post.getAttribute('data-category') === topic;
        post.hidden = !match;
        if (match) visible += 1;
      });
      chips.forEach(function (chip) {
        var active = chip.getAttribute('data-filter') === topic;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-selected', String(active));
      });
      if (empty) empty.hidden = visible > 0;

      // Keep URL in sync without reloading
      try {
        var url = new URL(window.location.href);
        if (topic === 'all') url.searchParams.delete('topic');
        else url.searchParams.set('topic', topic);
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      } catch (e) { /* older browsers: ignore */ }
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        apply(chip.getAttribute('data-filter'));
      });
    });

    var params = new URLSearchParams(window.location.search);
    apply(params.get('topic') || 'all');
  })();

})();
