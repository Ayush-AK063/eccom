import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import { FiCheck, FiChevronDown, FiChevronRight, FiMapPin, FiPackage, FiSearch, FiTruck, FiX } from 'react-icons/fi'
import { LiaMoneyBillWaveSolid } from 'react-icons/lia'
import AccountSidebar from '../../components/AccountSidebar'
import { MyContext } from '../../App'
import { getData } from '../../utils/api'
import { VARIANT_FIELDS, formatPrice } from '../../utils/formatPrice'
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

const OrderCard = ({ order }) => {
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
                      {VARIANT_FIELDS.filter(({ key }) => p[key]).map(({ key, label }) => `${label}: ${p[key]}`).concat(`Qty ${p.quantity} × ${formatPrice(p.price)}`).join(' · ')}
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
                <div className='flex justify-between text-gray-600'><span>Shipping</span><span className='text-[#15803d] font-[600]'>Free</span></div>
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
              shown.map((order) => <OrderCard key={order._id} order={order} />)
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Orders
