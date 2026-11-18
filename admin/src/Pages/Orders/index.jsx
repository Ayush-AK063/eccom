import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FiSearch, FiX, FiEye, FiChevronLeft, FiChevronRight, FiShoppingBag, FiClock, FiTruck, FiCheckCircle, FiPrinter, FiDownload,
} from "react-icons/fi";
import { MyContext } from "../../App";
import { getData } from "../../utils/api";
import { Check } from "../Products/shared";
import { STATUS_META, inr, shortId, fmtDate, fmtTime, itemCount, setStatus, printInvoice, canCancel } from "./orderUtils";
import StatusBadge from "./StatusBadge";
import "../Products/style.css";
import "./style.css";

const PER_PAGE = 12;
const TABS = ["", "pending", "confirmed", "shipped", "delivered", "cancelled", "returns"];
const isReturn = (o) => ["requested", "approved"].includes(o.returnRequest?.status);
const RANGES = [["", "All time"], ["today", "Today"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]];
const SORTS = [["newest", "Newest first"], ["oldest", "Oldest first"], ["total_desc", "Total: high to low"], ["total_asc", "Total: low to high"]];

const inRange = (d, range) => {
  if (!range) return true;
  const t = new Date(d).getTime();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  if (range === "today") return t >= start.getTime();
  return t >= start.getTime() - (Number(range) - 1) * 864e5;
};

