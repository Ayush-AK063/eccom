import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { FiCheck, FiEdit2, FiLock, FiMapPin, FiPlus, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import { MyContext } from '../../App';
import { VARIANT_FIELDS, formatPrice } from '../../utils/formatPrice';
import { postData } from '../../utils/api';
import './style.css';

const Steps = () => (
  <ol className='coSteps' aria-label='Checkout progress'>
    <li className='is-done'><span><FiCheck /></span> Cart</li>
    <li className='coSteps__bar is-done' aria-hidden />
    <li className='is-active'><span>2</span> Checkout</li>
    <li className='coSteps__bar' aria-hidden />
    <li><span>3</span> Order placed</li>
  </ol>
)

const Checkout = () => {
  const context = useContext(MyContext)
  const history = useNavigate()
  const cartData = (context?.cartData || []).filter((i) => i?.productId)
  const addressList = useMemo(() => context?.addressList || [], [context?.addressList])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isPlacing, setIsPlacing] = useState(false)

  const itemCount = cartData.reduce((t, i) => t + (i.quantity || 1), 0)
  const subTotal = cartData.reduce((t, i) => t + (i.productId.price || 0) * (i.quantity || 1), 0)
  const mrpTotal = cartData.reduce((t, i) => t + Math.max(i.productId.oldprice || 0, i.productId.price || 0) * (i.quantity || 1), 0)
  const discount = mrpTotal - subTotal
  const selected = addressList.find((a) => a._id === selectedAddressId)

  // Page upar se khule, cart panel band
  useEffect(() => {
    window.scrollTo(0, 0)
    context?.setOpenCartPanel?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Login nahi → login page
  useEffect(() => {
    if (!localStorage.getItem("accesstoken")) history('/login')
  }, [context?.isLogin, history])

  // Default address pehle chuna hua, warna pehla. Chuna hua delete ho jaaye to dobara chuno.
  useEffect(() => {
    if (addressList.length === 0) { setSelectedAddressId(null); return }
    if (!addressList.some((a) => a._id === selectedAddressId)) {
      const def = addressList.find((a) => a.isDefault) || addressList[0]
      setSelectedAddressId(def._id)
    }
  }, [addressList, selectedAddressId])

  // Cash on Delivery — total / stock server par; hum sirf address bhejte hain
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      context.openAlertBox('error', 'Please add / select a delivery address')
      document.getElementById('co-address')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (isPlacing) return
    setIsPlacing(true)
    try {
      const res = await postData('/api/order/cod', { addressId: selectedAddressId })
      if (res?.error === false) {
        context.openAlertBox('success', res?.message || 'Order placed successfully')
        await context.getCartItems()
        history('/order/success', { state: { order: res?.data } })
      } else if (res?.message && res?.success === false) {
        // Server ne wajah batayi (stock kam, address galat) → yahin dikhao
        context.openAlertBox('error', res.message)
        await context.getCartItems()
      } else {
        history('/order/failed')
      }
    } catch {
      history('/order/failed')
    } finally {
      setIsPlacing(false)
    }
  }

  if (cartData.length === 0) {
    return (
      <section className='bg-white py-12'>
        <div className='container flex flex-col items-center text-center py-16 border border-gray-100 rounded-md'>
          <span className='w-[88px] h-[88px] rounded-full bg-[#fff1f0] text-primary text-[38px] flex items-center justify-center'><FiShoppingBag /></span>
          <h1 className='mt-5 text-[22px] font-[700] text-gray-900'>Nothing to check out</h1>
          <div className='mt-2 text-[14px] text-gray-500'>Your cart is empty. Add a few items to place an order.</div>
          <Link to='/productListing' className='mt-6 inline-flex items-center h-[44px] px-6 rounded-md bg-gray-900 text-white text-[14px] font-[600] hover:bg-primary transition-colors'>
            Start shopping
          </Link>
        </div>
      </section>
    )
  }

  const placeBtn = (
    <button type='button' onClick={handlePlaceOrder} disabled={isPlacing} className='coPlace'>
      {isPlacing ? <CircularProgress size={20} color='inherit' /> : <><FiLock className='text-[15px]' /> Place Order · {formatPrice(subTotal)}</>}
    </button>
  )

  return (
    <section className='bg-white pt-6 pb-28 lg:pb-14'>
      <div className='container'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
          <h1 className='text-[26px] font-[700] text-gray-900 leading-tight'>Checkout</h1>
          <Steps />
        </div>

        <div className='coGrid'>
          <div className='flex flex-col gap-5'>
            {/* 1. Address */}
            <section id='co-address' className='coCard'>
              <div className='coCard__head'>
                <h2><span className='coNum'>1</span> Delivery Address</h2>
                {addressList.length > 0 && (
                  <button type='button' className='coLink' onClick={() => context.openAddressPanelFor(null)}>
                    <FiPlus /> Add new
                  </button>
                )}
              </div>

              {addressList.length > 0 ? (
                <div className='coAddrGrid'>
                  {addressList.map((a) => {
                    const isSel = a._id === selectedAddressId
                    return (
                      <label key={a._id} className={`coAddr ${isSel ? 'is-selected' : ''}`}>
                        <input type='radio' name='address' className='sr-only' checked={isSel} onChange={() => setSelectedAddressId(a._id)} />
                        <span className='coRadio' aria-hidden />
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center flex-wrap gap-1.5'>
                            <span className='text-[14px] font-[700] text-gray-900'>{a.name}</span>
                            <span className='coTag'>{a.addressType || 'Home'}</span>
                            {a.isDefault && <span className='coTag coTag--blue'>Default</span>}
                          </div>
                          <div className='mt-1.5 text-[13px] text-gray-600 leading-[20px]'>
                            {[a.flatHouse, a.areaStreet, a.landmark, a.townCity].filter(Boolean).join(', ')}, {a.state} – {a.pincode}
                          </div>
                          <div className='mt-1 text-[13px] font-[500] text-gray-800'>{a.mobile}</div>
                        </div>
                        <button type='button' aria-label='Edit address' className='coEdit'
                          onClick={(e) => { e.preventDefault(); context.openAddressPanelFor(a) }}>
                          <FiEdit2 />
                        </button>
                      </label>
                    )
                  })}
                  <button type='button' className='coAddr coAddr--add' onClick={() => context.openAddressPanelFor(null)}>
                    <FiPlus className='text-[20px]' />
                    <span className='text-[13px] font-[600]'>Add a new address</span>
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center text-center py-8'>
                  <span className='w-[60px] h-[60px] rounded-full bg-gray-100 text-gray-400 text-[26px] flex items-center justify-center'><FiMapPin /></span>
                  <div className='mt-3 text-[15px] font-[700] text-gray-900'>No saved address</div>
                  <div className='mt-1 text-[13px] text-gray-500'>Add a delivery address to continue.</div>
                  <button type='button' onClick={() => context.openAddressPanelFor(null)}
                    className='mt-4 inline-flex items-center gap-2 h-[40px] px-5 rounded-md bg-gray-900 text-white text-[13px] font-[600] hover:bg-primary transition-colors'>
                    <FiPlus /> Add address
                  </button>
                </div>
              )}
            </section>

            {/* 2. Payment */}
            <section className='coCard'>
              <div className='coCard__head'>
                <h2><span className='coNum'>2</span> Payment Method</h2>
              </div>
              <label className='coAddr is-selected !cursor-default'>
                <input type='radio' name='payment' className='sr-only' checked readOnly />
                <span className='coRadio' aria-hidden />
                <LiaMoneyBillWaveSolid className='text-[26px] text-gray-700 shrink-0' />
                <div className='min-w-0 flex-1'>
                  <div className='text-[14px] font-[700] text-gray-900'>Cash on Delivery</div>
                  <div className='text-[12px] text-gray-500 mt-0.5'>Pay in cash when your order is delivered.</div>
                </div>
              </label>
            </section>

            {/* 3. Items */}
            <section className='coCard'>
              <div className='coCard__head'>
                <h2><span className='coNum'>3</span> Review Items <span className='text-[13px] font-[500] text-gray-500'>({itemCount})</span></h2>
                <Link to='/cart' className='coLink'><FiEdit2 /> Edit cart</Link>
              </div>
              <ul className='flex flex-col'>
                {cartData.map((item) => {
                  const p = item.productId
                  const qty = item.quantity || 1
                  return (
                    <li key={item._id} className='flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0'>
                      <span className='coThumb'><img src={p.images?.[0]} alt={p.name} /></span>
                      <div className='min-w-0 flex-1'>
                        <div className='text-[14px] font-[600] text-gray-900 leading-[20px] line-clamp-1'>{p.name}</div>
                        <div className='flex flex-wrap items-center gap-1.5 mt-1 text-[12px] text-gray-500'>
                          {VARIANT_FIELDS.filter(({ key }) => item[key]).map(({ key, label }) => (
                            <span key={key} className='coTag'>{label}: {item[key]}</span>
                          ))}
                          <span>Qty {qty} × {formatPrice(p.price)}</span>
                        </div>
                      </div>
                      <div className='text-[14px] font-[700] text-gray-900 whitespace-nowrap'>{formatPrice(p.price * qty)}</div>
                    </li>
                  )
                })}
              </ul>
              <div className='mt-3 flex items-center gap-2 text-[12px] text-gray-500'>
                <FiTruck className='text-[15px] text-gray-400' /> Free shipping · Est. delivery in 2-3 days
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className='coSummary'>
            <h2 className='text-[17px] font-[700] text-gray-900'>Order Summary</h2>

            <div className='mt-4 flex flex-col gap-2.5 text-[14px]'>
              <div className='flex justify-between text-gray-600'><span>Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span><span className='text-gray-900'>{formatPrice(mrpTotal)}</span></div>
              {discount > 0 && <div className='flex justify-between text-gray-600'><span>Discount</span><span className='text-[#15803d] font-[600]'>− {formatPrice(discount)}</span></div>}
              <div className='flex justify-between text-gray-600'><span>Shipping</span><span className='text-[#15803d] font-[600]'>Free</span></div>
              <div className='flex justify-between text-gray-600'><span>Payment</span><span className='text-gray-900'>Cash on Delivery</span></div>
            </div>

            <div className='flex justify-between items-baseline mt-4 pt-4 border-t border-dashed border-gray-200'>
              <span className='text-[16px] font-[700] text-gray-900'>Total</span>
              <span className='text-[22px] font-[800] text-gray-900'>{formatPrice(subTotal)}</span>
            </div>
            {discount > 0 && (
              <div className='mt-3 px-3 py-2 rounded-md bg-[#f0fdf4] text-[13px] font-[600] text-[#15803d]'>You save {formatPrice(discount)} on this order</div>
            )}

            <div className='mt-4 p-3 rounded-md bg-white border border-gray-100'>
              <div className='flex items-center gap-1.5 text-[12px] font-[600] text-gray-500 uppercase tracking-wider'><FiMapPin /> Deliver to</div>
              {selected ? (
                <div className='mt-1.5 text-[13px] text-gray-700 leading-[19px]'>
                  <span className='font-[700] text-gray-900'>{selected.name}</span> · {selected.townCity}, {selected.state} – {selected.pincode}
                </div>
              ) : (
                <div className='mt-1.5 text-[13px] text-[#c2410c]'>Add a delivery address to continue</div>
              )}
            </div>

            <div className='hidden lg:block'>{placeBtn}</div>
            <div className='mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400'>
              <FiLock /> Your order details are sent securely
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: neeche chipka total + button */}
      <div className='coMobileBar lg:hidden'>
        <div>
          <div className='text-[11px] text-gray-500'>Total</div>
          <div className='text-[17px] font-[800] text-gray-900 leading-tight'>{formatPrice(subTotal)}</div>
        </div>
        <div className='flex-1 max-w-[260px]'>{placeBtn}</div>
      </div>
    </section>
  )
}

export default Checkout
