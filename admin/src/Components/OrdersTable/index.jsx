import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import AdminBadge from "../AdminBadge";
import { MyContext } from "../../App";
import { getData, putData } from "../../utils/api";

const TH = "px-6 py-3 whitespace-nowrap";
const TD = "px-6 py-4 font-[500]";
const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const formatPrice = (v) =>
  Number(v || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
const shortId = (id) => "#" + String(id || "").slice(-8).toUpperCase();
const addressText = (a = {}) =>
  [a.flatHouse, a.areaStreet, a.landmark, a.townCity, a.state, a.country].filter(Boolean).join(", ");

// Saare orders ka table (admin).
// limit = sirf itne recent orders (Dashboard). searchable = search + pagination (Orders page)
const OrdersTable = ({ limit, searchable = false, pageSize = 10 }) => {
  const context = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadOrders = () => {
    getData("/api/order/all").then((res) => {
      if (res?.error === false) setOrders(res?.data || []);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (order, orderStatus) => {
    if (orderStatus === order.orderStatus) return;
    if (orderStatus === "cancelled" && !window.confirm("Cancel this order? Stock will be added back and it can't be changed later.")) return;
    setUpdatingId(order._id);
    const res = await putData(`/api/order/status/${order._id}`, { orderStatus });
    setUpdatingId(null);
    if (res?.error === false) {
      context.openAlertBox("success", res?.message || "Order status updated");
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, orderStatus } : o)));
    } else {
      context.openAlertBox("error", res?.message || "Could not update status");
    }
  };

  // Search: order #, naam, email, phone, pincode, status
  const q = search.trim().toLowerCase();
  const filtered = q
    ? orders.filter((o) => {
        const a = o.deliveryAddress || {};
        return [shortId(o._id), o._id, a.name, o.userId?.name, o.userId?.email, a.mobile, a.pincode, o.orderStatus]
          .some((v) => String(v || "").toLowerCase().includes(q));
      })
    : orders;

  const totalPages = searchable ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const list = limit
    ? filtered.slice(0, limit)
    : searchable
      ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : filtered;

  if (isLoading) {
    return <div className="flex items-center justify-center py-10"><CircularProgress color="inherit" /></div>;
  }

  const searchBox = searchable && (
    <div className="px-5">
      <TextField size="small" className="w-full md:w-[350px] bg-white" placeholder="Search order #, name, email, phone, pincode, status"
        value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
    </div>
  );

  if (list.length === 0) {
    return (
      <>
        {searchBox}
        <p className="px-5 py-10 text-center text-gray-500">{q ? "No orders match your search." : "No orders yet."}</p>
      </>
    );
  }

  return (
    <>
    {searchBox}
    <div className="relative pb-5 mt-5 overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className={TH}>&nbsp;</th>
            <th className={TH}>Order</th>
            <th className={TH}>Payment</th>
            <th className={TH}>Customer</th>
            <th className={TH}>Phone</th>
            <th className={TH}>Address</th>
            <th className={TH}>Pincode</th>
            <th className={TH}>Total</th>
            <th className={TH}>Email</th>
            <th className={TH}>Status</th>
            <th className={TH}>Date</th>
          </tr>
        </thead>
        <tbody>
          {list.map((order) => {
            const a = order.deliveryAddress || {};
            const isOpen = openId === order._id;
            const isCancelled = order.orderStatus === "cancelled";
            return (
              <React.Fragment key={order._id}>
                <tr className="bg-white border-b border-gray-200">
                  <td className={TD}>
                    <Button className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                      onClick={() => setOpenId(isOpen ? null : order._id)}>
                      {isOpen
                        ? <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                        : <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />}
                    </Button>
                  </td>
                  <td className={TD}><span className="text-primary whitespace-nowrap">{shortId(order._id)}</span></td>
                  <td className={`${TD} whitespace-nowrap`}>{order.paymentId || "Cash on Delivery"}</td>
                  <td className={`${TD} whitespace-nowrap`}>{a.name || order.userId?.name}</td>
                  <td className={TD}>{a.mobile}</td>
                  <td className={TD}><span className="block w-[300px]">{addressText(a)}</span></td>
                  <td className={TD}>{a.pincode}</td>
                  <td className={`${TD} whitespace-nowrap`}>{formatPrice(order.totalAmt)}</td>
                  <td className={TD}>{order.userId?.email}</td>
                  <td className={TD}>
                    {isCancelled ? (
                      <AdminBadge status="cancelled" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Select size="small" className="w-[140px] bg-white capitalize" value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) => changeStatus(order, e.target.value)}>
                          {STATUSES.map((s) => (
                            <MenuItem key={s} value={s} className="capitalize">{s}</MenuItem>
                          ))}
                        </Select>
                        {updatingId === order._id && <CircularProgress size={16} />}
                      </div>
                    )}
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>{formatDate(order.createdAt)}</td>
                </tr>

                {isOpen && (
                  <tr>
                    <td className="pl-20" colSpan="11">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className={TH}>Product</th>
                            <th className={TH}>Image</th>
                            <th className={TH}>Variant</th>
                            <th className={TH}>Qty</th>
                            <th className={TH}>Price</th>
                            <th className={TH}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(order.products || []).map((item, i) => {
                            const title = item.productTitle || "";
                            const variant = [item.size, item.productRam, item.productWeight].filter(Boolean).join(" / ");
                            return (
                              <tr key={i} className="bg-white border-b border-gray-200">
                                <td className={TD}><span className="block w-[200px]" title={title}>{title.length > 40 ? title.substr(0, 40) + "..." : title}</span></td>
                                <td className={TD}><img src={item.image} alt={title} className="w-[40px] h-[40px] object-cover rounded-md" /></td>
                                <td className={`${TD} whitespace-nowrap`}>{variant || "-"}</td>
                                <td className={TD}>{item.quantity}</td>
                                <td className={`${TD} whitespace-nowrap`}>{formatPrice(item.price)}</td>
                                <td className={`${TD} whitespace-nowrap`}>{formatPrice(item.subTotal || item.price * item.quantity)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    {searchable && totalPages > 1 && (
      <div className="flex items-center justify-center pb-5">
        <Pagination count={totalPages} page={currentPage} onChange={(e, v) => setPage(v)} color="primary" />
      </div>
    )}
    </>
  );
};

export default OrdersTable;
