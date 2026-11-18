// Store settings mein shuruaati defaults (sirf khaali fields bharta hai). Chalao: node scripts/seedSettings.js
import "dotenv/config";
import mongoose from "mongoose";
import { Setting, getSettings } from "../models/Setting.js";
import { Category } from "../models/Category.js";

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const s = await getSettings();
const set = {};
if (!s.footer?.features?.length) set["footer.features"] = [
  { icon: "truck", title: "Fast Delivery", text: "Across India" },
  { icon: "return", title: "Easy Returns", text: "On eligible products" },
  { icon: "cash", title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: "support", title: "Customer Support", text: "We're here to help" },
];
if (!s.footer?.newsletterText) set["footer.newsletterText"] = "Subscribe to get news about new arrivals and special discounts.";
if (!s.header?.topStripText) set["header.topStripText"] = "Get up to 50% off new season styles, limited time only";
// Pehle code mein likhe 5 collections → DB (category naam se id)
if (!s.home?.collections) {
  const OLD = [
    { title: "Everyday Carry", tag: "Bags", text: "Totes, backpacks & handbags for every day", category: "Bags", image: "/collections/everyday.webp" },
    { title: "Summer Shades", tag: "Sunglasses", text: "UV-protected frames", category: "Sunglasses", image: "/collections/shades.webp" },
    { title: "Statement Jewellery", tag: "Jewellery", text: "Earrings that stand out", category: "Jewellery", image: "/collections/jewellery.webp" },
    { title: "Step Out in Style", tag: "Footwear", text: "Heels, sneakers & slides", category: "Footwear", image: "/collections/footwear.webp" },
    { title: "Timeless Watches", tag: "Watches", text: "Classic everyday timepieces", category: "Watches", image: "/collections/watches.webp" },
  ];
  const roots = await Category.find({ parentCatId: null });
  set["home.collections"] = OLD.map(({ category, ...c }) => {
    const cat = roots.find((r) => r.name.toLowerCase() === category.toLowerCase());
    return cat ? { ...c, catId: String(cat._id), link: "" } : null;
  }).filter(Boolean);
}
if (Object.keys(set).length) await Setting.updateOne({ key: "store" }, { $set: set });
console.log("Settings seeded:", Object.keys(set));
await mongoose.disconnect();
