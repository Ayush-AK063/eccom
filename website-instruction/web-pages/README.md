# Web Pages — Overview

This folder documents every page of the project: its URL, what it shows, and how it behaves.

| File | App | Who uses it |
|---|---|---|
| [my-project.md](my-project.md) | **Storefront** (customer website) — `my-project/` | Shoppers |
| [admin.md](admin.md) | **Admin panel** — `admin/` | Store admins |

---

## The three apps

| App | Folder | Tech | Local URL | Start |
|---|---|---|---|---|
| Storefront | `my-project/` | React + Vite + Tailwind + MUI + Swiper | `http://localhost:5173` | `npm run dev` |
| Admin panel | `admin/` | React + Vite + Tailwind + MUI | `http://localhost:5174` | `npm run dev` |
| API server | `server/` | Node + Express + MongoDB + Cloudinary | `http://localhost:8000` | `npm run dev` |

> Vite gives port **5173** to whichever frontend starts first and **5174** to the second. Start the storefront first to get the ports above.
> Both frontends read the API address from `VITE_API_URL` in their `.env`. The server only allows requests from `localhost:5173`, `localhost:5174` and `FRONTEND_URL`.

---

## Page count

| App | Routed pages | Pop-up panels / modals |
|---|---|---|
| Storefront | 19 URLs | Quick View modal, Cart drawer, Address drawer, Variant picker, Compare tray |
| Admin | 14 URLs | 16 full-screen forms (add / edit / view) |

---

## Shared design rules

These apply to new UI in both apps so pages look like one product:

- **Corners:** small radius — `6px` (`rounded-md`) for cards, buttons, banners; `4px` for tiny thumbnails. Only badges, chips and round icon buttons are fully round.
- **Primary colour:** `#ff5252` (Tailwind `primary`). Text: `#111827` headings, `#4b5563` body, `#9ca3af` muted.
- **Section headings (storefront):** `20px`, weight 700, optional 13px grey subtitle underneath.
- **Section spacing (storefront):** ~40px between home sections (`pt-6 pb-4` pattern).
- **Cards:** white, 1px light border, soft shadow only on hover.
- **Prices:** Indian format via `formatPrice()` → `₹1,250.00`.

---

## Helper scripts (server/scripts)

Used to fill the store with demo content through the real API (admin login from `server/.env`).

| Script | What it does |
|---|---|
| `node scripts/seedDemoProducts.js` | Creates 5 categories (Bags, Sunglasses, Watches, Footwear, Jewellery) and 17 demo products. Skips anything that already exists. |
| `python3 -I scripts/generateBanners.py <dir>` | Generates home banners, blog covers and collection covers (product cut-outs, no third-party logos). |
| `BANNER_DIR=<dir> node scripts/seedImages.js slides` | Uploads the generated banners to the matching home-slide types. |
| `BANNER_DIR=<dir> node scripts/seedImages.js blogs` | Creates 4 sample blog posts (skips existing titles). |
| `node scripts/seedImages.js products` / `categories` | Replaces product / category images with online photos. |

The server must be running for all of these.
