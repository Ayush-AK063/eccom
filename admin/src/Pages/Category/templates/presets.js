// Ready-made "product details" templates. Admin kisi category par apply karke edit kar sakta hai.
// type: text | number | select | boolean | textarea
const t = (label, opts = {}) => ({ label, type: "text", unit: "", options: [], group: "General", required: false, ...opts });
const sel = (label, options, opts = {}) => t(label, { type: "select", options, ...opts });
const n = (label, unit, opts = {}) => t(label, { type: "number", unit, ...opts });
const yes = (label, opts = {}) => t(label, { type: "boolean", ...opts });

const GENDER = ["Men", "Women", "Unisex", "Boys", "Girls"];

export const PRESETS = {
  clothing: {
    label: "Clothing / Apparel",
    attributes: [
      sel("Gender", GENDER, { group: "General", required: true }),
      sel("Fit", ["Slim", "Regular", "Relaxed", "Oversized", "Skinny"], { group: "Style" }),
      t("Fabric", { group: "Material", required: true }),
      sel("Pattern", ["Solid", "Printed", "Striped", "Checked", "Graphic", "Embroidered"], { group: "Style" }),
      sel("Sleeve length", ["Sleeveless", "Short", "3/4", "Full"], { group: "Style" }),
      sel("Neck", ["Round", "V-neck", "Collar", "Polo", "Hooded", "Mandarin"], { group: "Style" }),
      sel("Occasion", ["Casual", "Formal", "Party", "Sports", "Ethnic", "Lounge"], { group: "Style" }),
      t("Wash care", { group: "Care", type: "textarea" }),
      t("Model wears", { group: "Fit & size", unit: "", options: [] }),
      n("Model height", "cm", { group: "Fit & size" }),
    ],
  },
  footwear: {
    label: "Footwear",
    attributes: [
      sel("Gender", GENDER, { required: true }),
      sel("Type", ["Sneakers", "Sports shoes", "Formal", "Loafers", "Sandals", "Flip-flops", "Boots", "Heels"]),
      t("Upper material", { group: "Material" }),
      t("Sole material", { group: "Material" }),
      sel("Closure", ["Lace-up", "Slip-on", "Velcro", "Buckle", "Zip"], { group: "Style" }),
      n("Heel height", "cm", { group: "Style" }),
      sel("Size standard", ["UK", "US", "EU", "IND"], { group: "Fit & size" }),
      sel("Occasion", ["Casual", "Sports", "Formal", "Party", "Outdoor"], { group: "Style" }),
    ],
  },
  bags: {
    label: "Bags & Luggage",
    attributes: [
      sel("Type", ["Handbag", "Tote", "Sling", "Backpack", "Clutch", "Wallet", "Duffle", "Trolley", "Laptop bag"], { required: true }),
      t("Material", { group: "Material", required: true }),
      n("Length", "cm", { group: "Dimensions" }), n("Width", "cm", { group: "Dimensions" }), n("Height", "cm", { group: "Dimensions" }),
      n("Capacity", "L", { group: "Dimensions" }),
      n("Compartments", "", { group: "Features" }),
      sel("Closure", ["Zip", "Magnetic", "Button", "Drawstring", "Flap", "Open"], { group: "Features" }),
      n("Fits laptop up to", "inch", { group: "Features" }),
      yes("Water resistant", { group: "Features" }),
    ],
  },
  watches: {
    label: "Watches",
    attributes: [
      sel("Gender", GENDER, { required: true }),
      sel("Display", ["Analog", "Digital", "Analog-Digital", "Smart"], { required: true }),
      sel("Movement", ["Quartz", "Automatic", "Mechanical", "Solar"], { group: "Technical" }),
      sel("Dial shape", ["Round", "Square", "Rectangle", "Tonneau"], { group: "Dial" }),
      n("Dial size", "mm", { group: "Dial" }),
      t("Dial colour", { group: "Dial" }),
      t("Strap material", { group: "Strap" }),
      n("Water resistance", "m", { group: "Technical" }),
      sel("Glass", ["Mineral", "Sapphire", "Acrylic", "Gorilla glass"], { group: "Technical" }),
    ],
  },
  jewellery: {
    label: "Jewellery",
    attributes: [
      sel("Type", ["Ring", "Necklace", "Earrings", "Bracelet", "Bangle", "Pendant", "Anklet", "Set"], { required: true }),
      sel("Metal", ["Gold", "Silver", "Platinum", "Brass", "Alloy", "Stainless steel"], { group: "Material", required: true }),
      sel("Purity", ["24K", "22K", "18K", "14K", "925 Sterling", "Not applicable"], { group: "Material" }),
      t("BIS hallmark / HUID", { group: "Certification" }),
      n("Gross weight", "g", { group: "Material" }),
      t("Stone", { group: "Material" }),
      sel("Plating", ["None", "Gold plated", "Rhodium plated", "Silver plated"], { group: "Material" }),
      t("Length / ring size", { group: "Fit & size" }),
    ],
  },
  eyewear: {
    label: "Sunglasses & Eyewear",
    attributes: [
      sel("Gender", GENDER),
      sel("Frame shape", ["Aviator", "Wayfarer", "Round", "Square", "Cat-eye", "Rectangle", "Oversized"], { group: "Frame", required: true }),
      t("Frame material", { group: "Frame" }),
      t("Lens colour", { group: "Lens" }),
      yes("Polarized", { group: "Lens" }),
      sel("UV protection", ["UV400", "UV380", "None"], { group: "Lens" }),
      n("Lens width", "mm", { group: "Dimensions" }), n("Bridge width", "mm", { group: "Dimensions" }), n("Temple length", "mm", { group: "Dimensions" }),
    ],
  },
  mobiles: {
    label: "Mobiles & Tablets",
    attributes: [
      t("Processor", { group: "Performance", required: true }),
      n("RAM", "GB", { group: "Performance" }), n("Storage", "GB", { group: "Performance" }),
      yes("Expandable storage", { group: "Performance" }),
      n("Screen size", "inch", { group: "Display" }),
      sel("Display type", ["AMOLED", "OLED", "LCD", "IPS LCD"], { group: "Display" }),
      n("Refresh rate", "Hz", { group: "Display" }),
      t("Rear camera", { group: "Camera", unit: "MP" }), t("Front camera", { group: "Camera", unit: "MP" }),
      n("Battery", "mAh", { group: "Battery", required: true }), n("Charging", "W", { group: "Battery" }),
      t("Operating system", { group: "Software" }),
      yes("5G", { group: "Connectivity" }),
      sel("SIM", ["Single", "Dual", "Dual + eSIM", "eSIM"], { group: "Connectivity" }),
      n("Weight", "g", { group: "Dimensions" }),
    ],
  },
  laptops: {
    label: "Laptops & Computers",
    attributes: [
      t("Processor", { group: "Performance", required: true }),
      n("RAM", "GB", { group: "Performance" }), yes("RAM upgradable", { group: "Performance" }),
      n("SSD", "GB", { group: "Storage" }), n("HDD", "GB", { group: "Storage" }),
      t("Graphics", { group: "Performance" }),
      n("Screen size", "inch", { group: "Display" }), t("Resolution", { group: "Display" }),
      t("Operating system", { group: "Software" }),
      n("Battery life", "hours", { group: "Battery" }),
      t("Ports", { group: "Connectivity", type: "textarea" }),
      n("Weight", "kg", { group: "Dimensions" }),
    ],
  },
  appliances: {
    label: "Electronics & Appliances",
    attributes: [
      n("Power", "W", { group: "Technical" }), n("Voltage", "V", { group: "Technical" }),
      t("Capacity", { group: "Technical" }),
      sel("Energy rating", ["1 star", "2 star", "3 star", "4 star", "5 star", "Not rated"], { group: "Technical" }),
      n("Length", "cm", { group: "Dimensions" }), n("Width", "cm", { group: "Dimensions" }), n("Height", "cm", { group: "Dimensions" }),
      yes("Free installation", { group: "Service" }),
      t("BIS registration no.", { group: "Certification" }),
    ],
  },
  supplements: {
    label: "Protein & Supplements",
    attributes: [
      sel("Type", ["Whey protein", "Plant protein", "Mass gainer", "Creatine", "BCAA", "Pre-workout", "Multivitamin", "Omega-3"], { required: true }),
      t("Flavour", { group: "General", required: true }),
      sel("Diet", ["Veg", "Non-veg", "Vegan"], { group: "General", required: true }),
      n("Servings", "", { group: "Serving" }), n("Serving size", "g", { group: "Serving" }),
      n("Protein per serving", "g", { group: "Nutrition (per serving)" }),
      n("Energy per serving", "kcal", { group: "Nutrition (per serving)" }),
      n("Carbohydrates", "g", { group: "Nutrition (per serving)" }), n("Sugar", "g", { group: "Nutrition (per serving)" }),
      n("Fat", "g", { group: "Nutrition (per serving)" }),
      t("Ingredients", { group: "Ingredients", type: "textarea" }),
      t("Allergens", { group: "Ingredients" }),
      t("How to use", { group: "Usage", type: "textarea" }),
      t("Certifications", { group: "Certification" }),
    ],
  },
  grocery: {
    label: "Grocery & Food",
    attributes: [
      sel("Diet", ["Veg", "Non-veg", "Vegan"], { required: true }),
      t("Ingredients", { group: "Ingredients", type: "textarea" }),
      t("Nutrition (per 100 g)", { group: "Nutrition", type: "textarea" }),
      t("Allergens", { group: "Ingredients" }),
      t("Shelf life", { group: "Storage" }),
      t("Storage instructions", { group: "Storage" }),
      yes("Organic", { group: "Certification" }),
    ],
  },
  beauty: {
    label: "Beauty & Personal Care",
    attributes: [
      sel("For", ["Face", "Hair", "Body", "Lips", "Eyes", "Nails"], { required: true }),
      sel("Skin / hair type", ["All", "Dry", "Oily", "Combination", "Sensitive", "Normal"]),
      t("Concern", {}),
      t("Key ingredients", { group: "Ingredients", type: "textarea" }),
      n("SPF", "", { group: "Features" }),
      n("Period after opening", "months", { group: "Usage" }),
      yes("Cruelty free", { group: "Certification" }), yes("Vegan", { group: "Certification" }), yes("Dermatologically tested", { group: "Certification" }),
      t("How to use", { group: "Usage", type: "textarea" }),
    ],
  },
  collectibles: {
    label: "Anime figures / Collectibles / Toys",
    attributes: [
      t("Character", { required: true }),
      t("Series / franchise", { required: true }),
      t("Manufacturer", { group: "Product" }),
      sel("Authenticity", ["Original (licensed)", "Replica / fan-made"], { group: "Product", required: true }),
      sel("Edition", ["Standard", "Limited", "Exclusive", "Prize figure"], { group: "Product" }),
      sel("Scale", ["Non-scale", "1/4", "1/6", "1/7", "1/8", "1/10", "1/12"], { group: "Dimensions" }),
      n("Height", "cm", { group: "Dimensions", required: true }), n("Width", "cm", { group: "Dimensions" }), n("Depth", "cm", { group: "Dimensions" }),
      t("Material", { group: "Product" }),
      t("Box contents", { group: "Product", type: "textarea" }),
      sel("Age", ["3+", "6+", "8+", "12+", "14+", "15+", "18+"], { group: "Safety" }),
      t("BIS toy certification", { group: "Safety" }),
    ],
  },
  furniture: {
    label: "Furniture & Home",
    attributes: [
      t("Material", { required: true, group: "Material" }), t("Finish", { group: "Material" }),
      n("Length", "cm", { group: "Dimensions" }), n("Width", "cm", { group: "Dimensions" }), n("Height", "cm", { group: "Dimensions" }),
      n("Weight capacity", "kg", { group: "Dimensions" }),
      sel("Assembly", ["Pre-assembled", "DIY", "Carpenter assembly"], { group: "Setup" }),
      sel("Room", ["Living room", "Bedroom", "Dining", "Office", "Kitchen", "Outdoor"]),
    ],
  },
  books: {
    label: "Books",
    attributes: [
      t("Author", { required: true }), t("Publisher"), t("ISBN"),
      t("Language"), n("Pages", ""),
      sel("Binding", ["Paperback", "Hardcover", "Board book"]),
      t("Edition"),
    ],
  },
  sports: {
    label: "Sports & Fitness",
    attributes: [
      t("Sport / activity", { required: true }), t("Material", { group: "Material" }),
      n("Item weight", "kg", { group: "Dimensions" }),
      sel("Skill level", ["Beginner", "Intermediate", "Professional"]),
    ],
  },
};
