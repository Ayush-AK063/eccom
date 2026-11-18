import mongoose from "mongoose";
import { Coupon } from "../models/Coupon.js";
import { evaluateCoupon } from "../utils/coupons.js";

const fail = (res, code, message) => res.status(code).json({ error: true, success: false, message });
const num = (v, min = 0, max = 1e7) => Math.min(max, Math.max(min, Number(v) || 0));
const date = (v) => (v && !isNaN(new Date(v)) ? new Date(v) : null);
const clean = (b = {}) => {
  const type = b.type === "flat" ? "flat" : "percent";
  return {
    code: String(b.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30),
    description: String(b.description || "").trim().slice(0, 200),
    type,
    value: type === "percent" ? num(b.value, 0, 100) : num(b.value),
    maxDiscount: num(b.maxDiscount),
    minOrder: num(b.minOrder),
    startsAt: date(b.startsAt),
    endsAt: date(b.endsAt),
    usageLimit: Math.round(num(b.usageLimit, 0, 1e6)),
    perUserLimit: Math.round(num(b.perUserLimit, 0, 1000)),
    isActive: b.isActive !== false,
    firstOrderOnly: b.firstOrderOnly === true,
  };
};
const validate = (d) => {
  if (d.code.length < 3) return "Code must be at least 3 letters / numbers";
  if (!(d.value > 0)) return "Discount value must be more than 0";
  if (d.startsAt && d.endsAt && d.endsAt <= d.startsAt) return "End date must be after the start date";
  return null;
};

// POST /api/coupon/apply { code, subTotal } — logged-in customer (cart / checkout preview)
export const applyCoupon = async (req, res) => {
  try {
    const r = await evaluateCoupon(req.body.code, Number(req.body.subTotal) || 0, req.userId);
    if (!r.ok) return fail(res, 400, r.message);
    return res.json({ error: false, success: true, message: r.message, data: { code: r.coupon.code, discount: r.discount, description: r.coupon.description } });
  } catch (e) { return fail(res, 500, e.message); }
};

// ── Admin ──
export const listCoupons = async (req, res) => {
  try { return res.json({ error: false, success: true, data: await Coupon.find().sort({ createdAt: -1 }) }); }
  catch (e) { return fail(res, 500, e.message); }
};
export const createCoupon = async (req, res) => {
  try {
    const d = clean(req.body); const err = validate(d);
    if (err) return fail(res, 400, err);
    if (await Coupon.exists({ code: d.code })) return fail(res, 400, `Coupon ${d.code} already exists`);
    return res.status(201).json({ error: false, success: true, message: "Coupon created", data: await Coupon.create(d) });
  } catch (e) { return fail(res, 500, e.message); }
};
export const updateCoupon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, "Coupon not found");
    const d = clean(req.body); const err = validate(d);
    if (err) return fail(res, 400, err);
    if (await Coupon.exists({ code: d.code, _id: { $ne: req.params.id } })) return fail(res, 400, `Coupon ${d.code} already exists`);
    const c = await Coupon.findByIdAndUpdate(req.params.id, d, { new: true });
    if (!c) return fail(res, 404, "Coupon not found");
    return res.json({ error: false, success: true, message: "Coupon saved", data: c });
  } catch (e) { return fail(res, 500, e.message); }
};
export const deleteCoupon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, "Coupon not found");
    await Coupon.findByIdAndDelete(req.params.id);
    return res.json({ error: false, success: true, message: "Coupon deleted" });
  } catch (e) { return fail(res, 500, e.message); }
};
