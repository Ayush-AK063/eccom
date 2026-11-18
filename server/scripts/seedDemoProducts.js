// Demo catalog: proper categories + alag-alag price/discount wale products — sab API se.
// Asli brand logo wale items (Rolex, IWC, Prada, Calvin Klein) jaan-boojh ke skip kiye hain.
// Same naam dobara nahi banta, to script dobara chalana safe hai.
// Run (server chalu ho): node scripts/seedDemoProducts.js
import 'dotenv/config';

const API = process.env.SEED_API_URL || `http://localhost:${process.env.PORT || 8000}/api`;
const UA = { 'User-Agent': 'Mozilla/5.0 (demo-seed)' };
let token = '';
const auth = () => ({ Authorization: `Bearer ${token}` });

async function json(res) {
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) throw new Error(`${res.url} -> ${res.status} ${body.message || ''}`);
    return body;
}

async function login() {
    const body = await json(await fetch(`${API}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, adminLogin: true }),
    }));
    token = body.data?.accessToken || body.accessToken;
}

async function upload(module, urls) {
    const form = new FormData();
    for (const [i, url] of urls.entries()) {
        const r = await fetch(encodeURI(url), { headers: UA });
        if (!r.ok) throw new Error(`Download fail ${url}`);
        const type = r.headers.get('content-type') || 'image/webp';
        form.append('images', new Blob([await r.arrayBuffer()], { type }), `${module}_${Date.now()}_${i}.webp`);
    }
    return (await json(await fetch(`${API}/${module}/upload-images`, { method: 'POST', headers: auth(), body: form }))).images;
}

const dj = async (cat) =>
    (await (await fetch(`https://dummyjson.com/products/category/${cat}?limit=0&select=title,images,thumbnail`, { headers: UA })).json()).products;

// [dummyjson index, name, brand, price, mrp, rating, stock, flags, sizes]
const CATALOG = {
    Bags: {
        src: 'womens-bags', thumb: 0,
        items: [
            [0, 'Classic Blue Structured Handbag', 'Urbane', 899, 1999, 4.4, 25, ['featured'], []],
            [3, 'White Faux Leather Mini Backpack', 'Urbane', 649, 1299, 4.2, 40, ['latest'], []],
            [4, 'Black Everyday Tote Bag', 'Luxe Line', 1499, 2499, 4.6, 18, ['featured', 'latest'], []],
            [1, 'Tan Leather Shoulder Bag', 'Luxe Line', 1899, 3499, 4.5, 12, [], []],
        ],
    },
    Sunglasses: {
        src: 'sunglasses', thumb: 1,
        items: [
            [0, 'Matte Black Wayfarer Sunglasses', 'SunCraft', 279, 799, 4.1, 60, ['latest'], []],
            [1, 'Classic Tortoise Clubmaster Sunglasses', 'SunCraft', 449, 999, 4.5, 35, ['featured'], []],
            [2, 'Green Lens Aviator Sunglasses', 'SunCraft', 399, 1199, 4.3, 30, [], []],
            [4, 'Polarised Square Sunglasses', 'Shade Co.', 89, 299, 3.9, 80, ['latest'], []],
        ],
    },
    Watches: {
        src: 'womens-watches', thumb: 4,
        items: [
            [3, 'Gold Tone Bracelet Watch', 'Timeline', 1299, 2999, 4.4, 15, ['featured'], []],
            [4, 'Minimal Leather Strap Wrist Watch', 'Timeline', 799, 1599, 4.2, 22, ['latest'], []],
        ],
    },
    Footwear: {
        src: 'womens-shoes', thumb: 2,
        items: [
            [0, 'Comfort Slide Slippers', 'StepUp', 249, 599, 4.0, 70, ['latest'], ['6', '7', '8', '9']],
            [2, 'Metallic Gold Pointed Heels', 'StepUp', 1199, 2299, 4.3, 14, ['featured'], ['5', '6', '7', '8']],
            [3, 'Casual Everyday Sneakers', 'WalkWell', 999, 1799, 4.5, 28, [], ['6', '7', '8', '9', '10']],
            [4, 'Red Block Heel Pumps', 'WalkWell', 1599, 2799, 4.1, 10, [], ['5', '6', '7']],
        ],
    },
    Jewellery: {
        src: 'womens-jewellery', thumb: 0,
        items: [
            [0, 'Green Crystal Drop Earrings', 'Aura', 79, 249, 4.2, 90, ['latest'], []],
            [1, 'Green Oval Stone Earrings', 'Aura', 99, 299, 4.0, 75, [], []],
            [2, 'Tropical Statement Earrings', 'Aura', 149, 399, 4.3, 50, ['featured'], []],
        ],
    },
};

const describe = (name, brand, cat) =>
    `${name} by ${brand}. A versatile ${cat.toLowerCase().replace(/s$/, '')} pick designed for everyday comfort and style. ` +
    `Made with quality materials and careful finishing, it pairs easily with casual and dressy outfits alike. ` +
    `Easy to care for and built to last.`;

await login();
console.log('Admin login OK ->', API);

const cats = (await json(await fetch(`${API}/category`))).data || [];
const existingProducts = new Set(
    ((await json(await fetch(`${API}/product?perPage=10000&page=1`))).products || []).map((p) => p.name)
);

for (const [catName, cfg] of Object.entries(CATALOG)) {
    const src = await dj(cfg.src);
    let cat = cats.find((c) => c.name.toLowerCase() === catName.toLowerCase() && !c.parentCatId);

    if (!cat) {
        // createCategory upload-images ke baad server-side imagesArr use karta hai
        await upload('category', [src[cfg.thumb].thumbnail]);
        cat = (await json(await fetch(`${API}/category/createcat`, {
            method: 'POST',
            headers: { ...auth(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: catName }),
        }))).category;
        console.log(`✔ category ${catName}`);
    } else {
        console.log(`- category ${catName} (exists)`);
    }

    for (const [idx, name, brand, price, mrp, rating, stock, flags, sizes] of cfg.items) {
        if (existingProducts.has(name)) { console.log(`  - exists  ${name}`); continue; }
        const images = await upload('product', src[idx].images.slice(0, 3));
        await json(await fetch(`${API}/product/create`, {
            method: 'POST',
            headers: { ...auth(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, brand, images, price, oldprice: mrp,
                discount: Math.round((1 - price / mrp) * 100),
                description: describe(name, brand, catName),
                catName, catId: cat._id,
                countInStock: stock, rating, productFlags: flags, size: sizes,
            }),
        }));
        console.log(`  ✔ ${String(price).padStart(5)}  ${name}`);
    }
}
console.log('Done ✅');
