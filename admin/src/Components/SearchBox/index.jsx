import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBox = () => {
  return (
    <div className="w-full h-auto bg-[#f1f1f1] rounded-sm relative overflow-hidden">
      <input
        type="text"
        className="w-full h-[40px] rounded-sm border text-[13px] pr-8
      border-[rgba(0,0,0,0.1)] bg-[#f1f1f1] p-2 focus:outline-none focus-border[rgba(0,0,0,0.5)]"
        placeholder="Search products here..."
      />
      <FaSearch className="absolute top-[12px] right-[10px] z-50 pointer-events-none opacity-80" />
    </div>
  );
};

export default SearchBox;
