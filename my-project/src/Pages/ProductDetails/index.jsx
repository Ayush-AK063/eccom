import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';
import ProductZoom from '../../components/ProductZoom';
import ProductSlider from '../../components/ProductSlider';
import ProductDetailsComponent from '../../components/ProductDetails';
import Reviews from './reviews';
import { getData, postData } from '../../utils/api';
import { optionFields } from '../../utils/formatPrice';
import './style.css';

const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
};

const ProductDetails = () => {
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [similarProducts, setSimilarProducts] = useState([])
    const [reviews, setReviews] = useState([])
    const [variantImage, setVariantImage] = useState('')
    const { id } = useParams()

    // Logged-in customer ne ye product dekha (admin → customer activity)
    useEffect(() => {
        if (id && localStorage.getItem('accesstoken')) postData('/api/activity/view', { productId: id })
    }, [id])

    const fetchReviews = () => {
        getData(`/api/review/${id}`).then((res) => {
            if (res?.error === false) setReviews(res.data || [])
        })
    }

    // Product → uski category → related products
    useEffect(() => {
        window.scrollTo(0, 0)
        setIsLoading(true)
        setProduct(null)
        setRelatedProducts([])
        setSimilarProducts([])

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Similar: isi price range (0.5x – 1.5x) ke top-rated products; "More from" wale dobara nahi
    useEffect(() => {
        if (!product?.price) return
        let alive = true
        postData('/api/product/filters', {
            minPrice: Math.floor(product.price * 0.5),
            maxPrice: Math.ceil(product.price * 1.5),
            sortBy: 'rating', order: 'desc', limit: 24,
        }).then((res) => {
            if (!alive) return
            const skip = new Set([id, ...relatedProducts.map((p) => p._id)])
            setSimilarProducts((res?.products || []).filter((p) => !skip.has(p._id)).slice(0, 12))
        })
        return () => { alive = false }
    }, [product?.price, id, relatedProducts])

    // Review add hone ke baad: list + product (nayi average rating) refresh
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
    const join = (v) => [].concat(v || []).filter((x) => x && x !== 'null').join(', ')

    const hasVariants = (product.variants || []).length > 0
    const general = [
        ['Brand', product.brand],
        ['Model number', product.modelNumber],
        ['Category', catName],
        ['Sub Category', product.subCat],
        ['Type', product.thirdSubCat],
        ...optionFields(product).map((g) => [g.label, join(g.values.map((v) => (g.unit ? `${v} ${g.unit}` : v)))]),
        ['Net quantity', product.compliance?.netQuantity],
        ['In the box', product.policy?.inTheBox],
        ['Availability', product.countInStock > 0 ? (hasVariants ? 'In stock' : `In stock (${product.countInStock})`) : 'Out of stock'],
        ['SKU', product.sku || String(product._id).slice(-8).toUpperCase()],
    ].filter(([, value]) => value)

    // Category template / custom specs → group wise
    const specGroups = []
    for (const sp of product.specifications || []) {
        const g = sp.group || 'General'
        let grp = specGroups.find((x) => x.name === g)
        if (!grp) specGroups.push((grp = { name: g, rows: [] }))
        grp.rows.push([sp.label, `${sp.value}${sp.unit ? ` ${sp.unit}` : ''}`])
    }
    const generalSpecs = specGroups.find((g) => g.name === 'General')
    if (generalSpecs) { general.splice(1, 0, ...generalSpecs.rows); specGroups.splice(specGroups.indexOf(generalSpecs), 1) }

    const pkg = product.shipping || {}
    const policy = product.policy || {}
    const shippingRows = [
        ['Ships in', pkg.dispatchDays ? `${pkg.dispatchDays} ${pkg.dispatchDays === 1 ? 'day' : 'days'}` : null],
        ['Cash on Delivery', pkg.codAvailable === false ? 'Not available' : 'Available'],
        ['Returns', policy.returnable === false || policy.returnType === 'none' ? 'Not returnable' : `${policy.returnDays ?? 7} days ${policy.returnType === 'replace' ? 'replacement' : 'return / refund'}`],
        ['Warranty', policy.warrantyMonths ? `${policy.warrantyMonths} months${policy.warrantyType ? ` · ${policy.warrantyType}` : ''}` : null],
        ['Package weight', pkg.weight ? `${pkg.weight >= 1000 ? (pkg.weight / 1000).toFixed(2) + ' kg' : pkg.weight + ' g'}` : null],
        ['Package size', pkg.length && pkg.width && pkg.height ? `${pkg.length} × ${pkg.width} × ${pkg.height} cm` : null],
    ].filter(([, v]) => v)

    const c = product.compliance || {}
    const fmtMonth = (m) => (m && /^\d{4}-\d{2}$/.test(m) ? new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : m)
    const legalRows = [
        ['Country of origin', c.countryOfOrigin],
        ['Manufactured by', c.manufacturer],
        ['Packed by', c.packer],
        ['Imported by', c.importer],
        ['Month of manufacture', fmtMonth(c.mfgDate)],
        ['Best before', fmtMonth(c.expiryDate)],
        ['Licence / certification', c.licenseNo],
        ['Customer care', c.customerCare],
    ].filter(([, v]) => v)

    const paragraphs = (product.description || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

    return (
        <div className='bg-white pdPage'>
            {/* Breadcrumb */}
            <div className='container pt-5 pb-4'>
                <nav className='flex items-center flex-wrap gap-1.5 text-[13px] text-gray-500' aria-label='breadcrumb'>
                    <Link to='/' className='hover:text-primary'>Home</Link>
                    <FiChevronRight className='text-gray-300' />
                    {catName && (
                        <>
                            <Link to={catId ? `/productListing?catId=${catId}` : '/productListing'} className='hover:text-primary'>{catName}</Link>
                            <FiChevronRight className='text-gray-300' />
                        </>
                    )}
                    <span className='text-gray-900 truncate max-w-[60vw]'>{product.name}</span>
                </nav>
            </div>

            {/* Top: gallery + info */}
            <section className='container pdTop'>
                <div className='pdTop__gallery'>
                    <ProductZoom item={product} activeSrc={variantImage} />
                </div>
                <div className='pdTop__info'>
                    <ProductDetailsComponent item={product} reviewsCount={reviews.length} onReviewClick={() => scrollToId('reviews')} onVariantChange={(v) => setVariantImage(v.image || '')} />
                </div>
            </section>

            {/* Sections — ek ke neeche ek */}
            <div className='container pdSections'>
                <section id='description' className='pdBlock'>
                    <h2 className='pdBlock__title'>Description</h2>
                    {paragraphs.length ? (
                        <div className='flex flex-col gap-3 max-w-[820px]'>
                            {paragraphs.map((p, i) => (
                                <div key={i} className='text-[14px] leading-[24px] text-gray-600 whitespace-pre-line'>{p}</div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-[14px] text-gray-500'>No description available.</div>
                    )}
                    {product.videoUrl && /^https?:\/\//.test(product.videoUrl) && (
                        <a href={product.videoUrl} target='_blank' rel='noopener noreferrer' className='mt-4 inline-flex items-center gap-2 text-[13px] font-[600] text-primary hover:underline'>
                            ▶ Watch product video
                        </a>
                    )}
                </section>

                <section id='details' className='pdBlock'>
                    <h2 className='pdBlock__title'>Specifications</h2>
                    <div className='pdSpecGroup'>
                        <h3>General</h3>
                        <dl className='pdSpecs'>
                            {general.map(([label, value]) => (
                                <div key={label} className='pdSpecs__row'><dt>{label}</dt><dd>{value}</dd></div>
                            ))}
                        </dl>
                    </div>
                    {specGroups.map((g) => (
                        <div key={g.name} className='pdSpecGroup'>
                            <h3>{g.name}</h3>
                            <dl className='pdSpecs'>
                                {g.rows.map(([label, value]) => (
                                    <div key={label} className='pdSpecs__row'><dt>{label}</dt><dd className='whitespace-pre-line'>{value}</dd></div>
                                ))}
                            </dl>
                        </div>
                    ))}
                    {shippingRows.length > 0 && (
                        <div className='pdSpecGroup'>
                            <h3>Shipping, returns & warranty</h3>
                            <dl className='pdSpecs'>
                                {shippingRows.map(([label, value]) => (
                                    <div key={label} className='pdSpecs__row'><dt>{label}</dt><dd>{value}</dd></div>
                                ))}
                            </dl>
                        </div>
                    )}
                </section>

                {legalRows.length > 0 && (
                    <section id='legal' className='pdBlock'>
                        <h2 className='pdBlock__title'>Manufacturer & legal info</h2>
                        <dl className='pdSpecs pdSpecs--single'>
                            {legalRows.map(([label, value]) => (
                                <div key={label} className='pdSpecs__row'><dt>{label}</dt><dd className='whitespace-pre-line'>{value}</dd></div>
                            ))}
                        </dl>
                    </section>
                )}

                <section id='reviews' className='pdBlock'>
                    <h2 className='pdBlock__title'>Ratings & Reviews</h2>
                    <Reviews productId={id} reviews={reviews} onReviewAdded={handleReviewAdded} />
                </section>
            </div>

            {similarProducts.length > 0 && (
                <section className='container pt-4 pb-4'>
                    <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>Similar Products</h2>
                    <div className='text-[13px] text-gray-500 mt-1'>Top-rated picks in a similar price range</div>
                    <ProductSlider items={6} data={similarProducts} />
                </section>
            )}

            {relatedProducts.length > 0 && (
                <section className='container pt-6 pb-10'>
                    <div className='flex items-end justify-between gap-4'>
                        <div>
                            <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>More from {catName || 'this category'}</h2>
                            <div className='text-[13px] text-gray-500 mt-1'>Explore more items from this category</div>
                        </div>
                        {catId && (
                            <Link to={`/productListing?catId=${catId}`} className='inline-flex items-center gap-1.5 text-[13px] font-[600] text-primary hover:underline whitespace-nowrap'>
                                View all <FiArrowRight />
                            </Link>
                        )}
                    </div>
                    <ProductSlider items={6} data={relatedProducts} />
                </section>
            )}
        </div>
    )
}

export default ProductDetails
