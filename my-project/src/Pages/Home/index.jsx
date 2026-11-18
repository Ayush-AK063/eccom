import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../App'
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
import { getData } from '../../utils/api'

const Home = () => {
  const [value, setValue] = useState(0)
  const [banners, setBanners] = useState({
    leftBig: [],
    rightTop: null,
    rightDown: null,
    v2: [],
    v3: [],
  })

  const [popularProducts, setPopularProducts] = useState([])
  const [latestProducts, setLatestProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [blogData, setBlogData] = useState([])

  const context = useContext(MyContext)

  const filterByCatId = (id) => {
    if (!id) return
    setPopularProducts([])
    getData(`/api/product/getproductby-catid/${id}`).then(res => {
      if (res?.error === false) setPopularProducts(res?.products || [])
    })
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
    filterByCatId(context?.catData?.[newValue]?._id)
  }

  // Jab categories load ho jaayein, pehli category ke products dikhao
  useEffect(() => {
    if (context?.catData?.length > 0) {
      setValue(0)
      filterByCatId(context.catData[0]._id)
    }
  }, [context?.catData])

  useEffect(() => {
    getData('/api/homeSlide').then((res) => {
      if (res?.success && res?.data) {
        const all = res.data
        setBanners({
          leftBig: all.filter(b => b.type === 'Left Big Banner'),
          rightTop: all.find(b => b.type === 'Right Top Banner') || null,
          rightDown: all.find(b => b.type === 'Right Down Banner') || null,
          v2: all.filter(b => b.type === 'v2 Banner'),
          v3: all.filter(b => b.type === 'v3 Banner'),
        })
      }
    })

    getData('/api/product?flag=latest').then(res => setLatestProducts(res?.products || []))
    getData('/api/product?flag=featured').then(res => setFeaturedProducts(res?.products || []))
    getData('/api/blog').then(res => {
      if (res?.error === false) setBlogData(res?.data || [])
    })
  }, [])

  return (
    <>
      {/* ── Top Banner Section ── */}
      <section className='pt-5'>
        <div className='container flex gap-4 h-[320px] md:h-[460px] lg:h-[clamp(440px,calc(100vh-240px),680px)]'>
          <div className='part1 w-[70%] h-full'>
            <HomeSliderV2 slides={banners.leftBig} />
          </div>
          <div className='part2 flex flex-col gap-4 w-[30%] h-full'>
            <BannerBoxV2 info='left' banner={banners.rightTop} />
            <BannerBoxV2 info='right' banner={banners.rightDown} />
          </div>
        </div>
      </section>

      <HomeCatSlider />

      {/* ── Popular Products ── */}
      <section className='pt-8 pb-2 bg-white'>
        <div className='container'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-3 mb-2'>
            <div className='leftSec'>
              <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>Popular Products</h2>
              <p className='text-[13px] text-gray-500 mt-1'>Trending picks our customers love right now</p>
            </div>
            <div className='rightSec w-full md:w-[55%] flex md:justify-end'>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons={false} aria-label="Product categories" className='pillTabs'>
                {context?.catData?.map((cat) => (
                  <Tab label={cat.name} key={cat._id} />
                ))}
              </Tabs>
            </div>
          </div>
          <ProductSlider items={6} data={popularProducts} />
        </div>
      </section>

      {/* ── Today's Best Deals + Shop by Budget ── */}
      <DealsOfTheDay />
      <PriceDeals />

      {/* ── Free Shipping ── */}
      <section className='pt-1 pb-4 bg-white'>
        <div className='container'>
          {/* Free shipping banner */}
          <div className='freeShipping'>
            <div className='flex items-center gap-4'>
              <span className='freeShipping__icon'><LiaShippingFastSolid /></span>
              <span className='text-[18px] font-[700] uppercase tracking-wide text-gray-900'>Free Shipping</span>
            </div>
            <div className='freeShipping__text'>Free Delivery Now On Your First Order and above 499</div>
            <div className='freeShipping__price'>Only <span>₹499</span></div>
          </div>
        </div>
      </section>

      {/* ── Shop by Collection ── */}
      <ShopByCollection />

      {/* ── Latest Products + v3 Banner ── */}
      <section className='pt-6 pb-4 bg-white'>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[700] text-gray-900 leading-tight mb-1'>Latest Products</h2>
          <ProductSlider items={6} data={latestProducts} />
          <AdsBannerSlider2 banners={banners.v3} items={1} />
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className='pt-6 pb-4 bg-white'>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[700] text-gray-900 leading-tight mb-1'>Featured Products</h2>
          <ProductSlider items={6} data={featuredProducts} />
        </div>
      </section>

      {/* ── Blog Section ── */}
      {blogData.length > 0 && (
        <section className='pt-6 pb-10 bg-white blogSection'>
          <div className='container'>
            <div className='mb-4'>
              <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>From the Blog</h2>
              <div className='text-[13px] text-gray-500 mt-1'>Style tips, guides and the latest from our store</div>
            </div>
            <Swiper
              modules={[FreeMode]}
              freeMode={true}
              spaceBetween={16}
              slidesPerView={1.15}
              breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 24 }, 1280: { slidesPerView: 4, spaceBetween: 24 } }}
              className="blogSlider"
            >
              {blogData.map((item) => (
                <SwiperSlide key={item._id} className='!h-auto'><BlogItem item={item} /></SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}
    </>
  )
}

export default Home