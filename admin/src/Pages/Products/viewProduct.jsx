import React, { useContext, useState } from "react";
import { FiEdit2, FiStar, FiExternalLink } from "react-icons/fi";
import { MyContext } from "../../App";

import { StockBadge } from "./shared";
import { inr, toArr } from "./utils";
import "./style.css";

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-t border-gray-100 first:border-0">
    <span className="text-[12px] font-[600] text-gray-500 shrink-0">{label}</span>
    <span className="text-[13px] text-gray-900 text-right">{children || <span className="text-gray-300">—</span>}</span>
  </div>
);

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");
const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5173";

const ViewProduct = ({ data }) => {
  const context = useContext(MyContext);
  const [active, setActive] = useState(0);
  if (!data) return null;
  const imgs = data.images || [];
  const discount = data.oldprice > data.price ? data.discount || Math.round(((data.oldprice - data.price) / data.oldprice) * 100) : 0;
  const variants = data.variantOptions?.length
    ? data.variantOptions.map((g) => [g.name, g.values || []])
    : [["Size", toArr(data.size)], ["Colour", toArr(data.color)], ["RAM", toArr(data.productRam)], ["Weight", toArr(data.productWeight)]].filter(([, v]) => v.length);

  return (
    <div className="pdPanel">
      <div className="pdPanel__grid">
        <div className="flex flex-col gap-5 min-w-0">
          <section className="pdCard">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
              <div>
                <div className="aspect-square rounded-md border border-gray-100 bg-gray-50 overflow-hidden">
                  {imgs[active] ? <img src={imgs[active]} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-400">No image</div>}
                </div>
                {imgs.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {imgs.map((src, i) => (
                      <button key={src} onClick={() => setActive(i)} className={`w-14 h-14 shrink-0 rounded border-2 bg-gray-50 overflow-hidden ${i === active ? "border-[#111827]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                        <img src={src} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-[600] uppercase tracking-wide text-gray-400">{data.brand || "No brand"}</div>
                <h2 className="mt-1 text-[22px] font-[700] text-gray-900 leading-tight">{data.name}</h2>
                {data.shortDescription && <div className="mt-1 text-[13px] text-gray-500">{data.shortDescription}</div>}
                <div className="mt-2 flex items-center gap-3 text-[13px]">
                  {data.rating ? <span className="inline-flex items-center gap-1 font-[600]"><FiStar className="text-[#f59e0b] fill-[#f59e0b]" />{Number(data.rating).toFixed(1)}</span> : <span className="text-gray-400">No rating</span>}
                  <StockBadge n={data.countInStock} low={data.lowStockThreshold} />
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-[26px] font-[700] text-gray-900">{inr(data.price)}</span>
                  {discount > 0 && <>
                    <span className="text-[15px] text-gray-400 line-through">{inr(data.oldprice)}</span>
                    <span className="pdBadge pdBadge--green">{discount}% off</span>
                  </>}
                </div>
                {variants.length > 0 && (
                  <div className="mt-5 flex flex-col gap-3">
                    {variants.map(([l, v]) => (
                      <div key={l}>
                        <div className="pdLabel">{l}</div>
                        <div className="flex flex-wrap gap-1.5">{v.map((x) => <span key={x} className="pdChip !h-7 !cursor-default">{x}</span>)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {(data.productFlags || []).length > 0 && (
                  <div className="mt-5">
                    <div className="pdLabel">Shown on home in</div>
                    <div className="flex flex-wrap gap-1.5">{data.productFlags.map((f) => <span key={f} className="pdBadge pdBadge--blue">{f}</span>)}</div>
                  </div>
                )}
              </div>
            </div>
          </section>
          {data.highlights?.length > 0 && (
            <section className="pdCard">
              <div className="pdCard__title mb-3">Key highlights</div>
              <ul className="list-disc pl-5 text-[14px] text-gray-700 space-y-1">{data.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
            </section>
          )}
          {data.variants?.length > 0 && (
            <section className="pdCard !p-0">
              <div className="pdCard__title px-[18px] pt-4 pb-3">Variants ({data.variants.length})</div>
              <div className="overflow-x-auto">
                <table className="pdTable">
                  <thead><tr><th>Variant</th><th>SKU</th><th>Price</th><th>MRP</th><th>Stock</th></tr></thead>
                  <tbody>
                    {data.variants.map((v) => (
                      <tr key={v._id}>
                        <td className="font-[600] text-gray-900"><span className="flex items-center gap-2">{v.image && <img src={v.image} alt="" className="w-8 h-8 rounded object-contain bg-gray-50" />}{Object.values(v.options || {}).filter(Boolean).join(" / ") || [v.size, v.color, v.productRam, v.productWeight].filter(Boolean).join(" / ")}</span></td>
                        <td className="text-gray-500">{v.sku || "—"}</td>
                        <td className="font-[600]">{inr(v.price)}</td>
                        <td className="text-gray-400">{v.oldprice > v.price ? inr(v.oldprice) : "—"}</td>
                        <td><StockBadge n={v.stock} low={data.lowStockThreshold} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {data.specifications?.length > 0 && (
            <section className="pdCard">
              <div className="pdCard__title mb-2">Specifications</div>
              {[...new Set(data.specifications.map((x) => x.group || "General"))].map((g) => (
                <div key={g} className="mt-3">
                  <div className="text-[11px] font-[700] uppercase tracking-wide text-gray-400 mb-1">{g}</div>
                  {data.specifications.filter((x) => (x.group || "General") === g).map((x) => <Row key={x.label} label={x.label}>{x.value}{x.unit ? ` ${x.unit}` : ""}</Row>)}
                </div>
              ))}
            </section>
          )}
          <section className="pdCard">
            <div className="pdCard__title mb-3">Description</div>
            {data.description ? <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{data.description}</div> : <div className="text-[13px] text-gray-400">No description added.</div>}
          </section>
        </div>
        <aside className="pdPanel__aside">
          <section className="pdCard">
            <div className="pdCard__title mb-2">Details</div>
            <Row label="Status"><span className="capitalize">{data.status || "active"}</span></Row>
            <Row label="SKU">{data.sku}</Row>
            <Row label="Barcode">{data.barcode}</Row>
            <Row label="Model no.">{data.modelNumber}</Row>
            <Row label="Category">{data.catId?.name || data.catName}</Row>
            <Row label="Sub-category">{data.subCat}</Row>
            <Row label="Third level">{data.thirdSubCat}</Row>
            <Row label="Stock">{data.countInStock} units</Row>
            <Row label="GST / HSN">{data.gstRate ? `${data.gstRate}%` : "0%"}{data.hsnCode ? ` · ${data.hsnCode}` : ""}</Row>
            <Row label="Cost price">{data.costPrice ? inr(data.costPrice) : ""}</Row>
            <Row label="Max per order">{data.maxOrderQty || "No limit"}</Row>
            <Row label="Images">{imgs.length}</Row>
            <Row label="Created">{fmt(data.createdAt)}</Row>
            <Row label="Updated">{fmt(data.updatedAt)}</Row>
            <Row label="ID"><span className="font-mono text-[11px] text-gray-500">{data._id}</span></Row>
          </section>
          <section className="pdCard">
            <div className="pdCard__title mb-2">Shipping & returns</div>
            <Row label="Packed weight">{data.shipping?.weight ? `${data.shipping.weight} g` : ""}</Row>
            <Row label="Packed size">{data.shipping?.length ? `${data.shipping.length} × ${data.shipping.width} × ${data.shipping.height} cm` : ""}</Row>
            <Row label="Ships in">{data.shipping?.dispatchDays ? `${data.shipping.dispatchDays} days` : ""}</Row>
            <Row label="COD">{data.shipping?.codAvailable === false ? "No" : "Yes"}</Row>
            <Row label="Returns">{data.policy?.returnable === false || data.policy?.returnType === "none" ? "Not returnable" : `${data.policy?.returnDays ?? 7} days ${data.policy?.returnType === "replace" ? "replacement" : "return"}`}</Row>
            <Row label="Warranty">{data.policy?.warrantyMonths ? `${data.policy.warrantyMonths} months${data.policy.warrantyType ? ` (${data.policy.warrantyType})` : ""}` : ""}</Row>
            <Row label="In the box">{data.policy?.inTheBox}</Row>
          </section>
          <section className="pdCard">
            <div className="pdCard__title mb-2">Legal</div>
            <Row label="Country of origin">{data.compliance?.countryOfOrigin}</Row>
            <Row label="Net quantity">{data.compliance?.netQuantity}</Row>
            <Row label="Manufacturer">{data.compliance?.manufacturer}</Row>
            <Row label="Importer">{data.compliance?.importer}</Row>
            <Row label="Packer">{data.compliance?.packer}</Row>
            <Row label="Manufactured">{data.compliance?.mfgDate}</Row>
            <Row label="Best before">{data.compliance?.expiryDate}</Row>
            <Row label="Licence no.">{data.compliance?.licenseNo}</Row>
            <Row label="Customer care">{data.compliance?.customerCare}</Row>
          </section>
          <button className="pdBtn pdBtn--dark !h-[44px]" onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Edit Product", data })}><FiEdit2 /> Edit product</button>
          <a className="pdBtn pdBtn--light" href={`${STORE_URL}/product/${data._id}`} target="_blank" rel="noopener noreferrer"><FiExternalLink /> View on store</a>
        </aside>
      </div>
    </div>
  );
};

export default ViewProduct;
