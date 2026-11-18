import React, { useContext, useEffect, useState } from "react";
import { FiShoppingCart, FiHeart, FiSearch, FiAlertCircle, FiMail, FiPhone, FiDownload, FiExternalLink } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData } from "../../utils/api";
import { STORE_URL } from "../Settings/ui";
import "../Products/style.css";
import "../Category/style.css";

const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const ago = (d) => {
  const h = (Date.now() - new Date(d)) / 36e5;
  if (h < 24) return `${Math.max(1, Math.round(h))}h ago`;
  return `${Math.round(h / 24)}d ago`;
};
const DAYS = [[7, "Last 7 days"], [30, "Last 30 days"], [90, "Last 90 days"], [365, "Last year"]];
const IDLE = [[1, "1 hour"], [6, "6 hours"], [24, "24 hours"], [72, "3 days"], [168, "7 days"]];

const Box = ({ title, sub, right, children }) => (
  <div className="bg-white border border-gray-200 rounded-md">
    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
      <div><div className="text-[14px] font-[700] text-gray-900">{title}</div>{sub && <div className="text-[12px] text-gray-500">{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>
);
const Empty = ({ text }) => <div className="px-4 pb-6 pt-2 text-[13px] text-gray-400">{text}</div>;

const ProductRows = ({ rows, metric }) => (
  <div className="divide-y divide-gray-100">
    {rows.map((p, i) => (
      <a key={p.productId} href={`${STORE_URL}/product/${p.productId}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 group">
        <span className="w-5 text-[12px] text-gray-400 tabular-nums">{i + 1}</span>
        {p.image ? <img src={p.image} alt="" className="w-9 h-9 rounded object-cover bg-gray-100 border border-gray-100" /> : <span className="w-9 h-9 rounded bg-gray-100" />}
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-[600] text-gray-900 truncate group-hover:text-[#ff5252]">{p.name}</span>
          <span className="block text-[11px] text-gray-500">{inr(p.price)} · {p.stock > 0 ? `${p.stock} in stock` : <b className="text-[#dc2626]">Out of stock</b>}</span>
        </span>
        <span className="text-right">{metric(p)}</span>
      </a>
    ))}
  </div>
);

const Insights = () => {
  const context = useContext(MyContext);
  const [days, setDays] = useState(30);
  const [idle, setIdle] = useState(24);
  const [d, setD] = useState(null);

  useEffect(() => {
    setD(null);
    getData(`/api/insights?days=${days}&idleHours=${idle}`).then((res) => {
      if (res?.error === false) setD(res.data);
      else { setD({ failed: true }); context.openAlertBox("error", res?.message || "Could not load insights"); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, idle]);

  const exportCarts = () => {
    const rows = [["Name", "Email", "Phone", "Items", "Cart value", "Last activity"], ...(d?.carts || []).map((c) => [c.name, c.email, c.mobile, c.items, Math.round(c.value), new Date(c.last).toISOString()])];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "abandoned-carts.csv"; a.click();
  };

  const s = d?.summary || {};
  const loading = !d;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Insights</h1>
          <div className="text-[14px] text-gray-500">What customers want, leave behind and look for.</div>
        </div>
        <select className="pdSelect" value={days} onChange={(e) => setDays(Number(e.target.value))} title="Applies to searches">
          {DAYS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [FiShoppingCart, "Abandoned carts", s.abandonedCarts, `${inr(s.abandonedValue)} waiting`],
          [FiHeart, "Wishlisted products", s.wishlistedProducts, "Top 15 shown"],
          [FiSearch, "Searches", s.searches, `${s.searchTerms || 0} different terms`],
          [FiAlertCircle, "Searches with no results", s.noResultTerms, "Products people can't find"],
        ].map(([Icon, label, n, sub]) => (
          <div key={label} className="catStat !cursor-default">
            <span className="catStat__icon"><Icon /></span>
            <span className="text-left min-w-0">
              <span className="block text-[12px] text-gray-500 font-[500]">{label}</span>
              <span className="block text-[20px] font-[700] text-gray-900 leading-tight">{loading ? "…" : (n ?? 0).toLocaleString("en-IN")}</span>
              <span className="block text-[11px] text-gray-400 truncate">{loading ? "" : sub}</span>
            </span>
          </div>
        ))}
      </div>

      <Box title="Abandoned carts" sub="Logged-in customers with items in their cart and no activity since — they haven't ordered yet."
        right={<div className="flex items-center gap-2">
          <select className="pdSelect" value={idle} onChange={(e) => setIdle(Number(e.target.value))}>{IDLE.map(([k, l]) => <option key={k} value={k}>Idle for {l}+</option>)}</select>
          {d?.carts?.length > 0 && <button className="pdBtn pdBtn--light !h-9" onClick={exportCarts}><FiDownload /> CSV</button>}
        </div>}>
        {loading ? <div className="px-4 pb-4"><div className="h-24 rounded bg-gray-100 animate-pulse" /></div>
          : !d.carts?.length ? <Empty text="No abandoned carts right now." /> : (
            <div className="overflow-x-auto">
              <table className="pdTable">
                <thead><tr><th>Customer</th><th>Items</th><th className="text-right">Cart value</th><th>Last activity</th><th className="text-right pr-5">Reach out</th></tr></thead>
                <tbody>
                  {d.carts.map((c) => (
                    <tr key={c.userId}>
                      <td><div className="font-[600] text-gray-900">{c.name || "Customer"}</div><div className="text-[12px] text-gray-500">{c.email}</div></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex">{c.products.map((p, i) => <img key={i} src={p.image} alt="" title={p.name} className="w-[30px] h-[30px] rounded-md border-2 border-white object-cover bg-gray-100 shadow-[0_0_0_1px_#e5e7eb]" style={i ? { marginLeft: -10 } : undefined} />)}</div>
                          <span className="text-[12px] text-gray-500">{c.items} item{c.items === 1 ? "" : "s"}</span>
                        </div>
                      </td>
                      <td className="text-right font-[700] text-gray-900">{inr(c.value)}</td>
                      <td className="text-gray-500 whitespace-nowrap">{ago(c.last)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {c.email && <a className="pdIconBtn" title="Email" href={`mailto:${c.email}?subject=${encodeURIComponent("You left something in your cart")}`}><FiMail /></a>}
                          {c.mobile && <a className="pdIconBtn" title="Call" href={`tel:${c.mobile}`}><FiPhone /></a>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Box>

      <div className="grid lg:grid-cols-2 gap-4">
        <Box title="Most wishlisted" sub="Saved by the most customers — good candidates for deals or restocking.">
          {loading ? <div className="px-4 pb-4"><div className="h-40 rounded bg-gray-100 animate-pulse" /></div>
            : d.wishlist?.length ? <ProductRows rows={d.wishlist} metric={(p) => <><b className="text-[14px] text-gray-900">{p.count}</b><span className="block text-[11px] text-gray-400">wishlists</span></>} />
              : <Empty text="No wishlisted products yet." />}
        </Box>
        <Box title="Most in carts right now" sub="Added to carts but not ordered yet.">
          {loading ? <div className="px-4 pb-4"><div className="h-40 rounded bg-gray-100 animate-pulse" /></div>
            : d.inCarts?.length ? <ProductRows rows={d.inCarts} metric={(p) => <><b className="text-[14px] text-gray-900">{p.users}</b><span className="block text-[11px] text-gray-400">customer{p.users === 1 ? "" : "s"} · {p.qty} pcs</span></>} />
              : <Empty text="No carts right now." />}
        </Box>
        <Box title="Top searches" sub={`What customers searched for (${DAYS.find((x) => x[0] === days)[1].toLowerCase()}).`}>
          {loading ? <div className="px-4 pb-4"><div className="h-40 rounded bg-gray-100 animate-pulse" /></div>
            : d.searches?.length ? (
              <div className="divide-y divide-gray-100">
                {d.searches.map((t, i) => (
                  <a key={t._id} href={`${STORE_URL}/search?q=${encodeURIComponent(t.term)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                    <span className="w-5 text-[12px] text-gray-400 tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-[13px] font-[600] text-gray-900 truncate">{t.term}</span>
                    <span className={`text-[11px] ${t.results ? "text-gray-500" : "text-[#dc2626] font-[600]"}`}>{t.results ? `${t.results} results` : "No results"}</span>
                    <b className="w-10 text-right text-[13px] text-gray-900 tabular-nums">{t.count}</b>
                    <FiExternalLink className="text-gray-300" />
                  </a>
                ))}
              </div>
            ) : <Empty text="No searches recorded yet. Searches are recorded from now on." />}
        </Box>
        <Box title="Searches with no results" sub="People looked for these and found nothing — add products, or use these words in names / tags.">
          {loading ? <div className="px-4 pb-4"><div className="h-40 rounded bg-gray-100 animate-pulse" /></div>
            : d.noResults?.length ? (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {d.noResults.map((t) => <span key={t._id} className="pdBadge pdBadge--red !normal-case !text-[12px] !py-1">{t.term} <b className="opacity-70">×{t.count}</b></span>)}
              </div>
            ) : <Empty text="Every search found something." />}
        </Box>
      </div>
    </div>
  );
};

export default Insights;
