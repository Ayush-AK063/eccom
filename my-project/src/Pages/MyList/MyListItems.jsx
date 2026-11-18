import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoClose } from "react-icons/io5";
import { Rating } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { MyContext } from '../../App';
import { formatPrice } from '../../utils/formatPrice';

const MyListItems = ({ item }) => {
    const context = useContext(MyContext)
    const [isRemoving, setIsRemoving] = useState(false)
    const link = `/product/${item?.productId}`
    const title = item?.productTitle || ''

    const handleRemove = async () => {
        if (isRemoving) return
        setIsRemoving(true)
        try {
            await context.removeFromMyList(item._id)
        } finally {
            setIsRemoving(false)
        }
    }

    return (
        <div className='flex items-center w-full gap-4 p-3 pb-5 border-b border-[rgba(0,0,0,0.1)] cartItem'>
            <div className='img w-[15%] h-[150px] rounded-md overflow-hidden group'>
                <Link to={link}>
                    <img src={item?.image} alt={title}
                        className='object-cover w-full h-full transition-all group-hover:scale-105' />
                </Link>
            </div>

            <div className='info w-[85%] relative'>
                {isRemoving
                    ? <CircularProgress size={18} className='!absolute top-[0px] right-[0px]' />
                    : <IoClose className='absolute cursor-pointer top-[0px] right-[0px] text-[22px] link' onClick={handleRemove} />}
                <span className='text-[13px]'>{item?.brand}</span>
                <h3 className='text-[15px] w-[85%]'>
                    <Link to={link} className='link'>
                        {title.length > 80 ? title.substr(0, 80) + '...' : title}
                    </Link>
                </h3>

                <Rating name="size-small" value={Number(item?.rating) || 0} size="small" readOnly />

                <div className='flex items-center gap-4 mt-2 mb-2'>
                    <span className='font-[600] newPrice text-[14px]'>{formatPrice(item?.price)}</span>
                    {item?.oldPrice > 0 && (
                        <span className='text-gray-500 font-[500] line-through oldPrice text-[14px]'>{formatPrice(item?.oldPrice)}</span>
                    )}
                    {item?.discount > 0 && (
                        <span className='font-[600] newPrice text-primary text-[14px]'>{item.discount}% off</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyListItems
