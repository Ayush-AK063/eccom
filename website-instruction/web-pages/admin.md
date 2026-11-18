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
- **Welcome banner** with shop illustration.
- **Stat boxes** (slider, `Components/DashboardBoxes`, data `/api/order/dashboard-stats`): Total Orders, Total Sales (₹), Total Users, Total Products, Total Category, Total Reviews.
- **Products** block: category filter, compact product table with edit / delete.
- **Recent Orders:** `OrdersTable` (latest orders) + *View all* → `/orders`.
- **Total Users & Total Sales** chart with year selector.

## 2. Products — `/products`
File: `Pages/Products/index.jsx` · Data: `/api/product` (+ category filters)
- Filters: **Category**, **Sub Category**, **Third Level** (dropdowns), search box.
- Buttons: *Add Product*, bulk **Delete** (selected rows → `/api/product/delete-multiple`).
- Table columns: ☐ · **Product** (image + name + brand) · **Category** · **Sub-category** · **Third Level** · **Price** (old + new) · **Stock** · **Action** (View, Edit, Delete).
- Pagination.

## 3. Home Slider Banners — `/homeSlider/list`
File: `Pages/HomeSliderBanners/index.jsx` · Data: `/api/homeSlide`
- Button: *Add Home Slide*, bulk delete.
- Table: ☐ · **Image** · **Type** · **Action** (View, Edit, Delete).
- **Banner types and where they show on the storefront:**

| Type | Storefront position | Recommended image |
|---|---|---|
| Left Big Banner | Hero slider (large, left) | ~16:9, keep the right half clean (text is drawn there) |
| Right Top Banner | Hero, top-right box | ~4:3, keep the left side clean |
| Right Down Banner | Hero, bottom-right box | ~4:3, keep the right side clean |
| v2 Banner | *Not shown on home any more* | — |
| v3 Banner | Wide strip under Latest Products | **4:1** (e.g. 2400×600) |

## 4. Category List — `/category/list`
Table: ☐ · **Image** · **Category Name** · **Action** (View, Edit, Delete). Button *Add Category*, bulk delete (`/api/category/bulk-delete`).

## 5. Sub Category List — `/subCategory/list`
Table: ☐ · **Category Image** · **Category Name** · **Sub Category Name** · **Action**. Button *Add Sub Category*.

## 6. Third Level Category List — `/thirdCategory/list`
Table: ☐ · **Main Category Image** · **Lineage** (Main › Sub) · **Third Level Category Name** · **Action**. Button *Add Third Level*.

> Deleting a category also affects its children. Storefront menus, the *Shop by Category* slider and *Shop by Collection* tiles all read from these categories.

## 7. Blog List — `/blog/list`
Data: `/api/blog`. Button *Add Blog*, bulk delete. Table: ☐ · **Image** · **Title** · **Description** (short) · **Action** (Edit, Delete). Empty: "No Blogs Found".

## 8. Users — `/users`
Data: `/api/user/all`. Search (name, email, phone, date). Table: ☐ · **User** (avatar, name, *Admin* / *User* badge) · **Email** · **Phone** · **Email Verified** (Verified / Not Verified) · **Joined**. Bulk delete (`/api/user/delete-multiple`).

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
| `/login` | Login | Email Id, Password, Remember Me, *Forgot Password*, login button. Background image + illustration. Non-admins are rejected. Logged-in admins are redirected to `/`. |
| `/forgotpassword` | Forgot password | Email → sends OTP (`/api/user/forgot-password`) → `/verify-account`. |
| `/verify-account` | Verify OTP | 6-digit OTP, *Resend OTP*, verifies email or forgot-password OTP → `/change-password`. |
| `/change-password` | New password | New Password + Confirm → `/api/user/reset-password` → `/login`. |

---

## Full-screen panels (no URL)

Opened from the sidebar or table actions.

| Panel | Fields / content |
|---|---|
| **Add Product** / **Edit Product** | Product Name, Description, Category → Sub-Category → Third Level, Price, Old Price, Discount (%), Brand, Stock, Rating, **Product Flags** (Popular / Latest / Featured), RAMs, Weight, Size (multi-select from the lists below), **Media and Images** (multi-upload to Cloudinary). |
| **View Product** | Images, name, brand, category path, price, stock, rating, flags, RAM / Size / Weight, description, reviews. |
| **Add Product RAM** | Value + Unit (KB / MB / GB / TB) → RAM list with edit / delete. |
| **Add Product Weight** | Value + unit → weight list. |
| **Add Product Size** | Size name → size list. |
| **Add / Edit / View Home Slide** | Banner Type, Banner Heading (e.g. "Big Saving Day Sale"), Product Title, Start At Only Price (e.g. 499), Redirect URL, image upload + preview. |
| **Add / Edit Blog** | Blog Title, Description (plain text; blank line = new paragraph), Blog Images (multi-upload). |
| **Add New Category** / **Edit Category** | Category Name, Category Image. |
| **Add New Sub Category** / **Edit Sub Category** | Parent category, one or more sub-category names. |
| **Add Third Level Category** / **Edit Third Category** | Main category → Sub category, one or more names. |
| **View Category** | Category image, name and children. |

> Product flags drive storefront sections: **latest** → *Latest Products*, **featured** → *Featured Products*. *Today's Best Deals* uses the highest **discount** automatically; *Shop by Budget* uses **price**.
