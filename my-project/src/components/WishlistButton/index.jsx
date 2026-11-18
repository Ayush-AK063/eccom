import React, { useContext, useState } from 'react'
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { MyContext } from '../../App';

// Product card / list view ka gol dil button (My List add ↔ remove)
const WishlistButton = ({ product }) => {
    const context = useContext(MyContext)
    const [isLoading, setIsLoading] = useState(false)
    const isAdded = !!context?.getMyListItem?.(product?._id)

    const handleClick = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            await context.toggleMyList(product)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Tooltip title={isAdded ? "Remove from wishlist" : "Add to wishlist"} placement="left-start">
            <Button onClick={handleClick} disabled={isLoading}
                className={`!w-[35px] !h-[35px] !min-w-[35px] !rounded-full group/heart hover:!bg-primary ${isAdded ? '!bg-primary' : '!bg-white'}`}>
                {isLoading
                    ? <CircularProgress size={16} className={isAdded ? '!text-white' : '!text-black'} />
                    : isAdded
                        ? <FaHeart className='text-[18px] !text-white' />
                        : <FaRegHeart className='text-[18px] !text-black group-hover/heart:!text-white' />}
            </Button>
        </Tooltip>
    )
}

export default WishlistButton
