# Storefront (my-project) → Admin control audit — 2026-11-18

Har page / component padh ke dekha: content kahan se aata hai (API ya code mein hardcoded), aur admin se badla ja sakta hai ya nahi.

Legend: ✅ admin se control hota hai · ⚠️ aadha control / galat · ❌ code mein hardcoded, admin se nahi badal sakte

---

## A. Poori site par (header, nav, footer, browser)

| # | Cheez | Kahan | Abhi | Status |
|---|---|---|---|---|
| A1 | Browser tab title "Mern Stack Eccommerce", Vite favicon | `index.html` | hardcoded | ❌ |
| A2 | Logo | `assets/logo.jpg` (Header) | file in code | ❌ |
| A3 | Top strip text "Get up to 50% off new season styles…" | `Header` | hardcoded | ❌ |
| A4 | Top strip links "Help Center", "Order Tracking" | `Header` | `to="#"` — kahin nahi jaate | ❌ |
| A5 | Nav: "Free Delivery above 999" | `Navigation` | hardcoded | ❌ |
| A6 | Nav: pehli 5 categories menu mein, baaki "More" | `Navigation` (`VISIBLE = 5`) | categories admin se, lekin kaunsi / kis order mein — nahi | ⚠️ |
| A7 | Category ka order (menu, home slider, tabs) | sab jagah | DB order (bani kab) — admin sort nahi kar sakta | ⚠️ |
| A8 | Category show / hide | sab jagah | koi option nahi; delete hi karna padta hai | ❌ |
| A9 | Footer 5 feature boxes (Free Shipping 999, 30 Days Returns, Secured Payment, Special Gifts, Support 24/7) | `Footer` | hardcoded, aur galat (returns product-wise hain, payment sirf COD hai) | ❌ |
| A10 | Footer Contact: "Classyshop… 507-Union Trade Centre France", `sales@yourcompany.com`, `(+91) 9876-543-210`, "Online Chat" | `Footer` | template ka dummy data | ❌ |
| A11 | Footer links (Prices drop, New products, Best sales, Contact us, Sitemap, Stores, Delivery, Legal Notice, Terms, About us, Secure payment, Login) | `Footer` | sab `to="/"` — koi page hai hi nahi | ❌ |
| A12 | Newsletter form | `Footer` | button kuch nahi karta, koi API / collection nahi | ❌ |
| A13 | Social links (Facebook, YouTube, Pinterest, Instagram) | `Footer` | sab `to="/"` | ❌ |
| A14 | "© 2024 - Ecommerce Template" | `Footer` | hardcoded | ❌ |
| A15 | Payment icons (Visa, Mastercard, PayPal…) netlify se | `Footer` | dusri site se hotlink, aur store sirf COD leta hai | ❌ |
| A16 | Policy / info pages (About, Contact, Terms, Privacy, Shipping, Returns, FAQ) | — | **page hi nahi hain** | ❌ |

## B. Home page

| # | Section | Abhi | Status |
|---|---|---|---|
| B1 | Main slider + 2 side banners + wide v2 banner | Home Slides (admin) — heading, title, price, link, type | ✅ |
| B2 | Banner button text "SHOP NOW", "Starting At Only" | hardcoded | ⚠️ |
| B3 | Banner schedule (start/end date), active/inactive, order | nahi hai | ❌ |
| B4 | Shop by Category | categories + image admin se; order/hide nahi (A7, A8) | ⚠️ |
| B5 | Popular Products — tabs = sab main categories, us category ke koi bhi products | koi "popular" logic nahi, admin choose nahi kar sakta | ⚠️ |
| B6 | Today's Best Deals — sabse zyada discount wale 12 products, countdown roz raat 12 baje tak (nakli) | admin control nahi; timer fake | ❌ |
| B7 | Shop by Budget — ₹99 / 299 / 499 / 999 tiles, rang | `TIERS` code mein | ❌ |
| B8 | Free Shipping strip "Free Delivery Now On Your First Order and above 499", "Only ₹499" | hardcoded — nav/footer 999 bolte hain, cart hamesha Free | ❌ (galat bhi) |
| B9 | Shop by Collection — 5 collections (title, tag, text, image, category) | `COLLECTIONS` code mein + `public/collections/*.webp`; category ka naam match hona chahiye | ❌ |
| B10 | Latest Products | sirf jin products pe flag `latest` laga hai (newest automatic nahi) | ⚠️ |
| B11 | Featured Products | flag `featured` (product form se) | ✅ |
| B12 | From the Blog | Blog admin | ✅ |
| B13 | Section ke naam / subtitles ("Popular Products", "Trending picks…", "Shop by Budget"…) | hardcoded | ❌ |
| B14 | Section on/off aur order | fixed | ❌ |

