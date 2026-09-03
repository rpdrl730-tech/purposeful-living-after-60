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


  // ---- newsletter signup -> MailerLite (added 2026-09-01) ----
  // The site's signup forms are Netlify Forms (data-netlify="true"), which
  // strands addresses in the Netlify dashboard. This handler copies the
  // address to MailerLite first (account 2527513, form 193750665026078507),
  // then lets the form submit natively so Netlify still records it and the
  // visitor still lands on /thanks.html. Nothing is lost either way.
  (function () {
    var ML_ENDPOINT = 'https://assets.mailerlite.com/jsonp/2527513/forms/193750665026078507/subscribe';

    var isNewsletterForm = function (form) {
      if (!form || form.tagName !== 'FORM') return false;
      if (form.getAttribute('name') === 'newsletter') return true;
      if (form.id === 'signupForm') return true;
      return form.classList.contains('cta__form');
    };

    var sendToMailerLite = function (email) {
      var body = new URLSearchParams();
      body.append('fields[email]', email);
      body.append('ml-submit', '1');
      body.append('anticsrf', 'true');
      var opts = { method: 'POST', body: body };
      return fetch(ML_ENDPOINT, opts)['catch'](function () {
        opts.mode = 'no-cors';
        return fetch(ML_ENDPOINT, opts);
      })['catch'](function () { return null; });
    };

    document.addEventListener('submit', function (ev) {
      var form = ev.target;
      if (!isNewsletterForm(form)) return;
      var field = form.querySelector('input[type="email"], input[name="email"]');
      if (!field || !field.value) return;
      if (field.checkValidity && !field.checkValidity()) return;

      ev.preventDefault();

      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        form.submit();
      };

      setTimeout(finish, 2500);
      sendToMailerLite(String(field.value).trim()).then(finish, finish);
    }, true);
  })();

})();

/* --- beehiiv subscribe form (added 2026-09-03) ---------------------------
   Replaces every on-site newsletter form with beehiiv's official embed so
   signups land on the list the newsletter is actually sent from.
   beehiiv's submit endpoint is bot-protected, so the embed is the only
   supported route -- a direct POST from here returns 403. ------------------ */
(function () {
  var FORM_ID = 'c933fc80-6719-4a67-8868-686e0685904f';

  function isNewsletterForm(el) {
    if (!el || el.tagName !== 'FORM') return false;
    return el.getAttribute('name') === 'newsletter' ||
           el.id === 'signupForm' ||
           (el.className && String(el.className).indexOf('cta__form') !== -1);
  }

  function mount(form) {
    if (form.getAttribute('data-beehiiv-replaced')) return;
    form.setAttribute('data-beehiiv-replaced', '1');

    var holder = document.createElement('div');
    holder.className = 'beehiiv-embed';
    holder.style.width = '100%';
    holder.style.maxWidth = '520px';
    holder.style.margin = '0 auto';

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
    s.setAttribute('data-beehiiv-form', FORM_ID);
    holder.appendChild(s);

    form.parentNode.replaceChild(holder, form);

    var note = holder.parentNode && holder.parentNode.querySelector('.cta__note');
    if (note) note.style.marginTop = '.75rem';
  }

  function run() {
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      if (isNewsletterForm(forms[i])) mount(forms[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

