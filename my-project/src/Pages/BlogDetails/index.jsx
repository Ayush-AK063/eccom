import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdTime } from "react-icons/io";
import { getData } from '../../utils/api';

const BlogDetails = () => {

    const { id } = useParams()
    const [blog, setBlog] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        window.scrollTo(0, 0)
        setIsLoading(true)
        getData(`/api/blog/${id}`).then((res) => {
            setBlog(res?.error === false ? res.data : null)
            setIsLoading(false)
        })
    }, [id])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full min-h-[500px]'>
                <CircularProgress color='inherit' />
            </div>
        )
    }

    if (!blog) {
        return (
            <div className='container flex flex-col items-center justify-center min-h-[400px] gap-3'>
                <h2 className='text-[20px] font-[600]'>Blog not found</h2>
                <Link to='/' className='link text-primary'>Go to Home</Link>
            </div>
        )
    }

    const date = new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <section className='py-5 pb-10'>
            <div className='container'>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link to="/" className='transition-all link !text-[14px]'>Home</Link>
                    <span className='!text-[14px] text-[rgba(0,0,0,0.8)]'>{blog.title}</span>
                </Breadcrumbs>
            </div>

            <div className='container w-[70%] max-w-[900px] mt-5 p-6 bg-white rounded-md shadow-md'>
                <h1 className='text-[26px] font-[600] mb-2'>{blog.title}</h1>
                <p className='flex items-center gap-1 text-[13px] text-[rgba(0,0,0,0.6)] mb-5'>
                    <IoMdTime className='text-[16px]' /> {date}
                </p>

                {blog.images?.[0] && (
                    <div className='w-full mb-5 overflow-hidden rounded-md'>
                        <img src={blog.images[0]} alt={blog.title} className='object-cover w-full' />
                    </div>
                )}

                <p className='text-[15px] leading-7 whitespace-pre-line text-[rgba(0,0,0,0.85)]'>
                    {blog.description}
                </p>

                {blog.images?.length > 1 && (
                    <div className='grid grid-cols-3 gap-3 mt-6'>
                        {blog.images.slice(1).map((img) => (
                            <img key={img} src={img} alt={blog.title} className='object-cover w-full h-[180px] rounded-md' />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default BlogDetails
