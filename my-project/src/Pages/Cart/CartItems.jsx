import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { FaAngleDown } from "react-icons/fa";
import { FiCheck, FiHeart, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MyContext } from '../../App';
import { VARIANT_FIELDS, formatPrice, getVariantOptions } from '../../utils/formatPrice';

// Cart page ki ek line: image | details | price | qty | total
const CartItems = ({ item }) => {
    const context = useContext(MyContext)
    const product = item.productId
    const [busy, setBusy] = useState(false)
    const [variantMenu, setVariantMenu] = useState({ anchor: null, key: null })

    const qty = item.quantity || 1
    const stock = product?.countInStock || 0
    const options = getVariantOptions(product)
    const variantFields = VARIANT_FIELDS.filter(({ key }) => options[key].length > 0)
    const hasMrp = product.oldprice > product.price
    const inMyList = !!context?.getMyListItem?.(product?._id)

    const run = async (fn) => {
        if (busy) return
        setBusy(true)
        try { await fn() } finally { setBusy(false) }
    }

    const selectVariant = (value) => {
        const key = variantMenu.key
        setVariantMenu({ anchor: null, key: null })
        if (key && value !== null && value !== item[key]) run(() => context.updateCartVariant(item._id, key, value))
    }

    // Wishlist mein daalo (agar nahi hai), phir cart se hatao
    const moveToWishlist = () => run(async () => {
        if (!inMyList) await context.toggleMyList(product)
        await context.removeCartItem(item._id)
    })

    return (
        <li className={`cpLine ${busy ? 'is-busy' : ''}`}>
            {/* Product */}
            <div className='cpLine__product'>
                <Link to={`/product/${product._id}`} className='cpLine__img'>
                    <img src={product.images?.[0]} alt={product.name} loading='lazy' />
                </Link>
                <div className='min-w-0 flex-1'>
                    {product.brand && <div className='text-[11px] font-[600] uppercase tracking-[0.08em] text-gray-400 truncate'>{product.brand}</div>}
                    <Link to={`/product/${product._id}`} className='block mt-0.5 text-[15px] font-[600] text-gray-900 leading-[21px] line-clamp-2 hover:text-primary'>
                        {product.name}
                    </Link>

                    {variantFields.length > 0 && (
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {variantFields.map(({ key, label }) => (
                                <button key={key} type='button' className='cpLine__variant'
                                    onClick={(e) => setVariantMenu({ anchor: e.currentTarget, key })}>
                                    {label}: <b>{item[key] || 'Select'}</b> <FaAngleDown className='text-[11px]' />
                                </button>
                            ))}
                            <Menu anchorEl={variantMenu.anchor} open={Boolean(variantMenu.anchor)} onClose={() => selectVariant(null)}>
                                {(options[variantMenu.key] || []).map((value) => (
                                    <MenuItem key={value} selected={value === item[variantMenu.key]} onClick={() => selectVariant(value)}
                                        sx={{ fontSize: 13, minWidth: 90 }}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>
                    )}

                    <div className='mt-2 text-[12px] font-[500]'>
                        {stock > 0
                            ? <span className='inline-flex items-center gap-1 text-[#15803d]'><FiCheck /> In stock{stock <= 5 && <span className='text-[#c2410c]'> · Only {stock} left</span>}</span>
                            : <span className='text-gray-400'>Out of stock</span>}
                    </div>

                    <div className='flex items-center gap-4 mt-2.5'>
                        <button type='button' className='cpLine__action' onClick={moveToWishlist}>
                            <FiHeart /> Move to wishlist
                        </button>
                        <button type='button' className='cpLine__action hover:!text-primary' onClick={() => run(() => context.removeCartItem(item._id))}>
                            <FiTrash2 /> Remove
                        </button>
                    </div>
                </div>
            </div>

            {/* Price */}
            <div className='cpLine__price'>
                <span className='cpLine__label'>Price</span>
                <div>
                    <div className='text-[14px] font-[600] text-gray-900'>{formatPrice(product.price)}</div>
                    {hasMrp && <div className='text-[12px] text-gray-400 line-through'>{formatPrice(product.oldprice)}</div>}
                </div>
            </div>

            {/* Qty */}
            <div className='cpLine__qtyCell'>
                <span className='cpLine__label'>Quantity</span>
                <div className='cpLine__qty'>
                    <button type='button' aria-label='Decrease quantity' onClick={() => run(() => context.updateCartQty(item._id, qty - 1))}>
                        {qty <= 1 ? <FiTrash2 className='text-[12px]' /> : <FiMinus />}
                    </button>
                    <span>{busy ? <CircularProgress size={12} color='inherit' /> : qty}</span>
                    <button type='button' aria-label='Increase quantity' disabled={stock > 0 && qty >= stock}
                        onClick={() => run(() => context.updateCartQty(item._id, qty + 1))}>
                        <FiPlus />
                    </button>
                </div>
            </div>

            {/* Total */}
            <div className='cpLine__total'>
                <span className='cpLine__label'>Total</span>
                <div className='text-right'>
                    <div className='text-[15px] font-[700] text-gray-900'>{formatPrice(product.price * qty)}</div>
                    {hasMrp && <div className='text-[11px] font-[600] text-[#15803d]'>Save {formatPrice((product.oldprice - product.price) * qty)}</div>}
                </div>
            </div>
        </li>
    )
}

export default CartItems
