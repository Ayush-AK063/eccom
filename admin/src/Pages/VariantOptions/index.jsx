import React, { useContext, useEffect, useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { FiPlus, FiSearch, FiX, FiTrash2, FiArrowUp, FiArrowDown, FiLayers, FiGrid, FiDroplet, FiList, FiInfo, FiCheck } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData, postData, putData, deleteData } from "../../utils/api";
import CategoryPicker from "./CategoryPicker";
import "../Products/style.css";
import "./style.css";

const DISPLAYS = [
  { key: "buttons", label: "Buttons", icon: <FiGrid />, hint: "S  M  L  XL" },
  { key: "swatch", label: "Colour circles", icon: <FiDroplet />, hint: "● ● ●" },
  { key: "dropdown", label: "Dropdown", icon: <FiList />, hint: "For long lists" },
];
// Naya option banate waqt ready-made suggestions
const SUGGEST = [
  { name: "Storage", unit: "", values: ["64GB", "128GB", "256GB", "512GB", "1TB"] },
  { name: "Flavour", values: ["Chocolate", "Vanilla", "Strawberry", "Mango", "Unflavoured"] },
  { name: "Shade", display: "swatch", values: [] },
  { name: "Pack of", values: ["1", "2", "3", "5", "10"] },
  { name: "Capacity", values: ["250ml", "500ml", "1L", "2L"] },
  { name: "Material", values: ["Cotton", "Polyester", "Leather", "Metal", "Wood"] },
  { name: "Length", values: ["Short", "Regular", "Long"] },
  { name: "Edition", values: ["Standard", "Deluxe", "Limited"] },
  { name: "Scale", values: ["1/4", "1/6", "1/7", "1/8", "1/12"] },
  { name: "Screen size", values: ['32"', '43"', '55"', '65"'] },
  { name: "Compatible model", values: [] },
  { name: "Ring size", values: ["6", "7", "8", "9", "10", "11", "12"] },
];
const blank = { name: "", display: "buttons", unit: "", values: [], categoryIds: [], allowCustom: true, description: "" };

