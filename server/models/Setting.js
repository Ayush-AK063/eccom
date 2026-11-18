import mongoose from "mongoose";

// Poore store ki settings — ek hi document (key: "store")
const linkSchema = new mongoose.Schema({ label: String, url: String }, { _id: false });
const featureSchema = new mongoose.Schema({ icon: String, title: String, text: String }, { _id: false });

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "store", unique: true },

    general: {
      storeName: { type: String, default: "My Store" },
      tagline: { type: String, default: "" },
      tabTitle: { type: String, default: "" },
      logo: { type: String, default: "" },
      favicon: { type: String, default: "" },
    },

    contact: {
      address: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      hours: { type: String, default: "" },
    },

    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },

    header: {
      topStripEnabled: { type: Boolean, default: true },
      topStripText: { type: String, default: "" },
      topLinks: { type: [linkSchema], default: [] },
      menuCount: { type: Number, default: 5 }, // menu bar mein kitni categories, baaki "More"
    },

    footer: {
      about: { type: String, default: "" },
      copyright: { type: String, default: "" },
      features: { type: [featureSchema], default: [] },
      newsletterEnabled: { type: Boolean, default: true },
      newsletterText: { type: String, default: "" },
    },

    shipping: {
      freeShippingAbove: { type: Number, default: 0 }, // 0 = hamesha free (agar charge bhi 0)
      shippingCharge: { type: Number, default: 0 },
      etaMinDays: { type: Number, default: 2 },
      etaMaxDays: { type: Number, default: 5 },
      defaultDispatchDays: { type: Number, default: 2 },
      defaultReturnDays: { type: Number, default: 7 },
    },

    checkout: {
      codEnabled: { type: Boolean, default: true },
      codMinOrder: { type: Number, default: 0 },
      codMaxOrder: { type: Number, default: 0 }, // 0 = koi limit nahi
      codCharge: { type: Number, default: 0 },
      minOrderValue: { type: Number, default: 0 },
      taxInclusiveNote: { type: Boolean, default: true },
    },

    notifications: {
      orderEmails: { type: Boolean, default: true },
    },

    reviews: {
      autoApprove: { type: Boolean, default: true },
    },

    // Home page builder: sections ka order / on-off / naam + har section ki settings
    home: {
      sections: {
        type: [new mongoose.Schema({ key: String, enabled: Boolean, title: String, subtitle: String }, { _id: false })],
        default: undefined,
      },
      bannerButtonText: { type: String, default: "SHOP NOW" },
      popular: { source: { type: String, default: "category" }, limit: { type: Number, default: 12 } },
      latest: { source: { type: String, default: "newest" }, limit: { type: Number, default: 12 } },
      featured: { limit: { type: Number, default: 12 } },
      deals: {
        source: { type: String, default: "discount" }, // discount | flag | manual
        minDiscount: { type: Number, default: 10 },
        productIds: { type: [String], default: [] },
        limit: { type: Number, default: 12 },
        timer: { type: String, default: "daily" }, // daily | date | off
        endsAt: { type: Date, default: null },
        viewAllUrl: { type: String, default: "/productListing" },
        // source "schedule": har din (India date YYYY-MM-DD) ke products; khaali din pe emptyDay
        schedule: {
          type: [new mongoose.Schema({ date: String, productIds: [String] }, { _id: false })],
          default: [],
        },
        emptyDay: { type: String, default: "discount" }, // discount | hide
      },
      budget: {
        type: [new mongoose.Schema({ max: Number, bg: String, accent: String }, { _id: false })],
        default: undefined,
      },
      collections: {
        type: [new mongoose.Schema({
          title: String, tag: String, text: String, image: String, link: String, catId: String,
          // mode: category (poori category) | link | products (chune hue) | filter (rule se)
          mode: String, slug: String, productIds: [String],
          filter: { catId: String, maxPrice: Number, minDiscount: Number, flag: String },
        }, { _id: false })],
        default: undefined,
      },
      blog: { limit: { type: Number, default: 8 } },
    },
  },
  { timestamps: true, minimize: false }
);

export const Setting = mongoose.model("Setting", settingSchema);

// Home sections — default order + naam (admin badal sakta hai)
export const HOME_SECTIONS = [
  { key: "hero", enabled: true, title: "Main banners", subtitle: "" },
  { key: "categories", enabled: true, title: "Shop by Category", subtitle: "" },
  { key: "popular", enabled: true, title: "Popular Products", subtitle: "Trending picks our customers love right now" },
  { key: "deals", enabled: true, title: "Today's Best Deals", subtitle: "Biggest discounts of the day — grab them before they're gone" },
  { key: "budget", enabled: true, title: "Shop by Budget", subtitle: "Great finds at every price" },
  { key: "freeShipping", enabled: true, title: "Free Shipping", subtitle: "" },
  { key: "collections", enabled: true, title: "Shop by Collection", subtitle: "Curated edits for every style" },
  { key: "latest", enabled: true, title: "Latest Products", subtitle: "" },
  { key: "wideBanner", enabled: true, title: "Wide banners", subtitle: "" },
  { key: "featured", enabled: true, title: "Featured Products", subtitle: "" },
  { key: "blog", enabled: true, title: "From the Blog", subtitle: "Style tips, guides and the latest from our store" },
];
export const BUDGET_DEFAULT = [
  { max: 99, bg: "#fff1f0", accent: "#ff5252" },
  { max: 299, bg: "#eef5ff", accent: "#2563eb" },
  { max: 499, bg: "#f1faf3", accent: "#15803d" },
  { max: 999, bg: "#f6f1ff", accent: "#7c3aed" },
];

// Sections list: saved order rakho, naye keys (future) end mein jodo, unknown hatao
export const withHomeDefaults = (doc) => {
  const o = doc?.toObject ? doc.toObject() : { ...(doc || {}) };
  const home = { ...(o.home || {}) };
  const saved = (home.sections || []).filter((x) => HOME_SECTIONS.some((d) => d.key === x.key));
  home.sections = [...saved, ...HOME_SECTIONS.filter((d) => !saved.some((x) => x.key === d.key))];
  if (!home.budget) home.budget = BUDGET_DEFAULT;
  if (!home.collections) home.collections = [];
  o.home = home;
  return o;
};

// Hamesha ek document lautao (na ho to bana do)
export const getSettings = async () => {
  let s = await Setting.findOne({ key: "store" });
  if (!s) s = await Setting.create({ key: "store" });
  return s;
};

// Order total — cart / checkout / server teeno isi formula se
export const computeCharges = (settings, subTotal, { cod = true } = {}) => {
  const sh = settings?.shipping || {};
  const co = settings?.checkout || {};
  const freeAbove = Number(sh.freeShippingAbove) || 0;
  const charge = Number(sh.shippingCharge) || 0;
  const shipping = charge > 0 && !(freeAbove > 0 && subTotal >= freeAbove) ? charge : 0;
  const codCharge = cod ? Number(co.codCharge) || 0 : 0;
  return { shipping, codCharge, total: subTotal + shipping + codCharge };
};
