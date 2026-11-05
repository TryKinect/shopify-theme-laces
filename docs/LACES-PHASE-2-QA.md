# LACES Phase 2 — QA Report

Branch `redesign/laces-2026-motion`, tested on the Shopify CLI development theme (`http://127.0.0.1:9393`, Chromium webview, 5 Nov 2026). Storefront country set to United States so inventory renders as on the live store.

## 1. Viewports
| Width | Result |
| --- | --- |
| 375 (iPhone SE) | No horizontal overflow (`scrollWidth 375`). Hero stacks, headline words animate, scroll cue hidden. Drawer opens, items cascade in. |
| 390 (iPhone 14) | No overflow. Tiles 2-up with mask reveal, rail becomes native horizontal scroll, stories 1.3-up carousel, fit compare 2-up. Screenshots `after/16-*`, `after/17-*`. |
| 430 (iPhone Pro Max) | No overflow; hero 792 px tall (shorter than viewport, proof strip visible). |
| 768 / 820 (tablet) | Tiles 4-up feature grid, mega menu replaced by drawer, hover effects disabled (pointer: coarse). |
| 1024 | Tiles `234px × 4`, rail shows 4 full cards + peek, 20 items in active panel. |
| 1374–1440 (desktop) | All desktop screenshots in `docs/research/phase-2/after/`. |

## 2. Functional checks (all Shopify / app behaviour preserved)
| Area | Check | Result |
| --- | --- | --- |
| Hero | Headline words rise, image settles from 1.08, parallax + dissolve on scroll (`transform: matrix(1.027…,48)` at 300 px scroll; inner opacity .27), CTAs clickable throughout | Pass |
| Category tiles | 7 tiles mask-reveal in sequence, counts count up to real `collection.products_count`, links work | Pass |
| Product rail tabs | Indicator slides (`width 122px`, translateX), panel swaps with 20 cards staggering in, "View all" href follows active tab, arrow buttons scroll 80 % | Pass |
| Product cards | Hover crossfade to second image, swatch click swaps image/title with blink (via `kinect-haus.js` → `window.LACES.renderCardTitle`), quick-add button shows spinner then "Added ✓" | Pass |
| Athlete Fund | Heading with `<em>` preserved after split, ledger rows + hairlines draw in order, value counts up | Pass |
| Collab stories | Featured 2×2 card image fills, 5 story masks stagger, all links work | Pass |
| Fit compare | Left-to-right masks, VS medallion spins in, sibling-panel dimming on hover (desktop only) | Pass |
| Community | 5 image masks + roster card, external IG link | Pass |
| Header | Compact state after 90 px scroll, mega-menu columns cascade on open, keyboard focus states visible, logo/cart/search unaffected | Pass |
| Mobile drawer | `reveal-mobile-nav` opens, 6 tier-1 items cascade, footer block (Phase 1) intact, close via shade | Pass |
| Search | Overlay fade/slide, `.main-search--loading` scanning underline + spinner while pending | Pass (results pending — dev proxy limitation, pre-existing) |
| Collection | H1 words rise on load (server-side split, 2 words), 36 cards per page, sort → "Price, low to high" reorders, filter → count badge "(1)", Cal promo tile and Vitals stars render | Pass |
| Cart drawer | Opens from badge, slides in `.5s`, fund note present, Loop Checkout+ block + free-returns upsell render, qty +/− and Remove hit Symmetry's cart-form; new items slide in, badge bumps on count change | Pass |
| PDP | Title via `laces-product-title`, gallery, variant picker, fit/specs Kinect blocks, fund note block — unchanged behaviour | Pass |
| View transitions | Root crossfade on navigation in Chromium; no JS interception | Pass |

## 3. Accessibility
- `prefers-reduced-motion: reduce` (CDP emulation): 64 motion elements audited — all `opacity: 1`, `transform: none`, `clip-path: none`; hero keyframes disabled; tab indicator jumps instead of sliding; view transitions off. Content and CTAs unchanged.
- Save-Data (`navigator.connection.saveData`): `html.l-save-data` removes parallax and mask scale; reveals become simple fades.
- Keyboard: all tabs/arrows/swatches/menu links reachable; focus-visible ring (2 px ink) on `.l-btn`, `.l-link`, tiles and swatches; no hover-only functionality (hover only adds emphasis).
- Factual content (fund %, product counts, prices) is present in markup before any animation and restored verbatim after count-up.
- 2.5 s CSS safety net forces every reveal/mask visible if the observer never fires (e.g. script blocked).

## 4. Performance (same dev proxy, cold load, desktop 1374 px)
| Metric | Phase 1 baseline | Phase 2 | Note |
| --- | --- | --- | --- |
| LCP | 4128 ms | 2084–2532 ms | hero image no longer opacity-faded; LCP element paints immediately |
| CLS | 0.086 | 0.002 | `--theme-header-height` default added in CSS |
| Long tasks (>50 ms) | 12 | 6–7 | single observer, no scroll listeners |
| Added weight | — | +6.7 KB CSS gz, +5.6 KB JS gz (JS replaced Phase 1 file of 2.1 KB gz) | no third-party libraries |
| INP | not reliably measurable via CDP in the webview; interactions (tab switch, swatch, add to cart) observed <100 ms visually; all transitions on `transform/opacity/clip-path` | |

Absolute values include CLI proxy latency; use them for relative comparison only.

## 5. Theme check
`shopify theme check` — no new offences. Only pre-existing errors remain in Shogun-generated `sections/shogun-*.liquid` (unchanged files).

## 6. Browser support
| Feature | Chromium 115+ | Safari 18 | Safari 26 | Firefox |
| --- | --- | --- | --- | --- |
| Reveal/mask/word rise (IO + CSS) | ✓ | ✓ | ✓ | ✓ |
| Scroll-driven hero parallax/dissolve | ✓ | static | ✓ | static |
| `view()` image parallax | ✓ | static | ✓ | static |
| View transitions (cross-document) | ✓ 126+ | ✓ 18.2+ | ✓ | none |
| Reduced-motion / Save-Data | ✓ | ✓ (RM) | ✓ (RM) | ✓ (RM) |

## 7. Open items
- Predictive search results could not be observed in this dev environment (request never resolves through the CLI proxy); verify result-card stagger on the hosted preview URL.
- `INP` should be measured with the Web Vitals extension on the hosted dev theme before launch.
- Live-store step (not done, by instruction): merge to `main` and publish.
