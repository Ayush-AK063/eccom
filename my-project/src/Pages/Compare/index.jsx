import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { IoClose, IoGitCompareOutline } from 'react-icons/io5';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { useCompare, MAX_COMPARE } from '../../context/CompareContext';
import { getData } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import AddToCart from '../../components/AddToCart';
import WishlistButton from '../../components/WishlistButton';
import './style.css';

const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter((x) => x && x !== 'null');
const joinOr = (v) => (list(v).length ? list(v).join(', ') : null);

// Table ki rows — har row ka value + optional "best" logic
const ROWS = [
    { key: 'price', label: 'Price', value: (p) => p.price, render: (p) => <span className='text-[16px] font-[700] text-gray-900'>{formatPrice(p.price)}</span>, best: 'min' },
    { key: 'oldprice', label: 'MRP', value: (p) => (p.oldprice > p.price ? p.oldprice : null), render: (p) => (p.oldprice > p.price ? <span className='text-gray-400 line-through'>{formatPrice(p.oldprice)}</span> : null) },
    { key: 'discount', label: 'Discount', value: (p) => p.discount || null, render: (p) => (p.discount ? <span className='cmpPill cmpPill--red'>{p.discount}% off</span> : null), best: 'max' },
    { key: 'rating', label: 'Rating', value: (p) => p.rating || null, render: (p) => (p.rating ? <span className='flex items-center gap-1.5'><Rating value={p.rating} readOnly size='small' precision={0.5} /><span className='text-[13px] text-gray-600'>{Number(p.rating).toFixed(1)}</span></span> : null), best: 'max' },
    { key: 'brand', label: 'Brand', value: (p) => p.brand || null },
    { key: 'category', label: 'Category', value: (p) => [p.catName, p.subCat].filter(Boolean).join(' › ') || null },
    { key: 'stock', label: 'Availability', value: (p) => (p.countInStock > 0 ? 'in' : 'out'), render: (p) => (p.countInStock > 0
        ? <span className='flex items-center gap-1 text-[#15803d] font-[500]'><FiCheck /> In stock</span>
        : <span className='flex items-center gap-1 text-gray-400 font-[500]'><FiX /> Out of stock</span>) },
    { key: 'size', label: 'Size', value: (p) => joinOr(p.size), render: (p) => chips(p.size) },
    { key: 'productRam', label: 'RAM', value: (p) => joinOr(p.productRam), render: (p) => chips(p.productRam) },
    { key: 'productWeight', label: 'Weight', value: (p) => joinOr(p.productWeight), render: (p) => chips(p.productWeight) },
    { key: 'description', label: 'Description', value: (p) => p.description || null, render: (p) => (p.description ? <div className='text-[13px] text-gray-600 leading-[20px] line-clamp-4'>{p.description}</div> : null) },
];

function chips(v) {
    const items = list(v);
    if (!items.length) return null;
    return <div className='flex flex-wrap gap-1.5'>{items.map((x) => <span key={x} className='cmpPill'>{x}</span>)}</div>;
}

