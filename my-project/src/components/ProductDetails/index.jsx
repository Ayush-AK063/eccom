import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FiCheck, FiMinus, FiPlus, FiTruck, FiX, FiRefreshCw, FiShield } from "react-icons/fi";
import { LiaMoneyBillWaveSolid } from "react-icons/lia";
import AddToCart from '../AddToCart';
import CompareButton from '../CompareButton';
import { MyContext } from '../../App';
import { formatPrice, optionFields, isSameCartItem, isVariantComplete, variantView, isOptionAvailable } from '../../utils/formatPrice';
import './style.css';

// Product page aur Quick View modal dono mein use hota hai
const ProductDetailsComponent = ({ item, reviewsCount = 0, onReviewClick, compact = false, onVariantChange }) => {
    const [variant, setVariant] = useState({})
    const [tabError, setTabError] = useState(false) // bina option chune Add to Cart
    const [quantity, setQuantity] = useState(1)
    const context = useContext(MyContext)
    const inMyList = !!context?.getMyListItem?.(item?._id)
    const variantFields = optionFields(item)

    useEffect(() => {
        setVariant({})
        setTabError(false)
        setQuantity(1)
    }, [item?._id])

    const inCart = isVariantComplete(item, variant) &&
        context?.cartData?.some((c) => isSameCartItem(c, item, variant))

    const view = variantView(item, variant)
    const stock = view.stock
    const maxQty = item?.maxOrderQty > 0 ? Math.min(stock, item.maxOrderQty) : stock
    const save = view.oldprice > view.price ? view.oldprice - view.price : 0

    // Variant badla → page ko photo batao
    useEffect(() => { onVariantChange?.(view) }, [view.variant?._id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Quantity stock se zyada na ho (variant badalne par)
    useEffect(() => { setQuantity((q) => Math.max(1, Math.min(q, maxQty || 1))) }, [maxQty])

    const ship = item?.shipping || {}
    const store = context?.settings?.shipping || {}
    const dispatch = ship.dispatchDays || store.defaultDispatchDays || 2
    const storeFree = !(store.shippingCharge > 0)
    const policy = item?.policy || {}
    const returnText = policy.returnable === false || policy.returnType === 'none'
        ? 'Not returnable'
        : `${policy.returnDays ?? store.defaultReturnDays ?? 7}-day ${policy.returnType === 'replace' ? 'replacement' : 'easy return'}`
    const catName = item?.catId?.name || item?.catName
    const text = (item?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    return (
        <div className='pInfo'>
            {/* Title block */}
            <div className='flex items-center gap-2 text-[12px] font-[600] uppercase tracking-[0.08em]'>
                <span className='text-gray-500'>{item?.brand || 'Generic'}</span>
                {catName && <><span className='text-gray-300'>•</span><span className='text-gray-400'>{catName}</span></>}
            </div>
            <h1 className={`mt-2 font-[700] text-gray-900 ${compact ? 'text-[22px] leading-[30px]' : 'text-[26px] leading-[34px]'}`}>
                {item?.name || 'No Title'}
            </h1>

            <div className='flex items-center flex-wrap gap-2 mt-2.5'>
                <Rating value={item?.rating || 0} readOnly precision={0.5} size='small' />
                {item?.rating > 0 && <span className='text-[13px] font-[600] text-gray-800'>{Number(item.rating).toFixed(1)}</span>}
                <span className='text-gray-300'>|</span>
                {onReviewClick ? (
                    <button type='button' onClick={onReviewClick} className='text-[13px] text-gray-500 hover:text-primary underline-offset-4 hover:underline'>
                        {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                    </button>
                ) : (
                    <Link to={`/product/${item?._id}`} className='text-[13px] text-gray-500 hover:text-primary'>See all details</Link>
                )}
            </div>

            {/* Price block */}
            <div className='pInfo__price'>
                <div className='flex items-baseline flex-wrap gap-x-3 gap-y-1'>
                    {view.hasRange && <span className='text-[14px] font-[500] text-gray-500 self-center'>From</span>}
                    <span className='text-[30px] font-[800] text-gray-900 leading-none'>{formatPrice(view.price)}</span>
                    {save > 0 && <span className='text-[16px] text-gray-400 line-through'>{formatPrice(view.oldprice)}</span>}
                    {view.discount > 0 && <span className='pInfo__off'>{view.discount}% off</span>}
                </div>
                <div className='mt-1.5 text-[12px] text-gray-500'>
                    {save > 0 && <span className='font-[600] text-[#15803d] mr-2'>You save {formatPrice(save)}</span>}
                    Inclusive of all taxes
                </div>
            </div>

            {/* Stock */}
            <div className='mt-4'>
                {stock > 0 ? (
                    <span className='inline-flex items-center gap-1.5 text-[13px] font-[600] text-[#15803d]'>
                        <FiCheck /> In stock
                        {stock <= 10 && <span className='font-[500] text-[#c2410c]'>· Only {stock} left</span>}
                    </span>
                ) : (
                    <span className='inline-flex items-center gap-1.5 text-[13px] font-[600] text-gray-400'><FiX /> Out of stock</span>
                )}
            </div>

            {item?.shortDescription ? (
                <div className='mt-4 text-[14px] text-gray-600 leading-[22px]'>{item.shortDescription}</div>
            ) : text && !compact && <div className='mt-4 text-[14px] text-gray-600 leading-[22px] line-clamp-3'>{text}</div>}

            {item?.highlights?.length > 0 && (
                <ul className='pInfo__highlights'>
                    {item.highlights.slice(0, compact ? 4 : 10).map((h) => <li key={h}><FiCheck />{h}</li>)}
                </ul>
            )}

            {/* Variants */}
            {variantFields.length > 0 && (
                <div className='mt-5 flex flex-col gap-4'>
                    {variantFields.map(({ key, label, values, display, hex, unit }) => {
                        const pick = (value) => { setVariant((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value })); setTabError(false) }
                        const missing = tabError && !variant[key]
                        return (
                            <div key={key}>
                                <div className='flex items-center gap-2 mb-2'>
                                    <span className='text-[13px] font-[600] text-gray-900'>{label}</span>
                                    {variant[key] && <span className='text-[13px] text-gray-500'>: {variant[key]}{unit ? ` ${unit}` : ''}</span>}
                                    {missing && <span className='text-[12px] font-[500] text-red-500'>Please select a {label.toLowerCase()}</span>}
                                </div>
                                {display === 'dropdown' ? (
                                    <select value={variant[key] || ''} onChange={(e) => pick(e.target.value)} className={`pInfo__select ${missing ? 'is-error' : ''}`}>
                                        <option value=''>Select {label.toLowerCase()}</option>
                                        {values.map((value) => {
                                            const available = isOptionAvailable(item, variant, key, value)
                                            return <option key={value} value={value} disabled={!available}>{value}{unit ? ` ${unit}` : ''}{available ? '' : ' — out of stock'}</option>
                                        })}
                                    </select>
                                ) : (
                                    <div className='flex flex-wrap gap-2'>
                                        {values.map((value) => {
                                            const available = isOptionAvailable(item, variant, key, value)
                                            const active = variant[key] === value
                                            return display === 'swatch' ? (
                                                <button key={value} type='button' title={available ? value : `${value} — out of stock`} aria-label={value} aria-pressed={active}
                                                    onClick={() => pick(value)}
                                                    className={`pInfo__swatch ${active ? 'is-active' : ''} ${!available ? 'is-na' : ''} ${missing ? 'is-error' : ''}`}
                                                    style={{ background: hex?.[value] || '#e5e7eb' }} />
                                            ) : (
                                                <button key={value} type='button' title={available ? '' : 'Out of stock with the selected options'}
                                                    onClick={() => pick(value)}
                                                    className={`pInfo__opt ${active ? 'is-active' : ''} ${!available ? 'is-na' : ''} ${missing ? 'is-error' : ''}`}>
                                                    {value}{unit ? ` ${unit}` : ''}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Buy row */}
            <div className='pInfo__buy'>
                {!inCart && stock > 0 && maxQty > 1 && (
                    <div className='pInfo__qty' aria-label='Quantity'>
                        <button type='button' aria-label='Decrease quantity' disabled={quantity <= 1}
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}><FiMinus /></button>
                        <span>{quantity}</span>
                        <button type='button' aria-label='Increase quantity' disabled={quantity >= maxQty}
                            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}><FiPlus /></button>
                    </div>
                )}
                <div className='flex-1 min-w-[180px] pInfo__cart'>
                    <AddToCart product={item} quantity={quantity} variant={variant} onNeedVariant={() => setTabError(true)} className='w-full' />
                </div>
                <Tooltip title={inMyList ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <button
                        type='button'
                        aria-pressed={inMyList}
                        onClick={() => item && context.toggleMyList(item)}
                        className={`pInfo__wish ${inMyList ? 'is-active' : ''}`}
                    >
                        {inMyList ? <FaHeart /> : <FaRegHeart />}
                    </button>
                </Tooltip>
            </div>

            <div className='mt-3 pInfo__compare'>
                <CompareButton product={item} variant='text' />
            </div>

            {/* Delivery info (product se) */}
            <div className='pInfo__perks'>
                <div className='pInfo__perk'>
                    <FiTruck />
                    <div>
                        <div className='text-[13px] font-[600] text-gray-900'>{storeFree ? 'Free delivery' : store.freeShippingAbove > 0 ? `Free delivery above ₹${store.freeShippingAbove}` : 'Fast delivery'}</div>
                        <div className='text-[12px] text-gray-500'>Ships in {dispatch} {dispatch === 1 ? 'day' : 'days'}</div>
                    </div>
                </div>
                <div className='pInfo__perk'>
                    <FiRefreshCw />
                    <div>
                        <div className='text-[13px] font-[600] text-gray-900'>{returnText}</div>
                        <div className='text-[12px] text-gray-500'>{policy.returnable === false || policy.returnType === 'none' ? 'Check details before buying' : 'Hassle-free pickup'}</div>
                    </div>
                </div>
                {ship.codAvailable !== false && context?.settings?.checkout?.codEnabled !== false && (
                    <div className='pInfo__perk'>
                        <LiaMoneyBillWaveSolid />
                        <div>
                            <div className='text-[13px] font-[600] text-gray-900'>Cash on Delivery</div>
                            <div className='text-[12px] text-gray-500'>Pay when your order arrives</div>
                        </div>
                    </div>
                )}
                {policy.warrantyMonths > 0 && (
                    <div className='pInfo__perk'>
                        <FiShield />
                        <div>
                            <div className='text-[13px] font-[600] text-gray-900'>{policy.warrantyMonths >= 12 && policy.warrantyMonths % 12 === 0 ? `${policy.warrantyMonths / 12} year` : `${policy.warrantyMonths} month`} warranty</div>
                            <div className='text-[12px] text-gray-500'>{policy.warrantyType ? `${policy.warrantyType} warranty` : 'On manufacturing defects'}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetailsComponent
