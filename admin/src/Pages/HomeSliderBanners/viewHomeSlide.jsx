import React, { useContext } from "react";
import { MyContext } from "../../App";

const ViewHomeSlide = ({ data }) => {
    const context = useContext(MyContext);

    if (!data) return null;

    return (
        <div className="p-8">
            <div className="card shadow-md sm:rounded-lg bg-white p-5">
                <h2 className="text-[20px] font-[600] mb-5 border-b pb-3">Home Slide Details</h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Image Section */}
                    <div className="w-full md:w-1/3 flex justify-center items-center bg-gray-50 rounded-md p-4 border border-gray-200">
                        {data.images && data.images.length > 0 ? (
                            <img
                                src={data.images[0]}
                                alt="Banner"
                                className="max-w-full max-h-[300px] object-contain rounded-md"
                            />
                        ) : (
                            <p className="text-gray-400">No Image Available</p>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-2/3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">

                            <div className="detail-row">
                                <span className="text-gray-500 text-[13px] uppercase font-[600]">Banner Type</span>
                                <p className="text-[16px] font-[500] mt-1 bg-blue-100 text-blue-800 w-fit px-2.5 py-0.5 rounded">
                                    {data.type || 'N/A'}
                                </p>
                            </div>

                            {data.type === 'Left Big Banner' && (
                                <div className="detail-row">
                                    <span className="text-gray-500 text-[13px] uppercase font-[600]">Banner Heading</span>
                                    <p className="text-[16px] font-[500] text-gray-800 mt-1">{data.bannerHeading || '-'}</p>
                                </div>
                            )}

                            {['Left Big Banner', 'Right Top Banner', 'Right Down Banner'].includes(data.type) && (
                                <>
                                    <div className="detail-row">
                                        <span className="text-gray-500 text-[13px] uppercase font-[600]">Product Title</span>
                                        <p className="text-[16px] font-[500] text-gray-800 mt-1">{data.title || '-'}</p>
                                    </div>

                                    <div className="detail-row">
                                        <span className="text-gray-500 text-[13px] uppercase font-[600]">Starting Price</span>
                                        <p className="text-[16px] font-[500] text-gray-800 mt-1">{data.startAtOnlyPrice ? `₹${data.startAtOnlyPrice}` : '-'}</p>
                                    </div>

                                    <div className="detail-row sm:col-span-2">
                                        <span className="text-gray-500 text-[13px] uppercase font-[600]">Redirect URL</span>
                                        <p className="text-[16px] font-[500] text-blue-600 mt-1 break-all">
                                            {data.redirectUrl ? (
                                                <a href={data.redirectUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {data.redirectUrl}
                                                </a>
                                            ) : '-'}
                                        </p>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewHomeSlide;
