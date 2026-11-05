# LACES Design System — "Athlete-First Editorial" (2026)

Implemented in `assets/laces-2026.css` (tokens + components) and `assets/laces-2026.js` (motion + rails). All `l-` prefixed classes belong to this layer; `k-` classes are the pre-existing Kinect layer, which is kept and re-skinned through CSS variables.

---

## 1. Principles
1. **Product is the hero; athletes are the story.** White product-forward pages, interrupted by full-bleed photography of real LACES athletes and one dark "Fund" block per page.
2. **One display voice.** Futura PT Condensed, uppercase, 800 weight, for headlines only. Everything else is Inter.
3. **Monochrome by default.** Black `#171717` on white with LACES greys. Colour comes from product photography and the Cal blue/gold of that collaboration. `#DF5641` is a signal, not a brand colour.
4. **Verified copy only.** Every number (5%, $50, 30 days, 10% for Cal) is editable in the theme editor and defaults to copy already published by LACES.
5. **Motion is quiet.** Entrance reveals and hover zooms; nothing loops except the hero video (optional) and the press marquee. `prefers-reduced-motion` disables all of it.

---

## 2. Colour

| Token | Value | Use |
| --- | --- | --- |
| `--l-ink` / `--l-black` | `#171717` | Text, primary buttons, dark sections |
| `--l-dark` | `#232323` | Secondary dark (theme button colour) |
| `--l-white` | `#FFFFFF` | Page |
| `--l-paper` | `#F7F7F8` | Alternate section background, footer |
| `--l-tile` | `#F2F2F3` | Product image tiles (images use `mix-blend-mode: multiply`) |
| `--l-tile-dark` | `#E9E9EB` | Tile hover |
| `--l-muted` | `#676869` | Secondary text, eyebrows |
| `--l-line` | `#E2E2E2` | Hairlines |
| `--l-line-strong` | `#C9C9CC` | Input borders, chips |
| `--l-signal` | `#DF5641` | Sale price, sale label, urgency only |
| `--l-live` | `#2F8F5B` | In-stock dot |
| `--l-cal-blue` / `--l-cal-gold` | `#003262` / `#FDB515` | Cal Athletes collaboration only |

Contrast: body text on white 10.7:1; muted text 5.5:1; white on `#171717` 15:1. Photo overlays use a bottom gradient (`rgba(0,0,0,.55–.78)`) so white type always clears AA.

---

## 3. Typography

| Role | Face | Size / weight | Notes |
| --- | --- | --- | --- |
| Display XL (hero) | Futura PT Condensed | `clamp(46px, 7vw, 100px)` / 800 | Uppercase, line-height .9, letter-spacing −.01em, line-by-line reveal |
| Display LG (fund, collection H1) | Futura PT Condensed | `clamp(40px, 5.2vw, 80px)` – `clamp(40px, 7vw, 96px)` | Outlined word via `<em>` (`-webkit-text-stroke`) |
| Display MD (section titles) | Futura PT Condensed | `clamp(30px, 4vw, 56px)` | `.l-display--md` |
| Display SM (tiles, cards) | Futura PT Condensed | 24–40px | `.l-tile__title`, `.l-story__title` |
| Eyebrow / label | Inter | 11px / 600 / tracking .12em, uppercase | `.l-eyebrow` has an 18px rule before it |
| Nav | Inter | 12px / 500 / tracking .10em, uppercase | Underline grows from the left on hover |
| Body / lede | Inter | 14–18px / 400, line-height 1.5–1.6 | `.l-lede` max 54ch |
| Card title | Inter | 13.5px / 500 | Split into kicker (10px caps) / name / colourway (12px muted) |
| Price | Inter | 13px / 500 (card), 20px / 600 (PDP) | Sale price in `--l-signal` |
| Buttons | Inter | 12px / 600 / tracking .08em, uppercase | 48px tall, square corners |

Fonts load as they do today: Inter through Shopify font settings, Futura PT Condensed through the existing Typekit kit (`https://use.typekit.net/qqf1ylf.css`). Roboto Mono is no longer used by any component (`--k-mono` now resolves to Inter).

---

## 4. Spacing & layout

| Token | Mobile | ≥768 | ≥1440 |
| --- | --- | --- | --- |
| `--l-gutter` | 16px | 32px | 48px |
| `--l-section` | 48px | 64px | 64px |
| `--l-section-lg` | 72px | 104px | 104px |
| `--l-max` | 1600px content width (`.l-container`) | | |

