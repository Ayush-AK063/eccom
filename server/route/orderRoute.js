import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import {
  placeCodOrderController,
  getMyOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  getDashboardStatsController,
} from "../controllers/orderController.js";

const orderRouter = Router();

orderRouter.post("/cod", auth, placeCodOrderController);
orderRouter.get("/my-orders", auth, getMyOrdersController);

// Admin
orderRouter.get("/all", auth, isAdmin, getAllOrdersController);
orderRouter.put("/status/:id", auth, isAdmin, updateOrderStatusController);
orderRouter.get("/dashboard-stats", auth, isAdmin, getDashboardStatsController);

export default orderRouter;
