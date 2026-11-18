import mongoose from "mongoose";
import { Page } from "../models/Page.js";

const slugify = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const GROUPS = ["none", "help", "company", "legal"];
const clean = (b = {}) => ({
  title: String(b.title || "").trim().slice(0, 120),
  slug: slugify(b.slug || b.title),
  content: String(b.content || "").slice(0, 50000),
  status: b.status === "published" ? "published" : "draft",
  footerGroup: GROUPS.includes(b.footerGroup) ? b.footerGroup : "none",
  sortOrder: Math.round(Number(b.sortOrder) || 0),
  metaDescription: String(b.metaDescription || "").trim().slice(0, 300),
});
const RESERVED = ["admin", "new"];
const fail = (res, code, message) => res.status(code).json({ error: true, success: false, message });

// GET /api/page — public: published pages (bina content) footer ke liye
export const listPublicPages = async (req, res) => {
  try {
    const data = await Page.find({ status: "published" }).select("title slug footerGroup sortOrder").sort({ sortOrder: 1, title: 1 });
    return res.json({ error: false, success: true, data });
  } catch (e) { return fail(res, 500, e.message); }
};

// GET /api/page/:slug — public
export const getPublicPage = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: String(req.params.slug).toLowerCase(), status: "published" });
    if (!page) return fail(res, 404, "Page not found");
    return res.json({ error: false, success: true, data: page });
  } catch (e) { return fail(res, 500, e.message); }
};

// ── Admin ──
export const listAllPages = async (req, res) => {
  try {
    const data = await Page.find().sort({ sortOrder: 1, title: 1 });
    return res.json({ error: false, success: true, data });
  } catch (e) { return fail(res, 500, e.message); }
};

export const createPage = async (req, res) => {
  try {
    const data = clean(req.body);
    if (!data.title) return fail(res, 400, "Title is required");
    if (!data.slug || RESERVED.includes(data.slug)) return fail(res, 400, "Please choose a different URL");
    if (await Page.exists({ slug: data.slug })) return fail(res, 400, `A page with URL /page/${data.slug} already exists`);
    const page = await Page.create(data);
    return res.status(201).json({ error: false, success: true, message: "Page created", data: page });
  } catch (e) { return fail(res, 500, e.message); }
};

export const updatePage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, "Page not found");
    const data = clean(req.body);
    if (!data.title) return fail(res, 400, "Title is required");
    if (!data.slug || RESERVED.includes(data.slug)) return fail(res, 400, "Please choose a different URL");
    if (await Page.exists({ slug: data.slug, _id: { $ne: req.params.id } })) return fail(res, 400, `A page with URL /page/${data.slug} already exists`);
    const page = await Page.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!page) return fail(res, 404, "Page not found");
    return res.json({ error: false, success: true, message: "Page saved", data: page });
  } catch (e) { return fail(res, 500, e.message); }
};

export const deletePage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, "Page not found");
    await Page.findByIdAndDelete(req.params.id);
    return res.json({ error: false, success: true, message: "Page deleted" });
  } catch (e) { return fail(res, 500, e.message); }
};
