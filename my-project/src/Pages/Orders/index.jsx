import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccountSidebar from '../../components/AccountSidebar'
import { Button, CircularProgress } from '@mui/material'
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { BsBagX } from "react-icons/bs";
import Badge from '../../components/Badge';
import { MyContext } from '../../App';
import { getData } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';

const TH = 'px-6 py-3 whitespace-nowrap'
const TD = 'px-6 py-4 font-[500]'

export const formatOrderDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export const shortOrderId = (id) => '#' + String(id || '').slice(-8).toUpperCase()

export const orderAddressText = (a = {}) =>
  [a.flatHouse, a.areaStreet, a.landmark, a.townCity, a.state, a.country].filter(Boolean).join(', ')

const Orders = () => {
  const context = useContext(MyContext)
  const history = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [openOrderId, setOpenOrderId] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!localStorage.getItem('accesstoken')) {
      history('/login')
    }
  }, [context?.isLogin])

  useEffect(() => {
    if (!context?.isLogin) return
    setIsLoading(true)
    getData('/api/order/my-orders').then((res) => {
      if (res?.error === false) setOrders(res?.data || [])
      setIsLoading(false)
    })
  }, [context?.isLogin])

  const toggleOrder = (id) => setOpenOrderId(openOrderId === id ? null : id)

  return (
    <section className='w-full py-10'>
      <div className='container flex gap-5'>
        <div className='col1 w-[20%]'>
          <AccountSidebar />
        </div>

        <div className='col2 w-[80%]'>
          <div className='bg-white rounded-md shadow-md'>
            <div className='px-3 py-5 border-b border-[rgba(0,0,0,0.1)]'>
              <h2>My Orders</h2>
              <p className='mt-0 mb-0'>
                There {orders.length === 1 ? 'is' : 'are'} <span className='font-bold text-primary'>{orders.length}</span>{' '}
                {orders.length === 1 ? 'order' : 'orders'}
              </p>

              {isLoading ? (
                <div className='flex items-center justify-center py-10'><CircularProgress color='inherit' /></div>
              ) : orders.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-3 py-10'>
                  <BsBagX className='text-[90px] text-[rgba(0,0,0,0.25)]' />
                  <h3 className='text-[18px] font-[600]'>No orders yet</h3>
                  <Link to='/'><Button className='btn-org'>Continue Shopping</Button></Link>
                </div>
              ) : (
                <div className='relative mt-5 overflow-x-auto'>
                  <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
                      <tr>
                        <th className={TH}>&nbsp;</th>
                        <th className={TH}>Order</th>
                        <th className={TH}>Payment</th>
                        <th className={TH}>Name</th>
                        <th className={TH}>Phone</th>
                        <th className={TH}>Address</th>
                        <th className={TH}>Pincode</th>
                        <th className={TH}>Total</th>
                        <th className={TH}>Status</th>
                        <th className={TH}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const a = order.deliveryAddress || {}
                        const isOpen = openOrderId === order._id
                        return (
                          <React.Fragment key={order._id}>
                            <tr className='bg-white border-b border-gray-200'>
                              <td className={TD}>
                                <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]'
                                  onClick={() => toggleOrder(order._id)}>
                                  {isOpen
                                    ? <FaAngleUp className='text-[16px] text-[rgba(0,0,0,0.7)]' />
                                    : <FaAngleDown className='text-[16px] text-[rgba(0,0,0,0.7)]' />}
                                </Button>
                              </td>
                              <td className={TD}><span className='text-primary whitespace-nowrap'>{shortOrderId(order._id)}</span></td>
                              <td className={`${TD} whitespace-nowrap`}>{order.paymentId || 'Cash on Delivery'}</td>
                              <td className={`${TD} whitespace-nowrap`}>{a.name}</td>
                              <td className={TD}>{a.mobile}</td>
                              <td className={TD}><span className='block w-[300px]'>{orderAddressText(a)}</span></td>
                              <td className={TD}>{a.pincode}</td>
                              <td className={`${TD} whitespace-nowrap`}>{formatPrice(order.totalAmt)}</td>
                              <td className={TD}><Badge status={order.orderStatus} /></td>
                              <td className={`${TD} whitespace-nowrap`}>{formatOrderDate(order.createdAt)}</td>
                            </tr>

                            {isOpen && (
                              <tr>
                                <td className='pl-20' colSpan='10'>
                                  <OrderProductsTable products={order.products} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Order ke andar ke products (▼ se khulte hain)
export const OrderProductsTable = ({ products = [] }) => (
  <table className='w-full text-sm text-left text-gray-500'>
    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
      <tr>
        <th className={TH}>Product</th>
        <th className={TH}>Image</th>
        <th className={TH}>Variant</th>
        <th className={TH}>Qty</th>
        <th className={TH}>Price</th>
        <th className={TH}>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {products.map((item, i) => {
        const title = item.productTitle || ''
        const variant = [item.size, item.productRam, item.productWeight].filter(Boolean).join(' / ')
        return (
          <tr key={i} className='bg-white border-b border-gray-200'>
            <td className={TD}>
              <Link to={`/product/${item.productId}`} className='link' title={title}>
                <span className='block w-[200px]'>{title.length > 40 ? title.substr(0, 40) + '...' : title}</span>
              </Link>
            </td>
            <td className={TD}><img src={item.image} alt={title} className='w-[40px] h-[40px] object-cover rounded-md' /></td>
            <td className={`${TD} whitespace-nowrap`}>{variant || '-'}</td>
            <td className={TD}>{item.quantity}</td>
            <td className={`${TD} whitespace-nowrap`}>{formatPrice(item.price)}</td>
            <td className={`${TD} whitespace-nowrap`}>{formatPrice(item.subTotal || item.price * item.quantity)}</td>
          </tr>
        )
      })}
    </tbody>
  </table>
)

export default Orders
