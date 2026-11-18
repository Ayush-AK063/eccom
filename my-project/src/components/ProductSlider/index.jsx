import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { FreeMode } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductItem from '../ProductItem';

// items = badi screen pe kitne cards; chhoti screens pe apne aap kam
const ProductSlider = ({ items = 6, data = [] }) => {
    const swiperRef = useRef(null);
    const [edge, setEdge] = useState({ start: true, end: false });
    const updateEdge = (s) => setEdge({ start: s.isBeginning, end: s.isEnd });

    if (!data?.length) {
        return (
            <div className='py-10 text-center text-[14px] text-gray-500'>No products found.</div>
        );
    }

    return (
        <div className='relative py-3 productSlider group/slider'>
            <Swiper
                modules={[FreeMode]}
                freeMode={{ enabled: true, momentumRatio: 0.6 }}
                spaceBetween={12}
                slidesPerView={1.6}
                breakpoints={{
                    480: { slidesPerView: 2.3, spaceBetween: 14 },
                    768: { slidesPerView: Math.min(3.3, items), spaceBetween: 16 },
                    1024: { slidesPerView: Math.min(4, items), spaceBetween: 18 },
                    1280: { slidesPerView: items, spaceBetween: 18 },
                }}
                onSwiper={(s) => { swiperRef.current = s; updateEdge(s); }}
                onSlideChange={updateEdge}
                onProgress={updateEdge}
                className='!pb-2'
            >
                {data.map((item, index) => (
                    <SwiperSlide key={item?._id || index} className='!h-auto'>
                        <ProductItem item={item} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Side arrows: hover pe dikhte hain, end pe chhup jaate hain */}
            {!edge.start && (
                <button aria-label='Previous' onClick={() => swiperRef.current?.slidePrev()}
                    className='psNav left-0 -translate-x-1/2'>
                    <FiChevronLeft />
                </button>
            )}
            {!edge.end && (
                <button aria-label='Next' onClick={() => swiperRef.current?.slideNext()}
                    className='psNav right-0 translate-x-1/2'>
                    <FiChevronRight />
                </button>
            )}
        </div>
    )
}

export default ProductSlider
