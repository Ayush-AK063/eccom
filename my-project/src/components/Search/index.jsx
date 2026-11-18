import React, { useEffect, useRef, useState } from 'react'
import './style.css'
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { IoSearch } from "react-icons/io5";
import { useLocation, useNavigate } from 'react-router-dom';
import { getData } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';

// Header search: Enter / 🔍 → /search?q=...  |  typing par top 5 suggestions
const Search = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const boxRef = useRef(null)

  // /search page par ho to box mein wahi query dikhao
  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(new URLSearchParams(location.search).get('q') || '')
    }
    setShowSuggestions(false)
  }, [location.pathname, location.search])

  // Typing rukne ke 300ms baad suggestions lao
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      return
    }
    let ignore = false
    setIsLoading(true)
    const t = setTimeout(() => {
      getData(`/api/product/search-suggestions?q=${encodeURIComponent(q)}`).then((res) => {
        if (ignore) return
        setSuggestions(res?.error === false ? res.data || [] : [])
        setIsLoading(false)
      })
    }, 300)
    return () => { ignore = true; clearTimeout(t) }
  }, [query])

  // Bahar click → dropdown band
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const goToSearch = () => {
    const q = query.trim()
    if (!q) return
    setShowSuggestions(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const openProduct = (id) => {
    setShowSuggestions(false)
    navigate(`/product/${id}`)
  }

  const showDropdown = showSuggestions && query.trim().length >= 2

  return (
    <div ref={boxRef} className='searchBox w-[100%] h-[50px] bg-[#e5e5e5] rounded-[5px] relative p-2'>
      <input type="text" placeholder='Search for products...'
        className='w-full h-[35px] focus:outline-none bg-inherit p-2 pr-10 text-[15px]'
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goToSearch()
          if (e.key === 'Escape') setShowSuggestions(false)
        }} />
      <Button className='!absolute top-[8px] right-[5px] z-50 !w-[37px] !min-w-[37px] h-[37px] !rounded-full !text-black'
        onClick={goToSearch}>
        {isLoading
          ? <CircularProgress size={18} color='inherit' />
          : <IoSearch className='text-[#4e4e4e] text-[22px]' />}
      </Button>

      {showDropdown && (
        <div className='absolute left-0 right-0 top-[55px] z-[200] bg-white rounded-md shadow-lg border border-[rgba(0,0,0,0.1)] overflow-hidden'>
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((p) => (
                <div key={p._id} onClick={() => openProduct(p._id)}
                  className='flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#f5f5f5]'>
                  <img src={p.images?.[0]} alt={p.name} className='w-[40px] h-[40px] object-cover rounded-md' />
                  <div className='flex-1 min-w-0'>
                    <p className='m-0 text-[14px] truncate text-black'>{p.name}</p>
                    <p className='m-0 text-[12px] text-gray-500'>{p.brand}</p>
                  </div>
                  <span className='text-[13px] font-[600] text-primary whitespace-nowrap'>{formatPrice(p.price)}</span>
                </div>
              ))}
              <div onClick={goToSearch}
                className='px-3 py-2 text-[13px] font-[500] text-center cursor-pointer text-primary border-t border-[rgba(0,0,0,0.1)] hover:bg-[#f5f5f5]'>
                See all results for "{query.trim()}"
              </div>
            </>
          ) : !isLoading ? (
            <p className='px-3 py-3 m-0 text-[14px] text-gray-500'>No products found for "{query.trim()}"</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default Search
