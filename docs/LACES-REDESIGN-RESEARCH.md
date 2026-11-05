# LACES Storefront Redesign — Research Report

Date: 5 Nov 2026 · Theme: Symmetry 8.1.1 ("Kinect Theme", live theme #187979890906) · Store: `xduwhm-w3.myshopify.com` → getlaces.co

Screenshots referenced below live in `docs/research/` (`live/`, `references/`, `redesign/`).

---

## 1. How the research was done (and its limits)

| Source | Method | Notes |
| --- | --- | --- |
| getlaces.co (live) | Browser audit of home, nav/mega menu, collections, PDP, cart drawer, search, mobile (390px) + computed-style checks via DevTools | Full access. 13 screenshots in `docs/research/live/`. |
| Brand pages (Athlete Fund, NIL, Cal Athletes, Collaborations, Hat Fit Guide, Women Know Ball) | Read verbatim from the exported JSON templates (`templates/page.*.json`) + live checks | All factual claims used in the redesign are quoted from these sources. |
| roster.getlaces.co | Browser | It is a Webflow site proxied under `/blogs/athletes`; the theme can only link to it. |
| Catalogue data | Storefront JSON via the local preview (`/products.json`, `/collections.json`, `/products/*.js`) | 77 products (69 hats, 3 hoodies, 2 socks, 1 fund contribution), 34 collections. |
| Competitors | Browser (a research subagent + direct checks) | New Era, Kith, Goorin Bros, '47 Brand, Aimé Leon Dore were inspected. **Mitchell & Ness blocked automated access (Akamai "Access Denied") and could not be inspected.** Kith showed a geo-welcome modal; hero + nav were still observable. |
| Reference images | Contact sheet of the 42 lifestyle/product images already in the store's Files (`references/laces-image-library-*.jpg`) | Used to choose real photography for every new section — no stock images. |

---

## 2. Live LACES audit

### 2.1 What is already there (and worth keeping)
- A custom "Kinect/HAUS" layer (`kinect-haus.css/js`, `k-*` sections/snippets) on top of Symmetry: filmstrip hero, menu-left/logo-centre header, colour-family swatches driven by the `custom.sibling_products` metafield, athlete labels, an in-grid Cal story card, PDP fit toggle/specs/photo strip, the Cal Athletes campaign pages (receipt motif), Vitals reviews, Klaviyo popup, Loop "Checkout+" in the cart, a wishlist app and Gorgias-style chat.
- Typography actually rendering on the live site (computed): **Futura PT Condensed** (Typekit kit `qqf1ylf`) for display, **Inter** for body, **Roboto Mono** for nav/labels/buttons. Theme settings themselves are Inter everywhere.
- `#DF5641` is *not* used anywhere on the rendered homepage (it is only the "featured nav link" colour for a "Sale" link that is not in the menu). The Kinect layer uses `#bf570a` for sale prices. Conclusion: the accent has no established brand equity; it should stay a functional signal colour (sale / urgency), not a brand colour.
- Verified store facts used in copy: free shipping over $50 (`free_shipping_amounts: USD:5000`), 30-day returns, 2–3 business-day processing, "5% of every LACES sale" goes to the Athlete Fund, the Fund is split equally among athletes who meet monthly checkpoints, brand contributions go 100% to athletes ("LACES takes nothing"), Cal collab returns 10% of every sale to Cal athletes, press: FOX 2 / SFGATE / ABC 7 / NBC Bay Area / Sports Illustrated.

### 2.2 Problems and opportunities observed

| # | Observation | Why it matters |
| --- | --- | --- |
| 1 | Homepage is five near-identical product carousels (Bestsellers, New Arrivals, Signature, Rep Your Team, Rep Your City) separated by image tiles. The brand story (Athlete Fund / NIL) appears ~5,600px down as two generic image tiles. | The single most differentiating idea — buying a hat funds athletes — is buried; the page reads as "another hat store". |
| 2 | Hero uses a 5-up portrait filmstrip; on mobile it becomes a 2×2 grid with the headline over a face. | Subjects become small; no single confident campaign image. |
| 3 | Category discovery is one row of equal tiles ("Hats, Hoodies, Collabs, Berkeley Roster") with no hierarchy or counts. | Snapback vs Dad Hat — the real decision — is not surfaced. |
| 4 | Product titles are catalogue strings: "Snapback - Bay Area Downside Up - Blue/Gold". Cards and the PDP H1 show them verbatim. | Hard to scan; fit, name and colourway compete. |
| 5 | Two badge systems collide on cards (theme labels top-left + metafield badges top-right, different casing). | Visual noise, inconsistent hierarchy. |
| 6 | Mono-spaced UI labels at 10–11px for nav, buttons, announcement. | Legibility and a "template trend" feel; weakens the Inter-based identity in the theme settings. |
| 7 | Collection header is a plain title under a tab row; product count is repeated; filter group label is the raw metafield name ("badges") with duplicate values (ATHLETE DESIGN / ATHLETE DESIGNED / BESTSELLER / Bestseller). | Store-data hygiene issue (Search & Discovery), surfaced by the theme. |
| 8 | PDP: strong fundamentals (sibling colour tiles, trust row, sticky ATC) but no "where your money goes" moment, and the H1 wraps to three lines. | The athlete story disappears exactly where the purchase decision happens. |
| 9 | Footer: one "Quick links" menu with 4 links; brand pages (Athlete Fund, NIL, Collabs, Fit Guide, Roster) are not reachable from the footer. | Weak discovery of the brand's best content. |
| 10 | Third-party overlays on mobile: Klaviyo teaser, wishlist pill, chat bubble, "someone just bought" toasts. | Clutter over product grids (Kinect already mitigates some; preserved). |
| 11 | Mega menu is good (columns + photo tiles + hover preview). Mobile drawer is good (big condensed items + bestsellers). | Keep, restyle only. |

### 2.3 Live-site screenshots
`live/01-home-hero.jpg`, `02-home-bestsellers.jpg`, `03-home-categories.jpg`, `04-home-wkb-signature.jpg`, `05-home-athlete-fund-tiles.jpg`, `06-home-press-footer.jpg`, `07-megamenu.jpg`, `08-collection-all-hats.jpg`, `09-pdp.jpg`, `10-cart-drawer.jpg`, `11-mobile-home.jpg`, `12-mobile-menu.jpg`, `13-roster-webflow.jpg`, `14-home-cal-banner.jpg`.

---

## 3. Reference research

| Brand | What was inspected | Visually successful | Useful patterns | Do not copy |
| --- | --- | --- | --- | --- |
| **New Era** (`references/08-newera-homepage.jpg`, `newera-collection.jpg`, `newera-cards.jpg`) | Home, "New Era Branded" collection | Big, confident collection headers (dark banner, 80px+ title); clean white product cards (vendor / title / price); pill "Exclusive" badges | Filter taxonomy (Product type · Silhouette · Size · Fit · Colour) is exactly what a hat store needs; count + sort + filter in one bar | Corporate licensing feel; no mission; rewards banners everywhere |
| **Kith** (`references/kith-home.jpg`) | Home (geo modal visible), nav | Campaign-first full-bleed photography, tiny all-caps nav, transparent header, serif editorial titles, long-scroll storytelling | One image + one line + one CTA per campaign block; collaborations as stories | Luxury minimalism that hides filters/quick-shop; serif type is wrong for LACES |
| **Goorin Bros** (`references/goorin-home.jpg`) | Home | Warm single-palette hero built around product + collectible patches; strong "USA Workshop / Drops / Last Chance" nav | Ownable product-level hook; "Drops" for releases | Novelty tone; not premium |
| **'47 Brand** (`references/47brand-home.jpg`) | Home | Collab hero (Carhartt x '47) with both logos and a serif headline "Set the Tone"; seasonal stories | Collabs presented as chapters; app/loyalty strip | Dense team-licensing nav; generic |
| **Aimé Leon Dore** (`references/aime-leon-dore-home.jpg`) | Home | Transparent header over a full-bleed detail shot; "Queens, NY · date · time" line gives a sense of place; everything else is restraint | Place-based identity (LACES = Bay Area); transparent header; confidence to show one image | Ultra-minimal nav would hurt discovery for a 77-SKU store |
| **Mitchell & Ness** | — | Blocked (Akamai). Not inspected; no claims made. | | |

