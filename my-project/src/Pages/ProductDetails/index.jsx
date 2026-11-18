import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import ProductZoom from '../../components/ProductZoom';
import ProductSlider from '../../components/ProductSlider';
import ProductDetailsComponent from '../../components/ProductDetails';
import Reviews from './reviews';
import { getData } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';

const ProductDetails = () => {

    const [activeTab, setActiveTab] = useState(0)
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [reviews, setReviews] = useState([])
    const { id } = useParams()

    const fetchReviews = () => {
        getData(`/api/review/${id}`).then((res) => {
            if (res?.error === false) setReviews(res.data || [])
        })
    }

    // Product → uski category → related products (promise chain)
    useEffect(() => {
        window.scrollTo(0, 0)
        setIsLoading(true)
        setProduct(null)
        setRelatedProducts([])
        setActiveTab(0)

        getData(`/api/product/getproduct/${id}`)
            .then((res) => {
                if (res?.success) {
                    setProduct(res.product)
                    const catId = res.product?.catId?._id || res.product?.catId
                    if (catId) return getData(`/api/product/getproductby-catid/${catId}?perPage=12`)
                }
                return null
            })
            .then((res) => {
                if (res?.error === false) {
                    setRelatedProducts((res.products || []).filter((p) => p._id !== id))
                }
            })
            .finally(() => setIsLoading(false))

        fetchReviews()
    }, [id])

    // Review add hone ke baad: reviews list + product (nayi average rating) refresh
    const handleReviewAdded = () => {
        fetchReviews()
        getData(`/api/product/getproduct/${id}`).then((res) => {
            if (res?.success) setProduct(res.product)
        })
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full min-h-[500px]'>
                <CircularProgress color='inherit' />
            </div>
        )
    }

    if (!product) {
        return (
            <div className='container flex flex-col items-center justify-center min-h-[400px] gap-3'>
                <h2 className='text-[20px] font-[600]'>Product not found</h2>
                <Link to='/' className='link text-primary'>Go to Home</Link>
            </div>
        )
    }

    const catName = product?.catId?.name || product?.catName
    const catId = product?.catId?._id || product?.catId

    const details = [
        ['Brand', product.brand],
        ['Category', catName],
        ['Sub Category', product.subCat],
        ['Third Category', product.thirdSubCat],
        ['RAM', [].concat(product.productRam || []).filter(Boolean).join(', ')],
        ['Size', product.size?.filter(Boolean).join(', ')],
        ['Weight', product.productWeight?.filter(Boolean).join(', ')],
        ['Price', product.price ? formatPrice(product.price) : null],
        ['Stock', `${product.countInStock || 0} Items`],
    ].filter(([, value]) => value)

    return (
        <>
            <div className='py-5'>
                <div className='container'>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link to="/" className='transition-all link !text-[14px]'>
                            Home
                        </Link>
                        {catName && (
                            <Link to={catId ? `/productListing?catId=${catId}` : '/productListing'} className='transition-all link !text-[14px]'>
                                {catName}
                            </Link>
                        )}
                        <span className='!text-[14px] text-[rgba(0,0,0,0.8)]'>
                            {product.name}
                        </span>
                    </Breadcrumbs>
                </div>
            </div>

            <section className='py-5 bg-white'>
                <div className='container flex items-center gap-8 mb-5'>
                    <div className='productZoomContainer w-[40%]'>
                        <ProductZoom item={product} />
                    </div>

                    <div className='productContent w-[60%] pr-10 pl-10'>
                        <ProductDetailsComponent item={product} reviewsCount={reviews.length}
                            onReviewClick={() => setActiveTab(2)} />
                    </div>
                </div>

                <div className='container !mt-10'>
                    <div className='flex items-center gap-8'>
                        <span
                            className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 0 && 'text-primary'}`}
                            onClick={() => setActiveTab(0)}>
                            Description
                        </span>
                        <span
                            className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 1 && 'text-primary'}`}
                            onClick={() => setActiveTab(1)}>
                            Product Details
                        </span>
                        <span
                            className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 2 && 'text-primary'}`}
                            onClick={() => setActiveTab(2)}>
                            Reviews ({reviews.length})
                        </span>
                    </div>

                    {
                        activeTab === 0 && (
                            <div className='w-full px-8 py-5 rounded-md shadow-md'>
                                <p>{product.description || "No description details available."}</p>
                            </div>
                        )
                    }

                    {
                        activeTab === 1 && (
                            <div className='w-full px-8 py-5 rounded-md shadow-md'>
                                <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
                                        <tbody>
                                            {details.map(([label, value]) => (
                                                <tr key={label} className="bg-white border-b border-gray-200">
                                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap w-[30%]">
                                                        {label}
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        {value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 2 && (
                            <div className='px-8 py-5 rounded-md shadow-md w-[80%]'>
                                <Reviews productId={id} reviews={reviews} onReviewAdded={handleReviewAdded} />
                            </div>
                        )
                    }
                </div>

                {relatedProducts.length > 0 && (
                    <div className='container pt-8'>
                        <h2 className='text-[20px] font-[600]'>Related Products</h2>
                        <ProductSlider items={6} data={relatedProducts} />
                    </div>
                )}
            </section>
        </>
    )
}

export default ProductDetails
