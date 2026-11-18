import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        images: [{ type: String, required: true }],
        excerpt: { type: String, default: "", trim: true, maxlength: 300 },
        author: { type: String, default: "", trim: true, maxlength: 80 },
        tags: { type: [String], default: [] },
        // draft = sirf admin ko dikhe
        status: { type: String, enum: ["published", "draft"], default: "published" },
    },
    { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);