Grids: 8px gaps for photo tiles, 10–16px for product rails. Section header pattern (`.l-sec-head`): eyebrow + title left, action link / rail arrows right; stacks on mobile.

Breakpoints: `<768` mobile, `768–1023` tablet, `≥1024` desktop (matches Symmetry).

---

## 5. Components

| Component | Class | Behaviour |
| --- | --- | --- |
| Button primary | `.l-btn` | Black fill, white text, arrow nudges 3px on hover |
| Button outline / ghost / white | `.l-btn--outline`, `.l-btn--ghost`, `.l-btn--white` | Ghost is white outline on photography |
| Text link | `.l-link` | 12px caps with bottom rule and arrow |
| Eyebrow | `.l-eyebrow` | Rule + caps label |
| Product card | theme `product-block` + `.l-card__kicker/name/colorway` | Grey tile, multiply-blended image, 4% zoom on hover, quick-buy bar slides up (desktop), uppercase pill labels, sibling swatches |
| Category tile | `.l-tile` | 4:5 photo, bottom gradient, display title, live product count, circular arrow that fills on hover; first tile 2×2 |
| Product rail | `.l-rail-section` + `.l-tab` | Server-rendered panels per collection, Symmetry `carousel-slider`, arrows in the header, 66vw cards on mobile |
| Fund block | `.l-fund` + `.l-ledger` | Dark panel, portrait image, numbered ledger rows with optional big value |
| Story card | `.l-story` | Chapter number, 4:5 image, kicker/title/text/CTA; featured card spans 2×2 |
| Fit compare | `.l-fit` | Two panels with spec chips and a "VS" medallion |
| Campaign banner | `.l-campaign` | Full-bleed photo, display title, CTAs, optional live product card |
| Community grid | `.l-community` | 6-up photo strip + dark roster tile |
| Footer | `.l-footer` | Newsletter band, brand column, link columns, Fund card, bottom bar |
| Fund note | `.l-pdp-fund`, `.l-cart-fund`, `.l-drawer-foot__fund` | The mission thread on PDP / cart / mobile menu |
| Collection header | `.l-coll-head` | Breadcrumb, display H1, live count, description |

---

## 6. Imagery

- Only photography already in the store's Files/CDN. Lifestyle shots of athletes for hero, Fund, stories and community; studio product shots on `--l-tile` with multiply blending for cards and the WKB product card.
- Ratios: hero full-bleed (desktop landscape + mobile portrait crop), tiles/stories 4:5, community 3:4, fit compare 5:4, Fund image 4:5.
- Every image picker respects the Shopify focal point (`--l-fp` → `object-position`).
- Overlays: bottom-weighted gradients only; no colour tints.

---

## 7. Motion

| Effect | Where | Spec |
| --- | --- | --- |
| Hero line reveal | `.l-hero__line > span` | translateY(110%) → 0, 0.9s `cubic-bezier(.16,1,.3,1)`, 120ms stagger |
| Hero fade | eyebrow/text/CTAs/proof | 1.2s opacity, staggered 0.1–0.8s |
| Scroll reveal | `.l-reveal` | opacity 0 → 1, translateY 18px → 0, 0.7s, `--l-delay` stagger; IntersectionObserver at 8% / −8% root margin; CSS fallback forces visibility after 2.5s if JS never runs |
| Hover zoom | tiles, stories, cards | scale 1.04–1.05 over 0.7–0.9s |
| Header compact | `html.l-header-compact` after 90px scroll | 76px → 64px bar |
| Rail scroll | arrows / tabs | native `scrollBy` smooth, 80% of viewport width |
| Reduced motion | `prefers-reduced-motion: reduce` | All reveals/animations disabled, hero video not autoplayed; also skipped when `navigator.connection.saveData` |

---

## 8. Accessibility
- Visible focus ring (`2px` ink outline, 3px offset) on all interactive elements.
- Tabs use `role=tablist/tab/tabpanel`, `aria-selected`, arrow-key navigation.
- Decorative images use empty `alt`; informative images use product/collection titles.
- Hero proof strip and ledger are real lists; all photo tiles are links with text.
- Colour never carries meaning alone (in-stock dot has text; sale price has strike-through + label).
