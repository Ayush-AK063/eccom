import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// Compare list browser (localStorage) mein rehti hai — login ki zarurat nahi,
// refresh / naye tab ke baad bhi bachi rehti hai. Max 4 products, ek hi category ke.
export const MAX_COMPARE = 4;
const STORAGE_KEY = 'compareList:v1';

const CompareContext = createContext(null);

// Sirf zaroori fields save karo (pura product nahi)
const snapshot = (p) => ({
    _id: p?._id,
    name: p?.name,
    brand: p?.brand,
    images: (p?.images || []).slice(0, 2),
    price: p?.price,
    oldprice: p?.oldprice,
    discount: p?.discount,
    rating: p?.rating,
    catId: p?.catId,
    catName: p?.catName,
    subCat: p?.subCat,
    countInStock: p?.countInStock,
    size: p?.size,
    productRam: p?.productRam,
    productWeight: p?.productWeight,
    description: p?.description,
});

const readStorage = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter((p) => p?._id).slice(0, MAX_COMPARE) : [];
    } catch {
        return [];
    }
};

export const CompareProvider = ({ children }) => {
    const [items, setItems] = useState(readStorage);
    const [trayOpen, setTrayOpen] = useState(true);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* private mode */ }
    }, [items]);

    // Doosre tab mein badlav ho to yahan bhi sync
    useEffect(() => {
        const onStorage = (e) => { if (e.key === STORAGE_KEY) setItems(readStorage()); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const isInCompare = useCallback((id) => items.some((p) => String(p._id) === String(id)), [items]);

    const removeFromCompare = useCallback((id) => {
        setItems((prev) => prev.filter((p) => String(p._id) !== String(id)));
    }, []);

    const clearCompare = useCallback(() => setItems([]), []);

    const addToCompare = useCallback((product) => {
        if (!product?._id) return false;
        if (isInCompare(product._id)) return true;

        if (items.length >= MAX_COMPARE) {
            toast.error(`You can compare up to ${MAX_COMPARE} products. Remove one to add another.`);
            return false;
        }
        const first = items[0];
        if (first && first.catId && product.catId && String(first.catId) !== String(product.catId)) {
            toast.error(`Only products from the same category can be compared (${first.catName || 'current list'}).`);
            return false;
        }
        setItems((prev) => [...prev, snapshot(product)]);
        setTrayOpen(true);
        toast.success('Added to compare');
        return true;
    }, [items, isInCompare]);

    const toggleCompare = useCallback((product) => {
        if (isInCompare(product?._id)) {
            removeFromCompare(product._id);
            return false;
        }
        return addToCompare(product);
    }, [isInCompare, removeFromCompare, addToCompare]);

    // Compare page fresh data laaye to snapshot update
    const refreshItems = useCallback((fresh) => {
        setItems((prev) => prev
            .map((p) => {
                const f = fresh.find((x) => String(x?._id) === String(p._id));
                return f ? snapshot(f) : p;
            }));
    }, []);

    const value = useMemo(() => ({
        compareItems: items,
        compareCount: items.length,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        refreshItems,
        trayOpen,
        setTrayOpen,
    }), [items, isInCompare, addToCompare, removeFromCompare, toggleCompare, clearCompare, refreshItems, trayOpen]);

    return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
    const ctx = useContext(CompareContext);
    if (!ctx) throw new Error('useCompare must be used inside <CompareProvider>');
    return ctx;
};
