# Pending Work — Lecture-wise

> Playlist: "Mern Stack E-Commerce Website Using React JS, Node Js, MongoDB, Express Js with Admin Panel"
> Audit date: 2026-11-17. Lecture numbers = video title ka `#` number (playlist position alag ho sakti hai — playlist mein #60 video #57 se pehle rakha hai).
> #65 se aage audit user ki di hui transcript (`NN.md`) se hota hai. #64 aur usse pehle ke lectures title + code se audit hue the.
> Rule: naya lecture pehle **discuss** hoga, implement user ke bolne par hi.

## Summary

| # | Lecture | Status |
|---|---|---|
| ≤54 | UI, REST APIs, auth, profile, address, admin category/product | ✅ |
| 55 | Complete Category, Products Module | ✅ Done (2026-11-17) |
| 56 | Home Banners Slider (admin) | ✅ |
| 57 | Home Page development | ✅ Done (2026-11-17) |
| 58 | Home Page Banners Development | ✅ |
| 59 | Blog Section Development | ✅ Done (2026-11-17) |
| 60 | Product Listing Page with filters | ✅ Done (2026-11-17) |
| 61 | Google Authentication with Firebase | ✅ Done (2026-11-17) |
| 62 | Product Details Page (loader, related, reviews) | ✅ Done (2026-11-17) |
| 63 | Complete Add to Cart (frontend) | ✅ Done (2026-11-17) |
| 64 | Cart panel, subtotal, product variants | ✅ Done (2026-11-17) |
| 65 | Complete Add to Cart part 3 (cart page module) | ✅ Done (2026-11-17) — transcript se verify |
| 66 | Fixes (Add to Cart) | ✅ Done (2026-11-17) — transcript se verify |
| 67 | My List (wishlist) | ✅ Done (2026-11-17) — transcript se verify |
| 68 | Address module (Home/Office, edit, drawer) | ✅ Done (2026-11-17) |
| 69 | Address drawer + Checkout page | ✅ Done (2026-11-17) — transcript se verify |
| 70 | Order place (Razorpay + COD) | ✅ Done (2026-11-17) — payment gateway user ke kehne par skip |
| 71 | PayPal + Order Success / Failed pages | ✅ Done (2026-11-17) — PayPal skip |
| 72 | My Orders + Admin Orders dynamic, status change | ✅ Done (2026-11-17) |
| 73 | Dashboard boxes + chart, orders search/pagination | ✅ Done (2026-11-17) |
| 74 | Admin Users page | ✅ Done (2026-11-17) |
| 75 | Search page + suggestions | ✅ Done (2026-11-17) |
| 76–82 | — | ⏳ Khaali files, transcript paste karni hai |

---

## #55 — Complete Category, Products Module ✅
- [x] Header Navigation categories dynamic nahi — `my-project/src/components/Header/Navigation/index.jsx` mein saare links hardcoded (`to='/'`, `/product/856`), API call nahi.
- [x] Side drawer (`CategoryCollapse`) bhi dynamic kiya (pehle hardcoded Fashion/Apparel).
- [x] `HomeCatSlider` link `/products?category=...` par jaata hai, lekin App mein route `/productListing` hai → click par blank page.
- Fix: categories `App.jsx` context (`catData`) mein ek baar fetch; links `/productListing?catId= | subCatId= | thirdSubCatId=`. Listing page in params ko #60 mein read karega.
- ✅ Home category slider `/api/category` se dynamic.

## #56 — Home Banners Slider ✅
- ✅ Admin: HomeSliderBanners add / edit / list / view, delete multiple.
- ✅ Backend `homeSlide` model, controller, routes (type: Left Big, Right Top, Right Down, v2, v3).
- [x] `server/route/homeSlideRoute.js` `/delete-multiple` par `auth` nahi tha — FIXED: ab `auth, isAdmin`.

## #57 — Home Page Development ✅
- ✅ Popular / Latest / Featured products API (`/api/product?flag=...`) se.
- [x] Popular Products ke Tabs hardcoded "Item One … Item Seven" (`Pages/Home/index.jsx:80-86`) — categories se tabs aur tab change par us category ke products load nahi hote.
- Fix: tabs `context.catData` se; default pehli category; tab change → `/api/product/getproductby-catid/:id`.

## #58 — Home Page Banners Development ✅
- ✅ HomeSliderV2, BannerBoxV2, AdsBannerSlider / AdsBannerSlider2 backend banners se.

## #59 — Blog Section Development ✅
- [x] Backend: Blog model, controller (add/get/update/delete, image upload), route `/api/blog`.
- [x] Admin: Blog list page, Add/Edit Blog form, sidebar menu, route.
- [x] Frontend: Home blog slider API se; `BLogItem` props se data (abhi hardcoded image/text, 5 same cards — `Pages/Home/index.jsx:134-138`).
- Files: `server/models/Blog.js`, `server/controllers/blogController.js`, `server/route/blogRoute.js` (`/api/blog`, write routes par `auth`); admin `Pages/Blog/index.jsx` + `blogForm.jsx` (Add/Edit), route `/blog/list`, sidebar "Blogs".
- [x] Blog detail page bana diya (`/blog/:id`).

## #60 — Product Listing Page with Filters ✅
- [x] `Pages/ProductListing/index.jsx` mein koi API call nahi — products static.
- [x] `components/sideBar` category / price range / rating / availability / size filters static, API se nahi jude.
- [x] Category / subcategory se products filter (URL param read karna).
- [x] Sort-by menu kaam nahi karta.
- [x] Pagination hardcoded `count={10}`.
- Fix: naya `POST /api/product/filters` (catId/subCatId/thirdSubCatId arrays, price range, rating, availability, size, search, sortBy/order, page/limit). Listing page URL params padhta hai, sidebar se filters, sort menu, pagination, loader, empty state. `ProductItemListView` ab `item` prop se.
- Note: Product model mein `sale` field nahi, isliye "Sales, highest to lowest" sort hataya; "Rating, high to low" joda.

## #61 — Google Authentication with Firebase ✅
- [x] Register page "Login with Google" button par `onClick` nahi (`Pages/Register/index.jsx:166`).
- [x] `googleLoginController` response mein `user.password` hash bhi jaata hai. (Normal `/login` mein bhi yahi tha — dono fix.)
- [x] Existing unverified email user Google login kare to `verify_email` true nahi hota.
- Detail: `61.md`

## #62 — Product Details Page ✅
- [x] Loading state + loader.
- [x] Related Products — `ProductSlider` ko `data` nahi diya (`Pages/ProductDetails/index.jsx:295`); `getproductby-catid` se fetch karna.
- [x] Review system poora: backend model/controller/route; frontend reviews list, form state, validation, login check, avatar, submit ke baad refresh.
- [x] Hardcoded: "Reviews (5)", "Review (0)", dummy review cards, "Product Details" tab table.
- [x] Breadcrumb `Link` mein `href` → `to`; JSX `class` → `className`.
- Fix: `server/models/Review.js`, `controllers/reviewController.js`, `route/reviewRoute.js` (`POST /api/review/add` auth, `GET /api/review/:productId`). Ek user = ek review per product (dobara submit = update); har review ke baad `Product.rating` average update. Frontend `Pages/ProductDetails/reviews.jsx`.
- Detail: `62.md`

## #63 — Complete Add to Cart ✅
- [x] Context mein `cartData`, `setCartData`, `getCartItems()`; login par fetch.
- [x] ProductItem par Add to Cart button + API.
- [x] `isAdded` check (useEffect + `cartData`), cart mein ho to qty +/- controls.
- [x] Qty update API, qty 0 → delete.
- [x] Delete API ID `req.params` se (abhi `req.body`).
- [x] Logout par `setCartData([])`.
- [x] Header count, CartPanel, Cart page dynamic (abhi hardcoded).
- Fix: context mein `cartData`, `getCartItems`, `addToCart`, `updateCartQty`, `removeCartItem` (`App.jsx`); shared `components/AddToCart` (button ↔ −/qty/+) ProductItem, ListView, ProductDetails mein; CartPanel, Cart page, header badge, drawer title dynamic; delete route `/api/cart/delete/:id` + ownership check.
- Note: Cart page ka Size dropdown hata diya — size cart mein save nahi hota tha; #64 (variants) mein aayega.
- Detail: `63.md`

## #64 — Cart refinement + Variants ✅
- [x] Qty lag fix, existing qty dikhana, undefined → 1.
- [x] CartPanel `.map()`, empty state, `substr` naam truncate.
- [x] Subtotal `reduce` + `toLocaleString('en-IN', INR)`.
- [x] CartProduct model mein brand, oldPrice, discount, size, weight, ram.
- [x] Product card overlay se size/RAM/weight select, active styling, backend tak bhejna.
- Fix: `utils/formatPrice.js` (₹ INR format + variant helpers); `components/VariantPicker` (card overlay); `AddToCart` variant-aware; ProductDetails par product ke asli size/RAM/weight buttons; CartPanel/Cart page mein variant tags.
- Backend: CartProduct mein `size`, `productRam`, `productWeight`; add controller variant zaroori + valid check, same product alag variant = alag cart item.
- Admin: Add/Edit Product mein RAM/Weight/Size ab **multiple select**; `Product.productRam` ab array (purana string data apne aap array padha jaata hai).
- Note: brand/oldPrice/discount cart mein copy nahi kiye — cart `productId` populate karta hai, isliye latest product data hi dikhta hai.
- Checkout page #69 mein dynamic kiya.
- Detail: `64.md`

---

## #1–#54 — Detail audit

| Range | Lectures | Status |
|---|---|---|
| #1–#19 | Storefront UI: header, sliders, product box, home, banners, listing, details, login/register, cart panel/page, verify, checkout, my account, mylist, orders | ✅ Saare pages/components bane hain (UI lectures — static data yahan expected hai) |
| #20–#27 | Admin dashboard UI | ✅ Pages bane hain (Users/Orders abhi bhi static — UI lectures the) |
| #28–#31 | User APIs: register, verify email, login, logout, avatar upload/delete, forgot/reset password, refresh token, user-details | ✅ |
| #32–#33 | Category + Product CRUD APIs, filters by cat/subcat/price/rating, count | ✅ |
| #34–#35 | Cart API, My List API | ✅ (backend only) |
| #36–#40 | Sign Up, Sign In, Forgot Password, Update Profile, Change Password (storefront) | ✅ API se jude |
| #41–#43 | Admin Sign In/Up, User Profile part 1-2 | ✅ |
| #44 | Add Address | ✅ Fixed (2026-11-17) |
| #45–#46 | Admin Category + Sub Category (+ third level) | ✅ |
| #47–#54 | Admin Add/Edit Product, RAM/Size/Weight, delete multiple, product module | ✅ |

### #44 Add Address — bugs
- [x] **Storefront address delete kaam nahi karta:** `my-project/src/Pages/MyAddress/index.jsx:99` → `getData(..., null, { method: "DELETE" })`. Storefront `getData` sirf `url` leta hai aur hamesha `axios.get` karta hai → DELETE request jaati hi nahi.
- [x] **Admin address delete crash:** `admin/src/Pages/MyAccount/index.jsx:235` `fetchDataFromApi` use karta hai jo na import hai na `admin/src/utils/api.js` mein exist karta hai → `ReferenceError`. (`deleteData` available hai.)
- [x] `server/route/addressRoute.js` — kisi route par `auth` nahi; `GET /api/address/:userId` se koi bhi kisi ka address dekh sakta hai.

### Other (≤54)
- [x] Admin login `role` check nahi karta — FIXED (2026-11-17): `/login` mein `adminLogin: true` par non-admin ko 403; admin panel auto-login mein bhi role check.
- ✅ Fixed (setup ke time): refresh token verify galat env naam (`JWT_REFRESH_SECRET_TOKEN`) use kar raha tha.

---

## #65 — Complete Add to Cart part 3 ✅ (poori transcript `65.md` se match kiya)
- [x] Cart page par size / RAM / weight dropdown se variant badalna → `PUT /api/cart/update-qty` ab `size`, `productRam`, `productWeight` bhi leta hai (valid option check). Naya variant pehle se cart mein ho to dono merge (qty jud jaati hai). Stock se zyada qty reject.
- [x] Variant na chuna ho to product details par option buttons laal border + "Please select size" (video ka `tabError`).
- [x] Khaali cart (panel + page) par bada cart icon + "Your cart is currently empty" + Continue Shopping (video mein flaticon image thi — humne `react-icons` ka `BsCartX` liya).
- [x] Cart page ka "Cart Total" box sticky (`top-[150px]`, `z-[90]`).
- [x] Cart page khulte hi `window.scrollTo(0,0)`.
- Pehle se bana (#63/#64): qty dropdown, ✕ remove, price/oldPrice/discount ₹, View Cart par panel band, details/card par loader, "Item already in cart".
- Jaan-boojh ke alag: qty options stock tak (max 10), video mein fixed 1–15. `subTotal` DB mein save nahi karte (hamesha price × qty), cart mein product data copy nahi karte (`populate`).

## #66 — Fixes ✅ (transcript `66.md` se match kiya)
- [x] Quick View popup (`<Dialog>`) `MyContext.Provider` ke bahar tha → popup mein Add to Cart fail. Ab Provider + Router ke andar (`App.jsx`).
- [x] Card / list view par Add to Cart dobara dabane se variant panel band (toggle). ✕ button pehle se tha.
- Pehle se bana: logout par cart 0 (#63), cart page par sirf available size/RAM/weight + error (#65), bina variant wala product seedha add, details par loader.

## #67 — My List (wishlist) ✅ (transcript `67.md` se match kiya)
- [x] Context: `myListData`, `getMyListData`, `getMyListItem`, `toggleMyList`, `removeFromMyList`; login par fetch, logout par khaali.
- [x] Shared `components/WishlistButton` — card + list view (video ka homework) par dil; list mein ho to bhara/primary. Product details par "Add to Wishlist" ↔ "Added to Wishlist".
- [x] Login nahi → "You are not logged in, please login first".
- [x] Header wishlist badge = `myListData.length`, `/my-list` link (account menu link bhi `/my-list` absolute kiya).
- [x] My List page dynamic: count, image/brand/naam (80 char)/rating/₹ price/oldPrice/discount, link `/product/:productId`, ✕ remove + loader, sticky sidebar `top-[160px]`, image 150px, khaali state (`FaRegHeart` icon) + Continue Shopping. Add to Cart button hataya (video jaisa).
- Backend fix: add API ab `req.userId` (pehle `req.body.userId` — koi bhi kisi ki list mein daal sakta tha); product data server DB se leta hai (client sirf `productId`); remove API mein ownership check. Model mein image/oldPrice/discount/brand ab optional (default).
- Jaan-boojh ke alag: dil dobara dabane par item hat jaata hai (video mein sirf "already in list" message).

## #68 — Address module ✅ (transcript `68.md` — beech mein kat jaati hai, drawer wala hissa #69 ke shuru mein)
- Hamara address module #44 mein alag (Amazon jaisa) design mein bana hai: naam, mobile, pincode, flat/house, area/street, landmark, city, state, country, default, add/edit/delete/view. Isliye video ka form/card dobara nahi banaya.
- [x] Address Type (Home/Office): model `addressType` (enum, default Home), add/update controller, form mein radio, card + view modal mein badge.
- [x] Update address API ab sirf allowed fields leta hai (pehle poora `req.body` spread hota tha).
- [x] Profile update (`updateUserDetails`) sirf naam/email/mobile — **bug fix**: password bhejne par hash ek inner `const` mein kho jaata tha aur password `""` save hota tha.
- Zaroorat nahi: get single address API (edit list ke data se hota hai), ⋮ menu wala card.
- [x] Address form common drawer mein: `components/AddressPanel` (500px, add/edit, loader, validation), `App.jsx` mein `<Drawer className="addressPanel">`.
- [x] Context: `addressList`, `getAddresses()` (login par fetch, logout par khaali), `openAddressPanel`, `editAddress`, `openAddressPanelFor(addr|null)`, `closeAddressPanel`.
- [x] My Address page: collapse wala form hataya; Add/Edit drawer kholte hain, delete ke baad `getAddresses()`.
- Drawer wala hissa #69 ke shuru mein tha — #68 ke saath kiya.

## #69 — Checkout page ✅ (transcript `69.md` se match kiya)
- [x] Purana static "Billing Details" form + dummy items + `$100.00` hataya.
- [x] Left "Select Delivery Address": `context.addressList` se cards + radio, Home/Office + Default badge, naam/address/mobile, chuna hua halka laal background, har card par Edit (common drawer), "+ Add New Address", khaali list par icon + "No address found in your account" + Add Address.
- [x] Default address pehle chuna hua (warna pehla); chuna hua delete ho to dobara auto-select.
- [x] Right "Your Order": asli cart items (image, naam 20 char + hover title, qty, variant, price × qty ₹), Subtotal / Shipping Free / Total, sticky.
- [x] Page khulte hi cart panel band + scroll top; login nahi → `/login`; khaali cart → empty state.
- [x] Checkout button abhi sirf address check karta hai — payment #70 mein.
- Jaan-boojh ke alag: video pehla address chunta hai, hum default ko pehle. Address list apni address API se (video user details se leta hai).

## #70 — Order place ✅ (transcript `70.md` se match kiya)
- **User ka faisla:** koi payment gateway nahi lagana (Razorpay/PayPal skip). Baad mein "click → WhatsApp par order" karna hai.
- [x] `models/Order.js` naya: `products[]` (productId, title, image, brand, price, qty, subTotal, size/RAM/weight), `paymentMethod: COD`, `paymentStatus`, `orderStatus` (pending/confirmed/shipped/delivered/cancelled), `deliveryAddressId` + address ki **copy**, `totalAmt`. (Purana model ek order = ek product tha; DB mein 0 orders the.)
- [x] `POST /api/order/cod` (auth): client sirf `addressId` bhejta hai. Server: address apna hai check, cart DB se, total latest price se, stock **atomic** kam (`countInStock >= qty` shart; kam ho to error + pichla stock wapas), order save, cart khaali.
- [x] `GET /api/order/my-orders` (auth): sirf apne orders, naye pehle.
- [x] Checkout: "Place Order (Cash on Delivery)" button + loader → success par cart refresh + `/my-orders`; error par message + cart refresh.
- Video ke security bug copy nahi kiye: Key Secret frontend mein, amount/"COMPLETED" client se, stock minus mein jaana, empty-cart API mein URL ka userId.
- My Orders + Admin Orders #72 mein dynamic kiye.

## #71 — Order Success / Failed ✅ (transcript `71.md` se match kiya)
- PayPal (sandbox keys, button, INR→USD conversion, create/capture APIs) — user ke kehne par **skip**.
- [x] `Pages/Order/success.jsx` → `/order/success`: ✅ icon, "Your order is placed!", order # (id ke last 8) + total + COD, "View My Orders" + "Back to Home".
- [x] `Pages/Order/failed.jsx` → `/order/failed`: ❌ icon, message, "Back to Cart" + "Back to Home".
- [x] Checkout: order hone par `/order/success` (order details `state` mein); server ne wajah batayi (stock / address) to checkout par hi message; network / server down → `/order/failed`.
- Pehle se: checkout scroll top, cart page Checkout link.

## #72 — Orders dynamic ✅ (transcript `72.md` se match kiya)
- [x] Backend: `GET /api/order/all` (auth + isAdmin, user naam/email populate), `PUT /api/order/status/:id` (auth + isAdmin; sirf pending/confirmed/shipped/delivered/cancelled). **Cancel = final + stock wapas** (atomic, do baar nahi).
- [x] Storefront `Pages/Orders`: asli orders, Order # / payment / naam / phone / address (order ki copy) / pincode / ₹ total / status badge / date; ▼ se products (image, naam link, variant, qty, price, subtotal); loader + "No orders yet".
- [x] Admin `Components/OrdersTable` (shared): saare orders + email, status **dropdown** (cancel par confirm), loader, message. `Pages/Orders` isi se; Dashboard "Recent Orders" = `OrdersTable limit={5}` + "View all".
- [x] Badge (storefront + admin) ab 5 status ke colors.
- Video ke bug copy nahi kiye: status API bina admin check, admin ke liye user wala order-list API.
- Orders search / dashboard counts / chart #73 mein.

## #73 — Dashboard + orders search ✅ (transcript `73.md` se match kiya)
- Pehle se: bina address order nahi (checkout message + server check); order mein address ka mobile (address copy).
- [x] `GET /api/order/dashboard-stats?year=` (auth + isAdmin): users / orders / products / categories / reviews ginti (`countDocuments`), total sales (cancelled chhod ke), saal ke 12 mahine ki sales + naye users (`aggregate`). Live DB par test kiya.
- [x] `DashboardBoxes` dynamic (6 box: Orders, Sales ₹, Users, Products, Category, Reviews).
- [x] Chart: LineChart → **BarChart** (ResponsiveContainer), "Total Users" / "Total Sales" toggle, saal dropdown (pichle 5 saal), ₹ format.
- [x] Admin Orders: search (order #, naam, email, phone, pincode, status) + pagination (10 / page). Dashboard Recent Orders = 5 + View all.
- Video ka tarika copy nahi kiya: saare users / reviews frontend par mangwa ke `.length` (password hash bhi jaata).

## #74 — Admin Users ✅ (transcript `74.md` se match kiya)
- [x] `GET /api/user/all` (auth + isAdmin): sirf safe fields (name, email, mobile, avatar, role, verify_email, status, createdAt), naye pehle. Live DB par test kiya.
- [x] `DELETE /api/user/delete-multiple` (auth + isAdmin, body `{ ids }`): admin accounts + khud skip; user ka cart / address / my list bhi delete; orders + reviews rehte hain.
- [x] Admin `Pages/Users`: photo (default icon), naam + Admin badge, email, phone ("—"), Verified / Not Verified badge, join date; search (naam / email / phone / date), pagination (10), loader, checkbox + select-all (admin rows par nahi), Delete (confirm).
- Video ke bug copy nahi kiye: getAllUsers bina admin check + password hash ke saath; admin / khud ko delete karna; user ka bacha data.

## #75 — Search ✅ (transcript `75.md` se match kiya)
- Video ka alag copy wala Search page nahi banaya — `/search` par **wahi `ProductListing`** (filters / sort / pagination search ke saath chalte rehte hain; video mein filter chhoone par search hat jaata tha).
- [x] Backend `POST /api/product/filters` ka `search` ab naam + brand + catName + subCat + thirdSubCat mein (`$and` se, taaki rating ka `$or` na toote; regex escape, 100 char max). Live DB par test kiya.
- [x] `GET /api/product/search-suggestions?q=` (min 2 char, top 5: naam / image / price / brand).
- [x] Header `components/Search`: Enter / 🔍 → `/search?q=`, `/search` par box mein wahi query, typing par 300ms debounce suggestions dropdown (image, naam, brand, ₹) + "See all results", loader, bahar click / Esc par band.
- [x] Listing: `?q=` padhta hai, breadcrumb `Search: "x"`, "N products found for 'x'", khaali par "No products found for 'x'" + Continue Shopping.

## Extra issues (kisi lecture se direct nahi)
- [x] Admin write routes par `auth` nahi tha — FIXED: naya `middleware/isAdmin.js`; category, product, homeSlide, RAM/size/weight, blog ke saare create/update/delete routes ab `auth, isAdmin`.
- [x] `middleware/auth.js` har request par cookies/token console mein print karta tha aur 401 response mein cookies wapas bhejta tha — hata diya.
- [x] Blog detail page — `Pages/BlogDetails` (`/blog/:id`), Read More ab wahan jaata hai.
- [x] `server/.env` mein `FRONTEND_URL` ka commented placeholder (deploy ke time live URL daalna; localhost 5173/5174 pehle se CORS mein allowed).
- [x] Compare feature playlist mein nahi → header Compare icon (hardcoded badge 4), card / list view ke Compare button, details ka "Add to Compare" hataye.
- [x] Home page ka bina use `HomeSlider` import hataya (asli slider `HomeSliderV2`).
- Baad mein (user): WhatsApp se order.

## Aage ke lectures ke liye chhoda (playlist mein aage aayega)
- Online payment / WhatsApp order (user baad mein karega).

## Admin panel security (2026-11-17) ✅
- [x] Bina login admin panel ka koi page nahi dikhta: `admin/src/App.jsx` mein `authChecked` + `protect()` guard, 10 routes par. Logged-in user `/login` khole to `/` par redirect.
- [x] Admin Signup hataya: `/signup` route, `Pages/Signup` folder, aur Login / ForgotPassword / VerifyAccount / ChangePassword se "Sign Up" links.
- [x] Shared `logout` context mein (Header + Sidebar).
- [x] Auto-login sirf `role === "admin"` par.

## Database reset (2026-11-17)
- Saare purane users delete kiye (user ke kehne par, **koi backup nahi**). Unke cart, address aur mylist bhi delete kiye. Products ki rating 0 kar di.
- Ab sirf 2 users hain: ek admin (`role: "admin"`) aur ek normal user.
- Dono ke email/password `server/.env` mein: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `USER_EMAIL`, `USER_PASSWORD` (file gitignored hai).
