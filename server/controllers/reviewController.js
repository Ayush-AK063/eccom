import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Product ki average rating dobara calculate karke Product.rating mein save karo
const updateProductRating = async (productId) => {
    const [stats] = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
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
            { review: review.trim(), rating: numRating, userName: user.name, image: user.avatar || "" },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const avgRating = await updateProductRating(productId);

        return res.status(200).json({
            error: false,
            success: true,
            message: "Review submitted successfully",
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
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
        return res.status(200).json({ error: false, success: true, data: reviews });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};
