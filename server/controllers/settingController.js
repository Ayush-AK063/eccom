import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { Setting, getSettings, withHomeDefaults, HOME_SECTIONS } from "../models/Setting.js";
import { Subscriber } from "../models/Subscriber.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const str = (v, max = 300) => String(v ?? "").trim().slice(0, max);
const num = (v, min = 0, max = 1e7) => Math.min(max, Math.max(min, Number(v) || 0));
const bool = (v) => v === true || v === "true";
const url = (v) => {
  const s = str(v, 500);
  if (!s) return "";
  if (/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(s)) return s;
  return "https://" + s;
};
const oid = (v) => (/^[a-f\d]{24}$/i.test(String(v || "")) ? String(v) : "");
const ids = (list, max = 30) => [...new Set((Array.isArray(list) ? list : []).map(oid).filter(Boolean))].slice(0, max);
const slugify = (v) => String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const ICONS = ["truck", "return", "shield", "gift", "support", "cash", "star", "tag", "clock", "leaf"];

// Sirf jaane-pehchane fields (koi bhi section bhej sakte ho, baaki purane rehte hain)
const clean = (b = {}) => {
  const out = {};
  if (b.general) out.general = {
    storeName: str(b.general.storeName, 80) || "My Store",
    tagline: str(b.general.tagline, 120),
    tabTitle: str(b.general.tabTitle, 120),
    logo: url(b.general.logo),
    favicon: url(b.general.favicon),
  };
  if (b.contact) out.contact = {
    address: str(b.contact.address, 400),
    email: str(b.contact.email, 120),
    phone: str(b.contact.phone, 30),
    whatsapp: str(b.contact.whatsapp, 30),
    hours: str(b.contact.hours, 120),
  };
  if (b.social) out.social = Object.fromEntries(
    ["facebook", "instagram", "youtube", "pinterest", "twitter", "linkedin"].map((k) => [k, url(b.social[k])])
  );
  if (b.header) out.header = {
    topStripEnabled: bool(b.header.topStripEnabled),
    topStripText: str(b.header.topStripText, 160),
    topLinks: (Array.isArray(b.header.topLinks) ? b.header.topLinks : [])
      .map((l) => ({ label: str(l?.label, 40), url: url(l?.url) })).filter((l) => l.label && l.url).slice(0, 4),
    menuCount: Math.round(num(b.header.menuCount ?? 5, 0, 12)),
  };
  if (b.footer) out.footer = {
    about: str(b.footer.about, 400),
    copyright: str(b.footer.copyright, 160),
    features: (Array.isArray(b.footer.features) ? b.footer.features : [])
      .map((f) => ({ icon: ICONS.includes(f?.icon) ? f.icon : "star", title: str(f?.title, 40), text: str(f?.text, 80) }))
      .filter((f) => f.title).slice(0, 6),
    newsletterEnabled: bool(b.footer.newsletterEnabled),
    newsletterText: str(b.footer.newsletterText, 200),
  };
  if (b.shipping) {
    const etaMin = num(b.shipping.etaMinDays, 0, 60);
    out.shipping = {
      freeShippingAbove: num(b.shipping.freeShippingAbove),
      shippingCharge: num(b.shipping.shippingCharge, 0, 1e5),
      etaMinDays: etaMin,
      etaMaxDays: Math.max(etaMin, num(b.shipping.etaMaxDays, 0, 90)),
      defaultDispatchDays: num(b.shipping.defaultDispatchDays, 0, 60),
      defaultReturnDays: num(b.shipping.defaultReturnDays, 0, 365),
    };
  }
  if (b.checkout) out.checkout = {
    codEnabled: bool(b.checkout.codEnabled),
    codMinOrder: num(b.checkout.codMinOrder),
    codMaxOrder: num(b.checkout.codMaxOrder),
    codCharge: num(b.checkout.codCharge, 0, 1e5),
    minOrderValue: num(b.checkout.minOrderValue),
    taxInclusiveNote: bool(b.checkout.taxInclusiveNote),
  };
  if (b.notifications) out.notifications = { orderEmails: bool(b.notifications.orderEmails) };
  if (b.reviews) out.reviews = { autoApprove: bool(b.reviews.autoApprove) };
  if (b.home) {
    const h = b.home;
    const keys = HOME_SECTIONS.map((x) => x.key);
    const hex = (v, d) => (/^#[0-9a-f]{3,8}$/i.test(String(v || "")) ? v : d);
    const pick = (v, list, d) => (list.includes(v) ? v : d);
    const lim = (v, d = 12) => Math.round(num(v ?? d, 1, 30)) || d;
    const seen = new Set();
    out.home = {
      sections: (Array.isArray(h.sections) ? h.sections : [])
        .filter((x) => keys.includes(x?.key) && !seen.has(x.key) && seen.add(x.key))
        .map((x) => ({ key: x.key, enabled: x.enabled !== false, title: str(x.title, 80), subtitle: str(x.subtitle, 160) })),
      bannerButtonText: str(h.bannerButtonText, 30) || "SHOP NOW",
      popular: { source: pick(h.popular?.source, ["category", "flag", "rating", "newest"], "category"), limit: lim(h.popular?.limit) },
      latest: { source: pick(h.latest?.source, ["newest", "flag"], "newest"), limit: lim(h.latest?.limit) },
      featured: { limit: lim(h.featured?.limit) },
      deals: {
        source: pick(h.deals?.source, ["discount", "flag", "manual", "schedule"], "discount"),
        minDiscount: num(h.deals?.minDiscount, 0, 95),
        productIds: ids(h.deals?.productIds),
        limit: lim(h.deals?.limit),
        timer: pick(h.deals?.timer, ["daily", "date", "off"], "daily"),
        endsAt: h.deals?.endsAt && !isNaN(new Date(h.deals.endsAt)) ? new Date(h.deals.endsAt) : null,
        viewAllUrl: url(h.deals?.viewAllUrl) || "/productListing",
        // Purane din (7 din se pehle) hata do, max 90 din
        schedule: (() => {
          const cutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
          const seenD = new Set();
          return (Array.isArray(h.deals?.schedule) ? h.deals.schedule : [])
            .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d?.date || "") && d.date >= cutoff && !seenD.has(d.date) && seenD.add(d.date))
            .map((d) => ({ date: d.date, productIds: ids(d.productIds) }))
            .filter((d) => d.productIds.length)
            .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 90);
        })(),
        emptyDay: pick(h.deals?.emptyDay, ["discount", "hide"], "discount"),
      },
      budget: (Array.isArray(h.budget) ? h.budget : [])
        .map((t) => ({ max: Math.round(num(t?.max, 1, 1e6)), bg: hex(t?.bg, "#f3f4f6"), accent: hex(t?.accent, "#111827") }))
        .filter((t) => t.max > 0).sort((a, b) => a.max - b.max).slice(0, 6),
      collections: (() => {
        const slugs = new Set();
        return (Array.isArray(h.collections) ? h.collections : []).map((c) => {
          const catId = oid(c?.catId);
          const mode = pick(c?.mode, ["category", "link", "products", "filter"], catId ? "category" : "link");
          let slug = slugify(c?.slug || c?.title) || "collection";
          while (slugs.has(slug)) slug += "-2";
          slugs.add(slug);
          const f = c?.filter || {};
          return {
            title: str(c?.title, 60), tag: str(c?.tag, 30), text: str(c?.text, 120), image: url(c?.image),
            mode, slug,
            catId: mode === "category" ? catId : "",
            link: mode === "link" ? url(c?.link) : "",
            productIds: mode === "products" ? ids(c?.productIds, 60) : [],
            filter: mode === "filter"
              ? { catId: oid(f.catId), maxPrice: num(f.maxPrice), minDiscount: num(f.minDiscount, 0, 95), flag: pick(f.flag, ["", "popular", "latest", "featured", "deal"], "") }
              : { catId: "", maxPrice: 0, minDiscount: 0, flag: "" },
          };
        }).filter((c) => c.title && c.image && (
          (c.mode === "category" && c.catId) || (c.mode === "link" && c.link) || (c.mode === "products" && c.productIds.length) ||
          (c.mode === "filter" && (c.filter.catId || c.filter.maxPrice || c.filter.minDiscount || c.filter.flag))
        )).slice(0, 9);
      })(),
      blog: { limit: lim(h.blog?.limit, 8) },
    };
  }
  return out;
};

