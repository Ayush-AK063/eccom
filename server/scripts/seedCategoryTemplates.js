// Demo categories par ready-made "product details" template lagao (sirf jinka template khaali hai).
// Run: node scripts/seedCategoryTemplates.js
import "dotenv/config";
import { PRESETS } from "../../admin/src/Pages/Category/templates/presets.js";

const API = process.env.API_URL || "http://localhost:8000";
const MAP = { Bags: "bags", Sunglasses: "eyewear", Watches: "watches", Footwear: "footwear", Jewellery: "jewellery", Fitness: "supplements" };
const keyOf = (l) => l.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const login = await fetch(`${API}/api/user/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, adminLogin: true }),
}).then((r) => r.json());
const token = login?.data?.accessToken;
if (!token) throw new Error("Admin login failed");

const cats = (await fetch(`${API}/api/category`).then((r) => r.json())).data || [];
for (const c of cats) {
  const preset = PRESETS[MAP[c.name]];
  if (!preset) continue;
  if ((c.attributes || []).length) { console.log(`skip ${c.name} (already has ${c.attributes.length})`); continue; }
  const attributes = preset.attributes.map((a) => ({ ...a, key: keyOf(a.label) }));
  const res = await fetch(`${API}/api/category/${c._id}/attributes`, {
    method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ attributes }),
  }).then((r) => r.json());
  console.log(`${c.name} → ${preset.label}: ${res.success ? attributes.length + " fields" : res.message}`);
}
