import React, { useContext, useEffect, useRef, useState } from 'react'
import { FiTag, FiX } from 'react-icons/fi'
import { MyContext } from '../../App'

// Coupon input (cart + checkout). Subtotal badle to coupon dobara check hota hai.
const CouponBox = ({ subTotal }) => {
  const context = useContext(MyContext)
  const { coupon, setCoupon, applyCoupon, isLogin } = context
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const last = useRef(subTotal)

  useEffect(() => {
    if (!coupon || last.current === subTotal) return
    last.current = subTotal
    applyCoupon(coupon.code, subTotal).then((r) => {
      if (!r.ok) { setCoupon(null); setError(r.message) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTotal])

  const apply = async (e) => {
    e.preventDefault()
    if (!isLogin) return setError('Please log in to use a coupon')
    if (!code.trim()) return
    setBusy(true); setError('')
    const r = await applyCoupon(code.trim(), subTotal)
    setBusy(false)
    last.current = subTotal
    if (r.ok) { setCode(''); context.openAlertBox('success', r.message) } else setError(r.message)
  }

  if (coupon) {
    return (
      <div className='mt-4 flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-[#15803d] bg-[#f0fdf4] text-[13px]'>
        <FiTag className='text-[#15803d] shrink-0' />
        <span className='flex-1 min-w-0'><b className='text-[#15803d]'>{coupon.code}</b> applied{coupon.description ? <span className='block text-[12px] text-gray-500 truncate'>{coupon.description}</span> : null}</span>
        <button type='button' onClick={() => setCoupon(null)} aria-label='Remove coupon' className='text-gray-500 hover:text-[#dc2626]'><FiX /></button>
      </div>
    )
  }
  return (
    <form onSubmit={apply} className='mt-4'>
      <div className='flex gap-2'>
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }} placeholder='Coupon code'
          className='flex-1 min-w-0 h-[40px] px-3 rounded-md border border-gray-200 text-[13px] uppercase outline-none focus:border-gray-900' />
        <button disabled={busy || !code.trim()} className='h-[40px] px-4 rounded-md border border-gray-900 text-[13px] font-[600] hover:bg-gray-900 hover:text-white disabled:opacity-40'>
          {busy ? '…' : 'Apply'}
        </button>
      </div>
      {error && <div className='mt-1.5 text-[12px] text-[#dc2626]'>{error}</div>}
    </form>
  )
}

export default CouponBox
