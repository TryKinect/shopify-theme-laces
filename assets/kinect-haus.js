/* Kinect x LACES: color-family swatches on product cards.
   LACES sells each colorway as its own product ("Snapback - The Bay - Black/Orange"),
   so siblings are grouped by title with trailing color words stripped. */
(() => {
  const COLORS = {
    black: '#151515', white: '#f7f7f5', offwhite: '#ece6d8', cream: '#efe7d2', ube: '#7d5fa8', purple: '#6b4fa0',
    blue: '#2f5fb3', navy: '#1f2a44', bolt: '#1e88e5', gold: '#d4a72c', red: '#b3262e', poppy: '#e0463a',
    orange: '#e8742b', green: '#2f5d3a', tan: '#c9ae86', mocha: '#7a5a45', greige: '#b8ae9f',
    gray: '#9a9a9a', grey: '#9a9a9a', heathergray: '#a9a9ab', pink: '#e8a3b5', brown: '#6b4a32'
  };
  const MODIFIERS = { off: 'offwhite', heather: 'heathergray', poppy: 'poppy', bolt: 'bolt' };
  const WORDS = new Set([...Object.keys(COLORS), ...Object.keys(MODIFIERS)]);
  const CACHE_KEY = 'k-families-v2';
  const MAX_SWATCHES = 7;

  const parse = (title) => {
    const tokens = title.toLowerCase().replace(/off-white/g, 'off white').replace(/[^a-z0-9™' ]+/g, ' ').trim().split(/\s+/);
    const colorTokens = [];
    while (tokens.length > 1 && WORDS.has(tokens[tokens.length - 1])) colorTokens.unshift(tokens.pop());
    const colors = [];
    for (let i = 0; i < colorTokens.length; i++) {
      const t = colorTokens[i];
      if (MODIFIERS[t] && colorTokens[i + 1] && t !== 'poppy' && t !== 'bolt') { colors.push(MODIFIERS[t]); i++; }
      else if (MODIFIERS[t]) { colors.push(MODIFIERS[t]); if (colorTokens[i + 1] === 'red' || colorTokens[i + 1] === 'blue') i++; }
      else colors.push(t);
    }
    return { family: tokens.join(' '), colors };
  };

  const swatchBg = (colors) => {
    const hex = colors.map((c) => COLORS[c]).filter(Boolean);
    if (!hex.length) return null;
    if (hex.length === 1) return hex[0];
    return `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)`;
  };

  const loadProducts = async () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < 30 * 60 * 1000) return cached.p;
    } catch (e) { /* ignore */ }
    const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    const res = await fetch(`${root}collections/all?section_id=k-families`, { credentials: 'same-origin' });
    if (!res.ok) return [];
    const html = await res.text();
    const m = html.match(/<script[^>]*id="k-families-data"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return [];
    const p = JSON.parse(m[1]);
    if (!p.length) return [];
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), p })); } catch (e) { /* ignore */ }
    return p;
  };

  let families = null;
  let byId = null;

  const buildIndex = (products) => {
    families = new Map();
    byId = new Map();
    products.forEach((p) => {
      const { family, colors } = parse(p.title);
      const bg = swatchBg(colors);
      if (!bg) return;
      const entry = { ...p, family, colors, bg };
      byId.set(p.id, entry);
      if (!families.has(family)) families.set(family, []);
      families.get(family).push(entry);
    });
  };

  
  const swapCard = (card, entry, original) => {
    const url = `${(window.Shopify && Shopify.routes && Shopify.routes.root) || '/'}products/${entry.handle}`;
    card.querySelectorAll('a.product-link, a.quickbuy-toggle').forEach((a) => { a.href = url; });
    const title = card.querySelector('.product-block__title');
    if (title) title.textContent = entry.title;
    const img = card.querySelector('.product-block__image--primary img, .image-cont img');
    if (img && entry.img) {
      if (!img.dataset.kOrigSrc) { img.dataset.kOrigSrc = img.currentSrc || img.src; img.dataset.kOrigSrcset = img.srcset || ''; }
      if (entry.id === original) { img.src = img.dataset.kOrigSrc; if (img.dataset.kOrigSrcset) img.srcset = img.dataset.kOrigSrcset; }
      else { img.removeAttribute('srcset'); img.src = entry.img; }
    }
    card.dataset.kActive = entry.id;
    card.querySelectorAll('.k-swatch').forEach((s) => s.classList.toggle('k-swatch--active', s.dataset.id === entry.id));
  };

  const decorate = (card) => {
    if (card.dataset.kSwatched) return;
    const id = card.dataset.productId;
    const self = byId.get(id);
    card.dataset.kSwatched = '1';
    card.dataset.kActive = id;
    if (!self) return;
    const siblings = families.get(self.family) || [];
    if (siblings.length < 2) return;
    const detail = card.querySelector('.product-block__detail');
    if (!detail) return;
    const ordered = [self, ...siblings.filter((s) => s.id !== id)];
    const wrap = document.createElement('div');
    wrap.className = 'k-swatches';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Colors');
    ordered.slice(0, MAX_SWATCHES).forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `k-swatch${s.id === id ? ' k-swatch--active' : ''}`;
      b.dataset.id = s.id;
      b.style.setProperty('--k-sw', s.bg);
      b.setAttribute('aria-label', s.colors.join(' / '));
      b.title = s.colors.map((c) => c.replace('offwhite', 'off-white').replace('heathergray', 'heather gray')).join(' / ');
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); swapCard(card, s, id); });
      b.addEventListener('mouseenter', () => swapCard(card, s, id));
      wrap.appendChild(b);
    });
    if (ordered.length > MAX_SWATCHES) {
      const more = document.createElement('span');
      more.className = 'k-swatches__more';
      more.textContent = `+${ordered.length - MAX_SWATCHES}`;
      wrap.appendChild(more);
    }
    detail.prepend(wrap);
  };

  const run = () => { if (families) document.querySelectorAll('product-block[data-product-id]').forEach(decorate); };

  const init = async () => {
    if (!document.querySelector('product-block[data-product-id]') && !document.querySelector('.collection-listing, .product-grid')) return;
    let products = [];
    try { products = await loadProducts(); } catch (e) { return; }
    if (!products.length) return;
    buildIndex(products);
    run();
    let t;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 120); }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
