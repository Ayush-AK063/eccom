import React, { useContext, useState } from 'react'
import './style.css'
import { Link } from 'react-router-dom'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { MdZoomOutMap } from "react-icons/md";
import WishlistButton from '../WishlistButton';
import CompareButton from '../CompareButton';
import { MyContext } from '../../App';
import AddToCart from '../AddToCart';
import VariantPicker from '../VariantPicker';
import { formatPrice } from '../../utils/formatPrice';

const ProductItem = ({ item }) => {
    const context = useContext(MyContext);
    const [showVariants, setShowVariants] = useState(false);
    const link = `/product/${item?._id}`;

    return (
        <div className='productItem group/card h-full flex flex-col bg-white rounded-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_14px_30px_-12px_rgba(17,24,39,0.18)] hover:border-gray-200'>
            {/* Image */}
            <div className='group imgWrapper relative bg-[#f7f7f8]'>
                {showVariants && <VariantPicker product={item} onClose={() => setShowVariants(false)} />}
                <Link to={link} className='block'>
                    <div className='img relative aspect-[5/4] overflow-hidden'>
                        <img src={item?.images?.[0] || ""}
                            alt={item?.name || "Product"}
                            loading='lazy'
                            className='absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0' />
                        <img src={item?.images?.[1] || item?.images?.[0] || ""}
                            alt=""
                            loading='lazy'
                            className='absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply opacity-0 scale-100 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105' />
                    </div>
                </Link>

                {item?.discount > 0 && (
                    <span className='absolute top-3 left-3 z-20 bg-primary text-white rounded-full px-2.5 py-[3px] text-[11px] font-[600] tracking-wide'>
                        -{item.discount}%
                    </span>
                )}

                <div className='absolute actions top-3 right-3 z-20 flex flex-col gap-2'>
                    {/* Heart hamesha dikhe */}
                    <div className='cardWish'>
                        <WishlistButton product={item} />
                    </div>
                    {/* Compare + Quick view sirf hover pe */}
                    <div className='flex flex-col gap-2 translate-x-3 opacity-0 pointer-events-none transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto'>
                        <CompareButton product={item} />
                        <Tooltip title="Quick view" placement="left">
                            <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white !shadow-md hover:!bg-primary'
                                onClick={() => {
                                    context.setProductData(item);
                                    context.setOpenProductDetailsModal(true);
                                }}>
                                <MdZoomOutMap className='text-[17px] !text-gray-800' />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className='info flex flex-col flex-1 px-3.5 pt-3 pb-3.5'>
                <span className='text-[11px] font-[600] uppercase tracking-[0.08em] text-gray-400 truncate'>
                    {item?.brand || 'Generic'}
                </span>
                <h3 className='title mt-0.5 text-[14px] font-[500] text-gray-900 leading-[20px] truncate'>
                    <Link to={link} className='hover:text-primary transition-colors'>{item?.name || 'Product Name'}</Link>
                </h3>

                <div className='flex items-center gap-1.5 mt-1'>
                    <Rating value={item?.rating || 0} size="small" readOnly precision={0.5} sx={{ fontSize: '15px' }} />
                    {item?.rating > 0 && <span className='text-[12px] text-gray-500'>{Number(item.rating).toFixed(1)}</span>}
                </div>

                <div className='flex items-baseline gap-2 mt-1 flex-wrap'>
                    <span className='text-[16px] font-[700] text-gray-900'>{(item?.variants || []).length > 1 && new Set(item.variants.map((v) => v.price)).size > 1 && <span className='text-[12px] font-[500] text-gray-500 mr-1'>From</span>}{formatPrice(item?.price)}</span>
                    {item?.oldprice > item?.price && (
                        <span className='text-[13px] text-gray-400 line-through'>{formatPrice(item?.oldprice)}</span>
                    )}
                </div>

                <div className='mt-auto pt-2.5'>
                    <AddToCart product={item} compact alwaysAdd onNeedVariant={() => setShowVariants((v) => !v)} className='w-full' />
                </div>
            </div>
        </div>
    )
}

export default ProductItem
