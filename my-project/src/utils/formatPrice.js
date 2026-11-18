// 1250 → "₹1,250.00"
export const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

export const VARIANT_FIELDS = [
  { key: "size", label: "Size" },
  { key: "productRam", label: "RAM" },
  { key: "productWeight", label: "Weight" },
];

// Product ke variant options: { size: ["S","M"], productRam: [], productWeight: ["1kg"] }
export const getVariantOptions = (product) => {
  const out = {};
  VARIANT_FIELDS.forEach(({ key }) => {
    const v = product?.[key];
    out[key] = (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
  });
  return out;
};

export const hasVariants = (product) =>
  Object.values(getVariantOptions(product)).some((list) => list.length > 0);

// Jis field ke options hain, uska value chuna gaya hai?
export const isVariantComplete = (product, variant = {}) => {
  const options = getVariantOptions(product);
  return VARIANT_FIELDS.every(({ key }) => options[key].length === 0 || Boolean(variant[key]));
};

// Cart item is product + variant ka hai?
export const isSameCartItem = (cartItem, product, variant = {}) =>
  cartItem?.productId?._id === product?._id &&
  VARIANT_FIELDS.every(({ key }) => (cartItem?.[key] || "") === (variant[key] || ""));
