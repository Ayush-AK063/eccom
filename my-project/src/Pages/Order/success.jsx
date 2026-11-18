import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiCheck, FiCopy, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi'
import { LiaMoneyBillWaveSolid } from 'react-icons/lia'
import { VARIANT_FIELDS, formatPrice } from '../../utils/formatPrice'
import './style.css'

const fmtDay = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

const OrderSuccess = () => {
  // Checkout se order aata hai (refresh par nahi — tab sirf message)
  const order = useLocation()?.state?.order
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const orderNo = order ? String(order._id).slice(-8).toUpperCase() : ''
  const placed = order?.createdAt ? new Date(order.createdAt) : new Date()
  const etaFrom = new Date(placed); etaFrom.setDate(etaFrom.getDate() + 2)
  const etaTo = new Date(placed); etaTo.setDate(etaTo.getDate() + 3)
  const addr = order?.deliveryAddress
  const items = order?.products || []
  const itemCount = items.reduce((t, p) => t + (p.quantity || 1), 0)

  const copy = async () => {
    try { await navigator.clipboard.writeText(orderNo); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ }
  }

  return (
    <section className='bg-[#fafafa] py-10 md:py-14'>
      <div className='container max-w-[860px]'>
        {/* Hero */}
        <div className='osCard text-center px-6 py-10'>
          <span className='osIcon osIcon--ok'><FiCheck /></span>
          <h1 className='mt-5 text-[26px] font-[800] text-gray-900 leading-tight'>Thank you! Your order is placed.</h1>
          <div className='mt-2 text-[14px] text-gray-500'>We’ve received your order and will start preparing it right away.</div>

          {order && (
            <div className='mt-5 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-gray-600'>
              <span className='inline-flex items-center gap-1.5'>
                Order <b className='text-gray-900'>#{orderNo}</b>
                <button type='button' onClick={copy} aria-label='Copy order number' className='osCopy'>
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
              </span>
              <span className='text-gray-300'>|</span>
              <span>{placed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className='text-gray-300'>|</span>
              <span className='font-[700] text-gray-900'>{formatPrice(order.totalAmt)}</span>
            </div>
          )}

          {/* Status timeline */}
          <ol className='osTimeline'>
            <li className='is-done'><span><FiCheck /></span>Placed</li>
            <li><span><FiPackage /></span>Confirmed</li>
            <li><span><FiTruck /></span>Shipped</li>
            <li><span><FiMapPin /></span>Delivered</li>
          </ol>
          <div className='mt-4 text-[13px] text-gray-600'>
            Estimated delivery: <b className='text-gray-900'>{fmtDay(etaFrom)} – {fmtDay(etaTo)}</b>
          </div>

          <div className='mt-7 flex flex-wrap justify-center gap-3'>
            <Link to='/my-orders' className='osBtn osBtn--dark'>View my orders</Link>
            <Link to='/productListing' className='osBtn osBtn--light'>Continue shopping</Link>
          </div>
        </div>

        {/* Details */}
        {order && (
          <div className='mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-5'>
            <div className='osCard p-5'>
              <h2 className='text-[15px] font-[700] text-gray-900'>Items ({itemCount})</h2>
              <ul className='mt-2'>
                {items.map((p, i) => (
                  <li key={p.productId + i} className='flex items-center gap-4 py-3 border-b border-gray-100 last:border-0'>
                    <span className='osThumb'>{p.image && <img src={p.image} alt={p.productTitle} />}</span>
                    <div className='min-w-0 flex-1'>
                      <div className='text-[14px] font-[600] text-gray-900 line-clamp-1'>{p.productTitle}</div>
                      <div className='mt-0.5 text-[12px] text-gray-500'>
                        {VARIANT_FIELDS.filter(({ key }) => p[key]).map(({ key, label }) => `${label}: ${p[key]}`).concat(`Qty ${p.quantity}`).join(' · ')}
                      </div>
                    </div>
                    <div className='text-[14px] font-[700] text-gray-900 whitespace-nowrap'>{formatPrice(p.subTotal)}</div>
                  </li>
                ))}
              </ul>
              <div className='mt-3 pt-3 border-t border-dashed border-gray-200 flex flex-col gap-1.5 text-[13px]'>
                <div className='flex justify-between text-gray-600'><span>Shipping</span><span className='font-[600] text-[#15803d]'>Free</span></div>
                <div className='flex justify-between items-baseline'><span className='text-[15px] font-[700] text-gray-900'>Total</span><span className='text-[18px] font-[800] text-gray-900'>{formatPrice(order.totalAmt)}</span></div>
              </div>
            </div>

            <div className='flex flex-col gap-5'>
              {addr && (
                <div className='osCard p-5'>
                  <div className='flex items-center gap-1.5 text-[12px] font-[600] uppercase tracking-wider text-gray-500'><FiMapPin /> Delivering to</div>
                  <div className='mt-2 text-[14px] font-[700] text-gray-900'>{addr.name}</div>
                  <div className='mt-1 text-[13px] text-gray-600 leading-[20px]'>
                    {[addr.flatHouse, addr.areaStreet, addr.landmark, addr.townCity].filter(Boolean).join(', ')}, {addr.state} – {addr.pincode}
                  </div>
                  <div className='mt-1 text-[13px] text-gray-800'>{addr.mobile}</div>
                </div>
              )}
              <div className='osCard p-5'>
                <div className='flex items-center gap-1.5 text-[12px] font-[600] uppercase tracking-wider text-gray-500'><LiaMoneyBillWaveSolid className='text-[15px]' /> Payment</div>
                <div className='mt-2 text-[14px] font-[700] text-gray-900'>Cash on Delivery</div>
                <div className='mt-1 text-[13px] text-gray-600'>Please keep {formatPrice(order.totalAmt)} ready at delivery.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default OrderSuccess
