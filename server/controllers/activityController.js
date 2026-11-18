import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { logActivity } from "../utils/activity.js";

const fail = (res, code, message) => res.status(code).json({ error: true, success: false, message });

// POST /api/activity/view { productId } — logged-in customer ne product page khola (30 min mein ek baar)
export const logProductView = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!mongoose.isValidObjectId(productId)) return res.json({ error: false, success: true });
    const recent = await Activity.exists({ userId: req.userId, type: "product_view", "meta.productId": String(productId), createdAt: { $gte: new Date(Date.now() - 30 * 6e4) } });
    if (!recent) {
      const p = await Product.findById(productId).select("name").lean();
      if (p) logActivity(req.userId, "product_view", { productId: String(productId), name: p.name }, req);
    }
    return res.json({ error: false, success: true });
  } catch (e) { return fail(res, 500, e.message); }
};

// GET /api/activity?userId=&type=&before=&limit= — admin feed (naye pehle)
export const listActivity = async (req, res) => {
  try {
    const q = {};
    if (req.query.userId && mongoose.isValidObjectId(req.query.userId)) q.userId = req.query.userId;
    if (req.query.type) q.type = { $in: String(req.query.type).split(",") };
    if (req.query.before && !isNaN(new Date(req.query.before))) q.createdAt = { $lt: new Date(req.query.before) };
    if (req.query.after && !isNaN(new Date(req.query.after))) q.createdAt = { ...(q.createdAt || {}), $gt: new Date(req.query.after) };
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const data = await Activity.find(q).sort({ createdAt: -1 }).limit(limit).populate("userId", "name email avatar").lean();
    return res.json({ error: false, success: true, data });
  } catch (e) { return fail(res, 500, e.message); }
};

// GET /api/activity/summary — aaj ka haal
export const activitySummary = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const since15 = new Date(Date.now() - 15 * 6e4);
    const [signups, logins, active, onlineNow, orders, byType] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: start } }),
      Activity.countDocuments({ type: "login", createdAt: { $gte: start } }),
      Activity.distinct("userId", { createdAt: { $gte: start } }),
      Activity.distinct("userId", { createdAt: { $gte: since15 } }),
      Order.countDocuments({ createdAt: { $gte: start } }),
      Activity.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: "$type", n: { $sum: 1 } } }]),
    ]);
    return res.json({ error: false, success: true, data: {
      signups, logins, activeUsers: active.length, onlineNow: onlineNow.length, orders,
      byType: Object.fromEntries(byType.map((x) => [x._id, x.n])),
    } });
  } catch (e) { return fail(res, 500, e.message); }
};
