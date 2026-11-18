import React, { useContext, useEffect } from 'react'
import { BsCartX } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import CartItems from './CartItems';
import { MyContext } from '../../App';
import { formatPrice } from '../../utils/formatPrice';

const CartPage = () => {

  const context = useContext(MyContext)

  // Page hamesha upar se khule
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const cartData = context?.cartData || []
  const subTotal = cartData.reduce((total, item) => total + (item?.productId?.price || 0) * (item?.quantity || 1), 0)

  if (cartData.length === 0) {
    return (
      <section className='py-5 pb-10 section'>
        <div className='container w-[80%] max-w-[80%] flex flex-col items-center justify-center gap-4 py-20 bg-white rounded-md shadow-md'>
          <BsCartX className='text-[120px] text-[rgba(0,0,0,0.25)]' />
          <h2 className='text-[20px] font-[600]'>Your cart is currently empty</h2>
          {!context?.isLogin && <p className='mt-0'>Please <Link to='/login' className='link text-primary font-[600]'>login</Link> to see your cart.</p>}
          <Link to='/'><Button className='btn-org'>Continue Shopping</Button></Link>
        </div>
      </section>
    )
  }

  return (
    <section className='py-5 pb-10 section'>
        <div className='container w-[80%] max-w-[80%] flex gap-5'>
            <div className='leftTop w-[70%]'>
                <h2>Your Cart</h2>
                <p className='mt-0'>There are <span className='font-bold text-primary'>{cartData.length}</span> products in your cart</p>
            </div>
            <div className='rightTop w-[30%]'>
                <h2>Cart Total</h2>
            </div>
        </div>
        <div className='container w-[80%] max-w-[80%] flex gap-5'>
            <div className='leftPart w-[70%]'>
                <div className='bg-white rounded-md shadow-md'>
                    {cartData.map((item) => (
                        <CartItems key={item._id} item={item} />
                    ))}
                </div>
            </div>

            <div className='rightPart w-[30%]'>
                <div className='p-5 bg-white rounded-md shadow-md sticky top-[150px] z-[90]'>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Subtotal</span>
                        <span className='font-bold text-primary'>{formatPrice(subTotal)}</span>
                    </p>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Shipping</span>
                        <span className='font-bold'>Free</span>
                    </p>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Estimate for</span>
                        <span className='font-bold'>India</span>
                    </p>
                    <p className='flex items-center justify-between'>
                        <span className='text-[14px] font-[500]'>Total</span>
                        <span className='font-bold text-primary'>{formatPrice(subTotal)}</span>
                    </p>

                    <br />

                    <Link to='/checkout'>
                        <Button className='w-full btn-org btn-lg'>
                            Checkout
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </section>
  )
}

export default CartPage
