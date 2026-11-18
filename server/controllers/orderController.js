import Order from "../models/Order.js";
import CartProduct from "../models/CartProduct.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import { Category } from "../models/Category.js";
import { Review } from "../models/Review.js";

// Cash on Delivery order — total, stock, address sab server par (client sirf addressId bhejta hai)
export const placeCodOrderController = async (req, res) => {
  const userId = req.userId;
  const decremented = []; // stock rollback ke liye

  try {
    const { addressId } = req.body;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(400).json({ message: "Please select a valid delivery address", error: true, success: false });
    }

    const cartItems = await CartProduct.find({ userId }).populate("productId");
    const validItems = cartItems.filter((c) => c.productId);
    if (validItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty", error: true, success: false });
    }

    // Ek product alag variants mein ho sakta hai → stock ke liye total qty jodo
    const qtyByProduct = {};
    for (const item of validItems) {
      const id = String(item.productId._id);
      qtyByProduct[id] = (qtyByProduct[id] || 0) + (item.quantity || 1);
    }

    // Stock kam karo — sirf tab jab utna stock ho (atomic). Fail ho to pichle wapas.
    for (const [productId, qty] of Object.entries(qtyByProduct)) {
      const updated = await Product.findOneAndUpdate(
        { _id: productId, countInStock: { $gte: qty } },
        { $inc: { countInStock: -qty } },
        { new: true }
      );
      if (!updated) {
        for (const d of decremented) {
          await Product.updateOne({ _id: d.productId }, { $inc: { countInStock: d.qty } });
        }
        const product = validItems.find((c) => String(c.productId._id) === productId)?.productId;
        return res.status(400).json({
          message: `Only ${product?.countInStock || 0} left in stock for "${product?.name || "a product"}"`,
          error: true,
          success: false,
        });
      }
      decremented.push({ productId, qty });
    }

    const products = validItems.map((item) => {
      const p = item.productId;
      const quantity = item.quantity || 1;
      return {
        productId: p._id,
        productTitle: p.name,
        image: p.images?.[0] || "",
        brand: p.brand || "",
        price: p.price || 0,
        quantity,
        subTotal: (p.price || 0) * quantity,
        size: item.size || "",
        productRam: item.productRam || "",
        productWeight: item.productWeight || "",
      };
    });
    const totalAmt = products.reduce((sum, p) => sum + p.subTotal, 0);

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
      totalAmt,
    });

    // Order ho gaya → cart khaali
    await CartProduct.deleteMany({ userId });

    return res.status(201).json({ message: "Order placed successfully", error: false, success: true, data: order });
  } catch (error) {
    for (const d of decremented) {
      await Product.updateOne({ _id: d.productId }, { $inc: { countInStock: d.qty } }).catch(() => {});
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

// ── Admin ──
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
    if (order.orderStatus === orderStatus) {
      return res.status(200).json({ message: "Order status updated", error: false, success: true, data: order });
    }

    // Pehle status set karo (sirf tab jab abhi bhi cancelled nahi) → do baar stock wapas na ho
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: { $ne: "cancelled" } },
      { orderStatus },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ message: "Cancelled order can't be changed", error: true, success: false });
    }

    if (orderStatus === "cancelled") {
      for (const item of order.products) {
        await Product.updateOne({ _id: item.productId }, { $inc: { countInStock: item.quantity || 1 } });
      }
    }

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

    const salesByMonth = Object.fromEntries(monthlySalesAgg.map((m) => [m._id, m.total]));
    const usersByMonth = Object.fromEntries(monthlyUsersAgg.map((m) => [m._id, m.count]));
    const monthly = MONTHS.map((name, i) => ({
      name,
      Total_Sales: salesByMonth[i + 1] || 0,
      Total_Users: usersByMonth[i + 1] || 0,
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
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};
