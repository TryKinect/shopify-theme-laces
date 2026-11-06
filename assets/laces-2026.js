/* LACES 2026 design layer — small, dependency-free behaviours.
   - scroll reveal (.l-reveal)
   - compact header after scroll
   - tabbed product rails + rail arrows (built on Symmetry's <carousel-slider>)
   - shared product-title splitting used by cards (and by Kinect's swatch swap) */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  window.LACES = Object.assign(window.LACES || {}, { splitTitle, renderCardTitle });

  /* ---------- Scroll reveal ---------- */
  const initReveal = (root = document) => {
    const els = [...root.querySelectorAll('.l-reveal:not(.is-in):not([data-l-observed])')];
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((e) => { e.dataset.lObserved = '1'; io.observe(e); });
  };

  /* ---------- Compact sticky header ---------- */
  const initHeader = () => {
    const root = document.documentElement;
    let ticking = false;
    const update = () => { root.classList.toggle('l-header-compact', window.scrollY > 90); ticking = false; };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  };

  /* ---------- Tabbed product rails ---------- */
  const initRails = (root = document) => {
    root.querySelectorAll('[data-l-rail]:not([data-l-ready])').forEach((rail) => {
      rail.dataset.lReady = '1';
      const tabs = [...rail.querySelectorAll('[role="tab"]')];
      const panels = [...rail.querySelectorAll('.l-rail-panel')];
      const viewAll = rail.querySelector('[data-l-view-all]');
      const prev = rail.querySelector('[data-l-prev]');
      const next = rail.querySelector('[data-l-next]');
      const activePanel = () => panels.find((p) => !p.hidden);
      const syncArrows = () => {
        const panel = activePanel();
        const slider = panel && panel.querySelector('.slider');
        if (!slider || !prev || !next) return;
        const max = slider.scrollWidth - slider.clientWidth - 2;
        prev.disabled = slider.scrollLeft <= 2;
        next.disabled = slider.scrollLeft >= max;
      };
      const activate = (i) => {
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
        panels.forEach((p, j) => { p.hidden = i !== j; });
        const panel = panels[i];
        if (viewAll && panel && panel.dataset.url) { viewAll.href = panel.dataset.url; }
        window.dispatchEvent(new CustomEvent('on:debounced-resize'));
        initReveal(panel);
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
      window.addEventListener('on:debounced-resize', syncArrows);
      rail.lUnbind = () => window.removeEventListener('on:debounced-resize', syncArrows);
      setTimeout(syncArrows, 300);
    });
  };

  /* ---------- Hero video: respect reduced motion / data saver ---------- */
  const initHeroVideo = () => {
    document.querySelectorAll('.l-hero video[autoplay]').forEach((v) => {
      const saveData = navigator.connection && navigator.connection.saveData;
      if (reduceMotion || saveData) { v.removeAttribute('autoplay'); v.pause(); v.style.display = 'none'; return; }
      const p = v.play(); if (p && p.catch) p.catch(() => { v.style.display = 'none'; });
    });
  };

  const start = () => {
    initReveal();
    initHeader();
    initRails();
    initHeroVideo();
    // Sections injected in the theme editor
    document.addEventListener('shopify:section:load', (e) => { initReveal(e.target); initRails(e.target); initHeroVideo(); });
    document.addEventListener('shopify:section:unload', (e) => { e.target.querySelectorAll('[data-l-rail]').forEach((r) => r.lUnbind && r.lUnbind()); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
