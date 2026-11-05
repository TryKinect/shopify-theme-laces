# LACES 2026 Redesign — Implementation Notes

Branch: `redesign/laces-2026` (baseline export preserved as the first commit on `main`).
Nothing has been published or pushed to the live theme. The preview runs on a private Shopify **development theme** created by `shopify theme dev` (id 188154970330 at the time of writing), which is unpublished and only visible with the preview link.

---

## 1. Preview

```bash
cd "/Users/ajaymalasha/Downloads/theme_export__getlaces-co-kinect-theme__04NOV2026-1131am"
git checkout redesign/laces-2026
shopify theme dev --store xduwhm-w3.myshopify.com --port 9393 --host 127.0.0.1
```

- Local preview: **http://127.0.0.1:9393** (home) · `/collections/all-hats` · `/products/bay-area-downside-up-blue-gold` · `/search?q=hat` · `/cart`
- Shareable preview of the same dev theme: `https://xduwhm-w3.myshopify.com/?preview_theme_id=188154970330` (the id is printed by the CLI each run)
- Theme editor for the dev theme: printed by the CLI as link `[2]` (`/admin/themes/<dev-theme-id>/editor?hr=9393`)
- Port 9292 is already used by another `theme dev` session on this machine, hence 9393.
- The CLI is signed in as `ajay@trykinect.ai`; if the session expires it will open a browser to re-authenticate.
- Note: the storefront localises to the visitor's IP. If your region is not a shipping market, every product renders as sold out; switch the country selector (footer / announcement bar) to United States.

Checks run: `shopify theme check` (no errors in touched files; remaining warnings are pre-existing Symmetry/Shogun items), browser QA at 390 / 820 / 1436 px with zero theme JS errors, no horizontal overflow, add-to-cart → drawer → quantity → remove → empty state, tabs, rail arrows, swatch swap, search, filters/sort.

---

## 2. What changed

### New files
| File | Purpose |
| --- | --- |
| `assets/laces-2026.css` | Design tokens, global refinements (header, nav, mega menu, drawer, search, cards, collection, PDP, cart) and all `l-` components. Loaded after `kinect-haus.css`; re-points Kinect's `--k-*` variables so the old layer inherits the new type/colour decisions. |
| `assets/laces-2026.js` | Scroll reveal, compact header, tabbed rails + arrows, hero video guard, shared `window.LACES.splitTitle/renderCardTitle`. ~4 KB, no dependencies. |
| `sections/laces-hero.liquid` | Cinematic hero (desktop/mobile crops, optional video, proof-point blocks, full or split layout). |
| `sections/laces-category-tiles.liquid` | Shop-by-category tiles with live `products_count`, feature-first grid, mobile snap rail. |
| `sections/laces-product-rail.liquid` | Product rail with up to 4 collection tabs; panels use `product-block` + `carousel-slider` so quick buy, swatches, labels and ratings all work. |
| `sections/laces-athlete-fund.liquid` | Dark storytelling block with ledger rows (merchant-editable; defaults are published LACES copy). |
| `sections/laces-collab-stories.liquid` | Collaborations as numbered chapters (image / collection / product fallbacks). |
| `sections/laces-fit-compare.liquid` | Snapback vs Dad Hat comparison with spec chips. |
| `sections/laces-campaign.liquid` | Full-bleed campaign banner with optional live product card. |
| `sections/laces-community.liquid` | Photo strip + Roster tile + Instagram handle. |
| `sections/laces-footer.liquid` | New footer (newsletter band, brand, collection/menu/custom-link columns, Fund card, policies, payments, localisation). |
| `snippets/laces-product-title.liquid` | Splits "Snapback - Name - Colourway" into kicker / name / colourway for cards (`mode: card`) and the PDP (`mode: pdp`). |
| `snippets/laces-fund-note.liquid` | The Athlete Fund note used on PDP, cart drawer and mobile menu footer. |
| `snippets/laces-icon.liquid` | Inline SVG icons. |
| `docs/…` | Research, design system, these notes, screenshots. |

### Modified files (surgical)
| File | Change |
| --- | --- |
| `layout/theme.liquid` | Adds `laces-2026.css` (after Kinect CSS) and `laces-2026.js` (before Kinect JS). |
| `snippets/product-block.liquid` | Title now rendered through `laces-product-title`. Everything else untouched. |
| `assets/kinect-haus.js` | Swatch swap uses `window.LACES.renderCardTitle` when present (falls back to plain text). |
| `sections/main-product.liquid` | Title block renders through `laces-product-title` (kicker / H1 / colourway). |
| `sections/main-collection.liquid` | Non-image collection header replaced with `.l-coll-head` (breadcrumb, display H1, live count, description). Image-header path untouched. |
| `sections/cart-drawer.liquid` | Optional Athlete Fund note under the free-shipping bar + 3 schema settings. |
| `sections/header.liquid` | Mobile drawer footer pre-populated (Fund note, account, two quick links) + schema settings. Desktop/mega-menu markup untouched. |
| `sections/header-group.json` | Announcement bar: rotating instead of marquee, social icons off; header: logo 120/80px, mobile footer settings, search recommendations title. |
| `sections/footer-group.json` | `laces-footer` enabled; the original `footer` section kept but disabled for rollback. |
| `templates/index.json` | New homepage composition (11 enabled sections). The 12 previously-enabled Kinect sections are kept **disabled** for one-click rollback in the editor; the 10 sections that were already disabled in the export were removed to stay under Shopify's 25-section limit (they remain in the `main` baseline commit). |
| `templates/product*.json` | `l_fund_note` custom-liquid block after the buy buttons (not on `product.cal`, which already carries its own 10% Cal fund box). |
| `templates/collection*.json` | Removed the inline `h1 {…!important}` custom CSS now handled by the stylesheet (some files were re-indented by the JSON write; content changes are limited to that key). |

