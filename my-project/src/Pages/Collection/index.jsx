import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import CircularProgress from '@mui/material/CircularProgress'
import { MyContext } from '../../App'
import { postData } from '../../utils/api'
import ProductItem from '../../components/ProductItem'
import { collectionSlug, collectionQuery } from '../../utils/storeSettings'

const SORTS = [['', 'Featured'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['discount', 'Biggest discount'], ['rating', 'Top rated']]

// /collection/:slug — Admin → Store Settings → Home page → Shop by Collection ke products
const CollectionPage = () => {
  const { slug } = useParams()
  const context = useContext(MyContext)
  const loaded = context?.settings?._loaded
  const col = useMemo(() => (context?.settings?.home?.collections || []).find((c) => collectionSlug(c) === slug), [context?.settings, slug])
  const [products, setProducts] = useState(null)
  const [sort, setSort] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [slug])
  useEffect(() => { if (col?.title) document.title = col.title }, [col?.title])

  useEffect(() => {
    if (!col) return
    const q = collectionQuery(col)
    if (!q) return setProducts([])
    setProducts(null)
    postData('/api/product/filters', q).then((res) => {
      let list = res?.products || []
      // Chune hue products admin ke order mein
      if (q.ids) list = q.ids.map((id) => list.find((p) => p._id === id)).filter(Boolean)
      setProducts(list)
    })
  }, [col])

  const shown = useMemo(() => {
    const list = [...(products || [])]
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'discount') list.sort((a, b) => (b.discount || 0) - (a.discount || 0))
    if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return list
  }, [products, sort])

  if (!loaded) return <div className='py-24 flex justify-center'><CircularProgress size={28} /></div>
  if (!col) {
    return (
      <div className='container py-20 text-center'>
        <h1 className='text-[22px] font-[700] text-gray-900'>Collection not found</h1>
        <Link to='/' className='inline-block mt-3 text-primary font-[600]'>Go to Home</Link>
      </div>
    )
  }

  return (
    <section className='pb-14 bg-white'>
      <div className='relative h-[200px] md:h-[280px] overflow-hidden bg-gray-100'>
        {col.image && <img src={col.image} alt={col.title} className='absolute inset-0 w-full h-full object-cover' />}
        <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent' />
        <div className='container relative h-full flex flex-col justify-center text-white'>
          <nav className='flex items-center gap-1.5 text-[13px] text-white/70 mb-3'>
            <Link to='/' className='hover:text-white'>Home</Link><FiChevronRight /><span className='text-white'>{col.title}</span>
          </nav>
          {col.tag && <span className='text-[12px] font-[700] uppercase tracking-wider text-white/80'>{col.tag}</span>}
          <h1 className='text-[28px] md:text-[36px] font-[800] leading-tight'>{col.title}</h1>
          {col.text && <p className='mt-1 text-[14px] text-white/85 max-w-[520px]'>{col.text}</p>}
        </div>
      </div>

      <div className='container mt-6'>
        <div className='flex items-center justify-between gap-3 mb-4'>
          <span className='text-[13px] text-gray-500'>{products ? `${products.length} product${products.length === 1 ? '' : 's'}` : ''}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className='h-[38px] px-3 rounded-md border border-gray-200 text-[13px] outline-none focus:border-gray-900'>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {products === null ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>{[...Array(10)].map((_, i) => <div key={i} className='h-[300px] rounded-md bg-gray-100 animate-pulse' />)}</div>
        ) : shown.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>No products in this collection right now.</div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>{shown.map((p) => <ProductItem key={p._id} item={p} />)}</div>
        )}
      </div>
    </section>
  )
}

export default CollectionPage
