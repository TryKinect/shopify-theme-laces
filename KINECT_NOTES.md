# Kinect theme notes — dependencies, caveats, open questions

Running list of everything a Kinect change to this theme depends on or could break.
Update it in the same PR as the change. Shopify ignores this file (it is not a theme folder).

Status: **OPEN** = needs action/answer · **WATCH** = fine today, breaks if X changes · **DONE** = resolved

## Global
- WATCH: `main` syncs to the **Kinect Theme**, which is now the **published (live)** theme. Merging to `main` ships to customers, and Shopify editor saves on the Kinect Theme commit back to `main`, so coordinate with whoever is editing in the theme editor before merging. Review each PR on a theme linked to its branch first. The old "[Loop Checkout+] LACES Shopify" theme is unpublished; leave it as the rollback.
- WATCH: Custom code lives in `assets/kinect-haus.css`, `assets/kinect-haus.js`, `snippets/k-*.liquid`, `sections/k-*.liquid`, **and inside template JSON** (`templates/*.json`: `custom-liquid` blocks, accordion `custom_liquid`, section `custom_css`). Grep templates too before changing a snippet. Symmetry `main.css` is untouched, so theme updates stay mergeable.
- WATCH: Devin verifies with `shopify theme dev` (Theme Access token) on a temporary preview theme. App blocks (Vitals, Klaviyo, Gorgias, Wishlist, Loop) only behave fully on a real theme, so also check every PR on a theme linked to its branch before merging.
- WATCH: PRs are merged by Varun (Devin's merge is blocked by a safety hook).

## Homepage (PR #4)
- WATCH: `templates/index.json` has a 25-section cap (disabled sections count). It's at 22/25 after the homepage-ajay-sections PR.
- WATCH: Berkeley Roster tile links to `/pages/cal-athletes`. If that page handle changes, the tile 404s.

## Cal Athletes page (PR #5)
- WATCH: Receipt numbers are computed from the selected product price × fund % (10%). If the 10% commitment changes, update `fund_percent` in the receipt section (page and Cal PDP).
- WATCH: Old sections (old hero, rich text, fund image/text, video, The Suit) are `disabled`, not deleted. Re-enabling them changes the page order.
- OPEN: Melius-generated Squirrel Bear art (`assets/k-cal-roster.jpg`, `assets/k-cal-fund.jpg`) needs brand/licensing sign-off before ads or print.
- WATCH: Fund contribution claims ("not tax-deductible", "non-refundable", "equal split for athletes hitting Activity Goals") are copied from the existing page. Legal should approve any wording change.
- WATCH: Fund buttons are the real `cal-athletes-fund` variants ($25–$500). Renaming or deleting a variant changes the buttons.

## Product pages — design A (PDP PR)
Templates changed: `product.hats.json`, `product.dad-hats.json`, `product.apparel.json`, `product.socks.json`, `product.json` (default/Shogun). New: `product.cal.json`. Not touched: `product.preorder.json`, `product.alternative.json`.
- WATCH: Cal template's Fit & Fabric accordion uses `custom_liquid` that shows the dad-hat or snapback bullet list by title (copied from the dad-hats / hats templates). Edit both copies if the copy changes.
- OPEN: **Snapback / Dad hat toggle** (`snippets/k-fit-toggle.liquid`) only shows when a product has metafield `custom.fit_pair` (product reference) pointing to the same design in the other fit. The metafield definition must be created in Admin → Settings → Custom data → Products, then filled on both products of each pair (e.g. Cal snapback ↔ Cal dad hat, BADU snapback ↔ BADU dad hat). No metafield = no toggle (safe).
- WATCH: Toggle labels "Dad hat" vs "Snapback" are picked by whether the product title contains "dad". Renaming a dad hat without "Dad" in the title mislabels it.
- OPEN: **Hat profile labels are guesses.** `k-pdp-fit` highlights Low for dad hats (confirmed by the description "Low-profile fit") and **High** for every other hat (unconfirmed; the Cal snapback copy says "Mid-to-high"). Confirm the real profile for each style; change it with "Auto: profile for non-dad hats" or "Highlighted profile" in the template.
- OPEN: **Spec bar values** are template-wide (each spec can be limited to dad / non-dad hats via "Show on"; Cal template uses that: snapback Mid-high/Curved/Snap, dad Low/Curved/Buckle, both 100% cotton twill, taken from the product descriptions): snapbacks = Structured crown / Flat brim / Snap closure / 100% cotton twill; dad hats = Low / Curved / Strap / 100% cotton twill. Any hat in those templates that differs (a curved-brim snapback, a mesh trucker) will show wrong specs. Edit in the customizer or move them to another template.
- WATCH: Photo strip (`k-pdp-strip`) shows product images 2–5. It hides itself if a product has fewer than 3 images. It assumes image 1 is the packshot, so reordering media in Admin changes what shows.
- WATCH: Gallery switched from 2-column grid to "carousel, thumbnails below" via Symmetry's `gallery_layout`. Revert per template in the customizer if needed.
- WATCH: "You may also like" retitled to "Complete the rotation" on all templates.
- OPEN: **Cal PDP template** `product.cal.json` must be assigned in Admin to `snapback-laces-x-cal-athletes` and `dad-hat-laces-x-cal-athletes` (Product → Theme template → "cal"). Until then they keep using the default template.
- OPEN: **$25 Athlete Fund add-on** (`snippets/k-cal-fundbox.liquid`): when it's checked, submitting the main or sticky ATC form rewrites it to `items[0]`=hat, `items[1]`=fund, so the theme's own AJAX add sends both in one all-or-nothing `/cart/add` request; errors show in the theme's normal error message and the box stays checked. Depends on Symmetry's `form.js-product-form[data-product-id]` + `on:cart:add`/`on:cart:error` events, so re-check after a theme update. Test on a PR-linked theme: (1) cart drawer shows both lines, (2) the Shop Pay / dynamic checkout button **skips the add-on** (it bypasses the form), (3) sticky ATC adds both, (4) Loop/one-click-upsell apps don't conflict. It relies on product handle `cal-athletes-fund` (`all_products`). Renaming that handle hides the add-on.
- WATCH: "$X goes to Cal athletes" = product price × 10% (hard-set `pct: 10` in the template's custom-liquid block and `fund_percent` in the receipt section). If the commitment changes, update both.
- WATCH: Cal PDP receipt reuses `k-cal-receipt` and defaults to the current product when no product is set (the dad hat shows $38 → $3.80).

## Navigation, merchandising, collections, reviews, pop-ups (nav-merch PR)

### Manual Shopify Admin steps (Theme Access can't do these)
- OPEN: **Desktop header = split nav (Varun picked option C).** 4 links left of the logo, 2 text links right of it, icons far right; mobile keeps ☰. Three menus in Admin → Content → Menus. **Naming rule:** every menu the Kinect Theme uses is titled `Kinect – …` with a `kinect-` handle. Since the Kinect Theme is now published, editing those menus changes the live site. The old theme's menus (`signature-2026`, `signature-mobile`, `footer` …) only feed the unpublished rollback theme. The Kinect Theme points at the Kinect menus in `sections/header-group.json`, so publishing it at cutover brings them along:
  - **Kinect – Desktop `kinect-desktop` (desktop left, 4 top-level items only)**:
    - **Shop** → Hats (Snapback `/collections/snapback`, Dad Hats `/collections/dad-hat`, Football `/collections/football`, All Hats `/collections/all-hats`) · Apparel (Hoodies `/collections/hoodies`, Socks `/collections/socks`) · By Region (West / East / Midwest / South → `/collections/all-hats?filter.p.m.custom.region=<Region>`; see the collections refresh section below). Bestsellers/New photo tiles come from the header's existing "Menu promotion" blocks (Theme editor → Header).
    - **New** → `/collections/new-arrivals` (pick one of `new` / `new-arrivals`, see below)
    - **Bestsellers** → `/collections/best-sellers`
    - **Collabs** → Cal Athletes `/pages/cal-athletes`, Women Know Ball `/pages/women-know-ball`, VOICES `/collections/voices-collection`, Bloom `/pages/bloom`, Bay Area Host Committee `/pages/bahc`, All collabs `/pages/collaborations`
  - **Kinect – Header Right `kinect-header-right` (desktop right, 2 items, no children)**: **About** → `/pages/nil` (same as live; there is no Our Story page, so swap it if LACES adds one) · **Roster** → `https://roster.getlaces.co`. Already selected in `header-group.json`. Only top-level links render there; nested items are ignored.
  - **Kinect – Mobile `kinect-mobile` (☰ drawer)**: same 4 as desktop plus **About** (`/pages/nil`, Athlete Fund, Join the Roster `/pages/nil`) and **Roster**, since the right-side links are desktop-only.
  - Remove the collection literally named "1" and fix label/destination mismatches: "About" currently opens NIL, "Join Our Roster" opens the Athlete Fund page, "Sale" opens the full catalog.
- WATCH: **Desktop nav sits on the same line as the logo, never a second row.** At ≥1024px Symmetry measures whether the left links fit; if not, the header falls back to ☰ + SHOP and hides the right-side links. With the 4-link menu + 2 right links it fits down to 1024px (checked 1024/1100/1280/1440). With 5 or fewer top-level links the theme uses roomier 12px/wide-tracked spacing; today's 7-link menu keeps the tight 11px spacing (inline from ~1440px). Keep top-level labels to one or two short words.
- OPEN: **Sale collection**: 73/77 products are in it but none have a compare-at price. Either set compare-at prices for a real sale or remove Sale from menus (`nav_featured_link` = "Sale" in the header settings highlights it).
- OPEN: **Duplicate/odd collections**: `new` vs `new-arrivals`, `hoodies` vs `apparel`, handle `1`. Retire one of each pair (redirect the old URL in Admin → Navigation → URL redirects).
- OPEN: **Basketball (`basketball-collection`) and Wooly Pig** have 0 published products. Publish them or unpublish the collections so menus/links don't land on empty pages.
- OPEN: **Collection descriptions**: tabs and description slot are ready, but most collections have no description. Add one line each in Admin → Collections (shown above the grid in muted text). Suggested: Snapback, Dad Hats, Football, Rep Your City, Collabs, LACES Signature, Apparel, Hoodies, Socks.
- OPEN: **Collection titles show as tab labels** (" Collection" is stripped). Rename "LACES Hoodie Collection" → "Hoodies" etc. in Admin if you want cleaner tabs.

### Collection tabs + in-grid story card (`sections/main-collection.liquid`, `snippets/k-grid-promo.liquid`, `templates/collection.json`)
- WATCH: Tabs = the section's **Related collections** list (Theme editor → Collection → Related collections): All Hats, Snapback, Dad Hats, Football, Rep Your City, Collabs (`remix-collection`), LACES Signature. The current collection is highlighted. Applies to the default collection template only; `collection.hoodies` and `collection.apparel` show Apparel, Hoodies, Socks; `collection.voices`, `collection.voices`, `collection.bahc`, `collection.landing`, `collection.what-s-new` templates have their own settings.
- WATCH: Story card ("Designed by Cal Athletes" → `/pages/cal-athletes`) shows on page 1 of the handles in **"Collection handles"** (`snapback,football,all-hats,rep-your-city`) after product 3. Image = `158.jpg` (Cal volleyball photo from the Cal page). Renaming a collection handle silently removes the card there.
- WATCH: `main-collection` schema is at Shopify's 40-settings limit. **Adding one more setting makes Shopify ignore the section's new settings** (that's why kicker/CTA text are fixed in the snippet call). Remove a setting before adding one.
- OPEN: Card copy "Every hat supports the Cal LACES Athlete Fund." needs the same legal/fund-accuracy sign-off as the Cal page copy. Editable in the Theme editor.
- OPEN: Women Know Ball / VOICES cards: no product tags identify those lines yet. Tag products (e.g. `line_wkb`, `line_voices`) and we can add a second card per line.

### Athlete label on product cards (`snippets/product-label.liquid`)
- WATCH: Label priority: product metafield `custom.designed_by` (text, shows "Designed by <name>") → title contains "Cal Athletes" → tag `Athlete Design` / `Athlete Designed` → no label. Today 6 products have the `Athlete Design` tag and 2 Cal hats match by title.
- WATCH: Products that already have an athlete badge in the existing `custom.badges` metafield (list) keep that badge (now navy/gold) and skip the theme label, so nothing shows twice. Today that's the Legacy hats.
- OPEN: To show athlete names, create a product metafield definition `custom.designed_by` (single-line text) in Admin → Settings → Custom data → Products, and fill it per product.

### Homepage (`templates/index.json`)
- WATCH: Added **Cal Athletes banner** (reused the old disabled Labor Day "image with text overlay" section, now "Cal Athletes banner", after New Arrivals) and a **Rep Your City** product row (`rep-your-city`, after Rep Your Team). Deleted the disabled "LACES Rookies" featured-blog section (the count later dropped to 22/25, see the homepage section below).

### Reviews (Vitals) and third-party pop-ups (`assets/kinect-haus.css`, `assets/kinect-haus.js`)
- WATCH: Vitals' reviews widget (`#vitals-end-section .vtl-pr-main-widget`) is hidden when it contains `.vtl-pr-stats--no-reviews`. If Vitals changes its markup the empty block comes back; if you switch to Judge.me/Yotpo, re-check. Populated reviews are untouched. Vitals doesn't render on the local preview, so **verify on a PR-linked theme** with a 0-review product and one with reviews.
- WATCH: **Klaviyo popup on mobile** is held (hidden, page scroll unlocked) until the shopper scrolls 1.5 screens or 20 s pass, once per browser session. It targets `[role=dialog][aria-label="POPUP Form"]`; if Klaviyo changes that label the hold stops working (popup just shows normally). Better long-term: set the form's mobile timing in **Klaviyo → Signup forms → Targeting & behavior** (e.g. show after 15 s or 40% scroll) and remove the theme hold.
- WATCH: Product-card stars are rendered by the theme (`snippets/k-card-rating.liquid`) from the `reviews.rating` / `reviews.rating_count` metafields that Vitals syncs. Vitals' own card stars are hidden, because they added a new row every time a card's color swatch swapped the card (e.g. Legacy Black showed (13) then (20)). They are controlled by the theme setting "Show rating in product cards". If Vitals stops syncing, cards keep showing the last synced values; they only disappear when `reviews.rating_count` is cleared or set to 0 (the PDP widget is unaffected). Verify on a PR-linked theme: hover the swatches on a Legacy card, and you should see one left-aligned row that changes count.
- WATCH: Mobile only: Wishlist launcher is an icon-only circle; Vitals "recent sales" toasts are hidden on collection/product/search; Gorgias chat + Wishlist lift above the theme's sticky add-to-cart when it's showing. Gorgias' position can also be set in **Gorgias → Chat → Appearance**.
- OPEN: Manual QA on a PR-linked theme before merge: Klaviyo popup (mobile delayed, desktop normal), Gorgias chat opens, Wishlist add/open, Vitals reviews (empty vs populated), Loop + one-click upsell at checkout, Bestpush notify-me on a sold-out hat, Kinect widget.

## Dropdown menus with hover previews (mega-menu PR)
- **Shop** (mega menu): three link columns, then the two promo tiles fill the rest of the row. Hovering any link with a photo swaps the tiles for that link's photo plus "Shop now". Collection links (`/collections/...`) use the collection image, or its first product's image if it has none. Product links use the product image.
- **Collabs** (small dropdown): links on the left, photo on the right that changes on hover. Page links (`/pages/...`) have no image of their own, so each one gets a **"Menu link preview image"** block in Theme editor → Header. Set the link name exactly as it appears in the menu, then either an image or a product. These are set up today:
  - Cal Athletes → the Cal photo
  - Women Know Ball → `women-know-ball-black`
  - Bloom → `bloom-x-laces-2`
  - Bay Area Host Committee → `bahc-worldsgame`
- **If you rename a menu link in Admin, rename its preview block too.** Otherwise that link shows no photo.
- The "LACES x Cal Athletes Collab" promo block is disabled (not deleted). Turning it back on makes Collabs a full-width mega menu again.

## Collections, tags and filters refresh (collections-refresh PR)

Team calls: no division/conference filter (NFL agreement), Rep Your Team removed, Golf Bucket stays under Dad Hat, Sale removed for now, regions as one "By Region" menu column.

### Theme-only (merged; now live)
- Hat tabs (`templates/collection.json`): All Hats · Snapback · Dad Hat · Football · Rep Your City · Collabs (`remix-collection`) · Signature. Rep Your Team is out of the tabs and the promo-card list.
- Apparel tabs (Apparel · Hoodies · Socks) on `templates/collection.hoodies.json` and a new `templates/collection.apparel.json`. Assign the `apparel` template to the Apparel and Socks collections in Admin; on the live theme they fall back to the default template.
- Filter sidebar starts open on desktop.

### Store-wide Admin changes (also change the live store)
1. Export before-state (products, tags, types, `custom.badges`, collection rules, filters, redirects) to `laces-audit/` before writing.
2. Product metafields `custom.style`, `custom.line`, `custom.region`, `custom.color` (list of single-line text), filled from `laces-audit/tags/final-map.json`. No conference/division field.
3. `custom.badges` values normalized to Athlete Designed / Bestseller / New / Limited.
4. Product type `Hat` on Bloom x LACES and MINDSET Blue.
5. Existing `nav_*`, AFC/NFC tags stay untouched.
6. Collections: All Hats = every hat; Collabs = Cal, Women Know Ball, Bloom, BAHC; Signature = hats only; Rep Your City = every city hat; new Apparel = hoodies + socks.
7. Hide Rep Your Team and Sale from Online Store (don't delete). Redirects: `/collections/rep-your-team` → `/collections/football`, `/collections/sale` → `/collections/all-hats`.
8. Search & Discovery filters, in order: Style · Line · Region · Color · Featured (rename of `badges`) · Availability · Price.
9. Kinect - Desktop menu: "By Region" column under Shop with West / East / Midwest / South → `/collections/all-hats?filter.p.m.custom.region=<Region>`. Don't edit live menus.

### Mindful
- Search & Discovery filters and collection rules are shared with the live theme.
- Color is the crown + brim color read off each product photo (two-tone football hats = Cream + brim color). Spot-check before relying on it.
- Open question: Bay Area Vintage Navy is tagged as a collab; mapped as City until confirmed.

## Site audit fixes (audit-fixes PR)

The Kinect Theme is the **published** theme now: merging to `main` ships to the live store. Review on a theme linked to the PR branch first.

### Theme changes
- Homepage: first filmstrip tile → `/pages/women-know-ball`; the Rep Your Team row is retitled Football (same `football` collection); Cal banner button keeps the "link" style set in the theme editor.
- PDP sibling picker: "Color:" comes from a variant option named Color (updates when the variant changes), then `custom.color`; otherwise it reads "More colors". It fills in once `custom.color` is populated.
- Products with type `Contribution` (Cal Athletes Fund) skip the "ready to ship" stock line and the shipping/returns trust row. New `templates/product.fund.json` (title, price, amount, buy button, description).
- Collection tabs only show when the current collection is one of the tabs (not on Best Sellers / What's New / All).
- Collections drop the search-only "Most relevant" sort (`most-relevant`); an empty filtered result shows a "Clear filters" button.
- Collection cards show "+ Add" / "Choose options" on touch screens.
- Cart drawer shows Remove on each line.
- `/collections` lists Best Sellers, What's New, All Hats, Snapback, Dad Hats, Football, Rep Your City, Signature, Collabs, Voices, Apparel.
- 404 has search, category links and a Best sellers row. Contact page has an intro, the fund email and policy links.
- Product images fall back to the product title for alt text; the PDP photo strip skips the first 3 images, but always leaves at least 2 (products with 3+ images keep the strip).
- CSS hides Vitals' sticky add-to-cart (`#bundle-sticky_add_to_cart`), hides chat/Wishlist/Klaviyo teaser while the cart or menu drawer is open and at the top of mobile PDPs, gives footer icons 44px targets, and keeps AI split-screen blocks inside the phone width.

### Manual Shopify Admin steps
- Assign the `fund` product template to Cal Athletes Fund.
- Assign `cal` to both Cal hats, `dad-hats` to dad hats; decide on `hats` for snapbacks.
- Assign the `apparel` collection template to Apparel and Socks.
- Vitals (needs an account with Vitals access): turn off its Sticky Add to Cart and the cart countdown banner; exclude "Pay now to unlock free returns" from Recent Sales.
- Klaviyo: don't open the pop-up over the cart / right after add to cart. Gorgias: raise the mobile offset. Wishlist: allow guest wishlists.
- Remaining audit Admin items (collection membership, sold-out sort, descriptions, badges, legacy collections and pages, filters) are in `laces-audit/LACES-site-audit.md` section B.

### Mindful
- The floating-widget rules key off third-party selectors (`iframe#chat-button`, `.nm-wishlist-open-list-button`, `[class*="kl-teaser"]`, `#bundle-sticky_add_to_cart`). If an app update renames them, the widgets just show again; nothing breaks.

## Homepage: filmstrip hero + LACES sections (homepage-ajay-sections PR)

- DONE: Ajay's homepage sections (`sections/laces-*.liquid`, pulled from his dev theme `Development (64feb2-Ajays-MacBook-Air)` #188154970330) sit between the filmstrip hero and the existing Kinect rows. Varun's call: keep the filmstrip hero and the Kinect nav; bring Ajay's sections plus the rest of the current homepage.
- WATCH: `assets/laces-home.css` / `assets/laces-home.js` load on the homepage only (`template.name == 'index'` in `layout/theme.liquid`). The CSS keeps only `l-` rules from Ajay's `laces-2026.css`; his header, nav, card, footer, PDP and cart restyles and the `--k-*` token overrides were left out on purpose. If his other pages are wanted later, port them separately.
- WATCH: `templates/index.json` has 22 of 25 sections. The 10 disabled legacy sections (background videos, compact messages, hotspots, etc.) were deleted to make room; they're in git history.
- OPEN: Ajay's rows overlap the old Kinect rows (The Rotation vs Bestsellers/New Arrivals, his Rep rail vs Football/Rep Your City, Women Know Ball campaign vs Shop the Look). Pick which to keep on the preview, then disable the rest in the editor.
- Team rule applied: Ajay's "Rep Your Team" tile and rail tab are relabelled Football.
