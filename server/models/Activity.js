import mongoose from "mongoose";

// Customer kya kar raha hai — admin ke liye timeline / live feed. IP save nahi karte, sirf device.
const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    device: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
activitySchema.index({ createdAt: -1 });
// 180 din baad apne aap delete
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 86400 });

export const Activity = mongoose.model("Activity", activitySchema);
