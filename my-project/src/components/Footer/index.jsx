import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import { LiaShippingFastSolid, LiaGiftSolid, LiaMoneyBillWaveSolid } from "react-icons/lia";
import { PiKeyReturn } from "react-icons/pi";
import { BsShieldCheck } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { FiStar, FiTag, FiClock, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { PiLeaf } from "react-icons/pi";
import { FaFacebookF, FaPinterestP, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { MyContext } from '../../App';
import CartPanel from '../CartPanel';
import { getData, postData } from '../../utils/api';

// Admin → Settings → Footer ke icon names
const ICONS = {
    truck: LiaShippingFastSolid, return: PiKeyReturn, shield: BsShieldCheck, gift: LiaGiftSolid,
    support: BiSupport, cash: LiaMoneyBillWaveSolid, star: FiStar, tag: FiTag, clock: FiClock, leaf: PiLeaf,
};
const SOCIAL = [
    ['facebook', FaFacebookF, 'Facebook'], ['instagram', FaInstagram, 'Instagram'], ['youtube', AiOutlineYoutube, 'YouTube'],
    ['pinterest', FaPinterestP, 'Pinterest'], ['twitter', FaXTwitter, 'X'], ['linkedin', FaLinkedinIn, 'LinkedIn'],
];

const Footer = () => {
    const context = useContext(MyContext);
    const [pages, setPages] = useState([]);
    useEffect(() => { getData('/api/page').then((res) => setPages(res?.data || [])); }, []);
    const inGroup = (g) => pages.filter((p) => p.footerGroup === g);
    const { general = {}, contact = {}, social = {}, footer = {} } = context.settings || {};
    const cats = (context.catData || []).slice(0, 6);
    const socials = SOCIAL.filter(([k]) => social[k]);
    const hasContact = contact.address || contact.email || contact.phone || contact.whatsapp;
    const copyright = footer.copyright || `© ${new Date().getFullYear()} ${general.storeName || 'Store'}. All rights reserved.`;
    const account = context.isLogin
        ? [['/my-orders', 'My orders'], ['/my-account', 'My account']]
        : [['/login', 'Login / Register']];

    return (
        <>
            <footer className='py-6 bg-[#fafafa]'>
                <div className='container'>
                    {footer.features?.length > 0 && (
                        <>
                            <div className='grid grid-cols-2 md:grid-cols-3 lg:flex lg:justify-center gap-5 py-8'>
                                {footer.features.map((f, i) => {
                                    const Icon = ICONS[f.icon] || FiStar;
                                    return (
                                        <div key={i} className='flex flex-col items-center justify-center text-center group lg:w-[16%]'>
                                            <Icon className='text-[40px] transition-all duration-300 group-hover:-translate-y-1 group-hover:text-primary' />
                                            <h3 className='text-[16px] font-[600] mt-3'>{f.title}</h3>
                                            {f.text && <p className='text-[12px] font-[500] text-gray-600'>{f.text}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                            <hr />
                        </>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr] gap-8 py-12'>
                        <div>
                            <h2 className='text-[18px] font-[700] mb-3'>{general.storeName || 'About us'}</h2>
                            {(footer.about || general.tagline) && <p className='text-[13px] text-gray-600 mb-4 leading-[20px]'>{footer.about || general.tagline}</p>}
                            {hasContact && (
                                <ul className='flex flex-col gap-2 text-[13px] text-gray-700'>
                                    {contact.address && <li className='flex gap-2'><FiMapPin className='mt-0.5 shrink-0 text-gray-400' /><span className='whitespace-pre-line'>{contact.address}</span></li>}
                                    {contact.email && <li className='flex gap-2 items-center'><FiMail className='shrink-0 text-gray-400' /><a href={`mailto:${contact.email}`} className='link'>{contact.email}</a></li>}
                                    {contact.phone && <li className='flex gap-2 items-center'><FiPhone className='shrink-0 text-gray-400' /><a href={`tel:${contact.phone.replace(/\s/g, '')}`} className='link font-[600]'>{contact.phone}</a></li>}
                                    {contact.whatsapp && <li className='flex gap-2 items-center'><FaWhatsapp className='shrink-0 text-[#16a34a]' /><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target='_blank' rel='noreferrer' className='link'>Chat on WhatsApp</a></li>}
                                    {contact.hours && <li className='flex gap-2 items-center'><FiClock className='shrink-0 text-gray-400' />{contact.hours}</li>}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h2 className='text-[16px] font-[700] mb-4'>Shop</h2>
                            <ul className='flex flex-col gap-2.5 text-[14px]'>
                                <li><Link to='/productListing' className='link'>All products</Link></li>
                                {cats.map((c) => <li key={c._id}><Link to={`/productListing?catId=${c._id}`} className='link'>{c.name}</Link></li>)}
                            </ul>
                        </div>

                        <div>
                            <h2 className='text-[16px] font-[700] mb-4'>Help & info</h2>
                            <ul className='flex flex-col gap-2.5 text-[14px]'>
                                {[...inGroup('help'), ...inGroup('company')].map((p) => <li key={p._id}><Link to={`/page/${p.slug}`} className='link'>{p.title}</Link></li>)}
                                <li><Link to='/blog' className='link'>Blog</Link></li>
                                {account.map(([to, label]) => <li key={to}><Link to={to} className='link'>{label}</Link></li>)}
                            </ul>
                        </div>

                        {footer.newsletterEnabled !== false && (
                            <div>
                                <h2 className='text-[16px] font-[700] mb-3'>Newsletter</h2>
                                {footer.newsletterText && <p className='text-[13px] text-gray-600'>{footer.newsletterText}</p>}
                                <form className='mt-4 flex gap-2' onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const res = await postData('/api/settings/subscribe', { email: form.email.value });
                                    context.openAlertBox(res?.error === false ? 'success' : 'error', res?.message || 'Could not subscribe');
                                    if (res?.error === false) form.reset();
                                }}>
                                    <input type='email' name='email' required className='flex-1 min-w-0 h-[42px] border border-gray-200 bg-white outline-none focus:border-gray-900 px-3 rounded-md text-[14px]' placeholder='Your email address' />
                                    <button className='h-[42px] px-4 rounded-md bg-[#111827] hover:bg-primary text-white text-[13px] font-[600]'>Subscribe</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </footer>

            <div className='border-t border-gray-100 py-3 bg-white'>
                <div className='container flex flex-wrap items-center justify-between gap-3'>
                    <ul className='flex items-center gap-2'>
                        {socials.map(([k, Icon, label]) => (
                            <li key={k} className='list-none'>
                                <a href={social[k]} target='_blank' rel='noreferrer' aria-label={label}
                                    className='group w-[35px] h-[35px] border border-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-all'>
                                    <Icon className='text-[15px] group-hover:text-white' />
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className='flex flex-col items-center gap-1'>
                        <p className='text-[13px] text-gray-600 mb-0'>{copyright}</p>
                        {inGroup('legal').length > 0 && (
                            <div className='flex flex-wrap justify-center gap-x-3 gap-y-1 text-[12px]'>
                                {inGroup('legal').map((p) => <Link key={p._id} to={`/page/${p.slug}`} className='text-gray-500 hover:text-primary'>{p.title}</Link>)}
                            </div>
                        )}
                    </div>
                    <span className='text-[12px] text-gray-400'>{context.settings?.checkout?.codEnabled !== false ? 'Cash on Delivery available' : ''}</span>
                </div>
            </div>

            <Drawer open={context.openCartPanel} onClose={context.toggleCartPanel(false)} anchor={"right"} className='cartPanel'>
                <CartPanel />
            </Drawer>
        </>
    )
}

export default Footer
