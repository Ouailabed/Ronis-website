# Business facts — sources and open questions

Last checked: **September 2026**. The official site (ronisonline.co.uk) could not be fetched directly from the build environment, so facts were taken from search-engine copies of its pages, plus Roni's own listings on Deliveroo and Facebook. **Please confirm the items marked ❓ with Roni's before launch.**

## Locations (source: ronisonline.co.uk "STORES" home page unless noted)

| Shop | Address | Phone | Hours | Delivery |
| --- | --- | --- | --- | --- |
| West Hampstead | 250 West End Lane, NW6 1LG | 020 7794 6663 | Mon–Sun 7am–midnight | Deliveroo `west-hampstead/ronis-bakery` |
| Belsize Village | 37 Belsize Lane, NW3 5AS | 020 7998 1477 | Mon–Sun 7am–6pm | Deliveroo `belsize-park/ronis-belsize` |
| Hampstead | 44 Rosslyn Hill, NW3 1NH | 020 7433 3103 | Mon–Sun 7am–8pm | Deliveroo `hampstead/ronis-hampstead` |
| Swains Lane | 2 Swains Lane, N6 6AG | 020 8340 4404 | Mon–Sun 7am–6pm | none found |
| Muswell Hill | 348 Muswell Hill Broadway, N10 1DJ | 020 8829 4999 | Mon–Sun 7am–8pm | Deliveroo `muswell-hill/ronis` |
| Brent Cross | Brent Cross Shopping Centre ❓ | 020 8457 4999 (official `/contact-3` page) | ❓ not published | none found |

- ❓ **Brent Cross**: hours and exact unit/postcode are not on Roni's site. The site shows "please call" instead of guessing.
- ❓ A **Roni's Primrose Hill** listing exists on Deliveroo but isn't on Roni's website, so it's not included.
- ❓ Bank-holiday hours are not published.

## Ordering destinations (all official)

- Online ordering: `https://www.ronisonline.co.uk/online-ordering` ("Online Orders (New)"). ❓ **September 2026: the page says it is "Not Accepting Orders"**, so the site now puts "call the shop" and Deliveroo first and only mentions the online page as a fallback. When Roni's turns it back on, set `ordering.onlineOrderingLive = true` in `src/data/business.ts`. The older `/order-online` page says ordering there is no longer available, so it is **not** used.
- Catering: `https://www.ronisonline.co.uk/catering`
- Platters menu: `https://www.ronisonline.co.uk/menu?menu=platters`
- Cakes and occasions: `https://www.ronisonline.co.uk/order-for-any-occasion`
- Feedback: `https://www.ronisonline.co.uk/review`

## Map

- The Locations page and every shop page show a real street map (OpenStreetMap data, CARTO tiles, Leaflet), loaded only when it scrolls into view.
- Pins are placed from each address (`approx` in `business.ts`); ❓ confirm each pin sits on the right shopfront and nudge the numbers if not. Directions buttons always use the full address.

## Catering

- "Please allow 48 hours for catering orders." Order online and collect in store. "For last minute orders please call the shop you wish to collect from." (official catering page)
- Mini bagel platter: 25 mini bagels, **£55**; fillings: smoked salmon & cream cheese, tuna mix & cucumber, cheddar cheese & tomato (official platters menu). ❓ Confirm the current price.
- Also listed: breaded chicken breast fingers & chips platters, breaded white fish nuggets & chips platters, vegetable bites (broccoli, green beans, cauliflower nuggets in a chilli & garlic sweet sauce), signature mini desserts. Vegetarian and vegan options mentioned.
- ❓ Lead time for **bespoke cakes** is not published; the site says to check when ordering or call.

## Menu

Items and descriptions come from Roni's site and Roni's own Deliveroo listings. **No prices are shown** (except the platter), because they differ between shops and channels, and the official breakfast menu showed prices in € — likely a currency setting on the Wix site worth fixing.

## Story (official home page)

- "Roni's Bagel Bakery was opened by Roni Avital in 1989 in West Hampstead", specialising in "authentic bagels and Jewish baked goods with an artisan style".
- "It quickly became well established for quality fresh goods and got the reputation of the best bagel bakery selling bagels and cakes around the UK." (quoted as Roni's own words)
- 2011: Roni and Alon opened Roni's Bagel Bakery and Café in Belsize Village. 2013: the Hampstead branch opened.
- ❓ Opening years for Swains Lane, Muswell Hill and Brent Cross are not published, so they aren't dated.

## Deliberately not included

- No customer reviews, ratings, awards or press quotes.
- No email address: the official site shows `info@mysite.com` (a Wix template placeholder), so contact is by phone.
- No claims about how the bagels are made (e.g. "boiled then baked") — not stated on Roni's site.
