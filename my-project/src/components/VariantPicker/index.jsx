import React, { useState } from 'react'
import Button from '@mui/material/Button';
import { IoClose } from "react-icons/io5";
import AddToCart from '../AddToCart';
import { VARIANT_FIELDS, getVariantOptions } from '../../utils/formatPrice';

// Product card ke upar absolute overlay: size / RAM / weight chuno, phir Add to Cart
const VariantPicker = ({ product, onClose }) => {

    const options = getVariantOptions(product)
    const [variant, setVariant] = useState({})

    return (
        <div className='absolute top-0 left-0 z-[60] flex flex-col items-center justify-center w-full h-full gap-3 p-3 bg-[rgba(0,0,0,0.75)]'>
            <Button className='!absolute top-[8px] right-[8px] !w-[30px] !h-[30px] !min-w-[30px] !rounded-full !bg-white !text-black'
                onClick={onClose}>
                <IoClose className='text-[18px]' />
            </Button>

            {VARIANT_FIELDS.filter(({ key }) => options[key].length > 0).map(({ key, label }) => (
                <div key={key} className='w-full text-center'>
                    <p className='mb-1 text-[13px] font-[500] text-white'>{label}</p>
                    <div className='flex flex-wrap items-center justify-center gap-1'>
                        {options[key].map((value) => (
                            <Button key={value}
                                className={`!min-w-[35px] !h-[30px] !px-2 !text-[12px] !rounded-sm ${variant[key] === value ? '!bg-primary !text-white' : '!bg-white !text-black'}`}
                                onClick={() => setVariant((prev) => ({ ...prev, [key]: value }))}>
                                {value}
                            </Button>
                        ))}
                    </div>
                </div>
            ))}

            <AddToCart product={product} variant={variant} className='w-full mt-2 bg-white' />
        </div>
    )
}

export default VariantPicker
