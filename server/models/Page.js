import mongoose from "mongoose";

// Store ke info / policy pages (About, Terms, Returns...) — admin likhta hai, store /page/:slug
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, default: "" },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
    footerGroup: { type: String, enum: ["none", "help", "company", "legal"], default: "none" },
    sortOrder: { type: Number, default: 0 },
    metaDescription: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true }
);

export const Page = mongoose.model("Page", pageSchema);
