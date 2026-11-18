import React, { useContext, useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiLayers, FiInfo } from "react-icons/fi";
import { MyContext } from "../../../App";
import { getData, putData } from "../../../utils/api";
import { PRESETS } from "./presets";
import { findPath, keyOf } from "./attrUtils";
import "../../Products/style.css";

const TYPES = [["text", "Text"], ["number", "Number"], ["select", "Dropdown"], ["boolean", "Yes / No"], ["textarea", "Long text"]];
const blank = () => ({ label: "", type: "text", unit: "", options: [], group: "General", required: false, _new: Math.random() });

// Kisi bhi category (main / sub / third) ka "product details" template
const CategoryTemplate = ({ data }) => {
  const context = useContext(MyContext);
  const [tree, setTree] = useState([]);
  const [rows, setRows] = useState((data?.attributes || []).map((a) => ({ ...a, _new: Math.random() })));
  const [preset, setPreset] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getData("/api/category?admin=1").then((r) => {
      if (!r?.success) return;
      setTree(r.data || []);
      const me = findPath(r.data, data?._id)?.slice(-1)[0];
      if (me) setRows((me.attributes || []).map((a) => ({ ...a, _new: Math.random() })));
    });
  }, [data?._id]);

  const path = findPath(tree, data?._id) || [];
  const inherited = path.slice(0, -1).flatMap((c) => (c.attributes || []).map((a) => ({ ...a, from: c.name })));
  const set = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i, d) => setRows((r) => { const n = [...r]; const j = i + d; if (j < 0 || j >= n.length) return r; [n[i], n[j]] = [n[j], n[i]]; return n; });

  const applyPreset = (mode) => {
    const p = PRESETS[preset];
    if (!p) return;
    const add = p.attributes.map((a) => ({ ...a, key: keyOf(a.label), _new: Math.random() }));
    if (mode === "replace") setRows(add);
    else setRows((r) => [...r, ...add.filter((a) => !r.some((x) => keyOf(x.label) === a.key))]);
    context.openAlertBox("success", `${p.label} fields ${mode === "replace" ? "loaded" : "added"} — remember to save`);
  };

  const save = async () => {
    const clean = rows.filter((r) => r.label.trim());
    const keys = clean.map((r) => keyOf(r.label));
    if (new Set(keys).size !== keys.length) return context.openAlertBox("error", "Two fields have the same name");
    if (clean.some((r) => r.type === "select" && !r.options.length)) return context.openAlertBox("error", "Dropdown fields need at least one option");
    setSaving(true);
    const res = await putData(`/api/category/${data._id}/attributes`, {
      attributes: clean.map((a) => ({ key: a.key || keyOf(a.label), label: a.label.trim(), type: a.type, unit: a.unit, options: a.options, group: a.group, required: a.required })),
    });
    setSaving(false);
    if (res?.success) {
      context.openAlertBox("success", "Template saved");
      context.setIsOpenFullScreenPanel({ open: false });
    } else context.openAlertBox("error", res?.message || "Could not save");
  };

  return (
    <div className="pdPanel">
      <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[12px] text-gray-500">{path.map((c) => c.name).join(" › ") || data?.name}</div>
            <h2 className="text-[20px] font-[700] text-gray-900">Product details template</h2>
            <div className="text-[13px] text-gray-500 max-w-[640px]">These fields appear in the product form for this category (and its sub-categories), and show up under <b>Specifications</b> on the product page.</div>
          </div>
          <button className="pdBtn pdBtn--dark !h-10" disabled={saving} onClick={save}>
            {saving ? <CircularProgress size={16} color="inherit" /> : "Save template"}
          </button>
        </div>

        <section className="pdCard flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-[240px]">
            <span className="pdLabel">Start from a ready-made template</span>
            <select className="pdInput" value={preset} onChange={(e) => setPreset(e.target.value)}>
              <option value="">Choose a product type…</option>
              {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label} ({p.attributes.length} fields)</option>)}
            </select>
          </label>
          <button className="pdBtn pdBtn--light !h-10" disabled={!preset} onClick={() => applyPreset("add")}><FiPlus /> Add these fields</button>
          <button className="pdBtn pdBtn--light !h-10" disabled={!preset} onClick={() => applyPreset("replace")}>Replace all</button>
        </section>

        {inherited.length > 0 && (
          <section className="pdCard">
            <div className="flex items-center gap-2 pdCard__title"><FiLayers /> Inherited from parent ({inherited.length})</div>
            <div className="pdCard__sub">Edit these on the parent category.</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {inherited.map((a) => <span key={a.key} className="pdBadge">{a.label}{a.unit ? ` (${a.unit})` : ""} · {a.from}</span>)}
            </div>
          </section>
        )}

        <section className="pdCard !p-0">
          <div className="flex items-center justify-between px-[18px] py-3 border-b border-gray-100">
            <div className="pdCard__title">Fields ({rows.length})</div>
            <button className="text-[12px] font-[600] text-[#ff5252] flex items-center gap-1" onClick={() => setRows((r) => [...r, blank()])}><FiPlus /> Add field</button>
          </div>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="pdTable">
                <thead><tr><th>Field name</th><th>Type</th><th>Unit</th><th>Options (dropdown)</th><th>Section</th><th>Required</th><th /></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r._new}>
                      <td><input className="pdInput !h-9 min-w-[170px]" value={r.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="e.g. Height" /></td>
                      <td>
                        <select className="pdInput !h-9 min-w-[110px]" value={r.type} onChange={(e) => set(i, "type", e.target.value)}>
                          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td><input className="pdInput !h-9 w-[80px]" value={r.unit} onChange={(e) => set(i, "unit", e.target.value)} placeholder="cm" disabled={r.type === "boolean"} /></td>
                      <td>
                        <input className="pdInput !h-9 min-w-[200px]" disabled={r.type !== "select"} value={r.options.join(", ")}
                          onChange={(e) => set(i, "options", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))}
                          placeholder={r.type === "select" ? "Comma separated" : "—"} />
                      </td>
                      <td><input className="pdInput !h-9 min-w-[130px]" value={r.group} onChange={(e) => set(i, "group", e.target.value)} placeholder="General" /></td>
                      <td><button type="button" className={`pdSwitch ${r.required ? "is-on" : ""}`} onClick={() => set(i, "required", !r.required)} aria-label="Required" /></td>
                      <td>
                        <div className="flex items-center gap-0.5">
                          <button className="pdIconBtn" onClick={() => move(i, -1)} aria-label="Up"><FiArrowUp /></button>
                          <button className="pdIconBtn" onClick={() => move(i, 1)} aria-label="Down"><FiArrowDown /></button>
                          <button className="pdIconBtn pdIconBtn--danger" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} aria-label="Remove"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center gap-2 text-center">
              <FiInfo className="text-[24px] text-gray-300" />
              <div className="text-[13px] text-gray-500">No fields yet. Pick a ready-made template above or add your own.</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryTemplate;