## C. Products — listing, search, product page

| # | Cheez | Abhi | Status |
|---|---|---|---|
| C1 | Product data (naam, price, images, variants, specs, legal, shipping, policy, status) | Product form | ✅ |
| C2 | Listing sidebar **size filter** purani `/api/productSize` collection se aata hai | naye Variant Options se nahi — galat / adhoora filter | ⚠️ bug |
| C3 | Listing filters (sirf category, availability, size, rating) — brand, price slider, colour / dusre options nahi | — | ⚠️ |
| C4 | Sort options, 12 per page | hardcoded | ❌ (theek hai, chhota) |
| C5 | Search suggestions | product naam se; popular / trending searches nahi | ⚠️ |
| C6 | Product page perks: dispatch days, returns, COD, warranty | product-wise admin se | ✅ |
| C7 | Defaults jab product mein na ho: 2 din dispatch, 7 din return, "Fast delivery" | hardcoded | ⚠️ |
| C8 | Product ka "COD not available" — product page pe chhupta hai, **lekin checkout phir bhi COD order le leta hai** (server check nahi karta) | — | ⚠️ bug |
| C9 | Product ka `freeShipping` / shipping charge — cart / checkout mein kabhi nahi lagta, hamesha "Free" | — | ⚠️ |
| C10 | Similar products (0.5×–1.5× price), More from category | auto | ✅ (auto, theek) |
| C11 | Compare: max 4, same category | code mein | ❌ (chhota) |

## D. Reviews

| # | Cheez | Abhi | Status |
|---|---|---|---|
| D1 | User review + rating likh sakta hai | ✅ store side |
| D2 | **Admin reviews dekh / hata / approve nahi kar sakta** — server pe sirf `add` aur `get`, admin mein page hi nahi | ❌ |
| D3 | Gaali / spam review turant live; review ka reply nahi | ❌ |

## E. Cart, checkout, payment, shipping

| # | Cheez | Abhi | Status |
|---|---|---|---|
| E1 | Shipping charge | hamesha "Free" (cart, drawer, checkout, server total) | ❌ |
| E2 | Free shipping threshold | 3 jagah 3 alag baatein (499 / 999 / always free) | ❌ |
| E3 | Payment methods | sirf COD, hardcoded; online payment nahi | ❌ |
| E4 | COD limits (min / max order, pincode) | nahi | ❌ |
| E5 | Coupons / discount codes | nahi hain | ❌ |
| E6 | Minimum order value | nahi | ❌ |
| E7 | Tax / GST line | product mein `gstRate` hai, cart mein nahi dikhta ("inclusive" bhi nahi likha) | ⚠️ |
| E8 | Delivery pincode check | nahi | ❌ |
| E9 | Order success: "Estimated delivery 2–3 din" | hardcoded | ❌ |

## F. Orders (customer side)

| # | Cheez | Abhi | Status |
|---|---|---|---|
| F1 | Status + steps (pending → delivered) | admin Orders se | ✅ |
| F2 | Customer khud cancel nahi kar sakta | — | ❌ |
| F3 | Return / replacement request | nahi (product pe returnDays dikhte hain lekin request ka option nahi) | ❌ |
| F4 | Tracking number / courier | nahi (admin daal hi nahi sakta) | ❌ |
| F5 | Invoice download customer ke liye | nahi (admin print kar sakta hai) | ❌ |
| F6 | Order emails (placed / shipped / delivered) | koi email nahi jaata; email service sirf signup / OTP ke liye | ❌ |
| F7 | Admin ka order pe note / customer ko message | nahi | ❌ |

## G. Users / account

| # | Cheez | Abhi | Status |
|---|---|---|---|
| G1 | Register, login, Google login, OTP verify, forgot password | ✅ store side |
| G2 | Admin user list, delete | ✅ |
| G3 | User **block / suspend** — model mein `status` (active / inactive / Suspended) hai aur login check karta hai, lekin admin mein button nahi | ⚠️ |
| G4 | Admin user ki details: orders, addresses, wishlist, cart dekhna | nahi | ❌ |
| G5 | Kisi ko admin banana / hatana | nahi | ❌ |
| G6 | Google login on/off | env se | — |

