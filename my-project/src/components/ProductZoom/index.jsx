import React, { useRef, useState } from 'react'
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';

const ProductZoom = ({ item }) => {

    const [slideIndex, setSlideIndex] = useState(0)
    const zoomSliderBig = useRef()
    const zoomSliderSmall = useRef()

    const goto = (index) => {
        setSlideIndex(index)
        zoomSliderSmall.current?.swiper?.slideTo(index)
        zoomSliderBig.current?.swiper?.slideTo(index)
    }

    const images = item?.images?.length > 0 ? item.images : ["https://dummyimage.com/500x500/cccccc/000000&text=No+Image"];

    return (
        <>
            <div className='flex gap-3'>

                <div className='slider w-[15%]'>
                    <Swiper
                        ref={zoomSliderSmall}
                        direction={'vertical'}
                        slidesPerView={4}
                        spaceBetween={10}
                        modules={[Navigation]}
                        navigation={true}
                        className="zoomProductSliderThumbs h-[500px] overflow-hidden"
                    >
                        {images.map((imgUrl, index) => (
                            <SwiperSlide key={index}>
                                <div className={`overflow-hidden cursor-pointer group item ${slideIndex === index ? "opacity-1" : "opacity-30"}`}
                                    onClick={() => goto(index)}>
                                    <img src={imgUrl}
                                        alt={`thumb-${index}`}
                                        className='w-full transition-all group-hover:scale-105' />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className='zoomContainer rounded-md w-[85%] h-[500px] overflow-hidden'>
                    <Swiper
                        ref={zoomSliderBig}
                        slidesPerView={1}
                        spaceBetween={0}
                        navigation={false}
                    >
                        {images.map((imgUrl, index) => (
                            <SwiperSlide key={index}>
                                <InnerImageZoom
                                    src={imgUrl}
                                    zoomType='hover'
                                    zoomScale={1} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                </div>
            </div>
        </>
    )
}

export default ProductZoom