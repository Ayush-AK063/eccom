import mongoose from "mongoose";

// Store search terms (admin Insights → top searches / no-result searches)
const searchLogSchema = new mongoose.Schema(
  {
    term: { type: String, required: true, unique: true, lowercase: true, trim: true },
    count: { type: Number, default: 0 },
    results: { type: Number, default: 0 }, // last search pe kitne products mile
    lastAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SearchLog = mongoose.model("SearchLog", searchLogSchema);

export const logSearch = (raw, results) => {
  const term = String(raw || "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 80);
  if (term.length < 2) return;
  SearchLog.updateOne({ term }, { $inc: { count: 1 }, $set: { results, lastAt: new Date() } }, { upsert: true }).catch(() => {});
};
