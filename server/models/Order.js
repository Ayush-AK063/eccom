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
    totalAmt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
