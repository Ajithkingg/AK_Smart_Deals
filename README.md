# AK Smart Deals website

Smart Shopping. Better Deals.

## Files

Built with [Next.js](https://nextjs.org) (React) and exported as a static site.

| File | What it is |
|---|---|
| `lib/config.js` | Your settings: WhatsApp number and Firebase project |
| `components/` | The page parts: store, deal cards, WhatsApp order form, login and admin |
| `lib/data.js` | Reads and saves products, categories and users in Firebase |
| `firestore.rules` | Who may read and change what (paste into Firebase) |
| `app/` | Page layout, styles and site icon |
| `public/assets/` | Logo and banner |

## Run on your computer

```
npm install
npm run dev
```

Open http://localhost:3000.

## Going live with GitHub Pages

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set Source to **GitHub Actions**.
3. Every push to **main** builds and publishes the site automatically (see the **Actions** tab).
4. The site is live at `https://ajithkingg.github.io/AK_Smart_Deals/`.

## Set up login and the admin section (Firebase, one time)

Accounts, products, categories and user roles are stored in a free Firebase project.

1. Go to https://console.firebase.google.com, click **Create a project**, name it e.g. `ak-smart-deals`. Analytics is not needed.
2. **Add a web app:** Project overview → **</>** (Web) → give it a name → **Register app**. Copy the values from `firebaseConfig` into `lib/config.js` under `firebase`.
3. **Turn on login:** Build → **Authentication** → Get started → **Sign-in method**:
   - enable **Email/Password**
   - enable **Google** (pick your support email, Save)
4. **Allow your website address:** Authentication → **Settings** → **Authorized domains** → Add domain → `ajithkingg.github.io` (and your own domain later).
5. **Create the database:** Build → **Firestore Database** → Create database → pick a location near you (e.g. `asia-south1` Mumbai) → **Start in production mode**.
6. **Protect the data:** Firestore → **Rules** → replace everything with the contents of `firestore.rules` → **Publish**.
7. **Make yourself admin:** sign up on the website once. Then in Firestore → **Data** → `users` → your user → change `role` from `user` to `admin`. Reload the site; an **Admin** link appears in the header.

After that, admins manage everything from the **Admin** page:

- **Products:** add, edit, hide or delete. Affiliate products need the store link; own products are ordered on WhatsApp.
- **Categories:** add and rename (products move with the category). A category can be deleted once it has no products.
- **Users:** see everyone who signed up and make or remove admins.

Changes appear on the store straight away, without a refresh.

**Product images:** paste any `https://` image link, or a Google Drive share link where the file is shared as "Anyone with the link".

## Your own domain

1. Buy a domain, e.g. `aksmartdeals.in`.
2. In **Settings → Pages → Custom domain**, enter the domain and save.
3. At your domain provider, add these DNS records:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www`: `ajithkingg.github.io`
4. When the check passes, tick **Enforce HTTPS**.
