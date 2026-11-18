import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import CircularProgress from '@mui/material/CircularProgress'
import { getData } from '../../utils/api'

// Admin ke likhe text ka simple format: "## " heading, "- " list, khaali line = naya paragraph
export const SimpleText = ({ text = '' }) => {
  const blocks = String(text).replace(/\r/g, '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className='flex flex-col gap-4 text-[15px] leading-7 text-gray-700'>
      {blocks.map((b, i) => {
        if (b.startsWith('## ')) {
          const [h, ...rest] = b.split('\n')
          return (
            <div key={i}>
              <h2 className='text-[19px] font-[700] text-gray-900 mt-2'>{h.slice(3)}</h2>
              {rest.length > 0 && <p className='whitespace-pre-line mt-2'>{rest.join('\n')}</p>}
            </div>
          )
        }
        const lines = b.split('\n')
        if (lines.every((l) => /^[-•]\s/.test(l))) {
          return <ul key={i} className='list-disc pl-5 flex flex-col gap-1'>{lines.map((l, j) => <li key={j}>{l.replace(/^[-•]\s/, '')}</li>)}</ul>
        }
        return <p key={i} className='whitespace-pre-line'>{b}</p>
      })}
    </div>
  )
}

const InfoPage = () => {
  const { slug } = useParams()
  const [page, setPage] = useState(undefined)

  useEffect(() => {
    window.scrollTo(0, 0)
    setPage(undefined)
    getData(`/api/page/${slug}`).then((res) => setPage(res?.error === false ? res.data : null))
  }, [slug])

  useEffect(() => { if (page?.title) document.title = page.title }, [page?.title])

  if (page === undefined) return <div className='py-24 flex justify-center'><CircularProgress size={28} /></div>
  if (!page) {
    return (
      <div className='container py-20 text-center'>
        <h1 className='text-[22px] font-[700] text-gray-900'>Page not found</h1>
        <Link to='/' className='inline-block mt-3 text-primary font-[600]'>Go to Home</Link>
      </div>
    )
  }
  return (
    <section className='py-6 pb-14 bg-white'>
      <div className='container'>
        <nav className='flex items-center gap-1.5 text-[13px] text-gray-500'>
          <Link to='/' className='hover:text-primary'>Home</Link><FiChevronRight className='text-gray-300' /><span className='text-gray-900'>{page.title}</span>
        </nav>
        <div className='max-w-[820px] mx-auto mt-6'>
          <h1 className='text-[28px] font-[800] text-gray-900 tracking-tight'>{page.title}</h1>
          <div className='text-[12px] text-gray-400 mt-1 mb-6'>Last updated {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <SimpleText text={page.content} />
        </div>
      </div>
    </section>
  )
}

export default InfoPage
