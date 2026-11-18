import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiShoppingBag, FiUsers, FiBox, FiTrendingUp, FiTrendingDown, FiArrowRight, FiAlertTriangle, FiStar, FiLayers, FiImage, FiFileText } from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import OrdersTable from "../../Components/OrdersTable";
import { MyContext } from "../../App";
import { getData } from "../../utils/api";

const num = (v) => Number(v || 0).toLocaleString("en-IN");
const inr = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const compactInr = (v) => {
  const n = Number(v || 0);
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(1) + "Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(1) + "L";
  if (n >= 1e3) return "₹" + (n / 1e3).toFixed(1) + "k";
  return "₹" + n;
};
const pctChange = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : cur ? 100 : 0);

const STATUS = [
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "confirmed", label: "Confirmed", color: "#3b82f6" },
  { key: "shipped", label: "Shipped", color: "#8b5cf6" },
  { key: "delivered", label: "Delivered", color: "#10b981" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

const METRICS = {
  Total_Sales: { label: "Revenue", color: "#ff5252", fmt: inr, axis: compactInr },
  Total_Orders: { label: "Orders", color: "#3b82f6", fmt: num, axis: num },
  Total_Users: { label: "New customers", color: "#10b981", fmt: num, axis: num },
};

const Card = ({ title, action, children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-md ${className}`}>
    {title && (
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 className="text-[15px] font-[700] text-gray-900">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </div>
);

const ViewAll = ({ to, children = "View all" }) => (
  <Link to={to} className="flex items-center gap-1 text-[12px] font-[600] text-gray-500 hover:text-[#ff5252]">
    {children} <FiArrowRight />
  </Link>
);

const Kpi = ({ icon, tint, label, value, change, sub }) => {
  const up = change >= 0;
  return (
    <div className="bg-white border border-gray-200 rounded-md p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-[500] text-gray-500">{label}</span>
        <span className="w-9 h-9 rounded-md flex items-center justify-center text-[18px]" style={{ background: tint + "1a", color: tint }}>{icon}</span>
      </div>
      <div className="mt-2 text-[26px] font-[700] text-gray-900 tracking-tight leading-none">{value}</div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {change !== undefined && (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-[600] ${up ? "bg-[#ecfdf5] text-[#059669]" : "bg-[#fef2f2] text-[#dc2626]"}`}>
            {up ? <FiTrendingUp /> : <FiTrendingDown />} {Math.abs(change).toFixed(0)}%
          </span>
        )}
        <span className="text-gray-400">{sub}</span>
      </div>
    </div>
  );
};

