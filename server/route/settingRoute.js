import { Router } from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { getStoreSettings, updateStoreSettings, uploadSettingImage, subscribe, getSubscribers } from "../controllers/settingController.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 2 * 1024 * 1024 } });
const settingRouter = Router();

settingRouter.get("/", getStoreSettings);
settingRouter.put("/", auth, isAdmin, updateStoreSettings);
settingRouter.post("/upload", auth, isAdmin, upload.array("images", 1), uploadSettingImage);

settingRouter.post("/subscribe", subscribe);
settingRouter.get("/subscribers", auth, isAdmin, getSubscribers);

export default settingRouter;
