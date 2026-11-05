/* LACES homepage sections: scroll reveal (.l-reveal) and tabbed product rails ([data-l-rail]). */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const start = () => {
    initReveal();
    initRails();
    document.addEventListener('shopify:section:load', (e) => { initReveal(e.target); initRails(e.target); });
    document.addEventListener('shopify:section:unload', (e) => { e.target.querySelectorAll('[data-l-rail]').forEach((r) => r.lUnbind && r.lUnbind()); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
