import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { MdDeleteOutline } from "react-icons/md";
import { BsCartX } from 'react-icons/bs';
import { Button } from '@mui/material';
import { MyContext } from '../../App';
import { VARIANT_FIELDS, formatPrice } from '../../utils/formatPrice';

const CartPanel = () => {

  const context = useContext(MyContext)
  const cartData = context?.cartData || []

  const subTotal = cartData.reduce((total, item) => total + (item?.productId?.price || 0) * (item?.quantity || 1), 0)
  const itemCount = cartData.reduce((total, item) => total + (item?.quantity || 1), 0)

  const closePanel = () => context.setOpenCartPanel(false)

  if (cartData.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center w-full gap-4 px-4 py-20'>
        <BsCartX className='text-[100px] text-[rgba(0,0,0,0.25)]' />
        <h4 className='text-[16px] font-[600]'>Your cart is currently empty</h4>
        <Link to='/' onClick={closePanel}>
          <Button className='btn-org btn-sm'>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
        <div className='w-full scroll max-h-[300px] overflow-y-scroll overflow-x-hidden py-3 px-4'>
          {cartData.map((item) => {
            const product = item.productId
            return (
              <div key={item._id} className='flex items-center w-full gap-4 border-b cartItem border-[rgba(0,0,0,0.2)] pb-4 mb-3'>
                <div className='img w-[25%] overflow-hidden h-[80px] rounded-md'>
                  <Link to={`/product/${product._id}`} className='block group' onClick={closePanel}>
                    <img src={product.images?.[0]}
                    alt={product.name}
                    className='object-cover w-full h-full group-hover:scale-105'/>
                  </Link>
                </div>

                <div className='info w-[75%] pr-10 relative'>
                  <h4 className='text-[14px] font-[500]'>
                      <Link to={`/product/${product._id}`} className='transition-all link' onClick={closePanel}>
                        {product.name?.length > 60 ? product.name.substr(0, 60) + '...' : product.name}
                      </Link>
                  </h4>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {VARIANT_FIELDS.filter(({ key }) => item[key]).map(({ key, label }) => (
                        <span key={key} className='py-[2px] px-2 bg-[#f1f1f1] text-[12px] font-[600] rounded-md'>{label}: {item[key]}</span>
                    ))}
                  </div>
                  <p className='flex gap-5 mt-2 mb-2 itmes-center'>
                    <span>Qty : <span>{item.quantity}</span></span>
                    <span className='font-bold text-primary '>Price : {formatPrice(product.price)}</span>
                  </p>

                  <MdDeleteOutline className='absolute top-[10px] right-[10px] cursor-pointer text-[20px] link transition-all'
                    onClick={() => context.removeCartItem(item._id)} />
                </div>
              </div>
            )
          })}
        </div>

        <br />

        <div className='absolute bottomSec bottom-[10px] w-full overflow-hidden'>
        <div className='w-full py-3 px-4 border-t bottomInfo border-[rgba(0,0,0,0.1)] flex flex-col items-center justify-between'>
            <div className='flex items-center justify-between w-full'>
                <span className='text-[14px] font-[500]'>{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                <span className='font-bold text-primary'>{formatPrice(subTotal)}</span>
            </div>
            <div className='flex items-center justify-between w-full'>
                <span className='text-[14px] font-[500]'>Shipping</span>
                <span className='font-bold text-primary'>Free</span>
            </div>
        </div>

        <div className='w-full py-3 px-4 border-t bottomInfo border-[rgba(0,0,0,0.1)] flex flex-col items-center justify-between'>
            <div className='flex items-center justify-between w-full'>
                <span className='text-[14px] font-[500]'>Total(tax excl.)</span>
                <span className='font-bold text-primary'>{formatPrice(subTotal)}</span>
            </div>

            <br />

            <div className='flex items-center justify-between w-full gap-5'>
                <Link to='/cart' className='w-[50%] d-block' onClick={closePanel}>
                    <Button className='w-full btn-org btn-lg'>View Cart</Button>
                </Link>
                <Link to='/checkout' className='w-[50%] d-block' onClick={closePanel}>
                    <Button className='w-full btn-org btn-border btn-lg'>Checkout</Button>
                </Link>
            </div>
        </div>
        </div>
    </>
  )
}

export default CartPanel
