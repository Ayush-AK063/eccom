import { logActivity } from "../utils/activity.js";
import { getSettings, computeCharges } from "../models/Setting.js";
import Order from "../models/Order.js";
import CartProduct from "../models/CartProduct.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { Category } from "../models/Category.js";
import { Review } from "../models/Review.js";
import { evaluateCoupon } from "../utils/coupons.js";
import { Coupon } from "../models/Coupon.js";
import { sendOrderEmail } from "../utils/orderEmails.js";
import { findVariant, hasVariantMatrix, priceFor, imageFor, selectionOf, legacyFields } from "../utils/variants.js";

// Cash on Delivery order — total, stock, address sab server par (client sirf addressId bhejta hai)
export const placeCodOrderController = async (req, res) => {
  const userId = req.userId;
  const decremented = []; // stock rollback ke liye

  try {
    const { addressId, couponCode } = req.body;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(400).json({ message: "Please select a valid delivery address", error: true, success: false });
    }

    const cartItems = await CartProduct.find({ userId }).populate("productId");
    const validItems = cartItems.filter((c) => c.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty", error: true, success: false });
    }

    // Har line ka variant dhoondo (variant matrix wale products)
    const lines = [];
    for (const item of validItems) {
      const p = item.productId;
      const sel = selectionOf(item, p);
      const v = hasVariantMatrix(p) ? findVariant(p, sel) : null;
      if (hasVariantMatrix(p) && !v) {
        return res.status(400).json({ message: `An option of "${p.name}" is no longer available. Please update your cart.`, error: true, success: false });
      }
      if (p.maxOrderQty > 0 && (item.quantity || 1) > p.maxOrderQty) {
        return res.status(400).json({ message: `Max ${p.maxOrderQty} per order for "${p.name}"`, error: true, success: false });
      }
      lines.push({ item, p, sel, v, qty: item.quantity || 1 });
    }

    // Store settings: minimum order, COD on/off + limits, product-wise COD
    const settings = await getSettings();
    const co = settings.checkout || {};
    const itemsTotal = lines.reduce((sum, l) => sum + priceFor(l.p, l.sel) * l.qty, 0);
    const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
    if (co.minOrderValue > 0 && itemsTotal < co.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value is ${fmt(co.minOrderValue)}`, error: true, success: false });
    }
    if (co.codEnabled === false) {
      return res.status(400).json({ message: "Cash on Delivery is not available right now", error: true, success: false });
    }
    if (co.codMinOrder > 0 && itemsTotal < co.codMinOrder) {
      return res.status(400).json({ message: `Cash on Delivery is available on orders above ${fmt(co.codMinOrder)}`, error: true, success: false });
    }
    if (co.codMaxOrder > 0 && itemsTotal > co.codMaxOrder) {
      return res.status(400).json({ message: `Cash on Delivery is available on orders up to ${fmt(co.codMaxOrder)}`, error: true, success: false });
    }
    const noCod = lines.find((l) => l.p.shipping?.codAvailable === false);
    if (noCod) {
      return res.status(400).json({ message: `"${noCod.p.name}" is not available for Cash on Delivery. Please remove it to continue.`, error: true, success: false });
    }

    // Coupon (optional) — dobara server pe check
    let coupon = null;
    if (couponCode) {
      const r = await evaluateCoupon(couponCode, itemsTotal, userId);
      if (!r.ok) return res.status(400).json({ message: r.message, error: true, success: false });
      coupon = r;
    }

    // Stock kam karo — atomic (variant ho to variant ka bhi). Fail ho to pichle wapas.
    // Same product ke kai variants → product level qty jodo
    const qtyByProduct = {};
    for (const l of lines) qtyByProduct[String(l.p._id)] = (qtyByProduct[String(l.p._id)] || 0) + l.qty;
    const rollback = async () => {
      for (const d of decremented) {
        const inc = { countInStock: d.qty };
        if (d.variantId) inc["variants.$[v].stock"] = d.qty;
        await Product.updateOne({ _id: d.productId }, { $inc: inc }, d.variantId ? { arrayFilters: [{ "v._id": d.variantId }] } : {}).catch(() => {});
      }
    };
    for (const l of lines.filter((x) => x.v)) {
      const updated = await Product.findOneAndUpdate(
        { _id: l.p._id, variants: { $elemMatch: { _id: l.v._id, stock: { $gte: l.qty } } } },
        { $inc: { "variants.$.stock": -l.qty, countInStock: -l.qty } },
        { new: true }
      );
      if (!updated) {
        await rollback();
        return res.status(400).json({ message: `Only ${l.v.stock || 0} left for "${l.p.name}" (${Object.values(l.sel).filter(Boolean).join(" / ")})`, error: true, success: false });
      }
      decremented.push({ productId: l.p._id, qty: l.qty, variantId: l.v._id });
      qtyByProduct[String(l.p._id)] -= l.qty;
    }
    for (const [productId, qty] of Object.entries(qtyByProduct)) {
      if (qty <= 0) continue;
      const updated = await Product.findOneAndUpdate(
        { _id: productId, countInStock: { $gte: qty } },
        { $inc: { countInStock: -qty } },
        { new: true }
      );
      if (!updated) {
        await rollback();
        const product = lines.find((l) => String(l.p._id) === productId)?.p;
        return res.status(400).json({
          message: `Only ${product?.countInStock || 0} left in stock for "${product?.name || "a product"}"`,
          error: true,
          success: false,
        });
      }
      decremented.push({ productId, qty });
    }

    const products = lines.map(({ p, sel, v, qty }) => {
      const price = priceFor(p, sel);
      return {
        productId: p._id,
        productTitle: p.name,
        image: imageFor(p, sel),
        brand: p.brand || "",
        price,
        quantity: qty,
        subTotal: price * qty,
        ...legacyFields(sel),
        options: sel,
        variantId: v?._id || null,
        sku: v?.sku || p.sku || "",
      };
    });
    const subTotal = products.reduce((sum, p) => sum + p.subTotal, 0);
    const couponDiscount = coupon ? Math.min(coupon.discount, subTotal) : 0;
    const { shipping: shippingCharge, codCharge, total: totalAmt } = computeCharges(settings, subTotal - couponDiscount, { cod: true });

    const order = await Order.create({
      userId,
      products,
      paymentMethod: "COD",
      paymentStatus: "CASH ON DELIVERY",
      deliveryAddressId: address._id,
      deliveryAddress: {
        name: address.name,
        mobile: address.mobile,
        pincode: address.pincode,
        flatHouse: address.flatHouse,
        areaStreet: address.areaStreet,
        landmark: address.landmark,
        townCity: address.townCity,
        state: address.state,
        country: address.country,
        addressType: address.addressType || "Home",
      },
      subTotal,
      couponCode: coupon ? coupon.coupon.code : "",
      couponDiscount,
      shippingCharge,
      codCharge,
      totalAmt,
      statusHistory: [{ status: "pending", at: new Date() }],
    });

    // Order ho gaya → cart khaali
    await CartProduct.deleteMany({ userId });
    if (coupon) await Coupon.updateOne({ _id: coupon.coupon._id }, { $inc: { usedCount: 1 } }).catch(() => {});
    sendOrderEmail(order, "placed");
    logActivity(userId, "order_placed", { orderId: order._id, total: order.totalAmt, items: order.products.length, coupon: order.couponCode }, req);

    return res.status(201).json({ message: "Order placed successfully", error: false, success: true, data: order });
  } catch (error) {
    for (const d of decremented) {
      const inc = { countInStock: d.qty };
      if (d.variantId) inc["variants.$[v].stock"] = d.qty;
      await Product.updateOne({ _id: d.productId }, { $inc: inc }, d.variantId ? { arrayFilters: [{ "v._id": d.variantId }] } : {}).catch(() => {});
    }
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// Login user ke apne orders (naye pehle)
export const getMyOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ error: false, success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// Cancel → stock + coupon use wapas
const restock = async (order) => {
  for (const item of order.products) {
    const qty = item.quantity || 1;
    const inc = { countInStock: qty };
    if (item.variantId) inc["variants.$[v].stock"] = qty;
    await Product.updateOne({ _id: item.productId }, { $inc: inc }, item.variantId ? { arrayFilters: [{ "v._id": item.variantId }] } : {}).catch(() => {});
  }
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }).catch(() => {});
};
const fail = (res, code, message) => res.status(code).json({ message, error: true, success: false });
const CUSTOMER_CANCEL = ["pending", "confirmed"];

// PUT /api/order/cancel/:id { reason } — customer apna order (ship hone se pehle)
export const cancelMyOrderController = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return fail(res, 404, "Order not found");
    if (!CUSTOMER_CANCEL.includes(order.orderStatus)) return fail(res, 400, order.orderStatus === "cancelled" ? "This order is already cancelled" : "This order has already shipped and can't be cancelled");
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: { $in: CUSTOMER_CANCEL } },
      { orderStatus: "cancelled", cancelledBy: "customer", cancelReason: String(req.body.reason || "").trim().slice(0, 300), $push: { statusHistory: { status: "cancelled", at: new Date() } } },
      { new: true }
    );
    if (!updated) return fail(res, 400, "This order can't be cancelled any more");
    await restock(order);
    sendOrderEmail(updated, "cancelled");
    logActivity(req.userId, "order_cancelled", { orderId: order._id, reason: updated.cancelReason }, req);
    return res.json({ error: false, success: true, message: "Order cancelled", data: updated });
  } catch (e) { return fail(res, 500, e.message); }
};

// Product-wise return window (days) — sabse lamba; koi bhi returnable nahi to 0
const returnWindow = async (order, settings) => {
  const products = await Product.find({ _id: { $in: order.products.map((p) => p.productId) } }).select("policy").lean();
  const days = order.products.map((it) => {
    const pol = products.find((p) => String(p._id) === String(it.productId))?.policy || {};
    if (pol.returnable === false || pol.returnType === "none") return 0;
    return pol.returnDays ?? settings.shipping?.defaultReturnDays ?? 7;
  });
  return Math.max(0, ...days);
};

// POST /api/order/return/:id { type, reason, comment } — customer, delivered ke baad
export const requestReturnController = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return fail(res, 404, "Order not found");
    if (order.orderStatus !== "delivered") return fail(res, 400, "Returns can be requested after delivery");
    if (order.returnRequest?.status) return fail(res, 400, "A return request already exists for this order");
    const reason = String(req.body.reason || "").trim().slice(0, 100);
    if (!reason) return fail(res, 400, "Please choose a reason");
    const days = await returnWindow(order, await getSettings());
    const deliveredAt = (order.statusHistory || []).filter((h) => h.status === "delivered").pop()?.at || order.updatedAt;
    if (!days) return fail(res, 400, "Items in this order are not returnable");
    if (Date.now() - new Date(deliveredAt) > days * 864e5) return fail(res, 400, `The ${days}-day return window for this order has closed`);
    order.returnRequest = {
      status: "requested", type: req.body.type === "replace" ? "replace" : "return", reason,
      comment: String(req.body.comment || "").trim().slice(0, 500), adminNote: "", requestedAt: new Date(), resolvedAt: null,
    };
    await order.save();
    sendOrderEmail(order, "return_requested");
    logActivity(req.userId, "return_requested", { orderId: order._id, type: order.returnRequest.type, reason }, req);
    return res.json({ error: false, success: true, message: "Return request sent", data: order });
  } catch (e) { return fail(res, 500, e.message); }
};

// ── Admin ──
// PUT /api/order/admin/:id { tracking?, adminNote?, returnStatus?, returnNote? }
export const adminUpdateOrderController = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return fail(res, 404, "Order not found");
    const b = req.body || {};
    const str = (v, n) => String(v ?? "").trim().slice(0, n);
    let emailType = null;
    if (b.tracking) {
      const before = order.tracking?.number;
      let url = str(b.tracking.url, 500);
      if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
      order.tracking = { courier: str(b.tracking.courier, 60), number: str(b.tracking.number, 60), url };
      if (order.tracking.number && order.tracking.number !== before && order.orderStatus === "shipped") emailType = "tracking";
    }
    if (b.adminNote !== undefined) order.adminNote = str(b.adminNote, 1000);
    if (b.returnStatus) {
      const flow = { requested: ["approved", "rejected"], approved: ["completed", "rejected"] };
      const cur = order.returnRequest?.status;
      if (!flow[cur]?.includes(b.returnStatus)) return fail(res, 400, cur ? `Return is already ${cur}` : "No return request on this order");
      order.returnRequest.status = b.returnStatus;
      order.returnRequest.adminNote = str(b.returnNote, 500);
      if (b.returnStatus !== "approved") order.returnRequest.resolvedAt = new Date();
      // Return complete → stock wapas
      if (b.returnStatus === "completed" && order.returnRequest.type === "return") await restock(order);
      emailType = "return_" + b.returnStatus;
    }
    await order.save();
    await order.populate("userId", "name email mobile");
    if (emailType) sendOrderEmail(order, emailType);
    return res.json({ error: false, success: true, message: "Order updated", data: order });
  } catch (e) { return fail(res, 500, e.message); }
};

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

// Saare orders (naye pehle) + customer ka naam / email
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email mobile");
    return res.status(200).json({ error: false, success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// Status badlo. Cancel = final, aur stock wapas.
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status", error: true, success: false });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found", error: true, success: false });
    }
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Cancelled order can't be changed", error: true, success: false });
    }
    // Sirf aage badho: pending → confirmed → shipped → delivered. Delivered ke baad cancel nahi.
    const FLOW = ["pending", "confirmed", "shipped", "delivered"];
    if (order.orderStatus === "delivered" && orderStatus !== "delivered") {
      return res.status(400).json({ message: "Delivered order can't be changed", error: true, success: false });
    }
    if (orderStatus !== "cancelled" && FLOW.indexOf(orderStatus) < FLOW.indexOf(order.orderStatus)) {
      return res.status(400).json({ message: `Order is already ${order.orderStatus}`, error: true, success: false });
    }
    if (order.orderStatus === orderStatus) {
      return res.status(200).json({ message: "Order status updated", error: false, success: true, data: order });
    }

    // Pehle status set karo (sirf tab jab abhi bhi cancelled nahi) → do baar stock wapas na ho
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: { $ne: "cancelled" } },
      { orderStatus, $push: { statusHistory: { status: orderStatus, at: new Date() } } },
      { new: true }
    ).populate("userId", "name email mobile");
    if (!updated) {
      return res.status(400).json({ message: "Cancelled order can't be changed", error: true, success: false });
    }

    if (orderStatus === "cancelled") {
      await restock(order);
      await Order.updateOne({ _id: order._id }, { cancelledBy: "admin", cancelReason: String(req.body.reason || "").slice(0, 300) });
    }
    sendOrderEmail(updated, orderStatus);

    return res.status(200).json({ message: "Order status updated", error: false, success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// Admin dashboard: ginti + saal ke har mahine ki sales / naye users (sirf numbers, koi user data nahi)
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const getDashboardStatsController = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const [totalUsers, totalOrders, totalProducts, totalCategories, totalReviews, salesAgg, monthlySalesAgg, monthlyUsersAgg] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Category.countDocuments(),
        Review.countDocuments(),
        Order.aggregate([
          { $match: { orderStatus: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$totalAmt" } } },
        ]),
        Order.aggregate([
          { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$totalAmt" } } },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        ]),
      ]);

    // Extra: is mahine vs pichla mahina, status breakdown, top products, low stock
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodAgg = (from, to) =>
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: from, $lt: to } } },
        { $group: { _id: null, sales: { $sum: "$totalAmt" }, orders: { $sum: 1 } } },
      ]);
    const [curAgg, prevAgg, curUsers, prevUsers, statusAgg, topAgg, lowStock, monthlyOrdersAgg] = await Promise.all([
      periodAgg(thisMonth, new Date(8640000000000000)),
      periodAgg(lastMonth, thisMonth),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } }),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            name: { $first: "$products.productTitle" },
            image: { $first: "$products.image" },
            brand: { $first: "$products.brand" },
            units: { $sum: "$products.quantity" },
            revenue: { $sum: "$products.subTotal" },
          },
        },
        { $sort: { units: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      Product.find({ countInStock: { $lte: 5 } })
        .select("name images brand countInStock price")
        .sort({ countInStock: 1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      ]),
    ]);
    const ordersByMonth = Object.fromEntries(monthlyOrdersAgg.map((m) => [m._id, m.count]));
    const statusCounts = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));

    const salesByMonth = Object.fromEntries(monthlySalesAgg.map((m) => [m._id, m.total]));
    const usersByMonth = Object.fromEntries(monthlyUsersAgg.map((m) => [m._id, m.count]));
    const monthly = MONTHS.map((name, i) => ({
      name,
      Total_Sales: salesByMonth[i + 1] || 0,
      Total_Users: usersByMonth[i + 1] || 0,
      Total_Orders: ordersByMonth[i + 1] || 0,
    }));

    return res.status(200).json({
      error: false,
      success: true,
      data: {
        year,
        totalUsers,
        totalOrders,
        totalProducts,
        totalCategories,
        totalReviews,
        totalSales: salesAgg[0]?.total || 0,
        monthly,
        thisMonth: { sales: curAgg[0]?.sales || 0, orders: curAgg[0]?.orders || 0, users: curUsers },
        lastMonth: { sales: prevAgg[0]?.sales || 0, orders: prevAgg[0]?.orders || 0, users: prevUsers },
        statusCounts,
        topProducts: topAgg,
        lowStock,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};
