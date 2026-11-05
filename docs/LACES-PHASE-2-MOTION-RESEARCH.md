# LACES Phase 2 — Motion & Interaction Research

Date: 5 Nov 2026 · Branch: `redesign/laces-2026-motion` (from `redesign/laces-2026`)
Screenshots: `docs/research/phase-2/references/`

---

## 1. Method

For each reference site I loaded the homepage in the browser, screenshotted it, and ran a DOM/CSSOM probe to find out what the site *actually* uses for motion: presence of GSAP/ScrollTrigger, Lenis/Locomotive, Swiper/Splide, Lottie; count of `animation-timeline` (native scroll-driven animation) rules, `view-transition` rules, `clip-path` rules, `transition` declarations and `prefers-reduced-motion` blocks in same-origin stylesheets; number of `<video>` elements; heading font. This separates observable engineering from guesswork.

| Site | Inspected | Stack detected | Motion facts observed |
| --- | --- | --- | --- |
| **Nike** (nike.in redirect) | Yes · `nike-home.jpg` | React; **no GSAP/Lenis**; 8 CSS-animated elements; 2 videos | Full-bleed looping video hero with a pause control; carousel with "Pause autoplay"; otherwise restrained — product grid, no scroll theatrics |
| **District Vision** | Yes · `districtvision-home.jpg` | Shopify; **no GSAP**; **2 native `animation-timeline` rules**; 1 reduced-motion block; 12 transitions | Premium Shopify store already shipping native CSS scroll-driven animation; sparse grid, editorial store photography, tiny type |
| **Sporty & Rich** | Yes · `sportyrich-home.jpg` | Shopify (Exhibea theme), Swiper; **3 scroll-driven rules, 8 clip-path rules**; 8 videos; 1 reduced-motion block | Transparent header over a video hero; centred campaign copy with two underlined text links ("Discover / View Campaign"); clip-path reveals; email modal on entry (negative) |
| **On Running** | Yes · `on-home.jpg` | Custom; **no GSAP**; 1 scroll-driven rule; **13 reduced-motion blocks**; 112 transitions | Transparent header on photography, headline bottom-left with two pill CTAs; exemplary reduced-motion coverage |
| **Aesop** | Yes · `aesop-home.jpg` | Custom; **no GSAP**; 7 clip-path rules; 4 reduced-motion blocks; 94 transitions; 1 video; sticky sections | Video hero with centred eyebrow/title/outlined "Discover →" button and explicit play/pause; slow, deliberate crossfades |
| **Kith** | Phase 1 screenshot `kith-home.jpg` | — | Campaign-first blocks, each one image + one line + one CTA |
| **Aimé Leon Dore** | Phase 1 screenshot `aime-leon-dore-home.jpg` | — | Transparent header over a detail shot; place/time line; restraint |
| **New Era** | Phase 1 screenshot `newera-collection.jpg` | — | Bold collection headers, pill badges, 5-facet filters |
| **'47 Brand**, **Goorin Bros** | Phase 1 screenshots | — | Collab heroes, warm product-led hero |
| **Adidas, New Balance, COS** | Not inspected (time-boxed) | — | No claims made |
| **Mitchell & Ness** | Blocked (Akamai "Access Denied") in Phase 1; not retried | — | No claims made |

