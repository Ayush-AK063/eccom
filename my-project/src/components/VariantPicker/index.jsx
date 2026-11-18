import React, { useContext, useState } from 'react'
import { IoClose } from "react-icons/io5";
import CircularProgress from '@mui/material/CircularProgress';
import { MyContext } from '../../App';
import { optionFields, isSameCartItem, isVariantComplete, isOptionAvailable, formatPrice, variantView } from '../../utils/formatPrice';
import './style.css';

// Card pe Add to Cart -> ye popup. Option chunte hi item cart mein jata hai, popup band,
// aur card ka button "− qty +" ban jata hai (onAdded se parent ko chuna hua variant milta hai).
const VariantPicker = ({ product, onClose, onAdded }) => {
    const context = useContext(MyContext)
    const fields = optionFields(product)
    const [variant, setVariant] = useState({})
    const [busy, setBusy] = useState(false)

    const choose = async (key, value) => {
        if (busy) return
        const next = { ...variant, [key]: value }
        setVariant(next)
        if (!isVariantComplete(product, next)) return // aur option baaki (jaise size + weight)

        setBusy(true)
        try {
            // Ye option pehle se cart mein hai -> uski qty +1 (backend dobara add nahi karta)
            const existing = context?.cartData?.find((c) => isSameCartItem(c, product, next))
            const res = existing
                ? await context.updateCartQty(existing._id, (existing.quantity || 1) + 1)
                : await context.addToCart(product, 1, next)
            if (res?.error !== true) {
                if (existing) context.openAlertBox('success', `Added to cart · Qty ${(existing.quantity || 1) + 1}`)
                onAdded?.(next)
                onClose?.()
            }
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <button type='button' aria-label='Close' className='vPicker__scrim' onClick={onClose} />

            <div className='vPicker' role='dialog' aria-label='Select options'>
                <div className='flex items-center justify-between mb-2.5'>
                    <span className='text-[13px] font-[700] text-gray-900'>
                        Select {fields.map((f) => f.label.toLowerCase()).join(' & ')}
                    </span>
                    {busy
                        ? <CircularProgress size={16} color='inherit' className='text-gray-500' />
                        : <button type='button' aria-label='Close' onClick={onClose} className='vPicker__close'><IoClose /></button>}
                </div>

                <div className='flex flex-col gap-2.5'>
                    {fields.map(({ key, label, values, display, hex, unit }) => (
                        <div key={key}>
                            {fields.length > 1 && <div className='text-[11px] font-[600] text-gray-500 mb-1'>{label}</div>}
                            <div className='flex flex-wrap gap-1.5'>
                                {values.map((value) => {
                                    const available = isOptionAvailable(product, variant, key, value)
                                    // Aakhri option: is value ka price alag ho to dikhao
                                    const last = isVariantComplete(product, { ...variant, [key]: value })
                                    const v = last ? variantView(product, { ...variant, [key]: value }) : null
                                    return (
                                        <button
                                            key={value}
                                            type='button'
                                            disabled={busy || !available}
                                            onClick={() => choose(key, value)}
                                            title={value}
                                            className={`vPicker__opt ${display === 'swatch' ? 'vPicker__opt--swatch' : ''} ${variant[key] === value ? 'is-active' : ''} ${!available ? 'is-na' : ''}`}
                                        >
                                            {display === 'swatch' && <i className='vPicker__dot' style={{ background: hex?.[value] || '#e5e7eb' }} />}
                                            {value}{unit ? ` ${unit}` : ''}
                                            {v && v.price !== product.price && available && <span className='ml-1 text-[10px] opacity-70'>{formatPrice(v.price).replace('.00', '')}</span>}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default VariantPicker
