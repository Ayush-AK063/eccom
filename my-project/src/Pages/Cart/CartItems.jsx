import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoClose } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Rating } from '@mui/material';
import { MyContext } from '../../App';
import { VARIANT_FIELDS, formatPrice, getVariantOptions } from '../../utils/formatPrice';

const CartItems = ({ item }) => {

    const context = useContext(MyContext)
    const product = item.productId

    const [qtyAnchorEl, setQtyAnchorEl] = useState(null);
    const openQty = Boolean(qtyAnchorEl);

    // Stock tak (max 10) qty options
    const maxQty = Math.max(1, Math.min(product?.countInStock || 10, 10))
    const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1)

    // Size / RAM / weight dropdown (sirf jin fields ke product mein options hain)
    const options = getVariantOptions(product)
    const [variantMenu, setVariantMenu] = useState({ anchor: null, key: null })

    const handleSelectVariant = (value) => {
        const key = variantMenu.key
        setVariantMenu({ anchor: null, key: null })
        if (key && value !== null && value !== item[key]) {
            context.updateCartVariant(item._id, key, value)
        }
    }

    const handleCloseQty = (value) => {
        setQtyAnchorEl(null);
        if (value !== null && value !== item.quantity) {
            context.updateCartQty(item._id, value)
        }
    }

  return (
                    <div className='flex items-center w-full gap-4 p-3 pb-5 border-b border-[rgba(0,0,0,0.1)] cartItem'>
                        <div className='img w-[15%] rounded-md overflow-hidden group'>
                            <Link to={`/product/${product._id}`}>
                                <img src={product.images?.[0]} alt={product.name}
                                className='w-full transition-all group-hover:scale-105' />
                            </Link>
                        </div>

                        <div className='info w-[85%] relative'>
                            <IoClose className='absolute cursor-pointer top-[0px] right-[0px] text-[22px]'
                                onClick={() => context.removeCartItem(item._id)} />
                            <span className='text-[13px]'>{product.brand || 'Generic'}</span>
                            <h3 className='text-[15px] w-[85%]'>
                                <Link to={`/product/${product._id}`} className='link'>
                                    {product.name}
                                </Link>
                            </h3>

                            <Rating name={`rating-${item._id}`} value={product.rating || 0} size="small" readOnly precision={0.5}/>

                            <div className='flex items-center gap-4 mt-2'>
                                {VARIANT_FIELDS.filter(({ key }) => options[key].length > 0).map(({ key, label }) => (
                                    <span key={key}
                                        className='flex py-1 px-2 items-center justify-center bg-[#f1f1f1] text-[12px] font-[600] rounded-md cursor-pointer'
                                        onClick={(e) => setVariantMenu({ anchor: e.currentTarget, key })}>
                                        {label}: {item[key] || 'Select'} <FaAngleDown className='text-[14px] ml-1'/>
                                    </span>
                                ))}

                                <Menu
                                    id={`variant-menu-${item._id}`}
                                    anchorEl={variantMenu.anchor}
                                    open={Boolean(variantMenu.anchor)}
                                    onClose={() => handleSelectVariant(null)}
                                >
                                    {(options[variantMenu.key] || []).map((value) => (
                                        <MenuItem key={value} selected={value === item[variantMenu.key]}
                                            onClick={() => handleSelectVariant(value)}>{value}</MenuItem>
                                    ))}
                                </Menu>
                                <div>
                                    <span className='flex py-1 px-2 items-center justify-center bg-[#f1f1f1] text-[12px] font-[600] rounded-md cursor-pointer'
                                    onClick={(e) => setQtyAnchorEl(e.currentTarget)}
                                    >
                                        Qty: {item.quantity} <FaAngleDown className='text-[14px] ml-1'/>
                                    </span>

                                    <Menu
                                        id={`qty-menu-${item._id}`}
                                        anchorEl={qtyAnchorEl}
                                        open={openQty}
                                        onClose={()=>handleCloseQty(null)}
                                    >
                                        {qtyOptions.map((q) => (
                                            <MenuItem key={q} selected={q === item.quantity} onClick={()=>handleCloseQty(q)}>{q}</MenuItem>
                                        ))}
                                    </Menu>
                                </div>
                            </div>

                            <div className='flex items-center gap-4 mt-2'>
                                <span className='font-[600] newPrice text-[14px]'>{formatPrice(product.price)}</span>
                                {product.oldprice > 0 && (
                                    <span className='text-gray-500 font-[500] line-through oldPrice text-[14px]'>{formatPrice(product.oldprice)}</span>
                                )}
                                {product.discount > 0 && (
                                    <span className='font-[600] newPrice text-primary text-[14px]'>{product.discount}% off</span>
                                )}
                            </div>
                        </div>
                    </div>
  )
}

export default CartItems
