import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import BlogItem from '../../components/BLogItem'
import { getData } from '../../utils/api'

const PER_PAGE = 12

// Saare blog posts — tag filter + pages
const BlogList = () => {
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag') || ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [all, setAll] = useState(null)

  useEffect(() => { getData('/api/blog').then((res) => setAll(res?.error === false ? res.data || [] : [])) }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [tag, page])

  const tags = useMemo(() => [...new Set((all || []).flatMap((b) => b.tags || []))].sort(), [all])
  const list = (all || []).filter((b) => !tag || b.tags?.includes(tag))
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const go = (next) => setParams(Object.fromEntries(Object.entries({ tag, page: 1, ...next }).filter(([, v]) => v && v !== 1)))

  return (
    <section className='py-6 pb-14 bg-white'>
      <div className='container'>
        <nav className='flex items-center gap-1.5 text-[13px] text-gray-500'>
          <Link to='/' className='hover:text-primary'>Home</Link><FiChevronRight className='text-gray-300' /><span className='text-gray-900'>Blog</span>
        </nav>
        <h1 className='mt-4 text-[26px] font-[800] text-gray-900'>Blog</h1>
        {tags.length > 0 && (
          <div className='mt-4 flex flex-wrap gap-2'>
            {['', ...tags].map((t) => (
              <button key={t || 'all'} onClick={() => go({ tag: t })}
                className={`h-[32px] px-3 rounded-md text-[13px] font-[600] border ${tag === t ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-900'}`}>
                {t || 'All'}
              </button>
            ))}
          </div>
        )}
        {all === null ? (
          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>{[...Array(4)].map((_, i) => <div key={i} className='h-[320px] rounded-md bg-gray-100 animate-pulse' />)}</div>
        ) : shown.length === 0 ? (
          <div className='mt-10 text-center text-gray-500'>No posts yet.</div>
        ) : (
          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>{shown.map((b) => <BlogItem key={b._id} item={b} />)}</div>
        )}
        {pages > 1 && (
          <div className='mt-8 flex justify-center gap-1'>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => go({ page: i + 1 })} className={`min-w-[36px] h-[36px] rounded-md border text-[13px] font-[600] ${page === i + 1 ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BlogList
