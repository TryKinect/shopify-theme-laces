# LACES 2026 — Phase 2: Motion, Interaction & Experience Layer

Branch: `redesign/laces-2026-experience` (from `redesign/laces-2026`; `redesign/laces-2026-motion` was not used).
Nothing has been published or pushed to the live theme. Preview runs on the private development theme.

---

## 1. Research → creative direction

**What 2026 looks like.** The consensus across the trend reports and platform case studies we reviewed is "fewer, better, compositor-driven" motion: scrollytelling and kinetic type remain the signature techniques, but they are now judged by Core Web Vitals (INP especially), and native CSS scroll-driven animations have replaced JavaScript scroll listeners for the simple 80% of effects. Sources: [Web Animation Trends 2026](https://motionkit.io/blog/web-animation-trends-2026), Chrome's [scroll-driven animations in e-commerce](https://developer.chrome.com/blog/css-ui-ecommerce-sda) (Tokopedia: scroll CPU 50% → 2%), Chrome's [View Transitions case studies](https://developer.chrome.com/blog/view-transitions-case-studies) (Nykaa: "perception of speed"), WebKit's [two-line cross-document View Transitions](https://webkit.org/blog/16967/two-lines-of-cross-document-view-transitions-code-you-can-use-on-every-website-today/), and Awwwards SOTDs for [PUMA Velocity 2](https://www.awwwards.com/sites/puma-velocity-2-experience) and [Shopify Supply](https://www.awwwards.com/sites/shopify-supply-performance-pack) for the editorial/scroll-synced bar.

**Browser support that shaped the stack** (caniuse / web-features, Nov 2026): scroll-driven animations are Baseline (Chrome 115+, Safari 26+, Firefox 159+); cross-document View Transitions ~90% (Chrome 126+, Safari 18.2+; Firefox partial); both degrade to "nothing happens".

**Direction: "Quiet cinema."** Motion is used to do four jobs and nothing else:
1. **Arrive** — a single cinematic hero entrance (mask + settle + line reveals), header slides in with it.
2. **Reveal** — photography un-masks from the bottom as it enters; headlines rise word-by-word; the Fund block draws its ledger and counts its figure.
3. **Respond** — hover and tap feedback on every interactive element (cards lift, swatches scale, buttons sweep, tiles' arrows rotate, fit panels focus/dim).
4. **Continue** — crossfade page transitions, cart count bump, drawer cascade, "Added to bag" confirmation.

**Deliberately not done:** GSAP/Lenis (no dependency warranted), smooth-scroll hijacking, pinned sections (the Fund curtain + ledger is the storytelling beat; pinning would cost scroll length on mobile), 3D/WebGL, per-element fades on everything, custom cursor replacing the pointer (we show a small contextual hint only).

---

## 2. What was built

### New files
| File | Role |
| --- | --- |
| `assets/laces-motion.css` (~35 KB raw / ~7 KB gz) | All motion: hero entrance, native scroll-timeline parallax + Fund curtain, kinetic word reveals, masked photo reveals, hover choreography, rail/tab/grid entrances, mega-menu & drawer cascades, PDP/cart micro-interactions, cursor hint, reduced-motion & no-JS fallbacks. |
| `assets/laces-motion.js` (~13 KB raw / ~4 KB gz, no dependencies) | Word splitting (DOM-safe, preserves `<em>`/`<br>`), IntersectionObserver hooks, count-up, grid stagger + image-loaded flags, cart bump / "Added" label, rAF parallax fallback (only when `animation-timeline` is unsupported), cursor hint, save-data guard. |
| `docs/research/experience/` | QA screenshots. |

### Modified files
| File | Change |
| --- | --- |
| `layout/theme.liquid` | `data-l-motion/intensity/parallax/transitions/cursor` on `<html>`; loads the two motion assets when enabled; inline `@view-transition` rules (skipped in the theme editor). |
| `config/settings_schema.json` | New "LACES motion" block under *Animations*: master switch, intensity (subtle / standard / expressive), parallax, page transitions, cursor hints. |
| `assets/laces-2026.css` | One-line bug fix: `.pageheader` background used `rgb(var(--header-bg-col))` on a hex variable (invalid → transparent header over dark sections). Now `var(--header-bg-col, #fff)`. |

Everything else (sections, snippets, templates, Kinect layer, apps) is untouched; the layer attaches to existing class names.

### Section-by-section
| Area | Motion |
| --- | --- |
| **Hero** | Image un-masks (`clip-path` 8%→0) while settling from 1.08× scale; lines rise with 110 ms stagger; eyebrow rule draws; CTAs rise; proof strip fades last. Header slides down with it (home only, once). Scroll: media drifts +14% and copy fades (`scroll(root)` timeline). Video (if set) is skipped for reduced-motion/save-data. |
| **Buttons / links** | Fill sweeps left→right under the label; arrow nudges; underline retracts on hover. |
| **Section headings** | Split into words; each word rises from a clipped line box with 55 ms stagger; eyebrow rule draws; sub-copy and action follow. |
| **Category tiles** | Masked reveal + 1.14× → 1 image settle, body rises after; hover: title lifts, count slides, arrow fills and rotates 45°. |
| **Product rails** | Panel + cards enter when the rail is in view and again on tab switch (60 ms stagger); arrows invert on hover; "Drag" cursor hint; grab/grabbing cursor. |
| **Product cards** | Lift 4 px, name underline draws, swatches scale 1.25×, hover image crossfade (theme) smoothed, skeleton shimmer until the image loads, collection/search grids stagger in as they scroll into view, ajax filter/sort dims and re-enters the grid. |
| **Athlete Fund** | Section un-curtains (`clip-path` inset+radius → 0) over the first 55% of entry; image parallax inside; outlined word in the headline; ledger rows rise and draw their rules in sequence; "5%" counts up; image tag slides in. |
| **Collab stories** | Masked reveal; hover: chapter number inverts, title shifts, CTA underline retracts. Featured story title is split. |
| **Fit compare** | Spec chips stagger in; hovering a panel dims and slightly scales down the other while the "VS" medallion flips. |
| **Campaign** | Background parallax via named view timeline; words split; product card lifts and its image tilts on hover. |
| **Community** | Group reveal (rail-aware on mobile); captions lift on hover. |
| **Footer** | Band and columns rise on entry (scroll-timeline); link underlines draw; social icons lift; newsletter button sweeps; Fund card lifts. |
| **Header / nav** | Logo scales to 0.86 when compact; nav underline grows; mega-menu columns cascade (40 ms steps); promo images zoom; tier-3 links nudge; mobile drawer items cascade. |
| **Search** | Suggestions and results rise in. |
| **PDP** | Thumbnails lift; active colour tile pulses once; stock dot pulses; add-to-cart shows a progress sweep while posting, then a green "Added to bag" state for 2 s; fund note "5%" counts up. |
| **Cart** | Header count + bag icon bump on add/change; drawer items, shipping bar, fund note and footer cascade on open; remove link marks the row as leaving; free-shipping bar animates width. |
| **Pages** | Cross-document View Transitions: 220 ms fade-out, 420 ms fade-up-in, header kept in place. |

---

## 3. Performance & accessibility

- **Properties animated:** `transform`, `opacity`, `clip-path` only (plus `background-size` on 1 px link underlines). No layout properties.
- **Scroll-linked work runs off the main thread** via `animation-timeline`; the JS fallback is a single passive `scroll` listener with rAF, enabled only when the browser lacks support, ≥768 px, parallax on.
- **Reveals** use one shared IntersectionObserver per concern; `will-change` only on hero media and word spans.
- **Measured (homepage, 1475 px):** CLS 0.0097 (all from the theme's pre-existing rotating announcement bar), 0 theme JS errors, ~57 fps during a forced 120 px/16 ms scroll sweep, no horizontal overflow at 375 / 390 / 430 / 820 / 1475 / 1920.
- **Reduced motion:** every effect is inside `@media (prefers-reduced-motion: no-preference)`; the `reduce` block forces visibility (no masked content), hides the cursor hint, shortens page-transition to a 150 ms fade.
- **Save-data:** JS adds `html.l-save-data` → parallax multiplier 0, hero video hidden.
- **No JS:** `.no-js` rules unmask everything; `.l-reveal` safety-net keyframe shows content after 2.5 s regardless.
- **Theme editor:** `@view-transition` is not emitted in design mode; section reload re-initialises splits/reveals via `shopify:section:load`.
- **Toggles:** Theme settings → Animations → *LACES motion* (master, intensity, parallax, page transitions, cursor). Turning the master off removes both assets from the page.

---

## 4. QA performed
Desktop 1475 and 1920, tablet 820, mobile 375 / 390 / 430: full-page scroll, hero entrance, all reveals, tabs + rail arrows + drag hint, mega menu cascade, mobile drawer cascade, collection grid stagger + ajax sort feedback, PDP add-to-cart (loading sweep → "Added to bag"), cart bump, drawer cascade, remove item, reduced-motion emulation, scroll-width/overflow, console errors, CLS. Fixed during QA: transparent-header bug (phase 1), parallax stuck inside `overflow:hidden` wrappers (switched to named view timelines), add-to-cart success colour specificity, rail-sibling reveal on mobile.

---

## 5. Preview

```bash
cd "/Users/ajaymalasha/Downloads/theme_export__getlaces-co-kinect-theme__04NOV2026-1131am"
git checkout redesign/laces-2026-experience
shopify theme dev --store xduwhm-w3.myshopify.com --port 9393 --host 127.0.0.1
```
Local: http://127.0.0.1:9393 · Shareable dev-theme link and editor URL are printed by the CLI. To compare with the phase-1 baseline, toggle *Theme settings → Animations → Enable LACES motion*.
