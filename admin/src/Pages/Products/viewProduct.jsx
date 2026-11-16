import React from "react";
import Rating from "@mui/material/Rating";
import { Link } from "react-router-dom";

const ViewProduct = ({ data }) => {
    return (
        <div className="p-8 pb-20 bg-gray-50 min-h-screen">
            <div className="card bg-white shadow-md rounded-md p-6 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-8 border-b pb-8">
                    {/* Image Section */}
                    <div className="w-full md:w-[350px] shrink-0">
                        <div className="w-full h-[350px] rounded-md overflow-hidden bg-gray-100 border p-2">
                            <img
                                src={
                                    data?.images?.length > 0
                                        ? data?.images[0]
                                        : "https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp"
                                }
                                alt={data?.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {data?.images?.length > 1 && (
                            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                                {data.images.map((img, idx) => (
                                    <div key={idx} className="w-[70px] h-[70px] rounded-md overflow-hidden bg-gray-100 border cursor-pointer shrink-0">
                                        <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1">
                        <h2 className="text-[28px] font-[600] mb-2 text-gray-800 leading-tight">
                            {data?.name}
                        </h2>

                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-gray-500 text-[14px]">Brand: <span className="font-semibold text-black">{data?.brand || "N/A"}</span></span>
                            <span className="text-gray-500 text-[14px]">Stock: <span className="font-semibold text-black">{data?.countInStock || 0}</span></span>
                            <Rating name="read-only" value={data?.rating || 0} readOnly size="small" precision={0.5} />
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <h3 className="text-[28px] font-[700] text-primary">Rs {data?.price}</h3>
                            {data?.oldprice > 0 && (
                                <span className="text-[16px] text-gray-400 line-through mb-1">Rs {data?.oldprice}</span>
                            )}
                            {data?.discount > 0 && (
                                <span className="text-[14px] text-green-600 font-semibold mb-1 ml-2">{data?.discount}% OFF</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 bg-gray-50 p-4 rounded-md border">
                            <div>
                                <h4 className="text-[13px] text-gray-500 font-semibold mb-1 uppercase">Category</h4>
                                <p className="text-[15px] font-medium">{data?.catName || data?.catId?.name || "N/A"}</p>
                            </div>
                            <div>
                                <h4 className="text-[13px] text-gray-500 font-semibold mb-1 uppercase">Sub-Category</h4>
                                <p className="text-[15px] font-medium">{data?.subCat || "N/A"}</p>
                            </div>
                            <div>
                                <h4 className="text-[13px] text-gray-500 font-semibold mb-1 uppercase">Third Level</h4>
                                <p className="text-[15px] font-medium">{data?.thirdSubCat || "N/A"}</p>
                            </div>
                            <div className="flex items-center w-full mb-2">
                                <span className="text-[15px] font-semibold flex items-center justify-between w-[30%] text-[rgba(0,0,0,0.6)]">Product Flags <span className="ml-auto">:</span></span>
                                <p className="text-[15px] font-medium pl-3">{data?.productFlags?.join(', ') || "None"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {data?.productRam && (
                                <div className="bg-gray-50 p-3 rounded-md border text-center">
                                    <h4 className="text-[12px] text-gray-500 mb-1">RAM</h4>
                                    <p className="font-semibold text-[14px]">{data.productRam}</p>
                                </div>
                            )}
                            {data?.size && (
                                <div className="bg-gray-50 p-3 rounded-md border text-center">
                                    <h4 className="text-[12px] text-gray-500 mb-1">Size</h4>
                                    <p className="font-semibold text-[14px]">{data.size}</p>
                                </div>
                            )}
                            {data?.productWeight && (
                                <div className="bg-gray-50 p-3 rounded-md border text-center">
                                    <h4 className="text-[12px] text-gray-500 mb-1">Weight</h4>
                                    <p className="font-semibold text-[14px]">{data.productWeight}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-[16px] font-[600] mb-2">Description</h3>
                            <div className="text-[14px] text-gray-600 leading-relaxed max-w-none">
                                {data?.description ? (
                                    <p className="whitespace-pre-wrap">{data.description}</p>
                                ) : (
                                    <p className="italic text-gray-400">No description available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProduct;
