import User from "../models/User.js";
import { getSettings } from "../models/Setting.js";
import sendEmailFun from "../config/sendEmail.js";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const shortId = (id) => "#" + String(id).slice(-8).toUpperCase();

const COPY = {
  placed: ["Order placed", "Thanks for your order! We'll let you know when it's confirmed."],
  confirmed: ["Order confirmed", "Good news — your order is confirmed and being packed."],
  shipped: ["Order shipped", "Your order is on its way."],
  tracking: ["Tracking details updated", "Here are the tracking details for your order."],
  delivered: ["Order delivered", "Your order has been delivered. We hope you love it!"],
  cancelled: ["Order cancelled", "Your order has been cancelled. If you didn't ask for this, please contact us."],
  return_requested: ["Return request received", "We've received your return request and will review it shortly."],
  return_approved: ["Return approved", "Your return request is approved. We'll arrange the pickup."],
  return_rejected: ["Return request declined", "Unfortunately we couldn't approve your return request."],
  return_completed: ["Return completed", "Your return is complete."],
};

// Fire-and-forget: order kabhi email ki wajah se fail na ho
export const sendOrderEmail = (order, type) => {
  (async () => {
    const copy = COPY[type];
    if (!copy || !order) return;
    const settings = await getSettings();
    if (settings.notifications?.orderEmails === false) return;
    const user = order.userId?.email ? order.userId : await User.findById(order.userId).select("name email");
    if (!user?.email) return;
    const store = settings.general?.storeName || "Our store";
    const [title, line] = copy;
    const t = order.tracking || {};
    const rows = (order.products || []).map((p) => `<tr><td style="padding:6px 0">${esc(p.productTitle)} × ${p.quantity}</td><td style="padding:6px 0;text-align:right">${inr(p.subTotal || p.price * p.quantity)}</td></tr>`).join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111827">
      <h2 style="margin:0 0 4px">${esc(title)}</h2>
      <p style="color:#6b7280;margin:0 0 16px">Order ${shortId(order._id)} · ${esc(store)}</p>
      <p>Hi ${esc(user.name || "there")},</p><p>${esc(line)}</p>
      ${(type === "shipped" || type === "tracking") && t.number ? `<p style="background:#f3f4f6;padding:10px;border-radius:6px"><b>${esc(t.courier || "Courier")}</b> · Tracking no. <b>${esc(t.number)}</b>${t.url ? `<br><a href="${esc(t.url)}">Track your package</a>` : ""}</p>` : ""}
      ${type.startsWith("return_") && order.returnRequest?.adminNote ? `<p><i>${esc(order.returnRequest.adminNote)}</i></p>` : ""}
      <table style="width:100%;border-top:1px solid #e5e7eb;margin-top:12px;font-size:14px">${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #e5e7eb"><b>Total</b></td><td style="padding-top:10px;border-top:1px solid #e5e7eb;text-align:right"><b>${inr(order.totalAmt)}</b></td></tr></table>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">${esc(store)}${settings.contact?.email ? ` · ${esc(settings.contact.email)}` : ""}${settings.contact?.phone ? ` · ${esc(settings.contact.phone)}` : ""}</p></div>`;
    await sendEmailFun(user.email, `${title} — ${shortId(order._id)}`, `${title}. ${line}`, html);
  })().catch((e) => console.error("Order email failed:", e.message));
};
