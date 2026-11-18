import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2, FiTag, FiCopy } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { MyContext } from "../../App";
import { getData, postData, putData, deleteData } from "../../utils/api";
import "../Products/style.css";

const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const EMPTY = { code: "", description: "", type: "percent", value: 10, maxDiscount: 0, minOrder: 0, startsAt: null, endsAt: null, usageLimit: 0, perUserLimit: 1, isActive: true, firstOrderOnly: false };
const toLocal = (v) => { if (!v) return ""; const t = new Date(v); return new Date(t - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const fromLocal = (v) => (v ? new Date(v).toISOString() : null);

const stateOf = (c) => {
  const now = Date.now();
  if (!c.isActive) return ["Paused", ""];
  if (c.startsAt && new Date(c.startsAt) > now) return ["Scheduled", "pdBadge--blue"];
  if (c.endsAt && new Date(c.endsAt) < now) return ["Expired", "pdBadge--red"];
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return ["Used up", "pdBadge--red"];
  return ["Active", "pdBadge--green"];
};
const offText = (c) => (c.type === "percent" ? `${c.value}% off${c.maxDiscount ? ` (up to ${inr(c.maxDiscount)})` : ""}` : `${inr(c.value)} off`);

const CouponForm = ({ initial, onClose, onSaved }) => {
  const context = useContext(MyContext);
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const n = (k) => (e) => set(k, e.target.value === "" ? 0 : Number(e.target.value));
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = f._id ? await putData(`/api/coupon/${f._id}`, f) : await postData("/api/coupon", f);
    setSaving(false);
    if (res?.error === false) { context.openAlertBox("success", res.message); onSaved(); }
    else context.openAlertBox("error", res?.message || "Could not save coupon");
  };
  const example = 1000;
  const exOff = Math.min(example, f.type === "percent" ? Math.min((example * f.value) / 100, f.maxDiscount || Infinity) : f.value);

  return (
    <div className="fixed inset-0 z-[1300] bg-black/40 flex items-start justify-center p-4 overflow-auto" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={save} className="bg-white rounded-md w-full max-w-[640px] my-8 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-[16px] font-[700] text-gray-900">{f._id ? "Edit coupon" : "New coupon"}</div>
          <button type="button" className="pdIconBtn" onClick={onClose}><FiX /></button>
        </div>
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="pdLabel">Code <em>*</em></label>
            <input className="pdInput uppercase font-[700] tracking-wide" value={f.code} maxLength={30} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))} placeholder="WELCOME10" />
          </div>
          <div>
            <label className="pdLabel">Shown to customer</label>
            <input className="pdInput" value={f.description} maxLength={200} onChange={(e) => set("description", e.target.value)} placeholder="10% off your first order" />
          </div>
          <div>
            <label className="pdLabel">Discount type</label>
            <div className="flex gap-2">
              {[["percent", "Percent %"], ["flat", "Flat ₹"]].map(([k, l]) => <button type="button" key={k} className={`pdChip flex-1 justify-center ${f.type === k ? "is-on" : ""}`} onClick={() => set("type", k)}>{l}</button>)}
            </div>
          </div>
          <div>
            <label className="pdLabel">{f.type === "percent" ? "Percent off" : "Amount off (₹)"} <em>*</em></label>
            <input type="number" min="0" max={f.type === "percent" ? 100 : undefined} className="pdInput pdNum" value={f.value} onChange={n("value")} />
          </div>
          {f.type === "percent" && (
            <div><label className="pdLabel">Max discount (₹)</label><input type="number" min="0" className="pdInput pdNum" value={f.maxDiscount} onChange={n("maxDiscount")} /><div className="pdHint">0 = no cap.</div></div>
          )}
          <div><label className="pdLabel">Minimum order (₹)</label><input type="number" min="0" className="pdInput pdNum" value={f.minOrder} onChange={n("minOrder")} /><div className="pdHint">0 = any amount.</div></div>
          <div><label className="pdLabel">Starts</label><input type="datetime-local" className="pdInput" value={toLocal(f.startsAt)} onChange={(e) => set("startsAt", fromLocal(e.target.value))} /><div className="pdHint">Empty = right away.</div></div>
          <div><label className="pdLabel">Ends</label><input type="datetime-local" className="pdInput" value={toLocal(f.endsAt)} onChange={(e) => set("endsAt", fromLocal(e.target.value))} /><div className="pdHint">Empty = never.</div></div>
          <div><label className="pdLabel">Total uses</label><input type="number" min="0" className="pdInput pdNum" value={f.usageLimit} onChange={n("usageLimit")} /><div className="pdHint">0 = unlimited.{f._id ? ` Used ${f.usedCount || 0} times.` : ""}</div></div>
          <div><label className="pdLabel">Uses per customer</label><input type="number" min="0" className="pdInput pdNum" value={f.perUserLimit} onChange={n("perUserLimit")} /><div className="pdHint">0 = unlimited.</div></div>
          <button type="button" onClick={() => set("firstOrderOnly", !f.firstOrderOnly)} className="flex items-center gap-3 text-left"><span className={`pdSwitch ${f.firstOrderOnly ? "is-on" : ""}`} /><span className="text-[13px] font-[600]">First order only</span></button>
          <button type="button" onClick={() => set("isActive", !f.isActive)} className="flex items-center gap-3 text-left"><span className={`pdSwitch ${f.isActive ? "is-on" : ""}`} /><span className="text-[13px] font-[600]">{f.isActive ? "Active" : "Paused"}</span></button>
          <div className="sm:col-span-2 rounded-md bg-[#f9fafb] border border-gray-100 p-3 text-[13px] text-gray-700">
            On a {inr(example)} cart{f.minOrder > example ? ` (below the ${inr(f.minOrder)} minimum — not applicable)` : <>: customer saves <b className="text-[#059669]">{inr(exOff)}</b> and pays {inr(example - exOff)} + shipping.</>}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" className="pdBtn pdBtn--light" onClick={onClose}>Cancel</button>
          <button className="pdBtn pdBtn--dark" disabled={saving}>{saving ? <CircularProgress size={16} color="inherit" /> : f._id ? "Save coupon" : "Create coupon"}</button>
        </div>
      </form>
    </div>
  );
};

