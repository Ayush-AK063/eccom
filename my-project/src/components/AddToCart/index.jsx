import React, { useContext, useState } from 'react'
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { MyContext } from '../../App';
import { isSameCartItem, isVariantComplete } from '../../utils/formatPrice';

// Product (+ chuna gaya variant) cart mein nahi → "Add to Cart" button
// Cart mein hai → [-] qty [+]  (qty 0 = item remove)
// Variant chahiye par chuna nahi → onNeedVariant() (card par overlay khulta hai)
const AddToCart = ({ product, quantity = 1, variant = {}, onNeedVariant, className = '' }) => {

    const context = useContext(MyContext)
    const [isLoading, setIsLoading] = useState(false)

    const variantReady = isVariantComplete(product, variant)
    const cartItem = variantReady
        ? context?.cartData?.find((c) => isSameCartItem(c, product, variant))
        : null
    const outOfStock = !(product?.countInStock > 0)

    const run = async (fn) => {
        if (isLoading) return
        setIsLoading(true)
        try {
            await fn()
        } finally {
            setIsLoading(false)
        }
    }

    if (cartItem) {
        const qty = cartItem.quantity || 1
        const maxReached = product?.countInStock > 0 && qty >= product.countInStock
        return (
            <div className={`flex items-center justify-between overflow-hidden border border-[rgba(0,0,0,0.15)] rounded-md ${className}`}>
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
        run(() => context.addToCart(product, quantity, variant))
    }

    return (
        <Button className={`flex gap-2 btn-org ${className}`}
            disabled={isLoading || outOfStock}
            onClick={handleAdd}>
            {isLoading ? <CircularProgress size={18} color='inherit' /> : <MdOutlineShoppingCart className='text-[20px]' />}
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
    )
}

export default AddToCart
