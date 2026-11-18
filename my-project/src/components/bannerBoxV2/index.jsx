import React from 'react'
import './style.css'
import { Link } from 'react-router-dom'

const BannerBoxV2 = ({ banner, info, buttonText = "SHOP NOW" }) => {
  if (!banner) return null

  return (
    <div className='relative w-full flex-1 min-h-0 overflow-hidden rounded-md bannerBoxV2 group'>
      <img
        src={banner.images?.[0]}
        alt={banner.bannerHeading || 'Banner'}
        className='absolute inset-0 w-full h-full object-cover transition-all duration-150 group-hover:scale-105'
      />
      {/* text padhne layak rahe, image kaisi bhi ho */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none ${info === 'left' ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-black/65 via-black/25 to-transparent`}
      />
      <div
        className={`flex flex-col gap-1 justify-center info absolute p-5 top-0 ${info === 'left' ? 'left-0 items-start' : 'right-0 items-end text-right'
          } w-[65%] h-[100%] z-20`}
      >
        {banner.bannerHeading && (
          <h2 className='text-[17px] font-[600] text-white leading-snug'>{banner.bannerHeading}</h2>
        )}
        {banner.startAtOnlyPrice && (
          <span className='text-[13px] text-white/80'>
            From <span className='text-[22px] font-[700] text-primary'>₹{banner.startAtOnlyPrice}</span>
          </span>
        )}
        <div className='mt-1'>
          <Link
            to={banner.redirectUrl || '/'}
            className='text-[13px] font-[600] tracking-wide text-white underline underline-offset-4 hover:text-primary transition-colors'
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BannerBoxV2