## H. Wishlist, cart data, compare

| # | Cheez | Abhi | Status |
|---|---|---|---|
| H1 | Kaunse products sabse zyada wishlist / cart mein (abandoned carts) | admin ko nahi dikhta | ❌ |

## I. Blog

| # | Cheez | Status |
|---|---|---|
| I1 | Post, images, summary, author, tags, draft | ✅ (section 23) |
| I2 | Blog listing page (sab posts) | page nahi hai — sirf home slider + detail | ❌ |

## J. Purana / faltu code (store side)

- `components/HomeSlider` (v1), `BannerBox` v2 duplicate, `QtyBox`, `AdsBannerSlider` (3-per-row, use nahi hota), `Badge`.
- Routes mein `excat` typo (React Router ise ignore karta hai).
- Purani APIs `/api/productRam|productSize|productWeight` — store ka size filter (C2) abhi bhi `productSize` use karta hai.
- Header: "My Orders" link `to="my-orders"` (slash nahi) — nested page se galat URL banega.

---

## Proposed admin modules (priority order)

1. **Store Settings** (ek naya `Setting` collection + page): store naam, logo, favicon, tab title, contact (address / email / phone / WhatsApp), social links, top strip text + link, copyright, payment icons. → A1–A5, A10, A13–A15, B8
2. **Shipping & Checkout settings**: free shipping above ₹X, flat shipping charge, COD on/off + min/max, minimum order, default dispatch / ETA days, default return days. Cart, checkout, server total sab isi se. → E1, E2, E4, E6, E9, C7, C8, C9
3. **Reviews moderation**: list, filter (rating / product / pending), approve / hide / delete, reply. → D2, D3
4. **Pages (CMS)**: About, Contact, Terms, Privacy, Shipping, Returns, FAQ — admin se likho, store pe `/page/:slug`. Footer links inhi se. → A11, A16
5. **Footer & menu builder**: footer columns + links, feature boxes (icon, title, text), nav mein kaunsi categories + order, category show / hide + sort order. → A6–A9, A11
6. **Homepage builder**: sections on/off + order + title / subtitle; Collections (CRUD with image + link); Budget tiers; Deals (auto ya chosen products + real end time); Popular / Latest logic (auto newest ya flag). → B5–B10, B13, B14
7. **Coupons**: code, % / flat, min order, max discount, expiry, usage limit, per user. → E5
8. **Orders extra**: tracking number + courier, admin note, customer cancel (pending / confirmed tak), return requests, order emails. → F2–F7
9. **Users extra**: suspend / activate, make admin, user detail panel (orders, addresses, wishlist). → G3–G5
10. **Newsletter**: subscribers collection + admin list + CSV export. → A12
11. **Insights**: most wishlisted, abandoned carts, top searches. → H1, C5
12. **Fixes / cleanup**: size filter → Variant Options (C2), My Orders link slash, unused components hatao, blog listing page (I2), banner schedule / active (B3).

---

## Status update (same day)

- ✅ Done: module 1 (Store Settings), 2 (Shipping & checkout), 3 (Reviews), 6 (Home page builder), newsletter signup + subscribers list (10, partly), bugs C2 + C8 + Header link.
- ⏳ Baaki: 4 Policy pages (CMS), 5 Footer / menu builder + category order / hide (A6–A8), 7 Coupons, 8 Orders extra (tracking, customer cancel, returns, emails), 9 Users extra (suspend, make admin, detail), 11 Insights, 12 cleanup + blog listing page + banner schedule (B3).

- ✅ (section 27) Done: 4 Policy pages, 5 category order / hide / menu (A6–A8), 7 Coupons, 8 Orders extra (tracking, customer cancel, returns, emails, admin note), 9 Users extra, banner schedule (B3), blog listing (I2).
- ⏳ Abhi baaki: 11 Insights (most wishlisted, abandoned carts, top searches), 12 unused components cleanup, purani productRam / Size / Weight APIs hatana, online payment (sirf COD hai).
- ✅ (section 28) Insights (11) + cleanup (12) done. Baaki: online payment (sirf COD), purane DB collections delete (user ki haan chahiye).
- ✅ (section 32) Hidden category ke products storefront se chhupe; purane DB collections delete. Baaki: online payment.
