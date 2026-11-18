import React, { useContext, useEffect, useState } from "react";
import { FiPlus, FiExternalLink, FiTrash2, FiFileText, FiEye, FiEdit2 } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { MyContext } from "../../App";
import { getData, postData, putData, deleteData } from "../../utils/api";
import { STORE_URL } from "../Settings/ui";
import "../Products/style.css";

const GROUPS = [["help", "Footer · Help & info"], ["company", "Footer · Help & info (company)"], ["legal", "Footer · bottom legal links"], ["none", "Not in footer"]];
const EMPTY = { title: "", slug: "", content: "", status: "draft", footerGroup: "help", sortOrder: 0, metaDescription: "" };
const slugify = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Store jaisa hi simple format preview
const Preview = ({ text }) => (
  <div className="flex flex-col gap-3 text-[14px] leading-6 text-gray-700">
    {String(text || "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean).map((b, i) => {
      if (b.startsWith("## ")) { const [h, ...r] = b.split("\n"); return <div key={i}><h3 className="text-[16px] font-[700] text-gray-900">{h.slice(3)}</h3>{r.length > 0 && <p className="whitespace-pre-line mt-1">{r.join("\n")}</p>}</div>; }
      const lines = b.split("\n");
      if (lines.every((l) => /^[-•]\s/.test(l))) return <ul key={i} className="list-disc pl-5">{lines.map((l, j) => <li key={j}>{l.replace(/^[-•]\s/, "")}</li>)}</ul>;
      return <p key={i} className="whitespace-pre-line">{b}</p>;
    })}
  </div>
);

const StorePages = () => {
  const context = useContext(MyContext);
  const [pages, setPages] = useState(null);
  const [form, setForm] = useState(null); // null = nothing open
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => getData("/api/page/admin/all").then((res) => setPages(res?.data || []));
  useEffect(() => { window.scrollTo(0, 0); load(); }, []);

  const openPage = (p) => { setForm(p ? { ...EMPTY, ...p } : { ...EMPTY }); setSlugTouched(!!p); setPreview(false); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v, ...(k === "title" && !slugTouched ? { slug: slugify(v) } : {}) }));

  const save = async (status = form.status) => {
    if (!form.title.trim()) return context.openAlertBox("error", "Title is required");
    if (status === "published" && form.content.trim().length < 20) return context.openAlertBox("error", "Write the page content before publishing");
    setSaving(true);
    const body = { ...form, status };
    const res = form._id ? await putData(`/api/page/${form._id}`, body) : await postData("/api/page", body);
    setSaving(false);
    if (res?.error === false) { context.openAlertBox("success", status === "published" ? "Page published" : "Saved as draft"); setForm({ ...EMPTY, ...res.data }); setSlugTouched(true); load(); }
    else context.openAlertBox("error", res?.message || "Could not save page");
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${form.title}"? Links to /page/${form.slug} will stop working.`)) return;
    const res = await deleteData(`/api/page/${form._id}`);
    if (res?.error === false) { context.openAlertBox("success", "Page deleted"); setForm(null); load(); }
    else context.openAlertBox("error", res?.message || "Could not delete page");
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Pages</h1>
          <div className="text-[14px] text-gray-500">About, contact and policy pages — linked from the store footer.</div>
        </div>
        <button className="pdBtn pdBtn--dark" onClick={() => openPage(null)}><FiPlus /> New page</button>
      </div>

      <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-4 items-start">
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          {pages === null ? <div className="p-4 flex flex-col gap-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />)}</div>
            : pages.length === 0 ? <div className="p-8 text-center text-[13px] text-gray-500">No pages yet.</div>
              : pages.map((p) => (
                <button key={p._id} onClick={() => openPage(p)} className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 ${form?._id === p._id ? "bg-[#f5f7ff]" : ""}`}>
                  <FiFileText className="text-gray-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-[600] text-gray-900 truncate">{p.title}</span>
                    <span className="block text-[11px] text-gray-400 truncate">/page/{p.slug} · {fmt(p.updatedAt)}</span>
                  </span>
                  <span className={`pdBadge ${p.status === "published" ? "pdBadge--green" : "pdBadge--amber"}`}>{p.status === "published" ? "Live" : "Draft"}</span>
                </button>
              ))}
        </div>

        {!form ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-md p-12 text-center text-[13px] text-gray-500">
            Choose a page on the left or create a new one.
            <div className="mt-2 text-[12px] text-gray-400">Draft pages were created for About, Contact, Shipping, Returns, FAQ, Privacy and Terms — fill in your details and publish.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="pdCard">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="pdLabel">Title <em>*</em></label>
                  <input className="pdInput" value={form.title} maxLength={120} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div>
                  <label className="pdLabel">URL</label>
                  <div className="flex items-center"><span className="h-[40px] px-2 flex items-center text-[13px] text-gray-400 border border-r-0 border-gray-200 rounded-l-md bg-gray-50">/page/</span>
                    <input className="pdInput !rounded-l-none" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></div>
                </div>
                <div>
                  <label className="pdLabel">Show in footer</label>
                  <select className="pdInput" value={form.footerGroup} onChange={(e) => set("footerGroup", e.target.value)}>{GROUPS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                </div>
                <div>
                  <label className="pdLabel">Order</label>
                  <input type="number" className="pdInput pdNum" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
                  <div className="pdHint">Lower numbers come first in the footer.</div>
                </div>
              </div>
            </div>

            <div className="pdCard">
              <div className="flex items-center justify-between mb-3">
                <div className="pdCard__title">Content</div>
                <div className="flex gap-1">
                  <button className={`pdTab ${!preview ? "is-active" : ""}`} onClick={() => setPreview(false)}><FiEdit2 /> Write</button>
                  <button className={`pdTab ${preview ? "is-active" : ""}`} onClick={() => setPreview(true)}><FiEye /> Preview</button>
                </div>
              </div>
              {preview
                ? <div className="min-h-[360px] p-4 border border-gray-100 rounded-md"><h2 className="text-[22px] font-[800] text-gray-900 mb-4">{form.title}</h2><Preview text={form.content} /></div>
                : <textarea className="pdInput !min-h-[360px] font-mono !text-[13px]" value={form.content} onChange={(e) => set("content", e.target.value)} placeholder={"## Heading\n\nA paragraph of text.\n\n- A list item\n- Another item"} />}
              <div className="pdHint">Format: start a line with <b>## </b> for a heading, <b>- </b> for a list item; leave an empty line between paragraphs.</div>
              <div className="mt-4">
                <label className="pdLabel">Search description</label>
                <input className="pdInput" value={form.metaDescription} maxLength={300} onChange={(e) => set("metaDescription", e.target.value)} placeholder="One sentence shown in Google results" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="pdBtn pdBtn--dark" disabled={saving} onClick={() => save("published")}>{saving ? <CircularProgress size={16} color="inherit" /> : form.status === "published" ? "Save & keep live" : "Publish"}</button>
              <button className="pdBtn pdBtn--light" disabled={saving} onClick={() => save("draft")}>{form.status === "published" ? "Unpublish (draft)" : "Save draft"}</button>
              {form._id && form.status === "published" && <a className="pdBtn pdBtn--light" href={`${STORE_URL}/page/${form.slug}`} target="_blank" rel="noreferrer"><FiExternalLink /> View</a>}
              {form._id && <button className="pdBtn pdBtn--light ml-auto hover:!border-[#ef4444] hover:!text-[#dc2626]" onClick={remove}><FiTrash2 /> Delete</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePages;
