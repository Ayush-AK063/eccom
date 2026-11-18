import { logActivity } from "../utils/activity.js";
import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { getSettings } from "../models/Setting.js";

// Product ki average rating dobara calculate karke Product.rating mein save karo
const updateProductRating = async (productId) => {
    const [stats] = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId), status: { $nin: ["pending", "hidden"] } } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const avg = stats ? Math.round(stats.avg * 10) / 10 : 0;
    await Product.findByIdAndUpdate(productId, { rating: avg });
    return avg;
};

export const addReview = async (req, res) => {
    try {
        const { productId, review, rating } = req.body;
        const numRating = Number(rating);

        if (!productId || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ error: true, success: false, message: "Valid product ID is required" });
        }
        if (!review || review.trim() === "") {
            return res.status(400).json({ error: true, success: false, message: "Please write a review" });
        }
        if (!numRating || numRating < 1 || numRating > 5) {
            return res.status(400).json({ error: true, success: false, message: "Rating must be between 1 and 5" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: true, success: false, message: "Product not found" });
        }

        const user = await User.findById(req.userId).select("name avatar");
        if (!user) {
            return res.status(401).json({ error: true, success: false, message: "User not found" });
        }

        const saved = await Review.findOneAndUpdate(
            { productId, userId: req.userId },
            {
                review: review.trim(), rating: numRating, userName: user.name, image: user.avatar || "",
                // edit karne par dobara moderation (auto-approve off ho to)
                status: (await getSettings()).reviews?.autoApprove === false ? "pending" : "approved",
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const avgRating = await updateProductRating(productId);
        logActivity(req.userId, "review", { productId, name: product.name, rating: numRating, status: saved.status }, req);

        return res.status(200).json({
            error: false,
            success: true,
            message: saved.status === "pending" ? "Thanks! Your review will appear after approval." : "Review submitted successfully",
            data: saved,
            rating: avgRating,
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ error: true, success: false, message: "Invalid product ID" });
        }
        const reviews = await Review.find({ productId, status: { $nin: ["pending", "hidden"] } }).sort({ createdAt: -1 });
        return res.status(200).json({ error: false, success: true, data: reviews });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

// ── Admin ──
const STATUSES = ["approved", "pending", "hidden"];

// GET /api/review/admin/all
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 })
            .populate("productId", "name images")
            .populate("userId", "name email");
        return res.status(200).json({ error: false, success: true, data: reviews });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

// PUT /api/review/admin/:id  { status?, reply? }
export const updateReviewAdmin = async (req, res) => {
    try {
        const r = await Review.findById(req.params.id);
        if (!r) return res.status(404).json({ error: true, success: false, message: "Review not found" });
        if (req.body.status !== undefined) {
            if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: true, success: false, message: "Invalid status" });
            r.status = req.body.status;
        }
        if (req.body.reply !== undefined) {
            r.reply = String(req.body.reply || "").trim().slice(0, 1000);
            r.repliedAt = r.reply ? new Date() : null;
        }
        await r.save();
        await updateProductRating(r.productId);
        await r.populate([{ path: "productId", select: "name images" }, { path: "userId", select: "name email" }]);
        return res.status(200).json({ error: false, success: true, message: "Review updated", data: r });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

// POST /api/review/admin/bulk  { ids: [], action: "approved"|"hidden"|"delete" }
export const bulkReviews = async (req, res) => {
    try {
        const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).filter((id) => mongoose.isValidObjectId(id));
        const { action } = req.body;
        if (!ids.length) return res.status(400).json({ error: true, success: false, message: "No reviews selected" });
        const products = await Review.distinct("productId", { _id: { $in: ids } });
        if (action === "delete") await Review.deleteMany({ _id: { $in: ids } });
        else if (STATUSES.includes(action)) await Review.updateMany({ _id: { $in: ids } }, { status: action });
        else return res.status(400).json({ error: true, success: false, message: "Invalid action" });
        for (const pid of products) await updateProductRating(pid);
        return res.status(200).json({ error: false, success: true, message: `${ids.length} review(s) updated` });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};
