# LACES 2026 — Phase 2: Premium Motion & Interactions

Branch: `redesign/laces-2026-experience` (from `redesign/laces-2026`). Builds on the Phase 1 motion
layer (`assets/laces-2026.css/js`) — nothing is forked or rewritten.

## Architecture

| Layer | File | Role |
| --- | --- | --- |
| Guard | `layout/theme.liquid` (inline, before first paint) | Adds `html.l-motion` only when the **LACES motion** theme setting is on, `prefers-reduced-motion` is not set, and `navigator.connection.saveData` is false. Otherwise adds `html.l-motion-off`. Sets `data-l-motion-level` (`full` / `subtle`). |
| Styles | `assets/laces-motion.css` | All Phase 2 motion, every rule scoped to `html.l-motion`. 13 numbered sections (tokens, page/header, hero, reveals/split text, parallax, homepage sections, cards/rails, buttons, nav, PDP, cart, collection/search, cursor). |
| Runtime | `assets/laces-motion.js` | Dependency-free IIFE; independent modules called from `start()` — comment one out to disable it. Re-inits on `shopify:section:load` / `shopify:block:select`. |
| Phase 1 | `assets/laces-2026.js` | Now exposes `window.LACES.initReveal` so the runtime can observe elements it adds. |
| Settings | `config/settings_schema.json` → "LACES motion" | `laces_motion_enabled` (checkbox), `laces_motion_intensity` (full / subtle). |

**No dependencies were added.** GSAP/ScrollTrigger were evaluated and rejected: everything needed is
achievable with native CSS scroll-driven animations (`animation-timeline: view()/scroll()`), CSS
transitions and ~300 lines of vanilla JS, with zero extra network weight (`laces-motion.css` ≈ 20 KB,
`laces-motion.js` ≈ 12 KB, both unminified, deferred).

### Scroll-linked motion strategy
* Chrome/Edge 115+, Safari 26+: native scroll timelines run on the compositor (hero depth, `.l-px`
  parallax, campaign copy drift). Zero JS on scroll.
* Other browsers: `laces-motion.js` detects missing support, adds `html.l-js-scroll` and drives the same
  custom properties (`--l-sy`, `--l-vy`) from a single passive-scroll → rAF loop, reading only
  IntersectionObserver-tracked elements.
* Reduced motion / Save-Data: neither path runs; Phase 1 reduced-motion rules still apply.

## What was added

**Homepage**
* Cinematic hero: media curtain reveal (clip-path) + slow settle (scale 1.1→1), existing line-by-line
  headline retimed to an expo ease, CTAs and proof points stagger in, media drifts at 22% of scroll
  while the copy lifts and fades (scroll-linked).
* Header entrance on the homepage; cart icon bump + count pop on add-to-cart.
* Reveal variants: `.l-reveal--clip` (wipe-up with image settle) on category tiles, Athlete Fund media,
  collab stories and community photos. `.l-px` parallax wrappers on tiles, fund, stories, fit, campaign.
* Split-text headlines (word by word, masked) on section titles, Athlete Fund heading (preserves the
  outlined `<em>`), campaign title, footer newsletter heading. Headings keep an `aria-label` with the
  original text; word spans are `aria-hidden`.
* Athlete Fund ledger rows slide in sequentially; numeric values count up (values ≥ 10).
* Fit compare: spec lines stagger in, "VS" medallion pops, images settle.
* Campaign: copy drifts slower than the photograph (kinetic typography), featured product lifts.
* Product rails: cards stagger on first view and re-stagger on tab switch; nav buttons nudge.
* Footer columns stagger in; newsletter field underline draws on focus; social icons lift.
* Mobile snap rails (tiles, stories, community) reveal as a group so off-screen cards are never stuck hidden.

**Shopping journey**
* Product cards: slower expo image zoom, 550 ms crossfade to the alternate image (was 50 ms), swatch
  scale feedback, smoother quick-buy slide.
* Mega menu: fades/slides in, columns stagger; nav preview image zooms.
* Buttons: fill sweep on hover, arrow nudge, press scale. Links: underline draws left→right.
* PDP: gallery crossfade on media change (`on:media-gallery:change`), thumbnail lift, variant option pop
  on select, price flash on `on:variant:change`, add-to-cart press/success pop.
* Cart drawer: 620 ms expo slide (was 340 ms linear), items stagger on open, newly merged items slide in,
  quantity-updating rows dim, footer fades in last.
* Collection/search: grid cards fade-up on load and after filter/sort fetches; shimmer + dim while a
  filter/sort request is in flight; predictive search results stagger.
* Page transitions: 200 ms fade-out on same-origin link clicks, fade-in on load (bfcache-safe, skipped
  for checkout/account/anchors/modifier-clicks).
* Cursor (desktop fine-pointer only): small difference-blend dot that grows on interactive elements and
  shows "Drag" over product rails / "View" over editorial tiles. Native cursor is never hidden.

## Performance notes
* Only `transform`, `opacity`, `clip-path`, `translate`/`scale` animate. No layout properties.
* `will-change` limited to split words, parallax media and the cursor.
* Scroll work: zero JS where native timelines exist; otherwise one rAF per scroll frame over visible
  elements only.
* Every entrance has the Phase 1 2.5 s force-in fallback, so content can never be stuck invisible if
  IntersectionObserver or JS fails. `html.l-motion-off` also neutralises every hidden initial state.
* Lazy-loading, srcset/sizes and image markup are unchanged.

## QA (dev theme on xduwhm-w3, `shopify theme dev`)
Checked at 375 / 390 / 430 / 820 / 1440 / 1920: no horizontal overflow, no new console errors (only the
pre-existing shop.app CSP frame warning), all reveals complete after a full scroll, hero scroll-linked
values verified, rail tab switch, product card hover, mega menu, PDP gallery switch, add-to-cart → drawer,
collection grid entrance, search, and `prefers-reduced-motion: reduce` (→ `html.l-motion-off`, nothing
invisible). Theme check: no new offenses (3 pre-existing errors on the baseline are untouched).

## Disabling / tuning
* Theme editor → Theme settings → **LACES motion**: toggle or set intensity to *Subtle* (halves parallax
  amplitude and stagger).
* Remove a single effect: delete its numbered block in `laces-motion.css` or its `init*()` call in
  `laces-motion.js`.
* Add parallax to any media wrapper: give it `.l-px` (one `img`/`video` child). Add a wipe reveal:
  `.l-reveal.l-reveal--clip`.

## Local preview
```
SHOPIFY_FLAG_STORE=xduwhm-w3.myshopify.com shopify theme dev --path . --port 9292
```
Nothing here is pushed or published; `theme dev` uses the unpublished per-machine development theme.
