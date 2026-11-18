import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@mui/material'
import { BsCheckCircleFill } from 'react-icons/bs'
import { formatPrice } from '../../utils/formatPrice'

const OrderSuccess = () => {
  // Checkout se order ki details aati hain (refresh par nahi hoti — tab sirf message)
  const order = useLocation()?.state?.order

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className='flex flex-col items-center justify-center w-full gap-2 py-20'>
      <BsCheckCircleFill className='text-[110px] text-green-600' />
      <h3 className='mt-4 mb-0 text-[25px] font-[600]'>Your order is placed!</h3>
      <p className='mt-0 mb-0'>Thank you for shopping with us.</p>

      {order && (
        <p className='mt-1 mb-0 text-[14px] text-gray-600'>
          Order <span className='font-[600] text-black'>#{String(order._id).slice(-8).toUpperCase()}</span>
          {' · '}{formatPrice(order.totalAmt)}
          {' · '}Cash on Delivery
        </p>
      )}

      <div className='flex items-center gap-3 mt-5'>
        <Link to='/my-orders'><Button className='btn-org'>View My Orders</Button></Link>
        <Link to='/'><Button className='btn-org btn-border'>Back to Home</Button></Link>
      </div>
    </section>
  )
}

export default OrderSuccess