const Coupons = () => {
  const context = useContext(MyContext);
  const [list, setList] = useState(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("");
  const [editing, setEditing] = useState(null);

  const load = () => getData("/api/coupon").then((res) => setList(res?.data || []));
  useEffect(() => { window.scrollTo(0, 0); load(); }, []);

  const rows = useMemo(() => (list || []).filter((c) =>
    (!q || [c.code, c.description].some((v) => String(v || "").toLowerCase().includes(q.toLowerCase()))) &&
    (!tab || stateOf(c)[0] === tab)), [list, q, tab]);
  const tabs = ["", "Active", "Scheduled", "Expired", "Paused", "Used up"];
  const count = (t) => (list || []).filter((c) => !t || stateOf(c)[0] === t).length;

  const toggle = async (c) => {
    const res = await putData(`/api/coupon/${c._id}`, { ...c, isActive: !c.isActive });
    if (res?.error === false) { context.openAlertBox("success", c.isActive ? "Coupon paused" : "Coupon activated"); load(); }
    else context.openAlertBox("error", res?.message || "Could not update");
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}? Past orders keep their discount.`)) return;
    const res = await deleteData(`/api/coupon/${c._id}`);
    if (res?.error === false) { context.openAlertBox("success", "Coupon deleted"); load(); }
    else context.openAlertBox("error", res?.message || "Could not delete");
  };
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Coupons</h1>
          <div className="text-[14px] text-gray-500">Discount codes customers enter in the cart or at checkout.</div>
        </div>
        <button className="pdBtn pdBtn--dark" onClick={() => setEditing({})}><FiPlus /> New coupon</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t || "all"} className={`pdTab ${tab === t ? "is-active" : ""}`} onClick={() => setTab(t)}>
              {t || "All"}<b className={`text-[11px] px-1.5 rounded-full ${tab === t ? "bg-white/20" : "bg-black/[.07]"}`}>{list ? count(t) : "…"}</b>
            </button>
          ))}
        </div>
        <div className="px-4 pt-3">
          <div className="pdSearch w-full md:w-[280px]"><FiSearch className="text-gray-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code" />{q && <button onClick={() => setQ("")}><FiX /></button>}</div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="pdTable">
            <thead><tr><th>Code</th><th>Discount</th><th>Conditions</th><th>Valid</th><th className="text-right">Used</th><th>Status</th><th className="text-right pr-5">Actions</th></tr></thead>
            <tbody>
              {list === null ? [...Array(4)].map((_, i) => <tr key={i}><td colSpan="7"><div className="h-10 rounded bg-gray-100 animate-pulse" /></td></tr>)
                : rows.length === 0 ? (
                  <tr><td colSpan="7"><div className="py-14 flex flex-col items-center gap-2 text-center">
                    <FiTag className="text-[28px] text-gray-300" />
                    <div className="text-[14px] font-[600] text-gray-800">{list.length ? "No coupons match" : "No coupons yet"}</div>
                    {!list.length && <button className="pdBtn pdBtn--dark mt-1" onClick={() => setEditing({})}><FiPlus /> Create your first coupon</button>}
                  </div></td></tr>
                ) : rows.map((c) => {
                  const [label, cls] = stateOf(c);
                  return (
                    <tr key={c._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-[800] tracking-wide text-gray-900 px-2 py-0.5 border border-dashed border-gray-300 rounded">{c.code}</span>
                          <button className="pdIconBtn !w-7 !h-7" title="Copy" onClick={() => navigator.clipboard?.writeText(c.code).then(() => context.openAlertBox("success", "Copied"))}><FiCopy /></button>
                        </div>
                        {c.description && <div className="text-[12px] text-gray-500 mt-1 max-w-[220px] truncate">{c.description}</div>}
                      </td>
                      <td className="whitespace-nowrap font-[600] text-gray-900">{offText(c)}</td>
                      <td className="text-[12px] text-gray-600">
                        {[c.minOrder > 0 && `Min ${inr(c.minOrder)}`, c.perUserLimit > 0 && `${c.perUserLimit}× per customer`, c.firstOrderOnly && "First order"].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="text-[12px] text-gray-600 whitespace-nowrap">{fmt(c.startsAt) || "Now"} → {fmt(c.endsAt) || "No end"}</td>
                      <td className="text-right tabular-nums">{c.usedCount || 0}{c.usageLimit > 0 && <span className="text-gray-400"> / {c.usageLimit}</span>}</td>
                      <td><span className={`pdBadge ${cls}`}><i />{label}</span></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button className="flex items-center" title={c.isActive ? "Pause" : "Activate"} onClick={() => toggle(c)}><span className={`pdSwitch ${c.isActive ? "is-on" : ""}`} /></button>
                          <button className="pdIconBtn" title="Edit" onClick={() => setEditing(c)}><FiEdit2 /></button>
                          <button className="pdIconBtn pdIconBtn--danger" title="Delete" onClick={() => remove(c)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <CouponForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
};

export default Coupons;
