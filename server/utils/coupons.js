import Order from "../models/Order.js";
import { Coupon } from "../models/Coupon.js";

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// Coupon check + discount. Returns { ok, coupon, discount, message }
export const evaluateCoupon = async (rawCode, subTotal, userId) => {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { ok: false, message: "Please enter a coupon code" };
  const c = await Coupon.findOne({ code });
  const now = new Date();
  if (!c || !c.isActive) return { ok: false, message: "This coupon code is not valid" };
  if (c.startsAt && now < c.startsAt) return { ok: false, message: "This coupon is not active yet" };
  if (c.endsAt && now > c.endsAt) return { ok: false, message: "This coupon has expired" };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return { ok: false, message: "This coupon has reached its usage limit" };
  if (c.minOrder > 0 && subTotal < c.minOrder) return { ok: false, message: `Add ${inr(c.minOrder - subTotal)} more to use ${code} (min order ${inr(c.minOrder)})` };
  if (userId) {
    const live = { userId, orderStatus: { $ne: "cancelled" } };
    if (c.perUserLimit > 0 && (await Order.countDocuments({ ...live, couponCode: code })) >= c.perUserLimit)
      return { ok: false, message: "You have already used this coupon" };
    if (c.firstOrderOnly && (await Order.exists(live))) return { ok: false, message: "This coupon is for your first order only" };
  }
  let discount = c.type === "percent" ? (subTotal * c.value) / 100 : c.value;
  if (c.type === "percent" && c.maxDiscount > 0) discount = Math.min(discount, c.maxDiscount);
  discount = Math.round(Math.min(discount, subTotal));
  return { ok: true, coupon: c, discount, message: `${code} applied — you save ${inr(discount)}` };
};