const Compare = () => {
    const { compareItems, removeFromCompare, clearCompare, refreshItems } = useCompare();
    const [onlyDiff, setOnlyDiff] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Latest price / stock server se lao (snapshot purana ho sakta hai)
    const idsKey = compareItems.map((p) => p._id).join(',');
    useEffect(() => {
        if (!idsKey) return;
        let alive = true;
        setLoading(true);
        Promise.all(idsKey.split(',').map((id) => getData(`/api/product/getproduct/${id}`)))
            .then((results) => {
                if (!alive) return;
                const fresh = results.map((r) => r?.product).filter(Boolean);
                if (fresh.length) refreshItems(fresh);
            })
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
        // sirf ids badalne par
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey]);

    const rows = useMemo(() => {
        return ROWS
            .map((row) => {
                const values = compareItems.map((p) => row.value(p));
                if (values.every((v) => v === null || v === undefined || v === '')) return null; // khali row mat dikhao
                const same = values.every((v) => String(v) === String(values[0]));
                let bestIdx = [];
                if (row.best && compareItems.length > 1 && !same) {
                    const nums = values.map((v) => (typeof v === 'number' ? v : null));
                    const valid = nums.filter((n) => n !== null);
                    if (valid.length) {
                        const target = row.best === 'min' ? Math.min(...valid) : Math.max(...valid);
                        bestIdx = nums.map((n, i) => (n === target ? i : -1)).filter((i) => i >= 0);
                    }
                }
                return { ...row, same, bestIdx };
            })
            .filter(Boolean)
            .filter((row) => !onlyDiff || !row.same);
    }, [compareItems, onlyDiff]);

    const emptySlots = Math.max(0, Math.min(MAX_COMPARE, Math.max(compareItems.length + 1, 2)) - compareItems.length);
    const addLink = compareItems[0]?.catId ? `/productListing?catId=${compareItems[0].catId}` : '/productListing';
    const cols = compareItems.length + emptySlots;

    if (!compareItems.length) {
        return (
            <section className='py-20 bg-white'>
                <div className='container flex flex-col items-center text-center'>
                    <div className='w-[88px] h-[88px] rounded-full bg-[#fff1f0] flex items-center justify-center text-primary text-[38px]'>
                        <IoGitCompareOutline />
                    </div>
                    <h1 className='mt-5 text-[24px] font-[700] text-gray-900'>Nothing to compare yet</h1>
                    <div className='mt-2 text-[14px] leading-[22px] text-gray-500 max-w-[420px]'>
                        Tap the compare icon on any product to add it here. You can compare up to {MAX_COMPARE} products from the same category side by side.
                    </div>
                    <Link to='/productListing' className='mt-6 inline-flex items-center h-[44px] px-6 rounded-md bg-primary text-white text-[14px] font-[600] hover:bg-[#e64545] transition-colors'>
                        Browse products
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className='py-8 bg-white comparePage'>
            <div className='container'>
                {/* Breadcrumb + header */}
                <nav className='text-[12px] text-gray-500 mb-3'>
                    <Link to='/' className='hover:text-primary'>Home</Link>
                    <span className='mx-1.5'>/</span>
                    <span className='text-gray-900'>Compare</span>
                </nav>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5'>
                    <h1 className='text-[24px] font-[700] text-gray-900 leading-tight'>Compare products</h1>
                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            role='switch'
                            aria-checked={onlyDiff}
                            onClick={() => setOnlyDiff((v) => !v)}
                            className={`cmpDiffToggle ${onlyDiff ? 'is-on' : ''}`}
                        >
                            <span className='cmpDiffToggle__track'><span className='cmpDiffToggle__thumb' /></span>
                            <span className='cmpDiffToggle__label'>Show only differences</span>
                        </button>
                        <button type='button' onClick={clearCompare} className='cmpClear'>
                            <IoClose className='text-[15px]' /> Clear all
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className='cmpScroll'>
                    <table className='cmpTable' style={{ '--cols': cols }}>
                        <thead>
                            <tr>
                                <th className='cmpLabel cmpLabel--head' scope='col'>
                                    {/* Summary + controls — upar-left ki khali jagah ka sahi use */}
                                    <div className='cmpSummary'>
                                        <div>
                                            <span className='cmpSummary__icon'><IoGitCompareOutline /></span>
                                            <div className='mt-3 text-[16px] font-[700] text-gray-900 leading-[22px]'>
                                                {compareItems.length} {compareItems.length === 1 ? 'Product' : 'Products'}
                                            </div>
                                            <div className='text-[12px] font-[500] text-gray-500 leading-[18px] normal-case'>
                                                {compareItems[0]?.catName ? `in ${compareItems[0].catName}` : 'selected'}
                                                {loading && <span className='text-gray-400'> · updating…</span>}
                                            </div>
                                        </div>

                                    </div>
                                </th>
                                {compareItems.map((p) => (
                                    <th key={p._id} scope='col' className='cmpProduct'>
                                        <div className='relative'>
                                            <button className='cmpRemove' aria-label={`Remove ${p.name}`} onClick={() => removeFromCompare(p._id)}>
                                                <IoClose />
                                            </button>
                                            <div className='absolute top-2 left-2 z-10 cmpWish'><WishlistButton product={p} /></div>
                                            <Link to={`/product/${p._id}`} className='cmpImg'>
                                                <img src={p.images?.[0]} alt={p.name} />
                                            </Link>
                                        </div>
                                        <span className='block mt-3 text-[11px] font-[600] uppercase tracking-[0.08em] text-gray-400 truncate'>{p.brand || 'Generic'}</span>
                                        <Link to={`/product/${p._id}`} className='block mt-1 text-[14px] font-[600] text-gray-900 leading-[20px] line-clamp-2 min-h-[40px] hover:text-primary'>
                                            {p.name}
                                        </Link>
                                        <div className='mt-3'>
                                            <AddToCart product={p} compact className='w-full' />
                                        </div>
                                    </th>
                                ))}
                                {Array.from({ length: emptySlots }).map((_, i) => (
                                    <th key={`add-${i}`} scope='col' className='cmpProduct'>
                                        <Link to={addLink} className='cmpAdd'>
                                            <span className='cmpAdd__icon'><FiPlus /></span>
                                            <span className='text-[13px] font-[600]'>Add a product</span>
                                            <span className='text-[11px] text-gray-400 font-[400]'>{MAX_COMPARE - compareItems.length} more allowed</span>
                                        </Link>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={cols + 1} className='py-10 text-center text-[13px] text-gray-500'>
                                        These products are identical on every attribute.
                                    </td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr key={row.key} className={row.same && compareItems.length > 1 ? 'is-same' : ''}>
                                    <th scope='row' className='cmpLabel'>{row.label}</th>
                                    {compareItems.map((p, i) => {
                                        const content = row.render ? row.render(p) : row.value(p);
                                        const isBest = row.bestIdx.includes(i);
                                        return (
                                            <td key={p._id} className={isBest ? 'is-best' : ''}>
                                                {content ?? <span className='text-gray-300'>—</span>}
                                                {isBest && (
                                                    <span className='cmpBest'>
                                                        {row.key === 'price' ? 'Lowest price' : row.key === 'rating' ? 'Top rated' : 'Best deal'}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-${i}`} />)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default Compare;
