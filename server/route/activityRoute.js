import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { logProductView, listActivity, activitySummary } from "../controllers/activityController.js";

const activityRouter = Router();
activityRouter.post("/view", auth, logProductView);
activityRouter.get("/summary", auth, isAdmin, activitySummary);
activityRouter.get("/", auth, isAdmin, listActivity);
export default activityRouter;