const toCsv = (list) => {
  const head = ["Order", "Date", "Customer", "Email", "Phone", "City", "Pincode", "Items", "Total", "Payment", "Status"];
  const rows = list.map((o) => {
    const a = o.deliveryAddress || {};
    return [shortId(o._id), new Date(o.createdAt).toISOString(), a.name || o.userId?.name, o.userId?.email, a.mobile, a.townCity, a.pincode, itemCount(o), o.totalAmt, o.paymentId || "COD", o.orderStatus];
  });
  return [head, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
};

const Orders = () => {
  const Context = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = () => getData("/api/order/all").then((res) => {
    if (res?.error === false) setOrders(res.data || []);
    setLoading(false);
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { load(); }, [Context.isOpenFullScreenPanel?.open]);
  useEffect(() => { setPage(1); setSelected([]); }, [tab, search, range, sort]);

  const q = search.trim().toLowerCase();
  const base = useMemo(() => orders.filter((o) => {
    if (!inRange(o.createdAt, range)) return false;
    if (!q) return true;
    const a = o.deliveryAddress || {};
    return [shortId(o._id), o._id, a.name, o.userId?.name, o.userId?.email, a.mobile, a.pincode, a.townCity, ...(o.products || []).map((p) => p.productTitle)]
      .some((v) => String(v || "").toLowerCase().includes(q));
  }), [orders, q, range]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t, t === "returns" ? base.filter(isReturn).length : t ? base.filter((o) => o.orderStatus === t).length : base.length])), [base]);
  const rows = useMemo(() => {
    const list = tab === "returns" ? base.filter(isReturn) : tab ? base.filter((o) => o.orderStatus === tab) : [...base];
    const by = { newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt), total_desc: (a, b) => b.totalAmt - a.totalAmt, total_asc: (a, b) => a.totalAmt - b.totalAmt };
    return list.sort(by[sort]);
  }, [base, tab, sort]);

  const kpi = useMemo(() => {
    const live = base.filter((o) => o.orderStatus !== "cancelled");
    const revenue = live.reduce((s, o) => s + (o.totalAmt || 0), 0);
    return {
      revenue, orders: base.length, aov: live.length ? revenue / live.length : 0,
      toProcess: base.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length,
      inTransit: base.filter((o) => o.orderStatus === "shipped").length,
      delivered: base.filter((o) => o.orderStatus === "delivered").length,
    };
  }, [base]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const visible = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const from = rows.length ? (page - 1) * PER_PAGE + 1 : 0;
  const filtersOn = q || range || tab;
  const clear = () => { setSearch(""); setRange(""); setTab(""); };

  const allOnPage = visible.length > 0 && visible.every((o) => selected.includes(o._id));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => {
    const ids = visible.map((o) => o._id);
    setSelected((s) => (allOnPage ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]));
  };

  const replace = (o) => setOrders((list) => list.map((x) => (x._id === o._id ? { ...x, ...o, userId: o.userId?._id ? o.userId : x.userId } : x)));

  const advance = async (o, status) => {
    setBusy(o._id);
    const r = await setStatus(o, status);
    setBusy(null);
    if (r.skipped) return;
    if (r.ok) { replace(r.order); Context.openAlertBox("success", `${shortId(o._id)} → ${STATUS_META[status].label}`); }
    else Context.openAlertBox("error", r.message);
  };

  // Bulk: sirf wahi orders jinke liye ye agla step valid hai
  const chosen = orders.filter((o) => selected.includes(o._id));
  const bulkOptions = ["confirmed", "shipped", "delivered"].filter((s) => chosen.some((o) => STATUS_META[o.orderStatus]?.next === s));
  const bulk = async (status) => {
    const targets = chosen.filter((o) => STATUS_META[o.orderStatus]?.next === status);
    if (!window.confirm(`Mark ${targets.length} order(s) as ${STATUS_META[status].label.toLowerCase()}?`)) return;
    setBusy("bulk");
    let ok = 0;
    for (const o of targets) {
      const r = await setStatus(o, status);
      if (r.ok) { ok++; replace(r.order); }
    }
    setBusy(null);
    setSelected([]);
    Context.openAlertBox(ok === targets.length ? "success" : "error", `${ok} of ${targets.length} order(s) updated`);
  };

  const exportCsv = () => {
    const list = selected.length ? rows.filter((o) => selected.includes(o._id)) : rows;
    const url = URL.createObjectURL(new Blob([toCsv(list)], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const open = (o) => Context.setIsOpenFullScreenPanel({ open: true, model: "View Order", data: o });

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Orders</h1>
          <div className="text-[14px] text-gray-500">Track, fulfil and manage customer orders.</div>
        </div>
        <button className="pdBtn pdBtn--light" onClick={exportCsv} disabled={!rows.length}><FiDownload /> Export CSV{selected.length ? ` (${selected.length})` : ""}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [FiShoppingBag, "Revenue", inr(kpi.revenue), `${kpi.orders} orders · avg ${inr(kpi.aov)}`, ""],
          [FiClock, "To process", kpi.toProcess, "Pending + confirmed", "pending"],
          [FiTruck, "In transit", kpi.inTransit, "Shipped, not delivered", "shipped"],
          [FiCheckCircle, "Delivered", kpi.delivered, range ? RANGES.find((r) => r[0] === range)[1] : "All time", "delivered"],
        ].map(([Icon, label, n, sub, t]) => (
          <button key={label} onClick={() => setTab(t)} className="catStat">
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
          {TABS.map((t) => (
            <button key={t || "all"} className={`pdTab ${tab === t ? "is-active" : ""}`} onClick={() => setTab(t)}>
              {t === "returns" ? "Return requests" : t ? STATUS_META[t].label : "All"}
              <b className={`text-[11px] px-1.5 rounded-full ${tab === t ? "bg-white/20" : "bg-black/[.07]"}`}>{loading ? "…" : counts[t]}</b>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          <div className="pdSearch w-full md:w-[320px]">
            <FiSearch className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order #, customer, phone, pincode, product" />
            {search && <button onClick={() => setSearch("")} aria-label="Clear" className="text-gray-400"><FiX /></button>}
          </div>
          <select className="pdSelect" value={range} onChange={(e) => setRange(e.target.value)}>
            {RANGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
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
              {bulkOptions.map((s) => (
                <button key={s} disabled={busy === "bulk"} onClick={() => bulk(s)} className="h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 text-[12px] font-[600] disabled:opacity-50">
                  Mark {STATUS_META[s].label.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="pdTable">
            <thead>
              <tr>
                <th className="w-[44px]"><Check checked={allOnPage} onChange={toggleAll} disabled={!visible.length} label="Select all" /></th>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th className="text-right">Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <tr key={i}><td colSpan="9"><div className="h-11 rounded bg-gray-100 animate-pulse" /></td></tr>)
              ) : visible.length === 0 ? (
                <tr><td colSpan="9">
                  <div className="py-14 flex flex-col items-center gap-2 text-center">
                    <FiShoppingBag className="text-[28px] text-gray-300" />
                    <div className="text-[14px] font-[600] text-gray-800">{filtersOn ? "No orders match these filters" : "No orders yet"}</div>
                    {filtersOn && <button onClick={clear} className="text-[13px] font-[600] text-[#ff5252] hover:underline">Clear filters</button>}
                  </div>
                </td></tr>
              ) : visible.map((o) => {
                const a = o.deliveryAddress || {};
                const meta = STATUS_META[o.orderStatus] || {};
                return (
                  <tr key={o._id} className={selected.includes(o._id) ? "is-selected" : ""}>
                    <td><Check checked={selected.includes(o._id)} onChange={() => toggle(o._id)} /></td>
                    <td><button className="font-[700] text-gray-900 hover:text-[#ff5252] whitespace-nowrap" onClick={() => open(o)}>{shortId(o._id)}</button></td>
                    <td className="whitespace-nowrap"><div className="text-gray-900">{fmtDate(o.createdAt)}</div><div className="text-[12px] text-gray-400">{fmtTime(o.createdAt)}</div></td>
                    <td>
                      <div className="min-w-[160px] max-w-[220px]">
                        <div className="font-[600] text-gray-900 truncate">{a.name || o.userId?.name || "—"}</div>
                        <div className="text-[12px] text-gray-400 truncate">{[a.townCity, a.pincode].filter(Boolean).join(" · ") || o.userId?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="ordStack">
                          {(o.products || []).slice(0, 3).map((p, i) => <img key={i} src={p.image} alt="" title={p.productTitle} />)}
                        </div>
                        <span className="text-[12px] text-gray-500 whitespace-nowrap">{itemCount(o)} item{itemCount(o) === 1 ? "" : "s"}</span>
                      </div>
                    </td>
                    <td className="text-right font-[700] text-gray-900 whitespace-nowrap">{inr(o.totalAmt)}</td>
                    <td><span className="pdBadge">{o.paymentMethod === "COD" || !o.paymentId ? "COD" : "Prepaid"}</span></td>
                    <td>
                      <StatusBadge status={o.orderStatus} />
                      {isReturn(o) && <div className="mt-1"><span className="pdBadge pdBadge--amber !py-0">Return {o.returnRequest.status}</span></div>}
                      {o.tracking?.number && <div className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">{o.tracking.courier} {o.tracking.number}</div>}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {meta.next && (
                          <button className="ordNext" disabled={busy === o._id} onClick={() => advance(o, meta.next)}>{busy === o._id ? "…" : meta.action}</button>
                        )}
                        <button className="pdIconBtn" title="Print invoice" onClick={() => printInvoice(o)}><FiPrinter /></button>
                        <button className="pdIconBtn" title="View details" onClick={() => open(o)}><FiEye /></button>
                        {canCancel(o) && <button className="pdIconBtn pdIconBtn--danger" title="Cancel order" onClick={() => advance(o, "cancelled")}><FiX /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">{rows.length ? `Showing ${from}–${from + visible.length - 1} of ${rows.length}` : "0 orders"}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button className="pdPage" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous"><FiChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <React.Fragment key={n}>
                    {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
                    <button className={`pdPage ${n === page ? "is-active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                  </React.Fragment>
                ))}
              <button className="pdPage" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next"><FiChevronRight /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
