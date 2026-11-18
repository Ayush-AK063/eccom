import React, { useContext, useState } from 'react'
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { MyContext } from '../../App';
import { isSameCartItem, isVariantComplete, variantView } from '../../utils/formatPrice';

// Product (+ chuna gaya variant) cart mein nahi → "Add to Cart" button
// Cart mein hai → [-] qty [+]  (qty 0 = item remove)
// Variant chahiye par chuna nahi → onNeedVariant() (card par overlay khulta hai)
// alwaysAdd: card ke liye — hamesha "Add to Cart" button; cart mein ho to har click pe qty +1 (stepper nahi)
const AddToCart = ({ product, quantity = 1, variant = {}, onNeedVariant, alwaysAdd = false, className = '', compact = false }) => {

    const context = useContext(MyContext)
    const [isLoading, setIsLoading] = useState(false)

    const variantReady = isVariantComplete(product, variant)
    const cartItem = variantReady
        ? context?.cartData?.find((c) => isSameCartItem(c, product, variant))
        : null
    // Variant chuna ho to uska stock, warna product ka total
    const stock = variantReady ? variantView(product, variant).stock : product?.countInStock || 0
    const limit = product?.maxOrderQty > 0 ? Math.min(stock, product.maxOrderQty) : stock
    const outOfStock = !(stock > 0)

    const run = async (fn) => {
        if (isLoading) return
        setIsLoading(true)
        try {
            await fn()
        } finally {
            setIsLoading(false)
        }
    }

    if (cartItem && !alwaysAdd) {
        const qty = cartItem.quantity || 1
        const maxReached = qty >= limit
        return (
            <div className={`flex items-center justify-between overflow-hidden border rounded-md ${compact ? 'border-primary h-[38px]' : 'border-[rgba(0,0,0,0.15)]'} ${className}`}>
                <Button className='!min-w-[35px] !w-[35px] !h-[35px] !rounded-none !text-black'
                    disabled={isLoading}
                    onClick={() => run(() => context.updateCartQty(cartItem._id, qty - 1))}>
                    <FaMinus className='text-[12px]' />
                </Button>
                <span className='text-[14px] font-[600] px-2'>
                    {isLoading ? <CircularProgress size={14} color='inherit' /> : qty}
                </span>
                <Button className='!min-w-[35px] !w-[35px] !h-[35px] !rounded-none !text-black'
                    disabled={isLoading || maxReached}
                    onClick={() => run(() => context.updateCartQty(cartItem._id, qty + 1))}>
                    <FaPlus className='text-[12px]' />
                </Button>
            </div>
        )
    }

    const handleAdd = () => {
        if (!variantReady) {
            if (onNeedVariant) onNeedVariant()
            else context.openAlertBox('error', 'Please select the product options first')
            return
        }
        if (cartItem) {
            // alwaysAdd: pehle se cart mein -> qty badhao
            if ((cartItem.quantity || 1) >= limit) return context.openAlertBox('error', product?.maxOrderQty > 0 && limit === product.maxOrderQty ? `Max ${limit} per order` : 'No more stock available')
            const next = (cartItem.quantity || 1) + quantity
            return run(async () => {
                const res = await context.updateCartQty(cartItem._id, next)
                if (res?.error === false) context.openAlertBox('success', `Added to cart · Qty ${next}`)
            })
        }
        run(() => context.addToCart(product, quantity, variant))
    }

    return (
        <Button className={compact ? `addCartCompact ${className}` : `flex gap-2 btn-org ${className}`}
            disabled={isLoading || outOfStock}
            onClick={handleAdd}>
            {isLoading ? <CircularProgress size={18} color='inherit' /> : <MdOutlineShoppingCart className={compact ? 'text-[17px]' : 'text-[20px]'} />}
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
    )
}

export default AddToCart
