import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { MyContext } from '../../App';
import './style.css';
import { collectionHref } from '../../utils/storeSettings';

// Admin → Store Settings → Home page → Collections (category ya koi bhi link)
const ShopByCollection = ({ items: list = [], title, subtitle }) => {
    const { catData = [] } = useContext(MyContext) || {};
    const items = list
        .map((c) => {
            // Category wali tile tabhi jab category abhi bhi store pe hai
            if ((c.mode || (c.catId ? 'category' : 'link')) === 'category' && !catData.some((x) => x._id === c.catId)) return null;
            const to = collectionHref(c);
            return to ? { ...c, to } : null;
        })
        .filter(Boolean);

    if (!items.length) return null;

    return (
        <section className='pt-6 pb-4 bg-white'>
            <div className='container'>
                {(title || subtitle) && (
                    <div className='mb-4'>
                        {title && <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>{title}</h2>}
                        {subtitle && <div className='text-[13px] text-gray-500 mt-1'>{subtitle}</div>}
                    </div>
                )}

                <div className={`collectionGrid ${items.length >= 5 ? 'is-bento' : ''}`}>
                    {items.map((c, i) => (
                        <Link
                            key={c.title + i}
                            to={c.to}
                            className={`collectionTile group ${i === 0 && items.length >= 5 ? 'is-featured' : ''}`}
                        >
                            <img src={c.image} alt={c.title} loading='lazy' className='collectionTile__img' />
                            <div className='collectionTile__body'>
                                {c.tag && <span className='collectionTile__tag'>{c.tag}</span>}
                                <h3 className='collectionTile__title'>{c.title}</h3>
                                {c.text && <span className='collectionTile__text'>{c.text}</span>}
                                <span className='collectionTile__cta'>
                                    Explore <FiArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShopByCollection;
