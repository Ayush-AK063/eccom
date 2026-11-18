// Har banner type storefront par kahan / kis shape mein dikhta hai
export const SLIDE_TYPES = [
  { value: "Left Big Banner", short: "Hero slider", where: "Home hero — big auto-playing slider (left)", ratio: "16 / 9", size: "1600 × 900", fields: ["bannerHeading", "title", "startAtOnlyPrice"], live: true },
  { value: "Right Top Banner", short: "Hero right · top", where: "Home hero — small card, top right (first one is used)", ratio: "16 / 9", size: "800 × 450", fields: ["bannerHeading", "startAtOnlyPrice"], live: true, single: true },
  { value: "Right Down Banner", short: "Hero right · bottom", where: "Home hero — small card, bottom right (first one is used)", ratio: "16 / 9", size: "800 × 450", fields: ["bannerHeading", "startAtOnlyPrice"], live: true, single: true },
  { value: "v2 Banner", short: "Wide banner", where: "Home — full-width banner after Latest Products", ratio: "4 / 1", size: "1600 × 400", fields: [], live: true },
];

export const typeInfo = (v) => SLIDE_TYPES.find((t) => t.value === v) || SLIDE_TYPES[0];

export const FIELD_LABELS = {
  bannerHeading: { label: "Heading", placeholder: "e.g. Big Saving Day Sale" },
  title: { label: "Title", placeholder: "e.g. Women's Handbags" },
  startAtOnlyPrice: { label: "Starting price (₹)", placeholder: "e.g. 499" },
};
