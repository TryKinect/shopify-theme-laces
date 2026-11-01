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

## Apps & purchases
**Nothing needs to be bought for the Kinect changes so far** (homepage tile, Cal page, PDP redesign). Everything uses the Symmetry theme (already owned) and free, built-in Shopify features. Prices for optional apps are not listed because they haven't been checked.

**Free Shopify built-ins the changes need (setup, not purchases):**
- OPEN: **Custom data / metafields** (Settings → Custom data → Products): create `custom.fit_pair` (Product reference) for the Snapback / Dad hat toggle. `custom.sibling_products` (colorway swatches) already exists.
- OPEN: **Product templates** (Product → Theme template): assign `cal` to the 2 Cal hats.
- WATCH: **Cal Athletes Fund product** (`cal-athletes-fund`): a normal Shopify product. It needs to stay active and published to the Online Store, or the fund buttons and the add-on disappear.
- OPEN: **Theme Access app** (free, by Shopify): create a password for Devin so changes can be checked on the real draft instead of local renders.

**Apps installed on the live store** (seen in the live product page HTML; the list may be incomplete because apps without a storefront script don't appear):

| App | What it does | Touches Kinect changes? |
|---|---|---|
| Vitals | Reviews + conversion widgets (app embed) | WATCH: reviews on the PDP come from here. If its sticky-ATC / bundle / upsell widgets are on, test them with the fund add-on (they may add to cart outside the theme form and skip the add-on). |
| Loop Returns | Returns + return coverage (`return-coverage-block`); live theme is "[Loop Checkout+]" | OPEN: mark `cal-athletes-fund` as **non-returnable** in Loop (the page promises "non-refundable"), and check that return coverage doesn't price or cover the fund line. |
| Shogun | Page builder (`shogun-*` sections/templates, `product.json`) | WATCH: `product.json` keeps its Shogun sections. Don't remove them. |
| Klaviyo | Email/SMS onsite embed | No. "Early access" sign-up forms come from here. |
| Gorgias | Live chat / helpdesk | No. Its chat bubble may overlap the sticky ATC bar on mobile; check on the draft. |
| Triple Whale | Attribution pixel | No. Fund add-on purchases show up as 2 line items. |
| Growi | Creator / affiliate tracking | No. |
| Bestpush | Push notifications | No. |
| Kinect embed (`laces-embed-check`) | Kinect's own app embed | No. |

**Optional purchase (only if wanted):**
- OPEN: **Fund add-on via Shop Pay / express checkout.** The theme add-on can't hook into the dynamic checkout button. Ways to fix it: (a) hide the dynamic checkout button on the `cal` template (free, a template setting); (b) use a bundle/add-on app (Vitals may already include bundles, so check before buying anything); (c) ask for the fund in the cart drawer instead of on the PDP. Recommended: (a), unless express checkout matters on those 2 hats.
