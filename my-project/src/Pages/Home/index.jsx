import React, { useContext, useEffect, useState } from 'react'
import { MyContext } from '../../App'
import HomeCatSlider from '../../components/HomeCatSlider'
import { LiaShippingFastSolid } from "react-icons/lia"
import { AdsBannerSlider, AdsBannerSlider2 } from '../../components/AdsBannerSlider'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ProductSlider from '../../components/ProductSlider'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
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
      <section className='py-6'>
        <div className='container flex gap-5'>
          <div className='part1 w-[70%]'>
            <HomeSliderV2 slides={banners.leftBig} />
          </div>
          <div className='part2 flex flex-col gap-5 items-center justify-between w-[30%]'>
            <BannerBoxV2 info='left' banner={banners.rightTop} />
            <BannerBoxV2 info='right' banner={banners.rightDown} />
          </div>
        </div>
      </section>

      <HomeCatSlider />

      {/* ── Popular Products ── */}
      <section className='py-8 bg-white'>
        <div className='container'>
          <div className='flex items-center justify-between'>
            <div className='leftSec'>
              <h2 className='text-[20px] font-[600]'>Popular Products</h2>
              <p className='text-[14px] font-[400]'>Do not miss the current offers untill the end of March</p>
            </div>
            <div className='rightSec w-[50%]'>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="scrollable auto tabs example">
                {context?.catData?.map((cat) => (
                  <Tab label={cat.name} key={cat._id} />
                ))}
              </Tabs>
            </div>
          </div>
          <ProductSlider items={6} data={popularProducts} />
        </div>
      </section>

      {/* ── Free Shipping + v2 Banners ── */}
      <section className='py-8 bg-white'>
        <div className='container'>
          <div className='w-[80%] m-auto p-4 mb-7 rounded-md border-2 border-[#ff5252] freeShipping flex justify-between items-center'>
            <div className='flex items-center gap-4 rounded-md col1'>
              <LiaShippingFastSolid className='text-[50px]' />
              <span className='text-[20px] font-[600] uppercase'>Free Shipping</span>
            </div>
            <div className='col2'>
              <p className='mb-0 font-[500]'>Free Delivery Now On Your First Order and above 499</p>
            </div>
            <p className='mb-0 font-bold text-[25px]'>Only 499</p>
          </div>

          <AdsBannerSlider banners={banners.v2} items={3} />
        </div>
      </section>

      {/* ── Latest Products + v3 Banner ── */}
      <section className='py-8 bg-white'>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[600]'>Latest Products</h2>
          <ProductSlider items={6} data={latestProducts} />
          <AdsBannerSlider2 banners={banners.v3} items={1} />
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className='py-8 bg-white'>
        <div className='container mx-auto'>
          <h2 className='text-[20px] font-[600]'>Featured Products</h2>
          <ProductSlider items={6} data={featuredProducts} />
        </div>
      </section>

      {/* ── Blog Section ── */}
      {blogData.length > 0 && (
        <section className='py-5 pt-0 pb-8 bg-white blogSection'>
          <div className='container'>
            <h2 className='text-[20px] font-[600] mb-4'>From the Blog</h2>
            <Swiper slidesPerView={3} spaceBetween={20} modules={[Navigation]} navigation={true} className="blogSlider">
              {blogData.map((item) => (
                <SwiperSlide key={item._id}><BlogItem item={item} /></SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}
    </>
  )
}

export default Home