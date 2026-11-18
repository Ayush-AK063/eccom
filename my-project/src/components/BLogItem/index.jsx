import React from 'react'
import { IoMdTime } from "react-icons/io";
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";

const BlogItem = ({ item }) => {
  const date = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    : '';

  const description = item?.description?.length > 100
    ? item.description.substr(0, 100) + '...'
    : item?.description;

  return (
    <div className='blogItem group'>
        <div className='relative w-full overflow-hidden rounded-md imgWrapper'>
            <img src={item?.images?.[0]}
             alt={item?.title || 'blog'}
             className='w-full transition-all cursor-pointer group-hover:scale-105 group-hover:rotate-1' />

            {date && (
              <span className='absolute font-[500] gap-1 rounde-md p-1 text-[11px] bottom-[15px] right-[15px] z-50 flex items-center justify-center text-white bg-primary '>
                  <IoMdTime className='text-[16px]'/> {date}
              </span>
            )}
        </div>

        <div className='py-4 info'>
            <h2 className='text-[16px] font-[600] text-black'>
                <Link to={`/blog/${item?._id}`} className='link'>
                    {item?.title}
                </Link>
            </h2>
            <p className='text-[13px] font-[400] text-[rgba(0,0,0,0.8)] mb-4'>
                {description}
            </p>
            <Link to={`/blog/${item?._id}`}
             className='flex items-center gap-1 font-[500] text-[14px] link hover:underline' >
                Read More <IoIosArrowForward/>
            </Link>
        </div>
    </div>
  )
}

export default BlogItem
