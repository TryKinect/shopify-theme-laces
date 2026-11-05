# LACES Motion Design System — Phase 2

Implemented in `assets/laces-motion.css` (tokens, reveal system, scroll-driven effects, interaction states) and `assets/laces-2026.js` (one controller: `window.LACES`). Extends — does not replace — the Phase 1 design system (`LACES-DESIGN-SYSTEM.md`).

---

## 1. Principles
1. **Motion amplifies, never announces.** Every effect supports reading order, hierarchy or feedback. If removing it changes nothing a user needs, it is a candidate for removal.
2. **Arrive decisively, leave quietly.** Entrances use expo-out (fast start, long settle). Exits are shorter and linear-ish.
3. **Content first, always.** Nothing that carries meaning becomes visible *only* through animation. Every reveal has a 2.5 s CSS safety net and a reduced-motion path.
4. **One family, one tempo.** One easing family, one stagger interval, five durations. No component invents its own curve.
5. **Transform/opacity/clip-path only.** No layout-affecting properties, no filters, no `will-change` sprawl.
6. **Progressive by default.** Scroll-driven and view-transition effects sit inside `@supports`; unsupported browsers get the Phase 1 experience.

---

## 2. Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--m-dur-xs` | 160 ms | taps, swatch pops, icon nudges, badge bump |
| `--m-dur-s` | 280 ms | hovers, tab indicator, underlines, mega-menu |
| `--m-dur-m` | 600 ms | section reveals, card crossfades, panel entrances |
| `--m-dur-l` | 950 ms | word rises, masks, drawn rules |
| `--m-dur-xl` | 1.6 s | hero image settle |
| `--m-ease-out` | `cubic-bezier(.16,1,.3,1)` | expo-out — all entrances |
| `--m-ease-inout` | `cubic-bezier(.65,0,.35,1)` | tab indicator, crossfades |
| `--m-ease-soft` | `cubic-bezier(.2,.7,.2,1)` | hover image scales |
| `--m-ease-spring` | `cubic-bezier(.34,1.4,.64,1)` | tiny UI pops only (badge, swatch) |
| `--m-stagger` | 70 ms | sibling delay step (`[data-l-stagger]`, Liquid `--l-delay`) |
| `--m-reveal-y` | 22 px | rise distance |
| `--m-mask-scale` | 1.10 | image start scale inside a mask |
| `--m-hover-scale` | 1.045 | image zoom on hover |
| `--m-line` | 1 px | drawn hairlines |

Phase 1 aliases (`--l-ease`, `--l-ease-out`, `--l-dur`) now resolve to these tokens so older rules inherit the same tempo.

---

## 3. Reveal system (one observer, several personalities)

| Class / attribute | Behaviour | Where |
| --- | --- | --- |
| `.l-reveal` | fade + 22 px rise | section headers, copy blocks, rail panels (`--fade`) |
| `.l-reveal--fade` / `--left` / `--right` | variants | story cards (fade), optional |
| `.l-mask` (+ `--left`) | clip-path inset reveal from bottom (or left) while the image settles from 1.10 → 1 | category tiles, story media, community photos, Fund image, fit panels |
| `.l-rule` | hairline grows from the left | available utility |
| `.l-ledger` | rows fade/rise in sequence; each row's hairline draws after it | Athlete Fund |
| `.l-fit` | VS medallion rotates in after both panels | Fit compare |
| `[data-l-split]` | JS wraps words in masked spans; words rise with 45 ms stagger when the element (or its `.l-reveal` ancestor) is in view. Inline `<em>`/`<br>` preserved | section titles, Fund heading, campaign title, footer band title |
| `.l-split-auto` (server-side) | words rise on load, no observer | hero headline, collection H1 (`snippets/laces-split-words.liquid`) |
| `[data-l-count]` | number counts up from 0 once in view; text is complete in the HTML beforehand | tile product counts, Fund "5%" |
| `--l-delay` (inline) / `[data-l-stagger]` | per-item delay | Liquid sets `--l-delay` from `forloop.index0 × 0.05–0.12 s` |

