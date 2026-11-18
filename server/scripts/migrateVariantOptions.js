// Ek baar: purane Size / RAM / Weight collections → VariantOption (+ Colour),
// products / cart items / orders mein `options` bharo. Kuch delete nahi hota.
// Run: node scripts/migrateVariantOptions.js
import "dotenv/config";
import mongoose from "mongoose";
import VariantOption from "../models/VariantOption.js";
import Product from "../models/Product.js";
import CartProduct from "../models/CartProduct.js";
import Order from "../models/Order.js";
import { VARIANT_FIELDS } from "../utils/variants.js";

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL);
const db = mongoose.connection.db;

const COLOURS = { Black: "#111111", White: "#ffffff", Grey: "#9ca3af", Navy: "#1e3a8a", Blue: "#2563eb", Red: "#dc2626", Maroon: "#7f1d1d", Green: "#16a34a", Olive: "#4d7c0f", Beige: "#e7d8c1", Brown: "#7c4a2d", Pink: "#ec4899", Yellow: "#facc15", Purple: "#7c3aed", Silver: "#c0c0c0", Gold: "#d4af37" };

const fromCollection = async (coll) => (await db.collection(coll).find().toArray()).map((d) => d.name).filter(Boolean);
const seeds = [
  { name: "Size", display: "buttons", values: await fromCollection("productsizes"), description: "Clothing, footwear, rings, bags…" },
  { name: "Colour", display: "swatch", values: Object.keys(COLOURS), hex: COLOURS, description: "Shown as colour circles on the store" },
  { name: "RAM", display: "buttons", unit: "", values: await fromCollection("productrams"), description: "Mobiles, laptops, tablets" },
  { name: "Weight", display: "buttons", values: await fromCollection("productweights"), description: "Supplements, grocery, dumbbells…" },
];
let pos = 1;
for (const s of seeds) {
  const exists = await VariantOption.findOne({ name: s.name });
  if (exists) { console.log(`option ${s.name}: exists`); pos++; continue; }
  await VariantOption.create({ name: s.name, display: s.display, unit: s.unit || "", description: s.description, position: pos++, values: s.values.map((v) => ({ value: v, hex: s.hex?.[v] || "" })) });
  console.log(`option ${s.name}: created (${s.values.length} values)`);
}

// Products: save() → syncFromVariants purane arrays / variants ko options mein badal deta hai
let n = 0;
for (const p of await Product.find().setOptions({ includeHidden: true })) {
  const before = JSON.stringify(p.variantOptions);
  p.syncFromVariants();
  if (JSON.stringify(p.variantOptions) !== before || p.variants.length) { p.markModified("variants"); await p.save(); n++; }
}
console.log(`products updated: ${n}`);

const toOptions = (item) => {
  const o = {};
  for (const [k, name] of VARIANT_FIELDS) if (item[k]) o[name] = item[k];
  return o;
};
let c = 0;
for (const item of await CartProduct.find()) {
  if (item.options && Object.keys(item.options).length) continue;
  const o = toOptions(item);
  if (!Object.keys(o).length) continue;
  item.options = o; item.markModified("options"); await item.save(); c++;
}
console.log(`cart items updated: ${c}`);

let o = 0;
for (const order of await Order.find()) {
  let changed = false;
  order.products.forEach((line) => {
    if (line.options && Object.keys(line.options).length) return;
    const opts = toOptions(line);
    if (Object.keys(opts).length) { line.options = opts; changed = true; }
  });
  if (changed) { order.markModified("products"); await order.save(); o++; }
}
console.log(`orders updated: ${o}`);
// Products jo values use karte hain wo master options mein bhi ho
const used = {};
for (const p of await Product.find().setOptions({ includeHidden: true }).lean())
  for (const g of p.variantOptions || []) { used[g.name] ||= new Set(); g.values.forEach((v) => used[g.name].add(v)); }
for (const [name, set] of Object.entries(used)) {
  const opt = await VariantOption.findOne({ name });
  if (!opt) continue;
  const have = new Set(opt.values.map((v) => v.value));
  const add = [...set].filter((v) => !have.has(v));
  if (add.length) { opt.values.push(...add.map((value) => ({ value }))); await opt.save(); }
  console.log(`option ${name}: +${add.length} values from products`);
}

await mongoose.disconnect();
