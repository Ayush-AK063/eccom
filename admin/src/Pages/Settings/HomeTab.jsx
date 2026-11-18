import React, { useEffect, useState } from "react";
import { FiArrowUp, FiArrowDown, FiPlus, FiX, FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { getData, postData } from "../../utils/api";
import { Field, Card, Toggle, Num, ImagePick, imgSrc } from "./ui";

// Har section kya hai + kahan se data aata hai (admin ko samajh aaye)
const INFO = {
  hero: ["Main banners", "Big slider + 2 side banners. Images: Home Slides."],
  categories: ["Shop by Category", "Your main categories with their images."],
  popular: ["Popular Products", "Product slider — source below."],
  deals: ["Today's Best Deals", "Discounted products with a countdown — settings below."],
  budget: ["Shop by Budget", "“Deals under ₹X” tiles — tiers below."],
  freeShipping: ["Free shipping strip", "Text comes from Shipping & checkout. Hidden when shipping isn't free."],
  collections: ["Shop by Collection", "Image tiles linking to a category or any page — edit below."],
  latest: ["Latest Products", "Product slider — source below."],
  wideBanner: ["Wide banners", "4:1 banners (Home Slides → type “v2 Banner”)."],
  featured: ["Featured Products", "Products marked “Featured” in the product form."],
  blog: ["From the Blog", "Published blog posts."],
};
const NO_TITLE = ["hero", "wideBanner"];
const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

// Products search + chosen list (Deals → manual)
const ProductPicker = ({ ids, onChange }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [chosen, setChosen] = useState([]);

  useEffect(() => {
    if (!ids.length) return setChosen([]);
    postData("/api/product/filters", { ids, limit: 30 }).then((res) => {
      const list = res?.products || [];
      setChosen(ids.map((id) => list.find((p) => p._id === id)).filter(Boolean));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return setResults([]);
    const t = setTimeout(() => getData(`/api/product?search=${encodeURIComponent(term)}&perPage=8`).then((res) => setResults(res?.products || [])), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <div className="relative">
        <div className="pdSearch"><FiSearch className="text-gray-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products to add…" /></div>
        {results.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[260px] overflow-auto">
            {results.map((p) => {
              const on = ids.includes(p._id);
              return (
                <button type="button" key={p._id} disabled={on} onClick={() => { onChange([...ids, p._id]); setQ(""); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50">
                  <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                  <span className="flex-1 min-w-0 text-[13px] truncate">{p.name}</span>
                  <span className="text-[12px] text-gray-500">{inr(p.price)}{p.discount ? ` · ${p.discount}% off` : ""}</span>
                  {on && <span className="text-[11px] text-gray-400">Added</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {chosen.length > 0 ? (
        <div className="mt-2 flex flex-col gap-1.5">
          {chosen.map((p, i) => (
            <div key={p._id} className="flex items-center gap-2 border border-gray-100 rounded-md px-2 py-1.5">
              <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
              <span className="flex-1 min-w-0 text-[13px] truncate">{p.name}</span>
              <span className="text-[12px] text-gray-500 whitespace-nowrap">{inr(p.price)}{p.discount ? ` · ${p.discount}% off` : ""}{p.countInStock <= 0 ? " · out of stock" : ""}</span>
              <button type="button" className="pdIconBtn !w-7 !h-7" disabled={i === 0} onClick={() => { const n = [...ids]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}><FiArrowUp /></button>
              <button type="button" className="pdIconBtn pdIconBtn--danger !w-7 !h-7" onClick={() => onChange(ids.filter((x) => x !== p._id))}><FiX /></button>
            </div>
          ))}
        </div>
      ) : <div className="pdHint">No products chosen — the section stays hidden.</div>}
    </div>
  );
};

// India ki date "YYYY-MM-DD" (store bhi isi se din badalta hai)
const istDate = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const dayLabel = (key, todayKey) => {
  const d = new Date(key + "T00:00:00+05:30");
  const diff = Math.round((d - new Date(todayKey + "T00:00:00+05:30")) / 864e5);
  const name = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  return diff === 0 ? `Today · ${name}` : diff === 1 ? `Tomorrow · ${name}` : name;
};

// Har din ke deal products — raat 12 baje (India) agla din apne aap live
const DealCalendar = ({ schedule = [], onChange, emptyDay, setEmptyDay }) => {
  const todayKey = istDate(new Date());
  const [days, setDays] = useState(14);
  const [open, setOpen] = useState(todayKey);
  const keys = [...Array(days)].map((_, i) => istDate(new Date(Date.now() + i * 864e5)));
  const byDate = Object.fromEntries(schedule.map((x) => [x.date, x.productIds || []]));
  const setDay = (key, ids) => onChange([...schedule.filter((x) => x.date !== key), ...(ids.length ? [{ date: key, productIds: ids }] : [])].sort((a, b) => a.date.localeCompare(b.date)));
  const copyFrom = (key) => {
    const i = keys.indexOf(key);
    const prev = [...keys.slice(0, i)].reverse().find((k) => byDate[k]?.length);
    if (prev) setDay(key, [...byDate[prev]]);
  };
  const planned = keys.filter((k) => byDate[k]?.length).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-600">
        <span><b className="text-gray-900">{planned}</b> of the next {days} days planned</span>
        <span className="text-gray-300">·</span>
        <span>Changes every night at 12:00 am (India time)</span>
        <select className="pdSelect !h-8 ml-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {[7, 14, 30, 60, 90].map((n) => <option key={n} value={n}>Next {n} days</option>)}
        </select>
      </div>
      <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
        {keys.map((key) => {
          const ids = byDate[key] || [];
          const isOpen = open === key;
          return (
            <div key={key} className={key === todayKey ? "bg-[#f9fafb]" : ""}>
              <button type="button" onClick={() => setOpen(isOpen ? null : key)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                <span className={`w-2 h-2 rounded-full shrink-0 ${ids.length ? "bg-[#059669]" : "bg-gray-300"}`} />
                <span className={`flex-1 text-[13px] ${key === todayKey ? "font-[700] text-gray-900" : "font-[600] text-gray-800"}`}>{dayLabel(key, todayKey)}</span>
                <span className={`text-[12px] ${ids.length ? "text-gray-700" : "text-gray-400"}`}>{ids.length ? `${ids.length} product${ids.length === 1 ? "" : "s"}` : emptyDay === "hide" ? "Empty · section hidden" : "Empty · biggest discounts"}</span>
                {isOpen ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
                  <ProductPicker ids={ids} onChange={(v) => setDay(key, v)} />
                  <div className="flex gap-3 mt-2">
                    {!ids.length && keys.indexOf(key) > 0 && <button type="button" className="text-[12px] font-[600] text-gray-600 hover:text-gray-900" onClick={() => copyFrom(key)}>Copy from the previous planned day</button>}
                    {ids.length > 0 && <button type="button" className="text-[12px] font-[600] text-[#dc2626]" onClick={() => setDay(key, [])}>Clear this day</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Field label="On days with nothing planned">
        <div className="flex flex-col sm:flex-row gap-2">
          {[["discount", "Show biggest discounts"], ["hide", "Hide the section"]].map(([k, l]) => (
            <button type="button" key={k} className={`pdChip flex-1 justify-center ${emptyDay === k ? "is-on" : ""}`} onClick={() => setEmptyDay(k)}>{l}</button>
          ))}
        </div>
      </Field>
    </div>
  );
};

// Collection ke andar kya dikhe
const MODES = [
  ["category", "A whole category", "Opens the category listing"],
  ["products", "Hand-picked products", "You choose and order them"],
  ["filter", "Products by rule", "Category, price, discount or tag"],
  ["link", "Any link", "Opens a page you choose"],
];
const modeOf = (c) => c.mode || (c.catId ? "category" : "link");
const complete = (c) => {
  const m = modeOf(c), f = c.filter || {};
  return c.title && c.image && ((m === "category" && c.catId) || (m === "link" && c.link) || (m === "products" && c.productIds?.length) ||
    (m === "filter" && (f.catId || f.maxPrice > 0 || f.minDiscount > 0 || f.flag)));
};

const HomeTab = ({ home, setHome }) => {
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(null);
  useEffect(() => { getData("/api/category?admin=1").then((res) => setCats(res?.data || [])); }, []);

  const set = (key, value) => setHome({ ...home, [key]: value });
  const setIn = (key, field, value) => setHome({ ...home, [key]: { ...(home[key] || {}), [field]: value } });
  const sections = home.sections || [];
  const setSec = (i, patch) => set("sections", sections.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i, d) => { const n = [...sections]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set("sections", n); };
  const d = home.deals || {}, p = home.popular || {}, l = home.latest || {};
  const budget = home.budget || [], cols = home.collections || [];
  const setCol = (i, patch) => set("collections", cols.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setTier = (i, patch) => set("budget", budget.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const toLocal = (v) => { if (!v) return ""; const t = new Date(v); return new Date(t - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

  return (
    <>
      <Card title="Sections" sub="Order, show / hide and the heading of every block on the home page. Use the arrows to reorder.">
        <div className="flex flex-col gap-2">
          {sections.map((sec, i) => {
            const [name, info] = INFO[sec.key] || [sec.key, ""];
            const isOpen = open === sec.key;
            return (
              <div key={sec.key} className={`border rounded-md ${sec.enabled !== false ? "border-gray-200" : "border-dashed border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex flex-col">
                    <button type="button" className="text-gray-400 hover:text-gray-900 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><FiArrowUp /></button>
                    <button type="button" className="text-gray-400 hover:text-gray-900 disabled:opacity-30" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><FiArrowDown /></button>
                  </div>
                  <span className="w-6 text-[12px] text-gray-400 tabular-nums">{i + 1}</span>
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => setOpen(isOpen ? null : sec.key)}>
                    <span className={`block text-[13px] font-[600] ${sec.enabled !== false ? "text-gray-900" : "text-gray-400"}`}>{NO_TITLE.includes(sec.key) ? name : sec.title || name}</span>
                    <span className="block text-[12px] text-gray-500 truncate">{info}</span>
                  </button>
                  {!NO_TITLE.includes(sec.key) && <button type="button" className="pdIconBtn" onClick={() => setOpen(isOpen ? null : sec.key)} aria-label="Edit heading">{isOpen ? <FiChevronUp /> : <FiChevronDown />}</button>}
                  <button type="button" onClick={() => setSec(i, { enabled: sec.enabled === false })} className={`pdSwitch ${sec.enabled !== false ? "is-on" : ""}`} aria-label={sec.enabled !== false ? "Hide section" : "Show section"} />
                </div>
                {isOpen && !NO_TITLE.includes(sec.key) && (
                  <div className="grid sm:grid-cols-2 gap-3 px-3 pb-3 pt-1 border-t border-gray-100">
                    <Field label="Heading"><input className="pdInput" value={sec.title || ""} maxLength={80} onChange={(e) => setSec(i, { title: e.target.value })} /></Field>
                    <Field label="Subtitle" hint={sec.key === "freeShipping" ? "Empty = automatic text from shipping settings." : "Optional, shown under the heading."}><input className="pdInput" value={sec.subtitle || ""} maxLength={160} onChange={(e) => setSec(i, { subtitle: e.target.value })} /></Field>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 sm:w-1/2">
          <Field label="Banner button text" hint="On the main slider and side banners."><input className="pdInput" value={home.bannerButtonText || ""} maxLength={30} onChange={(e) => set("bannerButtonText", e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Product sliders" sub="Where Popular / Latest / Featured get their products. Draft and archived products never show.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Popular Products — show">
            <select className="pdInput" value={p.source} onChange={(e) => setIn("popular", "source", e.target.value)}>
              <option value="category">Tabs per main category</option>
              <option value="flag">Products marked “Popular”</option>
              <option value="rating">Highest rated</option>
              <option value="newest">Newest</option>
            </select>
          </Field>
          <Field label="Popular — how many"><Num value={p.limit} onChange={(v) => setIn("popular", "limit", v)} suffix="products" /></Field>
          <Field label="Latest Products — show">
            <select className="pdInput" value={l.source} onChange={(e) => setIn("latest", "source", e.target.value)}>
              <option value="newest">Newest added (automatic)</option>
              <option value="flag">Products marked “Latest”</option>
            </select>
          </Field>
          <Field label="Latest — how many"><Num value={l.limit} onChange={(v) => setIn("latest", "limit", v)} suffix="products" /></Field>
          <Field label="Featured — how many" hint="Mark products “Featured” in the product form."><Num value={home.featured?.limit} onChange={(v) => setIn("featured", "limit", v)} suffix="products" /></Field>
          <Field label="Blog — how many posts"><Num value={home.blog?.limit} onChange={(v) => setIn("blog", "limit", v)} suffix="posts" /></Field>
        </div>
      </Card>

      <Card title="Today's Best Deals" sub="Only in-stock products show.">
        <div className="flex flex-col gap-4">
          <Field label="Which products">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[["discount", "Biggest discounts", "Automatic, sorted by % off"], ["flag", "Marked “Deal”", "Tick “Deal” in the product form"], ["manual", "Pick products", "Same list every day"], ["schedule", "Day-wise calendar", "Different products each day"]].map(([k, t, sub]) => (
                <button type="button" key={k} onClick={() => setIn("deals", "source", k)}
                  className={`flex-1 text-left px-3 py-2 rounded-md border ${d.source === k ? "border-gray-900 bg-gray-50 shadow-[inset_0_0_0_1px_#111827]" : "border-gray-200 hover:border-gray-400"}`}>
                  <span className="block text-[13px] font-[700] text-gray-900">{t}</span><span className="block text-[12px] text-gray-500">{sub}</span>
                </button>
              ))}
            </div>
          </Field>
          {d.source === "discount" && <div className="sm:w-1/2"><Field label="Minimum discount"><Num value={d.minDiscount} onChange={(v) => setIn("deals", "minDiscount", v)} suffix="% off" /></Field></div>}
          {d.source === "manual" && <ProductPicker ids={d.productIds || []} onChange={(v) => setIn("deals", "productIds", v)} />}
          {d.source === "schedule" && <DealCalendar schedule={d.schedule || []} onChange={(v) => setIn("deals", "schedule", v)} emptyDay={d.emptyDay || "discount"} setEmptyDay={(v) => setIn("deals", "emptyDay", v)} />}
          <div className="grid sm:grid-cols-2 gap-4">
            {!["manual", "schedule"].includes(d.source) && <Field label="How many"><Num value={d.limit} onChange={(v) => setIn("deals", "limit", v)} suffix="products" /></Field>}
            <Field label="“View all” link" hint="Empty = hide the link."><input className="pdInput" value={d.viewAllUrl || ""} onChange={(e) => setIn("deals", "viewAllUrl", e.target.value)} placeholder="/productListing" /></Field>
          </div>
          {d.source === "schedule" ? <div className="text-[12px] text-gray-500">Timer: counts down to midnight — when it ends, the next day's deals appear.</div> : <>
          <Field label="Countdown timer">
            <div className="flex flex-col sm:flex-row gap-2">
              {[["daily", "Resets every midnight"], ["date", "Ends on a date"], ["off", "No timer"]].map(([k, t]) => (
                <button type="button" key={k} onClick={() => setIn("deals", "timer", k)} className={`pdChip flex-1 justify-center ${d.timer === k ? "is-on" : ""}`}>{t}</button>
              ))}
            </div>
          </Field>
          {d.timer === "date" && (
            <div className="sm:w-1/2">
              <Field label="Sale ends at" hint="After this time the whole section hides by itself.">
                <input type="datetime-local" className="pdInput" value={toLocal(d.endsAt)} onChange={(e) => setIn("deals", "endsAt", e.target.value ? new Date(e.target.value).toISOString() : null)} />
              </Field>
              {d.endsAt && new Date(d.endsAt) < new Date() && <div className="mt-1 text-[12px] text-[#dc2626]">This date has passed — the section is hidden on the store.</div>}
            </div>
          )}
          </>}
        </div>
      </Card>

      <Card title="Shop by Budget" sub="One tile per price. Tiles with no products hide automatically. Up to 6.">
        <div className="flex flex-col gap-2">
          {budget.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[13px] text-gray-500 w-[90px] shrink-0">Under ₹</span>
              <input type="number" min="1" className="pdInput pdNum !w-[140px]" value={t.max} onChange={(e) => setTier(i, { max: Number(e.target.value) || 0 })} />
              <label className="flex items-center gap-1.5 text-[12px] text-gray-500">Background <input type="color" value={t.bg} onChange={(e) => setTier(i, { bg: e.target.value })} className="w-8 h-8 rounded border border-gray-200" /></label>
              <label className="flex items-center gap-1.5 text-[12px] text-gray-500">Accent <input type="color" value={t.accent} onChange={(e) => setTier(i, { accent: e.target.value })} className="w-8 h-8 rounded border border-gray-200" /></label>
              <span className="hidden md:flex items-center px-3 h-9 rounded-md text-[13px] font-[800]" style={{ background: t.bg, color: t.accent }}>₹{t.max}</span>
              <button type="button" className="pdIconBtn pdIconBtn--danger ml-auto" onClick={() => set("budget", budget.filter((_, j) => j !== i))}><FiX /></button>
            </div>
          ))}
        </div>
        {budget.length < 6 && <button type="button" className="mt-3 text-[13px] font-[600] text-gray-700 hover:text-[#ff5252] flex items-center gap-1" onClick={() => set("budget", [...budget, { max: (budget[budget.length - 1]?.max || 0) + 500, bg: "#f3f4f6", accent: "#111827" }])}><FiPlus /> Add tier</button>}
      </Card>

      <Card title="Shop by Collection" sub="5 or more tiles show as a bento grid (first one big). Each needs a title, an image and a category or link.">
        <div className="flex flex-col gap-3">
          {cols.map((c, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[12px] font-[700] text-gray-500">#{i + 1}{i === 0 && cols.length >= 5 ? " · big tile" : ""}</span>
                <button type="button" className="pdIconBtn !w-7 !h-7 ml-auto" disabled={i === 0} onClick={() => { const n = [...cols]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set("collections", n); }}><FiArrowUp /></button>
                <button type="button" className="pdIconBtn !w-7 !h-7" disabled={i === cols.length - 1} onClick={() => { const n = [...cols]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set("collections", n); }}><FiArrowDown /></button>
                <button type="button" className="pdIconBtn pdIconBtn--danger !w-7 !h-7" onClick={() => set("collections", cols.filter((_, j) => j !== i))}><FiX /></button>
              </div>
              <div className="grid md:grid-cols-[auto_1fr] gap-4">
                <ImagePick wide label="Image" hint="Landscape, 1200×800 px." value={c.image} onChange={(v) => setCol(i, { image: v })} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Title" req><input className="pdInput" value={c.title} maxLength={60} onChange={(e) => setCol(i, { title: e.target.value })} /></Field>
                  <Field label="Small tag"><input className="pdInput" value={c.tag} maxLength={30} onChange={(e) => setCol(i, { tag: e.target.value })} placeholder="e.g. Bags" /></Field>
                  <div className="sm:col-span-2"><Field label="Text"><input className="pdInput" value={c.text} maxLength={120} onChange={(e) => setCol(i, { text: e.target.value })} /></Field></div>
                  <div className="sm:col-span-2">
                    <label className="pdLabel">What opens on click</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {MODES.map(([k, t, sub]) => (
                        <button type="button" key={k} onClick={() => setCol(i, { mode: k })}
                          className={`text-left px-2.5 py-2 rounded-md border ${modeOf(c) === k ? "border-gray-900 bg-gray-50 shadow-[inset_0_0_0_1px_#111827]" : "border-gray-200 hover:border-gray-400"}`}>
                          <span className="block text-[12px] font-[700] text-gray-900">{t}</span><span className="block text-[11px] text-gray-500">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {modeOf(c) === "category" && (
                    <div className="sm:col-span-2"><Field label="Category">
                      <select className="pdInput" value={c.catId || ""} onChange={(e) => setCol(i, { catId: e.target.value })}>
                        <option value="">Choose a category</option>
                        {cats.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    </Field></div>
                  )}
                  {modeOf(c) === "link" && (
                    <div className="sm:col-span-2"><Field label="Link" hint="e.g. /productListing?maxPrice=499 or /page/about-us"><input className="pdInput" value={c.link || ""} onChange={(e) => setCol(i, { link: e.target.value })} /></Field></div>
                  )}
                  {modeOf(c) === "products" && (
                    <div className="sm:col-span-2">
                      <label className="pdLabel">Products in this collection</label>
                      <ProductPicker ids={c.productIds || []} onChange={(v) => setCol(i, { productIds: v })} />
                    </div>
                  )}
                  {modeOf(c) === "filter" && (() => {
                    const f = c.filter || {};
                    const setF = (patch) => setCol(i, { filter: { ...f, ...patch } });
                    return (
                      <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3 p-3 rounded-md bg-[#f9fafb] border border-gray-100">
                        <Field label="Category"><select className="pdInput" value={f.catId || ""} onChange={(e) => setF({ catId: e.target.value })}><option value="">Any category</option>{cats.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}</select></Field>
                        <Field label="Marked as"><select className="pdInput" value={f.flag || ""} onChange={(e) => setF({ flag: e.target.value })}><option value="">Anything</option><option value="featured">Featured</option><option value="popular">Popular</option><option value="latest">Latest</option><option value="deal">Deal</option></select></Field>
                        <Field label="Price up to" hint="0 = any price"><Num value={f.maxPrice || 0} suffix="₹" onChange={(v) => setF({ maxPrice: v })} /></Field>
                        <Field label="At least" hint="0 = any discount"><Num value={f.minDiscount || 0} suffix="% off" onChange={(v) => setF({ minDiscount: v })} /></Field>
                        <div className="sm:col-span-2 text-[11px] text-gray-500">The collection updates by itself as products match — up to 60 shown.</div>
                      </div>
                    );
                  })()}
                  {["products", "filter"].includes(modeOf(c)) && (
                    <div className="sm:col-span-2"><Field label="Page URL" hint="Opens as its own page on the store.">
                      <div className="flex items-center"><span className="h-[40px] px-2 flex items-center text-[13px] text-gray-400 border border-r-0 border-gray-200 rounded-l-md bg-gray-50">/collection/</span>
                        <input className="pdInput !rounded-l-none" value={c.slug || ""} placeholder={String(c.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} onChange={(e) => setCol(i, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
                    </Field></div>
                  )}
                </div>
              </div>
              {!complete(c) && <div className="mt-2 text-[12px] text-[#b45309]">Incomplete — needs a title, an image and {({ category: "a category", link: "a link", products: "at least one product", filter: "at least one rule" })[modeOf(c)]}. It won't be saved until then.</div>}
            </div>
          ))}
        </div>
        {cols.length < 9 && <button type="button" className="mt-3 text-[13px] font-[600] text-gray-700 hover:text-[#ff5252] flex items-center gap-1" onClick={() => set("collections", [...cols, { title: "", tag: "", text: "", image: "", link: "", catId: "", mode: "products", productIds: [], slug: "" }])}><FiPlus /> Add collection</button>}
        {cols.length > 0 && cols.some((c) => c.image) && (
          <div className="mt-4">
            <div className="pdLabel">Preview</div>
            <div className="flex gap-2 overflow-x-auto">
              {cols.filter((c) => c.image).map((c, i) => (
                <div key={i} className="relative w-[140px] h-[90px] rounded-md overflow-hidden shrink-0 bg-gray-100">
                  <img src={imgSrc(c.image)} alt="" className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent text-white text-[11px] font-[700] truncate">{c.title || "Untitled"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default HomeTab;
