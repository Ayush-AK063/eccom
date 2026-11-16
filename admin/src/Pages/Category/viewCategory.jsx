import React from "react";
import Button from "@mui/material/Button";

const ViewCategory = ({ data }) => {
    return (
        <div className="p-8 pb-20">
            <div className="card bg-white shadow-md rounded-md p-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-6 mb-8 border-b pb-6">
                    <div className="w-[120px] h-[120px] rounded-md overflow-hidden bg-gray-100 border">
                        <img
                            src={
                                data?.images?.length > 0
                                    ? data?.images[0]
                                    : "https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp"
                            }
                            alt="Category"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-[24px] font-[600] mb-2">{data?.name}</h2>
                        <p className="text-gray-500 text-[14px]">
                            ID: {data?._id}
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-[16px] font-[600] mb-4">Sub Categories ({data?.children?.length || 0})</h3>
                    {data?.children && data?.children?.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-3">
                            {data.children.map((sub, idx) => (
                                <li key={idx} className="bg-gray-50 p-3 rounded-md border text-[14px]">
                                    {sub.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-[14px]">No sub categories mapping to this category.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewCategory;
