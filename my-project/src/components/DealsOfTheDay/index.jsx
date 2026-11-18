import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { postData } from '../../utils/api';
import ProductItem from '../ProductItem';
import { istToday, msToIstMidnight } from '../../utils/storeSettings';

// Timer: "daily" = aaj raat 12 baje tak, "date" = admin ki di hui tareekh tak, "off" = nahi
const msLeft = (timer, endsAt) => {
    if (timer === 'date') return endsAt ? new Date(endsAt) - new Date() : 0;
    return msToIstMidnight();
};

const useCountdown = (timer, endsAt) => {
    const [left, setLeft] = useState(() => msLeft(timer, endsAt));
    useEffect(() => {
        setLeft(msLeft(timer, endsAt));
        const t = setInterval(() => setLeft(msLeft(timer, endsAt)), 1000);
        return () => clearInterval(t);
    }, [timer, endsAt]);
    const s = Math.max(0, Math.floor(left / 1000));
    const d = Math.floor(s / 86400);
    return { ended: left <= 0, d, parts: [Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')) };
};

const TimeBox = ({ value, label }) => (
    <span className='flex flex-col items-center'>
        <span className='min-w-[38px] h-[34px] px-1 rounded-md bg-white text-gray-900 text-[16px] font-[700] flex items-center justify-center tabular-nums'>
            {value}
        </span>
        <span className='mt-1 text-[10px] font-[500] uppercase tracking-wider text-white/70'>{label}</span>
    </span>
);

// Admin → Store Settings → Home page → Today's Best Deals
const DealsOfTheDay = ({ config = {}, title, subtitle }) => {
    const [products, setProducts] = useState([]);
    const { minDiscount = 0, limit = 12, viewAllUrl = '/productListing', schedule = [], emptyDay = 'discount' } = config;
    // Calendar: aaj (India date) ke products; aaj kuch set nahi to emptyDay
    const today = istToday();
    const todays = config.source === 'schedule' ? schedule.find((x) => x.date === today) : null;
    const source = config.source === 'schedule' ? (todays ? 'manual' : emptyDay === 'hide' ? 'none' : 'discount') : config.source || 'discount';
    const productIds = todays ? todays.productIds : config.productIds || [];
    const timer = config.source === 'schedule' ? 'daily' : config.timer || 'daily';
    const endsAt = config.endsAt;
    const { ended, d, parts: [h, m, s] } = useCountdown(timer, endsAt);
    const ids = productIds.join(',');
    // Countdown har second render karta hai → raat 12 baje `today` badlega aur products dobara aayenge

    useEffect(() => {
        const body = { limit, availability: ['inStock'] };
        if (source === 'none') return setProducts([]);
        if (source === 'manual') { if (!productIds.length) return setProducts([]); body.ids = productIds; }
        else if (source === 'flag') body.flag = 'deal';
        else Object.assign(body, { sortBy: 'discount', order: 'desc', minDiscount: Math.max(1, minDiscount) });
        postData('/api/product/filters', body).then((res) => {
            let list = (res?.products || []).filter((p) => source !== 'discount' || p.discount > 0);
            if (source === 'manual') list = productIds.map((id) => list.find((p) => p._id === id)).filter(Boolean);
            setProducts(list);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, minDiscount, ids, limit, today]);

    // Tareekh wala sale khatam → section chhupao
    if (!products.length || (timer === 'date' && ended)) return null;

    return (
        <section className='pt-6 pb-4 bg-white'>
            <div className='container'>
                <div className='dealsHead mb-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                        <span className='dealsHead__icon'><FiClock /></span>
                        <div className='min-w-0'>
                            {title && <h2 className='text-[20px] font-[700] text-white leading-tight'>{title}</h2>}
                            {subtitle && <div className='text-[13px] text-white/80 leading-[18px] mt-0.5'>{subtitle}</div>}
                        </div>
                    </div>
                    <div className='flex items-center gap-5'>
                        {timer !== 'off' && (
                            <div className='flex items-start gap-1.5' aria-label={`Ends in ${d ? `${d} days ` : ''}${h} hours ${m} minutes ${s} seconds`}>
                                <span className='hidden sm:block self-center mr-1 text-[12px] font-[600] text-white/80'>Ends in</span>
                                {d > 0 && <><TimeBox value={d} label='days' /><span className='text-white font-[700] mt-1.5'>:</span></>}
                                <TimeBox value={h} label='hrs' />
                                <span className='text-white font-[700] mt-1.5'>:</span>
                                <TimeBox value={m} label='min' />
                                <span className='text-white font-[700] mt-1.5'>:</span>
                                <TimeBox value={s} label='sec' />
                            </div>
                        )}
                        {viewAllUrl && (
                            <Link to={viewAllUrl} className='hidden md:inline-flex items-center gap-1.5 text-[13px] font-[600] text-white hover:underline whitespace-nowrap'>
                                View all <FiArrowRight />
                            </Link>
                        )}
                    </div>
                </div>
                <div className='dealsGrid'>
                    {products.map((item) => <ProductItem key={item._id} item={item} />)}
                </div>
            </div>
        </section>
    );
};

export default DealsOfTheDay;
