import React, { useContext } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Navigation } from 'swiper/modules';
import { MyContext } from '../../App';

const HomeCatSlider = () => {
  const context = useContext(MyContext);
  const categories = context?.catData || [];

  return (
    <div className='py-8 pt-4 homeCatSlider'>
      <div className='container'>
        <Swiper
          slidesPerView={6}
          spaceBetween={10}
          modules={[Navigation]}
          navigation={true}
          className="mySwiper"
        >
          {categories.length > 0 && categories.map((cat, index) => (
            <SwiperSlide key={cat._id || index}>
              <Link to={`/productListing?catId=${cat._id}`}>
                <div className='flex flex-col items-center justify-center p-3 m-2 text-center bg-white rounded-md aspect-square item group'>
                  <img src={cat.images?.[0] || ''}
                    alt={cat.name}
                    className='w-[60px] h-[60px] object-contain transition-all group-hover:scale-105' />
                  <h3 className='text-[15px] font-[500] mt-3 whitespace-nowrap overflow-hidden text-ellipsis w-full px-1'>{cat.name}</h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default HomeCatSlider