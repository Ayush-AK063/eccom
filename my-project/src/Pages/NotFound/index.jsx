import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi'
import { MyContext } from '../../App'
import './style.css'

// Galat URL -> 404
const NotFound = () => {
  const context = useContext(MyContext)
  const history = useNavigate()
  const { pathname } = useLocation()
  const [q, setQ] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    const prev = document.title
    document.title = 'Page not found | ClassyShop'
    return () => { document.title = prev }
  }, [])

  const search = (e) => {
    e.preventDefault()
    if (q.trim()) history(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const cats = (context?.catData || []).slice(0, 6)

  return (
    <section className='nfPage'>
      <div className='container max-w-[720px] text-center'>
        <div className='nfCode' aria-hidden>
          <span>4</span>
          <span className='nfZero'><img src='/auth/bag-single.webp' alt='' /></span>
          <span>4</span>
        </div>

        <h1 className='mt-4 text-[28px] font-[800] text-gray-900 leading-tight'>Oops! This page went shopping.</h1>
        <div className='mt-2 text-[14px] text-gray-500 leading-[22px]'>
          We couldn’t find <code className='nfPath'>{pathname}</code>. It may have been moved, renamed, or never existed.
        </div>

        <form onSubmit={search} className='nfSearch'>
          <FiSearch className='text-gray-400 text-[18px] shrink-0' />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search for products…' aria-label='Search products' />
          <button type='submit'>Search</button>
        </form>

        <div className='mt-6 flex flex-wrap justify-center gap-3'>
          <Link to='/' className='nfBtn nfBtn--dark'><FiHome /> Go to home</Link>
          <button type='button' onClick={() => history(-1)} className='nfBtn nfBtn--light'><FiArrowLeft /> Go back</button>
        </div>

        {cats.length > 0 && (
          <div className='mt-10'>
            <div className='text-[12px] font-[600] uppercase tracking-[0.1em] text-gray-400'>Or browse a category</div>
            <div className='mt-3 flex flex-wrap justify-center gap-2'>
              {cats.map((c) => (
                <Link key={c._id} to={`/productListing?catId=${c._id}`} className='nfChip'>{c.name}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default NotFound
