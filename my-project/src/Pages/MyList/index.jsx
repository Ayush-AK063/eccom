import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { FiChevronRight, FiHeart, FiTrash2 } from 'react-icons/fi';
import AccountSidebar from '../../components/AccountSidebar';
import ProductItem from '../../components/ProductItem';
import { MyContext } from '../../App';
import { getData } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import '../MyAccount/style.css';

// Wishlist mein sirf snapshot save hota hai -> card (size, stock, add to cart) ke liye poora product lao
const MyList = () => {
  const context = useContext(MyContext)
  const list = context?.myListData || []
  const [products, setProducts] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const ids = list.map((i) => String(i.productId)).join(',')
  useEffect(() => {
    if (!ids) { setProducts({}); return }
    let alive = true
    setLoading(true)
    Promise.all(ids.split(',').map((id) => getData(`/api/product/getproduct/${id}`).then((r) => [id, r?.product || null])))
      .then((pairs) => alive && setProducts(Object.fromEntries(pairs)))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [ids])

  return (
    <section className='bg-[#fafafa] py-6 pb-14'>
      <div className='container'>
        <nav className='flex items-center gap-1.5 text-[13px] text-gray-500 mb-4' aria-label='breadcrumb'>
          <Link to='/' className='hover:text-primary'>Home</Link>
          <FiChevronRight className='text-gray-300' />
          <Link to='/my-account' className='hover:text-primary'>My Account</Link>
          <FiChevronRight className='text-gray-300' />
          <span className='text-gray-900'>Wishlist</span>
        </nav>

        <div className='accGrid'>
          <AccountSidebar />

          <div className='accCard min-w-0'>
            <div className='accCard__head'>
              <div>
                <h2>My Wishlist <span className='text-[13px] font-[500] text-gray-500'>({list.length} {list.length === 1 ? 'item' : 'items'})</span></h2>
                <div className='text-[13px] text-gray-500 mt-0.5'>Items you’ve saved for later. Tap the heart to remove.</div>
              </div>
            </div>

            <div className='p-5'>
              {list.length === 0 ? (
                <div className='flex flex-col items-center text-center py-12'>
                  <span className='w-[72px] h-[72px] rounded-full bg-[#fff1f0] text-primary text-[30px] flex items-center justify-center'><FiHeart /></span>
                  <div className='mt-4 text-[17px] font-[700] text-gray-900'>Your wishlist is empty</div>
                  <div className='mt-1 text-[13px] text-gray-500 max-w-[360px]'>
                    {context?.isLogin
                      ? 'Save items you love by tapping the heart on any product.'
                      : <>Please <Link to='/login' className='text-primary font-[600] hover:underline'>log in</Link> to see your wishlist.</>}
                  </div>
                  <Link to='/productListing' className='mt-5 accBtn accBtn--dark'>Explore products</Link>
                </div>
              ) : loading && !Object.keys(products).length ? (
                <div className='flex items-center justify-center py-16'><CircularProgress color='inherit' size={28} /></div>
              ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {list.map((item) => {
                    const p = products[String(item.productId)]
                    if (p) return <ProductItem key={item._id} item={p} />
                    // Product store se hat gaya -> saved snapshot + remove
                    return (
                      <div key={item._id} className='flex flex-col bg-white border border-gray-100 rounded-md overflow-hidden'>
                        <div className='relative aspect-[5/4] bg-[#f7f7f8] flex items-center justify-center'>
                          {item.image && <img src={item.image} alt={item.productTitle} className='w-[70%] h-[70%] object-contain mix-blend-multiply opacity-60' />}
                          <span className='absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gray-900 text-white text-[11px] font-[600]'>Unavailable</span>
                        </div>
                        <div className='p-3.5 flex flex-col flex-1'>
                          <div className='text-[14px] font-[500] text-gray-900 truncate'>{item.productTitle}</div>
                          <div className='text-[13px] text-gray-500 mt-1'>{formatPrice(item.price)}</div>
                          <button type='button' onClick={() => context.removeFromMyList(item._id)}
                            className='mt-auto pt-3 inline-flex items-center gap-1.5 text-[12px] font-[600] text-gray-500 hover:text-primary'>
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyList
