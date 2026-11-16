import React from 'react'
import { useState } from 'react'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import QtyBox from '../QtyBox';

const ProductDetailsComponent = ({ item }) => {

    const [productActionIndex, setProductActionIndex] = useState(null)

    return (
        <>
            <h1 className='text-[24px] font-[600] mb-2'>{item?.name || "No Title"}</h1>
            <div className='flex items-center gap-2'>
                <span className='text-gray-400 text-[13px]'>
                    Brands : <span className='font-[500] uppercase opacity-80 text-black'>{item?.brand || "Generic"}</span>
                </span>

                <Rating name="size-small" value={item?.rating || 0} size="small" readOnly />
                <span className='text-[13px] cursor-pointer'>Review (0)</span>
            </div>

            <div className='flex items-center gap-4 mt-4'>
                {item?.oldprice && <span className='text-gray-500 font-[500] line-through oldPrice text-[18px]'>${item?.oldprice}</span>}
                <span className='font-[600] newPrice text-primary text-[20px]'>${item?.price || 0}</span>

                <span className='text-[14px]'>Available in Stock : <span className='font-semibold text-green-600'>{item?.countInStock || 0} Items</span></span>
            </div>

            <p className='pr-10 mt-3 mb-5'>
                {item?.description || "No description available for this product."}
            </p>

            <div className='flex items-center gap-3'>
                <span className='text-[16px]'>Size:</span>
                <div className='flex items-center gap-1 actions'>
                    <Button className={`${productActionIndex === 0 ? '!bg-primary !text-white' : ''}`}
                        onClick={() => setProductActionIndex(0)}>S</Button>
                    <Button className={`${productActionIndex === 1 ? '!bg-primary !text-white' : ''}`}
                        onClick={() => setProductActionIndex(1)}>M</Button>
                    <Button className={`${productActionIndex === 2 ? '!bg-primary !text-white' : ''}`}
                        onClick={() => setProductActionIndex(2)}>L</Button>
                    <Button className={`${productActionIndex === 3 ? '!bg-primary !text-white' : ''}`}
                        onClick={() => setProductActionIndex(3)}>XL</Button>
                    <Button className={`${productActionIndex === 4 ? '!bg-primary !text-white' : ''}`}
                        onClick={() => setProductActionIndex(4)}>XXL</Button>
                </div>
            </div>

            <p className='text-[14px] opacity-80 mt-5 text-[#000] mb-2'>Free Shipping (Est. Delivery Time 2-3 Days)</p>

            <div className='flex items-center gap-4 py-2'>
                <div className='qtyBoxWrapper w-[70px]'>
                    <QtyBox />
                </div>

                <Button className='flex items-center gap-2 btn-org'>
                    <MdOutlineShoppingCart className='text-[22px]' /> Add to Cart
                </Button>
            </div>

            <div className='flex items-center gap-4 mt-4'>
                <span className='flex items-center gap-1 text-[15px] link cursor-pointer font-[500]'><FaRegHeart className='text-[18px]' />Add to Wishlist</span>
                <span className='flex items-center gap-1 text-[15px] link cursor-pointer font-[500]'><IoGitCompareOutline className='text-[18px]' />Add to Compare</span>
            </div>
        </>
    )
}

export default ProductDetailsComponent