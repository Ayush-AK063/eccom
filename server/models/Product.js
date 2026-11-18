import mongoose from 'mongoose';
import { hiddenCategoryIds } from '../utils/hiddenCategories.js';

// Ek variant = size / RAM / weight / colour ka ek combination, apne price + stock ke saath.
// Variants hon to product ke flat arrays (size, productRam, productWeight, color) inhi se bante hain.
const variantSchema = new mongoose.Schema(
    {
        // { "Size": "M", "Colour": "Black" } — product ke variantOptions ke naam se
        options: { type: mongoose.Schema.Types.Mixed, default: {} },
        sku: { type: String, default: '' },
        size: { type: String, default: '' },
        productRam: { type: String, default: '' },
        productWeight: { type: String, default: '' },
        color: { type: String, default: '' },
        price: { type: Number, default: 0 },
        oldprice: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        image: { type: String, default: '' },
    },
    { _id: true }
);

// Category template se aaye ya custom: { group: "Dimensions", key: "height", label: "Height", value: "24", unit: "cm" }
const specSchema = new mongoose.Schema(
    {
        group: { type: String, default: 'General' },
        key: { type: String, default: '' },
        label: { type: String, required: true },
        value: { type: String, default: '' },
        unit: { type: String, default: '' },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        // ── Basic ──
        name: { type: String, required: true },
        description: { type: String, default: '' },
        shortDescription: { type: String, default: '' },
        highlights: [{ type: String }],
        tags: [{ type: String }],
        images: [{ type: String, required: true }],
        videoUrl: { type: String, default: '' },
        brand: { type: String, default: null },
        modelNumber: { type: String, default: '' },
        sku: { type: String, default: '' },
        barcode: { type: String, default: '' },
        status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },

        // ── Price + tax ──
        price: { type: Number, default: 0 },
        oldprice: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        costPrice: { type: Number, default: 0 },
        gstRate: { type: Number, default: 0 },
        hsnCode: { type: String, default: '' },

        // ── Category ──
        catName: { type: String, default: null },
        catId: { type: String, default: null },
        subCatId: { type: String, default: null },
        subCat: { type: String, default: null },
        thirdSubCatId: { type: String, default: null },
        thirdSubCat: { type: String, default: null },

        // ── Inventory ──
        countInStock: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 5 },
        maxOrderQty: { type: Number, default: 0 }, // 0 = koi limit nahi

        // ── Variants ──
        productRam: [{ type: String }],
        size: [{ type: String, default: null }],
        productWeight: [{ type: String, default: null }],
        color: [{ type: String }],
        // Product ke option groups (max 4): [{ name: "Size", display: "buttons", values: ["S","M"] }]
        variantOptions: {
            type: [new mongoose.Schema({
                name: { type: String, required: true },
                display: { type: String, enum: ['buttons', 'swatch', 'dropdown'], default: 'buttons' },
                unit: { type: String, default: '' },
                values: { type: [String], default: [] },
                hex: { type: mongoose.Schema.Types.Mixed, default: {} }, // { Black: "#000000" }
            }, { _id: false })],
            default: [],
        },
        variants: { type: [variantSchema], default: [] },

        // ── Category-wise details ──
        specifications: { type: [specSchema], default: [] },

        // ── Shipping ──
        shipping: {
            weight: { type: Number, default: 0 }, // packed, grams
            length: { type: Number, default: 0 }, // cm
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
            dispatchDays: { type: Number, default: 2 },
            codAvailable: { type: Boolean, default: true },
            freeShipping: { type: Boolean, default: false },
        },

        // ── Legal (India) ──
        compliance: {
            countryOfOrigin: { type: String, default: 'India' },
            manufacturer: { type: String, default: '' },
            importer: { type: String, default: '' },
            packer: { type: String, default: '' },
            netQuantity: { type: String, default: '' },
            mfgDate: { type: String, default: '' }, // "2026-08" (month/year)
            expiryDate: { type: String, default: '' },
            customerCare: { type: String, default: '' },
            licenseNo: { type: String, default: '' }, // FSSAI / BIS / hallmark etc.
        },

        // ── Policies ──
        policy: {
            returnable: { type: Boolean, default: true },
            returnDays: { type: Number, default: 7 },
            returnType: { type: String, enum: ['return', 'replace', 'none'], default: 'return' },
            warrantyMonths: { type: Number, default: 0 },
            warrantyType: { type: String, default: '' }, // Brand / Seller
            inTheBox: { type: String, default: '' },
        },

        // ── SEO ──
        seo: {
            slug: { type: String, default: '' },
            metaTitle: { type: String, default: '' },
            metaDescription: { type: String, default: '' },
        },

        rating: { type: Number, default: 0 },
        productFlags: [{ type: String }],
        dateCreated: { type: Date, default: Date.now },
    },
    {
        timestamps: true
    }
)

