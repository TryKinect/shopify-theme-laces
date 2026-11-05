/* LACES 2026 — Phase 2 motion runtime (dependency-free).
   Runs only when <html class="l-motion"> was set by the inline guard in
   theme.liquid (setting on, no prefers-reduced-motion, no Save-Data).
   Modules are independent: comment one out in start() to disable it.
   Everything scroll-linked is transform/opacity driven on rAF or native
   scroll timelines; no scroll hijacking, no layout reads inside rAF loops
   beyond IntersectionObserver-tracked elements. */
(() => {
  const html = document.documentElement;
  if (!html.classList.contains('l-motion')) return;
  const L = (window.LACES = window.LACES || {});
  const supports = (p) => window.CSS && CSS.supports && CSS.supports(p);
  const nativeScroll = supports('animation-timeline: view()') && supports('animation-timeline: scroll()');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => window.innerWidth >= 1024;
  const onIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));

  /* ---------- split text: wrap words, preserve inline markup (em/br) ---------- */
  const SPLIT = '.l-sec-head__title, .l-fund__heading, .l-campaign__title, .l-footer__band-title';
  const splitWords = (el) => {
    if (el.dataset.lSplit) return;
    el.dataset.lSplit = '1';
    const text = el.textContent.trim();
    if (text && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'l-w'; w.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span');
            inner.className = 'l-w__in'; inner.style.setProperty('--i', i++); inner.textContent = p;
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('l-w')) {
          walk(child);
        }
      });
    };
    walk(el);
    if (!el.closest('.l-reveal')) el.classList.add('l-reveal', 'l-split');
  };
  const initSplit = (root = document) => root.querySelectorAll(SPLIT).forEach(splitWords);

  /* ---------- index stagger helpers ---------- */
  const indexChildren = (sel, childSel, root = document) => {
    root.querySelectorAll(sel).forEach((p) => {
      if (p.dataset.lIdx) return;
      p.dataset.lIdx = '1';
      [...p.querySelectorAll(childSel)].forEach((c, i) => c.style.setProperty('--i', i));
    });
  };

  /* ---------- in-view class for groups not using .l-reveal ---------- */
  const groupIO = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      }), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    : null;
  const watch = (sel, root = document) => root.querySelectorAll(sel).forEach((el) => {
    if (el.dataset.lWatch) return;
    el.dataset.lWatch = '1';
    if (groupIO) groupIO.observe(el); else el.classList.add('is-in');
  });

  /* ---------- counters: ledger values count up on first view ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  const countUp = (el) => {
    const raw = el.textContent.trim();
    const m = raw.match(/^([^\d]*)([\d][\d,]*)(\.\d+)?(.*)$/);
    if (!m) return;
    const target = parseInt(m[2].replace(/,/g, ''), 10);
    if (!isFinite(target) || target < 10) return;
    const grouped = m[2].includes(',');
    const start = performance.now(), dur = 1400;
    const fmt = (n) => grouped ? n.toLocaleString('en-US') : String(n);
    el.style.fontVariantNumeric = 'tabular-nums';
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = m[1] + fmt(Math.round(target * easeOut(t))) + (m[3] || '') + m[4];
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const initCounters = (root = document) => {
    const els = [...root.querySelectorAll('.l-ledger__value:not([data-l-count])')];
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries, obs) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countUp(en.target); obs.unobserve(en.target);
    }), { threshold: 0.4 });
    els.forEach((el) => { el.dataset.lCount = '1'; io.observe(el); });
  };

  /* ---------- JS fallback for scroll-linked parallax (no native timelines) ---------- */
  const initScrollFallback = () => {
    if (nativeScroll) return;
    html.classList.add('l-js-scroll');
    const hero = document.querySelector('.l-hero');
    const tracked = new Set();
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      en.isIntersecting ? tracked.add(en.target) : tracked.delete(en.target);
    }), { rootMargin: '10% 0px' });
    document.querySelectorAll('.l-px, .l-campaign__copy').forEach((el) => io.observe(el));
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      if (hero) html.style.setProperty('--l-sy', Math.min(1, Math.max(0, window.scrollY / vh)).toFixed(4));
      tracked.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = (vh - r.top) / (vh + r.height);
        el.style.setProperty('--l-vy', Math.min(1, Math.max(0, p)).toFixed(4));
      });
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  };

  /* ---------- hero: index CTAs/proof items for staggered entrance ---------- */
  const initHero = () => {
    indexChildren('.l-hero__actions', '.l-btn');
    indexChildren('.l-hero__proof ul', 'li');
  };

  /* ---------- product rails: card stagger + panel in-view ---------- */
  const initRails = (root = document) => {
    root.querySelectorAll('.l-rail-panel').forEach((panel) => {
      [...panel.querySelectorAll('.slider__item')].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 7)));
      if (!panel.hidden) watch('.l-rail-panel:not([hidden])', root);
    });
    root.querySelectorAll('[data-l-rail] [role="tab"]').forEach((tab) => {
      if (tab.dataset.lTab) return;
      tab.dataset.lTab = '1';
      tab.addEventListener('click', () => requestAnimationFrame(() => {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) { panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in'); }
      }));
    });
  };

  /* ---------- cursor: small dot, grows on links, labels on rails/tiles ---------- */
  const initCursor = () => {
    if (!finePointer || !desktop()) return;
    const c = document.createElement('div');
    c.className = 'l-cursor'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="l-cursor__label"></span>';
    document.body.appendChild(c);
    const label = c.firstChild;
    let tx = -100, ty = -100, x = tx, y = ty, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      c.style.setProperty('--x', x.toFixed(1) + 'px'); c.style.setProperty('--y', y.toFixed(1) + 'px');
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const LABELS = [['.l-rail-panel', 'Drag'], ['.l-tile, .l-story, .l-fit__panel, .l-community__item[href], .l-campaign__product', 'View']];
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      c.classList.add('is-on');
      const t = e.target;
      let lab = '';
      for (const [sel, txt] of LABELS) if (t.closest && t.closest(sel)) { lab = txt; break; }
      const interactive = !lab && t.closest && t.closest('a, button, [role="button"], input, select, textarea, label, summary');
      c.classList.toggle('is-label', !!lab);
      c.classList.toggle('is-link', !!interactive);
      if (lab) label.textContent = lab;
    }, { passive: true });
    document.addEventListener('mouseleave', () => c.classList.remove('is-on'));
    document.addEventListener('mousedown', () => c.classList.add('is-down'));
    document.addEventListener('mouseup', () => c.classList.remove('is-down'));
  };

  /* ---------- page transitions: short fade out on same-origin navigation ---------- */
  const initPageTransitions = () => {
    html.classList.add('l-enter');
    window.addEventListener('pageshow', (e) => { if (e.persisted) html.classList.remove('l-leaving'); });
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download') || a.dataset.noTransition) return;
      if (a.closest('.shopify-section-group-header-group .mobile-navigation-drawer, [data-cc-animate-click]')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      if (/^\/(cart|checkout|account|customer_authentication)/.test(url.pathname) && url.pathname !== '/cart') return;
      e.preventDefault();
      html.classList.add('l-leaving');
      setTimeout(() => { location.href = a.href; }, 200);
    });
  };

  /* ---------- cart: header bump on add, drawer item stagger, new-item slide ---------- */
  const initCart = () => {
    const bump = () => {
      document.querySelectorAll('.cart-link').forEach((el) => {
        el.classList.remove('l-bump'); void el.offsetWidth; el.classList.add('l-bump');
        setTimeout(() => el.classList.remove('l-bump'), 700);
      });
    };
    document.addEventListener('on:cart:add', bump);
    const drawer = document.querySelector('.js-cart-drawer');
    if (!drawer) return;
    const markSeen = () => drawer.querySelectorAll('.cart-item').forEach((it, i) => { it.style.setProperty('--i', Math.min(i, 8)); it.dataset.lSeen = '1'; });
    drawer.addEventListener('on:cart-drawer:before-open', () => { drawer.classList.add('l-cart-stagger'); markSeen(); });
    drawer.addEventListener('on:cart-drawer:after-open', () => setTimeout(() => drawer.classList.remove('l-cart-stagger'), 900));
    document.addEventListener('on:cart:after-merge', () => {
      drawer.querySelectorAll('.cart-item:not([data-l-seen])').forEach((it) => {
        it.classList.add('l-cart-new'); it.addEventListener('animationend', () => it.classList.remove('l-cart-new'), { once: true });
      });
      markSeen();
    });
    drawer.addEventListener('change', (e) => {
      const item = e.target.closest && e.target.closest('.cart-item');
      if (item && e.target.matches('input[type="number"], select')) {
        item.classList.add('l-cart-updating');
        document.addEventListener('on:cart:after-merge', () => item.classList.remove('l-cart-updating'), { once: true });
      }
    });
  };

  /* ---------- PDP: gallery crossfade, price/variant feedback ---------- */
  const initProduct = () => {
    document.addEventListener('on:media-gallery:change', (e) => {
      const g = e.target.closest ? e.target.closest('.media-gallery') : null;
      if (!g) return;
      g.classList.remove('l-gallery-switch'); void g.offsetWidth; g.classList.add('l-gallery-switch');
    });
    document.addEventListener('on:variant:change', (e) => {
      const form = e.target.closest ? e.target.closest('.product-info, product-form, .product, main') : null;
      (form || document).querySelectorAll('.product-price, .price, .product-info__price').forEach((p) => {
        p.classList.remove('l-flash'); void p.offsetWidth; p.classList.add('l-flash');
      });
    });
  };

  /* ---------- collection / search: busy shimmer while filters fetch, grid entrance ---------- */
  const initCollection = () => {
    const grid = document.querySelector('.main-products-grid, .collection .product-grid, .product-grid');
    if (!grid) return;
    [...grid.querySelectorAll('.product-block')].slice(0, 16).forEach((b, i) => { b.style.setProperty('--i', i); b.classList.add('l-grid-in'); });
    const wrap = grid.closest('.main-products-grid') || grid.parentElement;
    const mo = new MutationObserver((muts) => {
      const added = muts.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1 && (n.matches('.product-block') || n.querySelector('.product-block'))));
      if (!added) return;
      wrap.classList.remove('l-grid-busy');
      [...wrap.querySelectorAll('.product-block:not(.l-grid-in)')].slice(0, 16).forEach((b, i) => { b.style.setProperty('--i', i); b.classList.add('l-grid-in'); });
    });
    mo.observe(wrap, { childList: true, subtree: true });
    document.addEventListener('click', (e) => {
      const t = e.target.closest && e.target.closest('facet-filters a, .facets a, facet-filters input, .filter-group input, .utility-bar select, [data-sort-by], .active-filters a');
      if (t) wrap.classList.add('l-grid-busy');
    }, true);
    document.addEventListener('change', (e) => {
      if (e.target.closest && e.target.closest('facet-filters, .facets, .filter-group, .utility-bar')) wrap.classList.add('l-grid-busy');
    }, true);
    setInterval(() => { if (wrap.classList.contains('l-grid-busy') && !document.querySelector('facet-filters[aria-busy="true"], .is-loading')) setTimeout(() => wrap.classList.remove('l-grid-busy'), 1200); }, 1500);
    const ps = document.querySelector('predictive-search, .predictive-search');
    if (ps) new MutationObserver(() => [...ps.querySelectorAll('.product-block:not([data-l-i])')].forEach((b, i) => { b.dataset.lI = '1'; b.style.setProperty('--i', i); })).observe(ps, { childList: true, subtree: true });
  };

  /* ---------- per-section init (also runs on shopify:section:load) ---------- */
  const initSections = (root = document) => {
    initSplit(root);
    indexChildren('.l-ledger', '.l-ledger__row', root);
    indexChildren('.l-fit__specs', 'li', root);
    indexChildren('.l-footer__cols', ':scope > *', root);
    watch('.l-ledger, .l-fit, .l-fit__panel, .l-footer__cols', root);
    initCounters(root);
    initRails(root);
    if (L.initReveal) L.initReveal(root);
  };

  const start = () => {
    initHero();
    initSections();
    initScrollFallback();
    initPageTransitions();
    initCart();
    initProduct();
    initCollection();
    onIdle(initCursor);
    document.addEventListener('shopify:section:load', (e) => initSections(e.target));
    document.addEventListener('shopify:block:select', (e) => initSections(e.target));
  };
  L.motion = { splitWords, initSections, countUp };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
