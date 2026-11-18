import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../App'
import { Link } from 'react-router-dom'
import HomeCatSlider from '../../components/HomeCatSlider'
import { LiaShippingFastSolid } from "react-icons/lia"
import { AdsBannerSlider2 } from '../../components/AdsBannerSlider'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ProductSlider from '../../components/ProductSlider'
import DealsOfTheDay from '../../components/DealsOfTheDay'
import PriceDeals from '../../components/PriceDeals'
import ShopByCollection from '../../components/ShopByCollection'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { FreeMode } from 'swiper/modules'
import BlogItem from '../../components/BLogItem'
import HomeSliderV2 from '../../components/homeSliderV2'
import BannerBoxV2 from '../../components/bannerBoxV2'
import { getData, postData } from '../../utils/api'

// Section ka heading (Admin → Store Settings → Home page)
export const SectionHead = ({ title, subtitle, className = 'mb-2', children }) => (
  (title || subtitle || children) ? (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-3 ${className}`}>
      <div>
        {title && <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>{title}</h2>}
        {subtitle && <p className='text-[13px] text-gray-500 mt-1'>{subtitle}</p>}
      </div>
      {children}
    </div>
  ) : null
)

const Home = () => {
  const context = useContext(MyContext)
  const home = context?.settings?.home || {}
  const [value, setValue] = useState(0)
  const [banners, setBanners] = useState({ leftBig: [], rightTop: null, rightDown: null, v2: [] })
  const [popularProducts, setPopularProducts] = useState([])
  const [latestProducts, setLatestProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [blogData, setBlogData] = useState([])

  const popular = home.popular || {}
  const byCategory = popular.source === 'category'

  // Popular: category tabs, ya flag / rating / newest se ek list
  const loadPopular = (catId) => {
    setPopularProducts([])
    const body = { limit: popular.limit || 12, availability: [] }
    if (byCategory) { if (!catId) return; body.catId = [catId] }
    if (popular.source === 'flag') body.flag = 'popular'
    if (popular.source === 'rating') Object.assign(body, { sortBy: 'rating', order: 'desc' })
    if (popular.source === 'newest') Object.assign(body, { sortBy: 'createdAt', order: 'desc' })
    postData('/api/product/filters', body).then((res) => setPopularProducts(res?.products || []))
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
    loadPopular(context?.catData?.[newValue]?._id)
  }

  useEffect(() => {
    if (!context?.settings?._loaded) return
    if (byCategory && !context?.catData?.length) return
    setValue(0)
    loadPopular(context?.catData?.[0]?._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.catData, context?.settings?._loaded, popular.source, popular.limit])

  useEffect(() => {
    if (!context?.settings?._loaded) return
    const latest = home.latest || {}
    postData('/api/product/filters', latest.source === 'flag'
      ? { flag: 'latest', limit: latest.limit || 12 }
      : { sortBy: 'createdAt', order: 'desc', limit: latest.limit || 12 }).then((res) => setLatestProducts(res?.products || []))
    postData('/api/product/filters', { flag: 'featured', limit: home.featured?.limit || 12 }).then((res) => setFeaturedProducts(res?.products || []))
    getData(`/api/blog?perPage=${home.blog?.limit || 8}`).then((res) => { if (res?.error === false) setBlogData(res?.data || []) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.settings?._loaded])

  useEffect(() => {
    getData('/api/homeSlide').then((res) => {
      if (res?.success && res?.data) {
        const all = res.data
        setBanners({
          leftBig: all.filter(b => b.type === 'Left Big Banner'),
          rightTop: all.find(b => b.type === 'Right Top Banner') || null,
          rightDown: all.find(b => b.type === 'Right Down Banner') || null,
          v2: all.filter(b => b.type === 'v2 Banner'),
        })
      }
    })
  }, [])

  const btn = home.bannerButtonText || 'SHOP NOW'
  const sh = context?.settings?.shipping || {}

  const render = (sec) => {
    const { key, title, subtitle } = sec
    switch (key) {
      case 'hero':
        if (!banners.leftBig.length && !banners.rightTop && !banners.rightDown) return null
        return (
          <section className='pt-5'>
            <div className='container flex gap-4 h-[320px] md:h-[460px] lg:h-[clamp(440px,calc(100vh-240px),680px)]'>
              <div className={`part1 h-full ${banners.rightTop || banners.rightDown ? 'w-[70%]' : 'w-full'}`}>
                <HomeSliderV2 slides={banners.leftBig} buttonText={btn} />
              </div>
              {(banners.rightTop || banners.rightDown) && (
                <div className='part2 flex flex-col gap-4 w-[30%] h-full'>
                  <BannerBoxV2 info='left' banner={banners.rightTop} buttonText={btn} />
                  <BannerBoxV2 info='right' banner={banners.rightDown} buttonText={btn} />
                </div>
              )}
            </div>
          </section>
        )
      case 'categories':
        return <HomeCatSlider title={title} subtitle={subtitle} />
      case 'popular':
        if (!byCategory && !popularProducts.length) return null
        return (
          <section className='pt-8 pb-2 bg-white'>
            <div className='container'>
              <SectionHead title={title} subtitle={subtitle}>
                {byCategory && (
                  <div className='rightSec w-full md:w-[55%] flex md:justify-end'>
                    <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons={false} aria-label="Product categories" className='pillTabs'>
                      {context?.catData?.map((cat) => <Tab label={cat.name} key={cat._id} />)}
                    </Tabs>
                  </div>
                )}
              </SectionHead>
              <ProductSlider items={6} data={popularProducts} />
            </div>
          </section>
        )
      case 'deals':
        return <DealsOfTheDay config={home.deals} title={title} subtitle={subtitle} />
      case 'budget':
        return <PriceDeals tiers={home.budget} title={title} subtitle={subtitle} />
      case 'freeShipping': {
        const free = !(sh.shippingCharge > 0)
        if (!free && !(sh.freeShippingAbove > 0)) return null
        return (
          <section className='pt-1 pb-4 bg-white'>
            <div className='container'>
              <div className='freeShipping'>
                <div className='flex items-center gap-4'>
                  <span className='freeShipping__icon'><LiaShippingFastSolid /></span>
                  <span className='text-[18px] font-[700] uppercase tracking-wide text-gray-900'>{title || 'Free Shipping'}</span>
                </div>
                <div className='freeShipping__text'>{subtitle || `${free ? 'Free delivery on every order' : 'Free delivery on all orders above'} · Delivered in ${sh.etaMinDays}–${sh.etaMaxDays} days`}</div>
                {!free && <div className='freeShipping__price'>Above <span>₹{Number(sh.freeShippingAbove).toLocaleString('en-IN')}</span></div>}
              </div>
            </div>
          </section>
        )
      }
      case 'collections':
        return <ShopByCollection items={home.collections} title={title} subtitle={subtitle} />
      case 'latest':
      case 'featured': {
        const data = key === 'latest' ? latestProducts : featuredProducts
        if (!data.length) return null
        return (
          <section className='pt-6 pb-4 bg-white'>
            <div className='container mx-auto'>
              <SectionHead title={title} subtitle={subtitle} className='mb-1' />
              <ProductSlider items={6} data={data} />
            </div>
          </section>
        )
      }
      case 'wideBanner':
        if (!banners.v2.length) return null
        return <section className='pb-4 bg-white'><div className='container'><AdsBannerSlider2 banners={banners.v2} items={1} /></div></section>
      case 'blog':
        if (!blogData.length) return null
        return (
          <section className='pt-6 pb-10 bg-white blogSection'>
            <div className='container'>
              <SectionHead title={title} subtitle={subtitle} className='mb-4'>
                <Link to='/blog' className='text-[13px] font-[600] text-primary hover:underline whitespace-nowrap'>View all posts →</Link>
              </SectionHead>
              <Swiper modules={[FreeMode]} freeMode={true} spaceBetween={16} slidesPerView={1.15}
                breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 24 }, 1280: { slidesPerView: 4, spaceBetween: 24 } }}
                className="blogSlider">
                {blogData.map((item) => <SwiperSlide key={item._id} className='!h-auto'><BlogItem item={item} /></SwiperSlide>)}
              </Swiper>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return <>{(home.sections || []).filter((s) => s.enabled !== false).map((s) => <React.Fragment key={s.key}>{render(s)}</React.Fragment>)}</>
}

export default Home
