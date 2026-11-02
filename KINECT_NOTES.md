# Kinect theme notes — dependencies, caveats, open questions

Running list of everything a Kinect change to this theme depends on or could break.
Update it in the same PR as the change. Shopify ignores this file (it is not a theme folder).

Status: **OPEN** = needs action/answer · **WATCH** = fine today, breaks if X changes · **DONE** = resolved

## Global
- WATCH: `main` syncs to the unpublished **Kinect Theme** draft. Never push/publish to the live theme ("[Loop Checkout+] LACES Shopify").
- WATCH: Custom code lives in `assets/kinect-haus.css`, `assets/kinect-haus.js`, `snippets/k-*.liquid`, `sections/k-*.liquid`, **and inside template JSON** (`templates/*.json`: `custom-liquid` blocks, accordion `custom_liquid`, section `custom_css`). Grep templates too before changing a snippet. Symmetry `main.css` is untouched, so theme updates stay mergeable.
- OPEN: Changes are verified with local static renders, not the real draft. The Shopify CLI needs 2FA/Theme Access token. Check every PR on the draft before publishing.
- WATCH: PRs are merged by Varun (Devin's merge is blocked by a safety hook).

## Homepage (PR #4)
- WATCH: `templates/index.json` is at Shopify's 25-section cap. To add a section, delete a disabled one first.
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
- OPEN: **Cal PDP template** `product.cal.json` must be assigned in Admin to `snapback-laces-x-cal-athletes` and `dad-hat-laces-x-cal-athletes` (Product → Theme template → "cal"). Until then they keep using the default template. The draft must be published for customers to see it.
- OPEN: **$25 Athlete Fund add-on** (`snippets/k-cal-fundbox.liquid`): when it's checked, submitting the main or sticky ATC form rewrites it to `items[0]`=hat, `items[1]`=fund, so the theme's own AJAX add sends both in one all-or-nothing `/cart/add` request; errors show in the theme's normal error message and the box stays checked. Depends on Symmetry's `form.js-product-form[data-product-id]` + `on:cart:add`/`on:cart:error` events, so re-check after a theme update. Test on the draft: (1) cart drawer shows both lines, (2) the Shop Pay / dynamic checkout button **skips the add-on** (it bypasses the form), (3) sticky ATC adds both, (4) Loop/one-click-upsell apps don't conflict. It relies on product handle `cal-athletes-fund` (`all_products`). Renaming that handle hides the add-on.
- WATCH: "$X goes to Cal athletes" = product price × 10% (hard-set `pct: 10` in the template's custom-liquid block and `fund_percent` in the receipt section). If the commitment changes, update both.
- WATCH: Cal PDP receipt reuses `k-cal-receipt` and defaults to the current product when no product is set (the dad hat shows $38 → $3.80).

## Navigation, merchandising, collections, reviews, pop-ups (nav-merch PR)

### Manual Shopify Admin steps (Theme Access can't do these)
- OPEN: **Desktop header = split nav (Varun picked option C).** 4 links left of the logo, 2 text links right of it, icons far right; mobile keeps ☰. Three menus in Admin → Content → Menus:
  - **`signature-2026` (desktop left, 4 top-level items only)**:
    - **Shop** → Hats (Snapback `/collections/snapback`, Dad Hats `/collections/dad-hat`, Football `/collections/football`, All Hats `/collections/all-hats`) · Apparel (Hoodies `/collections/hoodies`, Socks `/collections/socks`) · Rep Your City (Bay Area `/collections/bay-area`, West `/collections/west-coast`, East `/collections/east-coast`, Midwest `/collections/midwest`, South `/collections/the-south`). Bestsellers/New photo tiles come from the header's existing "Menu promotion" blocks (Theme editor → Header).
    - **New** → `/collections/new-arrivals` (pick one of `new` / `new-arrivals`, see below)
    - **Bestsellers** → `/collections/best-sellers`
    - **Collabs** → Cal Athletes `/pages/cal-athletes`, Women Know Ball `/pages/women-know-ball`, VOICES `/collections/voices-collection`, Bloom, Bay Area Host Committee `/collections/bahc`, All collabs `/pages/collaborations`
  - **New menu `header-right` (desktop right, 2 items, no children)**: **About** → Our Story page · **Roster** → `https://roster.getlaces.co`. Then Theme editor → Header → "Right-side links (desktop)" → pick `header-right`. Nothing shows on the right until this is set. Only top-level links render there; nested items are ignored.
  - **`signature-mobile` (☰ drawer)**: same 4 as desktop plus **About** (Our Story, Athlete Fund, Join the Roster `/pages/nil`) and **Roster**, since the right-side links are desktop-only.
  - Remove the collection literally named "1" and fix label/destination mismatches: "About" currently opens NIL, "Join Our Roster" opens the Athlete Fund page, "Sale" opens the full catalog.
- WATCH: **Desktop nav sits on the same line as the logo, never a second row.** At ≥1024px Symmetry measures whether the left links fit; if not, the header falls back to ☰ + SHOP and hides the right-side links. With the 4-link menu + 2 right links it fits down to 1024px (checked 1024/1100/1280/1440). With 5 or fewer top-level links the theme uses roomier 12px/wide-tracked spacing; today's 7-link menu keeps the tight 11px spacing (inline from ~1440px). Keep top-level labels to one or two short words.
- OPEN: **Sale collection**: 73/77 products are in it but none have a compare-at price. Either set compare-at prices for a real sale or remove Sale from menus (`nav_featured_link` = "Sale" in the header settings highlights it).
- OPEN: **Duplicate/odd collections**: `new` vs `new-arrivals`, `hoodies` vs `apparel`, handle `1`. Retire one of each pair (redirect the old URL in Admin → Navigation → URL redirects).
- OPEN: **Basketball (`basketball-collection`) and Wooly Pig** have 0 published products. Publish them or unpublish the collections so menus/links don't land on empty pages.
- OPEN: **Collection descriptions**: tabs and description slot are ready, but most collections have no description. Add one line each in Admin → Collections (shown above the grid in muted text). Suggested: Snapback, Dad Hats, Football, Rep Your City, Rep Your Team, Hoodies, Socks, LACES Signature.
- OPEN: **Collection titles show as tab labels** (" Collection" is stripped). Rename "LACES Hoodie Collection" → "Hoodies" etc. in Admin if you want cleaner tabs.

### Collection tabs + in-grid story card (`sections/main-collection.liquid`, `snippets/k-grid-promo.liquid`, `templates/collection.json`)
- WATCH: Tabs = the section's **Related collections** list (Theme editor → Collection → Related collections): All Hats, Snapback, Dad Hats, Football, Rep Your Team, Rep Your City, LACES Signature, Hoodies, Socks. The current collection is highlighted. Applies to the default collection template only; `collection.hoodies`, `collection.voices`, `collection.bahc`, `collection.landing`, `collection.what-s-new` templates have their own settings.
- WATCH: Story card ("Designed by Cal Athletes" → `/pages/cal-athletes`) shows on page 1 of the handles in **"Collection handles"** (`snapback,football,all-hats,rep-your-team`) after product 3. Image = `158.jpg` (Cal volleyball photo from the Cal page). Renaming a collection handle silently removes the card there.
- WATCH: `main-collection` schema is at Shopify's 40-settings limit. **Adding one more setting makes Shopify ignore the section's new settings** (that's why kicker/CTA text are fixed in the snippet call). Remove a setting before adding one.
- OPEN: Card copy "Every hat supports the Cal LACES Athlete Fund." needs the same legal/fund-accuracy sign-off as the Cal page copy. Editable in the Theme editor.
- OPEN: Women Know Ball / VOICES cards: no product tags identify those lines yet. Tag products (e.g. `line_wkb`, `line_voices`) and we can add a second card per line.

### Athlete label on product cards (`snippets/product-label.liquid`)
- WATCH: Label priority: product metafield `custom.designed_by` (text, shows "Designed by <name>") → title contains "Cal Athletes" → tag `Athlete Design` / `Athlete Designed` → no label. Today 6 products have the `Athlete Design` tag and 2 Cal hats match by title.
- WATCH: Products that already have an athlete badge in the existing `custom.badges` metafield (list) keep that badge (now navy/gold) and skip the theme label, so nothing shows twice. Today that's the Legacy hats.
- OPEN: To show athlete names, create a product metafield definition `custom.designed_by` (single-line text) in Admin → Settings → Custom data → Products, and fill it per product.

### Homepage (`templates/index.json`)
- WATCH: Added **Cal Athletes banner** (reused the old disabled Labor Day "image with text overlay" section, now "Cal Athletes banner", after New Arrivals) and a **Rep Your City** product row (`rep-your-city`, after Rep Your Team). Deleted the disabled "LACES Rookies" featured-blog section to stay at 24/25 sections. One slot left.

### Reviews (Vitals) and third-party pop-ups (`assets/kinect-haus.css`, `assets/kinect-haus.js`)
- WATCH: Vitals' reviews widget (`#vitals-end-section .vtl-pr-main-widget`) is hidden when it contains `.vtl-pr-stats--no-reviews`. If Vitals changes its markup the empty block comes back; if you switch to Judge.me/Yotpo, re-check. Populated reviews are untouched. Vitals doesn't render on the local preview, so **verify on the draft** with a 0-review product and one with reviews.
- WATCH: **Klaviyo popup on mobile** is held (hidden, page scroll unlocked) until the shopper scrolls 1.5 screens or 20 s pass, once per browser session. It targets `[role=dialog][aria-label="POPUP Form"]`; if Klaviyo changes that label the hold stops working (popup just shows normally). Better long-term: set the form's mobile timing in **Klaviyo → Signup forms → Targeting & behavior** (e.g. show after 15 s or 40% scroll) and remove the theme hold.
- WATCH: Mobile only: Wishlist launcher is an icon-only circle; Vitals "recent sales" toasts are hidden on collection/product/search; Gorgias chat + Wishlist lift above the theme's sticky add-to-cart when it's showing. Gorgias' position can also be set in **Gorgias → Chat → Appearance**.
- OPEN: Manual QA on the draft after merge: Klaviyo popup (mobile delayed, desktop normal), Gorgias chat opens, Wishlist add/open, Vitals reviews (empty vs populated), Loop + one-click upsell at checkout, Bestpush notify-me on a sold-out hat, Kinect widget.
