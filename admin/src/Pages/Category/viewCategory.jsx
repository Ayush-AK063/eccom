import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSliders, FiChevronRight } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData } from "../../utils/api";
import { ProductImage } from "../Products/shared";
import { flattenTree, LEVELS } from "./catUtils";
import "../Products/style.css";
import "./style.css";

const ADD_MODEL = { 2: "Add New Sub Category", 3: "Add Third Level Category" };
const EDIT_MODEL = { 1: "Edit Category", 2: "Edit Sub Category", 3: "Edit Third Category" };

const ViewCategory = ({ data }) => {
  const context = useContext(MyContext);
  const [tree, setTree] = useState([]);

  useEffect(() => {
    getData("/api/category?admin=1").then((res) => res?.success && setTree(res.data || []));
  }, []);

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const c = flat.find((x) => x._id === data?._id) || data;
  const depth = c?.depth || 1;
  const open = (model, d) => context.setIsOpenFullScreenPanel({ open: true, model, data: d });
  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
  const groups = (c?.attributes || []).reduce((g, a) => ({ ...g, [a.group || "General"]: [...(g[a.group || "General"] || []), a] }), {});

  if (!c) return null;

  return (
    <div className="pdPanel">
      <div className="pdPanel__grid">
        <div className="flex flex-col gap-4">
          <div className="pdCard flex items-center gap-4">
            {depth === 1
              ? <ProductImage src={c.images?.[0]} className="w-[84px] h-[84px] rounded-md border border-gray-100 bg-gray-50 object-cover shrink-0" />
              : <span className={`catDot catDot--${depth} !w-[64px] !h-[64px] !text-[22px]`}>{c.name?.[0]?.toUpperCase()}</span>}
            <div className="min-w-0 flex-1">
              {c.path && <div className="catPath mb-2">{c.path.map((p, i) => <span key={i}>{p}</span>)}</div>}
              <h2 className="text-[20px] font-[700] text-gray-900 truncate">{c.name}</h2>
              <div className="text-[12px] text-gray-400">ID {c._id}</div>
            </div>
            <button className="pdBtn pdBtn--light" onClick={() => open(EDIT_MODEL[depth], c)}><FiEdit2 /> Edit</button>
          </div>

          {depth < 3 && (
            <div className="pdCard">
              <div className="pdCard__head flex items-center justify-between">
                <div>
                  <div className="pdCard__title">{depth === 1 ? "Sub-categories" : "Third level categories"} ({c.children?.length || 0})</div>
                  <div className="pdCard__sub">Click one to see its details.</div>
                </div>
                <button className="pdBtn pdBtn--dark !h-[34px]" onClick={() => open(ADD_MODEL[depth + 1], { parentId: c._id, rootId: c.ancestors?.[0] || c._id })}><FiPlus /> Add</button>
              </div>
              {c.children?.length ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {c.children.map((s) => (
                    <button key={s._id} onClick={() => open("View Category", s)} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:border-gray-900 text-left transition-colors">
                      <span className={`catDot catDot--${depth + 1}`}>{s.name?.[0]?.toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-[600] text-gray-900 truncate">{s.name}</span>
                        <span className="block text-[12px] text-gray-500">{s.productCount || 0} products{depth === 1 ? ` · ${s.children?.length || 0} inside` : ""}</span>
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : <div className="text-[13px] text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-md">Nothing here yet.</div>}
            </div>
          )}

          <div className="pdCard">
            <div className="pdCard__head flex items-center justify-between">
              <div>
                <div className="pdCard__title">Product details template</div>
                <div className="pdCard__sub">Fields sellers fill for products in this category{depth > 1 ? " (parent fields are inherited)" : ""}.</div>
              </div>
              <button className="pdBtn pdBtn--light !h-[34px]" onClick={() => open("Product Details Template", c)}><FiSliders /> {c.attributes?.length ? "Edit" : "Set up"}</button>
            </div>
            {c.attributes?.length ? (
              <div className="flex flex-col gap-3">
                {Object.entries(groups).map(([g, list]) => (
                  <div key={g}>
                    <div className="text-[11px] font-[600] uppercase tracking-wide text-gray-500 mb-1.5">{g}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((a) => <span key={a.key} className="pdBadge !normal-case">{a.label}{a.unit ? ` (${a.unit})` : ""}{a.required && <b className="text-[#ef4444]">*</b>}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-[13px] text-gray-500">No template fields yet.</div>}
          </div>
        </div>

        <aside className="pdPanel__aside">
          <div className="pdCard">
            <div className="pdCard__title mb-3">Overview</div>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Level</span><b className="text-gray-900">{LEVELS[depth]}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Products</span><b className="text-gray-900">{c.productCount || 0}</b></div>
              {depth < 3 && <div className="flex justify-between"><span className="text-gray-500">Categories inside</span><b className="text-gray-900">{c.descendants ?? c.children?.length ?? 0}</b></div>}
              <div className="flex justify-between"><span className="text-gray-500">Template fields</span><b className="text-gray-900">{c.attributes?.length || 0}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><b className="text-gray-900">{fmt(c.createdAt)}</b></div>
              <div className="flex justify-between"><span className="text-gray-500">Updated</span><b className="text-gray-900">{fmt(c.updatedAt)}</b></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ViewCategory;
