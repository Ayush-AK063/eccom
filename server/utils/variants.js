// Cart + order dono ke liye: chuna gaya option → asli variant (price / stock)
// Selection = { "Size": "M", "Colour": "Black" } (option group ke naam se)

export const VARIANT_FIELDS = [
  ["size", "Size"],
  ["productRam", "RAM"],
  ["productWeight", "Weight"],
  ["color", "Colour"],
];

export const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

// Product ke option groups (naya variantOptions, warna purane arrays)
export const optionGroups = (product) => {
  const g = (product?.variantOptions || []).filter((x) => x.name && x.values?.length);
  if (g.length) return g.map((x) => ({ name: x.name, values: x.values }));
  return VARIANT_FIELDS.map(([k, name]) => ({ name, values: toArr(product?.[k]) })).filter((x) => x.values.length);
};

// Body se selection: { options: {...} } ya purane fields (size, productRam…)
export const selectionFromBody = (body = {}, product) => {
  const groups = optionGroups(product);
  const raw = body.options && typeof body.options === "object" ? body.options : {};
  const out = {};
  for (const g of groups) {
    let v = raw[g.name];
    if (v === undefined) {
      const legacy = VARIANT_FIELDS.find(([, n]) => n.toLowerCase() === g.name.toLowerCase() || (g.name.toLowerCase() === "color" && n === "Colour"));
      if (legacy) v = body[legacy[0]];
    }
    out[g.name] = String(v ?? "").trim();
  }
  return out;
};

// Cart item / order line ka selection (naya options, warna purane fields)
export const selectionOf = (item, product) => {
  if (item?.options && Object.keys(item.options).length) return { ...item.options };
  return selectionFromBody(item || {}, product);
};

export const sameSelection = (a = {}, b = {}) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] || "") === (b[k] || ""));
};

export const hasVariantMatrix = (product) => (product?.variants || []).length > 0;

export const findVariant = (product, sel = {}) =>
  (product?.variants || []).find((v) => sameSelection(v.options || {}, sel)) || null;

// Har group ka value chuna hai aur valid hai? → error message ya null
export const validateSelection = (product, sel) => {
  for (const g of optionGroups(product)) {
    if (!sel[g.name]) return `Please select ${g.name.toLowerCase()}`;
    if (!g.values.includes(sel[g.name])) return `Invalid ${g.name.toLowerCase()}`;
  }
  return null;
};

// Legacy fields bhi (purane screens / filters ke liye)
export const legacyFields = (sel = {}) => {
  const out = { size: "", productRam: "", productWeight: "", color: "" };
  for (const [k, name] of VARIANT_FIELDS) {
    const hit = Object.keys(sel).find((n) => n.toLowerCase() === name.toLowerCase() || (name === "Colour" && n.toLowerCase() === "color"));
    if (hit) out[k] = sel[hit];
  }
  return out;
};

export const stockFor = (product, sel) => (hasVariantMatrix(product) ? findVariant(product, sel)?.stock || 0 : product?.countInStock || 0);
export const priceFor = (product, sel) => {
  const v = hasVariantMatrix(product) ? findVariant(product, sel) : null;
  return v?.price > 0 ? v.price : product?.price || 0;
};
export const imageFor = (product, sel) => {
  const v = hasVariantMatrix(product) ? findVariant(product, sel) : null;
  return v?.image || product?.images?.[0] || "";
};
export const maxQtyFor = (product, sel) => {
  const stock = stockFor(product, sel);
  return product?.maxOrderQty > 0 ? Math.min(stock, product.maxOrderQty) : stock;
};
