import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { addReview, getReviews, getAllReviews, updateReviewAdmin, bulkReviews } from "../controllers/reviewController.js";

const reviewRouter = Router();

reviewRouter.post("/add", auth, addReview);
reviewRouter.get("/admin/all", auth, isAdmin, getAllReviews);
reviewRouter.put("/admin/:id", auth, isAdmin, updateReviewAdmin);
reviewRouter.post("/admin/bulk", auth, isAdmin, bulkReviews);
reviewRouter.get("/:productId", getReviews);

export default reviewRouter;
