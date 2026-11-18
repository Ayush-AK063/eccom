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
            enum: ['Left Big Banner', 'Right Top Banner', 'Right Down Banner', 'v2 Banner'],
            default: 'Left Big Banner'
        },
        bannerHeading: { type: String, default: '' },
        title: { type: String, default: '' },
        startAtOnlyPrice: { type: String, default: '' },
        redirectUrl: { type: String, default: '' },
        // Schedule: band ho ya date ke bahar ho to store pe nahi dikhta
        isActive: { type: Boolean, default: true },
        startAt: { type: Date, default: null },
        endAt: { type: Date, default: null },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const HomeSlide = mongoose.model("HomeSlide", homeSlideSchema);
