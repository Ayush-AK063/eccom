import React, { useEffect, useState } from 'react'
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './style.css';

const FALLBACK = "https://dummyimage.com/600x600/f3f4f6/9ca3af&text=No+Image";

// Product gallery: left thumbnails + main image (hover zoom). Page aur Quick View dono mein.
const ProductZoom = ({ item }) => {
    const images = item?.images?.length > 0 ? item.images : [FALLBACK];
    const [index, setIndex] = useState(0);

    // Dusra product khula to pehli image
    useEffect(() => { setIndex(0); }, [item?._id]);

    const go = (dir) => setIndex((i) => (i + dir + images.length) % images.length);

    return (
        <div className='pGallery'>
            {images.length > 1 && (
                <div className='pGallery__thumbs' role='tablist' aria-label='Product images'>
                    {images.map((src, i) => (
                        <button
                            key={src + i}
                            type='button'
                            role='tab'
                            aria-selected={i === index}
                            onClick={() => setIndex(i)}
                            onMouseEnter={() => setIndex(i)}
                            className={`pGallery__thumb ${i === index ? 'is-active' : ''}`}
                        >
                            <img src={src} alt={`${item?.name || 'Product'} ${i + 1}`} loading='lazy' />
                        </button>
                    ))}
                </div>
            )}

            <div className='pGallery__main'>
                <InnerImageZoom
                    key={images[index]}
                    src={images[index]}
                    zoomSrc={images[index]}
                    zoomType='hover'
                    zoomScale={1.6}
                    hideHint
                    className='pGallery__zoom'
                />

                {images.length > 1 && (
                    <>
                        <button type='button' aria-label='Previous image' className='pGallery__nav left-3' onClick={() => go(-1)}>
                            <FiChevronLeft />
                        </button>
                        <button type='button' aria-label='Next image' className='pGallery__nav right-3' onClick={() => go(1)}>
                            <FiChevronRight />
                        </button>
                        <span className='pGallery__count'>{index + 1} / {images.length}</span>
                    </>
                )}

                {item?.discount > 0 && (
                    <span className='absolute top-4 left-4 z-10 bg-primary text-white rounded-full px-3 py-1 text-[12px] font-[600]'>
                        -{item.discount}%
                    </span>
                )}
            </div>
        </div>
    )
}

export default ProductZoom
