import { Category } from "../models/Category.js";

// Store pe chhupi categories (isActive: false) + unke andar ki sab — ids (string). 60 sec cache.
let cache = null;
let at = 0;

export const hiddenCategoryIds = async () => {
  if (cache && Date.now() - at < 60000) return cache;
  const all = await Category.find().select("_id parentCatId isActive").lean();
  const kids = {};
  all.forEach((c) => { const p = c.parentCatId ? String(c.parentCatId) : ""; (kids[p] = kids[p] || []).push(String(c._id)); });
  const out = new Set();
  const add = (id) => { if (out.has(id)) return; out.add(id); (kids[id] || []).forEach(add); };
  all.filter((c) => c.isActive === false).forEach((c) => add(String(c._id)));
  cache = [...out];
  at = Date.now();
  return cache;
};

// Category badli (hide / show / delete / move) → agli query fresh list le
export const resetHiddenCategories = () => { cache = null; };

export const inHiddenCategory = async (p) => {
  const ids = await hiddenCategoryIds();
  if (!ids.length || !p) return false;
  return [p.catId?._id || p.catId, p.subCatId, p.thirdSubCatId].some((v) => v && ids.includes(String(v)));
};
