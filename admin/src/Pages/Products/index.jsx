import React, { useContext, useEffect, useState } from "react";
import { FiPlus, FiSearch, FiX, FiEdit2, FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiBox, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { getData, deleteData, postData } from "../../utils/api";

import { Check, ProductImage, StockBadge } from "./shared";
import { inr } from "./utils";
import "./style.css";

const PER_PAGE = 10;
const STOCK_TABS = [
  { key: "", label: "All" },
  { key: "in", label: "In stock" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
];
const SORTS = [
  ["newest", "Newest first"], ["oldest", "Oldest first"], ["price_desc", "Price: high to low"],
  ["price_asc", "Price: low to high"], ["stock_asc", "Stock: low first"], ["name", "Name A–Z"],
];

const Products = () => {
  const Context = useContext(MyContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [selected, setSelected] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cat, setCat] = useState("");
  const [sub, setSub] = useState("");
  const [third, setThird] = useState("");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    getData("/api/category?admin=1").then((res) => res?.success && setCategories(res.data || []));
  }, []);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const baseQuery = () => {
    const p = new URLSearchParams({ admin: "1" });
    if (status) p.set("status", status);
    if (cat) p.set("category", cat);
    if (sub) p.set("subCategory", sub);
    if (third) p.set("thirdCategory", third);
    if (q) p.set("search", q);
    return p;
  };

  const fetchProducts = () => {
    setLoading(true);
    const p = baseQuery();
    p.set("page", page); p.set("perPage", PER_PAGE); p.set("sort", sort);
    if (stock) p.set("stock", stock);
    getData(`/api/product?${p}`).then((res) => {
      if (res?.success) {
        setProducts(res.products || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.totalPosts ?? 0);
      } else if (page > 1) setPage(1);
      setLoading(false);
    });
    // tab counts (same filters, har stock bucket)
    Promise.all(STOCK_TABS.map((t) => {
      const c = baseQuery(); c.set("perPage", 1); if (t.key) c.set("stock", t.key);
      return getData(`/api/product?${c}`).then((r) => [t.key, r?.totalPosts ?? 0]);
    })).then((list) => setCounts(Object.fromEntries(list)));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Context.isOpenFullScreenPanel?.open, page, cat, sub, third, stock, sort, q, status]);

  const subList = categories.find((c) => c._id === cat)?.children || [];
  const thirdList = subList.find((s) => s._id === sub)?.children || [];
  const open = (model, data) => Context.setIsOpenFullScreenPanel({ open: true, model, data });
  const allOnPage = products.length > 0 && products.every((p) => selected.includes(p._id));
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => {
    const ids = products.map((p) => p._id);
    setSelected((s) => (allOnPage ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]));
  };
  const filtersOn = cat || q || stock || status;
  const clearFilters = () => { setCat(""); setSub(""); setThird(""); setSearch(""); setStock(""); setStatus(""); setPage(1); };

  const deleteOne = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    const res = await deleteData(`/api/product/deleteproduct/${id}`);
    if (res?.success) {
      Context.openAlertBox("success", "Product deleted");
      setSelected((s) => s.filter((x) => x !== id));
      fetchProducts();
    } else Context.openAlertBox("error", res?.message || "Failed to delete product");
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.length} product(s)? This cannot be undone.`)) return;
    const res = await postData("/api/product/delete-multiple", { ids: selected });
    if (res?.success) {
      Context.openAlertBox("success", `${selected.length} product(s) deleted`);
      setSelected([]);
      fetchProducts();
    } else Context.openAlertBox("error", res?.message || "Failed to delete products");
  };

  const from = total ? (page - 1) * PER_PAGE + 1 : 0;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Products</h1>
          <div className="text-[14px] text-gray-500">Manage your catalogue, prices and stock.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="pdBtn pdBtn--light" to="/variant-options">Variant options</Link>
          <button className="pdBtn pdBtn--dark" onClick={() => open("Add Product")}><FiPlus /> Add product</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        {/* Stock tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {STOCK_TABS.map((t) => (
            <button key={t.key} className={`pdTab ${stock === t.key ? "is-active" : ""}`} onClick={() => { setStock(t.key); setPage(1); }}>
              {t.label}
              <b className={`text-[11px] px-1.5 rounded-full ${stock === t.key ? "bg-white/20" : "bg-black/[.07]"}`}>{counts[t.key] ?? "…"}</b>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          <div className="pdSearch w-full md:w-[260px]">
            <FiSearch className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or brand" />
            {search && <button onClick={() => setSearch("")} aria-label="Clear" className="text-gray-400"><FiX /></button>}
          </div>
          <select className="pdSelect" value={cat} onChange={(e) => { setCat(e.target.value); setSub(""); setThird(""); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="pdSelect" value={sub} disabled={!subList.length} onChange={(e) => { setSub(e.target.value); setThird(""); setPage(1); }}>
            <option value="">All sub-categories</option>
            {subList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="pdSelect" value={third} disabled={!thirdList.length} onChange={(e) => { setThird(e.target.value); setPage(1); }}>
            <option value="">All third level</option>
            {thirdList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="pdSelect" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          {filtersOn && <button className="text-[12px] font-[600] text-gray-500 hover:text-[#ff5252] flex items-center gap-1" onClick={clearFilters}><FiX /> Clear filters</button>}
          <select className="pdSelect md:ml-auto" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        {selected.length > 0 && (
          <div className="mx-4 mt-3 flex items-center gap-3 bg-[#111827] text-white rounded-md px-4 py-2">
            <span className="text-[13px] font-[600]">{selected.length} selected</span>
            <button onClick={() => setSelected([])} className="text-[12px] text-gray-300 hover:text-white flex items-center gap-1"><FiX /> Clear</button>
            <button onClick={deleteSelected} className="ml-auto h-8 px-3 rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-[12px] font-[600] flex items-center gap-1.5"><FiTrash2 /> Delete</button>
          </div>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="pdTable">
            <thead>
              <tr>
                <th className="w-[44px]"><Check checked={allOnPage} onChange={toggleAll} disabled={!products.length} label="Select all" /></th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Tags</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <tr key={i}><td colSpan="8"><div className="h-12 rounded bg-gray-100 animate-pulse" /></td></tr>)
              ) : products.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="py-14 flex flex-col items-center gap-2 text-center">
                    <FiBox className="text-[28px] text-gray-300" />
                    <div className="text-[14px] font-[600] text-gray-800">{filtersOn ? "No products match these filters" : "No products yet"}</div>
                    {filtersOn
                      ? <button onClick={clearFilters} className="text-[13px] font-[600] text-[#ff5252] hover:underline">Clear filters</button>
                      : <button onClick={() => open("Add Product")} className="pdBtn pdBtn--dark mt-1"><FiPlus /> Add product</button>}
                  </div>
                </td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className={selected.includes(p._id) ? "is-selected" : ""}>
                    <td><Check checked={selected.includes(p._id)} onChange={() => toggle(p._id)} /></td>
                    <td>
                      <button className="flex items-center gap-3 text-left min-w-[240px] max-w-[340px]" onClick={() => open("View Product", p)}>
                        <ProductImage src={p.images?.[0]} />
                        <span className="min-w-0">
                          <span className="block font-[600] text-gray-900 truncate hover:text-[#ff5252]">{p.name}</span>
                          <span className="flex items-center gap-1.5 text-[12px] text-gray-500 min-w-0">
                            {p.status === "draft" && <span className="pdBadge pdBadge--amber !py-0">Draft</span>}
                            {p.status === "archived" && <span className="pdBadge !py-0">Archived</span>}
                            <span className="truncate">{p.brand || "No brand"}{p.sku ? ` · ${p.sku}` : ""}</span>
                            {p.variants?.length > 0 && <span className="shrink-0 text-gray-400">· {p.variants.length} variants</span>}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="text-gray-900 whitespace-nowrap">{p.catId?.name || p.catName || "—"}</div>
                      {(p.subCat || p.thirdSubCat) && <div className="text-[12px] text-gray-400 whitespace-nowrap">{[p.subCat, p.thirdSubCat].filter(Boolean).join(" › ")}</div>}
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="font-[700] text-gray-900">{p.variants?.length > 1 && new Set(p.variants.map((v) => v.price)).size > 1 ? "From " : ""}{inr(p.price)}</div>
                      {p.oldprice > p.price && (
                        <div className="text-[12px]"><span className="line-through text-gray-400">{inr(p.oldprice)}</span> <span className="text-[#059669] font-[600]">{p.discount || Math.round(((p.oldprice - p.price) / p.oldprice) * 100)}% off</span></div>
                      )}
                    </td>
                    <td><StockBadge n={p.countInStock} low={p.lowStockThreshold} /></td>
                    <td className="whitespace-nowrap">{p.rating ? <span className="inline-flex items-center gap-1 font-[600] text-gray-900"><FiStar className="text-[#f59e0b] fill-[#f59e0b]" />{Number(p.rating).toFixed(1)}</span> : <span className="text-gray-300">—</span>}</td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {(p.productFlags || []).length ? p.productFlags.map((f) => <span key={f} className="pdBadge pdBadge--blue">{f}</span>) : <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        <button className="pdIconBtn" title="View" onClick={() => open("View Product", p)}><FiEye /></button>
                        <button className="pdIconBtn" title="Edit" onClick={() => open("Edit Product", p)}><FiEdit2 /></button>
                        <button className="pdIconBtn pdIconBtn--danger" title="Delete" onClick={() => deleteOne(p._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">{total ? `Showing ${from}–${from + products.length - 1} of ${total}` : "0 products"}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button className="pdPage" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous"><FiChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <React.Fragment key={n}>
                    {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-gray-400">…</span>}
                    <button className={`pdPage ${n === page ? "is-active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                  </React.Fragment>
                ))}
              <button className="pdPage" disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Next"><FiChevronRight /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
