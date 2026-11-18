import React from 'react'
import { Link } from 'react-router-dom'

const BannerBox = (props) => {
  return (
    <div className='overflow-hidden rounded-md box bannerBox group'>
        <Link to={props.link || '/'} className='block w-full h-full'>
            <img src={props.img}
            alt="Offer banner"
            loading="lazy"
            className='w-full transition-all duration-500 group-hover:scale-105' />
        </Link>
    </div>
  )
}

export default BannerBox