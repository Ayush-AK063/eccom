import React, { useContext, useEffect, useMemo, useState } from 'react'
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const INITIAL = 5;

const Reviews = ({ productId, reviews, onReviewAdded }) => {
    const context = useContext(MyContext)
    const [reviewText, setReviewText] = useState('')
    const [rating, setRating] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [showAll, setShowAll] = useState(false)

    const mine = reviews.find((r) => r.userId === context?.userData?._id)

    // User ka review pehle se hai to form mein wahi (dobara submit = update)
    useEffect(() => {
        setReviewText(mine?.review || '')
        setRating(mine?.rating || 0)
    }, [mine?.review, mine?.rating])

    // Summary: average + har star ka count
    const summary = useMemo(() => {
        const counts = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => Math.round(r.rating) === star).length }))
        const avg = reviews.length ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length : 0
        return { counts, avg }
    }, [reviews])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!context?.isLogin) return context.openAlertBox('error', 'Please login to add a review')
        if (!rating) return context.openAlertBox('error', 'Please select a rating')
        if (reviewText.trim() === '') return context.openAlertBox('error', 'Please write a review')

        setIsLoading(true)
        const res = await postData('/api/review/add', { productId, review: reviewText, rating })
        setIsLoading(false)

        if (res?.error === false) {
            context.openAlertBox('success', res?.message || 'Review submitted')
            onReviewAdded()
        } else {
            context.openAlertBox('error', res?.message || 'Failed to submit review')
        }
    }

    const list = showAll ? reviews : reviews.slice(0, INITIAL)
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

    return (
        <div className='grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-10'>
            {/* Left: summary + form */}
            <div className='flex flex-col gap-6'>
                <div className='p-5 rounded-md border border-gray-100 bg-[#fafafa]'>
                    <div className='flex items-end gap-3'>
                        <span className='text-[44px] font-[800] text-gray-900 leading-none'>{summary.avg ? summary.avg.toFixed(1) : '—'}</span>
                        <div className='pb-1'>
                            <Rating value={summary.avg} readOnly precision={0.1} size='small' />
                            <div className='text-[12px] text-gray-500'>Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
                        </div>
                    </div>
                    <div className='mt-4 flex flex-col gap-2'>
                        {summary.counts.map(({ star, count }) => {
                            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                            return (
                                <div key={star} className='flex items-center gap-3 text-[12px]'>
                                    <span className='w-[34px] text-gray-600 font-[500]'>{star} ★</span>
                                    <span className='flex-1 h-[6px] rounded-full bg-gray-200 overflow-hidden'>
                                        <span className='block h-full rounded-full bg-[#f59e0b]' style={{ width: `${pct}%` }} />
                                    </span>
                                    <span className='w-[28px] text-right text-gray-500'>{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className='p-5 rounded-md border border-gray-100'>
                    <h3 className='text-[15px] font-[700] text-gray-900'>{mine ? 'Update your review' : 'Write a review'}</h3>
                    {!context?.isLogin ? (
                        <div className='mt-2 text-[13px] text-gray-600 leading-[20px]'>
                            Please <Link to='/login' className='text-primary font-[600] hover:underline'>login</Link> to share your thoughts on this product.
                        </div>
                    ) : (
                        <form className='mt-3 flex flex-col gap-3' onSubmit={handleSubmit}>
                            <div>
                                <div className='text-[12px] font-[600] text-gray-600 mb-1'>Your rating</div>
                                <Rating value={rating} onChange={(e, v) => setRating(v || 0)} />
                            </div>
                            <textarea
                                rows={4}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder='What did you like or dislike?'
                                className='w-full p-3 text-[14px] leading-[22px] border border-gray-200 rounded-md outline-none resize-none focus:border-gray-900'
                            />
                            <button type='submit' disabled={isLoading}
                                className='h-[42px] rounded-md bg-gray-900 text-white text-[14px] font-[600] hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center'>
                                {isLoading ? <CircularProgress size={18} color='inherit' /> : mine ? 'Update review' : 'Submit review'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Right: list */}
            <div>
                {reviews.length === 0 ? (
                    <div className='py-10 text-center rounded-md border border-dashed border-gray-200'>
                        <div className='text-[15px] font-[600] text-gray-900'>No reviews yet</div>
                        <div className='mt-1 text-[13px] text-gray-500'>Be the first to review this product.</div>
                    </div>
                ) : (
                    <>
                        <ul className='flex flex-col'>
                            {list.map((r) => (
                                <li key={r._id} className='py-5 border-b border-gray-100 first:pt-0'>
                                    <div className='flex items-center gap-3'>
                                        <span className='w-[40px] h-[40px] rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0'>
                                            {r.image
                                                ? <img src={r.image} alt={r.userName} className='w-full h-full object-cover' />
                                                : <span className='text-[15px] font-[700] text-gray-500 uppercase'>{r.userName?.charAt(0) || 'U'}</span>}
                                        </span>
                                        <div className='min-w-0'>
                                            <div className='text-[14px] font-[600] text-gray-900'>{r.userName || 'Customer'}</div>
                                            <div className='text-[12px] text-gray-400'>{fmtDate(r.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className='mt-3'><Rating value={r.rating} readOnly size='small' /></div>
                                    <div className='mt-1.5 text-[14px] leading-[22px] text-gray-700 whitespace-pre-line'>{r.review}</div>
                                    {r.reply && (
                                        <div className='mt-3 ml-4 pl-3 border-l-2 border-gray-200'>
                                            <div className='text-[12px] font-[700] text-gray-900'>Response from the store</div>
                                            <div className='mt-0.5 text-[13px] leading-[20px] text-gray-600 whitespace-pre-line'>{r.reply}</div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {reviews.length > INITIAL && (
                            <button type='button' onClick={() => setShowAll((v) => !v)}
                                className='mt-4 h-[40px] px-5 rounded-md border border-gray-200 text-[13px] font-[600] text-gray-800 hover:border-gray-900'>
                                {showAll ? 'Show fewer reviews' : `Show all ${reviews.length} reviews`}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Reviews
