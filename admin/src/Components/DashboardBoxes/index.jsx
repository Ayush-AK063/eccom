import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FiGift } from "react-icons/fi";
import { IoStatsChartSharp } from "react-icons/io5";
import { PiChartPieSlice } from "react-icons/pi";
import { AiOutlineBank } from "react-icons/ai";
import { TbBrandProducthunt } from "react-icons/tb";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

const DashboardBoxes = () => {
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
        <SwiperSlide>
          <div className="box bg-[#3278fa] p-4 cursor-pointer hover:bg-blue-600 rounded-md border-1 border-[rgba(0,0,0,0.1)] flex items-center gap-2">
            <FiGift className="text-[40px] text-white" />
            <div className="info w-[70%] text-white">
              <h3>New Orders</h3>
              <b>1,390</b>
            </div>
            <IoStatsChartSharp className="text-[50px] text-white" />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="box bg-[#10b981] p-4 cursor-pointer hover:bg-green-600 rounded-md border-1 border-[rgba(0,0,0,0.1)] flex items-center gap-2">
            <PiChartPieSlice className="text-[40px] text-white" />
            <div className="info w-[70%] text-white">
              <h3>Sales</h3>
              <b>57,890</b>
            </div>
            <IoStatsChartSharp className="text-[50px] text-white" />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="box bg-[#7928ca] p-4 cursor-pointer hover:bg-purple-600 rounded-md border-1 border-[rgba(0,0,0,0.1)] flex items-center gap-2">
            <AiOutlineBank className="text-[40px] text-white" />
            <div className="info w-[70%] text-white">
              <h3>Revenue</h3>
              <b>12,390</b>
            </div>
            <IoStatsChartSharp className="text-[50px] text-white" />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="box bg-[#ef5e36] p-4 cursor-pointer hover:bg-orange-600 rounded-md border-1 border-[rgba(0,0,0,0.1)] flex items-center gap-2">
            <TbBrandProducthunt className="text-[40px] text-white" />
            <div className="info w-[70%] text-white">
              <h3>Total Products</h3>
              <b>1,390</b>
            </div>
            <IoStatsChartSharp className="text-[50px] text-white" />
          </div>
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default DashboardBoxes;
