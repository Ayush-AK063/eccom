import React from 'react'
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar } from "react-icons/fi";

const BlogItem = ({ item }) => {
  const link = `/blog/${item?._id}`;
  const date = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  // description mein HTML ho sakta hai (editor se) -> plain text
  const text = (item?.excerpt || item?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  return (
    <article className='blogItem group h-full flex flex-col bg-white border border-gray-100 rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_14px_30px_-12px_rgba(17,24,39,0.18)] hover:border-gray-200'>
      <Link to={link} className='block relative aspect-[16/10] overflow-hidden bg-gray-100'>
        {item?.images?.[0] && (
          <img
            src={item.images[0]}
            alt={item?.title || 'Blog'}
            loading='lazy'
            className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        )}
      </Link>

      <div className='flex flex-col flex-1 p-4'>
        {date && (
          <span className='flex items-center gap-1.5 text-[12px] font-[500] text-gray-500'>
            <FiCalendar className='text-[13px]' /> {date}
          </span>
        )}
        <h3 className='mt-2 text-[16px] font-[700] text-gray-900 leading-[22px] line-clamp-2'>
          <Link to={link} className='hover:text-primary transition-colors'>{item?.title}</Link>
        </h3>
        {text && (
          <div className='mt-2 text-[13px] text-gray-600 leading-[20px] line-clamp-2'>{text}</div>
        )}
        <Link
          to={link}
          className='mt-auto pt-4 inline-flex items-center gap-1.5 w-fit text-[13px] font-[600] text-primary'
        >
          Read more <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
        </Link>
      </div>
    </article>
  )
}

export default BlogItem
