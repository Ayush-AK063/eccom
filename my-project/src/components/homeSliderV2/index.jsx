import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'

const HomeSliderV2 = ({ slides = [], buttonText = "SHOP NOW" }) => {
  if (!slides.length) return null

  return (
    <>
      <Swiper
        spaceBetween={30}
        effect={'fade'}
        loop={slides.length > 1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        className="homeSliderV2 h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className='relative w-full h-full overflow-hidden rounded-md item'>
              <img
                src={slide.images?.[0]}
                alt={slide.bannerHeading || 'Banner'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className='absolute inset-0 z-10 pointer-events-none bg-gradient-to-l from-black/60 via-black/25 to-transparent' />
              <div className='absolute top-0 -right-[100%] opacity-0 duration-700 transition-all info w-[50%] h-full flex flex-col justify-center items-center p-8 z-50 text-white'>
                {slide.bannerHeading && (
                  <h4 className='text-[18px] font-[500] mb-4 w-full text-left text-white/90 relative -right-[100%] opacity-0'>
                    {slide.bannerHeading}
                  </h4>
                )}
                {slide.title && (
                  <h2 className='text-[35px] font-[600] w-full relative -right-[100%] opacity-0'>
                    {slide.title}
                  </h2>
                )}
                {slide.startAtOnlyPrice && (
                  <h3 className='flex items-center text-[18px] font-[500] mb-4 mt-3 w-full text-left gap-3 relative -right-[100%] opacity-0'>
                    Starting At Only{' '}
                    <span className='text-primary text-[35px] font-[700]'>
                      {slide.startAtOnlyPrice}
                    </span>
                  </h3>
                )}
                <div className='w-full relative -bottom-[100%] opacity-0 btn_'>
                  <Link to={slide.redirectUrl || '/'}>
                    <Button className='btn-org'>{buttonText}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  )
}

export default HomeSliderV2