Observer: `IntersectionObserver` with `rootMargin: 0 0 -8% 0`, `threshold .08`, unobserve after reveal. Elements injected later (AJAX filters, quick-buy, search, theme editor) are picked up by a debounced `MutationObserver` and `shopify:section:load`.

---

## 4. Choreography by component

### Hero (first 5 seconds)
0 ms image visible (LCP) and settling 1.08 → 1 over 1.6 s · 100 ms overlay gradient fades in · 50 ms+ headline words rise, 70 ms apart · 450 ms supporting text · 600 ms CTAs · 800 ms proof strip · 1 s scroll cue (desktop). On scroll: image translates 16% / scales 1.06 across the first 90 vh; copy dissolves across 70 vh (native scroll timelines).

### Category tiles
Mask reveal, 60 ms stagger. Hover (fine pointer): image 1.045 + pointer parallax on the feature tile (±7 px, rAF-throttled), title lifts 4 px, arrow rotates from −20° to 0° and fills. Touch: scale .985 press feedback.

### Product cards
Crossfade to second image 600 ms ease-in-out + 4.5% zoom; quick-buy bar slides up 280 ms; swatch pop (spring) with a 280 ms "settle" blink on the swapped title/price; labels fade; Add-to-cart shows a spinner while Symmetry posts, then "Added ✓" for 1.4 s. Grid entrance: rise with 40 ms per-card stagger (`--i` set by JS, capped at 11).

### Product rails / tabs
Black indicator pill slides and resizes between tabs (280 ms in-out); new panel's cards rise with 50 ms stagger; arrows fill on hover; carousel itself is Symmetry's.

### Athlete Fund
Image mask + scroll parallax (±5%); heading words rise; three ledger rows enter 120 ms apart, each hairline drawing 200 ms after its row; "5%" counts up; buttons sweep.

### Collab stories
Chapter media masks in (60 ms stagger); hover: image 1.045, number badge inverts, title slides 4 px, CTA underline draws, arrow nudges.

### Fit compare
Panels mask in from the left (120 ms apart); VS medallion spins in at 350 ms; hovering one panel dims the other to 55%; spec chips outline on hover.

### Campaign / Community / Footer
Campaign image parallax; product card lifts 3 px on hover. Community photos mask in with 50 ms stagger, captions lift on hover. Footer: newsletter field focus ring, social icons lift, link rows nudge 3 px.

### Header, menu, search, drawer
Header background/colour/height transition 600/280 ms; mega menu fades/rises 280 ms with columns cascading 30 ms apart; mobile drawer 500 ms expo with items cascading 40 ms apart; search overlay fades/rises 280 ms, results rise 50 ms apart, scanning underline only while loading.

### Cart
Drawer 500 ms expo; new line item slides in from the right (600 ms); removed item fades/slides out; header badge bumps (spring) on add and on count change; quantity refresh dims price while merging; checkout button press feedback.

### Buttons & links
Primary/white/ghost buttons: fill sweeps in from the left (280 ms), label rides on top, arrow nudges 4 px, press scales .98. Text links: underline exits right, re-enters left.

### Page-to-page
Cross-document view transition: 220 ms fade out, 300 ms fade/rise in. Off under reduced motion; absent in browsers without support.

---

## 5. Accessibility & responsive rules
- `prefers-reduced-motion: reduce`: all reveals, masks, word rises, parallax, counters, indicator, pulses and view transitions are disabled; everything is visible immediately. `html.l-reduced-motion` is set for scripts.
- `Save-Data`: `html.l-save-data` disables hero settle and parallax.
- No functionality depends on hover; touch devices get press feedback instead.
- Hero scroll cue, pointer parallax and the Fit "dim the other panel" effect are desktop/fine-pointer only.
- Mobile uses the same reveal language with shorter distances and no parallax beyond the hero.
- Marquee: existing Symmetry press banner (hover to pause). Carousels never autoplay.
