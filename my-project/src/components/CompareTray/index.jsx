import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoClose, IoGitCompareOutline } from 'react-icons/io5';
import { FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';
import { useCompare, MAX_COMPARE } from '../../context/CompareContext';
import { formatPrice } from '../../utils/formatPrice';
import './style.css';

// Neeche fixed bar: chune gaye products + "Compare now"
const CompareTray = () => {
    const { compareItems, compareCount, removeFromCompare, clearCompare, trayOpen, setTrayOpen } = useCompare();
    const { pathname } = useLocation();

    if (!compareCount || pathname === '/compare') return null;

    const slots = Array.from({ length: MAX_COMPARE }, (_, i) => compareItems[i] || null);
    const canCompare = compareCount >= 2;

    return (
        <>
        {/* footer tray ke peeche na chhupe */}
        {trayOpen && <div aria-hidden className='h-[96px]' />}
        <div className={`compareTray ${trayOpen ? 'is-open' : 'is-collapsed'}`} role='region' aria-label='Compare products'>
            {/* collapse handle */}
            <button className='compareTray__handle' onClick={() => setTrayOpen(!trayOpen)} aria-expanded={trayOpen}>
                <IoGitCompareOutline className='text-[15px]' />
                Compare ({compareCount})
                {trayOpen ? <FiChevronDown /> : <FiChevronUp />}
            </button>

            <div className='compareTray__body'>
                <div className='container flex items-center gap-5 py-3'>
                    <div className='hidden lg:block shrink-0 w-[170px]'>
                        <div className='text-[15px] font-[700] text-gray-900 leading-tight'>Compare products</div>
                        <div className='text-[12px] text-gray-500 leading-tight mt-1'>{compareCount} of {MAX_COMPARE} selected</div>
                    </div>

                    <ul className='flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0'>
                        {slots.map((p, i) => (
                            <li key={p?._id || `empty-${i}`} className={`compareSlot ${p ? '' : 'is-empty'} ${i >= 2 ? 'hidden md:flex' : 'flex'}`}>
                                {p ? (
                                    <>
                                        <Link to={`/product/${p._id}`} className='compareSlot__img'>
                                            <img src={p.images?.[0]} alt={p.name} />
                                        </Link>
                                        <div className='compareSlot__text'>
                                            <span className='compareSlot__brand'>{p.brand || p.catName || 'Generic'}</span>
                                            <Link to={`/product/${p._id}`} className='compareSlot__name' title={p.name}>{p.name}</Link>
                                            <span className='compareSlot__price'>{formatPrice(p.price)}</span>
                                        </div>
                                        <button className='compareSlot__remove' aria-label={`Remove ${p.name}`} onClick={() => removeFromCompare(p._id)}>
                                            <IoClose />
                                        </button>
                                    </>
                                ) : (
                                    <Link to={compareItems[0]?.catId ? `/productListing?catId=${compareItems[0].catId}` : '/productListing'}
                                        className='flex items-center gap-2 w-full justify-center text-[12px] font-[500] text-gray-400 hover:text-primary'>
                                        <FiPlus /> Add product
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className='shrink-0 flex flex-col items-stretch gap-1.5'>
                        <Link
                            to='/compare'
                            aria-disabled={!canCompare}
                            onClick={(e) => !canCompare && e.preventDefault()}
                            className={`compareTray__cta ${canCompare ? '' : 'is-disabled'}`}
                        >
                            Compare now
                        </Link>
                        <button onClick={clearCompare} className='text-[12px] font-[500] text-gray-500 hover:text-gray-900'>
                            Clear all
                        </button>
                    </div>
                </div>
                {!canCompare && (
                    <div className='container pb-2 -mt-1 text-[11px] leading-tight text-gray-500'>Add at least one more product to compare.</div>
                )}
            </div>
        </div>
        </>
    );
};

export default CompareTray;
