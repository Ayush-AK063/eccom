import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import { FiCheck, FiChevronDown, FiChevronRight, FiMapPin, FiPackage, FiSearch, FiTruck, FiX } from 'react-icons/fi'
import { LiaMoneyBillWaveSolid } from 'react-icons/lia'
import AccountSidebar from '../../components/AccountSidebar'
import { MyContext } from '../../App'
import { getData, postData, putData } from '../../utils/api'
import { formatPrice, optionEntries } from '../../utils/formatPrice'
import '../MyAccount/style.css'
import './style.css'

const formatOrderDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
const shortOrderId = (id) => '#' + String(id || '').slice(-8).toUpperCase()
const orderAddressText = (a = {}) =>
  [a.flatHouse, a.areaStreet, a.landmark, a.townCity, a.state].filter(Boolean).join(', ')

const STEPS = [
  { key: 'pending', label: 'Placed', icon: <FiCheck /> },
  { key: 'confirmed', label: 'Confirmed', icon: <FiPackage /> },
  { key: 'shipped', label: 'Shipped', icon: <FiTruck /> },
  { key: 'delivered', label: 'Delivered', icon: <FiMapPin /> },
]
const STATUS = {
  pending: { label: 'Order placed', cls: 'is-pending' },
  confirmed: { label: 'Confirmed', cls: 'is-confirmed' },
  confirm: { label: 'Confirmed', cls: 'is-confirmed' },
  shipped: { label: 'Shipped', cls: 'is-shipped' },
  delivered: { label: 'Delivered', cls: 'is-delivered' },
  cancelled: { label: 'Cancelled', cls: 'is-cancelled' },
}
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]
const isActive = (s) => ['pending', 'confirmed', 'confirm', 'shipped'].includes(s || 'pending')

const CANCEL_REASONS = ['Ordered by mistake', 'Found a better price', 'Delivery is taking too long', 'Want to change items or address', 'Other']
const RETURN_REASONS = ['Damaged or defective', 'Wrong item received', 'Size or fit issue', 'Not as described', 'Quality not as expected', 'Other']
const RETURN_STATUS = {
  requested: ['Return requested', 'We are reviewing your request.', 'bg-[#fffbeb] text-[#92400e]'],
  approved: ['Return approved', 'We will arrange the pickup soon.', 'bg-[#eff6ff] text-[#1d4ed8]'],
  rejected: ['Return declined', '', 'bg-[#fef2f2] text-[#b91c1c]'],
  completed: ['Return completed', '', 'bg-[#f0fdf4] text-[#15803d]'],
}

