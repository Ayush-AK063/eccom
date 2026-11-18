import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { getData } from "../../utils/api";
import StatusBadge from "../../Pages/Orders/StatusBadge";
import { inr, shortId, fmtDate, itemCount } from "../../Pages/Orders/orderUtils";
import "../../Pages/Products/style.css";
import "../../Pages/Orders/style.css";

// Recent orders (Dashboard). Poora management /orders page par hai.
const OrdersTable = ({ limit = 5 }) => {
  const context = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData("/api/order/all").then((res) => {
      if (res?.error === false) setOrders((res.data || []).slice(0, limit));
      setLoading(false);
    });
  }, [limit, context.isOpenFullScreenPanel?.open]);

  return (
    <div className="overflow-x-auto">
      <table className="pdTable">
        <thead>
          <tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th className="text-right">Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(limit)].map((_, i) => <tr key={i}><td colSpan="6"><div className="h-9 rounded bg-gray-100 animate-pulse" /></td></tr>)
          ) : orders.length === 0 ? (
            <tr><td colSpan="6" className="text-center text-gray-500 !py-10">No orders yet.</td></tr>
          ) : orders.map((o) => (
            <tr key={o._id} className="cursor-pointer" onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "View Order", data: o })}>
              <td className="font-[700] text-gray-900">{shortId(o._id)}</td>
              <td className="whitespace-nowrap">{fmtDate(o.createdAt)}</td>
              <td className="font-[500] text-gray-900">{o.deliveryAddress?.name || o.userId?.name || "—"}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="ordStack">{(o.products || []).slice(0, 3).map((p, i) => <img key={i} src={p.image} alt="" />)}</div>
                  <span className="text-[12px] text-gray-500">{itemCount(o)}</span>
                </div>
              </td>
              <td className="text-right font-[700] text-gray-900 whitespace-nowrap">{inr(o.totalAmt)}</td>
              <td><StatusBadge status={o.orderStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
