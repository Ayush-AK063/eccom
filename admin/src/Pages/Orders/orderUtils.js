import { putData } from "../../utils/api";

export const FLOW = ["pending", "confirmed", "shipped", "delivered"];
export const STATUS_META = {
  pending: { label: "Pending", tone: "amber", next: "confirmed", action: "Confirm" },
  confirmed: { label: "Confirmed", tone: "blue", next: "shipped", action: "Mark shipped" },
  shipped: { label: "Shipped", tone: "violet", next: "delivered", action: "Mark delivered" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const inr = (v) => "₹" + Math.round(Number(v || 0)).toLocaleString("en-IN");
export const shortId = (id) => "#" + String(id || "").slice(-8).toUpperCase();
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "");
export const addressLines = (a = {}) => [
  [a.flatHouse, a.areaStreet].filter(Boolean).join(", "),
  a.landmark ? `Near ${a.landmark}` : "",
  [a.townCity, a.state, a.pincode].filter(Boolean).join(", "),
  a.country,
].filter(Boolean);
export const itemCount = (o) => (o.products || []).reduce((n, p) => n + (p.quantity || 1), 0);
export const variantText = (item) =>
  (item.options && Object.keys(item.options).length
    ? Object.entries(item.options).map(([k, v]) => `${k}: ${v}`)
    : [item.size, item.color, item.productRam, item.productWeight].filter(Boolean)).join(" · ");

export const canCancel = (o) => o.orderStatus !== "cancelled" && o.orderStatus !== "delivered";

// returns { ok, order?, message }
export const setStatus = async (order, status) => {
  if (status === "cancelled" && !window.confirm(`Cancel order ${shortId(order._id)}?\n\nStock will be added back and the order can't be changed later.`)) return { ok: false, skipped: true };
  const res = await putData(`/api/order/status/${order._id}`, { orderStatus: status });
  return res?.error === false ? { ok: true, order: res.data, message: res.message } : { ok: false, message: res?.message || "Could not update status" };
};

// Timeline: history ho to wahi, warna purane orders ke liye andaaza (sirf created + current)
export const timeline = (o) => {
  if (o.statusHistory?.length) return o.statusHistory;
  const list = [{ status: "pending", at: o.createdAt }];
  if (o.orderStatus !== "pending") list.push({ status: o.orderStatus, at: o.updatedAt });
  return list;
};

export const printInvoice = (o) => {
  const a = o.deliveryAddress || {};
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rows = (o.products || []).map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.productTitle)}${variantText(p) ? `<div class="m">${esc(variantText(p))}</div>` : ""}${p.sku ? `<div class="m">SKU ${esc(p.sku)}</div>` : ""}</td><td class="r">${p.quantity}</td><td class="r">${inr(p.price)}</td><td class="r">${inr(p.subTotal || p.price * p.quantity)}</td></tr>`).join("");
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>Invoice ${shortId(o._id)}</title><style>
    body{font:13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111827;margin:40px}
    h1{font-size:22px;margin:0}.m{color:#6b7280;font-size:12px}.r{text-align:right}
    .top{display:flex;justify-content:space-between;margin-bottom:28px}.box{display:flex;gap:40px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}
    th{font-size:11px;text-transform:uppercase;color:#6b7280;background:#f9fafb}.tot td{border:0;font-weight:700;font-size:15px}
  </style></head><body>
    <div class="top"><div><h1>Invoice</h1><div class="m">Order ${shortId(o._id)} · ${fmtDate(o.createdAt)}</div></div><div class="r"><b>Payment</b><div class="m">${esc(o.paymentMethod === "COD" || !o.paymentId ? "Cash on Delivery" : o.paymentId)}</div></div></div>
    <div class="box"><div><b>Ship to</b><div>${esc(a.name)}</div>${addressLines(a).map((l) => `<div class="m">${esc(l)}</div>`).join("")}<div class="m">${esc(a.mobile)}</div></div>
    <div><b>Customer</b><div>${esc(o.userId?.name || a.name)}</div><div class="m">${esc(o.userId?.email || "")}</div></div></div>
    <table><thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody>
    <tfoot>${o.shippingCharge > 0 ? `<tr><td colspan="4" class="r">Shipping</td><td class="r">${inr(o.shippingCharge)}</td></tr>` : ""}${o.codCharge > 0 ? `<tr><td colspan="4" class="r">COD fee</td><td class="r">${inr(o.codCharge)}</td></tr>` : ""}<tr class="tot"><td colspan="4" class="r">Total</td><td class="r">${inr(o.totalAmt)}</td></tr></tfoot></table>
    <p class="m" style="margin-top:30px">Prices are inclusive of all taxes.</p>
    <script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
};
