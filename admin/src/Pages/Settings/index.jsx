import React, { useContext, useEffect, useState } from "react";
import { FiPlus, FiX, FiCheck, FiExternalLink, FiDownload } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { MyContext } from "../../App";
import { getData, putData } from "../../utils/api";
import { Field, Card, Toggle, Money, Num, ImagePick, STORE_URL } from "./ui";
import HomeTab from "./HomeTab";
import "../Products/style.css";

const TABS = [
  ["general", "General"],
  ["home", "Home page"],
  ["contact", "Contact & social"],
  ["header", "Header & footer"],
  ["shipping", "Shipping & checkout"],
  ["reviews", "Reviews"],
  ["newsletter", "Newsletter"],
];
const ICONS = [["truck", "Delivery"], ["return", "Returns"], ["cash", "Cash"], ["shield", "Secure"], ["support", "Support"], ["gift", "Gift"], ["star", "Star"], ["tag", "Offer"], ["clock", "Time"], ["leaf", "Eco"]];
const SOCIAL = [["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"], ["pinterest", "Pinterest"], ["twitter", "X (Twitter)"], ["linkedin", "LinkedIn"]];
const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

const Settings = () => {
  const context = useContext(MyContext);
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "general");
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [subs, setSubs] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getData("/api/settings").then((res) => { if (res?.error === false) { setS(res.data); setSaved(JSON.stringify(res.data)); } });
  }, []);
  useEffect(() => {
    if (tab === "newsletter" && !subs) getData("/api/settings/subscribers").then((res) => setSubs(res?.data || []));
  }, [tab, subs]);

  if (!s) return <div className="py-20 flex justify-center"><CircularProgress size={28} /></div>;

  const dirty = JSON.stringify(s) !== saved;
  const set = (section, key, value) => setS((p) => ({ ...p, [section]: { ...p[section], [key]: value } }));
  const g = s.general, c = s.contact, so = s.social, h = s.header, f = s.footer, sh = s.shipping, co = s.checkout, rv = s.reviews || {};

  const save = async () => {
    setSaving(true);
    const { general, contact, social, header, footer, shipping, checkout, reviews, home, notifications } = s;
    const res = await putData("/api/settings", { general, contact, social, header, footer, shipping, checkout, reviews, home, notifications });
    setSaving(false);
    if (res?.error === false) { setS(res.data); setSaved(JSON.stringify(res.data)); context.openAlertBox("success", "Settings saved"); }
    else context.openAlertBox("error", res?.message || "Could not save settings");
  };

  const exportSubs = () => {
    const csv = ["Email,Subscribed on", ...(subs || []).map((x) => `"${x.email}","${new Date(x.createdAt).toISOString().slice(0, 10)}"`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "subscribers.csv"; a.click();
  };

  // Shipping preview
  const example = [Math.max(1, (sh.freeShippingAbove || 999) - 200), sh.freeShippingAbove || 999, (sh.freeShippingAbove || 999) + 500];
  const shipFor = (t) => (sh.shippingCharge > 0 && !(sh.freeShippingAbove > 0 && t >= sh.freeShippingAbove) ? sh.shippingCharge : 0);

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Store settings</h1>
          <div className="text-[14px] text-gray-500">Everything the store shows that isn't a product — brand, contact, footer, shipping and checkout rules.</div>
        </div>
        <a className="pdBtn pdBtn--light" href={STORE_URL} target="_blank" rel="noreferrer"><FiExternalLink /> View store</a>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto bg-white border border-gray-200 rounded-md p-1.5">
        {TABS.map(([k, l]) => <button key={k} className={`pdTab ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      <div className={`flex flex-col gap-4 ${tab === "home" ? "max-w-[1100px]" : "max-w-[900px]"}`}>
        {tab === "general" && <>
          <Card title="Brand" sub="Shown in the header, footer and browser tab.">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Store name" req><input className="pdInput" value={g.storeName} maxLength={80} onChange={(e) => set("general", "storeName", e.target.value)} /></Field>
              <Field label="Tagline" hint="One short line, e.g. “Everyday fashion at honest prices”."><input className="pdInput" value={g.tagline} maxLength={120} onChange={(e) => set("general", "tagline", e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Browser tab title" hint={`Leave empty to use “${[g.storeName, g.tagline].filter(Boolean).join(" – ")}”.`}><input className="pdInput" value={g.tabTitle} maxLength={120} onChange={(e) => set("general", "tabTitle", e.target.value)} /></Field></div>
            </div>
          </Card>
          <Card title="Logo & icon">
            <div className="flex flex-col gap-5">
              <ImagePick label="Logo" hint="PNG / SVG with transparent background, about 300×80 px. Empty = the default logo." value={g.logo} onChange={(v) => set("general", "logo", v)} />
              <ImagePick square label="Favicon" hint="Square, 64×64 px PNG or ICO. Shown in the browser tab." value={g.favicon} onChange={(v) => set("general", "favicon", v)} />
            </div>
          </Card>
        </>}

        {tab === "home" && <HomeTab home={s.home} setHome={(home) => setS((p) => ({ ...p, home }))} />}

        {tab === "contact" && <>
          <Card title="Contact details" sub="Shown in the footer. Empty fields are hidden.">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Field label="Address"><textarea className="pdInput !min-h-[70px]" value={c.address} maxLength={400} onChange={(e) => set("contact", "address", e.target.value)} /></Field></div>
              <Field label="Email"><input className="pdInput" type="email" value={c.email} onChange={(e) => set("contact", "email", e.target.value)} placeholder="support@yourstore.in" /></Field>
              <Field label="Phone"><input className="pdInput" value={c.phone} onChange={(e) => set("contact", "phone", e.target.value)} placeholder="+91 98765 43210" /></Field>
              <Field label="WhatsApp number" hint="With country code, e.g. 919876543210."><input className="pdInput" value={c.whatsapp} onChange={(e) => set("contact", "whatsapp", e.target.value)} /></Field>
              <Field label="Support hours"><input className="pdInput" value={c.hours} onChange={(e) => set("contact", "hours", e.target.value)} placeholder="Mon–Sat, 10 am – 7 pm" /></Field>
            </div>
          </Card>
          <Card title="Social links" sub="Only filled links show as icons in the footer.">
            <div className="grid sm:grid-cols-2 gap-4">
              {SOCIAL.map(([k, l]) => <Field key={k} label={l}><input className="pdInput" value={so[k] || ""} placeholder={`https://${k === "twitter" ? "x" : k}.com/yourstore`} onChange={(e) => set("social", k, e.target.value)} /></Field>)}
            </div>
          </Card>
        </>}

        {tab === "header" && <>
          <Card title="Top strip" sub="The thin bar above the header.">
            <div className="flex flex-col gap-4">
              <Toggle on={h.topStripEnabled} onChange={(v) => set("header", "topStripEnabled", v)} label="Show top strip" />
              <Field label="Message"><input className="pdInput" value={h.topStripText} maxLength={160} disabled={!h.topStripEnabled} onChange={(e) => set("header", "topStripText", e.target.value)} placeholder="e.g. Festive sale – up to 50% off" /></Field>
              <div>
                <label className="pdLabel">Links (right side, up to 4)</label>
                <div className="flex flex-col gap-2">
                  {(h.topLinks || []).map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className="pdInput !w-[40%]" value={l.label} placeholder="Label" onChange={(e) => set("header", "topLinks", h.topLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                      <input className="pdInput" value={l.url} placeholder="/my-orders or https://…" onChange={(e) => set("header", "topLinks", h.topLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                      <button type="button" className="pdIconBtn pdIconBtn--danger shrink-0" onClick={() => set("header", "topLinks", h.topLinks.filter((_, j) => j !== i))}><FiX /></button>
                    </div>
                  ))}
                </div>
                {(h.topLinks || []).length < 4 && <button type="button" className="mt-2 text-[13px] font-[600] text-gray-700 hover:text-[#ff5252] flex items-center gap-1" onClick={() => set("header", "topLinks", [...(h.topLinks || []), { label: "", url: "" }])}><FiPlus /> Add link</button>}
                <div className="pdHint">Store pages you can link: /my-orders, /my-account, /compare, /productListing</div>
              </div>
            </div>
          </Card>
          <Card title="Menu bar" sub="Main categories shown next to Home. Choose which ones and their order in Categories (“In menu”, arrows).">
            <div className="sm:w-1/2"><Field label="Categories in the menu bar" hint="The rest go under “More”. 0 = only the “More” dropdown."><Num value={h.menuCount ?? 5} suffix="categories" onChange={(v) => set("header", "menuCount", v)} /></Field></div>
          </Card>
          <Card title="Footer">
            <div className="flex flex-col gap-4">
              <Field label="About text" hint="Short description under the store name."><textarea className="pdInput !min-h-[70px]" maxLength={400} value={f.about} onChange={(e) => set("footer", "about", e.target.value)} /></Field>
              <Field label="Copyright line" hint={`Empty = “© ${new Date().getFullYear()} ${g.storeName}. All rights reserved.”`}><input className="pdInput" value={f.copyright} maxLength={160} onChange={(e) => set("footer", "copyright", e.target.value)} /></Field>
            </div>
          </Card>
          <Card title="Feature boxes" sub="Icons row at the top of the footer (up to 6). Keep them true — e.g. don't promise 30-day returns if products say 7.">
            <div className="flex flex-col gap-2">
              {(f.features || []).map((x, i) => (
                <div key={i} className="grid grid-cols-[120px_1fr_1fr_auto] gap-2 items-center">
                  <select className="pdInput" value={x.icon} onChange={(e) => set("footer", "features", f.features.map((y, j) => (j === i ? { ...y, icon: e.target.value } : y)))}>
                    {ICONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <input className="pdInput" value={x.title} placeholder="Title" maxLength={40} onChange={(e) => set("footer", "features", f.features.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} />
                  <input className="pdInput" value={x.text} placeholder="Short text" maxLength={80} onChange={(e) => set("footer", "features", f.features.map((y, j) => (j === i ? { ...y, text: e.target.value } : y)))} />
                  <button type="button" className="pdIconBtn pdIconBtn--danger" onClick={() => set("footer", "features", f.features.filter((_, j) => j !== i))}><FiX /></button>
                </div>
              ))}
            </div>
            {(f.features || []).length < 6 && <button type="button" className="mt-3 text-[13px] font-[600] text-gray-700 hover:text-[#ff5252] flex items-center gap-1" onClick={() => set("footer", "features", [...(f.features || []), { icon: "star", title: "", text: "" }])}><FiPlus /> Add box</button>}
          </Card>
        </>}

        {tab === "shipping" && <>
          <Card title="Shipping charges" sub="Used by the cart, checkout and the order total on the server.">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Shipping charge per order" hint="0 = free delivery on every order."><Money value={sh.shippingCharge} onChange={(v) => set("shipping", "shippingCharge", v)} /></Field>
              <Field label="Free delivery above" hint="0 = no free-delivery threshold."><Money value={sh.freeShippingAbove} onChange={(v) => set("shipping", "freeShippingAbove", v)} /></Field>
            </div>
            <div className="mt-4 rounded-md bg-[#f9fafb] border border-gray-100 p-3 text-[13px]">
              <div className="font-[600] text-gray-900 mb-1.5">Preview</div>
              {sh.shippingCharge > 0
                ? example.map((t) => <div key={t} className="flex justify-between text-gray-600"><span>Cart of {inr(t)}</span><b className={shipFor(t) ? "text-gray-900" : "text-[#059669]"}>{shipFor(t) ? `${inr(shipFor(t))} shipping` : "Free shipping"}</b></div>)
                : <div className="text-[#059669] font-[600]">Every order ships free.</div>}
            </div>
          </Card>
          <Card title="Delivery time" sub="Shown on the cart, order confirmation and home page. Products can set their own dispatch / return days.">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Estimated delivery — from"><Num value={sh.etaMinDays} suffix="days" onChange={(v) => set("shipping", "etaMinDays", v)} /></Field>
              <Field label="Estimated delivery — to"><Num value={sh.etaMaxDays} suffix="days" onChange={(v) => set("shipping", "etaMaxDays", v)} /></Field>
              <Field label="Default dispatch time" hint="When a product doesn't set its own."><Num value={sh.defaultDispatchDays} suffix="days" onChange={(v) => set("shipping", "defaultDispatchDays", v)} /></Field>
              <Field label="Default return window" hint="When a product doesn't set its own."><Num value={sh.defaultReturnDays} suffix="days" onChange={(v) => set("shipping", "defaultReturnDays", v)} /></Field>
            </div>
          </Card>
          <Card title="Cash on Delivery">
            <div className="flex flex-col gap-4">
              <Toggle on={co.codEnabled} onChange={(v) => set("checkout", "codEnabled", v)} label="Accept Cash on Delivery" sub="COD is the only payment method right now — turning it off stops all new orders." />
              {!co.codEnabled && <div className="text-[12px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-md px-3 py-2">Customers won't be able to place any order while COD is off.</div>}
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="COD fee" hint="Added to the order total."><Money value={co.codCharge} onChange={(v) => set("checkout", "codCharge", v)} /></Field>
                <Field label="COD only above" hint="0 = no minimum."><Money value={co.codMinOrder} onChange={(v) => set("checkout", "codMinOrder", v)} /></Field>
                <Field label="COD only up to" hint="0 = no maximum."><Money value={co.codMaxOrder} onChange={(v) => set("checkout", "codMaxOrder", v)} /></Field>
              </div>
              <div className="pdHint !mt-0">Products marked “COD not available” (Product → Shipping) can't be ordered with COD.</div>
            </div>
          </Card>
          <Card title="Customer emails">
            <Toggle on={s.notifications?.orderEmails !== false} onChange={(v) => setS((p) => ({ ...p, notifications: { ...(p.notifications || {}), orderEmails: v } }))}
              label="Email customers about their orders" sub="Placed, confirmed, shipped (with tracking), delivered, cancelled and return updates. Uses the SMTP email from the server settings." />
          </Card>
          <Card title="Checkout rules">
            <div className="flex flex-col gap-4">
              <Field label="Minimum order value" hint="0 = no minimum. Shown in the cart when not met."><div className="sm:w-1/2"><Money value={co.minOrderValue} onChange={(v) => set("checkout", "minOrderValue", v)} /></div></Field>
              <Toggle on={co.taxInclusiveNote} onChange={(v) => set("checkout", "taxInclusiveNote", v)} label="Show “Prices include all taxes”" sub="On the cart and checkout." />
            </div>
          </Card>
        </>}

        {tab === "reviews" && (
          <Card title="Review moderation">
            <Toggle on={rv.autoApprove !== false} onChange={(v) => set("reviews", "autoApprove", v)} label="Publish reviews immediately"
              sub="Off = new and edited reviews wait in Reviews → Pending until you approve them. Pending reviews don't count in the product rating." />
          </Card>
        )}

        {tab === "newsletter" && (
          <Card title="Newsletter" sub="Signup box in the store footer."
            right={subs?.length > 0 && <button type="button" className="pdBtn pdBtn--light !h-[34px]" onClick={exportSubs}><FiDownload /> Export CSV</button>}>
            <div className="flex flex-col gap-4">
              <Toggle on={f.newsletterEnabled} onChange={(v) => set("footer", "newsletterEnabled", v)} label="Show newsletter signup" />
              <Field label="Text above the form"><input className="pdInput" value={f.newsletterText} maxLength={200} onChange={(e) => set("footer", "newsletterText", e.target.value)} /></Field>
              <div>
                <div className="pdLabel">Subscribers {subs ? `(${subs.length})` : ""}</div>
                {!subs ? <div className="h-10 rounded bg-gray-100 animate-pulse" />
                  : subs.length === 0 ? <div className="text-[13px] text-gray-500">No subscribers yet.</div>
                    : <div className="max-h-[260px] overflow-auto border border-gray-100 rounded-md divide-y divide-gray-100">
                      {subs.map((x) => <div key={x._id} className="flex justify-between px-3 py-2 text-[13px]"><span className="text-gray-900">{x.email}</span><span className="text-gray-400">{new Date(x.createdAt).toLocaleDateString("en-IN")}</span></div>)}
                    </div>}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sticky save bar */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-[#111827] text-white rounded-md pl-4 pr-2 py-2 shadow-lg transition-all ${dirty ? "opacity-100" : "opacity-0 pointer-events-none translate-y-4"}`}>
        <span className="text-[13px] font-[600]">Unsaved changes</span>
        <button type="button" className="h-8 px-3 rounded-md text-[12px] font-[600] text-gray-300 hover:text-white" onClick={() => setS(JSON.parse(saved))}>Discard</button>
        <button type="button" className="h-8 px-4 rounded-md bg-white text-[#111827] text-[12px] font-[700] flex items-center gap-1.5 hover:bg-gray-100" disabled={saving} onClick={save}>
          {saving ? <CircularProgress size={14} color="inherit" /> : <><FiCheck /> Save</>}
        </button>
      </div>
    </div>
  );
};

export default Settings;
