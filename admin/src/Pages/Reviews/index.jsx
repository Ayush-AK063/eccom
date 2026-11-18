import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiX, FiEye, FiEyeOff, FiTrash2, FiCheck, FiMessageSquare, FiStar, FiChevronLeft, FiChevronRight, FiExternalLink, FiSettings } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData, putData, postData } from "../../utils/api";
import { Check } from "../Products/shared";
import "../Products/style.css";
import "../Category/style.css";

const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5173";
const PER_PAGE = 12;
const TABS = [["", "All"], ["pending", "Pending"], ["approved", "Published"], ["hidden", "Hidden"]];
const SORTS = [["newest", "Newest first"], ["oldest", "Oldest first"], ["low", "Lowest rating"], ["high", "Highest rating"]];
const stOf = (r) => r.status || "approved";
const BADGE = { approved: ["pdBadge--green", "Published"], pending: ["pdBadge--amber", "Pending"], hidden: ["", "Hidden"] };

const Stars = ({ n }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => <FiStar key={i} className={`text-[13px] ${i <= n ? "text-[#f59e0b] fill-[#f59e0b]" : "text-gray-200"}`} />)}
  </span>
);

const Reviews = () => {
  const Context = useContext(MyContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [rating, setRating] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [replying, setReplying] = useState(null); // review id
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(null);

  const load = () => getData("/api/review/admin/all").then((res) => {
    if (res?.error === false) setList(res.data || []);
    setLoading(false);
  });
  useEffect(() => { window.scrollTo(0, 0); load(); }, []);
  useEffect(() => { setPage(1); setSelected([]); }, [tab, rating, search, sort]);

  const q = search.trim().toLowerCase();
  const base = useMemo(() => list.filter((r) =>
    (!rating || (rating === "low" ? r.rating <= 2 : r.rating === Number(rating))) &&
    (!q || [r.review, r.userName, r.userId?.email, r.productId?.name].some((v) => String(v || "").toLowerCase().includes(q)))), [list, rating, q]);
  const counts = Object.fromEntries(TABS.map(([k]) => [k, k ? base.filter((r) => stOf(r) === k).length : base.length]));
  const rows = useMemo(() => {
    const l = base.filter((r) => !tab || stOf(r) === tab);
    const by = { newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt), low: (a, b) => a.rating - b.rating, high: (a, b) => b.rating - a.rating };
    return l.sort(by[sort]);
  }, [base, tab, sort]);

  const stats = useMemo(() => {
    const live = list.filter((r) => stOf(r) === "approved");
    return {
      avg: live.length ? live.reduce((s, r) => s + r.rating, 0) / live.length : 0,
      total: list.length, pending: list.filter((r) => stOf(r) === "pending").length,
      low: live.filter((r) => r.rating <= 2).length, unreplied: live.filter((r) => !r.reply).length,
    };
  }, [list]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const visible = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const from = rows.length ? (page - 1) * PER_PAGE + 1 : 0;
  const filtersOn = tab || rating || q;
  const clear = () => { setTab(""); setRating(""); setSearch(""); };
  const allOnPage = visible.length > 0 && visible.every((r) => selected.includes(r._id));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => {
    const ids = visible.map((r) => r._id);
    setSelected((s) => (allOnPage ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]));
  };

  const update = async (r, body, msg) => {
    setBusy(r._id);
    const res = await putData(`/api/review/admin/${r._id}`, body);
    setBusy(null);
    if (res?.error === false) { setList((l) => l.map((x) => (x._id === r._id ? res.data : x))); Context.openAlertBox("success", msg); return true; }
    Context.openAlertBox("error", res?.message || "Could not update review");
    return false;
  };

  const bulk = async (action) => {
    const n = selected.length;
    if (action === "delete" && !window.confirm(`Delete ${n} review(s)? Product ratings will be recalculated. This cannot be undone.`)) return;
    const res = await postData("/api/review/admin/bulk", { ids: selected, action });
    if (res?.error === false) { Context.openAlertBox("success", res.message); setSelected([]); load(); }
    else Context.openAlertBox("error", res?.message || "Bulk action failed");
  };
  const deleteOne = async (r) => {
    if (!window.confirm(`Delete this review by ${r.userName || "customer"}? This cannot be undone.`)) return;
    const res = await postData("/api/review/admin/bulk", { ids: [r._id], action: "delete" });
    if (res?.error === false) { Context.openAlertBox("success", "Review deleted"); setList((l) => l.filter((x) => x._id !== r._id)); }
    else Context.openAlertBox("error", res?.message || "Could not delete review");
  };

  const startReply = (r) => { setReplying(r._id); setReplyText(r.reply || ""); };
  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Reviews</h1>
          <div className="text-[14px] text-gray-500">Approve, hide or reply to what customers say about your products.</div>
        </div>
        <Link className="pdBtn pdBtn--light" to="/settings?tab=reviews"><FiSettings /> Moderation settings</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [FiStar, "Average rating", stats.avg ? stats.avg.toFixed(1) : "—", `${stats.total} reviews`, () => clear()],
          [FiEye, "Pending", stats.pending, "Waiting for approval", () => setTab("pending")],
          [FiX, "1–2 star reviews", stats.low, "Published, need attention", () => { setTab("approved"); setRating("low"); }],
          [FiMessageSquare, "Not replied", stats.unreplied, "Published reviews", () => setTab("approved")],
        ].map(([Icon, label, n, sub, go]) => (
          <button key={label} onClick={go} className="catStat">
            <span className="catStat__icon"><Icon /></span>
            <span className="text-left min-w-0">
              <span className="block text-[12px] text-gray-500 font-[500]">{label}</span>
              <span className="block text-[20px] font-[700] text-gray-900 leading-tight">{loading ? "…" : n}</span>
              <span className="block text-[11px] text-gray-400 truncate">{sub}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {TABS.map(([k, l]) => (
            <button key={k || "all"} className={`pdTab ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>
              {l}<b className={`text-[11px] px-1.5 rounded-full ${tab === k ? "bg-white/20" : "bg-black/[.07]"}`}>{loading ? "…" : counts[k]}</b>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          <div className="pdSearch w-full md:w-[300px]">
            <FiSearch className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search text, customer or product" />
            {search && <button onClick={() => setSearch("")} aria-label="Clear" className="text-gray-400"><FiX /></button>}
          </div>
          <select className="pdSelect" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Any rating</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            <option value="low">1–2 stars</option>
          </select>
          {filtersOn && <button className="text-[12px] font-[600] text-gray-500 hover:text-[#ff5252] flex items-center gap-1" onClick={clear}><FiX /> Clear filters</button>}
          <select className="pdSelect md:ml-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        {selected.length > 0 && (
          <div className="mx-4 mt-3 flex flex-wrap items-center gap-3 bg-[#111827] text-white rounded-md px-4 py-2">
            <span className="text-[13px] font-[600]">{selected.length} selected</span>
            <button onClick={() => setSelected([])} className="text-[12px] text-gray-300 hover:text-white flex items-center gap-1"><FiX /> Clear</button>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => bulk("approved")} className="h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 text-[12px] font-[600] flex items-center gap-1.5"><FiCheck /> Publish</button>
              <button onClick={() => bulk("hidden")} className="h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 text-[12px] font-[600] flex items-center gap-1.5"><FiEyeOff /> Hide</button>
              <button onClick={() => bulk("delete")} className="h-8 px-3 rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-[12px] font-[600] flex items-center gap-1.5"><FiTrash2 /> Delete</button>
            </div>
          </div>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="pdTable">
            <thead>
              <tr>
                <th className="w-[44px]"><Check checked={allOnPage} onChange={toggleAll} disabled={!visible.length} label="Select all" /></th>
                <th>Review</th>
                <th>Product</th>
                <th>Status</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan="5"><div className="h-16 rounded bg-gray-100 animate-pulse" /></td></tr>)
              ) : visible.length === 0 ? (
                <tr><td colSpan="5">
                  <div className="py-14 flex flex-col items-center gap-2 text-center">
                    <FiMessageSquare className="text-[28px] text-gray-300" />
                    <div className="text-[14px] font-[600] text-gray-800">{filtersOn ? "No reviews match these filters" : "No reviews yet"}</div>
                    {filtersOn && <button onClick={clear} className="text-[13px] font-[600] text-[#ff5252] hover:underline">Clear filters</button>}
                  </div>
                </td></tr>
              ) : visible.map((r) => {
                const st = stOf(r);
                const [cls, label] = BADGE[st];
                return (
                  <tr key={r._id} className={selected.includes(r._id) ? "is-selected" : ""}>
                    <td className="!align-top !pt-4"><Check checked={selected.includes(r._id)} onChange={() => toggle(r._id)} /></td>
                    <td className="!align-top">
                      <div className="min-w-[300px] max-w-[520px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Stars n={r.rating} />
                          <span className="text-[13px] font-[600] text-gray-900">{r.userName || r.userId?.name || "Customer"}</span>
                          <span className="text-[12px] text-gray-400">{r.userId?.email} · {fmt(r.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-[13px] leading-[20px] text-gray-700 whitespace-pre-line line-clamp-4">{r.review}</div>
                        {replying === r._id ? (
                          <div className="mt-2">
                            <textarea className="pdInput !min-h-[70px] text-[13px]" autoFocus maxLength={1000} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a public reply…" />
                            <div className="flex items-center gap-2 mt-2">
                              <button className="pdBtn pdBtn--dark !h-8" disabled={busy === r._id} onClick={async () => { if (await update(r, { reply: replyText }, replyText.trim() ? "Reply saved" : "Reply removed")) setReplying(null); }}>Save reply</button>
                              <button className="pdBtn pdBtn--light !h-8" onClick={() => setReplying(null)}>Cancel</button>
                              <span className="ml-auto text-[11px] text-gray-400">Shown under the review on the store</span>
                            </div>
                          </div>
                        ) : r.reply ? (
                          <button className="mt-2 block w-full text-left pl-3 border-l-2 border-gray-200 hover:border-gray-900" onClick={() => startReply(r)}>
                            <span className="block text-[11px] font-[700] text-gray-500">Your reply</span>
                            <span className="block text-[12px] text-gray-600 line-clamp-2">{r.reply}</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="!align-top">
                      {r.productId ? (
                        <a href={`${STORE_URL}/product/${r.productId._id}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 max-w-[220px] group">
                          {r.productId.images?.[0] && <img src={r.productId.images[0]} alt="" className="w-9 h-9 rounded border border-gray-100 object-cover shrink-0" />}
                          <span className="text-[12px] text-gray-700 line-clamp-2 group-hover:text-[#ff5252]">{r.productId.name}</span>
                          <FiExternalLink className="text-gray-300 shrink-0" />
                        </a>
                      ) : <span className="text-[12px] text-gray-400">Product deleted</span>}
                    </td>
                    <td className="!align-top"><span className={`pdBadge ${cls}`}><i />{label}</span></td>
                    <td className="!align-top">
                      <div className="flex items-center justify-end gap-0.5">
                        {st !== "approved" && <button className="pdIconBtn" title="Publish" disabled={busy === r._id} onClick={() => update(r, { status: "approved" }, "Review published")}><FiCheck /></button>}
                        {st !== "hidden" && <button className="pdIconBtn" title="Hide from store" disabled={busy === r._id} onClick={() => update(r, { status: "hidden" }, "Review hidden")}><FiEyeOff /></button>}
                        <button className="pdIconBtn" title={r.reply ? "Edit reply" : "Reply"} onClick={() => startReply(r)}><FiMessageSquare /></button>
                        <button className="pdIconBtn pdIconBtn--danger" title="Delete" onClick={() => deleteOne(r)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">{rows.length ? `Showing ${from}–${from + visible.length - 1} of ${rows.length}` : "0 reviews"}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button className="pdPage" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous"><FiChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => <button key={i} className={`pdPage ${i + 1 === page ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
              <button className="pdPage" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next"><FiChevronRight /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
