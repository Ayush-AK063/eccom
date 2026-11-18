// 1250 → "₹1,250.00"
export const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

// Purane products / cart items ke fixed fields ↔ option naam
const LEGACY = [
  ["size", "Size"],
  ["color", "Colour"],
  ["productRam", "RAM"],
  ["productWeight", "Weight"],
];
const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

// Product ke option groups: [{ key: "Size", label: "Size", display, unit, values, hex }]
export const optionFields = (product) => {
  const groups = (product?.variantOptions || []).filter((g) => g?.name && g.values?.length);
  if (groups.length) {
    return groups.map((g) => ({ key: g.name, label: g.name, display: g.display || "buttons", unit: g.unit || "", values: g.values, hex: g.hex || {} }));
  }
  return LEGACY.map(([k, name]) => ({ key: name, label: name, display: name === "Colour" ? "swatch" : "buttons", unit: "", values: toArr(product?.[k]), hex: {} }))
    .filter((g) => g.values.length);
};

// { Size: ["S","M"], Flavour: [...] }
export const getVariantOptions = (product) => Object.fromEntries(optionFields(product).map((g) => [g.key, g.values]));

export const hasVariants = (product) => optionFields(product).length > 0;

// Cart item / order line / variant ka selection: { Size: "M" }
export const selectionOf = (item) => {
  if (item?.options && Object.keys(item.options).length) return { ...item.options };
  const o = {};
  LEGACY.forEach(([k, name]) => { if (item?.[k]) o[name] = item[k]; });
  return o;
};

// Dikhane ke liye: [["Size","M"], ["Colour","Black"]]
export const optionEntries = (item) => Object.entries(selectionOf(item)).filter(([, v]) => v);

const sameSelection = (a = {}, b = {}) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] || "") === (b[k] || ""));
};

// Har option group chuna gaya?
export const isVariantComplete = (product, variant = {}) =>
  optionFields(product).every((g) => Boolean(variant[g.key]));

// Cart item is product + selection ka hai?
export const isSameCartItem = (cartItem, product, variant = {}) =>
  cartItem?.productId?._id === product?._id && sameSelection(selectionOf(cartItem), variant);

// ── Variant matrix (har combination ka apna price / stock / photo) ──
export const hasMatrix = (product) => (product?.variants || []).length > 0;

export const findVariant = (product, sel = {}) =>
  (product?.variants || []).find((v) => sameSelection(selectionOf(v), sel)) || null;

// Kya ye value (baaki chune hue options ke saath) kisi in-stock variant mein hai?
export const isOptionAvailable = (product, sel, key, value) => {
  if (!hasMatrix(product)) return true;
  const want = { ...sel, [key]: value };
  return product.variants.some((v) => {
    const o = selectionOf(v);
    return v.stock > 0 && Object.entries(want).every(([k, x]) => !x || o[k] === x);
  });
};

// Product + chuna hua option → { price, oldprice, stock, image, sku, discount }
export const variantView = (product, sel = {}) => {
  const v = hasMatrix(product) && isVariantComplete(product, sel) ? findVariant(product, sel) : null;
  const price = v?.price > 0 ? v.price : product?.price || 0;
  const oldprice = v ? (v.oldprice > v.price ? v.oldprice : v.price) : product?.oldprice || 0;
  return {
    variant: v,
    price,
    oldprice,
    discount: oldprice > price ? Math.round(((oldprice - price) / oldprice) * 100) : 0,
    stock: v ? v.stock || 0 : product?.countInStock || 0,
    image: v?.image || "",
    sku: v?.sku || product?.sku || "",
    hasRange: hasMatrix(product) && !v && new Set(product.variants.map((x) => x.price)).size > 1,
  };
};
