import React from 'react'
import { useState } from 'react'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import QtyBox from '../QtyBox';
import AddToCart from '../AddToCart';
import { useContext, useEffect } from 'react';
import { MyContext } from '../../App';
import { VARIANT_FIELDS, formatPrice, getVariantOptions, isSameCartItem, isVariantComplete } from '../../utils/formatPrice';

const ProductDetailsComponent = ({ item, reviewsCount = 0, onReviewClick }) => {

    const [variant, setVariant] = useState({})
    // Bina option chune Add to Cart dabaya → laal border
    const [tabError, setTabError] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const context = useContext(MyContext)
    const inMyList = !!context?.getMyListItem?.(item?._id)
    const options = getVariantOptions(item)

    // Dusra product khula to selection reset
    useEffect(() => {
        setVariant({})
        setTabError(false)
    }, [item?._id])
    // Sirf tab "in cart" jab yahi variant cart mein ho
    const inCart = isVariantComplete(item, variant) &&
        context?.cartData?.some((c) => isSameCartItem(c, item, variant))

    return (
        <>
            <h1 className='text-[24px] font-[600] mb-2'>{item?.name || "No Title"}</h1>
            <div className='flex items-center gap-2'>
                <span className='text-gray-400 text-[13px]'>
                    Brands : <span className='font-[500] uppercase opacity-80 text-black'>{item?.brand || "Generic"}</span>
                </span>

                <Rating name="size-small" value={item?.rating || 0} size="small" readOnly precision={0.5} />
                <span className='text-[13px] cursor-pointer' onClick={onReviewClick}>Review ({reviewsCount})</span>
            </div>

            <div className='flex items-center gap-4 mt-4'>
                {item?.oldprice > 0 && <span className='text-gray-500 font-[500] line-through oldPrice text-[18px]'>{formatPrice(item?.oldprice)}</span>}
                <span className='font-[600] newPrice text-primary text-[20px]'>{formatPrice(item?.price)}</span>

                <span className='text-[14px]'>Available in Stock : <span className='font-semibold text-green-600'>{item?.countInStock || 0} Items</span></span>
            </div>

            <p className='pr-10 mt-3 mb-5'>
                {item?.description || "No description available for this product."}
            </p>

            {VARIANT_FIELDS.filter(({ key }) => options[key].length > 0).map(({ key, label }) => (
                <div key={key} className='flex items-center gap-3 mb-2'>
                    <span className='text-[16px] min-w-[60px]'>{label}:</span>
                    <div className='flex flex-wrap items-center gap-1 actions'>
                        {options[key].map((value) => (
                            <Button key={value}
                                className={`${variant[key] === value ? '!bg-primary !text-white' : ''} ${tabError && !variant[key] ? '!border !border-solid !border-red-500' : ''}`}
                                onClick={() => { setVariant((prev) => ({ ...prev, [key]: value })); setTabError(false) }}>
                                {value}
                            </Button>
                        ))}
                    </div>
                    {tabError && !variant[key] && (
                        <span className='text-[12px] text-red-500'>Please select {label.toLowerCase()}</span>
                    )}
                </div>
            ))}

            <p className='text-[14px] opacity-80 mt-5 text-[#000] mb-2'>Free Shipping (Est. Delivery Time 2-3 Days)</p>

            <div className='flex items-center gap-4 py-2'>
                {!inCart && (
                    <div className='qtyBoxWrapper w-[70px]'>
                        <QtyBox onChange={setQuantity} />
                    </div>
                )}

                <AddToCart product={item} quantity={quantity} variant={variant} onNeedVariant={() => setTabError(true)} className={inCart ? 'w-[150px]' : 'min-w-[150px]'} />
            </div>

            <div className='flex items-center gap-4 mt-4'>
                <span className={`flex items-center gap-1 text-[15px] link cursor-pointer font-[500] ${inMyList ? 'text-primary' : ''}`}
                    onClick={() => item && context.toggleMyList(item)}>
                    {inMyList ? <FaHeart className='text-[18px]' /> : <FaRegHeart className='text-[18px]' />}
                    {inMyList ? 'Added to Wishlist' : 'Add to Wishlist'}
                </span>
            </div>
        </>
    )
}

export default ProductDetailsComponent