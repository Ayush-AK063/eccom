# Storefront (my-project) — Page Specification

Customer-facing website. Base URL (local): `http://localhost:5173`

Every page shares the same **Header** (top) and **Footer** (bottom). Routes are defined in `my-project/src/App.jsx`.

## Page list

| # | URL | Page | Login needed |
|---|---|---|---|
| 1 | `/` | Home | No |
| 2 | `/productListing` | Product listing (all / by category / by price) | No |
| 3 | `/search?q=<text>` | Search results (same page as listing) | No |
| 4 | `/product/:id` | Product details | No |
| 5 | `/compare` | Compare products | No |
| 6 | `/cart` | Cart | Yes |
| 7 | `/checkout` | Checkout | Yes |
| 8 | `/order/success` | Order placed | Yes |
| 9 | `/order/failed` | Order failed | Yes |
| 10 | `/my-account` | My profile + change password | Yes |
| 11 | `/my-address` | Saved addresses | Yes |
| 12 | `/my-list` | Wishlist | Yes |
| 13 | `/my-orders` | Order history | Yes |
| 14 | `/login` | Login | No |
| 15 | `/register` | Create account | No |
| 16 | `/verify` | OTP verification | No |
| 17 | `/forgot-password` | Set new password | No |
| 18 | `/blog/:id` | Blog post | No |

---

## Global layout

### Header — `components/Header`
1. **Top strip** (thin, ~32px): offer text on the left ("Get up to 50% off new season styles…"), *Help Center* and *Order Tracking* links on the right.
2. **Main bar:** logo → `/`, search box (live suggestions from `/api/product/search-suggestions`, Enter goes to `/search?q=`), *Login / Register* or the account menu (My Account, My Orders, My List, Logout), and three icon badges:
   - **Compare** → `/compare` (count from the compare list)
   - **Wishlist** → `/my-list` (count from My List)
   - **Cart** → opens the cart drawer (count of cart lines)
3. **Navigation bar:** *Shop by Categories* drawer button, category menu with hover sub-menus (sub and third-level), and *Free Delivery above 999* aligned right.

### Footer — `components/Footer`
Service highlights, links, contact info and newsletter area.

### Global pop-ups
| Pop-up | Opens from | What it does |
|---|---|---|
| **Quick View modal** | "Quick view" button on any product card | Image zoom + details + add to cart without leaving the page |
| **Cart drawer** | Cart icon in header | Lines with quantity +/−, remove, subtotal, *View Cart* / *Checkout* |
| **Address drawer** | My Address / Checkout | Add or edit an address (name, phone, pincode, state, city, address line, default flag) |
| **Variant picker** | *Add to Cart* on a card for a product with size / RAM / weight | Choose the option before adding |
| **Compare tray** | After adding a product to compare | Fixed bottom bar: 4 slots, *Compare now* (needs ≥2), *Clear all*, collapse tab. Hidden on `/compare`. |
| **Toasts** | Any action | Success / error messages (react-hot-toast) |

---

## 1. Home — `/`
File: `Pages/Home/index.jsx`. Sections from top to bottom:

| # | Section | Component | Data source | Behaviour / layout |
|---|---|---|---|---|
| 1 | **Hero** | `homeSliderV2` + `bannerBoxV2` | Home slides of type *Left Big Banner*, *Right Top Banner*, *Right Down Banner* | Big auto-play fade slider (70% width) with heading, title, "Starting At Only ₹X", *Shop Now*. Two stacked banners on the right (30%). Height fits one screen on desktop (`clamp(440px, 100vh − 240px, 680px)`), 460px tablet, 320px mobile. Images use `object-cover`; a dark gradient keeps text readable. |
| 2 | **Shop by Category** | `HomeCatSlider` | `/api/category` (top level) | Square tinted cards with image + name, last card is **View All**. ‹ › buttons in the header. 2.6 / 3.4 / 5 / 6 / 8 cards per view by screen size. |
| 3 | **Popular Products** | `ProductSlider` | `/api/product/getproductby-catid/:id` for the selected tab | Pill tabs, one per category. Slider of product cards. |
| 4 | **Today's Best Deals** | `DealsOfTheDay` | `POST /api/product/filters` sorted by **discount desc** | Red header bar with live countdown to midnight (resets daily) and *View all*. **Always 2 rows**: 6+6 (xl), 4+4 (lg), 3+3 (md), 2+2 (mobile). Only products with a discount. |
| 5 | **Shop by Budget** | `PriceDeals` | `filters` with `maxPrice` 99 / 299 / 499 / 999 | 4 coloured tiles "Deals under ₹X" with item count, 3 thumbnails, *Shop now* → `/productListing?maxPrice=X`. Empty tiers are hidden. |
| 6 | **Free Shipping** | inline | static | Full-width soft-pink strip: truck icon, "FREE SHIPPING", "Free Delivery Now On Your First Order and above 499", "Only ₹499". |
| 7 | **Shop by Collection** | `ShopByCollection` | Config list in the component + `public/collections/*.webp` | Bento grid: 1 large tile + 4 small (desktop). Each tile → its category listing. Tiles whose category doesn't exist are hidden. |
| 8 | **Latest Products** | `ProductSlider` | `/api/product?flag=latest` | Slider of product cards. |
| 9 | **Wide promo banner** | `AdsBannerSlider2` | Home slides of type *v2 Banner* | Fixed 4:1 strip (5:2 on mobile). |
| 10 | **Featured Products** | `ProductSlider` | `/api/product/getfeaturedproduct` | Slider of product cards. |
| 11 | **From the Blog** | `BLogItem` slider | `/api/blog` | 1 / 2 / 3 / 4 cards per view. Hidden when there are no posts. |

