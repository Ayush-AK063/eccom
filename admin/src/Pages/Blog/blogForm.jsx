import React, { useContext, useState } from "react";
import { FiUploadCloud, FiTrash2, FiArrowLeft, FiArrowRight, FiX, FiExternalLink } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { postData, putData } from "../../utils/api";
import { MyContext } from "../../App";
import { wordCount, readTime, plainExcerpt, STORE_URL } from "./blogUtils";
import "../Products/style.css";
import "./style.css";

const IMG_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 8;

// Add aur Edit dono ke liye ek hi form. `data` ho to Edit mode.
const BlogForm = ({ data }) => {
  const isEdit = Boolean(data?._id);
  const context = useContext(MyContext);
  const [title, setTitle] = useState(data?.title || "");
  const [description, setDescription] = useState(data?.description || "");
  const [excerpt, setExcerpt] = useState(data?.excerpt || "");
  const [author, setAuthor] = useState(data?.author || context.userData?.name || "");
  const [tags, setTags] = useState(data?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState(data?.status || "published");
  // images: { src, file? } — order = display order, first = cover
  const [images, setImages] = useState((data?.images || []).map((src) => ({ src })));
  const [over, setOver] = useState(false);
  const [saving, setSaving] = useState(false);

  const addFiles = (list) => {
    const files = Array.from(list || []);
    const bad = files.filter((f) => !IMG_TYPES.includes(f.type) || f.size > 5 * 1024 * 1024);
    if (bad.length) context.openAlertBox("error", "Only JPG, PNG or WEBP images under 5 MB are allowed.");
    const ok = files.filter((f) => !bad.includes(f)).slice(0, MAX_IMAGES - images.length);
    if (files.length - bad.length > ok.length) context.openAlertBox("error", `Up to ${MAX_IMAGES} images per post.`);
    setImages((l) => [...l, ...ok.map((file) => ({ src: URL.createObjectURL(file), file }))]);
  };
  const move = (i, d) => setImages((l) => {
    const n = [...l]; const j = i + d;
    if (j < 0 || j >= n.length) return l;
    [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  const addTag = (raw) => {
    const t = raw.trim().replace(/,$/, "").slice(0, 30);
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase()) && tags.length < 10) setTags([...tags, t]);
    setTagInput("");
  };

  const words = wordCount(description);
  const checks = [
    [title.trim().length >= 10 && title.trim().length <= 70, "Title 10–70 characters"],
    [words >= 150, "At least 150 words"],
    [images.length > 0, "Cover image"],
    [!!excerpt.trim(), "Short summary"],
    [tags.length > 0, "At least one tag"],
  ];

  const submit = async (nextStatus) => {
    if (!title.trim()) return context.openAlertBox("error", "Please enter a title");
    if (!description.trim()) return context.openAlertBox("error", "Please write the post content");
    if (!images.length) return context.openAlertBox("error", "Please add a cover image");

    setSaving(true);
    try {
      const files = images.filter((i) => i.file);
      let uploaded = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((i) => fd.append("images", i.file));
        const up = await postData("/api/blog/upload-images", fd);
        if (up?.error || !up?.images) throw new Error(up?.message || "Image upload failed");
        uploaded = up.images;
      }
      let k = 0;
      const finalImages = images.map((i) => (i.file ? uploaded[k++] : i.src)).filter(Boolean);
      const payload = { title: title.trim(), description, excerpt: excerpt.trim(), author: author.trim(), tags, status: nextStatus, images: finalImages };
      const res = isEdit ? await putData(`/api/blog/${data._id}`, payload) : await postData("/api/blog/create", payload);
      if (res?.error !== false) throw new Error(res?.message || "Something went wrong");
      context.openAlertBox("success", nextStatus === "draft" ? "Saved as draft" : isEdit ? "Post updated" : "Post published");
      context.setIsOpenFullScreenPanel({ open: false });
      context.setRefetchBlogs((p) => !p);
    } catch (err) {
      context.openAlertBox("error", err.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const summary = excerpt.trim() || plainExcerpt(description, 140);

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(status); }} className="pdPanel">
      <div className="pdPanel__grid">
        <div className="flex flex-col gap-4">
          <div className="pdCard">
            <input className="blgTitle" value={title} maxLength={120} placeholder="Post title" onChange={(e) => setTitle(e.target.value)} />
            <div className="text-[11px] text-gray-400 mt-1 mb-4">{title.length}/70 recommended</div>
            <div className="border-t border-gray-100 pt-4">
              <textarea className="blgBody" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={"Start writing…\n\nLeave an empty line between paragraphs — line breaks are kept on the store."} />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-2">
              <span>{words} words · {readTime(description)} min read</span>
              <span>Plain text · paragraphs kept</span>
            </div>
          </div>

          <div className="pdCard">
            <div className="pdCard__head">
              <div className="pdCard__title">Images</div>
              <div className="pdCard__sub">First image is the cover. Landscape 16:9, at least 1200 px wide. Up to {MAX_IMAGES}.</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={img.src} className="pdImg !aspect-[4/3]">
                  <img src={img.src} alt="" className="!object-cover" />
                  {i === 0 && <span className="pdImg__tag">Cover</span>}
                  <div className="pdImg__actions">
                    {i > 0 && <button type="button" onClick={() => move(i, -1)} aria-label="Move left"><FiArrowLeft /></button>}
                    {i < images.length - 1 && <button type="button" onClick={() => move(i, 1)} aria-label="Move right"><FiArrowRight /></button>}
                    <button type="button" className="is-danger" onClick={() => setImages((l) => l.filter((_, j) => j !== i))} aria-label="Remove"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className={`pdDrop !aspect-[4/3] ${over ? "is-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                  onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}>
                  <FiUploadCloud className="text-[22px] text-gray-400" />
                  <span className="text-[12px] font-[600] text-gray-800">Upload or drop</span>
                  <span className="text-[11px] text-gray-400">JPG, PNG, WEBP</span>
                  <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </label>
              )}
            </div>
          </div>

          <div className="pdCard">
            <div className="pdCard__head">
              <div className="pdCard__title">Summary</div>
              <div className="pdCard__sub">Shown on the blog card on the home page. Leave empty to use the first lines of the post.</div>
            </div>
            <textarea className="pdInput !min-h-[80px]" maxLength={300} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={plainExcerpt(description, 140) || "A one or two line summary"} />
            <div className="pdHint">{excerpt.length}/300</div>
          </div>
        </div>

        <aside className="pdPanel__aside">
          <div className="pdCard">
            <div className="pdCard__title mb-3">Publish</div>
            <label className="pdLabel">Visibility</label>
            <div className="flex gap-2 mb-4">
              {[["published", "Published"], ["draft", "Draft"]].map(([k, l]) => (
                <button type="button" key={k} className={`pdChip flex-1 justify-center ${status === k ? "is-on" : ""}`} onClick={() => setStatus(k)}>{l}</button>
              ))}
            </div>
            <div className="pdHint !mt-0 mb-4">{status === "draft" ? "Only admins can see drafts." : "Visible on the store right away."}</div>
            <button type="submit" className="pdBtn pdBtn--dark w-full !h-[42px]" disabled={saving}>
              {saving ? <CircularProgress size={18} color="inherit" /> : status === "draft" ? "Save draft" : isEdit ? "Update post" : "Publish post"}
            </button>
            {status === "published" && (
              <button type="button" className="pdBtn pdBtn--light w-full mt-2" disabled={saving} onClick={() => submit("draft")}>Save as draft</button>
            )}
            {isEdit && data.status !== "draft" && (
              <a className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-[600] text-gray-500 hover:text-gray-900" href={`${STORE_URL}/blog/${data._id}`} target="_blank" rel="noreferrer"><FiExternalLink /> View on store</a>
            )}
          </div>

          <div className="pdCard">
            <label className="pdLabel">Author</label>
            <input className="pdInput mb-4" value={author} maxLength={80} onChange={(e) => setAuthor(e.target.value)} placeholder="Name shown on the post" />
            <label className="pdLabel">Tags</label>
            <div className="pdInput !h-auto min-h-[40px] flex flex-wrap items-center gap-1.5 !py-1.5">
              {tags.map((t) => (
                <span key={t} className="pdBadge pdBadge--blue !normal-case">{t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><FiX /></button></span>
              ))}
              <input className="flex-1 min-w-[80px] outline-none text-[13px] bg-transparent" value={tagInput} placeholder={tags.length ? "" : "e.g. Style guide"}
                onChange={(e) => (e.target.value.endsWith(",") ? addTag(e.target.value) : setTagInput(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } if (e.key === "Backspace" && !tagInput && tags.length) setTags(tags.slice(0, -1)); }}
                onBlur={() => tagInput && addTag(tagInput)} />
            </div>
            <div className="pdHint">Press Enter or comma to add. Up to 10.</div>
          </div>

          <div className="pdCard">
            <div className="pdCard__title mb-3">Card preview</div>
            <div className="blgPreview">
              {images[0] ? <img src={images[0].src} alt="" /> : <div className="aspect-video bg-gray-100" />}
              <div className="p-3">
                <div className="text-[11px] text-gray-400">{new Date(data?.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                <div className="text-[14px] font-[700] text-gray-900 line-clamp-2">{title || "Post title"}</div>
                <div className="text-[12px] text-gray-500 line-clamp-2 mt-1">{summary || "Summary will appear here."}</div>
              </div>
            </div>
          </div>

          <div className="pdCard">
            <div className="pdCard__title mb-2">Checklist</div>
            <ul className="flex flex-col gap-1.5 text-[12px]">
              {checks.map(([ok, label]) => (
                <li key={label} className={`flex items-center gap-2 ${ok ? "text-gray-900" : "text-gray-400"}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${ok ? "bg-[#059669] text-white" : "border border-gray-300"}`}>{ok ? "✓" : ""}</span>{label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default BlogForm;
