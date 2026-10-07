/* ============================================================
   solutionz.com — interactions
   Progressive enhancement only: every feature below degrades
   cleanly if JavaScript is unavailable.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Current year in the footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Hidden _page field (return-to-page after submit) ---------- */
  var pageField = document.getElementById('pageField');
  if (pageField) pageField.value = window.location.href;

  /* ---------- Sticky header shadow ---------- */
  var head = document.getElementById('siteHead');
  function onScroll() {
    if (!head) return;
    if (window.scrollY > 12) head.classList.add('stuck');
    else head.classList.remove('stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 3, 2) * 90) + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var alertBox = document.getElementById('formAlert');
  var submitBtn = document.getElementById('submitBtn');

  function showConfirmation() {
    if (!alertBox) return;
    alertBox.hidden = false;
    if (form) form.hidden = true;
    alertBox.setAttribute('tabindex', '-1');
    alertBox.focus({ preventScroll: true });
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* Plain (no-JS style) submission returns with ?submitted=1 */
  try {
    if (new URLSearchParams(window.location.search).get('submitted') === '1') {
      showConfirmation();
    }
  } catch (err) { /* URLSearchParams unsupported — plain flow still fine */ }

  if (form) {
    form.addEventListener('submit', function (e) {
      if (typeof window.fetch !== 'function' || typeof FormData !== 'function') {
        return; /* fall back to the native POST */
      }

      e.preventDefault();

      if (pageField) pageField.value = window.location.href;

      var data = new FormData(form);
      var payload = {};
      data.forEach(function (value, key) { payload[key] = value; });
      payload._page = window.location.href;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: res.ok }; });
        })
        .then(function (json) {
          if (json && json.ok) {
            form.reset();
            showConfirmation();
          } else {
            throw new Error('Submission rejected');
          }
        })
        .catch(function () {
          /* Network or API trouble: hand off to the native POST so the
             message is never silently lost. */
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send message';
          }
          HTMLFormElement.prototype.submit.call(form);
        });
    });
  }
})();
