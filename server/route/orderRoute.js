import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  placeCodOrderController,
  getMyOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  getDashboardStatsController,
  cancelMyOrderController,
  requestReturnController,
  adminUpdateOrderController,
} from "../controllers/orderController.js";

const orderRouter = Router();

orderRouter.post("/cod", auth, placeCodOrderController);
orderRouter.get("/my-orders", auth, getMyOrdersController);
orderRouter.put("/cancel/:id", auth, cancelMyOrderController);
orderRouter.post("/return/:id", auth, requestReturnController);

// Admin
orderRouter.get("/all", auth, isAdmin, getAllOrdersController);
orderRouter.put("/status/:id", auth, isAdmin, updateOrderStatusController);
orderRouter.put("/admin/:id", auth, isAdmin, adminUpdateOrderController);
orderRouter.get("/dashboard-stats", auth, isAdmin, getDashboardStatsController);

export default orderRouter;