const VariantOptions = () => {
  const context = useContext(MyContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(null); // "new" = naya
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [catTree, setCatTree] = useState([]);

  const load = (selectId) =>
    getData("/api/variantOption?withUsage=1").then((r) => {
      const data = r?.data || [];
      setList(data);
      setLoading(false);
      const pick = data.find((o) => o._id === (selectId ?? activeId)) || (selectId === undefined && activeId === null ? data[0] : null);
      if (pick) { setActiveId(pick._id); setForm(toForm(pick)); }
    });

  useEffect(() => {
    load();
    getData("/api/category?admin=1").then((r) => r?.success && setCatTree(r.data || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toForm = (o) => ({ ...blank, ...o, values: (o.values || []).map((v) => ({ value: v.value, hex: v.hex || "" })) });
  const active = list.find((o) => o._id === activeId);
  const dirty = useMemo(() => activeId === "new" ? !!form.name : active && JSON.stringify(toForm(active)) !== JSON.stringify(form), [form, active, activeId]);
  const filtered = list.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase()) || o.values.some((v) => v.value.toLowerCase().includes(q.toLowerCase())));

  const select = (o) => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setActiveId(o === "new" ? "new" : o._id);
    setForm(o === "new" ? blank : toForm(o));
    setValueInput("");
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addValues = (raw) => {
    const parts = String(raw).split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
    if (!parts.length) return;
    setForm((f) => {
      const have = new Set(f.values.map((v) => v.value.toLowerCase()));
      const add = parts.filter((p) => !have.has(p.toLowerCase()) && have.add(p.toLowerCase())).map((value) => ({ value, hex: f.display === "swatch" ? "#9ca3af" : "" }));
      return { ...f, values: [...f.values, ...add] };
    });
    setValueInput("");
  };
  const setVal = (i, k, v) => setForm((f) => ({ ...f, values: f.values.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const moveVal = (i, d) => setForm((f) => { const n = [...f.values]; const j = i + d; if (j < 0 || j >= n.length) return f; [n[i], n[j]] = [n[j], n[i]]; return { ...f, values: n }; });
  const sortVals = () => setForm((f) => ({ ...f, values: [...f.values].sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true })) }));

  const save = async () => {
    if (!form.name.trim()) return context.openAlertBox("error", "Give the option a name");
    setSaving(true);
    const res = activeId === "new" ? await postData("/api/variantOption", form) : await putData(`/api/variantOption/${activeId}`, form);
    setSaving(false);
    if (res?.success) {
      context.openAlertBox("success", res.message || "Saved");
      load(res.data?._id);
    } else context.openAlertBox("error", res?.message || "Could not save");
  };

  const remove = async () => {
    const used = active?.usage || 0;
    if (!window.confirm(`Delete "${active.name}"?${used ? ` ${used} product(s) use it — they keep their own copy of the values.` : ""} This cannot be undone.`)) return;
    const res = await deleteData(`/api/variantOption/${activeId}`);
    if (res?.success) {
      context.openAlertBox("success", "Option deleted");
      setActiveId(null);
      setForm(blank);
      load(null);
    } else context.openAlertBox("error", res?.message || "Could not delete");
  };

  const move = async (i, d) => {
    const n = [...list]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setList(n);
    await putData("/api/variantOption/reorder", { ids: n.map((o) => o._id) });
  };

  const applySuggestion = (s) => setForm({ ...blank, ...s, values: s.values.map((value) => ({ value, hex: s.display === "swatch" ? "#9ca3af" : "" })) });

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Variant options</h1>
          <div className="text-[14px] text-gray-500">Options customers choose on a product — Size, Colour, Storage, Flavour… Products pick from these, or add their own.</div>
        </div>
        <button className="pdBtn pdBtn--dark" onClick={() => select("new")}><FiPlus /> New option</button>
      </div>

      <div className="voGrid">
        {/* Left: list */}
        <aside className="bg-white border border-gray-200 rounded-md flex flex-col min-h-0">
          <div className="p-3 border-b border-gray-100">
            <div className="pdSearch">
              <FiSearch className="text-gray-400 shrink-0" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search options or values" />
              {q && <button onClick={() => setQ("")} className="text-gray-400" aria-label="Clear"><FiX /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? [0, 1, 2, 3].map((i) => <div key={i} className="h-14 m-1 rounded-md bg-gray-100 animate-pulse" />) : (
              <>
                {activeId === "new" && (
                  <div className="voItem is-active"><span className="voItem__icon"><FiPlus /></span><span className="min-w-0"><span className="block text-[13px] font-[600] truncate">{form.name || "New option"}</span><span className="block text-[11px] text-gray-400">Not saved yet</span></span></div>
                )}
                {filtered.map((o) => {
                  const i = list.indexOf(o);
                  return (
                    <div key={o._id} className={`voItem group ${activeId === o._id ? "is-active" : ""}`} onClick={() => select(o)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && select(o)}>
                      <span className="voItem__icon">{DISPLAYS.find((d) => d.key === o.display)?.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-[600] text-gray-900 truncate">{o.name}{o.unit ? ` (${o.unit})` : ""}</span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                          {o.display === "swatch" && <span className="flex -space-x-1 mr-1">{o.values.slice(0, 5).map((v) => <i key={v.value} className="voDot" style={{ background: v.hex || "#e5e7eb" }} />)}</span>}
                          {o.values.length} values · {o.usage || 0} products{o.categoryIds?.length ? ` · ${o.categoryIds.length} cat.` : ""}
                        </span>
                      </span>
                      {!q && (
                        <span className="voItem__move" onClick={(e) => e.stopPropagation()}>
                          <button aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><FiArrowUp /></button>
                          <button aria-label="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1}><FiArrowDown /></button>
                        </span>
                      )}
                    </div>
                  );
                })}
                {!filtered.length && activeId !== "new" && <div className="py-10 text-center text-[13px] text-gray-400">No options found</div>}
              </>
            )}
          </div>
        </aside>

        {/* Right: editor */}
        <section className="bg-white border border-gray-200 rounded-md min-w-0">
          {!activeId ? (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center gap-2 text-center p-8">
              <FiLayers className="text-[30px] text-gray-300" />
              <div className="text-[15px] font-[600] text-gray-800">Pick an option on the left</div>
              <div className="text-[13px] text-gray-500">or create a new one.</div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="text-[17px] font-[700] text-gray-900 truncate">{activeId === "new" ? "New option" : active?.name}</div>
                  {activeId !== "new" && <div className="text-[12px] text-gray-500">Used by {active?.usage || 0} products{dirty ? " · unsaved changes" : ""}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {activeId !== "new" && <button className="pdBtn pdBtn--light !text-[#dc2626] hover:!border-[#dc2626]" onClick={remove}><FiTrash2 /> Delete</button>}
                  {dirty && <button className="pdBtn pdBtn--light" onClick={() => (activeId === "new" ? (setActiveId(null), setForm(blank)) : setForm(toForm(active)))}>Discard</button>}
                  <button className="pdBtn pdBtn--dark" onClick={save} disabled={saving || !dirty}>{saving ? <CircularProgress size={16} color="inherit" /> : <><FiCheck /> Save</>}</button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-6">
                {activeId === "new" && !form.name && (
                  <div>
                    <div className="pdLabel">Quick start</div>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGEST.filter((s) => !list.some((o) => o.name.toLowerCase() === s.name.toLowerCase())).map((s) => (
                        <button key={s.name} className="pdChip !h-8" onClick={() => applySuggestion(s)}><FiPlus /> {s.name}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
                  <label>
                    <span className="pdLabel">Option name <em>*</em></span>
                    <input className="pdInput" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Storage, Flavour, Shade" maxLength={40} />
                    <div className="pdHint">Customers see this above the choices, e.g. “Select {form.name ? form.name.toLowerCase() : "storage"}”.</div>
                  </label>
                  <label>
                    <span className="pdLabel">Unit</span>
                    <input className="pdInput" value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="e.g. GB, ml" maxLength={12} />
                  </label>
                </div>

                <div>
                  <span className="pdLabel">Show on the store as</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DISPLAYS.map((d) => (
                      <button key={d.key} type="button" onClick={() => set("display", d.key)} className={`voDisplay ${form.display === d.key ? "is-active" : ""}`}>
                        <span className="text-[16px]">{d.icon}</span>
                        <span className="text-left">
                          <span className="block text-[13px] font-[600] text-gray-900">{d.label}</span>
                          <span className="block text-[11px] text-gray-400">{d.hint}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="pdLabel !mb-0">Values ({form.values.length})</span>
                    {form.values.length > 1 && <button className="text-[12px] font-[600] text-gray-500 hover:text-gray-900" onClick={sortVals}>Sort A–Z / 1–9</button>}
                  </div>
                  <div className="flex gap-2">
                    <input className="pdInput" value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Type a value and press Enter — or paste many separated by commas"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addValues(valueInput); } }} onPaste={(e) => { const t = e.clipboardData.getData("text"); if (/[,\n]/.test(t)) { e.preventDefault(); addValues(t); } }} />
                    <button className="pdBtn pdBtn--light !h-10" onClick={() => addValues(valueInput)} disabled={!valueInput.trim()}><FiPlus /> Add</button>
                  </div>
                  {form.values.length ? (
                    <div className="mt-3 border border-gray-100 rounded-md divide-y divide-gray-100">
                      {form.values.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2">
                          <span className="w-6 text-[11px] text-gray-400">{i + 1}</span>
                          {form.display === "swatch" && (
                            <label className="voSwatch" style={{ background: v.hex || "#e5e7eb" }} title="Pick colour">
                              <input type="color" value={v.hex || "#9ca3af"} onChange={(e) => setVal(i, "hex", e.target.value)} />
                            </label>
                          )}
                          <input className="pdInput !h-8 flex-1" value={v.value} onChange={(e) => setVal(i, "value", e.target.value)} />
                          {form.display === "swatch" && <input className="pdInput !h-8 !w-[92px] font-mono !text-[12px]" value={v.hex} onChange={(e) => setVal(i, "hex", e.target.value)} placeholder="#000000" />}
                          <button className="pdIconBtn" onClick={() => moveVal(i, -1)} disabled={i === 0} aria-label="Up"><FiArrowUp /></button>
                          <button className="pdIconBtn" onClick={() => moveVal(i, 1)} disabled={i === form.values.length - 1} aria-label="Down"><FiArrowDown /></button>
                          <button className="pdIconBtn pdIconBtn--danger" onClick={() => set("values", form.values.filter((_, j) => j !== i))} aria-label="Remove"><FiX /></button>
                        </div>
                      ))}
                    </div>
                  ) : <div className="mt-3 py-6 text-center text-[13px] text-gray-400 border border-dashed border-gray-200 rounded-md">No values yet</div>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <span className="pdLabel">Use in categories</span>
                    <div className="text-[11px] text-gray-400 mb-2">Where this option is suggested in the product form.</div>
                    <CategoryPicker key={activeId} tree={catTree} value={form.categoryIds} onChange={(ids) => set("categoryIds", ids)} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <button type="button" onClick={() => set("allowCustom", !form.allowCustom)} className="flex items-start gap-3 text-left">
                      <span className={`pdSwitch mt-0.5 ${form.allowCustom ? "is-on" : ""}`} />
                      <span>
                        <span className="block text-[13px] font-[600] text-gray-900">Allow new values in the product form</span>
                        <span className="block text-[11px] text-gray-400">Off = products can only use the values listed here.</span>
                      </span>
                    </button>
                    <label>
                      <span className="pdLabel">Note (admin only)</span>
                      <textarea className="pdInput !min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Use UK sizes for footwear" />
                    </label>
                    <div className="p-3 rounded-md bg-gray-50">
                      <div className="text-[11px] font-[700] uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1"><FiInfo /> Preview on the store</div>
                      <div className="text-[13px] font-[600] text-gray-900 mb-2">{form.name || "Option"}</div>
                      {form.display === "dropdown" ? (
                        <select className="pdInput !h-9 !w-[200px]"><option>Select {form.name.toLowerCase() || "option"}</option>{form.values.map((v) => <option key={v.value}>{v.value}{form.unit ? ` ${form.unit}` : ""}</option>)}</select>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {form.values.slice(0, 10).map((v, i) => form.display === "swatch"
                            ? <span key={i} className={`voPrevSwatch ${i === 0 ? "is-on" : ""}`} style={{ background: v.hex || "#e5e7eb" }} title={v.value} />
                            : <span key={i} className={`voPrevBtn ${i === 0 ? "is-on" : ""}`}>{v.value}{form.unit ? ` ${form.unit}` : ""}</span>)}
                          {!form.values.length && <span className="text-[12px] text-gray-400">Add values to see a preview</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default VariantOptions;
