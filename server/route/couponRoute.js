import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { applyCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon } from "../controllers/couponController.js";

const couponRouter = Router();
couponRouter.post("/apply", auth, applyCoupon);
couponRouter.get("/", auth, isAdmin, listCoupons);
couponRouter.post("/", auth, isAdmin, createCoupon);
couponRouter.put("/:id", auth, isAdmin, updateCoupon);
couponRouter.delete("/:id", auth, isAdmin, deleteCoupon);
export default couponRouter;
