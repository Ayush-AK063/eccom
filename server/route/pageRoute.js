import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import { listPublicPages, getPublicPage, listAllPages, createPage, updatePage, deletePage } from "../controllers/pageController.js";

const pageRouter = Router();
pageRouter.get("/admin/all", auth, isAdmin, listAllPages);
pageRouter.post("/", auth, isAdmin, createPage);
pageRouter.put("/:id", auth, isAdmin, updatePage);
pageRouter.delete("/:id", auth, isAdmin, deletePage);
pageRouter.get("/", listPublicPages);
pageRouter.get("/:slug", getPublicPage);
export default pageRouter;
