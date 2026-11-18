import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiPackage, FiTruck } from 'react-icons/fi'
import CircularProgress from '@mui/material/CircularProgress'
import { FcGoogle } from 'react-icons/fc'
import './style.css'

// 24 transparent combos (server/scripts/generateAuthImages.py se) — har kuch second badalte hain
const COMBOS = Array.from({ length: 24 }, (_, i) => `/auth/combo-${String(i + 1).padStart(2, '0')}.webp`)

const RotatingProducts = () => {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * COMBOS.length))

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % COMBOS.length), 3500)
    return () => clearInterval(t)
  }, [])

  // Agli image pehle se load -> fade mein jhatka nahi
  useEffect(() => {
    const img = new Image()
    img.src = COMBOS[(idx + 1) % COMBOS.length]
  }, [idx])

  return (
    <div className='authPanel__stage' aria-hidden>
      <img key={idx} src={COMBOS[idx]} alt='' className='authPanel__img' />
    </div>
  )
}

// Login / Register ka common frame: left brand panel + right form card
const AuthLayout = ({ title, subtitle, panelTitle, panelText, children }) => (
  <section className='authPage'>
    <div className='container'>
      <div className='authShell'>
        <aside className='authPanel'>
          <div>
            <span className='authPanel__badge'>ClassyShop</span>
            <h2 className='mt-4 text-[28px] font-[800] leading-[36px] text-gray-900'>{panelTitle}</h2>
            <div className='mt-2 text-[14px] text-gray-600 leading-[22px] max-w-[320px]'>{panelText}</div>
          </div>
          <RotatingProducts />
          <ul className='flex flex-col gap-3'>
            <li className='authPerk'><FiPackage /> Track every order in one place</li>
            <li className='authPerk'><FiHeart /> Save favourites to your wishlist</li>
            <li className='authPerk'><FiTruck /> Faster checkout with saved addresses</li>
          </ul>
        </aside>

        <div className='authForm'>
          <div className='w-full max-w-[380px] mx-auto'>
            <h1 className='text-[26px] font-[800] text-gray-900 leading-tight'>{title}</h1>
            {subtitle && <div className='mt-1.5 text-[14px] text-gray-500'>{subtitle}</div>}
            <div className='mt-7'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export const AuthField = ({ label, right, children }) => (
  <label className='block'>
    <span className='flex items-center justify-between mb-1.5'>
      <span className='text-[13px] font-[600] text-gray-800'>{label}</span>
      {right}
    </span>
    {children}
  </label>
)

export const GoogleButton = ({ onClick, loading, children = 'Continue with Google' }) => (
  <button type='button' onClick={onClick} disabled={loading} className='authGoogle'>
    {loading ? <CircularProgress size={18} color='inherit' /> : <FcGoogle className='text-[20px]' />}
    {children}
  </button>
)

export const AuthDivider = () => (
  <div className='authDivider'><span>or</span></div>
)

export const AuthSwitch = ({ text, to, cta }) => (
  <div className='mt-6 text-center text-[13px] text-gray-600'>
    {text} <Link to={to} className='font-[700] text-primary hover:underline'>{cta}</Link>
  </div>
)

export default AuthLayout