> The old 4:3 *v2 Banner* type was removed, and the wide banner (old *v3*) is now called *v2 Banner*.

### Product card (used everywhere) — `components/ProductItem`
- Image box 5:4 on light grey; second image fades in on hover.
- `-X%` discount pill (top-left). **Heart (wishlist) always visible** (top-right); **Compare** and **Quick view** slide in on hover.
- Brand (small grey caps) → name (1 line, ellipsis) → rating + number → price (bold) + old price (struck).
- Slim outlined **Add to Cart** (fills red on hover). When the item is in the cart it becomes a `− qty +` control.
- Equal height across a row.

### Product slider — `components/ProductSlider`
Free-scroll Swiper. Round ‹ › arrows appear on hover and hide at the ends. 1.6 / 2.3 / 3.3 / 4 / 6 cards per view.

---

## 2. Product Listing — `/productListing`
File: `Pages/ProductListing/index.jsx` · Data: `POST /api/product/filters`

**URL parameters** (applied on load, reset other filters):

| Param | Example | Effect |
|---|---|---|
| `catId` | `?catId=665…` | Filter by main category |
| `subCatId` | `?subCatId=…` | Filter by sub category |
| `thirdSubCatId` | `?thirdSubCatId=…` | Filter by third-level category |
| `q` | `/search?q=bag` | Text search |
| `maxPrice` / `minPrice` | `?maxPrice=499` | Price range (used by *Shop by Budget*) |

**Layout**
- Breadcrumb: Home / current category or "All Products".
- **Left sidebar** (`components/sideBar`): *Shop by Category* (checkboxes), *Availability* (In / Out of stock), *Filter By Price* (range slider ₹0–₹1,00,000), *Filter By Rating* (5→1 stars), sizes when available.
- **Toolbar:** list / grid toggle, "There are N products", **Sort By**: Relevance, Name A→Z, Name Z→A, Price low→high, Price high→low, Rating high→low.
- **Grid view:** 4 columns of product cards.
- **List view** (`components/ProductItemListView`), one row per product in three parts:
  1. Square image (grey), discount pill, heart, quick view on hover.
  2. Brand, name (2 lines), rating, 2-line description, size / RAM / weight chips.
  3. Price box: price + old price, "You save ₹X", stock status, slim *Add to Cart*, *Add to Compare* link.
  Tablet: price box moves under details. Mobile: small image left, everything stacked right.
- Pagination: 12 per page.
- Empty state: message + *Continue Shopping*.

---

## 3. Product Details — `/product/:id`
Files: `Pages/ProductDetails/index.jsx`, `reviews.jsx`, `components/ProductZoom`, `components/ProductDetails`

