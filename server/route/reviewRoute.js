import { Router } from "express";
import auth from "../middleware/auth.js";
import { addReview, getReviews } from "../controllers/reviewController.js";

const reviewRouter = Router();

reviewRouter.post("/add", auth, addReview);
reviewRouter.get("/:productId", getReviews);

export default reviewRouter;