### 3.1 Patterns adopted for LACES
1. One cinematic campaign image with separate desktop/mobile crops (Kith/ALD), transparent header on the home page.
2. Headline + proof strip ("Free shipping $50+ · 30-day returns · 5% of every sale funds athletes") so the mission is above the fold.
3. Collection header with large display title, breadcrumb and live product count (New Era).
4. Collaborations as numbered "chapters" with photography (Kith/'47) instead of product grids.
5. Tabbed product rails to collapse five carousels into two.
6. White product cards on a quiet grey tile, split titles (fit kicker / name / colourway), uppercase pill labels.

### 3.2 Things deliberately not copied
- Serif editorial type (Kith/'47) — LACES' established display face is Futura PT Condensed.
- Hidden filters / no quick-shop (Kith).
- Loyalty/app banners and "someone just bought" urgency theatre.
- Any new brand colour. The palette stays LACES black/white/grey; `#DF5641` is only used for sale/urgency.

---

## 4. Three design directions

| | A. "Locker Room" (dark, cinematic) | B. "Clean Court" (gallery minimal) | **C. "Athlete-First Editorial" (recommended)** |
| --- | --- | --- | --- |
| Look | Black backgrounds, video hero, oversized condensed type, broadcast energy | White, hairline rules, small type, product photography only, Kith/ALD restraint | White, product-forward system punctuated by full-bleed athlete photography and one dark editorial "Fund" block |
| Type | Futura Condensed everywhere | Inter only, small caps | Inter for all UI/body; Futura PT Condensed reserved for display headlines |
| Story | Loud, but the Fund becomes another banner | Elegant, but the Fund gets lost | The Fund is a structural thread: hero proof strip → dark ledger section → PDP note → cart note → footer card |
| Conversion | Heavy pages, dark UI hurts product colour read | Beautiful but low discovery | Tabs, category tiles with live counts, fit comparison before the PDP, quick-buy on hover |
| Risk | Reads as generic sports merch (New Era/'47) | Reads as a fashion label; mobile shopping suffers | Needs disciplined photography — solved by the existing library |

**Recommendation: Direction C.** It keeps the live identity (logo, Inter, LACES greys, condensed display face) while making the athlete model visible at every step of the journey, and it maps cleanly onto Symmetry's architecture (sections + product-block + carousel-slider) so nothing existing has to be thrown away.

---

## 5. Differentiation summary for LACES
- **The 5% ledger.** No reference brand shows where the money goes. LACES can, truthfully, on the home page, PDP and cart.
- **Fit before colour.** Snapback vs Dad Hat is the first decision; it gets a dedicated comparison block linked to the published Fit Guide.
- **Place and people.** Bay Area photography, the Roster, the Cal co-design committee — real faces instead of lifestyle stock.
- **Collabs as chapters.** Cal Athletes, Women Know Ball, Voices, Bloom, BAHC presented as numbered stories with verified one-line descriptions.
