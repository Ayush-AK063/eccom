import fs from "fs";
import mongoose from "mongoose";
import { Blog } from "../models/Blog.js";
import { v2 as cloudinary } from "cloudinary";
import pLimit from "p-limit";

const BLOG_FOLDER = "blogs";

// Cloudinary URL → public id (e.g. blogs/abc123)
const getPublicId = (imgUrl) => {
    const urlArr = imgUrl.split("/");
    const imageName = urlArr[urlArr.length - 1].split(".")[0];
    return `${BLOG_FOLDER}/${imageName}`;
};

const destroyImages = async (images = []) => {
    for (const imgUrl of images) {
        try {
            await cloudinary.uploader.destroy(getPublicId(imgUrl));
        } catch (err) {
            console.error("Cloudinary destroy error:", err.message);
        }
    }
};

export const uploadBlogImages = async (req, res) => {
    try {
        const images = req.files;
        if (!images || images.length === 0) {
            return res.status(400).json({ error: true, success: false, message: "No images provided" });
        }

        const limit = pLimit(5);
        const uploadResults = await Promise.all(
            images.map((image) =>
                limit(async () => {
                    const result = await cloudinary.uploader.upload(image.path, { folder: BLOG_FOLDER });
                    fs.unlink(image.path, () => {}); // temp file hatao
                    return result.secure_url;
                })
            )
        );

        return res.status(200).json({ error: false, success: true, images: uploadResults });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const deleteBlogImage = async (req, res) => {
    try {
        const { img } = req.query;
        if (!img) {
            return res.status(400).json({ error: true, success: false, message: "Image URL is required" });
        }
        await destroyImages([img]);
        return res.status(200).json({ error: false, success: true, message: "Image deleted" });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

// excerpt / author / tags / status saaf karo
const extraFields = (body = {}) => ({
    excerpt: String(body.excerpt || "").trim().slice(0, 300),
    author: String(body.author || "").trim().slice(0, 80),
    tags: [...new Set((Array.isArray(body.tags) ? body.tags : []).map((t) => String(t).trim().slice(0, 30)).filter(Boolean))].slice(0, 10),
    status: body.status === "draft" ? "draft" : "published",
});
const isAdminReq = (req) => req.query.admin === "1";
const PUBLIC = { status: { $ne: "draft" } };

export const addBlog = async (req, res) => {
    try {
        const { title, description, images } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: true, success: false, message: "Title and description are required" });
        }
        if (!images || images.length === 0) {
            return res.status(400).json({ error: true, success: false, message: "At least one image is required" });
        }

        const blog = await new Blog({ title, description, images, ...extraFields(req.body) }).save();

        return res.status(201).json({ error: false, success: true, message: "Blog added successfully", data: blog });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const getBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10000;

        const filter = isAdminReq(req) ? {} : { ...PUBLIC };
        if (req.query.tag) filter.tags = String(req.query.tag);
        const totalBlogs = await Blog.countDocuments(filter);
        const blogs = await Blog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        return res.status(200).json({
            error: false,
            success: true,
            data: blogs,
            totalPages: Math.ceil(totalBlogs / perPage),
            page,
        });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const getBlog = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ error: true, success: false, message: "Blog not found" });
        }
        const blog = await Blog.findById(req.params.id);
        if (!blog || (blog.status === "draft" && !isAdminReq(req))) {
            return res.status(404).json({ error: true, success: false, message: "Blog not found" });
        }
        return res.status(200).json({ error: false, success: true, data: blog });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { title, description, images } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: true, success: false, message: "Title and description are required" });
        }
        if (!images || images.length === 0) {
            return res.status(400).json({ error: true, success: false, message: "At least one image is required" });
        }

        const oldBlog = await Blog.findById(req.params.id);
        if (!oldBlog) {
            return res.status(404).json({ error: true, success: false, message: "Blog not found" });
        }

        // Jo purani images hata di gayi, unhe Cloudinary se bhi delete karo
        const removed = oldBlog.images.filter((img) => !images.includes(img));
        await destroyImages(removed);

        oldBlog.title = title;
        oldBlog.description = description;
        oldBlog.images = images;
        Object.assign(oldBlog, extraFields(req.body));
        await oldBlog.save();

        return res.status(200).json({ error: false, success: true, message: "Blog updated successfully", data: oldBlog });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: true, success: false, message: "Blog not found" });
        }
        await destroyImages(blog.images);
        return res.status(200).json({ error: false, success: true, message: "Blog deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const deleteMultipleBlogs = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: true, success: false, message: "No blog IDs provided" });
        }

        const blogs = await Blog.find({ _id: { $in: ids } });
        for (const blog of blogs) {
            await destroyImages(blog.images);
        }
        await Blog.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({ error: false, success: true, message: "Blogs deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: true, success: false, message: error.message });
    }
};
