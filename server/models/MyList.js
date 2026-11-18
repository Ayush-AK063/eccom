import mongoose from "mongoose";

const MyListSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MyList", MyListSchema);