**Top (2 columns; stacked below 1024px)**
- **Gallery (left, sticky while scrolling):** vertical thumbnails (hover/click to switch; horizontal row on mobile), large square image on grey with hover zoom, ‹ › arrows, `2 / 3` counter, discount pill.
- **Info (right):** brand • category, product name (H1), rating + "N reviews", price block (**"From"** when variants have different prices; once all options are picked → that variant's price / MRP / % off), stock line (variant stock; "Only N left" ≤10; "Max N per order"), short description (or 3-line description), **Key highlights** (green ticks), variant options — any option the product has (Size, Colour, Storage, Flavour…), shown as buttons, **colour circles** or a dropdown as set in admin; options with no stock for the current selection are struck out / disabled, quantity `− 1 +` (max = variant stock and max-per-order), **Add to Cart**, wishlist, *Add to Compare*.
- **Perks box (from product data):** Free / Fast delivery + "Ships in N days", return text (e.g. "10-day replacement" / "Not returnable"), Cash on Delivery (only if COD allowed), warranty (if any).
- Picking a variant that has its own photo switches the gallery to that photo.


**Sections, stacked one below another**
1. **Description:** full text (paragraphs) + *Watch product video* link if set.
2. **Specifications:** **General** (brand, model no., category path, size/colour/RAM/weight, net quantity, in the box, availability, SKU + template fields in group "General"), then one block per specification group (from the category template, e.g. *Dimensions*, *Material*, *Nutrition (per serving)*), then **Shipping, returns & warranty** (ships in, COD, returns, warranty, package weight/size). Empty rows hidden.
3. **Manufacturer & legal info:** country of origin, manufactured / packed / imported by, month of manufacture, best before, licence no. (FSSAI/BIS/HUID), customer care.
4. **Ratings & Reviews:** left: average score, stars, "Based on N reviews", 5→1 star bars, and the write / update review form (login required). Right: review list (avatar, name, date, stars, text); first 5 shown + *Show all N reviews*.

**Similar Products:** top-rated products priced 0.5×–1.5× of this one (any category), excluding items shown below. Hidden when empty.

**More from <Category>:** product slider from the same category + *View all* → category listing.

The same `ProductZoom` + `ProductDetails` components power the **Quick View modal** (compact mode, first 4 highlights).

**Variants everywhere:** product cards show "From ₹X" for price ranges; the size popup on cards strikes out sold-out options and shows a different price next to an option; the cart / drawer / checkout use the chosen variant's price, MRP, stock and photo; Compare also lists **Colour**, all specification rows, country of origin, warranty and returns. Draft / archived products don't appear anywhere on the store (product URL → not found).

---

## 4. Compare — `/compare`
File: `Pages/Compare/index.jsx` · State: `context/CompareContext.jsx` (saved in `localStorage`, syncs across tabs)

**Rules:** max **4** products, all from the **same category**. No login needed.

- Header: breadcrumb, "Compare products", and on the right **Show only differences** toggle + **Clear all**.
- Table (horizontal scroll on small screens, sticky left column):
  - Top-left cell: compare icon, "N Products", "in <Category>".
  - Product columns: image, remove ✕, wishlist heart, brand, name, slim *Add to Cart*. Empty columns show **+ Add a product** (opens the category listing).
  - Rows: Price, MRP, Discount, Rating, Brand, Category, Availability, Size, RAM, Weight, Description. Rows empty for all products are hidden.
  - Highlights: green **Lowest price**, **Top rated**, **Best deal**. Rows identical for all products are greyed.
- Fresh price / stock is fetched from the API when the page opens.
- Empty state: icon, "Nothing to compare yet", *Browse products*.

---

## 5. Cart — `/cart`
File: `Pages/Cart/index.jsx`
- "Your Cart — There are N products".
- Line items: image, name, variant, price, quantity +/−, remove.
- **Cart Total** box: Subtotal, Shipping (Free), Estimate for India, Total, *Checkout*.
- Empty: "Your cart is currently empty" + *Continue Shopping*. Not logged in: prompt to log in.

## 6. Checkout — `/checkout`
File: `Pages/Checkout/index.jsx`
- **Select Delivery Address:** saved addresses (default marked), add / edit opens the address drawer. Without an address: "No address found in your account".
- **Your Order:** product lines, Subtotal, Shipping (Free), Total.
- **Payment:** Cash on Delivery → `POST /api/order/cod` → `/order/success` or `/order/failed`.

## 7. Order Success — `/order/success`
"Your order is placed!", "Thank you for shopping with us.", *View My Orders*, *Back to Home*.

## 8. Order Failed — `/order/failed`
"Your order has failed", *Back to Cart*, *Back to Home*.

---

## 9. My Account — `/my-account`
File: `Pages/MyAccount/index.jsx` · Left: `AccountSidebar` (avatar upload, links to Profile, Address, My List, Orders, Logout).
- **My Profile** form: Full Name, Email (read-only), Phone, Country → `PUT /api/user/:id`.
- "Complete your profile" hint when fields are missing.
- **Change Password:** Old, New, Confirm → `/api/user/reset-password`.
- Redirects to `/login` when logged out.

## 10. My Address — `/my-address`
List of saved addresses with *Default* badge, *View / Edit*, *Delete* (confirm dialog). Add / edit opens the address drawer. Empty: "No addresses saved yet."

## 11. My List (Wishlist) — `/my-list`
Saved products (list view) with remove. Empty: "My List is currently empty" + *Continue Shopping*.

## 12. My Orders — `/my-orders`
Data: `/api/order/my-orders`. Expandable table: Order #, Payment, Name, Phone, Address, Pincode, Total, Date, **Status** (pending / confirmed / shipped / delivered / cancelled). Expanded row: Product, Image, Variant, Price, Subtotal. Empty: "No orders yet".

---

## 13. Login — `/login`
Email, Password (show / hide), *Forgot Password* (sends OTP → `/verify`), **Login**, **Continue with Google** (Firebase), link to *Register*.

## 14. Register — `/register`
Full Name, Email, Password, **Register** (sends email OTP → `/verify`), Google sign-up, link to *Login*.

## 15. Verify — `/verify`
6-digit OTP box. Verifies email after register, or the forgot-password OTP (then goes to `/forgot-password`).

## 16. Forgot Password — `/forgot-password`
New Password + Confirm → `/api/user/reset-password` → back to login.

---

## 17. Blog Post — `/blog/:id`
Breadcrumb, title, date, cover image, full text (paragraphs separated by blank lines), extra images in a 3-column grid. Not found: "Blog not found" + *Go to Home*.
