import VariantOption from "../models/VariantOption.js";
import Product from "../models/Product.js";

const clean = (b = {}) => {
  const seen = new Set();
  const values = (Array.isArray(b.values) ? b.values : [])
    .map((v) => ({ value: String(v?.value ?? v ?? "").trim().slice(0, 60), hex: /^#[0-9a-f]{6}$/i.test(v?.hex || "") ? v.hex : "" }))
    .filter((v) => v.value && !seen.has(v.value.toLowerCase()) && seen.add(v.value.toLowerCase()))
    .slice(0, 200);
  return {
    name: String(b.name || "").trim().slice(0, 40),
    display: ["buttons", "swatch", "dropdown"].includes(b.display) ? b.display : "buttons",
    unit: String(b.unit || "").trim().slice(0, 12),
    values,
    categoryIds: (Array.isArray(b.categoryIds) ? b.categoryIds : []).map(String).slice(0, 100),
    allowCustom: b.allowCustom !== false,
    description: String(b.description || "").trim().slice(0, 300),
    position: Number(b.position) || 0,
  };
};

const fail = (res, error, code = 500) =>
  res.status(code).json({ message: error?.code === 11000 ? "An option with this name already exists" : error?.message || error, error: true, success: false });

// GET /api/variantOption  (?withUsage=1 → kitne products use karte hain)
export const getVariantOptions = async (req, res) => {
  try {
    const list = await VariantOption.find().sort({ position: 1, name: 1 }).lean();
    if (req.query.withUsage === "1") {
      const usage = await Product.aggregate([
        { $unwind: "$variantOptions" },
        { $group: { _id: { $toLower: "$variantOptions.name" }, count: { $sum: 1 } } },
      ]);
      const map = Object.fromEntries(usage.map((u) => [u._id, u.count]));
      list.forEach((o) => { o.usage = map[o.name.toLowerCase()] || 0; });
    }
    return res.json({ data: list, success: true, error: false });
  } catch (e) { return fail(res, e); }
};

export const createVariantOption = async (req, res) => {
  try {
    const data = clean(req.body);
    if (!data.name) return fail(res, "Option name is required", 400);
    const last = await VariantOption.findOne().sort({ position: -1 });
    const doc = await VariantOption.create({ ...data, position: (last?.position || 0) + 1 });
    return res.status(201).json({ data: doc, message: "Option created", success: true, error: false });
  } catch (e) { return fail(res, e, e?.code === 11000 ? 400 : 500); }
};

export const updateVariantOption = async (req, res) => {
  try {
    const data = clean(req.body);
    if (!data.name) return fail(res, "Option name is required", 400);
    const old = await VariantOption.findById(req.params.id);
    if (!old) return fail(res, "Option not found", 404);
    delete data.position;
    const doc = await VariantOption.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    // Naam badla → products mein bhi naam badlo (option + variants)
    if (old.name !== doc.name) {
      const products = await Product.find({ "variantOptions.name": old.name }).setOptions({ includeHidden: true });
      for (const p of products) {
        p.variantOptions.forEach((g) => { if (g.name === old.name) g.name = doc.name; });
        p.variants.forEach((v) => {
          if (v.options && old.name in v.options) { v.options = { ...v.options, [doc.name]: v.options[old.name] }; delete v.options[old.name]; v.markModified("options"); }
        });
        await p.save();
      }
    }
    return res.json({ data: doc, message: "Option saved", success: true, error: false });
  } catch (e) { return fail(res, e, e?.code === 11000 ? 400 : 500); }
};

export const reorderVariantOptions = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    await Promise.all(ids.map((id, i) => VariantOption.updateOne({ _id: id }, { position: i + 1 })));
    return res.json({ message: "Order saved", success: true, error: false });
  } catch (e) { return fail(res, e); }
};

// Products jo use karte hain unka option nahi hatta (unke paas apni copy hai)
export const deleteVariantOption = async (req, res) => {
  try {
    const doc = await VariantOption.findByIdAndDelete(req.params.id);
    if (!doc) return fail(res, "Option not found", 404);
    return res.json({ message: "Option deleted", success: true, error: false });
  } catch (e) { return fail(res, e); }
};
