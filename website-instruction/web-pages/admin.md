# Admin Panel (admin) — Page Specification

Store management panel. Base URL (local): `http://localhost:5174`

Routes are defined in `admin/src/App.jsx` (`createBrowserRouter`). All pages except the auth pages are **protected**: without an admin session they redirect to `/login`. Only users with role `admin` can log in (`adminLogin: true`).

## Page list

| # | URL | Page | Protected |
|---|---|---|---|
| 1 | `/` | Dashboard | Yes |
| 2 | `/products` | Products list | Yes |
| 3 | `/homeSlider/list` | Home slider banners | Yes |
| 4 | `/category/list` | Category list | Yes |
| 5 | `/subCategory/list` | Sub category list | Yes |
| 6 | `/thirdCategory/list` | Third-level category list | Yes |
| 7 | `/blog/list` | Blog list | Yes |
| 8 | `/users` | Users | Yes |
| 9 | `/orders` | Orders | Yes |
| 10 | `/my-account` | Admin profile | Yes |
| 11 | `/login` | Login | No |
| 12 | `/forgotpassword` | Forgot password | No |
| 13 | `/verify-account` | OTP verification | No |
| 14 | `/change-password` | Set new password | No |

---

## Global layout (protected pages)

- **Header** (`Components/Header`): sidebar toggle, admin avatar + menu (Profile, Sign Out).
- **Sidebar** (`Components/Sidebar`, 20% width, collapsible):

| Menu | Items |
|---|---|
| Dashboard | → `/` |
| Home Slides | Add Home Banner List → `/homeSlider/list` · Add Home Banner Slide *(panel)* |
| Users | → `/users` |
| Products | Product List → `/products` · Product Upload *(panel)* · Add Product RAM *(panel)* · Add Product Weight *(panel)* · Add Product Size *(panel)* |
| Category | Category List · Add a Category *(panel)* · Sub Category List · Add a Sub Category *(panel)* · Third Level Category List · Add a Third Level Category *(panel)* |
| Blogs | Blog List → `/blog/list` · Add Blog *(panel)* |
| Orders | → `/orders` |
| Logout | Ends the session |

- **Content area:** 80% width (100% when the sidebar is closed).
- **Full-screen panel:** forms open as a full-screen dialog with a title bar and close button (`isOpenFullScreenPanel.model`). See *Panels* below.
- **Toasts** for success / error.

---

## 1. Dashboard — `/`
File: `Pages/Dashboard/index.jsx`
- **Header:** today's date, greeting by time of day + admin's first name; *Orders* → `/orders`, *Add product* (opens panel).
- **KPI cards** (data `/api/order/dashboard-stats`): Total revenue, Total orders, Customers (each with a % change vs last month), Avg. order value.
- **Performance** area chart: Revenue / Orders / New customers toggle, year selector.
- **Orders by status:** donut + count/% per status, *View all* → `/orders`.
- **Top selling products** (top 5 by units), **Low stock** (stock ≤ 5), **Store overview** (Products/Categories/Reviews/Users tiles + quick add product/category/banner/blog).
- **Recent orders:** `OrdersTable limit=5` + *View all* → `/orders`.

