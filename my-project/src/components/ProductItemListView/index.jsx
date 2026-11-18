import React from 'react'
import './style.css'
import { Link } from 'react-router-dom'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import WishlistButton from '../WishlistButton';
import { MdZoomOutMap } from "react-icons/md";
import Tooltip from '@mui/material/Tooltip';
import { useContext } from 'react';
import { MyContext } from '../../App';
import AddToCart from '../AddToCart';
import VariantPicker from '../VariantPicker';
import { useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';



const ProductItemListView = ({ item }) => {
    
    const context = useContext(MyContext);
    const [showVariants, setShowVariants] = useState(false);
    
  return (
    <div className='overflow-hidden shadow-lg border-[rgba(0,0,0,0.1)] flex items-center rounded-md productItem border'>
        <div className='group m-4 imgWrapper w-[25%] rounded-md relative'>
                {showVariants && <VariantPicker product={item} onClose={() => setShowVariants(false)} />}
            <Link to={`/product/${item?._id}`}>
                <div className='h-auto overflow-hidden rounded-md img'>
                    <img src={item?.images?.[0] || ''}
                    alt={item?.name || 'Product'}
                    className='w-full'/>

                    <img src={item?.images?.[1] || item?.images?.[0] || ''}
                    alt={item?.name || 'Product'}
                    className='absolute top-0 left-0 object-cover w-full h-full transition-all duration-700 rounded-md opacity-0 group-hover:opacity-100 group-hover:scale-105'/>
                </div>
             </Link>
             {item?.discount > 0 && (
                <span className='absolute flex items-center discount top-[10px] left-[10px] z-50 bg-primary text-white rounded-lg px-2 py-1 font-[500] text-[12px]'
                >
                    {item?.discount}%
                </span>
             )}

             <div className='absolute actions top-[-200px] right-[5px] z-50 flex items-center gap-2 flex-col w-[50px] transition-all duration-300 group-hover:top-[15px] opacity-0 group-hover:opacity-100'>
                <Tooltip title="View product details" placement="left-start">
                    <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white text-black hover:!bg-primary hover:text-white'
                    onClick={()=>{ context.setProductData(item); context.setOpenProductDetailsModal(true) }}>
                        <MdZoomOutMap className='text-[18px] !text-black group-hover:text-white hover:!text-white'/>
                    </Button>
                </Tooltip>
                <WishlistButton product={item} />
             </div>
        </div>

        <div className='p-3 py-5 px-8 info w-[75%]'>
            <h6 className='text-[15px] !font-[400]'>
                <Link to={`/product/${item?._id}`} className='transition-all link'>{item?.brand || 'Generic'}</Link>
            </h6>
            <h3 className='text-[18px] title mt-3 mb-3 font-[500] text-[#000]'>
                <Link to={`/product/${item?._id}`} className='transition-all link'>{item?.name}</Link>
            </h3>
            <p className='text-[14px] mb-3'>
                {item?.description?.length > 200 ? item.description.substr(0, 200) + '...' : item?.description}
            </p>
            <Rating name="size-small" value={item?.rating || 0} size="small" readOnly precision={0.5}/>
            <div className='flex items-center gap-4'>
                {item?.oldprice > 0 && <span className='text-gray-500 font-[500] line-through oldPrice text-[15px]'>{formatPrice(item?.oldprice)}</span>}
                <span className='font-[600] newPrice text-primary text-[15px]'>{formatPrice(item?.price)}</span>
            </div>

            <div className='mt-3'>
                <AddToCart product={item} onNeedVariant={() => setShowVariants((v) => !v)} className='w-[150px]' />
            </div>
        </div>
    </div>
  )
}

export default ProductItemListView