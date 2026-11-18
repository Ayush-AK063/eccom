import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import { BsXCircleFill } from 'react-icons/bs'

const OrderFailed = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className='flex flex-col items-center justify-center w-full gap-2 py-20'>
      <BsXCircleFill className='text-[110px] text-[#ff5252]' />
      <h3 className='mt-4 mb-0 text-[25px] font-[600]'>Your order has failed</h3>
      <p className='mt-0 mb-0'>Something went wrong while placing your order. Please try again.</p>

      <div className='flex items-center gap-3 mt-5'>
        <Link to='/cart'><Button className='btn-org'>Back to Cart</Button></Link>
        <Link to='/'><Button className='btn-org btn-border'>Back to Home</Button></Link>
      </div>
    </section>
  )
}

export default OrderFailed
