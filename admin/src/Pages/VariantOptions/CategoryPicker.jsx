import React, { useMemo, useState } from "react";
import { FiSearch, FiX, FiChevronRight, FiCheck, FiGlobe, FiFilter } from "react-icons/fi";

// "Use in categories": All ya chuni hui categories. Parent chuno → uske saare sub / third apne aap shamil.
const CategoryPicker = ({ tree = [], value = [], onChange }) => {
  const [mode, setMode] = useState(value.length ? "some" : "all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState({});

  const byId = useMemo(() => {
    const m = {};
    const walk = (list, parent = null, path = []) => list.forEach((c) => { m[c._id] = { ...c, parent, path: [...path, c.name] }; walk(c.children || [], c._id, [...path, c.name]); });
    walk(tree);
    return m;
  }, [tree]);
  const selected = new Set(value);
  const coveredByParent = (id) => { let p = byId[id]?.parent; while (p) { if (selected.has(p)) return true; p = byId[p]?.parent; } return false; };
  const descendants = (c) => (c.children || []).flatMap((x) => [x._id, ...descendants(x)]);

  const toggle = (c) => {
    if (coveredByParent(c._id)) return;
    if (selected.has(c._id)) onChange(value.filter((x) => x !== c._id));
    else { const drop = new Set(descendants(c)); onChange([...value.filter((x) => !drop.has(x)), c._id]); }
  };
  const setAll = (m) => { setMode(m); if (m === "all") onChange([]); };

  const query = q.trim().toLowerCase();
  const matches = (c) => !query || c.name.toLowerCase().includes(query) || (c.children || []).some(matches);
  const countIn = (c) => 1 + (c.children || []).reduce((a, x) => a + countIn(x), 0);

  const Row = ({ c, depth }) => {
    if (!matches(c)) return null;
    const kids = (c.children || []).filter(matches);
    const isOpen = query ? true : !!open[c._id];
    const on = selected.has(c._id);
    const inherited = !on && coveredByParent(c._id);
    return (
      <>
        <div className={`cpRow ${on ? "is-on" : ""} ${inherited ? "is-inherited" : ""}`} style={{ paddingLeft: 8 + depth * 22 }}>
          <button type="button" className={`cpRow__caret ${kids.length ? "" : "invisible"} ${isOpen ? "rotate-90" : ""}`} onClick={() => setOpen((o) => ({ ...o, [c._id]: !isOpen }))} aria-label="Expand">
            <FiChevronRight />
          </button>
          <button type="button" className="cpRow__main" onClick={() => toggle(c)} disabled={inherited}>
            <span className={`cpRow__check ${on || inherited ? "is-on" : ""}`}>{(on || inherited) && <FiCheck />}</span>
            <span className={`truncate ${depth === 0 ? "font-[600] text-gray-900" : "text-gray-700"}`}>{c.name}</span>
            {kids.length > 0 && <span className="text-[11px] text-gray-400 shrink-0">{countIn(c) - 1} inside</span>}
            {inherited && <span className="ml-auto text-[11px] text-gray-400 shrink-0">via parent</span>}
            {on && kids.length > 0 && <span className="ml-auto text-[11px] text-[#059669] font-[600] shrink-0">incl. all inside</span>}
          </button>
        </div>
        {isOpen && kids.map((k) => <Row key={k._id} c={k} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="cpBox">
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-md">
        <button type="button" onClick={() => setAll("all")} className={`cpMode ${mode === "all" ? "is-on" : ""}`}><FiGlobe /> All categories</button>
        <button type="button" onClick={() => setAll("some")} className={`cpMode ${mode === "some" ? "is-on" : ""}`}><FiFilter /> Only selected</button>
      </div>

      {mode === "all" ? (
        <div className="mt-3 text-[12px] text-gray-500 leading-[18px]">This option is offered in the product form for <b className="text-gray-800">every category</b>.</div>
      ) : (
        <>
          <div className="mt-3 min-h-[34px] flex flex-wrap gap-1.5">
            {value.length ? value.map((id) => (
              <span key={id} className="cpChip" title={byId[id]?.path.join(" › ")}>
                {byId[id]?.path.join(" › ") || "Deleted category"}
                <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} aria-label="Remove"><FiX /></button>
              </span>
            )) : <span className="text-[12px] text-[#b45309] self-center">Nothing selected yet — pick categories below.</span>}
          </div>
          <div className="pdSearch mt-2">
            <FiSearch className="text-gray-400 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search categories" />
            {q && <button onClick={() => setQ("")} className="text-gray-400" aria-label="Clear"><FiX /></button>}
          </div>
          <div className="cpTree">
            {tree.filter(matches).length ? tree.map((c) => <Row key={c._id} c={c} depth={0} />) : <div className="py-6 text-center text-[12px] text-gray-400">No categories match</div>}
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Tip: selecting a main category includes all of its sub-categories.</div>
        </>
      )}
    </div>
  );
};

export default CategoryPicker;
