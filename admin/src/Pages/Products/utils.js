export const inr = (v) => "₹" + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
export const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
export const LOW_STOCK = 5;
