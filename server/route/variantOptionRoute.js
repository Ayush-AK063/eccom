import express from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { getVariantOptions, createVariantOption, updateVariantOption, deleteVariantOption, reorderVariantOptions } from "../controllers/variantOptionController.js";

const router = express.Router();
router.get("/", getVariantOptions);
router.post("/", auth, isAdmin, createVariantOption);
router.put("/reorder", auth, isAdmin, reorderVariantOptions);
router.put("/:id", auth, isAdmin, updateVariantOption);
router.delete("/:id", auth, isAdmin, deleteVariantOption);
export default router;
