// Policy / info pages ke DRAFT (sirf headings) — admin apni jaankari bhar ke publish kare.
// Chalao: node scripts/seedPages.js  (jo slug pehle se hai use nahi chhedta)
import "dotenv/config";
import mongoose from "mongoose";
import { Page } from "../models/Page.js";

const PAGES = [
  ["About us", "about-us", "company", "## Who we are\n\n## What we sell\n\n## Why shop with us"],
  ["Contact us", "contact-us", "help", "## Customer support\n\nEmail:\nPhone:\nHours:\n\n## Registered address"],
  ["Shipping policy", "shipping-policy", "help", "## Delivery time\n\n## Shipping charges\n\n## Where we deliver\n\n## Order tracking"],
  ["Returns & refunds", "returns-refunds", "help", "## Return window\n\n## Items that can't be returned\n\n## How to request a return\n\n## Refund timeline"],
  ["FAQ", "faq", "help", "## How do I track my order?\n\n## Can I cancel my order?\n\n## Do you offer Cash on Delivery?"],
  ["Privacy policy", "privacy-policy", "legal", "## Information we collect\n\n## How we use it\n\n## Cookies\n\n## Your rights\n\n## Contact"],
  ["Terms & conditions", "terms-conditions", "legal", "## Using this website\n\n## Orders and pricing\n\n## Payments\n\n## Limitation of liability\n\n## Governing law"],
];

await mongoose.connect(process.env.MONGO_URI);
let n = 0;
for (const [i, [title, slug, footerGroup, content]] of PAGES.entries()) {
  if (await Page.exists({ slug })) continue;
  await Page.create({ title, slug, footerGroup, content, status: "draft", sortOrder: i });
  n++;
}
console.log(`Created ${n} draft page(s)`);
await mongoose.disconnect();
