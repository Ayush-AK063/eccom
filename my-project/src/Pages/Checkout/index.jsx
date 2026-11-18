import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Radio from '@mui/material/Radio';
import { BsFillBagCheckFill, BsCartX } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { TbMapPinOff } from "react-icons/tb";
import { MyContext } from '../../App';
import { formatPrice } from '../../utils/formatPrice';
import { postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';

const Checkout = () => {
  const context = useContext(MyContext)
  const history = useNavigate()
  const cartData = context?.cartData || []
  const addressList = context?.addressList || []
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  const subTotal = cartData.reduce((total, item) => total + (item?.productId?.price || 0) * (item?.quantity || 1), 0)

  // Page upar se khule, cart panel band
  useEffect(() => {
    window.scrollTo(0, 0)
    context?.setOpenCartPanel?.(false)
  }, [])

  // Login nahi → login page
  useEffect(() => {
    if (!localStorage.getItem("accesstoken")) {
      history('/login')
    }
  }, [context?.isLogin])

  // Default address pehle chuna hua, warna pehla. Chuna hua delete ho jaaye to dobara chuno.
  useEffect(() => {
    if (addressList.length === 0) {
      setSelectedAddressId(null)
      return
    }
    if (!addressList.some((a) => a._id === selectedAddressId)) {
      const def = addressList.find((a) => a.isDefault) || addressList[0]
      setSelectedAddressId(def._id)
    }
  }, [addressList])

  const [isPlacing, setIsPlacing] = useState(false)

  // Cash on Delivery — total / stock server par; hum sirf address bhejte hain
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      context.openAlertBox('error', 'Please add / select a delivery address')
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
        // Server ne wajah batayi (stock kam, address galat) → yahin dikhao, user theek kar sake
        context.openAlertBox('error', res.message)
        await context.getCartItems() // stock / price badla ho to latest dikhao
      } else {
        // Network / server down
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
      <section className='py-10'>
        <div className='container flex flex-col items-center justify-center gap-3 py-10 bg-white rounded-md shadow-md'>
          <BsCartX className='text-[120px] text-[rgba(0,0,0,0.25)]' />
          <h2 className='text-[20px] font-[600]'>Your cart is currently empty</h2>
          <Link to='/'><Button className='btn-org'>Continue Shopping</Button></Link>
        </div>
      </section>
    )
  }

  return (
    <section className='py-10'>
      <div className='container w-[80%] max-w-[80%] flex gap-5'>

        {/* ── Delivery address ── */}
        <div className='leftCol w-[60%]'>
          <div className='w-full p-5 bg-white rounded-md shadow-md card'>
            <div className='flex items-center justify-between'>
              <h2 className='text-[18px] font-[600]'>Select Delivery Address</h2>
              {addressList.length > 0 && (
                <Button variant='outlined' size='small' className='!border-primary !text-primary flex gap-2'
                  onClick={() => context.openAddressPanelFor(null)}>
                  <FaPlus /> Add New Address
                </Button>
              )}
            </div>

            {addressList.length > 0 ? (
              <div className='flex flex-col gap-4 mt-5'>
                {addressList.map((address) => {
                  const isSelected = address._id === selectedAddressId
                  return (
                    <label key={address._id}
                      className={`relative flex gap-3 p-4 border rounded-md cursor-pointer transition-all
                        ${isSelected ? 'bg-[#fff2f2] border-[#ff5252]' : 'border-[rgba(0,0,0,0.15)]'}`}>
                      <div>
                        <Radio size='small' checked={isSelected}
                          onChange={() => setSelectedAddressId(address._id)}
                          sx={{ '&.Mui-checked': { color: '#ff5252' } }} />
                      </div>

                      <div className='info pr-16'>
                        <span className='inline-block px-2 py-1 mb-2 text-[12px] font-[500] uppercase bg-[#f1f1f1] rounded-md'>
                          {address.addressType || 'Home'}
                        </span>
                        {address.isDefault && (
                          <span className='inline-block px-2 py-1 mb-2 ml-2 text-[12px] font-[500] uppercase text-blue-800 bg-blue-100 rounded-md'>Default</span>
                        )}
                        <h3 className='text-[15px] font-[600] mb-1'>{address.name}</h3>
                        <p className='mt-0 mb-1 text-[14px] text-gray-700'>
                          {address.flatHouse}, {address.areaStreet}
                          {address.landmark ? `, ${address.landmark}` : ''}, {address.townCity}, {address.state} - {address.pincode}, {address.country}
                        </p>
                        <p className='mt-0 mb-0 text-[14px] font-[500]'>{address.mobile}</p>
                      </div>

                      <Button size='small' className='!absolute top-[15px] right-[15px] !text-primary flex gap-1'
                        onClick={(e) => { e.preventDefault(); context.openAddressPanelFor(address) }}>
                        <FiEdit /> Edit
                      </Button>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center gap-2 py-10 mt-5'>
                <TbMapPinOff className='text-[80px] text-[rgba(0,0,0,0.25)]' />
                <h3 className='mb-0 text-[17px] font-[600] text-center'>No address found in your account</h3>
                <p className='mt-0'>Add a delivery address to continue.</p>
                <Button className='btn-org btn-sm flex gap-2' onClick={() => context.openAddressPanelFor(null)}>
                  <FaPlus /> Add Address
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className='rightCol w-[40%]'>
          <div className='p-5 bg-white rounded-md shadow-md card sticky top-[150px]'>
            <h2 className='mb-4 text-[18px] font-[600]'>Your Order</h2>

            <div className='flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]'>
              <span className='text-[14px] font-[600]'>Product</span>
              <span className='text-[14px] font-[600]'>Subtotal</span>
            </div>

            <div className='mb-5 scroll max-h-[250px] overflow-y-auto overflow-x-hidden pr-2'>
              {cartData.map((item) => {
                const product = item?.productId || {}
                const name = product?.name || ''
                const variant = [item?.size, item?.productRam, item?.productWeight].filter(Boolean).join(' / ')
                return (
                  <div key={item._id} className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-3 part1'>
                      <div className='img w-[50px] h-[50px] overflow-hidden rounded-md group'>
                        <img src={product?.images?.[0]} alt={name}
                          className='object-cover w-full h-full transition-all group-hover:scale-105' />
                      </div>
                      <div className='info'>
                        <h4 className='text-[14px]' title={name}>{name.length > 20 ? name.substr(0, 20) + '...' : name}</h4>
                        <span className='text-[13px]'>Qty: {item?.quantity || 1}{variant ? ` · ${variant}` : ''}</span>
                      </div>
                    </div>
                    <span className='text-[14px] font-[500]'>{formatPrice((product?.price || 0) * (item?.quantity || 1))}</span>
                  </div>
                )
              })}
            </div>

            <p className='flex items-center justify-between'>
              <span className='text-[14px] font-[500]'>Subtotal</span>
              <span className='font-bold'>{formatPrice(subTotal)}</span>
            </p>
            <p className='flex items-center justify-between'>
              <span className='text-[14px] font-[500]'>Shipping</span>
              <span className='font-bold'>Free</span>
            </p>
            <p className='flex items-center justify-between'>
              <span className='text-[14px] font-[500]'>Payment</span>
              <span className='font-bold'>Cash on Delivery</span>
            </p>
            <p className='flex items-center justify-between'>
              <span className='text-[14px] font-[600]'>Total</span>
              <span className='font-bold text-primary'>{formatPrice(subTotal)}</span>
            </p>

            <Button className='flex w-full gap-2 mt-3 btn-org btn-lg' onClick={handlePlaceOrder} disabled={isPlacing}>
              {isPlacing
                ? <CircularProgress size={22} color='inherit' />
                : <><BsFillBagCheckFill className='text-[20px]' /> Place Order (Cash on Delivery)</>}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout
