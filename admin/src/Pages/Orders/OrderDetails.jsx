import React, { useContext, useState } from "react";
import { FiCheck, FiPrinter, FiX, FiCopy, FiPhone, FiMail, FiMapPin, FiPackage } from "react-icons/fi";
import { MyContext } from "../../App";
import { putData } from "../../utils/api";
import { FLOW, STATUS_META, inr, shortId, fmtDate, fmtTime, addressLines, itemCount, variantText, setStatus, printInvoice, canCancel, timeline } from "./orderUtils";
import StatusBadge from "./StatusBadge";
import "../Products/style.css";
import "./style.css";

const OrderDetails = ({ data }) => {
  const context = useContext(MyContext);
  const [order, setOrder] = useState(data);
  const [busy, setBusy] = useState(false);
  const [track, setTrack] = useState({ courier: data?.tracking?.courier || "", number: data?.tracking?.number || "", url: data?.tracking?.url || "" });
  const [note, setNote] = useState(data?.adminNote || "");
  const [returnNote, setReturnNote] = useState("");

  const patch = async (body, msg) => {
    setBusy(true);
    const res = await putData(`/api/order/admin/${order._id}`, body);
    setBusy(false);
    if (res?.error === false) { setOrder((o) => ({ ...o, ...res.data })); context.openAlertBox("success", msg); return true; }
    context.openAlertBox("error", res?.message || "Could not update order");
    return false;
  };
  if (!order) return null;

  const a = order.deliveryAddress || {};
  const meta = STATUS_META[order.orderStatus] || {};
  const history = timeline(order);
  const when = (s) => history.filter((h) => h.status === s).pop()?.at;
  const cancelled = order.orderStatus === "cancelled";
  const reached = cancelled ? -1 : FLOW.indexOf(order.orderStatus);
  const subtotal = (order.products || []).reduce((s, p) => s + (p.subTotal || p.price * p.quantity), 0);

  const change = async (status) => {
    setBusy(true);
    const r = await setStatus(order, status);
    setBusy(false);
    if (r.skipped) return;
    if (r.ok) { setOrder((o) => ({ ...o, ...r.order, userId: r.order.userId?._id ? r.order.userId : o.userId })); context.openAlertBox("success", `Order marked ${STATUS_META[status].label.toLowerCase()}`); }
    else context.openAlertBox("error", r.message);
  };

  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => context.openAlertBox("success", `${what} copied`));

  return (
    <div className="pdPanel">
      <div className="pdPanel__grid">
        <div className="flex flex-col gap-4">
          <div className="pdCard">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-[700] text-gray-900">{shortId(order._id)}</h2>
                  <StatusBadge status={order.orderStatus} />
                  <button className="pdIconBtn !w-7 !h-7" title="Copy full order ID" onClick={() => copy(order._id, "Order ID")}><FiCopy /></button>
                </div>
                <div className="text-[13px] text-gray-500">Placed {fmtDate(order.createdAt)} at {fmtTime(order.createdAt)} · {itemCount(order)} item{itemCount(order) === 1 ? "" : "s"}</div>
              </div>
              <button className="pdBtn pdBtn--light" onClick={() => printInvoice(order)}><FiPrinter /> Invoice</button>
            </div>

            {cancelled ? (
              <div className="flex items-center gap-3 p-3 rounded-md bg-[#fef2f2] text-[#b91c1c] text-[13px]">
                <FiX className="shrink-0" />
                <span><b>Cancelled</b>{when("cancelled") ? ` on ${fmtDate(when("cancelled"))}, ${fmtTime(when("cancelled"))}` : ""}. Stock was added back.{order.cancelledBy && <> Cancelled by <b>{order.cancelledBy}</b>{order.cancelReason ? ` — “${order.cancelReason}”` : ""}.</>}</span>
              </div>
            ) : (
              <div className="ordSteps">
                {FLOW.map((s, i) => {
                  const t = when(s);
                  return (
                    <div key={s} className={`ordStep ${i <= reached ? "is-done" : ""} ${i === reached ? "is-current" : ""}`}>
                      <span className="ordStep__dot">{i <= reached ? <FiCheck /> : i + 1}</span>
                      <span className="ordStep__label">{STATUS_META[s].label}</span>
                      <span className="ordStep__time">{t ? `${fmtDate(t)}` : i <= reached ? "—" : ""}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pdCard !p-0">
            <div className="px-[18px] pt-[18px] pb-3 pdCard__title">Items</div>
            <table className="pdTable">
              <thead><tr><th>Product</th><th className="text-right">Price</th><th className="text-right">Qty</th><th className="text-right pr-5">Amount</th></tr></thead>
              <tbody>
                {(order.products || []).map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-3 min-w-[240px]">
                        {p.image ? <img src={p.image} alt="" className="pdThumb" /> : <span className="pdThumb flex items-center justify-center text-gray-300"><FiPackage /></span>}
                        <div className="min-w-0">
                          <div className="font-[600] text-gray-900 line-clamp-2">{p.productTitle || "Product"}</div>
                          <div className="text-[12px] text-gray-500">{[p.brand, variantText(p), p.sku && `SKU ${p.sku}`].filter(Boolean).join(" · ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right whitespace-nowrap">{inr(p.price)}</td>
                    <td className="text-right">{p.quantity}</td>
                    <td className="text-right pr-5 font-[600] text-gray-900 whitespace-nowrap">{inr(p.subTotal || p.price * p.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-[18px] py-4 flex flex-col gap-1.5 text-[13px] ml-auto w-full sm:w-[300px]">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{inr(subtotal)}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between"><span className="text-gray-500">Coupon <b className="text-gray-700">{order.couponCode}</b></span><span className="text-[#059669]">− {inr(order.couponDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span>{order.shippingCharge > 0 ? <span>{inr(order.shippingCharge)}</span> : <span className="text-[#059669]">Free</span>}</div>
              {order.codCharge > 0 && <div className="flex justify-between"><span className="text-gray-500">COD fee</span><span>{inr(order.codCharge)}</span></div>}
              <div className="flex justify-between text-[15px] font-[700] text-gray-900 pt-1.5 border-t border-gray-100"><span>Total</span><span>{inr(order.totalAmt)}</span></div>
            </div>
          </div>

          <div className="pdCard">
            <div className="pdCard__title mb-3">Activity</div>
            <ol className="flex flex-col gap-3">
              {[...history].reverse().map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px]">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${i === 0 ? "bg-[#111827]" : "bg-gray-300"}`} />
                  <span className="flex-1">Order {h.status === "pending" ? "placed" : `marked ${STATUS_META[h.status]?.label.toLowerCase() || h.status}`}</span>
                  <span className="text-gray-400 whitespace-nowrap">{fmtDate(h.at)}, {fmtTime(h.at)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="pdPanel__aside">
          {!cancelled && (meta.next || canCancel(order)) && (
            <div className="pdCard">
              <div className="pdCard__title mb-1">Next step</div>
              <div className="pdCard__sub mb-3">{meta.next ? `This order is ${meta.label.toLowerCase()}.` : "Delivered orders can't be changed."}</div>
              {meta.next && <button className="pdBtn pdBtn--dark w-full" disabled={busy} onClick={() => change(meta.next)}>{busy ? "Updating…" : meta.action}</button>}
              {canCancel(order) && <button className="pdBtn pdBtn--light w-full mt-2 hover:!border-[#ef4444] hover:!text-[#dc2626]" disabled={busy} onClick={() => change("cancelled")}>Cancel order</button>}
            </div>
          )}


          {order.returnRequest?.status && (() => {
            const r = order.returnRequest;
            const tone = { requested: "!bg-[#fffbeb] !border-[#fde68a]", approved: "!bg-[#eff6ff] !border-[#bfdbfe]", rejected: "", completed: "!bg-[#f0fdf4] !border-[#bbf7d0]" }[r.status];
            return (
              <div className={`pdCard ${tone}`}>
                <div className="pdCard__title mb-1">{r.type === "replace" ? "Replacement" : "Return"} request · <span className="capitalize">{r.status}</span></div>
                <div className="text-[13px] text-gray-700"><b>{r.reason}</b>{r.comment && <div className="mt-1 text-gray-600">“{r.comment}”</div>}</div>
                <div className="text-[11px] text-gray-400 mt-1">Requested {fmtDate(r.requestedAt)}{r.resolvedAt ? ` · closed ${fmtDate(r.resolvedAt)}` : ""}</div>
                {r.adminNote && <div className="mt-2 text-[12px] text-gray-600">Your note: {r.adminNote}</div>}
                {(r.status === "requested" || r.status === "approved") && (
                  <div className="mt-3 flex flex-col gap-2">
                    <input className="pdInput !h-9 text-[13px]" value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="Note to customer (optional)" />
                    <div className="flex gap-2">
                      {r.status === "requested" && <button className="pdBtn pdBtn--dark flex-1 !h-9" disabled={busy} onClick={() => patch({ returnStatus: "approved", returnNote }, "Return approved")}>Approve</button>}
                      {r.status === "approved" && <button className="pdBtn pdBtn--dark flex-1 !h-9" disabled={busy} onClick={() => patch({ returnStatus: "completed", returnNote }, "Return completed")}>Mark completed</button>}
                      <button className="pdBtn pdBtn--light flex-1 !h-9" disabled={busy} onClick={() => window.confirm("Decline this request?") && patch({ returnStatus: "rejected", returnNote }, "Return declined")}>Decline</button>
                    </div>
                    {r.status === "approved" && r.type === "return" && <div className="pdHint !mt-0">Completing a return adds the items back to stock.</div>}
                  </div>
                )}
              </div>
            );
          })()}

          {!cancelled && (
            <div className="pdCard">
              <div className="pdCard__title mb-1">Shipment tracking</div>
              <div className="pdCard__sub mb-3">Shown to the customer in My Orders{order.orderStatus === "shipped" ? " and emailed" : ""}.</div>
              <div className="flex flex-col gap-2">
                <input className="pdInput !h-9 text-[13px]" value={track.courier} onChange={(e) => setTrack({ ...track, courier: e.target.value })} placeholder="Courier (e.g. Delhivery)" list="couriers" />
                <datalist id="couriers">{["Delhivery", "Blue Dart", "DTDC", "Ecom Express", "Xpressbees", "Shadowfax", "India Post", "Ekart"].map((c) => <option key={c} value={c} />)}</datalist>
                <input className="pdInput !h-9 text-[13px]" value={track.number} onChange={(e) => setTrack({ ...track, number: e.target.value })} placeholder="Tracking / AWB number" />
                <input className="pdInput !h-9 text-[13px]" value={track.url} onChange={(e) => setTrack({ ...track, url: e.target.value })} placeholder="Tracking link (optional)" />
                <button className="pdBtn pdBtn--light !h-9" disabled={busy} onClick={() => patch({ tracking: track }, "Tracking saved")}>Save tracking</button>
              </div>
            </div>
          )}

          <div className="pdCard">
            <div className="pdCard__title mb-1">Internal note</div>
            <div className="pdCard__sub mb-2">Only admins see this.</div>
            <textarea className="pdInput !min-h-[70px] text-[13px]" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer asked for evening delivery" />
            {note !== (order.adminNote || "") && <button className="pdBtn pdBtn--light w-full mt-2 !h-9" disabled={busy} onClick={() => patch({ adminNote: note }, "Note saved")}>Save note</button>}
          </div>

          <div className="pdCard">
            <div className="pdCard__title mb-3">Customer</div>
            <div className="font-[600] text-gray-900">{order.userId?.name || a.name || "—"}</div>
            <div className="flex flex-col gap-1.5 mt-2 text-[13px] text-gray-600">
              {order.userId?.email && <a className="flex items-center gap-2 hover:text-gray-900" href={`mailto:${order.userId.email}`}><FiMail className="text-gray-400" />{order.userId.email}</a>}
              {(a.mobile || order.userId?.mobile) && <a className="flex items-center gap-2 hover:text-gray-900" href={`tel:${a.mobile || order.userId.mobile}`}><FiPhone className="text-gray-400" />{a.mobile || order.userId.mobile}</a>}
            </div>
          </div>

          <div className="pdCard">
            <div className="flex items-center justify-between mb-3">
              <div className="pdCard__title">Shipping address</div>
              <button className="pdIconBtn !w-7 !h-7" title="Copy address" onClick={() => copy([a.name, ...addressLines(a), a.mobile].filter(Boolean).join("\n"), "Address")}><FiCopy /></button>
            </div>
            <div className="flex gap-2 text-[13px]">
              <FiMapPin className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-[600] text-gray-900">{a.name}{a.addressType && <span className="pdBadge ml-2 !py-0">{a.addressType}</span>}</div>
                {addressLines(a).map((l, i) => <div key={i} className="text-gray-600">{l}</div>)}
              </div>
            </div>
          </div>

          <div className="pdCard">
            <div className="pdCard__title mb-3">Payment</div>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><b className="text-gray-900">{order.paymentMethod === "COD" || !order.paymentId ? "Cash on Delivery" : "Prepaid"}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={`pdBadge ${order.orderStatus === "delivered" ? "pdBadge--green" : cancelled ? "" : "pdBadge--amber"}`}>{order.orderStatus === "delivered" ? "Collected" : cancelled ? "Not charged" : "To collect"}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><b className="text-gray-900">{inr(order.totalAmt)}</b></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetails;