export const VARIANT_KEYS = ['size', 'productRam', 'productWeight', 'color'];
// Purane fixed fields ↔ option naam (filters / purana data in fields ko padhta hai)
export const LEGACY_NAMES = { size: 'Size', productRam: 'RAM', productWeight: 'Weight', color: 'Colour' };
const legacyKeyOf = (name) => {
    const n = String(name || '').trim().toLowerCase();
    if (n === 'size') return 'size';
    if (n === 'ram') return 'productRam';
    if (n === 'weight') return 'productWeight';
    if (n === 'colour' || n === 'color') return 'color';
    return null;
};

// Variants + option groups → legacy arrays, total stock, "from" price
productSchema.methods.syncFromVariants = function () {
    // Purana product (sirf size/RAM/weight arrays) → option groups
    if (!(this.variantOptions || []).length) {
        const groups = VARIANT_KEYS.map((k) => ({ name: LEGACY_NAMES[k], values: (this[k] || []).filter(Boolean) })).filter((g) => g.values.length);
        if (groups.length) this.variantOptions = groups;
    }
    const groups = (this.variantOptions || []).filter((g) => g.name && (g.values || []).length);
    this.variantOptions = groups;

    // Purane variant (size/color fields) → options
    (this.variants || []).forEach((v) => {
        if (v.options && Object.keys(v.options).length) return;
        const o = {};
        VARIANT_KEYS.forEach((k) => { if (v[k]) o[LEGACY_NAMES[k]] = v[k]; });
        v.options = o;
    });

    // Variant ke options sirf inhi groups ke; legacy fields bhi bharo
    const vs = (this.variants || []).filter((v) => {
        const o = v.options || {};
        return groups.length && groups.every((g) => o[g.name]);
    });
    vs.forEach((v) => {
        const o = {};
        groups.forEach((g) => { o[g.name] = String(v.options[g.name]); });
        v.options = o;
        VARIANT_KEYS.forEach((k) => { v[k] = ''; });
        groups.forEach((g) => { const lk = legacyKeyOf(g.name); if (lk) v[lk] = o[g.name]; });
        v.markModified?.('options');
    });
    this.variants = vs;

    VARIANT_KEYS.forEach((k) => { this[k] = []; });
    groups.forEach((g) => { const lk = legacyKeyOf(g.name); if (lk) this[lk] = [...g.values]; });

    if (!vs.length) return;
    this.countInStock = vs.reduce((a, v) => a + Math.max(0, Number(v.stock) || 0), 0);
    const priced = vs.filter((v) => v.price > 0);
    if (priced.length) {
        const cheapest = priced.reduce((a, v) => (v.price < a.price ? v : a));
        this.price = cheapest.price;
        this.oldprice = cheapest.oldprice > cheapest.price ? cheapest.oldprice : cheapest.price;
        this.discount = this.oldprice > this.price ? Math.round(((this.oldprice - this.price) / this.oldprice) * 100) : 0;
    }
};

productSchema.pre('save', function (next) {
    this.syncFromVariants();
    next();
});

// Storefront par draft / archived products nahi dikhte.
// Admin queries `.setOptions({ includeHidden: true })` se sab dekhti hain.
// Chhupi category (Admin → Categories → Hidden) ke products bhi storefront se bahar.
async function hideUnpublished() {
    if (this.getOptions().includeHidden) return;
    const q = this.getFilter();
    if (q.status === undefined) this.where({ status: { $nin: ['draft', 'archived'] } });
    const ids = await hiddenCategoryIds();
    if (ids.length) this.and([{ catId: { $nin: ids } }, { subCatId: { $nin: ids } }, { thirdSubCatId: { $nin: ids } }]);
}
productSchema.pre('find', hideUnpublished);
productSchema.pre('countDocuments', hideUnpublished);

const Product = mongoose.model('Product', productSchema);

export default Product;
