import React from "react";
import OrdersTable from "../../Components/OrdersTable";

const Orders = () => {
  return (
    <div className="my-4 bg-white shadow-md card sm:rounded-lg">
      <div className="flex items-center justify-between px-5 py-5">
        <h2 className="text-[18px] font-[600]">Orders</h2>
      </div>
      <OrdersTable searchable pageSize={10} />
    </div>
  );
};

export default Orders;
