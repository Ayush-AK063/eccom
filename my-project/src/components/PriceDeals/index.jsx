import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { postData } from '../../utils/api';

const TIERS = [
    { max: 99, bg: '#fff1f0', accent: '#ff5252' },
    { max: 299, bg: '#eef5ff', accent: '#2563eb' },
    { max: 499, bg: '#f1faf3', accent: '#15803d' },
    { max: 999, bg: '#f6f1ff', accent: '#7c3aed' },
];

// "Deals under ₹X" tiles — har tile us price tak ke products dikhata hai; khaali tile nahi dikhti
const PriceDeals = () => {
    const [tiers, setTiers] = useState([]);

    useEffect(() => {
        Promise.all(
            TIERS.map((t) =>
                postData('/api/product/filters', { maxPrice: t.max, sortBy: 'rating', order: 'desc', limit: 3 })
                    .then((res) => ({ ...t, products: res?.products || [], total: res?.total || 0 }))
            )
        ).then((all) => setTiers(all.filter((t) => t.total > 0)));
    }, []);

    if (!tiers.length) return null;

    return (
        <section className='pt-6 pb-4 bg-white'>
            <div className='container'>
                <div className='mb-4'>
                    <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>Shop by Budget</h2>
                    <div className='text-[13px] text-gray-500 mt-1'>Great finds at every price</div>
                </div>

                <div className={`grid grid-cols-2 gap-3 md:gap-4 ${tiers.length >= 4 ? 'lg:grid-cols-4' : tiers.length === 3 ? 'lg:grid-cols-3' : ''}`}>
                    {tiers.map((t) => (
                        <Link
                            key={t.max}
                            to={`/productListing?maxPrice=${t.max}`}
                            className='priceTile group'
                            style={{ background: t.bg }}
                        >
                            <div className='flex items-start justify-between gap-2'>
                                <div>
                                    <div className='text-[12px] font-[600] uppercase tracking-wider' style={{ color: t.accent }}>Deals under</div>
                                    <div className='text-[30px] md:text-[34px] font-[800] text-gray-900 leading-none mt-1'>₹{t.max}</div>
                                </div>
                                <span className='text-[12px] font-[500] text-gray-500 whitespace-nowrap mt-0.5'>{t.total} {t.total === 1 ? 'item' : 'items'}</span>
                            </div>

                            <div className='priceTile__thumbs'>
                                {t.products.map((p) => (
                                    <span key={p._id} className='priceTile__thumb'>
                                        <img src={p.images?.[0]} alt={p.name} loading='lazy' />
                                    </span>
                                ))}
                            </div>

                            <span className='inline-flex items-center gap-1.5 text-[13px] font-[600]' style={{ color: t.accent }}>
                                Shop now <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PriceDeals;
