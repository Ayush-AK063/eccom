import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
// import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';
import ProductItem from '../ProductItem';

const ProductSlider = (props) => {
    return (
        <div className='py-3 productSlider'>
            <Swiper
                slidesPerView={props.items}
                spaceBetween={10}
                modules={[Navigation]}
                navigation={true}
                className="mySwiper"
            >
                {props.data?.length > 0 ? (
                    props.data.map((item, index) => (
                        <SwiperSlide key={index}>
                            <ProductItem item={item} />
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <p className="p-4 text-gray-500">No products found.</p>
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    )
}

export default ProductSlider