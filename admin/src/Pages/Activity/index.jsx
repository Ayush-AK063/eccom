import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRadio, FiUsers, FiUserPlus, FiLogIn, FiShoppingBag } from "react-icons/fi";
import { getData } from "../../utils/api";
import { TYPES, ActivityRow } from "./describe";
import "../Products/style.css";
import "../Category/style.css";

const REFRESH_MS = 15000;

// Live feed: har 15 sec naye events upar jud jaate hain
const ActivityFeed = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [type, setType] = useState("");
  const [sum, setSum] = useState(null);
  const [more, setMore] = useState(true);
  const [live, setLive] = useState(true);
  const newest = useRef(null);

  const q = (extra) => `/api/activity?limit=50${type ? `&type=${type}` : ""}${extra || ""}`;
  const loadSummary = () => getData("/api/activity/summary").then((r) => r?.data && setSum(r.data));

  useEffect(() => {
    setItems(null); setMore(true);
    getData(q()).then((r) => {
      const list = r?.data || [];
      setItems(list); setMore(list.length === 50);
      newest.current = list[0]?.createdAt || new Date().toISOString();
    });
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const poll = useCallback(() => {
    if (!newest.current) return;
    getData(q(`&after=${encodeURIComponent(newest.current)}`)).then((r) => {
      const fresh = r?.data || [];
      if (fresh.length) {
        newest.current = fresh[0].createdAt;
        setItems((l) => [...fresh.map((x) => ({ ...x, _new: true })), ...(l || [])].slice(0, 500));
      }
    });
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(poll, REFRESH_MS);
    return () => clearInterval(t);
  }, [live, poll]);

  const loadMore = () => {
    const last = items?.[items.length - 1];
    if (!last) return;
    getData(q(`&before=${encodeURIComponent(last.createdAt)}`)).then((r) => {
      const list = r?.data || [];
      setItems((l) => [...l, ...list]); setMore(list.length === 50);
    });
  };

  const openUser = (u) => u?._id && navigate(`/users?user=${u._id}`);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Live activity</h1>
          <div className="text-[14px] text-gray-500">What logged-in customers are doing on the store, as it happens.</div>
        </div>
        <button className={`pdBtn ${live ? "pdBtn--dark" : "pdBtn--light"}`} onClick={() => setLive(!live)}>
          <span className={`w-2 h-2 rounded-full ${live ? "bg-[#22c55e] animate-pulse" : "bg-gray-400"}`} /> {live ? "Live · updates every 15s" : "Paused"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          [FiRadio, "Online now", sum?.onlineNow, "Active in last 15 min"],
          [FiUsers, "Active today", sum?.activeUsers, "Customers who did something"],
          [FiUserPlus, "New sign-ups", sum?.signups, "Today"],
          [FiLogIn, "Logins", sum?.logins, "Today"],
          [FiShoppingBag, "Orders", sum?.orders, "Today"],
        ].map(([Icon, label, n, sub]) => (
          <div key={label} className="catStat !cursor-default">
            <span className="catStat__icon"><Icon /></span>
            <span className="text-left min-w-0">
              <span className="block text-[12px] text-gray-500 font-[500]">{label}</span>
              <span className="block text-[20px] font-[700] text-gray-900 leading-tight">{sum ? n ?? 0 : "…"}</span>
              <span className="block text-[11px] text-gray-400 truncate">{sub}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {[["", "Everything"], ...Object.entries(TYPES).map(([k, v]) => [k, v.label])].map(([k, l]) => (
            <button key={k || "all"} className={`pdTab ${type === k ? "is-active" : ""}`} onClick={() => setType(k)}>
              {l}{k && sum?.byType?.[k] ? <b className={`text-[11px] px-1.5 rounded-full ${type === k ? "bg-white/20" : "bg-black/[.07]"}`}>{sum.byType[k]}</b> : null}
            </button>
          ))}
        </div>
        <div className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
          {items === null ? [...Array(8)].map((_, i) => <div key={i} className="px-4 py-3"><div className="h-8 rounded bg-gray-100 animate-pulse" /></div>)
            : items.length === 0 ? <div className="py-14 text-center text-[13px] text-gray-500">Nothing yet. Activity is recorded from now on — sign-ups, logins, views, searches, cart, wishlist, orders and reviews.</div>
              : items.map((a) => <div key={a._id} className={a._new ? "bg-[#f0fdf4]" : ""}><ActivityRow a={a} onUser={openUser} /></div>)}
        </div>
        {items?.length > 0 && more && (
          <div className="p-3 border-t border-gray-100 text-center"><button className="pdBtn pdBtn--light" onClick={loadMore}>Load older</button></div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
