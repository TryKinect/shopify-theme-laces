# LACES Phase 2 — Implementation Notes

Branch: `redesign/laces-2026-motion` (parent: `redesign/laces-2026` @ `dbc04ec`). Nothing published; the private development theme serves the branch.

## Preview

```bash
cd "/Users/ajaymalasha/Downloads/theme_export__getlaces-co-kinect-theme__04NOV2026-1131am"
git checkout redesign/laces-2026-motion
shopify theme dev --store xduwhm-w3.myshopify.com --port 9393 --host 127.0.0.1
```
Local: **http://127.0.0.1:9393** · Shareable dev theme: `https://xduwhm-w3.myshopify.com/?preview_theme_id=188154970330` (id printed by the CLI; it re-authenticates via a browser code if the session has expired).

---

## 1. Architecture

```
assets/laces-2026.css      Phase 1 design layer (unchanged)
assets/laces-motion.css    NEW — motion tokens, reveal system, scroll-driven effects, interaction states (30 KB raw / 6.7 KB gz)
assets/laces-2026.js       REWRITTEN as one controller (17 KB raw / 5.6 KB gz) — same public API + motion
snippets/laces-split-words.liquid   NEW — server-side word split for above-the-fold display text
```

`layout/theme.liquid` loads `laces-motion.css` directly after `laces-2026.css`; the JS order is unchanged (`laces-2026.js` before `kinect-haus.js`, both deferred).

### JavaScript controller (`window.LACES`)
| Member | Purpose |
| --- | --- |
| `splitTitle`, `renderCardTitle` | **Unchanged Phase 1 API** (used by `kinect-haus.js` swatch swaps) |
| `motion.observe(root)` | single `IntersectionObserver` for `.l-reveal / .l-mask / .l-rule / .l-ledger / .l-fit / [data-l-split] / [data-l-count]`; marks `data-l-observed` so nothing is observed twice |
| `motion.splitWords(el)` | wraps words in `.l-w > span`, preserving inline children; skipped under reduced motion and when the text is already visible after a late load |
| `motion.countUp(el)` | animates numbers already present in markup; restores exact original text at the end |
| `motion.init(root)` | hero video guard, grid indexing, legacy-section adoption, observe, rails, pointer parallax — also runs on `shopify:section:load` |

Re-init strategy: one debounced `MutationObserver` on `body` picks up AJAX-injected content (filters, quick buy, search results, cart merges) and calls `observe()`/`indexGrids()`; elements are idempotent via `data-l-*` flags. No per-section observers, no scroll listeners beyond the rAF-throttled header toggle.

### Hooks into Symmetry (read-only, no cart logic replaced)
`on:cart:add` (bubbling) → button "Added ✓" + badge bump · `.cart-item-list__body` child insertions → `.is-new` slide-in · `.cart-item__remove` click → `.is-removing` fade (Symmetry removes the node after its fetch) · `.merge-remove-item` / `.merge-item-refreshing` (Symmetry classes) → styled · `.is-loading` on submit buttons (Symmetry) → spinner · `.main-search--loading` (Symmetry) → scanning underline · `navigation__item--show-children` → mega-menu entrance · `reveal-mobile-nav` → drawer cascade.

### Libraries
None added. GSAP/ScrollTrigger/Lenis evaluated and rejected (see research): every effect is CSS `transform/opacity/clip-path`, native scroll-driven animation inside `@supports`, or ~200 lines of vanilla JS.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `assets/laces-motion.css` | new |
| `assets/laces-2026.js` | rewritten controller (API preserved) |
| `snippets/laces-split-words.liquid` | new |
| `layout/theme.liquid` | +1 stylesheet tag |
| `sections/laces-hero.liquid` | headline words split server-side (`.l-w` spans); `.l-hero__cue` scroll indicator |
| `sections/laces-category-tiles.liquid` | tiles `l-reveal` → `l-mask`; `data-l-count` on counts; `data-l-split` on title |
| `sections/laces-product-rail.liquid` | `data-l-split` on title; panels `l-reveal--fade` (indicator element is injected by JS) |
| `sections/laces-athlete-fund.liquid` | image `l-mask`; heading `data-l-split`; ledger self-choreographed; `data-l-count` on value |
| `sections/laces-collab-stories.liquid` | cards `l-reveal--fade`; media `l-mask` with stagger; `data-l-split` |
| `sections/laces-fit-compare.liquid` | media `l-mask l-mask--left`; `data-l-split` |
| `sections/laces-campaign.liquid` | title `data-l-split` (fade variant) |
| `sections/laces-community.liquid` | items `l-mask`; `data-l-split` |
| `sections/laces-footer.liquid` | band title `data-l-split` |
| `sections/main-collection.liquid` | H1 rendered through `laces-split-words` (`.l-split-auto`) |
| `docs/…` | research, motion system, these notes, QA, screenshots |

Not touched: `kinect-haus.css`, `kinect-haus.js`, all `k-*` sections/snippets, `main.css/js`, app blocks, cart/variant/filter logic, templates JSON, settings, locales.

---

## 3. Technical decisions
- **LCP protection.** Phase 1 faded the hero image in over 1.6 s (`.l-hero__fade`), which delays when Chrome counts the LCP element as painted. Phase 2 keeps the image opaque and animates only `transform` (1.08 → 1). Measured LCP on the same dev proxy: 4.1 s → 2.1–2.5 s.
- **CLS fix.** Symmetry sets `--theme-header-height` from JS after load; with the transparent header this made `<main>` jump up by the header height (CLS 0.08). `laces-motion.css` now declares the real header heights as defaults (77 px desktop / 65 px mobile). Measured CLS: 0.086 → 0.002.
- **Server-side word splitting** for the hero and collection H1 so the kinetic headline never depends on script arrival (the deferred script can land after the fallback line animation has started on slow connections). JS splitting is reserved for headings hidden behind a reveal.
- **Late-load guard.** If the script arrives >1.5 s after navigation and a split target is already visible with no reveal wrapper, it is left alone (no re-animation flash).
- **Safety nets.** `.l-reveal`, `.l-mask`, `.l-ledger__row`, `.l-fit__vs`, `.l-w` all force themselves visible via a 2.5 s CSS keyframe if the observer never fires.
- **Scroll-driven animations** use `scroll(root)` for the hero (length ranges `0px–90vh`) and `view()` for mid-page images; all inside `@supports (animation-timeline: …)`.
- **View transitions** are cross-document and CSS-only; no JS navigation interception, so Shopify apps and `theme.liquid` scripts are unaffected.

---

## 4. Known limitations
- Predictive search results do not return through the local CLI proxy in this environment (the request stays pending); the loading indicator was verified, the result-card entrance animation was verified on the Phase 1 build and by CSS inspection only.
- Scroll-driven parallax/dissolve requires Chromium 115+ / Safari 26; Firefox and older Safari show the static Phase 1 hero (by design).
- `::view-transition` crossfade is Chromium 126+ / Safari 18.2+; elsewhere navigation is unchanged.
- Hover-only refinements (tile parallax, fit panel dimming, card zoom) are gated to `(hover: hover) and (pointer: fine)`; touch devices get press feedback instead.
- Dev-proxy performance numbers are relative only; the CLI proxy adds seconds of latency that the Shopify CDN does not.
- The old disabled homepage sections and footer from Phase 1 are intentionally kept for rollback.
