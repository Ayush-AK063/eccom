// Screenshot images ko internet se proper images se replace karta hai — sab kuch API hit karke.
// Flow: admin login -> image download (dummyjson / picsum) -> /upload-images (Cloudinary) -> PUT update
// Run: server chalu rakho, phir `node scripts/seedImages.js`
// Banners: python3 -I scripts/generateBanners.py <dir> && BANNER_DIR=<dir> node scripts/seedImages.js slides
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const API = process.env.SEED_API_URL || `http://localhost:${process.env.PORT || 8000}/api`;
const PER_PRODUCT = 3;

let token = '';
const authHeaders = () => ({ Authorization: `Bearer ${token}` });

async function json(res) {
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) throw new Error(`${res.url} -> ${res.status} ${body.message || ''}`);
    return body;
}

async function login() {
    const res = await fetch(`${API}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, adminLogin: true }),
    });
    const body = await json(res);
    token = body.data?.accessToken || body.accessToken;
    if (!token) throw new Error('Login hua par accessToken nahi mila');
}

// Internet se image download -> apne upload API pe bhejo -> Cloudinary URLs wapas
async function uploadFromUrls(module, urls) {
    const form = new FormData();
    for (const [i, url] of urls.entries()) {
        const r = await fetch(encodeURI(decodeURI(url)));
        if (!r.ok) throw new Error(`Download fail: ${url}`);
        const type = r.headers.get('content-type') || 'image/jpeg';
        const ext = type.includes('webp') ? 'webp' : type.includes('png') ? 'png' : 'jpg';
        form.append('images', new Blob([await r.arrayBuffer()], { type }), `${module}_${Date.now()}_${i}.${ext}`);
    }
    const res = await fetch(`${API}/${module}/upload-images`, { method: 'POST', headers: authHeaders(), body: form });
    return (await json(res)).images;
}

async function put(path, data) {
    const res = await fetch(`${API}${path}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return json(res);
}

// dummyjson se real product photos (category ke hisaab se)
async function dummyCategory(slug) {
    const r = await json(await fetch(`https://dummyjson.com/products/category/${slug}?limit=0&select=title,images,thumbnail`));
    return r.products;
}

const flatten = (cats) => cats.flatMap((c) => [c, ...flatten(c.children || [])]);

async function seedProducts() {
    const { products } = await json(await fetch(`${API}/product?perPage=1000&page=1`));
    const bagPool = await dummyCategory('womens-bags');
    const generalPool = await dummyCategory('sports-accessories');

    for (const [i, p] of products.entries()) {
        const pool = /bag/i.test(p.name) ? bagPool : generalPool;
        const src = pool[i % pool.length];
        // pool chhota ho to repeat pe image order rotate karo taaki har product alag dikhe
        const shift = Math.floor(i / pool.length) % src.images.length;
        const rotated = [...src.images.slice(shift), ...src.images.slice(0, shift)];
        const images = await uploadFromUrls('product', rotated.slice(0, PER_PRODUCT));
        await put(`/product/updateproduct/${p._id}`, { ...p, images });
        console.log(`✔ product  ${p.name} (${p._id}) <- ${src.title}`);
    }
}

async function seedCategories() {
    const body = await json(await fetch(`${API}/category`));
    const cats = flatten(body.data || body.categories || []);
    const map = {
        medical: 'skin-care',
        fitness: 'sports-accessories',
    };
    const fallback = ['groceries', 'home-decoration', 'kitchen-accessories', 'laptops', 'fragrances', 'tops', 'sunglasses', 'furniture', 'beauty'];

    for (const [i, c] of cats.entries()) {
        const slug = map[c.name.toLowerCase()] || fallback[i % fallback.length];
        const [first] = await dummyCategory(slug);
        const images = await uploadFromUrls('category', [first.thumbnail]);
        await put(`/category/${c._id}`, { name: c.name, images, parentCatName: c.parentCatName, parentCatId: c.parentCatId });
        console.log(`✔ category ${c.name} <- ${slug}`);
    }
}

// Banner type -> generateBanners.py ki files (type ke hisaab se sahi size/design)
const BANNER_FILES = {
    'Left Big Banner': ['left-big-1.jpg', 'left-big-2.jpg'],
    'Right Top Banner': ['right-top.jpg'],
    'Right Down Banner': ['right-down.jpg'],
    'v2 Banner': ['v3-1.jpg'], // wide 4:1 banner
};

async function uploadLocalFiles(module, paths) {
    const form = new FormData();
    for (const p of paths) {
        form.append('images', new Blob([await readFile(p)], { type: 'image/jpeg' }), path.basename(p));
    }
    const res = await fetch(`${API}/${module}/upload-images`, { method: 'POST', headers: authHeaders(), body: form });
    return (await json(res)).images;
}

async function seedHomeSlides() {
    const body = await json(await fetch(`${API}/homeSlide`));
    const slides = body.data || body.slides || [];
    const dir = process.env.BANNER_DIR;
    if (!dir) throw new Error('BANNER_DIR set karo (pehle: python3 -I scripts/generateBanners.py <dir>)');

    const used = {};
    // purani slide pehle -> stable order
    for (const s of [...slides].reverse()) {
        const files = BANNER_FILES[s.type];
        if (!files) { console.log(`- skip     ${s.type} (${s._id})`); continue; }
        const idx = used[s.type] = (used[s.type] ?? -1) + 1;
        const file = path.join(dir, files[idx % files.length]);
        const images = await uploadLocalFiles('homeSlide', [file]);
        const { images: _old, _id, __v, createdAt, updatedAt, ...rest } = s;
        await put(`/homeSlide/${s._id}`, { ...rest, images });
        console.log(`✔ slide    ${s.type.padEnd(18)} <- ${path.basename(file)}`);
    }
}

// Sample blogs (plain text; khaali line = naya paragraph). Same title dobara nahi banta.
const SAMPLE_BLOGS = [
    {
        file: 'blog-1.jpg',
        title: 'How to Choose the Right Handbag for Every Occasion',
        description: `A good handbag does more than carry your essentials — it finishes your look. The trick is matching the bag to the moment rather than owning one bag for everything.

For work, pick a structured tote that fits a laptop or files. Neutral shades like black, tan or navy pair with almost any outfit and look sharp in meetings.

For weekends and errands, a crossbody or a small shoulder bag keeps your hands free. Softer leathers and brighter colours work well here.

For evenings, go compact. A clutch or a mini bag with a chain strap holds your phone, cards and a lipstick without weighing you down.

Finally, check the details: sturdy zips, even stitching and a lining that is easy to clean. These small things decide how long a bag really lasts.`,
    },
    {
        file: 'blog-2.jpg',
        title: 'Sunglasses Guide: Find the Perfect Frame for Your Face',
        description: `The right pair of sunglasses protects your eyes and flatters your face. Start with your face shape, then think about lenses.

Round faces suit angular frames such as square or rectangular styles, which add definition. Square faces look balanced in round or aviator frames that soften strong lines.

Oval faces can wear almost any shape, so this is the time to experiment with bold or oversized frames. Heart-shaped faces pair well with bottom-heavy frames or light, rimless styles.

Whatever the frame, look for lenses marked UV400 or 100% UV protection. Polarised lenses cut glare from roads and water, which makes them ideal for driving and travel.`,
    },
    {
        file: 'blog-3.jpg',
        title: '5 Accessories That Instantly Upgrade a Simple Outfit',
        description: `You do not need a new wardrobe to look put-together. A few well-chosen accessories can turn a plain outfit into a styled one.

1. A classic watch. A clean metal or leather-strap watch adds polish to both casual and formal looks.

2. Statement earrings. One bold pair draws attention upward and lifts a simple tee or dress.

3. A quality belt. It defines your waist and ties the colours of your outfit together.

4. Sunglasses. Even on a basic day, a good pair adds instant confidence.

5. A structured bag. It keeps the look sharp and makes everyday outfits feel intentional.

Start with one piece, build slowly, and choose items you will wear again and again.`,
    },
    {
        file: 'blog-4.jpg',
        title: 'Travel Light: The Essentials Checklist for Your Next Trip',
        description: `Packing light makes travel easier, faster and far less stressful. The secret is choosing versatile pieces that work together.

Start with a comfortable pair of shoes you can walk in all day, plus one smarter pair for evenings. Shoes take the most space, so two pairs is usually enough.

Pick a backpack or a roomy tote as your day bag. It should hold a water bottle, charger, sunglasses and a light layer.

Stick to a simple colour palette so every top matches every bottom. Add one or two accessories to change the look without adding weight.

Keep documents, cards and medicines in a small pouch inside your day bag. Everything important stays in one place, and you are ready to go.`,
    },
];

async function seedBlogs() {
    const dir = process.env.BANNER_DIR;
    if (!dir) throw new Error('BANNER_DIR set karo (blog-*.jpg generateBanners.py banata hai)');
    const existing = (await json(await fetch(`${API}/blog`))).data || [];
    const titles = new Set(existing.map((b) => b.title));

    for (const b of SAMPLE_BLOGS) {
        if (titles.has(b.title)) { console.log(`- exists   ${b.title}`); continue; }
        const images = await uploadLocalFiles('blog', [path.join(dir, b.file)]);
        const res = await fetch(`${API}/blog/create`, {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: b.title, description: b.description, images }),
        });
        await json(res);
        console.log(`✔ blog     ${b.title}`);
    }
}

const only = process.argv[2]; // optional: products | categories | slides | blogs
await login();
console.log('Admin login OK ->', API);
if (!only || only === 'products') await seedProducts();
if (!only || only === 'categories') await seedCategories();
if (!only || only === 'slides') await seedHomeSlides();
if (only === 'blogs') await seedBlogs();
console.log('Done ✅');