Reference documentation consulted: [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) (`animation-timeline`, `scroll()`, `view()`, `animation-range`), [Chrome — Motion guidance](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/motion), [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Shopify theme performance best practices](https://shopify.dev/docs/storefronts/themes/best-practices/performance), [Figma — Web design trends 2026](https://www.figma.com/resource-library/web-design-trends/).

### Key finding
None of the premium references we could inspect ship GSAP, Lenis or a smooth-scroll library on their homepage. The ones that feel most "alive" (District Vision, Sporty & Rich, On) use **native CSS scroll-driven animations, clip-path reveals and transitions**, with generous `prefers-reduced-motion` handling. That matches Shopify's performance guidance and sets the technical direction for LACES: **CSS-first, a few KB of dependency-free JS, no animation library.**

---

## 2. Technique review

| Technique | Verdict for LACES | Why / how |
| --- | --- | --- |
| Cinematic hero transitions | **Adopt** | Image settles from scale 1.08 → 1 (transform only, image opaque from first paint so LCP is unaffected); word-by-word headline rise; eyebrow/text/CTA/proof staggered fades |
| Scroll-linked image transformations / parallax | **Adopt (native)** | `animation-timeline: scroll(root)` on the hero image (translate 16%, scale 1.06 over 90vh) and `view()` on the Fund and campaign images (±5% drift). Zero JS; no-op in browsers without support |
| Masked image reveals (clip-path) | **Adopt** | `.l-mask`: `clip-path: inset(100% 0 0 0) → inset(0)` with the image settling from 1.1 → 1. Used on category tiles, story media, community photos, Fund image, fit panels (left-to-right variant) |
| Kinetic typography / word splitting | **Adopt, carefully** | Server-side split for above-the-fold text (hero, collection H1) so it never depends on script timing; JS split for section headings that are already reveal-gated. Inline `<em>` preserved (outlined "community") |
| Animated underlines / nav | **Adopt** | Nav underline grows from the left; `.l-link` underline exits right and re-enters left on hover; mega-menu columns cascade in |
| Image crossfades on cards | **Adopt (refine)** | Symmetry already swaps to the second image on hover with a 100 ms flick; retimed to 600 ms ease-in-out plus a 4.5% zoom |
| Interactive galleries | Keep theme | Symmetry's media gallery is sound; only thumbnail/active transitions softened |
| Horizontal scrolling storytelling | **Already in place** | Mobile rails are native snap-scroll (Phase 1); no scroll-jacking added |
| Sticky storytelling sections | **Rejected** | Pinning the Fund story would add scroll length and fight the product-first goal |
| Magnetic buttons / custom cursor | **Rejected** | Trend-led, breaks native cursor affordance, meaningless on touch. Replaced with pointer parallax on one tile only (desktop, fine pointer) |
| Animated SVG | **Adopt lightly** | Arrow nudges on buttons/links, rotating tile arrow, in-stock dot pulse, scroll cue line. Logo untouched |
| Loading transitions | **Adopt where real** | Scanning underline only while Symmetry's `.main-search--loading` is set; spinner inside Add-to-Cart only while `.is-loading`; no fake skeletons |
| View Transitions | **Adopt (progressive)** | Cross-document `@view-transition { navigation: auto }` with a 220 ms crossfade + 6 px rise. CSS-only, Chromium 126+; other browsers get normal navigation. Disabled under reduced motion |
| GSAP / ScrollTrigger / Lenis | **Not used** | ~70 KB+ for effects achievable natively; adds maintenance and a scroll-hijack risk with Shopify apps |

---

## 3. Browser compatibility

| Feature | Chrome/Edge | Safari | Firefox | Fallback |
| --- | --- | --- | --- | --- |
| `animation-timeline: scroll()/view()` | 115+ | 26+ (partial earlier) | behind flag | Static image (no parallax), wrapped in `@supports` |
| `clip-path: inset()` transitions | Yes | Yes | Yes | n/a (plus 2.5 s force-reveal keyframe if JS never runs) |
| Cross-document View Transitions | 126+ | 18.2+ | No | Normal navigation |
| `:has()` (used for utility bar) | Yes | Yes | 121+ | Cosmetic |
| IntersectionObserver | All | All | All | Reveal immediately |

---

## 4. Performance & accessibility constraints adopted
- Animate only `transform`, `opacity`, `clip-path`; no width/height/top/left, no blur/filters.
- Hero image is never faded (Phase 1's 1.6 s opacity fade was removed — it hid the LCP element).
- One `IntersectionObserver`, one scroll handler (rAF-throttled), one `MutationObserver` for injected content.
- `prefers-reduced-motion: reduce` → every reveal/mask/parallax/keyframe disabled; content visible; view transitions off. `Save-Data` → parallax/hero settle off.
- Marquee (press logos) is the existing Symmetry section with its hover-pause; the hero scroll cue is purely decorative and hidden on mobile and under reduced motion.

---

## 5. Recommended direction: "Athlete-First Editorial — Immersive Motion Edition"

1. **Arrival:** hero image settles while the headline rises word by word; proof strip fades in last; as the user scrolls the image drifts and the copy dissolves — campaign film, not slideshow.
2. **Reveal language:** every image enters through a bottom mask with a zoom-settle; every heading rises as words; dividers draw. One easing family (expo-out), one stagger (70 ms).
3. **Shopping feedback:** sliding tab indicator, card crossfades, confirming Add-to-Cart ("Added ✓"), cart badge bump, new line-item slide-in, drawer with expo easing.
4. **Signature moment:** the Athlete Fund ledger — rows and hairlines draw in sequence while "5%" counts up; the outlined word fills last.
5. **Everything else stays quiet.** No full-page loaders, no scroll-jacking, no custom cursor.
