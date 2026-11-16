import { HomeSlide } from "../models/HomeSlide.js";
import { v2 as cloudinary } from "cloudinary";
import pLimit from "p-limit";

export const uploadImages = async (req, res) => {
    try {
        const images = req.files;
        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "No images provided" });
        }

        const limit = pLimit(5);
        const imagesToUpload = images.map((image) => {
            return limit(async () => {
                const result = await cloudinary.uploader.upload(image.path, {
                    folder: "home_slides",
                });
                return result.secure_url;
            });
        });

        const uploadResults = await Promise.all(imagesToUpload);
        return res.status(200).json({ success: true, images: uploadResults });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const addHomeSlide = async (req, res) => {
    try {
        const { images, type, bannerHeading, title, startAtOnlyPrice, redirectUrl } = req.body;

        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        if (!type) {
            return res.status(400).json({ success: false, message: "Banner type is required" });
        }

        const newSlide = new HomeSlide({ images, type, bannerHeading, title, startAtOnlyPrice, redirectUrl });
        await newSlide.save();

        return res.status(201).json({ success: true, message: "Home Slide added successfully", data: newSlide });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getHomeSlides = async (req, res) => {
    try {
        const slides = await HomeSlide.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: slides });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteHomeSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSlide = await HomeSlide.findByIdAndDelete(id);

        if (!deletedSlide) {
            return res.status(404).json({ success: false, message: "Home Slide not found" });
        }

        if (deletedSlide.images && deletedSlide.images.length > 0) {
            for (let imgUrl of deletedSlide.images) {
                const urlArr = imgUrl.split("/");
                const imageName = urlArr[urlArr.length - 1].split(".")[0];
                const publicId = `home_slides/${imageName}`;
                await cloudinary.uploader.destroy(publicId);
            }
        }

        return res.status(200).json({ success: true, message: "Home Slide deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteMultipleHomeSlides = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "No slide IDs provided" });
        }

        const slidesToDelete = await HomeSlide.find({ _id: { $in: ids } });

        for (let slide of slidesToDelete) {
            if (slide.images && slide.images.length > 0) {
                for (let imgUrl of slide.images) {
                    const urlArr = imgUrl.split("/");
                    const imageName = urlArr[urlArr.length - 1].split(".")[0];
                    const publicId = `home_slides/${imageName}`;
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        await HomeSlide.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({ success: true, message: "Slides deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const updateHomeSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { images, type, bannerHeading, title, startAtOnlyPrice, redirectUrl } = req.body;

        if (!type) {
            return res.status(400).json({ success: false, message: "Banner type is required" });
        }

        const updatedSlide = await HomeSlide.findByIdAndUpdate(
            id,
            { images, type, bannerHeading, title, startAtOnlyPrice, redirectUrl },
            { new: true }
        );

        if (!updatedSlide) {
            return res.status(404).json({ success: false, message: "Home Slide not found" });
        }

        return res.status(200).json({ success: true, message: "Home Slide updated successfully", data: updatedSlide });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
