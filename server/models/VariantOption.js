import mongoose from "mongoose";

// Common variant option (Size, RAM, Storage, Flavour, Colour, Shade…) + uske values.
// Product form inhi se options chunta hai; jo yahan nahi hai wo product form mein seedha bhi ban sakta hai.
const valueSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true },
    hex: { type: String, default: "" }, // swatch (colour) ke liye
  },
  { _id: false }
);

const variantOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    display: { type: String, enum: ["buttons", "swatch", "dropdown"], default: "buttons" },
    unit: { type: String, default: "" },
    values: { type: [valueSchema], default: [] },
    categoryIds: { type: [String], default: [] }, // khaali = sab categories
    allowCustom: { type: Boolean, default: true }, // product form mein naya value type kar sakte hain
    description: { type: String, default: "" },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("VariantOption", variantOptionSchema);
