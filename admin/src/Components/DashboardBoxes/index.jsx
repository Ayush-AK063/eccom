import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FiGift, FiUsers } from "react-icons/fi";
import { IoStatsChartSharp } from "react-icons/io5";
import { PiChartPieSlice } from "react-icons/pi";
import { TbBrandProducthunt, TbCategory } from "react-icons/tb";
import { MdOutlineRateReview } from "react-icons/md";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

const num = (v) => Number(v || 0).toLocaleString("en-IN");
const inr = (v) => Number(v || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// stats = /api/order/dashboard-stats ka data (null = abhi load ho raha)
const DashboardBoxes = ({ stats }) => {
  const boxes = [
    { title: "Total Orders", value: num(stats?.totalOrders), Icon: FiGift, bg: "bg-[#3278fa] hover:bg-blue-600" },
    { title: "Total Sales", value: inr(stats?.totalSales), Icon: PiChartPieSlice, bg: "bg-[#10b981] hover:bg-green-600" },
    { title: "Total Users", value: num(stats?.totalUsers), Icon: FiUsers, bg: "bg-[#7928ca] hover:bg-purple-600" },
    { title: "Total Products", value: num(stats?.totalProducts), Icon: TbBrandProducthunt, bg: "bg-[#ef5e36] hover:bg-orange-600" },
    { title: "Total Category", value: num(stats?.totalCategories), Icon: TbCategory, bg: "bg-[#0ea5e9] hover:bg-sky-600" },
    { title: "Total Reviews", value: num(stats?.totalReviews), Icon: MdOutlineRateReview, bg: "bg-[#f59e0b] hover:bg-amber-600" },
  ];

  return (
    <>
      <Swiper
        slidesPerView={4}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Navigation]}
        className="dashboardBoxesSlider"
      >
        {boxes.map(({ title, value, Icon, bg }) => (
          <SwiperSlide key={title}>
            <div className={`box ${bg} p-4 cursor-pointer rounded-md border-1 border-[rgba(0,0,0,0.1)] flex items-center gap-2`}>
              <Icon className="text-[40px] text-white" />
              <div className="info w-[70%] text-white">
                <h3>{title}</h3>
                <b>{stats ? value : "…"}</b>
              </div>
              <IoStatsChartSharp className="text-[50px] text-white" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default DashboardBoxes;
