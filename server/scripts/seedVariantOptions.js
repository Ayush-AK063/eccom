// Common variant options jodo (jo pehle se hain unhe chhodo). Run: node scripts/seedVariantOptions.js
import "dotenv/config";
import mongoose from "mongoose";
import VariantOption from "../models/VariantOption.js";

const OPTIONS = [
  { name: "Storage", values: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], description: "Mobiles, tablets, laptops, pen drives" },
  { name: "Flavour", values: ["Chocolate", "Vanilla", "Strawberry", "Mango", "Cookies & Cream", "Coffee", "Unflavoured"], description: "Protein, supplements, food" },
  { name: "Shade", display: "swatch", values: [], description: "Lipstick, foundation, nail paint — add shades with their colour" },
  { name: "Pack of", values: ["1", "2", "3", "4", "5", "6", "10", "12"], description: "Multi-packs and combos" },
  { name: "Capacity", values: ["250ml", "500ml", "750ml", "1L", "1.5L", "2L", "5L"], description: "Bottles, appliances, bags (litres)" },
  { name: "Volume", values: ["30ml", "50ml", "100ml", "150ml", "200ml"], description: "Perfume, skincare, haircare" },
  { name: "Material", values: ["Cotton", "Linen", "Polyester", "Denim", "Leather", "Faux leather", "Silk", "Wool", "Metal", "Wood", "Plastic"] },
  { name: "Fit", values: ["Slim", "Regular", "Relaxed", "Oversized"], description: "Clothing" },
  { name: "Length", values: ["Short", "Regular", "Long"], description: "Clothing, cables (or 1m / 2m)" },
  { name: "Waist", values: ["28", "30", "32", "34", "36", "38", "40"], unit: "in", description: "Jeans, trousers" },
  { name: "Shoe size", values: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"], description: "Footwear" },
  { name: "Ring size", values: ["6", "7", "8", "9", "10", "11", "12", "13", "14"], description: "Rings (Indian size)" },
  { name: "Chain length", values: ['16"', '18"', '20"', '22"', '24"'], description: "Necklaces, chains" },
  { name: "Metal", values: ["Gold", "Rose gold", "Silver", "Platinum", "Oxidised"], description: "Jewellery" },
  { name: "Purity", values: ["14K", "18K", "22K", "925 Silver"], description: "Gold / silver jewellery" },
  { name: "Strap", values: ["Leather", "Metal", "Silicone", "Nylon", "Mesh"], description: "Watches, bags" },
  { name: "Case size", values: ["38mm", "40mm", "42mm", "44mm", "46mm"], description: "Watches" },
  { name: "Frame size", values: ["Small", "Medium", "Large"], description: "Eyewear" },
  { name: "Lens", values: ["Polarized", "Non-polarized", "Blue-light", "Photochromic"], description: "Eyewear" },
  { name: "Screen size", values: ['24"', '27"', '32"', '43"', '50"', '55"', '65"'], description: "TVs, monitors" },
  { name: "Processor", values: ["Intel i3", "Intel i5", "Intel i7", "Ryzen 5", "Ryzen 7", "Apple M3"], description: "Laptops", display: "dropdown" },
  { name: "Connectivity", values: ["Wi-Fi", "Wi-Fi + Cellular", "Bluetooth", "Wired"], description: "Tablets, headphones" },
  { name: "Compatible model", values: [], display: "dropdown", description: "Phone cases, chargers, parts — add models" },
  { name: "Plug type", values: ["Type C (India)", "Type D (India)", "USB-C", "Lightning"] },
  { name: "Power", values: ["500W", "750W", "1000W", "1500W", "2000W"], description: "Appliances" },
  { name: "Scale", values: ["1/4", "1/6", "1/7", "1/8", "1/10", "1/12", "Non-scale"], description: "Anime figures, models" },
  { name: "Edition", values: ["Standard", "Deluxe", "Limited", "Collector's"], description: "Figures, books, games" },
  { name: "Format", values: ["Paperback", "Hardcover", "Box set"], description: "Books" },
  { name: "Language", values: ["English", "Hindi", "Tamil", "Telugu", "Marathi", "Bengali"], description: "Books" },
  { name: "Age", values: ["0-6 months", "6-12 months", "1-2 years", "2-4 years", "4-6 years", "6-8 years", "8+ years"], description: "Baby / kids clothing, toys" },
  { name: "Bed size", values: ["Single", "Double", "Queen", "King"], description: "Bedsheets, mattresses, beds" },
  { name: "Seater", values: ["1", "2", "3", "4", "5", "6"], unit: "seater", description: "Sofas, dining sets" },
  { name: "Finish", values: ["Natural", "Walnut", "Teak", "White", "Black", "Matte", "Glossy"], description: "Furniture, decor" },
  { name: "Fragrance", values: ["Lavender", "Rose", "Jasmine", "Citrus", "Sandalwood", "Oud", "Fresh"], description: "Candles, perfumes, soaps" },
  { name: "Skin type", values: ["All", "Dry", "Oily", "Combination", "Sensitive"], description: "Skincare" },
  { name: "Life stage", values: ["Puppy", "Adult", "Senior", "Kitten"], description: "Pet food" },
  { name: "Plan", values: ["Monthly", "Quarterly", "Yearly"], description: "Subscriptions, digital" },
  { name: "Gift wrap", values: ["No", "Yes"], description: "Any product" },
];

await mongoose.connect(process.env.MONGO_URI);
const last = await VariantOption.findOne().sort({ position: -1 });
let pos = (last?.position || 0) + 1, added = 0;
for (const o of OPTIONS) {
  if (await VariantOption.findOne({ name: new RegExp(`^${o.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") })) continue;
  await VariantOption.create({ display: "buttons", unit: "", description: "", ...o, values: o.values.map((value) => ({ value })), position: pos++ });
  added++;
}
console.log(`added ${added} options (${OPTIONS.length - added} already existed)`);
await mongoose.disconnect();
