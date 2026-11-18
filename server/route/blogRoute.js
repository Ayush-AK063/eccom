import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import {
    addBlog,
    deleteBlog,
    deleteBlogImage,
    deleteMultipleBlogs,
    getBlog,
    getBlogs,
    updateBlog,
    uploadBlogImages,
} from "../controllers/blogController.js";

const blogRouter = express.Router();
const upload = multer({ dest: "uploads/" });

blogRouter.post("/upload-images", auth, isAdmin, upload.array("images"), uploadBlogImages);
blogRouter.delete("/deleteimage", auth, isAdmin, deleteBlogImage);
blogRouter.post("/create", auth, isAdmin, addBlog);
blogRouter.get("/", getBlogs);
blogRouter.post("/delete-multiple", auth, isAdmin, deleteMultipleBlogs);
blogRouter.get("/:id", getBlog);
blogRouter.put("/:id", auth, isAdmin, updateBlog);
blogRouter.delete("/:id", auth, isAdmin, deleteBlog);

export default blogRouter;
