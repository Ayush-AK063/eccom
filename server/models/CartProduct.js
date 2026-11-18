import mongoose from "mongoose";

const CartProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    // Chuna gaya variant (product mein option na ho to "")
    size: { type: String, default: "" },
    productRam: { type: String, default: "" },
    productWeight: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CartProduct", CartProductSchema);
