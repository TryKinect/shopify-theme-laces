/* LACES 2026 design layer — Phase 2 motion edition.
   One lightweight controller (window.LACES) for:
   - shared product-title splitting (used by cards and Kinect swatch swaps)   [API: splitTitle, renderCardTitle]
   - unified reveal observer (.l-reveal / .l-mask / .l-rule / .l-ledger / .l-fit / split text / counters)
   - headline word splitting, number count-ups
   - tabbed product rails (indicator, panel entrance, arrows) on top of Symmetry's <carousel-slider>
   - pointer parallax (feature tile, desktop fine-pointer only)
   - interaction feedback wired to Symmetry events (on:cart:add, cart merges) — no cart logic is replaced
   - compact header, hero video guard, save-data flag, theme-editor re-init
   Dependency-free; transforms/opacity only; honours prefers-reduced-motion and Save-Data. */
(() => {
  const root = document.documentElement;
  const mq = (q) => window.matchMedia(q).matches;
  const reduceMotion = mq('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const finePointer = mq('(hover: hover) and (pointer: fine)');
  if (saveData) root.classList.add('l-save-data');
  if (reduceMotion) root.classList.add('l-reduced-motion');

  /* ---------- Title split: "Snapback - Bay Area Downside Up - Blue/Gold" ---------- */
  const FITS = ['snapback', 'dad hat', 'hoodie', 'beanie', 'bucket', 'trucker', 'crew sock', 'crew socks', 'socks'];
  const splitTitle = (title) => {
    const raw = (title || '').trim();
    const sep = raw.includes(' - ') ? ' - ' : (raw.includes(' | ') ? ' | ' : null);
    if (!sep) return { kicker: '', name: raw, colorway: '' };
    const parts = raw.split(sep).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) return { kicker: '', name: raw, colorway: '' };
    const isFit = (p) => FITS.includes(p.toLowerCase());
    if (isFit(parts[0])) {
      const kicker = parts[0];
      if (parts.length === 2) return { kicker, name: parts[1], colorway: '' };
      return { kicker, name: parts.slice(1, -1).join(' - '), colorway: parts[parts.length - 1] };
    }
    if (isFit(parts[parts.length - 1])) {
      const kicker = parts[parts.length - 1];
      return { kicker, name: parts[0], colorway: parts.slice(1, -1).join(' · ') };
    }
    return { kicker: '', name: parts[0], colorway: parts.slice(1).join(' · ') };
  };
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const renderCardTitle = (el, title) => {
    if (!el) return;
    const t = splitTitle(title);
    el.innerHTML = `${t.kicker ? `<span class="l-card__kicker">${esc(t.kicker)}</span>` : ''}<span class="l-card__name">${esc(t.name)}</span>${t.colorway ? `<span class="l-card__colorway">${esc(t.colorway)}</span>` : ''}`;
  };

  /* ---------- Word splitting (kinetic typography) ---------- */
  // Wraps each word of the element's text nodes in <span class="l-w"><span>word</span></span>,
  // preserving inline children (<em>, <br>). Spaces stay as text so wrapping is unchanged.
  const splitWords = (el) => {
    if (!el || el.dataset.lSplitDone || reduceMotion) return 0;
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const text = child.textContent;
          if (!text.trim()) return;
          const frag = document.createDocumentFragment();
          text.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            const outer = document.createElement('span'); outer.className = 'l-w';
            const inner = document.createElement('span'); inner.textContent = tok; inner.style.setProperty('--w', i++);
            outer.appendChild(inner); frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('l-w')) {
          walk(child);
        }
      });
    };
    walk(el);
    el.dataset.lSplitDone = '1';
    el.classList.add('is-split');
    return i;
  };

  /* ---------- Count-up for numbers that are already in the markup ---------- */
  const countUp = (el) => {
    if (el.dataset.lCounted || reduceMotion) return;
    el.dataset.lCounted = '1';
    const text = el.textContent;
    const m = text.match(/(\d[\d,]*)/);
    if (!m) return;
    const target = parseInt(m[1].replace(/,/g, ''), 10);
    if (!(target > 0)) return;
    const start = performance.now(), dur = Math.min(1100, 500 + target * 6);
    const fmt = (n) => text.replace(m[1], n.toLocaleString());
    el.textContent = fmt(0);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Unified reveal observer ---------- */
  const REVEAL_SEL = '.l-reveal, .l-mask, .l-rule, .l-ledger, .l-fit, [data-l-split], [data-l-count]';
  let io = null;
  const onIntersect = (entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('is-in');
      if (el.hasAttribute('data-l-count')) countUp(el);
      el.querySelectorAll('[data-l-count]').forEach(countUp);
      obs.unobserve(el);
    });
  };
  const observe = (rootEl = document) => {
    const els = [...rootEl.querySelectorAll(REVEAL_SEL)].filter((e) => !e.dataset.lObserved);
    if (rootEl !== document && rootEl.matches && rootEl.matches(REVEAL_SEL) && !rootEl.dataset.lObserved) els.unshift(rootEl);
    if (!els.length) return;
    const inView = (e) => { const r = e.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
    els.forEach((e) => {
      if (!e.hasAttribute('data-l-split')) return;
      // Late arrival + already visible + not hidden by a reveal wrapper → leave the text as it is (no re-animation)
      if (performance.now() > 1500 && inView(e) && !e.closest('.l-reveal')) { e.dataset.lSplitDone = '1'; return; }
      splitWords(e);
    });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((e) => { e.dataset.lObserved = '1'; e.classList.add('is-in'); });
      return;
    }
    if (!io) io = new IntersectionObserver(onIntersect, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((e) => { e.dataset.lObserved = '1'; io.observe(e); });
  };
  // Theme sections we don't own (reviews, press, legacy featured collections): reveal only if below the fold
  const adoptLegacy = (rootEl = document) => {
    const sel = '.section-testimonials .testimonial-list, .section-scrolling-banner .scrolling-banner, .collection-slider-row .hometitle, .l-footer__band-inner, .l-footer__main';
    rootEl.querySelectorAll(sel).forEach((el) => {
      if (el.classList.contains('l-reveal') || el.dataset.lObserved) return;
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('l-reveal');
    });
  };

  /* ---------- Hero ---------- */
  const initHero = (rootEl = document) => {
    rootEl.querySelectorAll('.l-hero').forEach((hero) => {
      // Headline words are split server-side (laces-hero.liquid); nothing to do here for typography.
      hero.querySelectorAll('video[autoplay]').forEach((v) => {
        if (reduceMotion || saveData) { v.removeAttribute('autoplay'); v.pause(); v.style.display = 'none'; return; }
        const p = v.play(); if (p && p.catch) p.catch(() => { v.style.display = 'none'; });
      });
    });
  };

  /* ---------- Compact sticky header ---------- */
  const initHeader = () => {
    let ticking = false;
    const update = () => { root.classList.toggle('l-header-compact', window.scrollY > 90); ticking = false; };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  };

  /* ---------- Tabbed product rails ---------- */
  const initRails = (rootEl = document) => {
    rootEl.querySelectorAll('[data-l-rail]:not([data-l-ready])').forEach((rail) => {
      rail.dataset.lReady = '1';
      const tabs = [...rail.querySelectorAll('[role="tab"]')];
      const tablist = rail.querySelector('.l-tabs');
      const panels = [...rail.querySelectorAll('.l-rail-panel')];
      const viewAll = rail.querySelector('[data-l-view-all]');
      const prev = rail.querySelector('[data-l-prev]');
      const next = rail.querySelector('[data-l-next]');
      let ind = null;
      if (tablist && tabs.length > 1 && !reduceMotion) {
        ind = document.createElement('span'); ind.className = 'l-tabs__ind'; ind.setAttribute('aria-hidden', 'true');
        tablist.prepend(ind);
      }
      const placeInd = () => {
        if (!ind) return;
        const t = tabs.find((x) => x.getAttribute('aria-selected') === 'true');
        if (!t) return;
        ind.style.width = `${t.offsetWidth}px`;
        ind.style.transform = `translateX(${t.offsetLeft}px)`;
        tablist.classList.add('has-ind');
      };
      const activePanel = () => panels.find((p) => !p.hidden);
      const syncArrows = () => {
        const panel = activePanel();
        const slider = panel && panel.querySelector('.slider');
        if (!slider || !prev || !next) return;
        const max = slider.scrollWidth - slider.clientWidth - 2;
        prev.disabled = slider.scrollLeft <= 2;
        next.disabled = slider.scrollLeft >= max;
      };
      let enterTimer;
      const activate = (i) => {
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
        panels.forEach((p, j) => { p.hidden = i !== j; p.classList.remove('is-entering'); });
        const panel = panels[i];
        if (panel && !reduceMotion) { panel.classList.add('is-entering'); clearTimeout(enterTimer); enterTimer = setTimeout(() => panel.classList.remove('is-entering'), 900); }
        if (viewAll && panel && panel.dataset.url) viewAll.href = panel.dataset.url;
        window.dispatchEvent(new CustomEvent('on:debounced-resize'));
        placeInd();
        observe(panel);
        requestAnimationFrame(syncArrows);
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => activate(i));
        t.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          activate(n); tabs[n].focus();
        });
      });
      const scrollBy = (dir) => {
        const panel = activePanel();
        const slider = panel && panel.querySelector('.slider');
        if (!slider) return;
        slider.scrollBy({ left: dir * Math.max(240, slider.clientWidth * 0.8), behavior: reduceMotion ? 'auto' : 'smooth' });
      };
      if (prev) prev.addEventListener('click', () => scrollBy(-1));
      if (next) next.addEventListener('click', () => scrollBy(1));
      panels.forEach((p) => { const s = p.querySelector('.slider'); if (s) s.addEventListener('scroll', () => requestAnimationFrame(syncArrows), { passive: true }); });
      window.addEventListener('on:debounced-resize', () => { syncArrows(); placeInd(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInd);
      setTimeout(() => { syncArrows(); placeInd(); }, 300);
    });
  };

  /* ---------- Pointer parallax on the feature category tile (desktop only) ---------- */
  const initParallaxTiles = (rootEl = document) => {
    if (!finePointer || reduceMotion) return;
    rootEl.querySelectorAll('.l-tiles--feature .l-tile:first-child:not([data-l-px])').forEach((tile) => {
      tile.dataset.lPx = '1';
      let raf = 0, x = 0, y = 0;
      const apply = () => { tile.style.setProperty('--l-px', `${x}px`); tile.style.setProperty('--l-py', `${y}px`); raf = 0; };
      tile.addEventListener('pointermove', (e) => {
        const r = tile.getBoundingClientRect();
        x = ((e.clientX - r.left) / r.width - 0.5) * -14;
        y = ((e.clientY - r.top) / r.height - 0.5) * -14;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      tile.addEventListener('pointerleave', () => { x = 0; y = 0; if (!raf) raf = requestAnimationFrame(apply); });
    });
  };

  /* ---------- Interaction feedback wired to Symmetry / Kinect events ---------- */
  const initFeedback = () => {
    // Swatch swap: brief settle animation on the card text (Kinect does the actual swap)
    document.addEventListener('click', (e) => {
      const sw = e.target.closest('.k-swatch');
      if (!sw) return;
      const card = sw.closest('product-block');
      if (!card) return;
      card.classList.remove('is-swapping'); void card.offsetWidth; card.classList.add('is-swapping');
      setTimeout(() => card.classList.remove('is-swapping'), 400);
    }, true);

    // Add to cart success: button confirms, cart count bumps
    const confirmBtn = (btn) => {
      if (!btn || btn.dataset.lConfirming) return;
      btn.dataset.lConfirming = '1';
      const label = btn.querySelector('span:not(.visually-hidden)') || btn;
      const original = label.textContent;
      btn.classList.add('l-added');
      label.textContent = 'Added ✓';
      setTimeout(() => { label.textContent = original; btn.classList.remove('l-added'); delete btn.dataset.lConfirming; }, 1400);
    };
    document.addEventListener('on:cart:add', (e) => {
      const form = e.target && e.target.closest ? e.target.closest('product-form, form') : null;
      const btn = form && form.querySelector('[name="add"], .k-quick-add__btn, .add-to-cart');
      confirmBtn(btn);
      // Immediate bump on the header badge; the count text itself refreshes when Symmetry re-fetches the header
      const c = document.querySelector('.cart-link__count');
      if (c) { c.classList.remove('is-bumping'); void c.offsetWidth; c.classList.add('is-bumping'); }
    });
    // Cart count bump on any change of the header badge
    const count = document.querySelector('.cart-link__count');
    if (count && 'MutationObserver' in window) {
      let last = count.textContent.trim();
      new MutationObserver(() => {
        const now = count.textContent.trim();
        if (now === last) return;
        last = now;
        count.classList.remove('is-bumping'); void count.offsetWidth; count.classList.add('is-bumping');
      }).observe(count, { childList: true, characterData: true, subtree: true });
    }
    // Cart drawer: mark newly merged line items, fade items being removed
    const list = document.querySelector('.cart-drawer .cart-item-list__body');
    if (list && 'MutationObserver' in window) {
      new MutationObserver((muts) => {
        muts.forEach((m) => m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1 || !n.hasAttribute('data-merge-list-item')) return;
          n.classList.add('is-new');
          setTimeout(() => n.classList.remove('is-new'), 700);
        }));
      }).observe(list, { childList: true });
    }
    document.addEventListener('click', (e) => {
      const rm = e.target.closest('.cart-drawer .cart-item__remove');
      if (rm) { const item = rm.closest('[data-merge-list-item]'); if (item) item.classList.add('is-removing'); }
    }, true);
    // Kinect quick add: loading state while Symmetry's product-form posts
    document.addEventListener('submit', (e) => {
      const btn = e.target.closest && e.target.closest('.k-quick-add__form') && e.target.querySelector('.k-quick-add__btn');
      if (btn) { btn.classList.add('is-loading'); setTimeout(() => btn.classList.remove('is-loading'), 2500); }
    }, true);
    document.addEventListener('on:cart:add', () => document.querySelectorAll('.k-quick-add__btn.is-loading').forEach((b) => b.classList.remove('is-loading')));
    document.addEventListener('on:cart:error', () => document.querySelectorAll('.k-quick-add__btn.is-loading').forEach((b) => b.classList.remove('is-loading')));
  };

  /* ---------- Product grids: stagger index for entrance ---------- */
  const indexGrids = (rootEl = document) => {
    rootEl.querySelectorAll('.product-grid:not(.product-grid--carousel)').forEach((grid) => {
      [...grid.children].forEach((c, i) => { if (!c.style.getPropertyValue('--i')) c.style.setProperty('--i', Math.min(i, 11)); });
    });
  };

  /* ---------- Boot / re-init ---------- */
  const init = (rootEl = document) => {
    initHero(rootEl);
    indexGrids(rootEl);
    adoptLegacy(rootEl);
    observe(rootEl);
    initRails(rootEl);
    initParallaxTiles(rootEl);
  };
  const start = () => {
    init();
    initHeader();
    initFeedback();
    // Content injected later (AJAX filtering, quick buy, search results, theme editor)
    let t;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { indexGrids(); observe(); }, 120); })
      .observe(document.body, { childList: true, subtree: true });
    document.addEventListener('shopify:section:load', (e) => init(e.target));
  };

  window.LACES = Object.assign(window.LACES || {}, { splitTitle, renderCardTitle, motion: { observe, splitWords, countUp, init } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
