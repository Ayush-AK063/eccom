import React, { useContext, useEffect, useState } from 'react'
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import { postData } from '../../utils/api';
import { MyContext } from '../../App';

const Reviews = ({ productId, reviews, onReviewAdded }) => {

    const context = useContext(MyContext)
    const [reviewText, setReviewText] = useState('')
    const [rating, setRating] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // Agar is user ka review pehle se hai to form mein wahi dikhao (dobara submit = update)
    useEffect(() => {
        const mine = reviews.find((r) => r.userId === context?.userData?._id)
        setReviewText(mine?.review || '')
        setRating(mine?.rating || 0)
    }, [reviews, context?.userData?._id])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!context?.isLogin) {
            context.openAlertBox('error', 'Please login to add a review')
            return
        }
        if (reviewText.trim() === '') {
            context.openAlertBox('error', 'Please write a review')
            return
        }
        if (!rating) {
            context.openAlertBox('error', 'Please select a rating')
            return
        }

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

    return (
        <div className='w-full productReviewContainer'>
            <h2 className='text-[18px]'>Customer questions & answers</h2>

            {reviews.length === 0 ? (
                <p className='mt-5 text-[14px] text-[rgba(0,0,0,0.6)]'>No reviews yet. Be the first to review this product.</p>
            ) : (
                <div className='reviewScroll w-full scroll max-h-[300px] overflow-y-scroll overflow-x-hidden mt-5 pr-5'>
                    {reviews.map((item) => (
                        <div key={item._id} className='flex items-center justify-between w-full pb-5 pt-5 border-b border-[rgba(0,0,0,0.1)] review'>
                            <div className='info w-[60%] flex items-center gap-3'>
                                <div className='img w-[80px] h-[80px] min-w-[80px] overflow-hidden rounded-full bg-[#f1f1f1] flex items-center justify-center'>
                                    {item.image ? (
                                        <img src={item.image} alt={item.userName} className='object-cover w-full h-full' />
                                    ) : (
                                        <span className='text-[28px] font-[600] text-[rgba(0,0,0,0.6)] uppercase'>
                                            {item.userName?.charAt(0) || 'U'}
                                        </span>
                                    )}
                                </div>

                                <div className='w-[80%]'>
                                    <h4 className='text-[16px]'>{item.userName || 'User'}</h4>
                                    <h5 className='text-[13px] mb-0'>{item.createdAt?.split('T')[0]}</h5>
                                    <p className='mt-0 mb-0'>{item.review}</p>
                                </div>
                            </div>

                            <Rating name={`review-${item._id}`} value={item.rating} readOnly />
                        </div>
                    ))}
                </div>
            )}

            <br />

            <div className='reviewForm bg-[#f1f1f1] p-4 rounded-md'>
                <h2 className='text-[18px]'>
                    Add a Review
                </h2>

                {!context?.isLogin ? (
                    <p className='mt-3 text-[14px]'>
                        Please <Link to='/login' className='link text-primary font-[600]'>login</Link> to write a review.
                    </p>
                ) : (
                    <form className='w-full mt-5' onSubmit={handleSubmit}>
                        <TextField
                            id="outlined-multiline-static"
                            label="write a review..."
                            multiline
                            rows={5}
                            className='w-full'
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />

                        <br /><br />

                        <Rating name="add-review-rating" value={rating} size='large'
                            onChange={(e, value) => setRating(value || 0)} />

                        <div className='flex items-center mt-5'>
                            <Button type='submit' className='btn-org' disabled={isLoading}>
                                {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Submit Review'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Reviews
