/* LACES 2026 — Experience layer (JS).
   Dependency-free, ~6 KB. Complements laces-motion.css:
   - splits display headlines into words for kinetic reveals
   - staggers collection/search grids, flags loaded images (skeleton off)
   - counts up ledger figures, bumps the cart icon, labels the "Added" state
   - rAF parallax fallback where CSS scroll-driven animations are unsupported
   - desktop cursor hint ("Drag" over rails, "View" over photo tiles)
   Everything is a no-op under prefers-reduced-motion. */
(() => {
  const html = document.documentElement;
  if (html.dataset.lMotion === 'off') return;
  const mq = (q) => window.matchMedia(q).matches;
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const conn = navigator.connection || {};
  if (conn.saveData) html.classList.add('l-save-data');
  const intensity = html.dataset.lIntensity || 'standard';
  const scrollTimelines = CSS.supports && CSS.supports('animation-timeline: view()');

  /* ---------- Shared observer ---------- */
  const onEnter = (els, cb, opts = {}) => {
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(cb); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { cb(en.target); obs.unobserve(en.target); } });
    }, { rootMargin: opts.rootMargin || '0px 0px -10% 0px', threshold: opts.threshold || 0.1 });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- 1. Kinetic headlines ---------- */
  const SPLIT_TARGETS = '.l-sec-head__title, .l-fund__heading, .l-campaign__title, .l-fit__title, .l-footer__band-title, .l-tile__title, .l-story__title';
  const splitWords = (el) => {
    if (el.dataset.lSplit) return;
    el.dataset.lSplit = '1';
    let idx = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'l-w';
            const i = document.createElement('span'); i.className = 'l-w__i'; i.textContent = p; i.style.setProperty('--wi', idx++);
            w.appendChild(i); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add('has-split');
    const host = el.closest('.l-reveal') || el;
    host.classList.add('has-split');
    return host;
  };
  const initSplit = (root = document) => {
    if (reduce || intensity === 'subtle') return;
    const hosts = new Set();
    root.querySelectorAll(SPLIT_TARGETS).forEach((el) => {
      // tiles/stories already use a masked reveal; only split the large editorial titles
      if (el.matches('.l-tile__title, .l-story__title') && !el.closest('.l-story--featured')) return;
      const h = splitWords(el); if (h) hosts.add(h);
    });
    onEnter([...hosts].filter((h) => !h.classList.contains('is-in')), (h) => h.classList.add('is-in'));
  };

  /* ---------- 2. Generic reveal hooks the base layer doesn't cover ---------- */
  const initExtras = (root = document) => {
    onEnter([...root.querySelectorAll('.l-eyebrow:not(.l-reveal):not(.is-in)')], (el) => el.classList.add('is-in'));
    onEnter([...root.querySelectorAll('.l-ledger:not(.is-in)')], (el) => { el.classList.add('is-in'); el.querySelectorAll('.l-ledger__value').forEach(countUp); }, { threshold: 0.25 });
    onEnter([...root.querySelectorAll('.l-pdp-fund__pct:not([data-l-counted])')], countUp, { threshold: 0.5 });
    // horizontal rails (mobile): reveal every card in the rail together instead of one-by-one on swipe
    onEnter([...root.querySelectorAll('.l-tiles, .l-stories, .l-community__grid')].filter((g) => !g.dataset.lGroup), (g) => {
      g.dataset.lGroup = '1';
      g.querySelectorAll(':scope > .l-reveal').forEach((c) => c.classList.add('is-in'));
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    onEnter([...root.querySelectorAll('[data-l-rail]:not(.l-in)')], (rail) => { rail.classList.add('l-in'); rail.querySelectorAll('.l-rail-panel').forEach((p) => p.classList.add('l-in')); }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  };

  /* ---------- 3. Count-up for verified figures ("5%", "$50", "30") ---------- */
  function countUp(el) {
    if (el.dataset.lCounted) return;
    el.dataset.lCounted = '1';
    const raw = el.textContent.trim();
    const m = raw.match(/^([^\d]*)(\d+)(.*)$/);
    if (!m || reduce) return;
    const [, pre, num, post] = m; const target = parseInt(num, 10);
    if (!target || target > 9999) return;
    const dur = 1100; const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = pre + Math.round(ease(p) * target) + post;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 4. Collection / search grid stagger + image loaded flags ---------- */
  const initGrid = (root = document) => {
    const cards = [...root.querySelectorAll('.collection-listing .product-grid > product-block:not(.l-in), .collection-listing .product-grid > .k-grid-promo:not(.l-in)')];
    if (cards.length) {
      let batch = 0; let last = 0;
      onEnter(cards, (card) => {
        const now = performance.now();
        batch = now - last < 120 ? batch + 1 : 0; last = now;
        card.style.setProperty('--gi', Math.min(batch, 7));
        card.classList.add('l-in');
      }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });
    }
    root.querySelectorAll('.product-block .image-cont:not(.is-loaded)').forEach((cont) => {
      const img = cont.querySelector('img');
      if (!img) { cont.classList.add('is-loaded'); return; }
      const done = () => cont.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
  };

  /* ---------- 5. Cart micro-interactions ---------- */
  const initCart = () => {
    const bump = () => {
      document.querySelectorAll('.cart-link__count, .cart-link__icon').forEach((el) => {
        el.classList.remove('l-bump'); void el.offsetWidth; el.classList.add('l-bump');
        setTimeout(() => el.classList.remove('l-bump'), 700);
      });
    };
    document.addEventListener('on:cart:add', (e) => {
      bump();
      const form = e.target.closest ? e.target.closest('product-form, form') : null;
      const btn = (form || document).querySelector('.add-to-cart[name="add"], [name="add"]');
      if (btn && !btn.dataset.lAdded) btn.dataset.lAdded = 'Added to bag';
    });
    document.addEventListener('on:cart:change', () => bump());
    document.querySelectorAll('.add-to-cart[name="add"]').forEach((b) => { if (!b.dataset.lAdded) b.dataset.lAdded = 'Added to bag'; });
    // mark items as leaving when their remove link is clicked (drawer re-renders shortly after)
    document.addEventListener('click', (e) => {
      const rm = e.target.closest && e.target.closest('.cart-item__remove, a[href*="quantity=0"]');
      if (rm) { const item = rm.closest('.cart-item'); if (item) item.classList.add('l-m-leaving'); }
    }, true);
  };

  /* ---------- 6. Parallax fallback (no scroll-driven animations) ---------- */
  const initParallaxFallback = () => {
    if (reduce || scrollTimelines || html.dataset.lParallax === 'off' || intensity === 'subtle' || html.classList.contains('l-save-data')) return;
    if (!mq('(min-width: 768px)')) return;
    const targets = [
      ...document.querySelectorAll('.k-film__strip'),
      ...document.querySelectorAll('.l-campaign__media img, .l-fund__media img')
    ].map((el) => ({ el, amp: el.classList.contains('k-film__strip') ? 0.14 : 0.07 }));
    if (!targets.length) return;
    targets.forEach((t) => t.el.classList.add('l-par-js'));
    const mult = intensity === 'expressive' ? 1.6 : 1;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      targets.forEach(({ el, amp }) => {
        const r = (el.closest('section') || el).getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        el.style.setProperty('--l-py', (-p * amp * mult * r.height).toFixed(1) + 'px');
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    window.addEventListener('on:debounced-resize', update);
    update();
  };

  /* ---------- 7. Header: mark settled so re-renders don't replay the entrance ---------- */
  const initHeader = () => {
    const h = document.querySelector('.section-header');
    if (!h) return;
    setTimeout(() => h.classList.add('l-m-nav-settled'), 1400);
  };

  /* ---------- 8. Cursor hint ---------- */
  const initCursor = () => {
    if (reduce || html.dataset.lCursor === 'off' || !mq('(hover: hover) and (pointer: fine)') || !mq('(min-width: 1024px)')) return;
    const el = document.createElement('div'); el.className = 'l-cursor'; el.setAttribute('aria-hidden', 'true');
    const pill = document.createElement('span'); pill.className = 'l-cursor__pill'; el.appendChild(pill);
    document.body.appendChild(el);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0, active = false, zone = null;
    const ZONES = [
      ['.l-rail-panel .slider', 'Drag', false],
      ['.l-tile', 'View', false],
      ['.l-story', 'Read', false],
      ['.l-community__item[href]', 'View', true]
    ];
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${active ? 1 : 0})`;
      if (active || Math.abs(tx - x) > 0.5) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const setZone = (z, label, light) => {
      if (z === zone) return;
      zone = z; active = !!z;
      if (z) { pill.textContent = label; el.classList.toggle('l-cursor--light', !!light); el.classList.add('is-on'); html.classList.add('l-cursor-active'); }
      else { el.classList.remove('is-on'); html.classList.remove('l-cursor-active'); }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      let hit = null;
      const inCard = e.target.closest && e.target.closest('product-block, button, .k-swatch');
      for (const [sel, label, light] of ZONES) { const z = e.target.closest && e.target.closest(sel); if (z && !(inCard && sel.includes('slider'))) { hit = [z, label, light]; break; } }
      if (hit) setZone(...hit); else setZone(null);
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerdown', () => el.classList.add('is-down'));
    document.addEventListener('pointerup', () => el.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => setZone(null));
    // rails: grabbing feedback
    document.querySelectorAll('.l-rail-panel .slider').forEach((s) => {
      s.addEventListener('pointerdown', () => s.classList.add('is-grabbing'));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => s.addEventListener(ev, () => s.classList.remove('is-grabbing')));
    });
  };

  /* ---------- 9. Keep hero video honest ---------- */
  const initVideo = () => {
    document.querySelectorAll('.l-hero video').forEach((v) => { if (reduce || conn.saveData) { v.pause(); v.removeAttribute('autoplay'); } });
  };

  const start = () => {
    initSplit(); initExtras(); initGrid(); initCart(); initParallaxFallback(); initHeader(); initCursor(); initVideo();
    // content injected later: ajax filtering, quick buy, cart drawer re-render, theme editor
    let t;
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { initGrid(); initExtras(); }, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('shopify:section:load', (e) => { initSplit(e.target); initExtras(e.target); initGrid(e.target); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
