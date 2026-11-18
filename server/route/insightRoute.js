import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { getInsights } from "../controllers/insightController.js";

const insightRouter = Router();
insightRouter.get("/", auth, isAdmin, getInsights);
export default insightRouter;
