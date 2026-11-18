// Admin → Settings se aane wali store settings ke helpers (server ka computeCharges jaisa hi)
export const DEFAULT_SETTINGS = {
  general: { storeName: "", tagline: "", tabTitle: "", logo: "", favicon: "" },
  contact: {}, social: {},
  header: { topStripEnabled: true, topStripText: "", topLinks: [] },
  footer: { about: "", copyright: "", features: [], newsletterEnabled: true, newsletterText: "" },
  shipping: { freeShippingAbove: 0, shippingCharge: 0, etaMinDays: 2, etaMaxDays: 5, defaultDispatchDays: 2, defaultReturnDays: 7 },
  checkout: { codEnabled: true, codMinOrder: 0, codMaxOrder: 0, codCharge: 0, minOrderValue: 0, taxInclusiveNote: true },
  reviews: { autoApprove: true },
  home: {
    sections: [
      { key: "hero", enabled: true }, { key: "categories", enabled: true, title: "Shop by Category" },
      { key: "popular", enabled: true, title: "Popular Products" }, { key: "deals", enabled: true, title: "Today's Best Deals" },
      { key: "budget", enabled: true, title: "Shop by Budget" }, { key: "freeShipping", enabled: true },
      { key: "collections", enabled: true, title: "Shop by Collection" }, { key: "latest", enabled: true, title: "Latest Products" },
      { key: "wideBanner", enabled: true }, { key: "featured", enabled: true, title: "Featured Products" },
      { key: "blog", enabled: true, title: "From the Blog" },
    ],
    bannerButtonText: "SHOP NOW",
    popular: { source: "category", limit: 12 }, latest: { source: "newest", limit: 12 }, featured: { limit: 12 },
    deals: { source: "discount", minDiscount: 10, productIds: [], limit: 12, timer: "daily", endsAt: null, viewAllUrl: "/productListing" },
    budget: [], collections: [], blog: { limit: 8 },
  },
  _loaded: false,
};

export const mergeSettings = (s) => ({
  ...Object.fromEntries(Object.entries(DEFAULT_SETTINGS).filter(([k]) => k !== "_loaded").map(([k, v]) => [k, { ...v, ...(s?.[k] || {}) }])),
  _loaded: !!s,
});

const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export const computeCharges = (settings, subTotal) => {
  const sh = settings?.shipping || {};
  const co = settings?.checkout || {};
  const freeAbove = Number(sh.freeShippingAbove) || 0;
  const charge = Number(sh.shippingCharge) || 0;
  const shipping = charge > 0 && !(freeAbove > 0 && subTotal >= freeAbove) ? charge : 0;
  const codCharge = Number(co.codCharge) || 0;
  return {
    shipping, codCharge, total: subTotal + shipping + codCharge,
    // "₹X aur add karo free shipping ke liye"
    toFree: charge > 0 && freeAbove > 0 && subTotal < freeAbove ? freeAbove - subTotal : 0,
  };
};

// Checkout rok ne wale kaaran (server bhi yahi check karta hai)
export const checkoutBlockers = (settings, subTotal, cartItems = []) => {
  const co = settings?.checkout || {};
  const out = [];
  if (co.minOrderValue > 0 && subTotal < co.minOrderValue) out.push(`Minimum order value is ${inr(co.minOrderValue)}. Add ${inr(co.minOrderValue - subTotal)} more.`);
  if (co.codEnabled === false) out.push("Cash on Delivery is not available right now.");
  else {
    if (co.codMinOrder > 0 && subTotal < co.codMinOrder) out.push(`Cash on Delivery is available on orders above ${inr(co.codMinOrder)}.`);
    if (co.codMaxOrder > 0 && subTotal > co.codMaxOrder) out.push(`Cash on Delivery is available on orders up to ${inr(co.codMaxOrder)}.`);
  }
  cartItems.filter((i) => i?.productId?.shipping?.codAvailable === false)
    .forEach((i) => out.push(`"${i.productId.name}" is not available for Cash on Delivery. Remove it to continue.`));
  return out;
};

// "Free delivery above ₹999" jaisa ek line text, ya null
export const shippingLine = (settings) => {
  const sh = settings?.shipping || {};
  if (!(sh.shippingCharge > 0)) return "Free delivery on all orders";
  if (sh.freeShippingAbove > 0) return `Free delivery above ${inr(sh.freeShippingAbove)}`;
  return null;
};

// India ki aaj ki date "YYYY-MM-DD" (deals calendar isi se badalta hai, customer kahin bhi ho)
export const istToday = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
// India ki agli raat 12 baje tak kitne ms
export const msToIstMidnight = () => {
  const now = Date.now();
  const ist = new Date(now + 5.5 * 36e5); // UTC fields = IST time
  const next = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1) - 5.5 * 36e5;
  return next - now;
};

export const collectionSlug = (c) => c.slug || String(c.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const collectionMode = (c) => c.mode || (c.catId ? "category" : "link");
// Tile kahan khule
export const collectionHref = (c) => {
  const mode = collectionMode(c);
  if (mode === "category") return c.catId ? `/productListing?catId=${c.catId}` : null;
  if (mode === "link") return c.link || null;
  return `/collection/${collectionSlug(c)}`;
};
// Collection page ke products ki query (/api/product/filters)
export const collectionQuery = (c) => {
  const mode = collectionMode(c);
  if (mode === "products") return { ids: c.productIds || [], limit: 60 };
  if (mode === "filter") {
    const f = c.filter || {};
    const q = { limit: 60 };
    if (f.catId) q.catId = [f.catId];
    if (f.maxPrice > 0) q.maxPrice = f.maxPrice;
    if (f.minDiscount > 0) q.minDiscount = f.minDiscount;
    if (f.flag) q.flag = f.flag;
    return q;
  }
  if (mode === "category" && c.catId) return { catId: [c.catId], limit: 60 };
  return null;
};
