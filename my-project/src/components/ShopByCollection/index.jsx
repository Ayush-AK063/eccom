import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { MyContext } from '../../App';
import './style.css';

// Collections: naam -> category. Category na mile to wo tile nahi dikhti.
// Naya collection: yahan ek entry + public/collections/<img>.webp
const COLLECTIONS = [
    { title: 'Everyday Carry', tag: 'Bags', text: 'Totes, backpacks & handbags for every day', category: 'Bags', img: '/collections/everyday.webp', featured: true },
    { title: 'Summer Shades', tag: 'Sunglasses', text: 'UV-protected frames', category: 'Sunglasses', img: '/collections/shades.webp' },
    { title: 'Statement Jewellery', tag: 'Jewellery', text: 'Earrings that stand out', category: 'Jewellery', img: '/collections/jewellery.webp' },
    { title: 'Step Out in Style', tag: 'Footwear', text: 'Heels, sneakers & slides', category: 'Footwear', img: '/collections/footwear.webp' },
    { title: 'Timeless Watches', tag: 'Watches', text: 'Classic everyday timepieces', category: 'Watches', img: '/collections/watches.webp' },
];

const ShopByCollection = () => {
    const { catData = [] } = useContext(MyContext) || {};

    const items = COLLECTIONS
        .map((c) => ({ ...c, cat: catData.find((x) => x?.name?.toLowerCase() === c.category.toLowerCase()) }))
        .filter((c) => c.cat);

    if (items.length < 2) return null;

    return (
        <section className='pt-6 pb-4 bg-white'>
            <div className='container'>
                <div className='mb-4'>
                    <h2 className='text-[20px] font-[700] text-gray-900 leading-tight'>Shop by Collection</h2>
                    <div className='text-[13px] text-gray-500 mt-1'>Curated edits for every style</div>
                </div>

                <div className={`collectionGrid ${items.length >= 5 ? 'is-bento' : ''}`}>
                    {items.map((c, i) => (
                        <Link
                            key={c.title}
                            to={`/productListing?catId=${c.cat._id}`}
                            className={`collectionTile group ${i === 0 && items.length >= 5 ? 'is-featured' : ''}`}
                        >
                            <img src={c.img} alt={c.title} loading='lazy' className='collectionTile__img' />
                            <div className='collectionTile__body'>
                                <span className='collectionTile__tag'>{c.tag}</span>
                                <h3 className='collectionTile__title'>{c.title}</h3>
                                <span className='collectionTile__text'>{c.text}</span>
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
