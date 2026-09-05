# SATAT — Merge & Deploy Guide

This folder is a ready-to-go Vercel project shell. It already has:

- `/api/checkout/create-order.js` + `/api/checkout/verify.js` — Razorpay,
  converted from your old Express server to Vercel serverless functions.
  Logic is untouched (server-side price recalculation, HMAC signature
  verification) — just reshaped for Vercel's handler signature.
- `/api/climate-metrics.js`, `/api/weather.js`, `/api/gemini/recommender.js`
  — converted from the main site's old server.ts, same logic.
- `/api/champions/index.js` (GET) + `/api/champions/save.js` (POST) —
  rebuilt to use Upstash Redis instead of a local JSON file (serverless
  functions have no persistent disk — a local file write would vanish
  between requests), AND fixed so the admin password lives in an
  environment variable instead of being hardcoded in the public JS
  bundle. See `ADMIN_PATCH_INSTRUCTIONS.md` for the one frontend patch
  this requires.
- `/shop-src/` — your shop's React source (pages, components, cart
  context, product data), copied as-is from satat-web/src.
- `vercel.json`, `package.json`, `tailwind.config.js`, `postcss.config.js`,
  `.env.example`, `.gitignore` — all wired up.

## What YOU need to do once you find the main site source

### 1. Drop the main site source in

Copy your main site's `src/` folder contents into this project's `src/`
(create it if starting fresh). Keep its existing pages/components as-is.

### 2. Merge the shop in as a route, not a separate app

The shop was built as its own single-page app with its own router
(`App.jsx` → `<Routes>` → `/shop`, `/product/:id`, `/cart`, `/checkout`,
`/order-confirmed`). To merge:

- Copy everything from `/shop-src/pages/`, `/shop-src/components/`,
  `/shop-src/context/`, `/shop-src/data/`, `/shop-src/assets/products/`
  into your main site's `src/` under matching subfolders (e.g.
  `src/shop/pages/`, `src/shop/components/`, etc. — keep them namespaced
  so filenames like `Navbar.jsx` don't collide with the main site's own).
- In your main site's router (wherever `<Routes>` lives), add the
  shop's routes as **nested** routes under `/shop`:

```jsx
import ShopHome from "./shop/pages/Shop";
import ProductDetail from "./shop/pages/ProductDetail";
import Cart from "./shop/pages/Cart";
import Checkout from "./shop/pages/Checkout";
import OrderConfirmed from "./shop/pages/OrderConfirmed";
import { CartProvider } from "./shop/context/CartContext";

// inside your existing <Routes>:
<Route path="/shop" element={<CartProvider><ShopHome /></CartProvider>} />
<Route path="/shop/product/:id" element={<CartProvider><ProductDetail /></CartProvider>} />
<Route path="/shop/cart" element={<CartProvider><Cart /></CartProvider>} />
<Route path="/shop/checkout" element={<CartProvider><Checkout /></CartProvider>} />
<Route path="/shop/order-confirmed" element={<CartProvider><OrderConfirmed /></CartProvider>} />
```

  (Wrap in `CartProvider` at whatever level makes cart state persist
  across those pages — could also wrap the whole app if you're fine
  with cart context always being mounted.)

- Update internal links inside the shop pages: anywhere they link to
  `/product/:id`, `/cart`, `/checkout` etc., prefix with `/shop`
  (e.g. `/cart` → `/shop/cart`). Quick way: search each file in
  `shop-src/pages/` and `shop-src/components/` for `to="/` or
  `navigate("/` and add the `/shop` prefix.

### 3. Add the Razorpay checkout script to your main `index.html`

Your main site's `index.html` needs this line added inside `<head>`
(the shop needs `window.Razorpay` available globally):

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 4. Apply the admin panel security patch

Follow `ADMIN_PATCH_INSTRUCTIONS.md` — this closes the leaked-password
hole. Don't skip this before making the site public.

### 5. Merge Tailwind configs

Your main site likely already has its own `tailwind.config.js` with
the same color tokens (the shop's was built to match). Use your main
site's config as the source of truth; just make sure its `content`
array includes the new shop file paths, e.g.:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
```

(This already covers everything if the shop files live under `src/`.)

## Local test before pushing

```bash
npm install
npm run dev
```

Vite alone won't run the `/api` functions locally — for that, install
the Vercel CLI and use `vercel dev` instead, which emulates the
serverless functions:

```bash
npm install -g vercel
vercel dev
```

## Deploy

```bash
git init
git add .
git commit -m "Merge SATAT main site and shop into one Vercel project"
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then in Vercel:
1. Import the GitHub repo as a new project.
2. Framework preset: Vite (should auto-detect).
3. Add all env vars from `.env.example` under Project Settings ->
   Environment Variables (use your real Razorpay Test Mode keys,
   Gemini key, a new admin password, and Upstash credentials).
4. Deploy.
5. Add `sustainabilitysolutions.in` under Project Settings -> Domains,
   and update your DNS at the registrar per Vercel's instructions
   (usually an A record to `76.76.21.21` or a CNAME to
   `cname.vercel-dns.com`, Vercel will show you the exact values).

## Getting Upstash Redis (2 minutes)

In your Vercel project dashboard: Storage tab -> Browse Marketplace ->
Upstash -> Create Database -> pick a region close to your users
(Mumbai/ap-south-1 if available) -> Connect to Project. It auto-injects
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into your
project's env vars — no manual copy-paste needed.

## Razorpay: Test Mode tonight, Live Mode Monday

Nothing in the code needs to change when KYC clears. Just:
1. Go live in Razorpay dashboard (switch from Test to Live Mode).
2. Generate a Live key pair.
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel env vars.
4. Redeploy (or just trigger a redeploy from the Vercel dashboard).

That's the whole cutover.