// GET /api/settings — public (store ko chahiye)
export const getStoreSettings = async (req, res) => {
  try {
    const s = await getSettings();
    return res.status(200).json({ error: false, success: true, data: withHomeDefaults(s) });
  } catch (error) {
    return res.status(500).json({ error: true, success: false, message: error.message });
  }
};

// PUT /api/settings — admin
export const updateStoreSettings = async (req, res) => {
  try {
    await getSettings();
    const data = clean(req.body);
    const $set = {};
    Object.entries(data).forEach(([section, fields]) => { $set[section] = fields; });
    const s = await Setting.findOneAndUpdate({ key: "store" }, { $set }, { new: true });
    return res.status(200).json({ error: false, success: true, message: "Settings saved", data: withHomeDefaults(s) });
  } catch (error) {
    return res.status(500).json({ error: true, success: false, message: error.message });
  }
};

// POST /api/settings/upload — admin, ek image (logo / favicon) → url
export const uploadSettingImage = async (req, res) => {
  const file = req.files?.[0];
  try {
    if (!file) return res.status(400).json({ error: true, success: false, message: "No image provided" });
    if (!/^image\/(png|jpe?g|webp|svg\+xml|x-icon|vnd\.microsoft\.icon)$/.test(file.mimetype)) {
      return res.status(400).json({ error: true, success: false, message: "Please upload PNG, JPG, WEBP, SVG or ICO" });
    }
    const result = await cloudinary.uploader.upload(file.path, { folder: "store" });
    return res.status(200).json({ error: false, success: true, url: result.secure_url });
  } catch (error) {
    return res.status(500).json({ error: true, success: false, message: error.message });
  } finally {
    if (file?.path) fs.unlink(file.path, () => {});
  }
};

// POST /api/settings/subscribe  { email } — public
export const subscribe = async (req, res) => {
  try {
    const email = str(req.body.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: true, success: false, message: "Please enter a valid email" });
    await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
    return res.status(200).json({ error: false, success: true, message: "Thanks for subscribing!" });
  } catch (error) {
    return res.status(500).json({ error: true, success: false, message: error.message });
  }
};

// GET /api/settings/subscribers — admin
export const getSubscribers = async (req, res) => {
  try {
    const list = await Subscriber.find().sort({ createdAt: -1 });
    return res.status(200).json({ error: false, success: true, data: list });
  } catch (error) {
    return res.status(500).json({ error: true, success: false, message: error.message });
  }
};
