import React from 'react'
import './style.css'
import { Link } from 'react-router-dom'

const BannerBoxV2 = ({ banner, info }) => {
  if (!banner) return null

  return (
    <div className='relative w-full overflow-hidden rounded-md bannerBoxV2 group'>
      <img
        src={banner.images?.[0]}
        alt={banner.bannerHeading || 'Banner'}
        className='w-full transition-all duration-150 group-hover:scale-105'
      />
      <div
        className={`flex flex-col gap-2 items-center justify-center info absolute p-5 top-0 ${info === 'left' ? 'left-0' : 'right-0'
          } w-[70%] h-[100%] z-50 ${info === 'left' ? '' : 'pl-12'}`}
      >
        {banner.bannerHeading && (
          <h2 className='text-[18px] font-[600]'>{banner.bannerHeading}</h2>
        )}
        {banner.startAtOnlyPrice && (
          <span className='text-[20px] w-full font-[600] text-primary'>
            {banner.startAtOnlyPrice}
          </span>
        )}
        <div className='w-full'>
          <Link
            to={banner.redirectUrl || '/'}
            className='text-[16px] font-[600] link underline'
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BannerBoxV2