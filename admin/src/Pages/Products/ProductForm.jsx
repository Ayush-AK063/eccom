import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { FiUploadCloud, FiX, FiArrowLeft, FiArrowRight, FiStar, FiAlertCircle, FiPlus, FiTrash2, FiSliders, FiRefreshCw, FiCheckCircle, FiCircle } from "react-icons/fi";
import { getData, postData, putData, deleteData } from "../../utils/api";
import { MyContext } from "../../App";
import { StockBadge } from "./shared";
import { inr, toArr } from "./utils";
import { mergedAttributes, findPath } from "../Category/templates/attrUtils";
import "./style.css";

const FLAGS = [
  { key: "popular", label: "Popular", hint: "Popular Products tabs" },
  { key: "latest", label: "Latest", hint: "Latest Products slider" },
  { key: "featured", label: "Featured", hint: "Featured Products slider" },
  { key: "deal", label: "Deal", hint: "Today's Best Deals (when set to “Marked Deal”)" },
];
// Purane products (size / RAM / weight / colour arrays) → option groups
const LEGACY = [["size", "Size"], ["color", "Colour"], ["productRam", "RAM"], ["productWeight", "Weight"]];
const initialGroups = (d) => {
  if (d?.variantOptions?.length) return d.variantOptions.map((g) => ({ name: g.name, display: g.display || "buttons", unit: g.unit || "", values: [...(g.values || [])], hex: { ...(g.hex || {}) } }));
  return LEGACY.map(([k, name]) => ({ name, display: name === "Colour" ? "swatch" : "buttons", unit: "", values: toArr(d?.[k]), hex: {} })).filter((g) => g.values.length);
};
const optsOf = (v) => {
  if (v?.options && Object.keys(v.options).length) return v.options;
  const o = {};
  LEGACY.forEach(([k, name]) => { if (v?.[k]) o[name] = v[k]; });
  return o;
};
const MAX_GROUPS = 4;
const GST = [0, 3, 5, 12, 18, 28];
const COUNTRIES = ["India", "China", "Japan", "South Korea", "Vietnam", "Bangladesh", "Taiwan", "Thailand", "USA", "Germany", "Italy", "United Kingdom", "Other"];
const SECTIONS = [["basic", "Basic"], ["media", "Images"], ["pricing", "Pricing"], ["inventory", "Inventory"], ["variants", "Variants"], ["specs", "Specifications"], ["shipping", "Shipping"], ["legal", "Legal"], ["policy", "Returns"], ["seo", "SEO"]];

const Section = ({ id, title, sub, children, aside }) => (
  <section className="pdCard scroll-mt-4" id={`pf-${id}`}>
    <div className="pdCard__head flex items-start justify-between gap-3">
      <div>
        <div className="pdCard__title">{title}</div>
        {sub && <div className="pdCard__sub">{sub}</div>}
      </div>
      {aside}
    </div>
    {children}
  </section>
);

const Field = ({ label, req, hint, err, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="pdLabel">{label} {req && <em>*</em>}</span>
    {children}
    {err ? <div className="mt-1.5 flex items-center gap-1 text-[11px] font-[600] text-[#dc2626]"><FiAlertCircle />{err}</div> : hint ? <div className="pdHint">{hint}</div> : null}
  </label>
);

const Toggle = ({ on, onClick, label, hint }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-3 text-left">
    <span className={`pdSwitch ${on ? "is-on" : ""}`} />
    <span>
      <span className="block text-[13px] font-[600] text-gray-900">{label}</span>
      {hint && <span className="block text-[11px] text-gray-400">{hint}</span>}
    </span>
  </button>
);

const vKey = (v) => Object.entries(v.options || {}).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => `${k}=${x}`).join("|");
const comboLabel = (v) => Object.values(v.options || {}).filter(Boolean).join(" / ");
const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);

