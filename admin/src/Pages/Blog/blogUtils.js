// Store (my-project) ka URL — "View on store" links ke liye
export const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5173";

export const wordCount = (text = "") => (String(text).trim().match(/\S+/g) || []).length;
export const readTime = (text = "") => Math.max(1, Math.round(wordCount(text) / 200));
export const plainExcerpt = (text = "", n = 160) => {
  const t = String(text).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t;
};
