import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiGrid, FiTrendingUp, FiBox, FiFolder, FiSliders, FiShoppingBag, FiStar, FiTag, FiUsers,
  FiImage, FiFileText, FiEdit3, FiSettings, FiLogOut, FiExternalLink, FiPlus, FiActivity,
} from "react-icons/fi";
import { MyContext } from "../../App";
import { getData } from "../../utils/api";
import "./style.css";

const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5173";

// Groups → links. `match` = jin URLs pe ye link active dikhe. `add` = "+" quick action (full-screen panel)
const NAV = [
  { title: "Overview", items: [
    { to: "/", label: "Dashboard", icon: FiGrid, exact: true },
    { to: "/activity", label: "Live activity", icon: FiActivity },
    { to: "/insights", label: "Insights", icon: FiTrendingUp },
  ] },
  { title: "Catalog", items: [
    { to: "/products", label: "Products", icon: FiBox, add: "Add Product" },
    { to: "/category/list", label: "Categories", icon: FiFolder, match: ["/category", "/subCategory", "/thirdCategory"], add: "Add New Category" },
    { to: "/variant-options", label: "Variant options", icon: FiSliders },
  ] },
  { title: "Sales", items: [
    { to: "/orders", label: "Orders", icon: FiShoppingBag, badge: "orders" },
    { to: "/reviews", label: "Reviews", icon: FiStar, badge: "reviews" },
    { to: "/coupons", label: "Coupons", icon: FiTag },
    { to: "/users", label: "Customers", icon: FiUsers },
  ] },
  { title: "Content", items: [
    { to: "/homeSlider/list", label: "Home banners", icon: FiImage, match: ["/homeSlider"], add: "Add Home Slide" },
    { to: "/blog/list", label: "Blog", icon: FiEdit3, match: ["/blog"], add: "Add Blog" },
    { to: "/pages", label: "Pages", icon: FiFileText },
  ] },
  { title: "Store", items: [
    { to: "/settings", label: "Store settings", icon: FiSettings },
  ] },
];

const Sidebar = () => {
  const context = useContext(MyContext);
  const { pathname } = useLocation();
  const [store, setStore] = useState({ name: "", logo: "" });
  const [badges, setBadges] = useState({});

  useEffect(() => {
    getData("/api/settings").then((res) => {
      const g = res?.data?.general || {};
      setStore({ name: g.storeName || "", logo: g.logo || "" });
    });
  }, []);

  // Kaam jo baaki hai: naye orders + return requests, pending reviews (panel band hone par refresh)
  useEffect(() => {
    getData("/api/order/all").then((res) => {
      const list = res?.data || [];
      const fresh = list.filter((o) => o.orderStatus === "pending").length;
      const returns = list.filter((o) => o.returnRequest?.status === "requested").length;
      setBadges((b) => ({ ...b, orders: fresh + returns, ordersTitle: `${fresh} new order${fresh === 1 ? "" : "s"}${returns ? `, ${returns} return request${returns === 1 ? "" : "s"}` : ""}` }));
    });
    getData("/api/review/admin/all").then((res) => {
      const n = (res?.data || []).filter((r) => r.status === "pending").length;
      setBadges((b) => ({ ...b, reviews: n, reviewsTitle: `${n} review${n === 1 ? "" : "s"} waiting for approval` }));
    });
  }, [context.isOpenFullScreenPanel?.open, pathname]);

  const isActive = (item) => {
    if (item.exact) return pathname === item.to;
    return [item.to, ...(item.match || [])].some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
  };
  const user = context.userData || {};

  return (
    <aside className="sbx" aria-label="Admin navigation">
      <Link to="/" className="sbx__brand">
        {store.logo
          ? <img src={store.logo} alt={store.name} className="max-h-[34px] max-w-[150px] object-contain" />
          : <span className="sbx__mark">{(store.name || "S")[0].toUpperCase()}</span>}
        {!store.logo && (
          <span className="min-w-0">
            <span className="block text-[14px] font-[800] text-gray-900 truncate">{store.name || "Store"}</span>
            <span className="block text-[11px] text-gray-400">Admin</span>
          </span>
        )}
      </Link>

      <nav className="sbx__nav">
        {NAV.map((group) => (
          <div key={group.title} className="sbx__group">
            <div className="sbx__title">{group.title}</div>
            {group.items.map((item) => {
              const active = isActive(item);
              const n = item.badge ? badges[item.badge] : 0;
              const Icon = item.icon;
              return (
                <div key={item.to} className={`sbx__row ${active ? "is-active" : ""}`}>
                  <Link to={item.to} className="sbx__link" aria-current={active ? "page" : undefined}>
                    <Icon className="sbx__icon" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {n > 0 && <span className="sbx__badge" title={badges[item.badge + "Title"]}>{n > 99 ? "99+" : n}</span>}
                  </Link>
                  {item.add && (
                    <button type="button" className="sbx__add" title={item.add.replace("New ", "").replace("Home Slide", "banner")}
                      onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: item.add })}>
                      <FiPlus />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sbx__foot">
        <a href={STORE_URL} target="_blank" rel="noreferrer" className="sbx__store"><FiExternalLink /> View store</a>
        <div className="sbx__user">
          <Link to="/my-account" className="flex items-center gap-2.5 min-w-0 flex-1" title="My account">
            {user.avatar
              ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              : <span className="w-8 h-8 rounded-full bg-[#111827] text-white text-[12px] font-[700] flex items-center justify-center shrink-0">{(user.name || "A")[0].toUpperCase()}</span>}
            <span className="min-w-0">
              <span className="block text-[13px] font-[600] text-gray-900 truncate">{user.name || "Admin"}</span>
              <span className="block text-[11px] text-gray-400 truncate">{user.email}</span>
            </span>
          </Link>
          <button type="button" className="sbx__logout" title="Log out" onClick={() => context.logout()}><FiLogOut /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
