import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2, FiExternalLink, FiFileText, FiChevronLeft, FiChevronRight, FiEyeOff, FiEye } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData, deleteData, postData, putData } from "../../utils/api";
import { Check } from "../Products/shared";
import { readTime, plainExcerpt, STORE_URL } from "./blogUtils";
import "../Products/style.css";
import "./style.css";

const PER_PAGE = 10;
const TABS = [["", "All"], ["published", "Published"], ["draft", "Drafts"]];
const SORTS = [["newest", "Newest first"], ["oldest", "Oldest first"], ["updated", "Recently updated"], ["title", "Title A–Z"]];

const BlogList = () => {
  const Context = useContext(MyContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const load = () => getData("/api/blog?admin=1").then((res) => {
    if (res?.error === false) setBlogs(res.data || []);
    setLoading(false);
  });

  useEffect(() => { load(); }, [Context.refetchBlogs, Context.isOpenFullScreenPanel?.open]);
  useEffect(() => { setPage(1); setSelected([]); }, [tab, search, tag, sort]);

  const allTags = useMemo(() => [...new Set(blogs.flatMap((b) => b.tags || []))].sort(), [blogs]);
  const q = search.trim().toLowerCase();
  const base = blogs.filter((b) =>
    (!q || [b.title, b.excerpt, b.author, b.description, ...(b.tags || [])].some((v) => String(v || "").toLowerCase().includes(q))) &&
    (!tag || b.tags?.includes(tag)));
  const counts = { "": base.length, published: base.filter((b) => b.status !== "draft").length, draft: base.filter((b) => b.status === "draft").length };
  const rows = useMemo(() => {
    const list = base.filter((b) => !tab || (tab === "draft" ? b.status === "draft" : b.status !== "draft"));
    const by = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      title: (a, b) => a.title.localeCompare(b.title),
    };
    return list.sort(by[sort]);
  }, [base, tab, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const visible = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const from = rows.length ? (page - 1) * PER_PAGE + 1 : 0;
  const filtersOn = q || tag || tab;
  const clear = () => { setSearch(""); setTag(""); setTab(""); };

  const open = (model, data) => Context.setIsOpenFullScreenPanel({ open: true, model, data });
  const allOnPage = visible.length > 0 && visible.every((b) => selected.includes(b._id));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => {
    const ids = visible.map((b) => b._id);
    setSelected((s) => (allOnPage ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]));
  };

  const setStatus = async (b, status) => {
    const res = await putData(`/api/blog/${b._id}`, { ...b, status });
    if (res?.error === false) {
      setBlogs((l) => l.map((x) => (x._id === b._id ? res.data : x)));
      Context.openAlertBox("success", status === "draft" ? "Moved to drafts" : "Post published");
    } else Context.openAlertBox("error", res?.message || "Could not update post");
  };

  const deleteOne = async (b) => {
    if (!window.confirm(`Delete "${b.title}"? Its images will also be removed. This cannot be undone.`)) return;
    const res = await deleteData(`/api/blog/${b._id}`);
    if (res?.error === false) {
      Context.openAlertBox("success", "Post deleted");
      setSelected((s) => s.filter((x) => x !== b._id));
      load();
    } else Context.openAlertBox("error", res?.message || "Failed to delete post");
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.length} post(s)? This cannot be undone.`)) return;
    const res = await postData("/api/blog/delete-multiple", { ids: selected });
    if (res?.error === false) {
      Context.openAlertBox("success", `${selected.length} post(s) deleted`);
      setSelected([]);
      load();
    } else Context.openAlertBox("error", res?.message || "Failed to delete posts");
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Blog</h1>
          <div className="text-[14px] text-gray-500">Write stories and guides shown on the store home page.</div>
        </div>
        <button className="pdBtn pdBtn--dark" onClick={() => open("Add Blog")}><FiPlus /> New post</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {TABS.map(([k, l]) => (
            <button key={k || "all"} className={`pdTab ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>
              {l}
              <b className={`text-[11px] px-1.5 rounded-full ${tab === k ? "bg-white/20" : "bg-black/[.07]"}`}>{loading ? "…" : counts[k]}</b>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          <div className="pdSearch w-full md:w-[280px]">
            <FiSearch className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, author, tag" />
            {search && <button onClick={() => setSearch("")} aria-label="Clear" className="text-gray-400"><FiX /></button>}
          </div>
          <select className="pdSelect" value={tag} onChange={(e) => setTag(e.target.value)} disabled={!allTags.length}>
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {filtersOn && <button className="text-[12px] font-[600] text-gray-500 hover:text-[#ff5252] flex items-center gap-1" onClick={clear}><FiX /> Clear filters</button>}
          <select className="pdSelect md:ml-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        {selected.length > 0 && (
          <div className="mx-4 mt-3 flex items-center gap-3 bg-[#111827] text-white rounded-md px-4 py-2">
            <span className="text-[13px] font-[600]">{selected.length} selected</span>
            <button onClick={() => setSelected([])} className="text-[12px] text-gray-300 hover:text-white flex items-center gap-1"><FiX /> Clear</button>
            <button onClick={deleteSelected} className="ml-auto h-8 px-3 rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-[12px] font-[600] flex items-center gap-1.5"><FiTrash2 /> Delete</button>
          </div>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="pdTable">
            <thead>
              <tr>
                <th className="w-[44px]"><Check checked={allOnPage} onChange={toggleAll} disabled={!visible.length} label="Select all" /></th>
                <th>Post</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Published</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan="6"><div className="h-14 rounded bg-gray-100 animate-pulse" /></td></tr>)
              ) : visible.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="py-14 flex flex-col items-center gap-2 text-center">
                    <FiFileText className="text-[28px] text-gray-300" />
                    <div className="text-[14px] font-[600] text-gray-800">{filtersOn ? "No posts match these filters" : "No blog posts yet"}</div>
                    {filtersOn
                      ? <button onClick={clear} className="text-[13px] font-[600] text-[#ff5252] hover:underline">Clear filters</button>
                      : <button onClick={() => open("Add Blog")} className="pdBtn pdBtn--dark mt-1"><FiPlus /> Write your first post</button>}
                  </div>
                </td></tr>
              ) : visible.map((b) => {
                const draft = b.status === "draft";
                return (
                  <tr key={b._id} className={selected.includes(b._id) ? "is-selected" : ""}>
                    <td><Check checked={selected.includes(b._id)} onChange={() => toggle(b._id)} /></td>
                    <td>
                      <button className="flex items-center gap-3 text-left min-w-[320px] max-w-[520px]" onClick={() => open("Edit Blog", b)}>
                        {b.images?.[0] ? <img src={b.images[0]} alt="" className="blgThumb" /> : <span className="blgThumb flex items-center justify-center text-gray-300"><FiFileText /></span>}
                        <span className="min-w-0">
                          <span className="block font-[600] text-gray-900 line-clamp-1 hover:text-[#ff5252]">{b.title}</span>
                          <span className="block text-[12px] text-gray-500 line-clamp-1">{b.excerpt || plainExcerpt(b.description, 110)}</span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">{[b.author, `${readTime(b.description)} min read`, b.images?.length > 1 && `${b.images.length} images`].filter(Boolean).join(" · ")}</span>
                        </span>
                      </button>
                    </td>
                    <td>{draft ? <span className="pdBadge pdBadge--amber"><i />Draft</span> : <span className="pdBadge pdBadge--green"><i />Published</span>}</td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {b.tags?.length ? b.tags.slice(0, 3).map((t) => <button key={t} onClick={() => setTag(t)} className="pdBadge pdBadge--blue !normal-case hover:opacity-80">{t}</button>) : <span className="text-gray-300">—</span>}
                        {b.tags?.length > 3 && <span className="text-[11px] text-gray-400">+{b.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="text-gray-900">{fmt(b.createdAt)}</div>
                      {b.updatedAt && new Date(b.updatedAt) - new Date(b.createdAt) > 60000 && <div className="text-[12px] text-gray-400">Edited {fmt(b.updatedAt)}</div>}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        {!draft && <a className="pdIconBtn" title="View on store" href={`${STORE_URL}/blog/${b._id}`} target="_blank" rel="noreferrer"><FiExternalLink /></a>}
                        <button className="pdIconBtn" title={draft ? "Publish" : "Move to drafts"} onClick={() => setStatus(b, draft ? "published" : "draft")}>{draft ? <FiEye /> : <FiEyeOff />}</button>
                        <button className="pdIconBtn" title="Edit" onClick={() => open("Edit Blog", b)}><FiEdit2 /></button>
                        <button className="pdIconBtn pdIconBtn--danger" title="Delete" onClick={() => deleteOne(b)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">{rows.length ? `Showing ${from}–${from + visible.length - 1} of ${rows.length}` : "0 posts"}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button className="pdPage" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous"><FiChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`pdPage ${i + 1 === page ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="pdPage" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next"><FiChevronRight /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;
