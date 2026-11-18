import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiCheck, FiRefreshCw, FiShoppingCart, FiWifiOff } from 'react-icons/fi'
import './style.css'

const OrderFailed = () => {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <section className='bg-[#fafafa] py-10 md:py-14'>
      <div className='container max-w-[640px]'>
        <div className='osCard text-center px-6 py-10'>
          <span className='osIcon osIcon--fail'><FiAlertTriangle /></span>
          <h1 className='mt-5 text-[26px] font-[800] text-gray-900 leading-tight'>We couldn’t place your order</h1>
          <div className='mt-2 text-[14px] text-gray-500 leading-[22px]'>
            Something went wrong on our side or with the connection. Nothing was charged and your cart is still saved.
          </div>

          <ul className='mt-6 mx-auto max-w-[400px] flex flex-col gap-2.5 text-left'>
            <li className='osHint'><FiCheck className='text-[#15803d]' /> Your items are still in your cart</li>
            <li className='osHint'><FiCheck className='text-[#15803d]' /> No payment was taken (Cash on Delivery)</li>
            <li className='osHint'><FiWifiOff className='text-gray-400' /> Check your internet connection and try again</li>
          </ul>

          <div className='mt-7 flex flex-wrap justify-center gap-3'>
            <Link to='/checkout' className='osBtn osBtn--dark'><FiRefreshCw /> Try again</Link>
            <Link to='/cart' className='osBtn osBtn--light'><FiShoppingCart /> Back to cart</Link>
          </div>
          <Link to='/' className='inline-block mt-4 text-[13px] font-[600] text-gray-500 hover:text-primary'>Back to home</Link>
        </div>
      </div>
    </section>
  )
}

export default OrderFailed
