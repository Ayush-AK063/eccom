import React from 'react'
import './style.css'
import { Link } from 'react-router-dom'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap } from "react-icons/md";
import Tooltip from '@mui/material/Tooltip';
import { useContext } from 'react';
import { MyContext } from '../../App';


const ProductItem = ({ item }) => {

    const context = useContext(MyContext);

    return (
        <div className='overflow-hidden shadow-lg border-[rgba(0,0,0,0.1)] rounded-md productItem border'>
            <div className='group imgWrapper w-[100%] rounded-md relative'>
                <Link to={`/product/${item?._id}`}>
                    <div className='img h-[220px] overflow-hidden'>
                        <img src={item?.images?.[0] || ""}
                            alt={item?.name || "Product"}
                            className='w-full object-contain h-full' />

                        <img src={item?.images?.[1] || item?.images?.[0] || ""}
                            alt={item?.name || "Product"}
                            className='absolute top-0 left-0 object-contain w-full h-full transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105 bg-white' />
                    </div>
                </Link>
                {item?.discount > 0 && (
                    <span className='absolute flex items-center discount top-[10px] left-[10px] z-50 bg-primary text-white rounded-lg px-2 py-1 font-[500] text-[12px]'
                    >
                        {item?.discount}%
                    </span>
                )}

                <div className='absolute actions top-[-200px] right-[5px] z-50 flex items-center gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100'>
                    <Tooltip title="View product details" placement="left-start">
                        <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white'
                            onClick={() => {
                                context.setProductData(item);
                                context.setOpenProductDetailsModal(true);
                            }}>
                            <MdZoomOutMap className='text-[18px] !text-black group-hover:text-white hover:!text-white' />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Compare product" placement="left-start">
                        <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white'
                        >
                            <IoGitCompareOutline className='text-[18px] !text-black group-hover:text-white hover:!text-white' />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Add to wishlist" placement="left-start">
                        <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white'
                        >
                            <FaRegHeart className='text-[18px] !text-black group-hover:text-white hover:!text-white' />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className='p-3 py-5 info'>
                <h6 className='text-[13px] !font-[400]'>
                    <Link to={`/product/${item?._id}`} className='transition-all link'>{item?.brand || 'Generic'}</Link>
                </h6>
                <h3 className='text-[13px] title mt-1 mb-1 font-[500] text-[#000]'>
                    <Link to={`/product/${item?._id}`} className='transition-all link'>{item?.name || 'Product Name'}</Link>
                </h3>
                <Rating name="size-small" value={item?.rating || 0} size="small" readOnly precision={0.5} />
                <div className='flex items-center gap-4'>
                    {item?.oldprice && <span className='text-gray-500 font-[500] line-through oldPrice text-[15px]'>${item?.oldprice}</span>}
                    <span className='font-[600] newPrice text-primary text-[15px]'>${item?.price || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default ProductItem