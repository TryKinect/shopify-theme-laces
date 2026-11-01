# Kinect theme notes — dependencies, caveats, open questions

Running list of everything a Kinect change to this theme depends on or could break.
Update it in the same PR as the change. Shopify ignores this file (it is not a theme folder).

Status: **OPEN** = needs action/answer · **WATCH** = fine today, breaks if X changes · **DONE** = resolved

## Global
- WATCH: `main` syncs to the unpublished **Kinect Theme** draft. Never push/publish to the live theme ("[Loop Checkout+] LACES Shopify").
- WATCH: Custom code lives in `assets/kinect-haus.css`, `assets/kinect-haus.js`, `snippets/k-*.liquid`, `sections/k-*.liquid`. Symmetry `main.css` is untouched, so theme updates stay mergeable.
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
- OPEN: **Snapback / Dad hat toggle** (`snippets/k-fit-toggle.liquid`) only shows when a product has metafield `custom.fit_pair` (product reference) pointing to the same design in the other fit. The metafield definition must be created in Admin → Settings → Custom data → Products, then filled on both products of each pair (e.g. Cal snapback ↔ Cal dad hat, BADU snapback ↔ BADU dad hat). No metafield = no toggle (safe).
- WATCH: Toggle labels "Dad hat" vs "Snapback" are picked by whether the product title contains "dad". Renaming a dad hat without "Dad" in the title mislabels it.
- OPEN: **Hat profile labels are guesses.** `k-pdp-fit` highlights Low for dad hats (confirmed by the description "Low-profile fit") and **High** for every other hat (unconfirmed; the Cal snapback copy says "Mid-to-high"). Confirm the real profile for each style; change it with "Auto: profile for non-dad hats" or "Highlighted profile" in the template.
- OPEN: **Spec bar values** are template-wide: snapbacks = Structured crown / Flat brim / Snap closure / 100% cotton twill; dad hats = Low / Curved / Strap / 100% cotton twill. Any hat in those templates that differs (a curved-brim snapback, a mesh trucker) will show wrong specs. Edit in the customizer or move them to another template.
- WATCH: Photo strip (`k-pdp-strip`) shows product images 2–5. It hides itself if a product has fewer than 3 images. It assumes image 1 is the packshot, so reordering media in Admin changes what shows.
- WATCH: Gallery switched from 2-column grid to "carousel, thumbnails below" via Symmetry's `gallery_layout`. Revert per template in the customizer if needed.
- WATCH: "You may also like" retitled to "Complete the rotation" on all templates.
- OPEN: **Cal PDP template** `product.cal.json` must be assigned in Admin to `snapback-laces-x-cal-athletes` and `dad-hat-laces-x-cal-athletes` (Product → Theme template → "cal"). Until then they keep using the default template. The draft must be published for customers to see it.
- OPEN: **$25 Athlete Fund add-on** (`snippets/k-cal-fundbox.liquid`): when it's checked, a click on Add to cart first POSTs the fund's first available variant to `/cart/add.js`, then runs the theme's normal add. Test on the draft: (1) cart drawer shows both lines, (2) the Shop Pay / dynamic checkout button **skips the add-on** (it bypasses the form), (3) a sticky ATC click also adds it (same `button[name=add]`), (4) Loop/one-click-upsell apps don't conflict. It relies on product handle `cal-athletes-fund` (`all_products`). Renaming that handle hides the add-on.
- WATCH: "$X goes to Cal athletes" = product price × 10% (hard-set `pct: 10` in the template's custom-liquid block and `fund_percent` in the receipt section). If the commitment changes, update both.
- WATCH: Cal PDP receipt reuses `k-cal-receipt` and defaults to the current product when no product is set (the dad hat shows $38 → $3.80).
