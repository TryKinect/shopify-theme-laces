/* Kinect x LACES: color-family swatches on product cards.
   Swatch buttons are rendered by snippets/k-card-swatches.liquid from custom.sibling_products;
   this script colors them from the colorway in the title and swaps the card on hover/click. */
(() => {
  const COLORS = {
    black: '#151515', white: '#f7f7f5', offwhite: '#ece6d8', cream: '#efe7d2', ube: '#7d5fa8', purple: '#6b4fa0',
    blue: '#2f5fb3', navy: '#1f2a44', bolt: '#1e88e5', gold: '#d4a72c', red: '#b3262e', poppy: '#e0463a',
    orange: '#e8742b', green: '#2f5d3a', tan: '#c9ae86', mocha: '#7a5a45', greige: '#b8ae9f',
    gray: '#9a9a9a', grey: '#9a9a9a', heathergray: '#a9a9ab', pink: '#e8a3b5', brown: '#6b4a32'
  };
  const PAIRS = { 'off white': 'offwhite', 'heather gray': 'heathergray', 'heather grey': 'heathergray', 'poppy red': 'poppy', 'bolt blue': 'bolt' };

  const colorsFrom = (title) => {
    let t = title.toLowerCase().replace(/off-white/g, 'off white');
    Object.entries(PAIRS).forEach(([k, v]) => { t = t.split(k).join(v); });
    const words = t.replace(/[^a-z ]+/g, ' ').trim().split(/\s+/);
    const out = [];
    for (let i = words.length - 1; i >= 0 && COLORS[words[i]]; i--) out.unshift(words[i]);
    return out;
  };

  const paint = (btn) => {
    const hex = colorsFrom(btn.dataset.title || '').map((c) => COLORS[c]);
    if (hex.length === 1) btn.style.background = hex[0];
    else if (hex.length > 1) btn.style.background = `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)`;
    else if (btn.dataset.thumb) btn.style.background = `#eee url("${btn.dataset.thumb}") center / cover`;
  };

  const swap = (card, btn) => {
    card.querySelectorAll('a.product-link, a.quickbuy-toggle').forEach((a) => { a.href = btn.dataset.url; });
    const title = card.querySelector('.product-block__title');
    if (title) title.textContent = btn.dataset.title;
    const img = card.querySelector('.product-block__image--primary img, .image-cont img');
    if (img && btn.dataset.img) {
      if (!img.dataset.kOrigSrc) { img.dataset.kOrigSrc = img.currentSrc || img.src; img.dataset.kOrigSrcset = img.srcset || ''; }
      if (btn.classList.contains('k-swatch--origin')) {
        img.src = img.dataset.kOrigSrc; if (img.dataset.kOrigSrcset) img.srcset = img.dataset.kOrigSrcset;
      } else { img.removeAttribute('srcset'); img.src = btn.dataset.img; }
    }
    const price = card.querySelector('.product-price--block');
    if (price && btn.dataset.price !== undefined) price.innerHTML = btn.dataset.price;
    const labels = card.querySelector('.k-label-slot');
    if (labels && btn.dataset.label !== undefined) labels.innerHTML = btn.dataset.label;
    const qa = card.querySelector('.k-quick-add');
    if (qa && btn.dataset.variant !== undefined) {
      const available = btn.dataset.available === 'true';
      const direct = available && btn.dataset.single === 'true';
      const input = qa.querySelector('input[name="id"]');
      if (input) input.value = btn.dataset.variant;
      qa.querySelector('.k-quick-add__form').hidden = !direct;
      const link = qa.querySelector('.k-quick-add__link');
      link.hidden = direct;
      link.href = btn.dataset.url;
      link.textContent = available ? 'Choose options' : 'Sold out';
    }
    card.querySelectorAll('.k-swatch').forEach((s) => s.classList.toggle('k-swatch--active', s === btn));
  };

  const init = (root) => {
    root.querySelectorAll('.k-swatches:not([data-k-ready])').forEach((wrap) => {
      wrap.dataset.kReady = '1';
      const card = wrap.closest('product-block');
      wrap.querySelectorAll('.k-swatch').forEach((btn) => {
        paint(btn);
        if (btn.classList.contains('k-swatch--active')) btn.classList.add('k-swatch--origin');
        if (!card) return;
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); swap(card, btn); });
        btn.addEventListener('mouseenter', () => swap(card, btn));
      });
    });
  };

  const start = () => {
    init(document);
    let t;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => init(document), 100); })
      .observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
