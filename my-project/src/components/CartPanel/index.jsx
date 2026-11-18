import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress';
import { IoClose } from 'react-icons/io5';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiLock } from 'react-icons/fi';
import { MyContext } from '../../App';
import { formatPrice, optionEntries } from '../../utils/formatPrice';
import './style.css';
import { computeCharges } from '../../utils/storeSettings';

const CartLine = ({ item, onNavigate }) => {
  const context = useContext(MyContext)
  const [busy, setBusy] = useState(false)
  const product = item.productId
  const qty = item.quantity || 1
  const stock = product?.countInStock || 0
  const lineTotal = (product?.price || 0) * qty
  const lineMrp = product?.oldprice > product?.price ? product.oldprice * qty : 0

  const run = async (fn) => {
    if (busy) return
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <li className={`cartLine ${busy ? 'is-busy' : ''}`}>
      <Link to={`/product/${product._id}`} onClick={onNavigate} className='cartLine__img'>
        <img src={product.images?.[0]} alt={product.name} loading='lazy' />
      </Link>

      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            {product.brand && <div className='text-[10px] font-[600] uppercase tracking-[0.08em] text-gray-400 truncate'>{product.brand}</div>}
            <Link to={`/product/${product._id}`} onClick={onNavigate}
              className='block text-[13px] font-[600] text-gray-900 leading-[18px] line-clamp-2 hover:text-primary'>
              {product.name}
            </Link>
          </div>
          <button type='button' aria-label={`Remove ${product.name}`} className='cartLine__remove'
            onClick={() => run(() => context.removeCartItem(item._id))}>
            <FiTrash2 />
          </button>
        </div>

        {optionEntries(item).length > 0 && (
          <div className='flex flex-wrap gap-1 mt-1.5'>
            {optionEntries(item).map(([label, value]) => (
              <span key={label} className='cartLine__chip'>{label}: {value}</span>
            ))}
          </div>
        )}

        <div className='flex items-center justify-between gap-2 mt-2.5'>
          <div className='cartLine__qty' aria-label='Quantity'>
            <button type='button' aria-label='Decrease' onClick={() => run(() => context.updateCartQty(item._id, qty - 1))}>
              {qty <= 1 ? <FiTrash2 className='text-[12px]' /> : <FiMinus />}
            </button>
            <span>{busy ? <CircularProgress size={12} color='inherit' /> : qty}</span>
            <button type='button' aria-label='Increase' disabled={stock > 0 && qty >= stock}
              onClick={() => run(() => context.updateCartQty(item._id, qty + 1))}>
              <FiPlus />
            </button>
          </div>
          <div className='text-right'>
            <div className='text-[14px] font-[700] text-gray-900 leading-none'>{formatPrice(lineTotal)}</div>
            {lineMrp > 0 && <div className='text-[11px] text-gray-400 line-through mt-1'>{formatPrice(lineMrp)}</div>}
          </div>
        </div>
      </div>
    </li>
  )
}

// Right side se slide hone wala cart (Drawer Footer mein hai)
const CartPanel = () => {
  const context = useContext(MyContext)
  const cartData = (context?.cartData || []).filter((i) => i?.productId)
  const closePanel = () => context.setOpenCartPanel(false)

  const itemCount = cartData.reduce((t, i) => t + (i?.quantity || 1), 0)
  const subTotal = cartData.reduce((t, i) => t + (i.productId.price || 0) * (i.quantity || 1), 0)
  const mrpTotal = cartData.reduce((t, i) => t + Math.max(i.productId.oldprice || 0, i.productId.price || 0) * (i.quantity || 1), 0)
  const savings = mrpTotal - subTotal
  const couponOff = Math.min(context?.coupon?.discount || 0, subTotal)
  const charges = computeCharges(context?.settings, subTotal - couponOff)

  return (
    <div className='cartDrawer'>
      {/* Header */}
      <div className='cartDrawer__head'>
        <div className='flex items-baseline gap-2'>
          <h4 className='text-[17px] font-[700] text-gray-900'>Your Cart</h4>
          {itemCount > 0 && <span className='text-[13px] text-gray-500'>({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>}
        </div>
        <button type='button' aria-label='Close cart' onClick={closePanel} className='cartDrawer__close'>
          <IoClose />
        </button>
      </div>

      {cartData.length === 0 ? (
        <div className='flex-1 flex flex-col items-center justify-center text-center px-8'>
          <span className='w-[76px] h-[76px] rounded-full bg-[#fff1f0] text-primary text-[32px] flex items-center justify-center'>
            <FiShoppingBag />
          </span>
          <h5 className='mt-5 text-[17px] font-[700] text-gray-900'>Your cart is empty</h5>
          <div className='mt-1.5 text-[13px] text-gray-500 leading-[20px]'>Looks like you haven't added anything yet. Explore our latest deals and collections.</div>
          <Link to='/productListing' onClick={closePanel}
            className='mt-6 inline-flex items-center gap-2 h-[44px] px-6 rounded-md bg-gray-900 text-white text-[14px] font-[600] hover:bg-primary transition-colors'>
            Start shopping <FiArrowRight />
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <ul className='cartDrawer__list'>
            {cartData.map((item) => <CartLine key={item._id} item={item} onNavigate={closePanel} />)}
          </ul>

          {/* Summary */}
          <div className='cartDrawer__foot'>
            <div className='flex flex-col gap-1.5 text-[13px]'>
              <div className='flex justify-between text-gray-600'>
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span className='text-gray-900 font-[500]'>{formatPrice(subTotal)}</span>
              </div>
              {savings > 0 && (
                <div className='flex justify-between text-[#15803d]'>
                  <span>You save</span>
                  <span className='font-[600]'>− {formatPrice(savings)}</span>
                </div>
              )}
              {couponOff > 0 && <div className='flex justify-between text-[#15803d]'><span>Coupon ({context.coupon.code})</span><span className='font-[600]'>− {formatPrice(couponOff)}</span></div>}
              <div className='flex justify-between text-gray-600'>
                <span>Shipping</span>
                {charges.shipping > 0 ? <span className='text-gray-900 font-[500]'>{formatPrice(charges.shipping)}</span> : <span className='font-[600] text-[#15803d]'>Free</span>}
              </div>
              {charges.codCharge > 0 && (
                <div className='flex justify-between text-gray-600'><span>COD fee</span><span className='text-gray-900 font-[500]'>{formatPrice(charges.codCharge)}</span></div>
              )}
              {charges.toFree > 0 && <div className='text-[12px] text-[#1d4ed8]'>Add {formatPrice(charges.toFree)} more for free delivery</div>}
            </div>

            <div className='flex justify-between items-baseline mt-3 pt-3 border-t border-gray-100'>
              <span className='text-[15px] font-[700] text-gray-900'>Total</span>
              <span className='text-[20px] font-[800] text-gray-900'>{formatPrice(charges.total)}</span>
            </div>

            <Link to='/checkout' onClick={closePanel} className='cartDrawer__checkout'>
              <FiLock className='text-[15px]' /> Checkout
            </Link>
            <Link to='/cart' onClick={closePanel} className='cartDrawer__view'>View full cart</Link>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPanel
