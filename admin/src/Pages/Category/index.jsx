import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FiPlus, FiSearch, FiX, FiEdit2, FiEye, FiTrash2, FiSliders, FiChevronRight, FiChevronLeft,
  FiFolder, FiLayers, FiGrid, FiAlertCircle, FiCornerDownRight, FiArrowUp, FiArrowDown,
} from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MyContext } from "../../App";
import { getData, deleteData, postData, putData } from "../../utils/api";
import { Check, ProductImage } from "../Products/shared";
import { LEVELS, flattenTree } from "./catUtils";
import "../Products/style.css";
import "./style.css";

const PER_PAGE = 15;
const TABS = [
  { key: "all", label: "All levels", to: "/category/list" },
  { key: 1, label: "Main", to: "/category/list?level=1" },
  { key: 2, label: "Sub", to: "/subCategory/list" },
  { key: 3, label: "Third level", to: "/thirdCategory/list" },
];
const HEALTH = [
  ["", "Any status"],
  ["empty", "No products"],
  ["noimage", "Main without image"],
  ["notemplate", "No product template"],
];
const SORTS = [["tree", "Default order"], ["name", "Name A–Z"], ["products", "Most products"], ["newest", "Newest first"]];
const ADD_MODEL = { 1: "Add New Category", 2: "Add New Sub Category", 3: "Add Third Level Category" };
const EDIT_MODEL = { 1: "Edit Category", 2: "Edit Sub Category", 3: "Edit Third Category" };

const CategoryList = ({ level: routeLevel = "all" }) => {
  const Context = useContext(MyContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qsLevel = params.get("level");
  const level = routeLevel === "all" && qsLevel ? Number(qsLevel) : routeLevel;

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [health, setHealth] = useState("");
  const [sort, setSort] = useState("tree");
  const [collapsed, setCollapsed] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const fetchCategories = () => {
    getData("/api/category?admin=1").then((res) => {
      if (res?.success) setTree(res.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { fetchCategories(); }, [Context.isOpenFullScreenPanel?.open]);
  useEffect(() => { setPage(1); setSelected([]); }, [level, search, health, sort]);

  const all = useMemo(() => flattenTree(tree), [tree]);
  const stats = useMemo(() => ({
    1: all.filter((c) => c.depth === 1).length,
    2: all.filter((c) => c.depth === 2).length,
    3: all.filter((c) => c.depth === 3).length,
    empty: all.filter((c) => !c.productCount).length,
  }), [all]);

  const q = search.trim().toLowerCase();
  const matchesHealth = (c) =>
    !health ||
    (health === "empty" && !c.productCount) ||
    (health === "noimage" && c.depth === 1 && !c.images?.length) ||
    (health === "notemplate" && !c.attributes?.length);
  const filtering = !!(q || health || level !== "all" || sort !== "tree");

  // Tree mode: sab levels, collapse/expand. Flat mode: search / filter / level / sort.
  const rows = useMemo(() => {
    if (!filtering) return all.filter((c) => !c.ancestors.some((id) => collapsed[id]));
    let list = all.filter((c) =>
      (level === "all" || c.depth === level) &&
      (!q || c.path.join(" ").toLowerCase().includes(q)) &&
      matchesHealth(c));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "products") list = [...list].sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, filtering, collapsed, level, q, health, sort]);

  const paged = filtering;
  const totalPages = paged ? Math.max(1, Math.ceil(rows.length / PER_PAGE)) : 1;
  const visible = paged ? rows.slice((page - 1) * PER_PAGE, page * PER_PAGE) : rows;
  const from = rows.length ? (paged ? (page - 1) * PER_PAGE + 1 : 1) : 0;

  const open = (model, data) => Context.setIsOpenFullScreenPanel({ open: true, model, data });

  // Order (same level ke andar) + show/hide + menu
  const siblingsOf = (c) => (c.depth === 1 ? tree : all.find((x) => x._id === c.ancestors[c.ancestors.length - 1])?.children || []);
  const move = async (c, dir) => {
    const sib = siblingsOf(c).map((x) => x._id);
    const i = sib.indexOf(c._id); const j = i + dir;
    if (i < 0 || j < 0 || j >= sib.length) return;
    [sib[i], sib[j]] = [sib[j], sib[i]];
    const res = await putData("/api/category/reorder", { ids: sib });
    if (res?.success) fetchCategories(); else Context.openAlertBox("error", res?.message || "Could not reorder");
  };
  const setVisibility = async (c, patch, msg) => {
    const res = await putData(`/api/category/${c._id}/visibility`, patch);
    if (res?.success) { Context.openAlertBox("success", msg); fetchCategories(); }
    else Context.openAlertBox("error", res?.message || "Could not update");
  };
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allOnPage = visible.length > 0 && visible.every((c) => selected.includes(c._id));
  const toggleAll = () => {
    const ids = visible.map((c) => c._id);
    setSelected((s) => (allOnPage ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]));
  };
  const allCollapsed = all.some((c) => c.children?.length) && all.filter((c) => c.children?.length).every((c) => collapsed[c._id]);
  const setAllCollapsed = (v) => setCollapsed(v ? Object.fromEntries(all.filter((c) => c.children?.length).map((c) => [c._id, true])) : {});
  const clearFilters = () => { setSearch(""); setHealth(""); setSort("tree"); if (level !== "all") navigate("/category/list"); };

  const deleteWarning = (c) => {
    const parts = [`Delete "${c.name}"?`];
    if (c.descendants) parts.push(`Its ${c.descendants} sub-categor${c.descendants === 1 ? "y" : "ies"} will also be deleted.`);
    if (c.productCount) parts.push(`${c.productCount} product(s) use this category and will lose it.`);
    parts.push("This cannot be undone.");
    return parts.join("\n\n");
  };

  const deleteOne = async (c) => {
    if (!window.confirm(deleteWarning(c))) return;
    const res = await deleteData(`/api/category/${c._id}`);
    if (res?.success) {
      Context.openAlertBox("success", "Category deleted");
      setSelected((s) => s.filter((x) => x !== c._id));
      fetchCategories();
    } else Context.openAlertBox("error", res?.message || "Failed to delete category");
  };

  const deleteSelected = async () => {
    const chosen = all.filter((c) => selected.includes(c._id));
    const extra = chosen.reduce((n, c) => n + c.descendants, 0);
    const products = chosen.reduce((n, c) => n + (c.productCount || 0), 0);
    const msg = [`Delete ${chosen.length} categor${chosen.length === 1 ? "y" : "ies"}?`];
    if (extra) msg.push(`Up to ${extra} sub-categories inside them will also be deleted.`);
    if (products) msg.push(`${products} product link(s) will be affected.`);
    if (!window.confirm(msg.join("\n\n"))) return;
    // parent ke saath child bhi chala jaata hai — child id dobara mat bhejo
    const ids = chosen.filter((c) => !c.ancestors.some((a) => selected.includes(a))).map((c) => c._id);
    const res = await postData("/api/category/bulk-delete", { ids });
    if (res?.success) {
      Context.openAlertBox("success", `${chosen.length} categor${chosen.length === 1 ? "y" : "ies"} deleted`);
      setSelected([]);
      fetchCategories();
    } else Context.openAlertBox("error", res?.message || "Failed to delete categories");
  };

  const addLabel = level === 2 ? "Add sub-category" : level === 3 ? "Add third level" : "Add category";

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Categories</h1>
          <div className="text-[14px] text-gray-500">Organise your catalogue into main, sub and third-level categories.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="pdBtn pdBtn--light" to="/variant-options">Variant options</Link>
          <button className="pdBtn pdBtn--dark" onClick={() => open(ADD_MODEL[level === "all" ? 1 : level])}><FiPlus /> {addLabel}</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [FiFolder, "Main categories", stats[1], () => navigate("/category/list?level=1")],
          [FiLayers, "Sub-categories", stats[2], () => navigate("/subCategory/list")],
          [FiGrid, "Third level", stats[3], () => navigate("/thirdCategory/list")],
          [FiAlertCircle, "Without products", stats.empty, () => setHealth("empty")],
        ].map(([Icon, label, n, go]) => (
          <button key={label} onClick={go} className="catStat">
            <span className="catStat__icon"><Icon /></span>
            <span className="text-left">
              <span className="block text-[12px] text-gray-500 font-[500]">{label}</span>
              <span className="block text-[20px] font-[700] text-gray-900 leading-tight">{loading ? "…" : n}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} className={`pdTab ${level === t.key ? "is-active" : ""}`} onClick={() => navigate(t.to)}>
              {t.label}
              <b className={`text-[11px] px-1.5 rounded-full ${level === t.key ? "bg-white/20" : "bg-black/[.07]"}`}>
                {loading ? "…" : t.key === "all" ? all.length : stats[t.key]}
              </b>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          <div className="pdSearch w-full md:w-[280px]">
            <FiSearch className="text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories or path" />
            {search && <button onClick={() => setSearch("")} aria-label="Clear" className="text-gray-400"><FiX /></button>}
          </div>
          <select className="pdSelect" value={health} onChange={(e) => setHealth(e.target.value)}>
            {HEALTH.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          {filtering && <button className="text-[12px] font-[600] text-gray-500 hover:text-[#ff5252] flex items-center gap-1" onClick={clearFilters}><FiX /> Clear filters</button>}
          <div className="md:ml-auto flex items-center gap-2">
            {!filtering && all.length > 0 && (
              <button className="text-[12px] font-[600] text-gray-500 hover:text-gray-900" onClick={() => setAllCollapsed(!allCollapsed)}>
                {allCollapsed ? "Expand all" : "Collapse all"}
              </button>
            )}
            <select className="pdSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
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
                <th className="w-[44px]"><Check checked={allOnPage} onChange={toggleAll} disabled={!visible.length} label="Select all" /></th>
                <th>Category</th>
                <th>Level</th>
                <th className="text-right">Sub-categories</th>
                <th className="text-right">Products</th>
                <th>Template</th>
                <th>On store</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <tr key={i}><td colSpan="8"><div className="h-11 rounded bg-gray-100 animate-pulse" /></td></tr>)
              ) : visible.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="py-14 flex flex-col items-center gap-2 text-center">
                    <FiFolder className="text-[28px] text-gray-300" />
                    <div className="text-[14px] font-[600] text-gray-800">{filtering ? "No categories match these filters" : "No categories yet"}</div>
                    {filtering
                      ? <button onClick={clearFilters} className="text-[13px] font-[600] text-[#ff5252] hover:underline">Clear filters</button>
                      : <button onClick={() => open(ADD_MODEL[1])} className="pdBtn pdBtn--dark mt-1"><FiPlus /> Add category</button>}
                  </div>
                </td></tr>
              ) : (
                visible.map((c) => {
                  const hasKids = c.children?.length > 0;
                  const isOpen = !collapsed[c._id];
                  return (
                    <tr key={c._id} className={selected.includes(c._id) ? "is-selected" : ""}>
                      <td><Check checked={selected.includes(c._id)} onChange={() => toggle(c._id)} /></td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[260px]" style={!filtering ? { paddingLeft: (c.depth - 1) * 28 } : undefined}>
                          {!filtering && (
                            hasKids
                              ? <button className={`catCaret ${isOpen ? "is-open" : ""}`} onClick={() => setCollapsed((s) => ({ ...s, [c._id]: isOpen }))} aria-label={isOpen ? "Collapse" : "Expand"}><FiChevronRight /></button>
                              : <span className="catCaret catCaret--leaf">{c.depth > 1 && <FiCornerDownRight />}</span>
                          )}
                          {c.depth === 1
                            ? <ProductImage src={c.images?.[0]} className="catThumb" />
                            : <span className={`catDot catDot--${c.depth}`}>{c.name?.[0]?.toUpperCase()}</span>}
                          <button className="min-w-0 text-left" onClick={() => open("View Category", c)}>
                            <span className={`block font-[600] truncate hover:text-[#ff5252] ${c.isActive === false ? "text-gray-400 line-through" : "text-gray-900"}`}>{c.name}</span>
                            {(filtering && c.depth > 1) && <span className="block text-[12px] text-gray-400 truncate">{c.path.slice(0, -1).join(" › ")}</span>}
                          </button>
                        </div>
                      </td>
                      <td><span className={`pdBadge ${c.depth === 1 ? "pdBadge--blue" : c.depth === 2 ? "pdBadge--green" : "pdBadge--amber"}`}>{LEVELS[c.depth]}</span></td>
                      <td className="text-right tabular-nums">{c.depth < 3 ? (c.children?.length || <span className="text-gray-300">0</span>) : <span className="text-gray-300">—</span>}</td>
                      <td className="text-right tabular-nums">
                        {c.productCount
                          ? <span className="font-[600] text-gray-900">{c.productCount}</span>
                          : <span className="pdBadge pdBadge--red !py-0">0</span>}
                      </td>
                      <td>
                        <button className="catTpl" onClick={() => open("Product Details Template", c)}>
                          <FiSliders /> {c.attributes?.length ? `${c.attributes.length} fields` : <span className="text-gray-400">Set up</span>}
                        </button>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1.5 min-w-[110px]">
                          <button className="flex items-center gap-2 text-[12px] text-gray-700" title={c.isActive === false ? "Hidden from the store (with everything inside)" : "Visible on the store"}
                            onClick={() => setVisibility(c, { isActive: c.isActive === false }, c.isActive === false ? `"${c.name}" is visible again` : `"${c.name}" hidden from the store`)}>
                            <span className={`pdSwitch ${c.isActive !== false ? "is-on" : ""}`} /> {c.isActive !== false ? "Visible" : "Hidden"}
                          </button>
                          {c.depth === 1 && c.isActive !== false && (
                            <button className="flex items-center gap-2 text-[12px] text-gray-700" title="Show in the top menu bar"
                              onClick={() => setVisibility(c, { showInMenu: c.showInMenu === false }, c.showInMenu === false ? "Added to menu" : "Removed from menu")}>
                              <span className={`pdSwitch ${c.showInMenu !== false ? "is-on" : ""}`} /> In menu
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-0.5">
                          {!filtering && <>
                            <button className="pdIconBtn" title="Move up" disabled={siblingsOf(c)[0]?._id === c._id} onClick={() => move(c, -1)}><FiArrowUp /></button>
                            <button className="pdIconBtn" title="Move down" disabled={siblingsOf(c).slice(-1)[0]?._id === c._id} onClick={() => move(c, 1)}><FiArrowDown /></button>
                          </>}
                          {c.depth < 3 && <button className="pdIconBtn" title={`Add ${c.depth === 1 ? "sub-category" : "third level"} inside`} onClick={() => open(ADD_MODEL[c.depth + 1], { parentId: c._id, rootId: c.ancestors[0] || c._id })}><FiPlus /></button>}
                          <button className="pdIconBtn" title="View" onClick={() => open("View Category", c)}><FiEye /></button>
                          <button className="pdIconBtn" title="Edit" onClick={() => open(EDIT_MODEL[c.depth], c)}><FiEdit2 /></button>
                          <button className="pdIconBtn pdIconBtn--danger" title="Delete" onClick={() => deleteOne(c)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">
            {rows.length ? `Showing ${from}–${from + visible.length - 1} of ${rows.length}` : "0 categories"}
          </span>
          {paged && totalPages > 1 && (
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

export default CategoryList;