// Cancel (ship se pehle) / Return (delivery ke baad) — chhota inline form
const OrderActions = ({ order, onUpdate }) => {
  const context = useContext(MyContext)
  const [mode, setMode] = useState(null)
  const [reason, setReason] = useState('')
  const [type, setType] = useState('return')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const status = order.orderStatus
  const rr = order.returnRequest || {}
  const canCancel = ['pending', 'confirmed'].includes(status)
  const canReturn = status === 'delivered' && !rr.status

  const submit = async () => {
    if (!reason) return context.openAlertBox('error', 'Please choose a reason')
    setBusy(true)
    const res = mode === 'cancel'
      ? await putData(`/api/order/cancel/${order._id}`, { reason })
      : await postData(`/api/order/return/${order._id}`, { reason, type, comment })
    setBusy(false)
    if (res?.error === false) { context.openAlertBox('success', res.message); onUpdate(res.data); setMode(null) }
    else context.openAlertBox('error', res?.message || 'Something went wrong')
  }

  return (
    <div className='mt-4 flex flex-col gap-3'>
      {rr.status && (
        <div className={`px-3 py-2 rounded-md text-[13px] ${RETURN_STATUS[rr.status]?.[2] || ''}`}>
          <b>{RETURN_STATUS[rr.status]?.[0]}</b> · {rr.type === 'replace' ? 'Replacement' : 'Return'} — {rr.reason}
          {(rr.adminNote || RETURN_STATUS[rr.status]?.[1]) && <div className='mt-0.5'>{rr.adminNote || RETURN_STATUS[rr.status][1]}</div>}
        </div>
      )}
      {!mode && (canCancel || canReturn) && (
        <div className='flex flex-wrap gap-2'>
          {canCancel && <button type='button' className='accBtn accBtn--light !min-w-0 hover:!border-[#dc2626] hover:!text-[#dc2626]' onClick={() => { setMode('cancel'); setReason('') }}>Cancel order</button>}
          {canReturn && <button type='button' className='accBtn accBtn--light !min-w-0' onClick={() => { setMode('return'); setReason('') }}>Return or replace</button>}
        </div>
      )}
      {mode && (
        <div className='p-4 rounded-md border border-gray-200 bg-[#fafafa] flex flex-col gap-3'>
          <div className='text-[14px] font-[700] text-gray-900'>{mode === 'cancel' ? 'Cancel this order?' : 'Request a return'}</div>
          {mode === 'return' && (
            <div className='flex gap-2'>
              {[['return', 'Return for refund'], ['replace', 'Replacement']].map(([k, l]) => (
                <button key={k} type='button' onClick={() => setType(k)} className={`h-[36px] px-3 rounded-md border text-[13px] font-[600] ${type === k ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white'}`}>{l}</button>
              ))}
            </div>
          )}
          <select value={reason} onChange={(e) => setReason(e.target.value)} className='h-[40px] px-3 rounded-md border border-gray-200 bg-white text-[13px] outline-none focus:border-gray-900'>
            <option value=''>Choose a reason</option>
            {(mode === 'cancel' ? CANCEL_REASONS : RETURN_REASONS).map((r) => <option key={r}>{r}</option>)}
          </select>
          {mode === 'return' && <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={3} placeholder='Tell us more (optional)' className='p-3 rounded-md border border-gray-200 bg-white text-[13px] outline-none focus:border-gray-900 resize-none' />}
          <div className='flex gap-2'>
            <button type='button' disabled={busy} onClick={submit} className={`h-[38px] px-4 rounded-md text-white text-[13px] font-[600] disabled:opacity-60 ${mode === 'cancel' ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-gray-900 hover:bg-primary'}`}>
              {busy ? 'Please wait…' : mode === 'cancel' ? 'Yes, cancel order' : 'Send request'}
            </button>
            <button type='button' onClick={() => setMode(null)} className='h-[38px] px-4 rounded-md border border-gray-200 bg-white text-[13px] font-[600]'>Keep order</button>
          </div>
        </div>
      )}
    </div>
  )
}

