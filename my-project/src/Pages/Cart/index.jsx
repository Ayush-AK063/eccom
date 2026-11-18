import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight, FiLock, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import CartItems from './CartItems';
import ProductSlider from '../../components/ProductSlider';
import { MyContext } from '../../App';
import { postData } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import { computeCharges, checkoutBlockers } from '../../utils/storeSettings';
import CouponBox from '../../components/CouponBox';
import './style.css';

const CartPage = () => {
  const context = useContext(MyContext)
  const cartData = (context?.cartData || []).filter((i) => i?.productId)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // "You may also like": top-rated, jo cart mein nahi hain
  const cartIds = cartData.map((i) => i.productId._id).join(',')
  useEffect(() => {
    let alive = true
    postData('/api/product/filters', { sortBy: 'rating', order: 'desc', limit: 20 }).then((res) => {
      if (!alive) return
      const inCart = new Set(cartIds.split(','))
      setSuggestions((res?.products || []).filter((p) => !inCart.has(p._id)).slice(0, 12))
    })
    return () => { alive = false }
  }, [cartIds])

  const itemCount = cartData.reduce((t, i) => t + (i.quantity || 1), 0)
  const subTotal = cartData.reduce((t, i) => t + (i.productId.price || 0) * (i.quantity || 1), 0)
  const mrpTotal = cartData.reduce((t, i) => t + Math.max(i.productId.oldprice || 0, i.productId.price || 0) * (i.quantity || 1), 0)
  const discount = mrpTotal - subTotal
  const couponOff = Math.min(context?.coupon?.discount || 0, subTotal)
  const charges = computeCharges(context?.settings, subTotal - couponOff)
  const blockers = checkoutBlockers(context?.settings, subTotal, cartData)
  const sh = context?.settings?.shipping || {}

  const breadcrumb = (
    <nav className='flex items-center gap-1.5 text-[13px] text-gray-500 mb-3' aria-label='breadcrumb'>
      <Link to='/' className='hover:text-primary'>Home</Link>
      <FiChevronRight className='text-gray-300' />
      <span className='text-gray-900'>Cart</span>
    </nav>
  )

  const youMayLike = suggestions.length > 0 && (
    <div className='mt-12'>
      <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>You may also like</h2>
      <div className='text-[13px] text-gray-500 mt-1'>Top-rated picks from our store</div>
      <ProductSlider items={6} data={suggestions} />
    </div>
  )

  if (cartData.length === 0) {
    return (
      <section className='bg-white py-6 pb-12'>
        <div className='container'>
          {breadcrumb}
          <div className='flex flex-col items-center text-center py-16 border border-gray-100 rounded-md'>
            <span className='w-[88px] h-[88px] rounded-full bg-[#fff1f0] text-primary text-[38px] flex items-center justify-center'>
              <FiShoppingBag />
            </span>
            <h1 className='mt-5 text-[22px] font-[700] text-gray-900'>Your cart is empty</h1>
            <div className='mt-2 text-[14px] text-gray-500 max-w-[420px] leading-[22px]'>
              {context?.isLogin
                ? 'Looks like you haven’t added anything yet. Browse our deals and collections to get started.'
                : <>Please <Link to='/login' className='text-primary font-[600] hover:underline'>log in</Link> to see the items you added to your cart.</>}
            </div>
            <div className='flex flex-wrap justify-center gap-3 mt-6'>
              <Link to='/productListing' className='inline-flex items-center h-[44px] px-6 rounded-md bg-gray-900 text-white text-[14px] font-[600] hover:bg-primary transition-colors'>
                Start shopping
              </Link>
              {context?.isLogin && (
                <Link to='/my-list' className='inline-flex items-center h-[44px] px-6 rounded-md border border-gray-200 text-[14px] font-[600] text-gray-900 hover:border-gray-900'>
                  View wishlist
                </Link>
              )}
            </div>
          </div>
          {youMayLike}
        </div>
      </section>
    )
  }

  return (
    <section className='bg-white py-6 pb-12'>
      <div className='container'>
        {breadcrumb}
        <div className='flex flex-wrap items-end justify-between gap-3 mb-5'>
          <h1 className='text-[26px] font-[700] text-gray-900 leading-tight'>
            Shopping Cart <span className='text-[15px] font-[500] text-gray-500'>({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          </h1>
          <Link to='/productListing' className='inline-flex items-center gap-1.5 text-[13px] font-[600] text-gray-700 hover:text-primary'>
            <FiArrowLeft /> Continue shopping
          </Link>
        </div>

        <div className='cpGrid'>
          {/* Items */}
          <div>
            <div className='cpHead'>
              <span>Product</span><span>Price</span><span className='text-center'>Quantity</span><span className='text-right'>Total</span>
            </div>
            <ul className='cpList'>
              {cartData.map((item) => <CartItems key={item._id} item={item} />)}
            </ul>
          </div>

          {/* Summary */}
          <aside className='cpSummary'>
            <h2 className='text-[17px] font-[700] text-gray-900'>Order Summary</h2>
            <CouponBox subTotal={subTotal} />

            <div className='mt-4 flex flex-col gap-2.5 text-[14px]'>
              <div className='flex justify-between text-gray-600'>
                <span>Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span className='text-gray-900'>{formatPrice(mrpTotal)}</span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between text-gray-600'>
                  <span>Discount</span>
                  <span className='text-[#15803d] font-[600]'>− {formatPrice(discount)}</span>
                </div>
              )}
              {couponOff > 0 && <div className='flex justify-between text-gray-600'><span>Coupon ({context.coupon.code})</span><span className='text-[#15803d] font-[600]'>− {formatPrice(couponOff)}</span></div>}
              <div className='flex justify-between text-gray-600'>
                <span>Shipping</span>
                {charges.shipping > 0 ? <span className='text-gray-900'>{formatPrice(charges.shipping)}</span> : <span className='text-[#15803d] font-[600]'>Free</span>}
              </div>
              {charges.codCharge > 0 && (
                <div className='flex justify-between text-gray-600'>
                  <span>COD fee</span>
                  <span className='text-gray-900'>{formatPrice(charges.codCharge)}</span>
                </div>
              )}
            </div>

            <div className='flex justify-between items-baseline mt-4 pt-4 border-t border-dashed border-gray-200'>
              <span className='text-[16px] font-[700] text-gray-900'>Total</span>
              <span className='text-[22px] font-[800] text-gray-900'>{formatPrice(charges.total)}</span>
            </div>

            {discount > 0 && (
              <div className='mt-3 px-3 py-2 rounded-md bg-[#f0fdf4] text-[13px] font-[600] text-[#15803d]'>
                You save {formatPrice(discount)} on this order
              </div>
            )}

            {charges.toFree > 0 && (
              <div className='mt-3 px-3 py-2 rounded-md bg-[#eff6ff] text-[13px] text-[#1d4ed8]'>
                Add <b>{formatPrice(charges.toFree)}</b> more for free delivery
              </div>
            )}
            {blockers.length > 0 && (
              <ul className='mt-3 px-3 py-2 rounded-md bg-[#fff7ed] text-[13px] text-[#c2410c] flex flex-col gap-1'>
                {blockers.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}

            {blockers.length > 0
              ? <span className='cpCheckout opacity-50 pointer-events-none' aria-disabled='true'><FiLock className='text-[15px]' /> Proceed to Checkout</span>
              : <Link to='/checkout' className='cpCheckout'><FiLock className='text-[15px]' /> Proceed to Checkout</Link>}

            <div className='mt-4 flex flex-col gap-2.5 text-[12px] text-gray-500'>
              <div className='flex items-center gap-2'><FiTruck className='text-[15px] text-gray-400' /> {charges.shipping > 0 ? 'Standard delivery' : 'Free delivery'} · Est. {sh.etaMinDays}–{sh.etaMaxDays} days</div>
              {context?.settings?.checkout?.codEnabled !== false && <div className='flex items-center gap-2'><LiaMoneyBillWaveSolid className='text-[16px] text-gray-400' /> Cash on Delivery available</div>}
              {context?.settings?.checkout?.taxInclusiveNote !== false && <div className='text-[11px] text-gray-400'>Prices include all taxes</div>}
            </div>
          </aside>
        </div>

        {youMayLike}
      </div>
    </section>
  )
}

export default CartPage
