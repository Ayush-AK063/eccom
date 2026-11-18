import React, { useContext, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';

import 'swiper/css';
import './style.css';

import { FreeMode } from 'swiper/modules';
import { MyContext } from '../../App';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiGrid } from 'react-icons/fi';

// Har card ko halka alag tint — premium storefront look
const TINTS = ['#FFF1F0', '#EEF6FF', '#F1FAF3', '#FFF8EB', '#F5F0FF', '#EFFAFA', '#FFF0F6', '#F4F6F8'];

const HomeCatSlider = ({ title = "Shop by Category", subtitle }) => {
  const context = useContext(MyContext);
  const categories = context?.catData || [];
  const swiperRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  if (!categories.length) return null;

  const updateEdge = (s) => setEdge({ start: s.isBeginning, end: s.isEnd });

  return (
    <section className='pt-7 pb-6 catSection'>
      <div className='container'>
        {/* Header */}
        <div className='flex items-end justify-between mb-4'>
          <div>
            {title && <h2 className='text-[20px] font-[700] leading-tight text-gray-900'>{title}</h2>}
            {subtitle && <p className='text-[13px] text-gray-500 mt-1'>{subtitle}</p>}
          </div>
          <div className='hidden sm:flex items-center gap-2'>
            <button
              aria-label='Previous'
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={edge.start}
              className='catNav'
            >
              <FiChevronLeft />
            </button>
            <button
              aria-label='Next'
              onClick={() => swiperRef.current?.slideNext()}
              disabled={edge.end}
              className='catNav'
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        <Swiper
          modules={[FreeMode]}
          freeMode={{ enabled: true, momentumRatio: 0.6 }}
          spaceBetween={12}
          slidesPerView={2.6}
          breakpoints={{
            480: { slidesPerView: 3.4, spaceBetween: 16 },
            768: { slidesPerView: 5, spaceBetween: 16 },
            1024: { slidesPerView: 6, spaceBetween: 16 },
            1280: { slidesPerView: 8, spaceBetween: 16 },
          }}
          onSwiper={(s) => { swiperRef.current = s; updateEdge(s); }}
          onSlideChange={updateEdge}
          onReachBeginning={updateEdge}
          onReachEnd={updateEdge}
          onProgress={updateEdge}
          className='catSwiper'
        >
          {categories.map((cat, index) => (
            <SwiperSlide key={cat._id || index}>
              <Link to={`/productListing?catId=${cat._id}`} className='catCard group' title={cat.name}>
                <div className='catMedia' style={{ background: TINTS[index % TINTS.length] }}>
                  {cat.images?.[0] ? (
                    <img src={cat.images[0]} alt={cat.name} loading='lazy' />
                  ) : (
                    <span className='text-[32px] font-[700] text-gray-400'>{cat.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <h3 className='catName'>{cat.name}</h3>
              </Link>
            </SwiperSlide>
          ))}

          {/* View All — aakhri card */}
          <SwiperSlide>
            <Link to='/productListing' className='catCard group' title='View all categories'>
              <div className='catMedia catMediaAll'>
                <FiGrid className='text-[30px]' />
              </div>
              <h3 className='catName flex items-center justify-center gap-1 !text-primary'>
                View All
                <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
              </h3>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  )
}

export default HomeCatSlider
