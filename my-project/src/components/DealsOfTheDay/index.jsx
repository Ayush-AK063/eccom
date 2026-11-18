import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { postData } from '../../utils/api';
import ProductItem from '../ProductItem';

// Aaj raat 12 baje tak ka countdown (roz reset)
const msToMidnight = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return end - now;
};

const useCountdown = () => {
    const [left, setLeft] = useState(msToMidnight);
    useEffect(() => {
        const t = setInterval(() => setLeft(msToMidnight()), 1000);
        return () => clearInterval(t);
    }, []);
    const s = Math.floor(left / 1000);
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0'));
};

const TimeBox = ({ value, label }) => (
    <span className='flex flex-col items-center'>
        <span className='min-w-[38px] h-[34px] px-1 rounded-md bg-white text-gray-900 text-[16px] font-[700] flex items-center justify-center tabular-nums'>
            {value}
        </span>
        <span className='mt-1 text-[10px] font-[500] uppercase tracking-wider text-white/70'>{label}</span>
    </span>
);

// Sabse zyada discount wale products — admin ko alag se kuch set nahi karna
const DealsOfTheDay = () => {
    const [products, setProducts] = useState([]);
    const [h, m, s] = useCountdown();

    useEffect(() => {
        postData('/api/product/filters', { sortBy: 'discount', order: 'desc', limit: 12, availability: [] })
            .then((res) => setProducts((res?.products || []).filter((p) => p.discount > 0)));
    }, []);

    if (!products.length) return null;

    return (
        <section className='pt-6 pb-4 bg-white'>
            <div className='container'>
                <div className='dealsHead mb-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                        <span className='dealsHead__icon'><FiClock /></span>
                        <div className='min-w-0'>
                            <h2 className='text-[20px] font-[700] text-white leading-tight'>Today's Best Deals</h2>
                            <div className='text-[13px] text-white/80 leading-[18px] mt-0.5'>Biggest discounts of the day — grab them before they're gone</div>
                        </div>
                    </div>
                    <div className='flex items-center gap-5'>
                        <div className='flex items-start gap-1.5' aria-label={`Ends in ${h} hours ${m} minutes ${s} seconds`}>
                            <span className='hidden sm:block self-center mr-1 text-[12px] font-[600] text-white/80'>Ends in</span>
                            <TimeBox value={h} label='hrs' />
                            <span className='text-white font-[700] mt-1.5'>:</span>
                            <TimeBox value={m} label='min' />
                            <span className='text-white font-[700] mt-1.5'>:</span>
                            <TimeBox value={s} label='sec' />
                        </div>
                        <Link to='/productListing' className='hidden md:inline-flex items-center gap-1.5 text-[13px] font-[600] text-white hover:underline whitespace-nowrap'>
                            View all <FiArrowRight />
                        </Link>
                    </div>
                </div>
                {/* 2 row ka grid — har screen pe columns ke hisaab se extra cards CSS se chhupte hain */}
                <div className='dealsGrid'>
                    {products.map((item) => (
                        <ProductItem key={item._id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DealsOfTheDay;