// Add + Edit (data ho to edit)
const ProductForm = ({ data }) => {
  const context = useContext(MyContext);
  const isEdit = !!data?._id;
  const d = data || {};
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [masters, setMasters] = useState([]); // admin ke Variant Options
  const [groups, setGroups] = useState(() => initialGroups(d));
  const [valueInputs, setValueInputs] = useState({});
  const [newGroupName, setNewGroupName] = useState(null); // custom option ka naam (null = band)
  const [f, setF] = useState({
    name: d.name || "",
    brand: d.brand || "",
    modelNumber: d.modelNumber || "",
    shortDescription: d.shortDescription || "",
    description: d.description || "",
    highlights: d.highlights?.length ? d.highlights : [""],
    tags: d.tags || [],
    videoUrl: d.videoUrl || "",
    status: d.status || "active",
    price: d.price ?? "",
    oldprice: d.oldprice || "",
    costPrice: d.costPrice || "",
    gstRate: d.gstRate ?? 0,
    hsnCode: d.hsnCode || "",
    sku: d.sku || "",
    barcode: d.barcode || "",
    countInStock: d.countInStock ?? "",
    lowStockThreshold: d.lowStockThreshold ?? 5,
    maxOrderQty: d.maxOrderQty || "",
    rating: d.rating || 0,
    productFlags: d.productFlags || [],
    catId: d.catId?._id || d.catId || "",
    subCatId: d.subCatId?._id || d.subCatId || "",
    thirdSubCatId: d.thirdSubCatId?._id || d.thirdSubCatId || "",
    shipping: { weight: "", length: "", width: "", height: "", dispatchDays: 2, codAvailable: true, freeShipping: false, ...(d.shipping || {}) },
    compliance: { countryOfOrigin: "India", manufacturer: "", importer: "", packer: "", netQuantity: "", mfgDate: "", expiryDate: "", customerCare: "", licenseNo: "", ...(d.compliance || {}) },
    policy: { returnable: true, returnDays: 7, returnType: "return", warrantyMonths: 0, warrantyType: "", inTheBox: "", ...(d.policy || {}) },
    seo: { slug: "", metaTitle: "", metaDescription: "", ...(d.seo || {}) },
  });
  const [variants, setVariants] = useState((d.variants || []).map((v) => ({ ...v, options: { ...optsOf(v) } })));
  const [specVals, setSpecVals] = useState(() => Object.fromEntries((d.specifications || []).filter((s) => s.key).map((s) => [s.key, s.value])));
  const [customSpecs, setCustomSpecs] = useState([]); // template se bahar wale
  const [images, setImages] = useState((d.images || []).map((src) => ({ src })));
  const removedOld = useRef([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [bulk, setBulk] = useState({ price: "", oldprice: "", stock: "" });
  const fileRef = useRef(null);
  const slugTouched = useRef(!!d.seo?.slug);

  useEffect(() => {
    getData("/api/category?admin=1").then((r) => r?.success && setCategories(r.data || []));
    getData("/api/variantOption").then((r) => setMasters(r?.data || []));
  }, []);

  // Category template ke fields
  const attrs = useMemo(() => mergedAttributes(categories, [f.catId, f.subCatId, f.thirdSubCatId]), [categories, f.catId, f.subCatId, f.thirdSubCatId]);
  // Edit: jo specs template mein nahi hain wo custom rows bano (ek baar)
  const customInit = useRef(false);
  useEffect(() => {
    if (customInit.current || !categories.length) return;
    customInit.current = true;
    const keys = new Set(attrs.map((a) => a.key));
    setCustomSpecs((d.specifications || []).filter((s) => !s.key || !keys.has(s.key)).map((s) => ({ ...s, _id: Math.random() })));
  }, [categories, attrs, d.specifications]);

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const setIn = (grp, k, v) => setF((p) => ({ ...p, [grp]: { ...p[grp], [k]: v } }));
  const toggleIn = (k, v) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  const price = Number(f.price) || 0;
  const mrp = Number(f.oldprice) || 0;
  const cost = Number(f.costPrice) || 0;
  const discount = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const gstPart = price ? price - price / (1 + Number(f.gstRate) / 100) : 0;
  const margin = price && cost ? price - gstPart - cost : 0;
  const mainCat = categories.find((c) => c._id === f.catId);
  const subCat = mainCat?.children?.find((c) => c._id === f.subCatId);
  const thirdCat = subCat?.children?.find((c) => c._id === f.thirdSubCatId);
  const leafId = f.thirdSubCatId || f.subCatId || f.catId;
  const usedGroups = groups.filter((g) => g.values.length);
  const catIds = [f.catId, f.subCatId, f.thirdSubCatId].filter(Boolean);
  const masterFor = (name) => masters.find((m) => m.name.toLowerCase() === String(name).toLowerCase());
  // Category ke liye bane options pehle (suggested), baaki sab dropdown mein
  const availableMasters = masters.filter((m) => !groups.some((g) => g.name.toLowerCase() === m.name.toLowerCase()));
  const suggested = availableMasters.filter((m) => m.categoryIds?.some((id) => catIds.includes(id)));
  const hasMatrix = variants.length > 0;
  const variantStock = variants.reduce((a, v) => a + (Number(v.stock) || 0), 0);
  const priced = variants.filter((v) => Number(v.price) > 0);
  const fromPrice = priced.length ? Math.min(...priced.map((v) => Number(v.price))) : price;

  // ── Images ──
  const addFiles = (list) => {
    const imgs = Array.from(list || []).filter((x) => x.type.startsWith("image/"));
    setImages((p) => [...p, ...imgs.map((file) => ({ src: URL.createObjectURL(file), file }))]);
    setErrors((e) => ({ ...e, images: undefined }));
  };
  const removeImage = (i) => {
    const img = images[i];
    if (img.file) URL.revokeObjectURL(img.src);
    else removedOld.current.push(img.src);
    setImages((p) => p.filter((_, x) => x !== i));
    setVariants((vs) => vs.map((v) => (v.image === img.src ? { ...v, image: "" } : v)));
  };
  const moveImage = (i, dir) => setImages((p) => {
    const n = [...p]; const j = i + dir;
    if (j < 0 || j >= n.length) return p;
    [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  // ── Variants ──
  const generate = () => {
    if (!usedGroups.length) return context.openAlertBox("error", "Add an option (like Size or Colour) and pick its values first");
    let combos = [{}];
    for (const g of usedGroups) combos = combos.flatMap((c) => g.values.map((val) => ({ ...c, [g.name]: val })));
    if (combos.length > 300) return context.openAlertBox("error", `${combos.length} combinations — keep it under 300`);
    const old = Object.fromEntries(variants.map((v) => [vKey(v), v]));
    setVariants(combos.map((options) => old[vKey({ options })] || { options, sku: "", price: f.price || "", oldprice: f.oldprice || "", stock: "", image: "" }));
    setErrors((e) => ({ ...e, variants: undefined }));
  };
  const setV = (i, k, v) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const applyBulk = () => {
    setVariants((vs) => vs.map((v) => ({
      ...v,
      ...(bulk.price !== "" ? { price: bulk.price } : {}),
      ...(bulk.oldprice !== "" ? { oldprice: bulk.oldprice } : {}),
      ...(bulk.stock !== "" ? { stock: bulk.stock } : {}),
    })));
    setBulk({ price: "", oldprice: "", stock: "" });
  };
  const autoSku = () => {
    const base = (f.sku || slugify(f.brand || f.name).slice(0, 10) || "SKU").toUpperCase();
    setVariants((vs) => vs.map((v) => ({ ...v, sku: v.sku || [base, ...Object.values(v.options || {})].join("-").toUpperCase().replace(/[^A-Z0-9-]/g, "") })));
  };
  // ── Option groups ──
  const addGroup = (name) => {
    const n = String(name || "").trim();
    if (!n) return;
    if (groups.length >= MAX_GROUPS) return context.openAlertBox("error", `Up to ${MAX_GROUPS} options per product`);
    if (groups.some((g) => g.name.toLowerCase() === n.toLowerCase())) return context.openAlertBox("error", `${n} is already added`);
    const m = masterFor(n);
    setGroups((gs) => [...gs, { name: m?.name || n, display: m?.display || "buttons", unit: m?.unit || "", values: [], hex: {} }]);
    setNewGroupName(null);
  };
  const removeGroup = (i) => {
    const g = groups[i];
    if (variants.length && !window.confirm(`Remove ${g.name}? The variant table will be cleared — generate it again after.`)) return;
    setGroups((gs) => gs.filter((_, j) => j !== i));
    if (variants.length) setVariants([]);
  };
  const toggleValue = (i, value, hex) => {
    const g = groups[i];
    const on = g.values.includes(value);
    setGroups((gs) => gs.map((x, j) => (j !== i ? x : { ...x, values: on ? x.values.filter((v) => v !== value) : [...x.values, value], hex: hex ? { ...x.hex, [value]: hex } : x.hex })));
    if (on) setVariants((vs) => vs.filter((v) => v.options?.[g.name] !== value));
  };
  const addCustomValue = (i) => {
    const raw = valueInputs[i] || "";
    const parts = raw.split(",").map((x) => x.trim()).filter(Boolean);
    const g = groups[i];
    const fresh = parts.filter((p) => !g.values.some((v) => v.toLowerCase() === p.toLowerCase()));
    if (fresh.length) setGroups((gs) => gs.map((x, j) => (j === i ? { ...x, values: [...x.values, ...fresh] } : x)));
    setValueInputs((v) => ({ ...v, [i]: "" }));
  };

  // ── Specs ──
  const specsPayload = () => [
    ...attrs.map((a) => ({ group: a.group || "General", key: a.key, label: a.label, unit: a.unit || "", value: a.type === "boolean" ? (specVals[a.key] === "Yes" ? "Yes" : specVals[a.key] === "No" ? "No" : "") : String(specVals[a.key] ?? "").trim() })),
    ...customSpecs.map((s) => ({ group: s.group || "Other details", key: "", label: String(s.label || "").trim(), unit: s.unit || "", value: String(s.value || "").trim() })),
  ].filter((s) => s.label && s.value);

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Product name is required";
    if (!f.catId) e.catId = "Choose a category";
    if (!hasMatrix && !(price > 0)) e.price = "Enter a selling price";
    if (!hasMatrix && mrp && mrp < price) e.oldprice = "MRP should be higher than the selling price";
    if (!hasMatrix && (f.countInStock === "" || Number(f.countInStock) < 0)) e.countInStock = "Enter stock (0 or more)";
    if (!images.length) e.images = "Add at least one image";
    if (f.hsnCode && !/^\d{4,8}$/.test(f.hsnCode)) e.hsnCode = "HSN is 4–8 digits";
    if (f.barcode && !/^\d{8,14}$/.test(f.barcode)) e.barcode = "Barcode is 8–14 digits (EAN / UPC)";
    if (hasMatrix) {
      const bad = variants.find((v) => !(Number(v.price) > 0) || v.stock === "" || Number(v.stock) < 0 || (Number(v.oldprice) && Number(v.oldprice) < Number(v.price)));
      if (bad) e.variants = `Check ${comboLabel(bad)}: price, MRP (≥ price) and stock are needed for every variant`;
      const skus = variants.map((v) => v.sku).filter(Boolean);
      if (new Set(skus).size !== skus.length) e.variants = "Two variants have the same SKU";
    }
    const missing = attrs.filter((a) => a.required && !String(specVals[a.key] ?? "").trim()).map((a) => a.label);
    if (missing.length && f.status === "active") e.specs = `Required: ${missing.join(", ")}`;
    setErrors(e);
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      const first = ["name", "images", "price", "oldprice", "countInStock", "hsnCode", "barcode", "variants", "specs", "catId"].find((k) => e[k]);
      const sec = { name: "basic", images: "media", price: "pricing", oldprice: "pricing", hsnCode: "pricing", countInStock: "inventory", barcode: "inventory", variants: "variants", specs: "specs" }[first];
      if (sec) document.getElementById(`pf-${sec}`)?.scrollIntoView({ behavior: "smooth" });
      return context.openAlertBox("error", "Please fix the highlighted fields");
    }
    setSaving(true);
    try {
      const newFiles = images.filter((i) => i.file);
      let uploaded = [];
      if (newFiles.length) {
        const fd = new FormData();
        newFiles.forEach((i) => fd.append("images", i.file));
        const up = await postData("/api/product/upload-images", fd, { withCredentials: true });
        if (up?.error || !up?.images) { context.openAlertBox("error", up?.message || "Image upload failed"); return; }
        uploaded = up.images;
      }
      let k = 0;
      const srcMap = {};
      const finalImages = images.map((i) => { const url = i.file ? uploaded[k++] : i.src; srcMap[i.src] = url; return url; }).filter(Boolean);
      const payload = {
        ...f,
        name: f.name.trim(),
        brand: f.brand.trim(),
        highlights: f.highlights.map((h) => h.trim()).filter(Boolean),
        price,
        oldprice: mrp || price,
        costPrice: cost,
        countInStock: Number(f.countInStock) || 0,
        lowStockThreshold: Number(f.lowStockThreshold) || 0,
        maxOrderQty: Number(f.maxOrderQty) || 0,
        catName: mainCat?.name || null,
        subCat: subCat?.name || null,
        thirdSubCat: thirdCat?.name || null,
        catId: f.catId || null,
        subCatId: f.subCatId || null,
        thirdSubCatId: f.thirdSubCatId || null,
        images: finalImages,
        variantOptions: usedGroups,
        size: [], color: [], productRam: [], productWeight: [],
        variants: variants.map((v) => ({ ...v, price: Number(v.price) || 0, oldprice: Number(v.oldprice) || 0, stock: Number(v.stock) || 0, image: v.image ? srcMap[v.image] || v.image : "" })),
        specifications: specsPayload(),
        shipping: { ...f.shipping, weight: Number(f.shipping.weight) || 0, length: Number(f.shipping.length) || 0, width: Number(f.shipping.width) || 0, height: Number(f.shipping.height) || 0, dispatchDays: Number(f.shipping.dispatchDays) || 0 },
        policy: { ...f.policy, returnDays: f.policy.returnable ? Number(f.policy.returnDays) || 0 : 0, warrantyMonths: Number(f.policy.warrantyMonths) || 0, returnType: f.policy.returnable ? f.policy.returnType : "none" },
        seo: { ...f.seo, slug: slugify(f.seo.slug || f.name) },
      };
      const res = isEdit
        ? await putData(`/api/product/updateproduct/${data._id}`, payload, { withCredentials: true })
        : await postData("/api/product/create", payload, { withCredentials: true });
      if (res?.success) {
        removedOld.current.forEach((img) => deleteData(`/api/product/deleteimage?img=${encodeURIComponent(img)}`).catch(() => {}));
        context.openAlertBox("success", isEdit ? "Product updated" : f.status === "draft" ? "Saved as draft" : "Product published");
        context.setIsOpenFullScreenPanel({ open: false });
      } else context.openAlertBox("error", res?.message || "Could not save product");
    } catch {
      context.openAlertBox("error", "Server error");
    } finally {
      setSaving(false);
    }
  };

  const bad = (k) => (errors[k] ? "!border-[#ef4444]" : "");
  const numInput = (value, onChange, extra = {}) => (
    <input type="number" min="0" className={`pdInput pdNum ${extra.className || ""}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={extra.placeholder || "0"} disabled={extra.disabled} />
  );

  // Completeness checklist (right side)
  const checks = [
    ["Name & category", !!(f.name.trim() && f.catId)],
    ["At least 3 images", images.length >= 3],
    ["Price & stock", hasMatrix ? variants.every((v) => Number(v.price) > 0) : price > 0 && f.countInStock !== ""],
    ["Description", f.description.trim().length >= 80],
    ["Highlights", f.highlights.filter((h) => h.trim()).length >= 3],
    ["Specifications", attrs.length ? attrs.filter((a) => a.required).every((a) => String(specVals[a.key] ?? "").trim()) && Object.values(specVals).filter(Boolean).length > 0 : customSpecs.length > 0],
    ["Tax (GST + HSN)", !!f.hsnCode],
    ["Shipping weight & size", !!(Number(f.shipping.weight) && Number(f.shipping.length))],
    ["Country & manufacturer", !!(f.compliance.countryOfOrigin && f.compliance.manufacturer.trim())],
  ];
  const score = checks.filter((c) => c[1]).length;

  return (
    <form onSubmit={submit} className="pdPanel" noValidate>
      <div className="pdPanel__grid">
        <div className="flex flex-col gap-5 min-w-0">
          {/* Jump nav */}
          <nav className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-[#f9fafb] flex gap-1 overflow-x-auto">
            {SECTIONS.map(([id, l]) => (
              <button type="button" key={id} className="pdTab !h-8 !bg-white border border-gray-200 hover:!border-gray-900"
                onClick={() => document.getElementById(`pf-${id}`)?.scrollIntoView({ behavior: "smooth" })}>{l}</button>
            ))}
          </nav>

          <Section id="basic" title="Basic information" sub="What customers see first.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product name" req err={errors.name} className="sm:col-span-2">
                <input className={`pdInput ${bad("name")}`} value={f.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched.current) setIn("seo", "slug", slugify(e.target.value)); }} placeholder="e.g. Women's Leather Tote Bag" maxLength={200} />
              </Field>
              <Field label="Brand"><input className="pdInput" value={f.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Lavie" /></Field>
              <Field label="Model number"><input className="pdInput" value={f.modelNumber} onChange={(e) => set("modelNumber", e.target.value)} placeholder="e.g. LV-TOTE-21" /></Field>
              <Field label="Short description" hint={`${f.shortDescription.length}/300 · shown under the title`} className="sm:col-span-2">
                <input className="pdInput" maxLength={300} value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One line about the product" />
              </Field>
              <div className="sm:col-span-2">
                <span className="pdLabel">Key highlights <span className="text-gray-400 font-[500]">(bullet points, up to 10)</span></span>
                <div className="flex flex-col gap-2">
                  {f.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-6 h-10 flex items-center justify-center text-[12px] text-gray-400">{i + 1}.</span>
                      <input className="pdInput" value={h} maxLength={200} onChange={(e) => set("highlights", f.highlights.map((x, j) => (j === i ? e.target.value : x)))} placeholder="e.g. Genuine leather with suede lining" />
                      <button type="button" className="pdIconBtn !h-10 !w-10 shrink-0" onClick={() => set("highlights", f.highlights.length > 1 ? f.highlights.filter((_, j) => j !== i) : [""])} aria-label="Remove"><FiX /></button>
                    </div>
                  ))}
                </div>
                {f.highlights.length < 10 && <button type="button" className="mt-2 text-[12px] font-[600] text-[#ff5252] flex items-center gap-1" onClick={() => set("highlights", [...f.highlights, ""])}><FiPlus /> Add highlight</button>}
              </div>
              <Field label="Description" hint={`${f.description.length} characters`} className="sm:col-span-2">
                <textarea className="pdInput" value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Material, fit, features, care instructions…" />
              </Field>
              <div>
                <span className="pdLabel">Rating <span className="text-gray-400 font-[500]">(shown on the card)</span></span>
                <div className="h-10 flex items-center gap-3">
                  <span className="pdStars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} className={f.rating >= n ? "is-on" : ""} onClick={() => set("rating", f.rating === n ? 0 : n)} aria-label={`${n} star`}>★</button>
                    ))}
                  </span>
                  <span className="text-[12px] text-gray-500">{f.rating ? `${f.rating} / 5` : "No rating"}</span>
                </div>
              </div>
              <div>
                <span className="pdLabel">Search tags</span>
                <div className="pdInput !h-auto min-h-10 flex flex-wrap items-center gap-1.5 py-1.5">
                  {f.tags.map((t) => <span key={t} className="pdBadge !normal-case">{t}<button type="button" onClick={() => set("tags", f.tags.filter((x) => x !== t))} aria-label="Remove tag"><FiX /></button></span>)}
                  <input className="flex-1 min-w-[90px] outline-none text-[13px] bg-transparent" value={tagInput} placeholder={f.tags.length ? "" : "Type and press Enter"}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) { e.preventDefault(); if (!f.tags.includes(tagInput.trim()) && f.tags.length < 30) set("tags", [...f.tags, tagInput.trim()]); setTagInput(""); } }} />
                </div>
              </div>
            </div>
          </Section>

          <Section id="media" title="Images & video" sub="First image is the cover. Square (1:1) images look best." aside={<span className="text-[12px] text-gray-400">{images.length} added</span>}>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={img.src} className={`pdImg ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
                    <img src={img.src} alt="" />
                    {i === 0 && <span className="pdImg__tag">Cover</span>}
                    <div className="pdImg__actions">
                      {i > 0 && <button type="button" onClick={() => moveImage(i, -1)} aria-label="Move left"><FiArrowLeft /></button>}
                      {i < images.length - 1 && <button type="button" onClick={() => moveImage(i, 1)} aria-label="Move right"><FiArrowRight /></button>}
                      <button type="button" className="is-danger" onClick={() => removeImage(i)} aria-label="Remove"><FiX /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={`pdDrop ${dragOver ? "is-over" : ""} ${errors.images ? "!border-[#ef4444]" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}>
              <FiUploadCloud className="text-[24px] text-gray-400" />
              <div className="text-[13px] font-[600] text-gray-800">Drop images here or <span className="text-[#ff5252]">browse</span></div>
              <div className="text-[11px] text-gray-400">JPG, PNG or WEBP · you can select several</div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            {errors.images && <div className="mt-1.5 flex items-center gap-1 text-[11px] font-[600] text-[#dc2626]"><FiAlertCircle />{errors.images}</div>}
            <Field label="Product video (YouTube / MP4 link)" className="mt-4"><input className="pdInput" value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" /></Field>
          </Section>

          <Section id="pricing" title="Pricing & tax" sub={hasMatrix ? "Variants have their own prices — these are used as defaults for new variants." : "Prices are inclusive of GST."}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Selling price" req={!hasMatrix} err={errors.price}>
                <div className="pdAffix"><span>₹</span>{numInput(f.price, (v) => set("price", v), { className: bad("price") })}</div>
              </Field>
              <Field label="MRP (crossed out)" err={errors.oldprice}>
                <div className="pdAffix"><span>₹</span>{numInput(f.oldprice, (v) => set("oldprice", v), { className: bad("oldprice") })}</div>
              </Field>
              <div>
                <span className="pdLabel">Discount</span>
                <div className="pdInput flex items-center bg-gray-50 text-gray-700">{discount ? <><b className="text-[#059669]">{discount}% off</b><span className="ml-2 text-[12px] text-gray-400">saves {inr(mrp - price)}</span></> : <span className="text-gray-400">Auto from MRP</span>}</div>
              </div>
              <Field label="Cost price" hint="Only you can see this">
                <div className="pdAffix"><span>₹</span>{numInput(f.costPrice, (v) => set("costPrice", v))}</div>
              </Field>
              <Field label="GST rate">
                <select className="pdInput" value={f.gstRate} onChange={(e) => set("gstRate", Number(e.target.value))}>
                  {GST.map((g) => <option key={g} value={g}>{g}%</option>)}
                </select>
              </Field>
              <Field label="HSN code" err={errors.hsnCode} hint="4–8 digit tax code">
                <input className={`pdInput ${bad("hsnCode")}`} inputMode="numeric" value={f.hsnCode} onChange={(e) => set("hsnCode", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="e.g. 4202" />
              </Field>
            </div>
            {price > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
                <div className="p-2.5 rounded-md bg-gray-50"><div className="text-gray-500">GST included</div><div className="font-[700] text-gray-900">{inr(gstPart)}</div></div>
                <div className="p-2.5 rounded-md bg-gray-50"><div className="text-gray-500">Price before tax</div><div className="font-[700] text-gray-900">{inr(price - gstPart)}</div></div>
                <div className="p-2.5 rounded-md bg-gray-50"><div className="text-gray-500">Profit per unit</div><div className={`font-[700] ${margin < 0 ? "text-[#dc2626]" : "text-gray-900"}`}>{cost ? `${inr(margin)} (${Math.round((margin / (price - gstPart)) * 100)}%)` : "Add cost price"}</div></div>
              </div>
            )}
          </Section>

          <Section id="inventory" title="Inventory">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="SKU" hint="Your own product code"><input className="pdInput" value={f.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} placeholder="e.g. BAG-TOTE-001" /></Field>
              <Field label="Barcode (EAN / UPC)" err={errors.barcode}><input className={`pdInput ${bad("barcode")}`} inputMode="numeric" value={f.barcode} onChange={(e) => set("barcode", e.target.value.replace(/\D/g, "").slice(0, 14))} placeholder="8–14 digits" /></Field>
              <Field label="Stock quantity" req={!hasMatrix} err={errors.countInStock} hint={hasMatrix ? `Sum of variants: ${variantStock}` : ""}>
                {numInput(hasMatrix ? variantStock : f.countInStock, (v) => set("countInStock", v), { className: bad("countInStock"), disabled: hasMatrix })}
              </Field>
              <Field label="Low stock alert at" hint="Shows a warning in admin"><input type="number" min="0" className="pdInput pdNum" value={f.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} /></Field>
              <Field label="Max quantity per order" hint="Empty = no limit"><input type="number" min="0" className="pdInput pdNum" value={f.maxOrderQty} onChange={(e) => set("maxOrderQty", e.target.value)} placeholder="No limit" /></Field>
              <div>
                <span className="pdLabel">Status</span>
                <div className="h-10 flex items-center"><StockBadge n={hasMatrix ? variantStock : Number(f.countInStock) || 0} /></div>
              </div>
            </div>
          </Section>

          <Section id="variants" title="Variants" sub={`Add up to ${MAX_GROUPS} options (Size, Colour, Storage, Flavour…). Then generate combinations — each gets its own price, stock, SKU and photo.`}
            aside={<a href="/variant-options" target="_blank" rel="noopener noreferrer" className="text-[12px] font-[600] text-gray-500 hover:text-[#ff5252] flex items-center gap-1 whitespace-nowrap"><FiSliders /> Manage options</a>}>
            <div className="flex flex-col gap-4">
              {groups.map((g, i) => {
                const m = masterFor(g.name);
                const masterVals = (m?.values || []).map((v) => v.value);
                const extra = g.values.filter((v) => !masterVals.includes(v));
                const canCustom = !m || m.allowCustom !== false;
                const hexOf = (v) => g.hex?.[v] || m?.values?.find((x) => x.value === v)?.hex || "#e5e7eb";
                return (
                  <div key={g.name} className="border border-gray-200 rounded-md p-3.5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[13px] font-[700] text-gray-900">{g.name}{g.unit ? ` (${g.unit})` : ""}</span>
                      <span className="pdBadge !normal-case">{g.display === "swatch" ? "Colour circles" : g.display === "dropdown" ? "Dropdown" : "Buttons"}</span>
                      {!m && <span className="pdBadge pdBadge--amber !normal-case">Only this product</span>}
                      <span className="text-[12px] text-gray-400">{g.values.length} selected</span>
                      <button type="button" className="ml-auto pdIconBtn pdIconBtn--danger" onClick={() => removeGroup(i)} aria-label={`Remove ${g.name}`}><FiTrash2 /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[...masterVals, ...extra].map((v) => {
                        const on = g.values.includes(v);
                        return (
                          <button type="button" key={v} className={`pdChip ${on ? "is-on" : ""}`} onClick={() => toggleValue(i, v, g.display === "swatch" ? hexOf(v) : "")}>
                            {g.display === "swatch" && <i className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: hexOf(v) }} />}
                            {v}
                          </button>
                        );
                      })}
                      {!masterVals.length && !extra.length && <span className="text-[12px] text-gray-400 self-center">No values yet — type below.</span>}
                    </div>
                    {canCustom && (
                      <div className="mt-2.5 flex gap-2">
                        <input className="pdInput !h-8 max-w-[320px]" value={valueInputs[i] || ""} onChange={(e) => setValueInputs((x) => ({ ...x, [i]: e.target.value }))}
                          placeholder={`Add ${g.name.toLowerCase()} values (comma separated)`} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomValue(i); } }} />
                        <button type="button" className="pdBtn pdBtn--light !h-8" onClick={() => addCustomValue(i)} disabled={!(valueInputs[i] || "").trim()}><FiPlus /> Add</button>
                      </div>
                    )}
                  </div>
                );
              })}

              {groups.length < MAX_GROUPS && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-[600] text-gray-700">Add option:</span>
                  {availableMasters.length > 0 && (
                    <select className="pdInput !h-8 !w-[220px]" value="" onChange={(e) => e.target.value && addGroup(e.target.value)}>
                      <option value="">Choose an option…</option>
                      {suggested.length > 0 && (
                        <optgroup label="Suggested for this category">
                          {suggested.map((m) => <option key={m._id} value={m.name}>{m.name}{m.values.length ? ` (${m.values.length})` : ""}</option>)}
                        </optgroup>
                      )}
                      <optgroup label={suggested.length ? "All other options" : "All options"}>
                        {availableMasters.filter((m) => !suggested.includes(m)).map((m) => <option key={m._id} value={m.name}>{m.name}{m.values.length ? ` (${m.values.length})` : ""}</option>)}
                      </optgroup>
                    </select>
                  )}
                  {suggested.slice(0, 4).map((m) => (
                    <button type="button" key={m._id} className="pdChip !h-8" onClick={() => addGroup(m.name)}><FiPlus /> {m.name}</button>
                  ))}
                  {newGroupName === null ? (
                    <button type="button" className="pdChip !h-8 !border-dashed" onClick={() => setNewGroupName("")}><FiPlus /> Custom…</button>
                  ) : (
                    <span className="flex gap-1.5">
                      <input autoFocus className="pdInput !h-8 !w-[180px]" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Option name, e.g. Strap"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGroup(newGroupName); } if (e.key === "Escape") setNewGroupName(null); }} />
                      <button type="button" className="pdBtn pdBtn--dark !h-8" onClick={() => addGroup(newGroupName)} disabled={!newGroupName.trim()}>Add</button>
                      <button type="button" className="pdIconBtn !h-8 !w-8" onClick={() => setNewGroupName(null)} aria-label="Cancel"><FiX /></button>
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                <button type="button" className="pdBtn pdBtn--dark" onClick={generate} disabled={!usedGroups.length}><FiRefreshCw /> {hasMatrix ? "Update combinations" : "Generate combinations"}</button>
                {hasMatrix && <button type="button" className="pdBtn pdBtn--light" onClick={() => setVariants([])}>Remove all variants</button>}
                <span className="text-[12px] text-gray-500">{usedGroups.length ? `${usedGroups.reduce((a, g) => a * g.values.length, 1)} combinations` : "No options — simple product"}</span>
              </div>

              {errors.variants && <div className="flex items-center gap-1 text-[12px] font-[600] text-[#dc2626]"><FiAlertCircle />{errors.variants}</div>}

              {hasMatrix && (
                <>
                  <div className="flex flex-wrap items-end gap-2 p-3 rounded-md bg-gray-50">
                    <span className="text-[12px] font-[600] text-gray-700 mr-1 self-center">Set for all:</span>
                    <div className="pdAffix w-[110px]"><span>₹</span><input type="number" min="0" className="pdInput pdNum !h-9" placeholder="Price" value={bulk.price} onChange={(e) => setBulk((b) => ({ ...b, price: e.target.value }))} /></div>
                    <div className="pdAffix w-[110px]"><span>₹</span><input type="number" min="0" className="pdInput pdNum !h-9" placeholder="MRP" value={bulk.oldprice} onChange={(e) => setBulk((b) => ({ ...b, oldprice: e.target.value }))} /></div>
                    <input type="number" min="0" className="pdInput pdNum !h-9 !w-[100px]" placeholder="Stock" value={bulk.stock} onChange={(e) => setBulk((b) => ({ ...b, stock: e.target.value }))} />
                    <button type="button" className="pdBtn pdBtn--light !h-9" onClick={applyBulk}>Apply</button>
                    <button type="button" className="pdBtn pdBtn--light !h-9 ml-auto" onClick={autoSku}>Auto-fill SKUs</button>
                  </div>
                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="pdTable">
                      <thead><tr><th>Variant</th><th>Photo</th><th>SKU</th><th>Price</th><th>MRP</th><th>Stock</th><th /></tr></thead>
                      <tbody>
                        {variants.map((v, i) => (
                          <tr key={vKey(v)}>
                            <td className="font-[600] text-gray-900 whitespace-nowrap">{comboLabel(v)}</td>
                            <td>
                              <select className="pdInput !h-9 !w-[110px]" value={v.image || ""} onChange={(e) => setV(i, "image", e.target.value)}>
                                <option value="">Cover</option>
                                {images.map((img, j) => <option key={img.src} value={img.src}>Image {j + 1}</option>)}
                              </select>
                            </td>
                            <td><input className="pdInput !h-9 min-w-[140px]" value={v.sku || ""} onChange={(e) => setV(i, "sku", e.target.value.toUpperCase())} placeholder="SKU" /></td>
                            <td><div className="pdAffix w-[110px]"><span>₹</span><input type="number" min="0" className={`pdInput pdNum !h-9 ${!(Number(v.price) > 0) && errors.variants ? "!border-[#ef4444]" : ""}`} value={v.price} onChange={(e) => setV(i, "price", e.target.value)} /></div></td>
                            <td><div className="pdAffix w-[110px]"><span>₹</span><input type="number" min="0" className="pdInput pdNum !h-9" value={v.oldprice} onChange={(e) => setV(i, "oldprice", e.target.value)} /></div></td>
                            <td><input type="number" min="0" className={`pdInput pdNum !h-9 !w-[90px] ${v.stock === "" && errors.variants ? "!border-[#ef4444]" : ""}`} value={v.stock} onChange={(e) => setV(i, "stock", e.target.value)} /></td>
                            <td><button type="button" className="pdIconBtn pdIconBtn--danger" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} aria-label="Remove variant"><FiTrash2 /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[12px] text-gray-500">{variants.length} variants · total stock {variantStock} · from {inr(fromPrice)}</div>
                </>
              )}
            </div>
          </Section>

          <Section id="specs" title="Specifications" sub={leafId ? (attrs.length ? `Fields from the ${[mainCat?.name, subCat?.name, thirdCat?.name].filter(Boolean).join(" › ")} template` : "This category has no template yet — add custom rows, or set up a template.") : "Choose a category to see its fields."}
            aside={leafId && <button type="button" className="text-[12px] font-[600] text-gray-500 hover:text-[#ff5252] flex items-center gap-1 whitespace-nowrap"
              onClick={() => { const cat = findPath(categories, leafId)?.slice(-1)[0]; if (cat && window.confirm("Open the category template? Unsaved changes in this form will be lost.")) context.setIsOpenFullScreenPanel({ open: true, model: "Product Details Template", data: cat }); }}><FiSliders /> Edit template</button>}>
            {errors.specs && <div className="mb-3 flex items-center gap-1 text-[12px] font-[600] text-[#dc2626]"><FiAlertCircle />{errors.specs}</div>}
            {attrs.length > 0 && (
              <div className="flex flex-col gap-5">
                {[...new Set(attrs.map((a) => a.group || "General"))].map((g) => (
                  <div key={g}>
                    <div className="text-[11px] font-[700] uppercase tracking-wide text-gray-400 mb-2">{g}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {attrs.filter((a) => (a.group || "General") === g).map((a) => {
                        const val = specVals[a.key] ?? "";
                        const setVal = (v) => { setSpecVals((s) => ({ ...s, [a.key]: v })); setErrors((e) => ({ ...e, specs: undefined })); };
                        const missing = errors.specs && a.required && !String(val).trim();
                        return (
                          <Field key={a.key} label={`${a.label}${a.unit ? ` (${a.unit})` : ""}`} req={a.required} className={a.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}>
                            {a.type === "select" ? (
                              <select className={`pdInput ${missing ? "!border-[#ef4444]" : ""}`} value={val} onChange={(e) => setVal(e.target.value)}>
                                <option value="">Select</option>
                                {a.options.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : a.type === "boolean" ? (
                              <div className="flex gap-1.5">{["Yes", "No"].map((o) => <button type="button" key={o} className={`pdChip flex-1 justify-center ${val === o ? "is-on" : ""}`} onClick={() => setVal(val === o ? "" : o)}>{o}</button>)}</div>
                            ) : a.type === "textarea" ? (
                              <textarea className={`pdInput !min-h-[80px] ${missing ? "!border-[#ef4444]" : ""}`} value={val} onChange={(e) => setVal(e.target.value)} />
                            ) : (
                              <input className={`pdInput ${a.type === "number" ? "pdNum" : ""} ${missing ? "!border-[#ef4444]" : ""}`} type={a.type === "number" ? "number" : "text"} value={val} onChange={(e) => setVal(e.target.value)} />
                            )}
                          </Field>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={attrs.length ? "mt-5 pt-4 border-t border-gray-100" : ""}>
              <div className="text-[11px] font-[700] uppercase tracking-wide text-gray-400 mb-2">Other details</div>
              {customSpecs.map((s, i) => (
                <div key={s._id} className="grid grid-cols-[1fr_1fr_80px_40px] gap-2 mb-2">
                  <input className="pdInput !h-9" value={s.label} onChange={(e) => setCustomSpecs((c) => c.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Name (e.g. Lining)" />
                  <input className="pdInput !h-9" value={s.value} onChange={(e) => setCustomSpecs((c) => c.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="Value (e.g. Suede)" />
                  <input className="pdInput !h-9" value={s.unit} onChange={(e) => setCustomSpecs((c) => c.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))} placeholder="Unit" />
                  <button type="button" className="pdIconBtn !h-9 !w-9" onClick={() => setCustomSpecs((c) => c.filter((_, j) => j !== i))} aria-label="Remove"><FiX /></button>
                </div>
              ))}
              <button type="button" className="text-[12px] font-[600] text-[#ff5252] flex items-center gap-1" onClick={() => setCustomSpecs((c) => [...c, { label: "", value: "", unit: "", group: "Other details", _id: Math.random() }])}><FiPlus /> Add row</button>
            </div>
          </Section>

          <Section id="shipping" title="Shipping" sub="Packed size and weight — used for courier charges.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Weight (g)">{numInput(f.shipping.weight, (v) => setIn("shipping", "weight", v))}</Field>
              <Field label="Length (cm)">{numInput(f.shipping.length, (v) => setIn("shipping", "length", v))}</Field>
              <Field label="Width (cm)">{numInput(f.shipping.width, (v) => setIn("shipping", "width", v))}</Field>
              <Field label="Height (cm)">{numInput(f.shipping.height, (v) => setIn("shipping", "height", v))}</Field>
              <Field label="Ships in (days)">{numInput(f.shipping.dispatchDays, (v) => setIn("shipping", "dispatchDays", v))}</Field>
              <div className="col-span-2 sm:col-span-3 flex flex-wrap items-end gap-6 pb-1.5">
                <Toggle on={f.shipping.codAvailable} onClick={() => setIn("shipping", "codAvailable", !f.shipping.codAvailable)} label="Cash on Delivery" hint="Allow COD for this product" />
                <Toggle on={f.shipping.freeShipping} onClick={() => setIn("shipping", "freeShipping", !f.shipping.freeShipping)} label="Always free shipping" hint="Even below the free-shipping amount" />
              </div>
            </div>
            {Number(f.shipping.length) > 0 && Number(f.shipping.width) > 0 && Number(f.shipping.height) > 0 && (
              <div className="mt-3 text-[12px] text-gray-500">Volumetric weight: <b className="text-gray-800">{((f.shipping.length * f.shipping.width * f.shipping.height) / 5000).toFixed(2)} kg</b> (L×W×H ÷ 5000) — couriers charge whichever is higher.</div>
            )}
          </Section>

          <Section id="legal" title="Legal & compliance" sub="Required on Indian e-commerce listings (Legal Metrology & Consumer Protection rules).">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Country of origin" req>
                <select className="pdInput" value={COUNTRIES.includes(f.compliance.countryOfOrigin) ? f.compliance.countryOfOrigin : "Other"} onChange={(e) => setIn("compliance", "countryOfOrigin", e.target.value === "Other" ? "" : e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {!COUNTRIES.slice(0, -1).includes(f.compliance.countryOfOrigin) && <input className="pdInput mt-2" placeholder="Country name" value={f.compliance.countryOfOrigin} onChange={(e) => setIn("compliance", "countryOfOrigin", e.target.value)} />}
              </Field>
              <Field label="Net quantity" hint="e.g. 1 N, 500 g, 1 kg, 250 ml"><input className="pdInput" value={f.compliance.netQuantity} onChange={(e) => setIn("compliance", "netQuantity", e.target.value)} /></Field>
              <Field label="Manufacturer name & address" className="sm:col-span-2"><textarea className="pdInput !min-h-[70px]" value={f.compliance.manufacturer} onChange={(e) => setIn("compliance", "manufacturer", e.target.value)} /></Field>
              <Field label="Packer name & address"><textarea className="pdInput !min-h-[70px]" value={f.compliance.packer} onChange={(e) => setIn("compliance", "packer", e.target.value)} /></Field>
              <Field label="Importer name & address" hint="Only for imported products"><textarea className="pdInput !min-h-[70px]" value={f.compliance.importer} onChange={(e) => setIn("compliance", "importer", e.target.value)} /></Field>
              <Field label="Month & year of manufacture"><input type="month" className="pdInput" value={f.compliance.mfgDate} onChange={(e) => setIn("compliance", "mfgDate", e.target.value)} /></Field>
              <Field label="Best before / expiry" hint="Food, supplements, cosmetics"><input type="month" className="pdInput" value={f.compliance.expiryDate} onChange={(e) => setIn("compliance", "expiryDate", e.target.value)} /></Field>
              <Field label="Licence / certification no." hint="FSSAI, BIS, hallmark (HUID)…"><input className="pdInput" value={f.compliance.licenseNo} onChange={(e) => setIn("compliance", "licenseNo", e.target.value)} /></Field>
              <Field label="Customer care (phone / email)"><input className="pdInput" value={f.compliance.customerCare} onChange={(e) => setIn("compliance", "customerCare", e.target.value)} /></Field>
            </div>
          </Section>

          <Section id="policy" title="Returns & warranty">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="sm:col-span-3"><Toggle on={f.policy.returnable} onClick={() => setIn("policy", "returnable", !f.policy.returnable)} label="Returnable" hint="Customers can return or replace this item" /></div>
              {f.policy.returnable && <>
                <Field label="Type">
                  <select className="pdInput" value={f.policy.returnType === "none" ? "return" : f.policy.returnType} onChange={(e) => setIn("policy", "returnType", e.target.value)}>
                    <option value="return">Return / refund</option>
                    <option value="replace">Replacement only</option>
                  </select>
                </Field>
                <Field label="Within (days)">{numInput(f.policy.returnDays, (v) => setIn("policy", "returnDays", v))}</Field>
              </>}
              <Field label="Warranty (months)" hint="0 = no warranty" className={f.policy.returnable ? "" : "sm:col-start-1"}>{numInput(f.policy.warrantyMonths, (v) => setIn("policy", "warrantyMonths", v))}</Field>
              <Field label="Warranty by">
                <select className="pdInput" value={f.policy.warrantyType} onChange={(e) => setIn("policy", "warrantyType", e.target.value)} disabled={!Number(f.policy.warrantyMonths)}>
                  <option value="">—</option><option>Brand</option><option>Seller</option><option>Manufacturer</option>
                </select>
              </Field>
              <Field label="What's in the box" className="sm:col-span-3"><input className="pdInput" value={f.policy.inTheBox} onChange={(e) => setIn("policy", "inTheBox", e.target.value)} placeholder="e.g. 1 Handbag, 1 Dust bag, Care card" /></Field>
            </div>
          </Section>

          <Section id="seo" title="Search engine listing" sub="How this product appears on Google.">
            <div className="p-3 rounded-md border border-gray-100 bg-gray-50 mb-4">
              <div className="text-[12px] text-[#15803d] truncate">yourstore.com/product/{f.seo.slug || slugify(f.name) || "product-name"}</div>
              <div className="text-[16px] text-[#1a0dab] truncate">{f.seo.metaTitle || f.name || "Product title"}</div>
              <div className="text-[12px] text-gray-600 line-clamp-2">{f.seo.metaDescription || f.shortDescription || f.description.slice(0, 160) || "Product description will appear here."}</div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="URL handle"><input className="pdInput" value={f.seo.slug} onChange={(e) => { slugTouched.current = true; setIn("seo", "slug", slugify(e.target.value)); }} /></Field>
              <Field label="Meta title" hint={`${f.seo.metaTitle.length}/60 recommended`}><input className="pdInput" maxLength={120} value={f.seo.metaTitle} onChange={(e) => setIn("seo", "metaTitle", e.target.value)} placeholder={f.name} /></Field>
              <Field label="Meta description" hint={`${f.seo.metaDescription.length}/160 recommended`}><textarea className="pdInput !min-h-[70px]" maxLength={300} value={f.seo.metaDescription} onChange={(e) => setIn("seo", "metaDescription", e.target.value)} /></Field>
            </div>
          </Section>
        </div>

        {/* Right column */}
        <aside className="pdPanel__aside">
          <section className="pdCard">
            <div className="pdCard__title mb-3">Status</div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-md">
              {[["active", "Active"], ["draft", "Draft"], ["archived", "Archived"]].map(([k, l]) => (
                <button type="button" key={k} onClick={() => set("status", k)} className={`h-8 rounded text-[12px] font-[600] ${f.status === k ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{l}</button>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-gray-500">{{ active: "Visible on the store.", draft: "Hidden from the store while you work on it.", archived: "Hidden. Kept for old orders and records." }[f.status]}</div>
          </section>

          <section className="pdCard">
            <div className="pdCard__title mb-3">Organisation</div>
            <div className="flex flex-col gap-3">
              <Field label="Category" req err={errors.catId}>
                <select className={`pdInput ${bad("catId")}`} value={f.catId} onChange={(e) => { setF((p) => ({ ...p, catId: e.target.value, subCatId: "", thirdSubCatId: "" })); setErrors((x) => ({ ...x, catId: undefined })); }}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Sub-category">
                <select className="pdInput" value={f.subCatId} disabled={!mainCat?.children?.length} onChange={(e) => setF((p) => ({ ...p, subCatId: e.target.value, thirdSubCatId: "" }))}>
                  <option value="">{mainCat?.children?.length ? "Select sub-category" : "None available"}</option>
                  {(mainCat?.children || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Third level">
                <select className="pdInput" value={f.thirdSubCatId} disabled={!subCat?.children?.length} onChange={(e) => set("thirdSubCatId", e.target.value)}>
                  <option value="">{subCat?.children?.length ? "Select third level" : "None available"}</option>
                  {(subCat?.children || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
              <span className="pdLabel !mb-0">Show on home page</span>
              {FLAGS.map((fl) => <Toggle key={fl.key} on={f.productFlags.includes(fl.key)} onClick={() => toggleIn("productFlags", fl.key)} label={fl.label} hint={fl.hint} />)}
            </div>
          </section>

          <section className="pdCard">
            <div className="flex items-center justify-between mb-2">
              <div className="pdCard__title">Listing quality</div>
              <span className="text-[12px] font-[700] text-gray-900">{score}/{checks.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3"><div className="h-full bg-[#10b981] transition-all" style={{ width: `${(score / checks.length) * 100}%` }} /></div>
            <div className="flex flex-col gap-1.5">
              {checks.map(([l, ok]) => (
                <div key={l} className={`flex items-center gap-2 text-[12px] ${ok ? "text-gray-700" : "text-gray-400"}`}>
                  {ok ? <FiCheckCircle className="text-[#10b981]" /> : <FiCircle />}{l}
                </div>
              ))}
            </div>
          </section>

          <section className="pdCard">
            <div className="pdCard__title mb-3">Card preview</div>
            <div className="border border-gray-100 rounded-md overflow-hidden">
              <div className="relative aspect-[5/4] bg-gray-50">
                {images[0] ? <img src={images[0].src} alt="" className="w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-[12px] text-gray-400">No image</div>}
                {discount > 0 && !hasMatrix && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#ff5252] text-white text-[11px] font-[700]">-{discount}%</span>}
              </div>
              <div className="p-3">
                <div className="text-[10px] font-[600] uppercase tracking-wide text-gray-400 truncate">{f.brand || "Brand"}</div>
                <div className="text-[13px] font-[600] text-gray-900 truncate">{f.name || "Product name"}</div>
                <div className="flex items-center gap-0.5 mt-1 text-[11px] text-[#f59e0b]">{[1, 2, 3, 4, 5].map((n) => <FiStar key={n} className={f.rating >= n ? "fill-[#f59e0b]" : "text-gray-200"} />)}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[15px] font-[700] text-gray-900">{hasMatrix && priced.length > 1 ? `From ${inr(fromPrice)}` : inr(hasMatrix ? fromPrice : price)}</span>
                  {discount > 0 && !hasMatrix && <span className="text-[12px] text-gray-400 line-through">{inr(mrp)}</span>}
                </div>
              </div>
            </div>
          </section>

          <button type="submit" disabled={saving} className="pdBtn pdBtn--dark !h-[46px] !text-[14px]">
            {saving ? <CircularProgress size={20} color="inherit" /> : isEdit ? "Save changes" : f.status === "draft" ? "Save draft" : "Publish product"}
          </button>
          <button type="button" className="pdBtn pdBtn--light" onClick={() => context.setIsOpenFullScreenPanel({ open: false })}>Cancel</button>
        </aside>
      </div>
    </form>
  );
};

export default ProductForm;
