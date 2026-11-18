import mongoose from "mongoose";

// Ek order = cart ke saare items. Product / address ki copy save hoti hai,
// taaki baad mein product ya address badle / delete ho to bhi order sahi dikhe.
const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
    productTitle: { type: String, default: "" },
    image: { type: String, default: "" },
    brand: { type: String, default: "" },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    subTotal: { type: Number, default: 0 },
    size: { type: String, default: "" },
    productRam: { type: String, default: "" },
    productWeight: { type: String, default: "" },
    color: { type: String, default: "" },
    options: { type: mongoose.Schema.Types.Mixed, default: {} },
    variantId: { type: mongoose.Schema.ObjectId, default: null },
    sku: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    products: { type: [OrderItemSchema], default: [] },
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    paymentId: { type: String, default: "" },
    paymentStatus: { type: String, default: "CASH ON DELIVERY" },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    deliveryAddressId: { type: mongoose.Schema.ObjectId, ref: "Address" },
    deliveryAddress: {
      name: String,
      mobile: String,
      pincode: String,
      flatHouse: String,
      areaStreet: String,
      landmark: String,
      townCity: String,
      state: String,
      country: String,
      addressType: String,
    },
    subTotal: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    codCharge: { type: Number, default: 0 },
    totalAmt: { type: Number, default: 0 },
    // Status kab kab badla (admin timeline)
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    // Courier tracking (admin)
    tracking: {
      courier: { type: String, default: "" },
      number: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    adminNote: { type: String, default: "" }, // sirf admin ko dikhta
    cancelledBy: { type: String, default: "" }, // "customer" | "admin"
    cancelReason: { type: String, default: "" },
    // Return / replacement request (delivered ke baad)
    returnRequest: {
      status: { type: String, enum: ["", "requested", "approved", "rejected", "completed"], default: "" },
      type: { type: String, default: "return" }, // return | replace
      reason: { type: String, default: "" },
      comment: { type: String, default: "" },
      adminNote: { type: String, default: "" },
      requestedAt: { type: Date, default: null },
      resolvedAt: { type: Date, default: null },
    },
    statusHistory: {
      type: [{ status: String, at: { type: Date, default: Date.now }, _id: false }],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