const ChartTip = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] text-white rounded-md px-3 py-2 text-[12px] shadow-lg">
      <div className="text-gray-400">{label}</div>
      <div className="font-[700] text-[14px]">{METRICS[metric].fmt(payload[0].value)}</div>
    </div>
  );
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const Dashboard = () => {
  const context = useContext(MyContext);
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [metric, setMetric] = useState("Total_Sales");

  useEffect(() => {
    getData(`/api/order/dashboard-stats?year=${year}`).then((res) => {
      if (res?.error === false) setStats(res.data);
    });
  }, [year]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const cur = stats?.thisMonth || {};
  const prev = stats?.lastMonth || {};
  const aov = stats?.totalOrders ? stats.totalSales / stats.totalOrders : 0;

  const statusData = useMemo(
    () => STATUS.map((s) => ({ ...s, value: stats?.statusCounts?.[s.key] || 0 })),
    [stats]
  );
  const statusTotal = statusData.reduce((a, s) => a + s.value, 0);
  const yearTotal = (stats?.monthly || []).reduce((a, m) => a + (m[metric] || 0), 0);
  const firstName = (context?.userData?.name || "Admin").split(" ")[0];
  const openPanel = (model) => context.setIsOpenFullScreenPanel({ open: true, model });

  const loading = <span className="inline-block w-20 h-6 rounded bg-gray-100 animate-pulse" />;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[13px] text-gray-500">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 className="mt-1 text-[24px] font-[700] text-gray-900 tracking-tight">{greeting()}, {firstName}</h1>
          <div className="text-[14px] text-gray-500">Here's how your store is doing.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/orders" className="h-10 px-4 rounded-md border border-gray-200 bg-white text-[13px] font-[600] text-gray-700 flex items-center gap-2 hover:border-gray-900">
            <FiShoppingBag /> Orders
          </Link>
          <button onClick={() => openPanel("Add Product")} className="h-10 px-4 rounded-md bg-[#111827] text-white text-[13px] font-[600] flex items-center gap-2 hover:bg-[#ff5252] transition">
            <FiPlus /> Add product
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={<MdCurrencyRupee />} tint="#ff5252" label="Total revenue" value={stats ? inr(stats.totalSales) : loading}
          change={stats ? pctChange(cur.sales, prev.sales) : undefined} sub={stats ? `${inr(cur.sales)} this month` : ""} />
        <Kpi icon={<FiShoppingBag />} tint="#3b82f6" label="Total orders" value={stats ? num(stats.totalOrders) : loading}
          change={stats ? pctChange(cur.orders, prev.orders) : undefined} sub={stats ? `${num(cur.orders)} this month` : ""} />
        <Kpi icon={<FiUsers />} tint="#10b981" label="Customers" value={stats ? num(stats.totalUsers) : loading}
          change={stats ? pctChange(cur.users, prev.users) : undefined} sub={stats ? `${num(cur.users)} new this month` : ""} />
        <Kpi icon={<FiTrendingUp />} tint="#8b5cf6" label="Avg. order value" value={stats ? inr(aov) : loading}
          sub={stats ? `${num(stats.totalProducts)} products · ${num(stats.totalCategories)} categories` : ""} />
      </div>

      {/* Chart + status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2"
          title={<span>Performance <span className="ml-2 text-[12px] font-[500] text-gray-400">{METRICS[metric].fmt(yearTotal)} in {year}</span></span>}
          action={
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 bg-gray-100 rounded-md">
                {Object.entries(METRICS).map(([k, m]) => (
                  <button key={k} onClick={() => setMetric(k)}
                    className={`px-3 h-7 rounded text-[12px] font-[600] transition ${metric === k ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className="h-8 px-2 rounded-md border border-gray-200 bg-white text-[12px] font-[600] text-gray-700 outline-none">
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          }>
          <div className="h-[300px] px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthly || []} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={METRICS[metric].color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={METRICS[metric].color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} width={56} tickFormatter={METRICS[metric].axis} />
                <Tooltip content={<ChartTip metric={metric} />} cursor={{ stroke: "#e5e7eb" }} />
                <Area type="monotone" dataKey={metric} stroke={METRICS[metric].color} strokeWidth={2.5} fill="url(#dashFill)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Orders by status" action={<ViewAll to="/orders" />}>
          <div className="relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusTotal ? statusData : [{ value: 1 }]} dataKey="value" innerRadius={58} outerRadius={80} paddingAngle={statusTotal ? 2 : 0} stroke="none">
                  {(statusTotal ? statusData : [{ color: "#f3f4f6" }]).map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[24px] font-[700] text-gray-900 leading-none">{num(statusTotal)}</span>
              <span className="text-[12px] text-gray-400 mt-1">orders</span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-2 flex flex-col gap-2.5">
            {statusData.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-[13px]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-gray-600">{s.label}</span>
                <span className="ml-auto font-[600] text-gray-900">{num(s.value)}</span>
                <span className="w-10 text-right text-gray-400 text-[12px]">{statusTotal ? Math.round((s.value / statusTotal) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top products + low stock + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card title="Top selling products" action={<ViewAll to="/products" />}>
          <div className="px-5 pb-4">
            {stats?.topProducts?.length ? stats.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3 py-2.5 border-t border-gray-100 first:border-0">
                <span className="w-5 text-[12px] font-[700] text-gray-400">{i + 1}</span>
                <img src={p.image} alt="" className="w-10 h-10 rounded object-contain bg-gray-50 border border-gray-100" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-[600] text-gray-900 truncate">{p.name}</div>
                  <div className="text-[12px] text-gray-400">{num(p.units)} sold</div>
                </div>
                <span className="text-[13px] font-[700] text-gray-900">{inr(p.revenue)}</span>
              </div>
            )) : <Empty text={stats ? "No sales yet" : "Loading…"} />}
          </div>
        </Card>

        <Card title={<span className="flex items-center gap-2">Low stock <FiAlertTriangle className="text-[#f59e0b]" /></span>} action={<ViewAll to="/products" />}>
          <div className="px-5 pb-4">
            {stats?.lowStock?.length ? stats.lowStock.map((p) => (
              <div key={p._id} className="flex items-center gap-3 py-2.5 border-t border-gray-100 first:border-0">
                <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded object-contain bg-gray-50 border border-gray-100" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-[600] text-gray-900 truncate">{p.name}</div>
                  <div className="text-[12px] text-gray-400">{p.brand || "—"} · {inr(p.price)}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-[700] ${p.countInStock === 0 ? "bg-[#fef2f2] text-[#dc2626]" : "bg-[#fffbeb] text-[#b45309]"}`}>
                  {p.countInStock === 0 ? "Out of stock" : `${p.countInStock} left`}
                </span>
              </div>
            )) : <Empty text={stats ? "All products are well stocked" : "Loading…"} />}
          </div>
        </Card>

        <Card title="Store overview" className="lg:col-span-2 xl:col-span-1">
          <div className="grid grid-cols-2 gap-3 px-5 pb-5">
            {[
              { icon: <FiBox />, label: "Products", value: stats?.totalProducts, to: "/products" },
              { icon: <FiLayers />, label: "Categories", value: stats?.totalCategories, to: "/category/list" },
              { icon: <FiStar />, label: "Reviews", value: stats?.totalReviews, to: "/products" },
              { icon: <FiUsers />, label: "Users", value: stats?.totalUsers, to: "/users" },
            ].map((s) => (
              <Link key={s.label} to={s.to} className="p-3 rounded-md border border-gray-100 bg-gray-50 hover:border-gray-300 transition">
                <span className="text-gray-400 text-[16px]">{s.icon}</span>
                <div className="mt-2 text-[20px] font-[700] text-gray-900 leading-none">{stats ? num(s.value) : "…"}</div>
                <div className="mt-1 text-[12px] text-gray-500">{s.label}</div>
              </Link>
            ))}
          </div>
          <div className="px-5 pb-5">
            <div className="text-[12px] font-[600] text-gray-400 uppercase tracking-wide mb-2">Quick actions</div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <FiBox />, label: "Add product", model: "Add Product" },
                { icon: <FiLayers />, label: "Add category", model: "Add New Category" },
                { icon: <FiImage />, label: "Add banner", model: "Add Home Slide" },
                { icon: <FiFileText />, label: "Add blog", model: "Add Blog" },
              ].map((a) => (
                <button key={a.label} onClick={() => openPanel(a.model)}
                  className="h-8 px-3 rounded-md border border-gray-200 bg-white text-[12px] font-[600] text-gray-700 flex items-center gap-1.5 hover:border-gray-900">
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card title="Recent orders" action={<ViewAll to="/orders" />}>
        <OrdersTable limit={5} />
      </Card>
    </div>
  );
};

const Empty = ({ text }) => <div className="py-8 text-center text-[13px] text-gray-400">{text}</div>;

export default Dashboard;
