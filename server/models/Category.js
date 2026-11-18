import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
    },
    parentCatName: {
      type: String,
    },
    // Is category ke products mein kaunsi details bharni hain (template).
    // Sub-categories apne parent ke attributes bhi inherit karti hain.
    attributes: {
      type: [
        new mongoose.Schema(
          {
            key: { type: String, required: true },
            label: { type: String, required: true },
            type: { type: String, enum: ["text", "number", "select", "boolean", "textarea"], default: "text" },
            unit: { type: String, default: "" },
            options: { type: [String], default: [] },
            group: { type: String, default: "General" },
            required: { type: Boolean, default: false },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    sortOrder: { type: Number, default: 0 },
    // false = store pe kahin nahi dikhti (andar wali bhi)
    isActive: { type: Boolean, default: true },
    // false = menu bar mein nahi, baaki jagah dikhti hai
    showInMenu: { type: Boolean, default: true },
    parentCatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