### Not touched
`kinect-haus.css`, all `k-*` sections/snippets, Shogun sections, app blocks (Vitals, Klaviyo, Loop Checkout+, wishlist, chat), `main.css/js`, filtering/sorting, variant picker, cart logic, locales, `settings_schema.json`, `settings_data.json`.

---

## 3. Homepage composition (templates/index.json)

1. `laces-hero` — "Built by athletes. Designed for everyone." · desktop `LACES_-_website_headers_6.jpg`, mobile `…headers_3_fd804ad3…jpg` · proof strip (free shipping $50+, 30-day returns, 5% → Athlete Fund)
2. `laces-category-tiles` — Snapbacks (feature) · Dad Hats · Hoodies · Rep Your Team · Rep Your City, live counts
3. `laces-product-rail` — tabs: Bestsellers / New arrivals / Signature
4. `laces-athlete-fund` — ledger: 5% of every sale · earned by showing up · split equally monthly → Athlete Fund / NIL pages
5. `laces-collab-stories` — Cal Athletes (featured) · Women Know Ball · Voices · Bloom · BAHC
6. `laces-fit-compare` — Snapback vs Dad Hat → Fit Guide
7. `laces-product-rail` — tabs: Rep your team / Rep your city / Bay Area / Vintage
8. `laces-campaign` — Women Know Ball with live product card
9. `laces-community` — five real photos + Roster tile + @laces.athletes
10. `testimonials` (existing, real reviews, restyled)
11. `scrolling-banner` (existing press logos, greyscaled)
Footer group: `laces-footer`.

Every image is an existing `shopify://shop_images/...` file already used by the store; no image is used twice on the page.

---

## 4. Technical decisions
- **Layer, don't fork.** Symmetry + Kinect stay intact; the new layer overrides via tokens and a later stylesheet. Rollback = remove two lines in `theme.liquid` and re-enable the old sections.
- **Typography.** Inter for all UI/body (the theme's own setting); Futura PT Condensed (existing Typekit kit) for display only; Roboto Mono retired by aliasing `--k-mono` to Inter. No new font requests.
- **Titles.** Catalogue titles are not changed; the split is presentational (Liquid for SSR, JS mirror for swatch swaps). Falls back gracefully for titles without separators.
- **Rails.** Reuse `carousel-slider` and `product-block` rather than a second carousel implementation; hidden tab panels initialise lazily when revealed (`on:debounced-resize` dispatched on tab change).
- **Reveal safety.** `.l-reveal` has a CSS keyframe fallback that forces visibility after 2.5 s even if JS is blocked.
- **Verified claims only.** Fund figures, shipping threshold, returns window and the Cal 10% are theme-editor text fields defaulting to copy already on getlaces.co; nothing is hardcoded in Liquid except the `laces-fund-note` defaults, which are overridable per section.
- **Images.** `image_tag` with `widths`/`sizes`, lazy below the fold, `fetchpriority="high"` on the hero; focal points honoured.

---

## 5. Known limitations / follow-ups
- **Store data, not theme:** filter group "badges" with duplicate values (ATHLETE DESIGN / ATHLETE DESIGNED, BESTSELLER / Bestseller) comes from Search & Discovery; a Colour / Fit filter needs product metafields or tags configured there. Menus (`kinect-desktop`, `kinect-header-right`, `kinect-mobile`, `footer`, `information`) are store navigation; the footer therefore builds its Shop column from a collection list so no menu edits are required.
- Product descriptions are short in the catalogue ("Classic design in familiar colors."); the PDP layout is ready for richer copy.
- The Roster is a Webflow site (`roster.getlaces.co`); the theme links to it and cannot embed athlete cards.
- Mitchell & Ness could not be inspected (bot protection) — documented in the research report.
- Third-party overlays (Klaviyo teaser, wishlist pill, chat bubble, Vitals toasts) are unchanged; the Kinect layer's mobile mitigations still apply.
- The old `footer` section and the 12 previous homepage sections are left disabled on purpose; delete them once the redesign is approved.
- Hero video is optional and off by default (no verified campaign video was selected); the section supports a Shopify-hosted video if the team wants one.
- Dev theme id changes if the development theme is deleted; use the URL printed by the CLI.
