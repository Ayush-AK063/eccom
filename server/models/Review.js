import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
        userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
        // Review ke time ka naam/avatar (list dikhane ke liye har baar user fetch na karna pade)
        userName: { type: String, default: "" },
        image: { type: String, default: "" },
        review: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        // pending = admin approve kare tab dikhe, hidden = admin ne chhupaya
        status: { type: String, enum: ["approved", "pending", "hidden"], default: "approved" },
        reply: { type: String, default: "", trim: true },
        repliedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Ek user ek product par ek hi review (dobara submit = update)
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
