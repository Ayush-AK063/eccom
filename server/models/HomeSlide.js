import mongoose from "mongoose";

const homeSlideSchema = new mongoose.Schema(
    {
        images: [
            {
                type: String,
                required: true,
            },
        ],
        type: {
            type: String,
            required: true,
            enum: ['Left Big Banner', 'Right Top Banner', 'Right Down Banner', 'v2 Banner', 'v3 Banner'],
            default: 'Left Big Banner'
        },
        bannerHeading: { type: String, default: '' },
        title: { type: String, default: '' },
        startAtOnlyPrice: { type: String, default: '' },
        redirectUrl: { type: String, default: '' }
    },
    { timestamps: true }
);

export const HomeSlide = mongoose.model("HomeSlide", homeSlideSchema);
