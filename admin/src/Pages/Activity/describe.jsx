import React from "react";
import { FiKey, FiUserPlus, FiLogIn, FiEye, FiSearch, FiShoppingCart, FiHeart, FiShoppingBag, FiXCircle, FiRotateCcw, FiStar } from "react-icons/fi";
import { STORE_URL } from "../Settings/ui";

const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const short = (id) => "#" + String(id || "").slice(-8).toUpperCase();
const P = ({ m }) => (m?.productId ? <a href={`${STORE_URL}/product/${m.productId}`} target="_blank" rel="noreferrer" className="font-[600] text-gray-900 hover:text-[#ff5252]">{m.name || "a product"}</a> : <b>{m?.name || "a product"}</b>);

// Activity type → icon, rang, label (filter chips) aur ek line ka text
export const TYPES = {
  signup: { icon: FiUserPlus, color: "#059669", label: "Sign-ups", text: (m) => <>signed up with <b>{m.method === "google" ? "Google" : "email & password"}</b></> },
  login: { icon: FiLogIn, color: "#2563eb", label: "Logins", text: (m) => <>logged in with <b>{m.method === "google" ? "Google" : "email & password"}</b></> },
  product_view: { icon: FiEye, color: "#6b7280", label: "Product views", text: (m) => <>viewed <P m={m} /></> },
  search: { icon: FiSearch, color: "#7c3aed", label: "Searches", text: (m) => <>searched “<b>{m.term}</b>” <span className="text-gray-400">({m.results ? `${m.results} results` : "no results"})</span></> },
  cart_add: { icon: FiShoppingCart, color: "#d97706", label: "Added to cart", text: (m) => <>added <P m={m} /> to cart{m.options && Object.keys(m.options).length ? <span className="text-gray-400"> ({Object.values(m.options).join(" / ")})</span> : null}</> },
  wishlist_add: { icon: FiHeart, color: "#db2777", label: "Wishlisted", text: (m) => <>wishlisted <P m={m} /></> },
  order_placed: { icon: FiShoppingBag, color: "#059669", label: "Orders", text: (m) => <>placed order <b>{short(m.orderId)}</b> · {inr(m.total)}{m.coupon ? <span className="text-gray-400"> · coupon {m.coupon}</span> : null}</> },
  order_cancelled: { icon: FiXCircle, color: "#dc2626", label: "Cancellations", text: (m) => <>cancelled order <b>{short(m.orderId)}</b>{m.reason ? <span className="text-gray-400"> — {m.reason}</span> : null}</> },
  return_requested: { icon: FiRotateCcw, color: "#d97706", label: "Returns", text: (m) => <>asked for a <b>{m.type === "replace" ? "replacement" : "return"}</b> on <b>{short(m.orderId)}</b> — {m.reason}</> },
  password_change: { icon: FiKey, color: "#6b7280", label: "Password changes", text: () => <>changed their password</> },
  password_reset: { icon: FiKey, color: "#d97706", label: "Password resets", text: () => <>reset their password with an email code</> },
  review: { icon: FiStar, color: "#f59e0b", label: "Reviews", text: (m) => <>rated <P m={m} /> <b>{m.rating}★</b>{m.status === "pending" ? <span className="text-gray-400"> (waiting for approval)</span> : null}</> },
};

export const ago = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

export const ActivityRow = ({ a, showUser = true, onUser }) => {
  const t = TYPES[a.type] || { icon: FiEye, color: "#6b7280", text: () => a.type };
  const Icon = t.icon;
  const u = a.userId || {};
  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: t.color + "1a", color: t.color }}><Icon /></span>
      <div className="flex-1 min-w-0 text-[13px] text-gray-700 leading-[19px]">
        {showUser && <button type="button" onClick={() => onUser?.(u)} className="font-[700] text-gray-900 hover:underline mr-1">{u.name || "Deleted user"}</button>}
        {t.text(a.meta || {})}
        <div className="text-[11px] text-gray-400 mt-0.5">{ago(a.createdAt)}{a.device ? ` · ${a.device}` : ""}{showUser && u.email ? ` · ${u.email}` : ""}</div>
      </div>
    </div>
  );
};
