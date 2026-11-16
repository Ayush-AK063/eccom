import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/navigation'

import { Navigation } from 'swiper/modules'
import BannerBox from '../BannerBox'

// v2 Banners — shown below Free Shipping section (3 per row)
export const AdsBannerSlider = ({ banners = [], items = 3 }) => {
    if (!banners.length) return null

    return (
        <div className='w-full py-5 pb-0'>
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

// v3 Banners — shown in the wide watch-style banner area
export const AdsBannerSlider2 = ({ banners = [], items = 1 }) => {
    if (!banners.length) return null

    return (
        <div className='w-full py-5 pb-0'>
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