const OrderCard = ({ order, onUpdate }) => {
  const [open, setOpen] = useState(false)
  const status = order.orderStatus || 'pending'
  const st = STATUS[status] || STATUS.pending
  const stepIdx = STEPS.findIndex((s) => s.key === (status === 'confirm' ? 'confirmed' : status))
  const items = order.products || []
  const a = order.deliveryAddress || {}
  const itemCount = items.reduce((t, p) => t + (p.quantity || 1), 0)

  return (
    <article className='ordCard'>
      {/* Header */}
      <div className='ordCard__head'>
        <div className='ordMeta'>
          <div><span>Order placed</span><b>{formatOrderDate(order.createdAt)}</b></div>
          <div><span>Total</span><b>{formatPrice(order.totalAmt)}</b></div>
          <div className='hidden sm:block'><span>Ship to</span><b>{a.name || '—'}</b></div>
        </div>
        <div className='text-right'>
          <div className='text-[12px] text-gray-500'>Order <b className='text-gray-900'>{shortOrderId(order._id)}</b></div>
          <span className={`ordStatus ${st.cls}`}>{st.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className='p-4 sm:p-5'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='flex -space-x-3'>
              {items.slice(0, 3).map((p, i) => (
                <span key={i} className='ordThumb' title={p.productTitle}>{p.image && <img src={p.image} alt={p.productTitle} />}</span>
              ))}
              {items.length > 3 && <span className='ordThumb ordThumb--more'>+{items.length - 3}</span>}
            </div>
            <div className='min-w-0'>
              <div className='text-[14px] font-[600] text-gray-900 line-clamp-1'>
                {items[0]?.productTitle}{items.length > 1 ? ` + ${items.length - 1} more` : ''}
              </div>
              <div className='text-[12px] text-gray-500'>{itemCount} {itemCount === 1 ? 'item' : 'items'} · Cash on Delivery</div>
            </div>
          </div>
          <button type='button' onClick={() => setOpen((v) => !v)} className='accBtn accBtn--light !min-w-0' aria-expanded={open}>
            {open ? 'Hide details' : 'View details'} <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Progress */}
        {status === 'cancelled' ? (
          <div className='mt-4 flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 text-[13px] text-gray-600'>
            <FiX className='text-gray-400' /> This order was cancelled.
          </div>
        ) : (
          <ol className='ordSteps'>
            {STEPS.map((s, i) => (
              <li key={s.key} className={i <= stepIdx ? 'is-done' : ''}>
                <span>{s.icon}</span>{s.label}
              </li>
            ))}
            <i className='ordSteps__fill' style={{ width: `${(Math.max(stepIdx, 0) / (STEPS.length - 1)) * 76}%` }} />
          </ol>
        )}

        {order.tracking?.number && status !== 'cancelled' && (
          <div className='mt-4 flex flex-wrap items-center gap-2 px-3 py-2 rounded-md bg-[#f9fafb] border border-gray-100 text-[13px]'>
            <FiTruck className='text-gray-500' />
            <span><b>{order.tracking.courier || 'Courier'}</b> · Tracking no. <b>{order.tracking.number}</b></span>
            {order.tracking.url && <a href={order.tracking.url} target='_blank' rel='noreferrer' className='ml-auto font-[600] text-primary hover:underline'>Track package</a>}
          </div>
        )}
        {status === 'cancelled' && order.cancelledBy && (
          <div className='mt-2 text-[12px] text-gray-500'>Cancelled by {order.cancelledBy === 'customer' ? 'you' : 'the store'}{order.cancelReason ? ` — ${order.cancelReason}` : ''}</div>
        )}
        <OrderActions order={order} onUpdate={onUpdate} />

        {/* Details */}
        {open && (
          <div className='mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-6'>
            <ul>
              {items.map((p, i) => (
                <li key={i} className='flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 first:pt-0'>
                  <Link to={`/product/${p.productId}`} className='ordThumb !w-[56px] !h-[56px] !border-0'>{p.image && <img src={p.image} alt={p.productTitle} />}</Link>
                  <div className='min-w-0 flex-1'>
                    <Link to={`/product/${p.productId}`} className='text-[14px] font-[600] text-gray-900 line-clamp-1 hover:text-primary'>{p.productTitle}</Link>
                    <div className='text-[12px] text-gray-500 mt-0.5'>
                      {optionEntries(p).map(([label, value]) => `${label}: ${value}`).concat(`Qty ${p.quantity} × ${formatPrice(p.price)}`).join(' · ')}
                    </div>
                  </div>
                  <div className='text-[14px] font-[700] text-gray-900 whitespace-nowrap'>{formatPrice(p.subTotal || p.price * p.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className='flex flex-col gap-4 text-[13px]'>
              <div>
                <div className='flex items-center gap-1.5 text-[11px] font-[600] uppercase tracking-wider text-gray-500'><FiMapPin /> Delivery address</div>
                <div className='mt-1.5 font-[700] text-gray-900'>{a.name}</div>
                <div className='text-gray-600 leading-[19px]'>{orderAddressText(a)} – {a.pincode}</div>
                <div className='text-gray-800 mt-0.5'>{a.mobile}</div>
              </div>
              <div>
                <div className='flex items-center gap-1.5 text-[11px] font-[600] uppercase tracking-wider text-gray-500'><LiaMoneyBillWaveSolid className='text-[14px]' /> Payment</div>
                <div className='mt-1.5 text-gray-900 font-[600]'>Cash on Delivery</div>
              </div>
              <div className='pt-3 border-t border-dashed border-gray-200 flex flex-col gap-1'>
                {order.couponDiscount > 0 && <div className='flex justify-between text-gray-600'><span>Coupon ({order.couponCode})</span><span className='text-[#15803d] font-[600]'>− {formatPrice(order.couponDiscount)}</span></div>}
                {order.shippingCharge > 0 ? <div className='flex justify-between text-gray-600'><span>Shipping</span><span className='text-gray-900'>{formatPrice(order.shippingCharge)}</span></div> : <div className='flex justify-between text-gray-600'><span>Shipping</span><span className='font-[600] text-[#15803d]'>Free</span></div>}
                {order.codCharge > 0 && <div className='flex justify-between text-gray-600'><span>COD fee</span><span className='text-gray-900'>{formatPrice(order.codCharge)}</span></div>}
                <div className='flex justify-between'><span className='font-[700] text-gray-900'>Total</span><span className='font-[800] text-gray-900'>{formatPrice(order.totalAmt)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

const Orders = () => {
  const context = useContext(MyContext)
  const history = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!localStorage.getItem('accesstoken')) history('/login')
  }, [context?.isLogin, history])

  useEffect(() => {
    if (!context?.isLogin) return
    setIsLoading(true)
    getData('/api/order/my-orders').then((res) => {
      if (res?.error === false) setOrders(res?.data || [])
      setIsLoading(false)
    })
  }, [context?.isLogin])

  const counts = useMemo(() => ({
    all: orders.length,
    active: orders.filter((o) => isActive(o.orderStatus)).length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
  }), [orders])

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase().replace('#', '')
    return orders.filter((o) => {
      if (tab === 'active' && !isActive(o.orderStatus)) return false
      if (tab === 'delivered' && o.orderStatus !== 'delivered') return false
      if (tab === 'cancelled' && o.orderStatus !== 'cancelled') return false
      if (!term) return true
      return shortOrderId(o._id).toLowerCase().includes(term) ||
        (o.products || []).some((p) => (p.productTitle || '').toLowerCase().includes(term))
    })
  }, [orders, tab, q])

  return (
    <section className='bg-[#fafafa] py-6 pb-14'>
      <div className='container'>
        <nav className='flex items-center gap-1.5 text-[13px] text-gray-500 mb-4' aria-label='breadcrumb'>
          <Link to='/' className='hover:text-primary'>Home</Link>
          <FiChevronRight className='text-gray-300' />
          <Link to='/my-account' className='hover:text-primary'>My Account</Link>
          <FiChevronRight className='text-gray-300' />
          <span className='text-gray-900'>My Orders</span>
        </nav>

        <div className='accGrid'>
          <AccountSidebar />

          <div className='flex flex-col gap-4 min-w-0'>
            <div className='accCard'>
              <div className='accCard__head flex-wrap'>
                <div>
                  <h2>My Orders</h2>
                  <div className='text-[13px] text-gray-500 mt-0.5'>Track, view and manage your orders.</div>
                </div>
                <div className='relative w-full sm:w-[260px]'>
                  <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search order # or product'
                    className='accInput !h-[38px] pl-9 text-[13px]' />
                </div>
              </div>
              <div className='flex gap-1 px-3 overflow-x-auto'>
                {TABS.map((t) => (
                  <button key={t.key} type='button' onClick={() => setTab(t.key)} className={`ordTab ${tab === t.key ? 'is-active' : ''}`}>
                    {t.label} <span>{counts[t.key]}</span>
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className='accCard flex items-center justify-center py-16'><CircularProgress color='inherit' size={28} /></div>
            ) : shown.length === 0 ? (
              <div className='accCard flex flex-col items-center text-center py-14 px-6'>
                <span className='w-[72px] h-[72px] rounded-full bg-[#fff1f0] text-primary text-[30px] flex items-center justify-center'><FiPackage /></span>
                <div className='mt-4 text-[17px] font-[700] text-gray-900'>{orders.length ? 'No matching orders' : 'No orders yet'}</div>
                <div className='mt-1 text-[13px] text-gray-500'>{orders.length ? 'Try a different filter or search.' : 'When you place an order, it will show up here.'}</div>
                {!orders.length && <Link to='/productListing' className='mt-5 accBtn accBtn--dark'>Start shopping</Link>}
              </div>
            ) : (
              shown.map((order) => <OrderCard key={order._id} order={order} onUpdate={(o) => setOrders((l) => l.map((x) => (x._id === o._id ? o : x)))} />)
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Orders
