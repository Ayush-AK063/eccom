import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/navigation'

import { Navigation } from 'swiper/modules'
import BannerBox from '../BannerBox'

// v2 Banners — wide 4:1 banner after Latest Products
export const AdsBannerSlider2 = ({ banners = [], items = 1 }) => {
    if (!banners.length) return null

    return (
        <div className='w-full pt-8 adsBannerWide'>
            <Swiper
                slidesPerView={items}
                spaceBetween={10}
                modules={[Navigation]}
                navigation={true}
                className="mySwiper"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner._id}>
                        <BannerBox
                            img={banner.images?.[0]}
                            link={banner.redirectUrl || '/'}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}