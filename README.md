# AK Smart Deals website

Smart Shopping. Better Deals.

## Files

| File | What it is |
|---|---|
| `index.html` | The website |
| `config.js` | Your settings: WhatsApp number and Google Sheet ID |
| `products.csv` | Product list used until a Google Sheet is connected |
| `assets/` | Logo, banner and site icon |

## Going live with GitHub Pages

1. Upload all the files to this repository: **Add file → Upload files**. Keep the `assets` folder.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**, pick branch **main** and folder **/ (root)**, then click **Save**.
4. After 1–2 minutes the site is live at `https://ajithkingg.github.io/AK_Smart_Deals/`.

## Products in a Google Sheet

1. Create a Google Sheet and name the first tab **Products**.
2. Put these headings in row 1:

   `type | name | category | store | price | mrp | rating | ratings_count | link | image | description | stock | featured | hide`

3. Add one product per row:
   - **type**: `affiliate` for Amazon/Flipkart links, `own` for your own products
   - **price / mrp**: numbers only, e.g. `1499`
   - **link**: your affiliate link (affiliate products only)
   - **image**: a picture link. A Google Drive share link works if the file is shared as "Anyone with the link".
   - **description**: short text for your own products
   - **stock**: `in` or `out` (own products)
   - **featured**: `yes` for the Deal of the day
   - **hide**: `yes` to hide a product without deleting it
4. Click **Share → General access → Anyone with the link → Viewer**.
5. Copy the sheet ID from its address (the code between `/d/` and `/edit`) and paste it into `config.js` as `sheetId`.

Changes in the sheet appear on the website when a visitor opens or refreshes the page.

## Your own domain

1. Buy a domain, e.g. `aksmartdeals.in`.
2. In **Settings → Pages → Custom domain**, enter the domain and save.
3. At your domain provider, add these DNS records:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www`: `ajithkingg.github.io`
4. When the check passes, tick **Enforce HTTPS**.
