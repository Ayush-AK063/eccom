import MyList from "../models/MyList.js";
import CartProduct from "../models/CartProduct.js";
import Order from "../models/Order.js";
import { SearchLog } from "../models/SearchLog.js";

const productLookup = (field) => [
  { $lookup: { from: "products", localField: field, foreignField: "_id", as: "p" } },
  { $unwind: "$p" },
];

// GET /api/insights?days=30&idleHours=24 — admin
export const getInsights = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const idleHours = Math.min(Math.max(parseInt(req.query.idleHours) || 24, 1), 24 * 60);
    const since = new Date(Date.now() - days * 864e5);
    const idleBefore = new Date(Date.now() - idleHours * 36e5);

    const [wishlist, inCarts, carts, searches, noResults, searchTotals, ordersSince] = await Promise.all([
      // Sabse zyada wishlist (productId string hai → ObjectId)
      MyList.aggregate([
        { $group: { _id: "$productId", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
        { $addFields: { pid: { $convert: { input: "$_id", to: "objectId", onError: null, onNull: null } } } },
        ...productLookup("pid"),
        { $sort: { count: -1, last: -1 } }, { $limit: 15 },
        { $project: { count: 1, name: "$p.name", image: { $arrayElemAt: ["$p.images", 0] }, price: "$p.price", stock: "$p.countInStock", productId: "$pid" } },
      ]),
      // Sabse zyada carts mein
      CartProduct.aggregate([
        { $group: { _id: "$productId", qty: { $sum: "$quantity" }, users: { $addToSet: "$userId" } } },
        ...productLookup("_id"),
        { $project: { qty: 1, users: { $size: "$users" }, name: "$p.name", image: { $arrayElemAt: ["$p.images", 0] }, price: "$p.price", stock: "$p.countInStock", productId: "$_id" } },
        { $sort: { users: -1, qty: -1 } }, { $limit: 15 },
      ]),
      // Adhoore carts: user ka cart jo idleHours se nahi chhua (order karte hi cart khaali hota hai)
      CartProduct.aggregate([
        ...productLookup("productId"),
        { $group: {
          _id: "$userId", items: { $sum: "$quantity" }, lines: { $sum: 1 },
          value: { $sum: { $multiply: ["$quantity", "$p.price"] } }, last: { $max: "$updatedAt" },
          products: { $push: { name: "$p.name", image: { $arrayElemAt: ["$p.images", 0] }, qty: "$quantity" } },
        } },
        { $match: { last: { $lt: idleBefore } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
        { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
        { $project: { items: 1, lines: 1, value: 1, last: 1, products: { $slice: ["$products", 4] }, userId: "$_id", name: "$u.name", email: "$u.email", mobile: "$u.mobile" } },
        { $sort: { value: -1 } }, { $limit: 100 },
      ]),
      SearchLog.find({ lastAt: { $gte: since } }).sort({ count: -1 }).limit(20).lean(),
      SearchLog.find({ lastAt: { $gte: since }, results: 0 }).sort({ count: -1 }).limit(20).lean(),
      SearchLog.aggregate([{ $match: { lastAt: { $gte: since } } }, { $group: { _id: null, terms: { $sum: 1 }, searches: { $sum: "$count" } } }]),
      Order.countDocuments({ createdAt: { $gte: since } }),
    ]);

    const abandonedValue = carts.reduce((s, c) => s + (c.value || 0), 0);
    return res.json({
      error: false, success: true,
      data: {
        days, idleHours,
        summary: {
          abandonedCarts: carts.length, abandonedValue,
          wishlistedProducts: wishlist.length,
          searches: searchTotals[0]?.searches || 0, searchTerms: searchTotals[0]?.terms || 0,
          noResultTerms: noResults.length, ordersSince,
        },
        wishlist, inCarts, carts, searches, noResults,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: true, success: false, message: e.message });
  }
};