## 2. Products — `/products`
File: `Pages/Products/index.jsx` · Data: `/api/product` (params: `page`, `perPage`, `category`, `subCategory`, `thirdCategory`, `search` = name **or brand**, `stock` = in / low / out, `sort` = newest / oldest / price_desc / price_asc / stock_asc / name; response has `totalPosts`)
- Header: *Variant options* (→ `/variant-options`), *Add product*.
- **Stock tabs** with counts: All / In stock / Low stock (1–5) / Out of stock.
- Filters: search (300ms debounce), Category → Sub-category → Third level, *Clear filters*, sort.
- Extra filter: **status** (Active / Draft / Archived). Rows show Draft / Archived badges, SKU and number of variants; price shows "From" for variant ranges.
- **Table:** ☐ · **Product** (image, name, brand → opens View) · **Category** (+ sub › third) · **Price** (MRP crossed out + % off) · **Stock** badge · **Rating** · **Tags** (popular/latest/featured) · View / Edit / Delete.
- Selection → dark bar with *Delete* (`/api/product/delete-multiple`). Footer: "Showing x–y of N" + pages. Skeleton + empty state.
- Removed the fake *Export* button and the admin `/product/:id` link (that route doesn't exist in admin).

## 3. Home Slider Banners — `/homeSlider/list`
File: `Pages/HomeSliderBanners/index.jsx` · Data: `/api/homeSlide`
- Header: title + total count, *Add banner*.
- Tabs: All + one per type (with counts).
- One section per type: mini home-page map (red = where it shows), *Live on home* / *Not shown* badge, recommended size, *Add*. Right Top/Down: "only the first is shown" warning, extra ones faded.
- Cards in the real shape (16:9 / 4:3 / 4:1): image, image count, heading/title, price, link; Edit, View, Delete. Click the checkbox to select → dark bar with *Delete selected*.
- Removed the fake *Export* button and fake pagination.
- **Banner types and where they show on the storefront:**

| Type | Storefront position | Recommended image |
|---|---|---|
| Left Big Banner | Hero slider (large, left) | ~16:9, keep the right half clean (text is drawn there) |
| Right Top Banner | Hero, top-right box | ~4:3, keep the left side clean |
| Right Down Banner | Hero, bottom-right box | ~4:3, keep the right side clean |
| v2 Banner | Wide strip under Latest Products | **4:1** (e.g. 2400×600) |

## 4. Category List — `/category/list`
Table: ☐ · **Image** · **Category Name** · **Action** (View, Edit, Delete). Button *Add Category*, bulk delete (`/api/category/bulk-delete`).

## 5. Sub Category List — `/subCategory/list`
Table: ☐ · **Category Image** · **Category Name** · **Sub Category Name** · **Action**. Button *Add Sub Category*.

## 6. Third Level Category List — `/thirdCategory/list`
Table: ☐ · **Main Category Image** · **Lineage** (Main › Sub) · **Third Level Category Name** · **Action**. Button *Add Third Level*.

**Product details template** (sliders icon on every main / sub / third category row, badge = number of fields) → panel `Category/templates/CategoryTemplate.jsx`:
- Start from a ready-made template (`templates/presets.js`, 16 types: Clothing, Footwear, Bags, Watches, Jewellery, Eyewear, Mobiles, Laptops, Appliances, Protein & Supplements, Grocery, Beauty, Anime figures / Collectibles / Toys, Furniture, Books, Sports) → *Add these fields* or *Replace all*.
- Field table: name, type (Text / Number / Dropdown / Yes-No / Long text), unit (cm, g, mAh…), dropdown options, section (group), required, reorder, delete. Fields inherited from the parent category are listed read-only.
- Saves via `PUT /api/category/:id/attributes`. Sub-categories inherit parent fields. Demo categories got templates via `server/scripts/seedCategoryTemplates.js` (Bags, Sunglasses, Watches, Footwear, Jewellery, Fitness).

> Deleting a category also affects its children. Storefront menus, the *Shop by Category* slider and *Shop by Collection* tiles all read from these categories.

## 7. Blog List — `/blog/list`
Data: `/api/blog`. Button *Add Blog*, bulk delete. Table: ☐ · **Image** · **Title** · **Description** (short) · **Action** (Edit, Delete). Empty: "No Blogs Found".

## 8. Users — `/users`
File: `Pages/Users/index.jsx` · Data: `/api/user/all` (now also returns `orders`, `spent`, `lastOrderAt`, `last_login_date`, `signupMethod`)
- **4 stat cards:** Total users, New this month, Email verified (%), Have ordered (% conversion).
- **Tabs:** All / Customers / With orders / Unverified / Admins (with counts) · **search** (name, email, phone) · **sort** (newest, oldest, top spenders, most orders, name).
- **Table:** ☐ · **User** (avatar or coloured initials, name, *Admin* badge, Google icon, email) · **Phone** · **Status** (Verified / Unverified) · **Orders** · **Total spent** · **Joined** · **Last login** ("3h ago"). Admins can't be selected. Skeleton rows, empty state.
- Selection → dark bar with *Delete* (`/api/user/delete-multiple`). Footer: "Showing 1–10 of N" + page buttons.
- **Click a row → right drawer:** avatar, role/verified/Google badges, Orders · Spent · Avg. order, last order, email/phone (copy), joined, last login; *Send email* (mailto), *Delete* (not for admins). Esc / clicking outside closes it.

## 8b. Variant Options — `/variant-options`
File: `Pages/VariantOptions/index.jsx` · Data: `/api/variantOption` (`?withUsage=1` adds product counts). Sidebar: Products → **Variant Options** (replaces the old Add Product RAM / Weight / Size items).
- **Left list:** search (option or value), each option with icon (buttons / colour / dropdown), colour dots, "N values · N products", ↑ ↓ to reorder (saved via `PUT /api/variantOption/reorder`). *New option* button.
- **Right editor:** name, unit; **Show on the store as** Buttons / Colour circles / Dropdown; **Values** (type + Enter, paste comma lists, colour picker + hex for swatches, reorder, remove, *Sort A–Z / 1–9*); **Use in categories** (`CategoryPicker.jsx`: *All categories* / *Only selected* switch; selected shown as removable chips with full path; searchable tree with expand/collapse; picking a main category includes everything inside it — children show "via parent"); *Allow new values in the product form*; admin note; live store preview. Quick-start chips for new options (Storage, Flavour, Shade, Pack of, Capacity, Material, Length, Edition, Scale, Screen size, Compatible model, Ring size). Save / Discard / Delete (confirm; products keep their own copy).
- Renaming an option also renames it inside every product and its variants.
- Seeded by `server/scripts/migrateVariantOptions.js` (Size, Colour with 16 hex colours, RAM, Weight) and `server/scripts/seedVariantOptions.js` (38 more: Storage, Flavour, Shade, Pack of, Capacity, Volume, Material, Fit, Length, Waist, Shoe size, Ring size, Chain length, Metal, Purity, Strap, Case size, Frame size, Lens, Screen size, Processor, Connectivity, Compatible model, Plug type, Power, Scale, Edition, Format, Language, Age, Bed size, Seater, Finish, Fragrance, Skin type, Life stage, Plan, Gift wrap).
- Max **4 options per product** (e.g. Colour × Size); the number of options in this list is unlimited.

## 9. Orders — `/orders`
File: `Pages/Orders` → `Components/OrdersTable` · Data: `/api/order/all`
- Search: order #, name, email, phone, pincode, status. 10 per page.
- Expandable rows: **Order** # · **Payment** · **Customer** · **Email** · **Phone** · **Address** · **Pincode** · **Total** · **Date** · **Status**.
- **Status** dropdown: pending → confirmed → shipped → delivered / cancelled → `PUT /api/order/status/:id`. Cancelled orders show a badge.
- Expanded: Product · Image · Variant · Price · Subtotal.

## 10. My Account — `/my-account`
File: `Pages/MyAccount/index.jsx`
- Avatar upload.
- Profile: Full Name, Email, Phone Number, Country → *Update Profile*.
- *Change Password* toggle: Old, New, Confirm.
- Addresses: list with *Default*, add / edit form (name, phone, pincode, Indian state list, city, address, landmark, default checkbox), delete with confirm.

---

## Auth pages

| URL | Page | What it does |
|---|---|---|
| `/login` | Login | Split layout: dark brand panel (left, desktop only) + card form. Email, Password (show/hide), *Forgot password?* (sends OTP to the typed email → `/verify-account`), Remember me, Sign in. No Google/Facebook login. Non-admins are rejected. Logged-in admins are redirected to `/`. |
| `/forgotpassword` | Forgot password | Email → sends OTP (`/api/user/forgot-password`) → `/verify-account`. |
| `/verify-account` | Verify OTP | 6-digit OTP, *Resend OTP*, verifies email or forgot-password OTP → `/change-password`. |
| `/change-password` | New password | New Password + Confirm → `/api/user/reset-password` → `/login`. |

---

## Full-screen panels (no URL)

Opened from the sidebar or table actions.

| Panel | Fields / content |
|---|---|
| **Add Product** / **Edit Product** (`ProductForm.jsx`, shared) | Jump bar (Basic · Images · Pricing · Inventory · Variants · Specifications · Shipping · Legal · Returns · SEO). **Basic:** name*, brand, model no., short description, up to 10 highlights, description, rating, search tags. **Images & video:** drag & drop, cover, reorder, video link. **Pricing & tax:** price*, MRP, auto discount, cost price (admin only), GST rate (0/3/5/12/18/28%), HSN; shows GST included, price before tax, profit per unit. **Inventory:** SKU, barcode (EAN/UPC), stock* (= sum of variants when variants exist), low-stock alert level, max per order. **Variants:** *Add option* (dropdown: "Suggested for this category" first, then all options; up to 4 suggested ones also as quick chips; or *Custom…* for an option only this product has; max 4) → pick values (chips from the option; type new ones if the option allows it; colour dots for swatch options) → *Generate combinations* → table per combination (photo, SKU, price, MRP, stock), *Set for all*, *Auto-fill SKUs*. **Specifications:** fields from the category template (+ required check) and custom rows; *Edit template*. **Shipping:** packed weight (g), L×W×H (cm), ships in (days), COD, always-free shipping, volumetric weight. **Legal:** country of origin*, net quantity, manufacturer / packer / importer, month of manufacture, best before, licence no., customer care. **Returns & warranty:** returnable, return/replace, days, warranty months + by whom, in the box. **SEO:** URL handle, meta title/description + Google preview. **Right:** Status (Active / Draft / Archived), Organisation, home switches, **Listing quality** checklist (x/9), card preview, Save. |
| **View Product** | Also shows highlights, variants table (photo, SKU, price, MRP, stock), specifications by group, status/SKU/barcode/model, GST/HSN/cost, shipping & returns, legal. Gallery + thumbnails, brand, name, rating, stock badge, price/MRP/% off, variants, home flags, description; Details (category path, stock, images, created/updated, ID); *Edit product*, *View on store* (`VITE_STORE_URL`, default `http://localhost:5173`). |
| ~~Add Product RAM / Weight / Size~~ | Removed — replaced by the **Variant Options** page (`/variant-options`). |
| **Add / Edit Home Slide** (`SlideForm.jsx`, shared) | Placement cards (4 types, mini map, ratio), info line (where it shows + size). Content fields only for that type: Left Big = Heading + Title + Price; Right Top/Down = Heading + Price; v2 = image only. Link for all types. Drag & drop upload, thumbnails (Cover / New tag, remove). Right side: sticky **live preview** (same gradient/text as storefront) + placement map, *Publish banner* / *Save changes*, Cancel. |
| **View Home Slide** | Big preview + image switcher, details list (type, status, fields, link, images, updated), placement map, *Edit banner*, *Open image*. |
| **Add / Edit Blog** | Blog Title, Description (plain text; blank line = new paragraph), Blog Images (multi-upload). |
| **Add New Category** / **Edit Category** | Category Name, Category Image. |
| **Add New Sub Category** / **Edit Sub Category** | Parent category, one or more sub-category names. |
| **Add Third Level Category** / **Edit Third Category** | Main category → Sub category, one or more names. |
| **View Category** | Category image, name and children. |

> Product flags drive storefront sections: **latest** → *Latest Products*, **featured** → *Featured Products*. *Today's Best Deals* uses the highest **discount** automatically; *Shop by Budget* uses **price**.
