import React, { useContext, useState } from 'react'
import './style.css'
import { Link } from 'react-router-dom'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { MdZoomOutMap } from "react-icons/md";
import { FiCheck, FiX } from "react-icons/fi";
import WishlistButton from '../WishlistButton';
import CompareButton from '../CompareButton';
import { MyContext } from '../../App';
import AddToCart from '../AddToCart';
import VariantPicker from '../VariantPicker';
import { formatPrice, optionFields } from '../../utils/formatPrice';

const ProductItemListView = ({ item }) => {
    const context = useContext(MyContext);
    const [showVariants, setShowVariants] = useState(false);
    const link = `/product/${item?._id}`;

    const inStock = item?.countInStock > 0;
    const save = item?.oldprice > item?.price ? item.oldprice - item.price : 0;
    const text = (item?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const variants = optionFields(item);

    return (
        <article className='productItem listItem group/card'>
            {/* Image */}
            <div className='group imgWrapper listItem__media'>
                {showVariants && <VariantPicker product={item} onClose={() => setShowVariants(false)} />}
                <Link to={link} className='block absolute inset-0'>
                    <img src={item?.images?.[0] || ''} alt={item?.name || 'Product'} loading='lazy'
                        className='absolute inset-0 w-full h-full object-contain p-5 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0' />
                    <img src={item?.images?.[1] || item?.images?.[0] || ''} alt='' loading='lazy'
                        className='absolute inset-0 w-full h-full object-contain p-5 mix-blend-multiply opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105' />
                </Link>

                {item?.discount > 0 && (
                    <span className='absolute top-3 left-3 z-20 bg-primary text-white rounded-full px-2.5 py-[3px] text-[11px] font-[600] tracking-wide'>
                        -{item.discount}%
                    </span>
                )}

                <div className='absolute actions top-3 right-3 z-20 flex flex-col gap-2'>
                    <div className='cardWish'><WishlistButton product={item} /></div>
                    <div className='flex flex-col gap-2 translate-x-3 opacity-0 pointer-events-none transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto'>
                        <Tooltip title="Quick view" placement="left">
                            <Button className='!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-white !shadow-md hover:!bg-primary'
                                onClick={() => { context.setProductData(item); context.setOpenProductDetailsModal(true); }}>
                                <MdZoomOutMap className='text-[17px] !text-gray-800' />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className='listItem__info'>
                <span className='text-[11px] font-[600] uppercase tracking-[0.08em] text-gray-400'>{item?.brand || 'Generic'}</span>
                <h3 className='mt-1 text-[17px] font-[600] text-gray-900 leading-[24px] line-clamp-2'>
                    <Link to={link} className='hover:text-primary transition-colors'>{item?.name}</Link>
                </h3>
                <div className='flex items-center gap-1.5 mt-1.5'>
                    <Rating value={item?.rating || 0} size='small' readOnly precision={0.5} sx={{ fontSize: '15px' }} />
                    {item?.rating > 0 && <span className='text-[12px] text-gray-500'>{Number(item.rating).toFixed(1)}</span>}
                </div>
                {text && <div className='mt-2.5 text-[13px] text-gray-500 leading-[20px] line-clamp-2'>{text}</div>}

                {variants.length > 0 && (
                    <div className='mt-3 flex flex-col gap-1.5'>
                        {variants.map(({ key, label, values, display, hex }) => (
                            <div key={key} className='flex items-center flex-wrap gap-1.5'>
                                <span className='text-[12px] font-[500] text-gray-500 mr-1'>{label}:</span>
                                {values.slice(0, 6).map((v) => display === 'swatch'
                                    ? <span key={v} title={v} className='inline-block w-4 h-4 rounded-full border border-black/15' style={{ background: hex?.[v] || '#e5e7eb' }} />
                                    : <span key={v} className='listItem__chip'>{v}</span>)}
                                {values.length > 6 && <span className='text-[12px] text-gray-400'>+{values.length - 6}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Price + actions */}
            <div className='listItem__buy'>
                <div>
                    <div className='flex items-baseline gap-2 flex-wrap'>
                        <span className='text-[22px] font-[700] text-gray-900 leading-none'>{(item?.variants || []).length > 1 && new Set(item.variants.map((v) => v.price)).size > 1 && <span className='text-[12px] font-[500] text-gray-500 mr-1'>From</span>}{formatPrice(item?.price)}</span>
                        {save > 0 && <span className='text-[13px] text-gray-400 line-through'>{formatPrice(item?.oldprice)}</span>}
                    </div>
                    {save > 0 && (
                        <div className='mt-1.5 text-[12px] font-[600] text-[#15803d]'>You save {formatPrice(save)}</div>
                    )}
                    <div className={`mt-2 flex items-center gap-1 text-[12px] font-[500] ${inStock ? 'text-[#15803d]' : 'text-gray-400'}`}>
                        {inStock ? <><FiCheck /> In stock</> : <><FiX /> Out of stock</>}
                    </div>
                </div>

                <div className='flex flex-col gap-2.5 w-full'>
                    <AddToCart product={item} compact alwaysAdd onNeedVariant={() => setShowVariants((v) => !v)} className='w-full' />
                    <div className='listItem__compare'><CompareButton product={item} variant='text' /></div>
                </div>
            </div>
        </article>
    )
}

export default ProductItemListView
