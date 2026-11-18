import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiPlus, FiX, FiUploadCloud, FiTrash2, FiFolder, FiLayers, FiGrid, FiAlertTriangle } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { MyContext } from "../../App";
import { getData, postData, putData, deleteData } from "../../utils/api";
import { flattenTree, LEVELS } from "./catUtils";
import "../Products/style.css";
import "./style.css";

const IMG_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
const LEVEL_CARDS = [
  [1, FiFolder, "Main category", "Top level, shown in the store menu"],
  [2, FiLayers, "Sub-category", "Inside a main category"],
  [3, FiGrid, "Third level", "Inside a sub-category"],
];

/**
 * Ek hi form teeno levels ke liye.
 * Add:  <CategoryForm level={1|2|3} preset={{ parentId, rootId }} />
 * Edit: <CategoryForm edit={category} />   (level tree se nikalta hai)
 */
const CategoryForm = ({ level: initialLevel = 1, preset, edit }) => {
  const context = useContext(MyContext);
  const isEdit = !!edit?._id;

  const [tree, setTree] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [level, setLevel] = useState(initialLevel);
  const [rootId, setRootId] = useState(preset?.rootId || "");
  const [subId, setSubId] = useState(preset?.rootId && preset?.parentId !== preset?.rootId ? preset.parentId : "");
  const [names, setNames] = useState([edit?.name || ""]);
  const [image, setImage] = useState(edit?.images?.[0] || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getData("/api/category?admin=1").then((res) => {
      if (res?.success) setTree(res.data || []);
      setLoadingTree(false);
    });
  }, []);

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const self = isEdit ? flat.find((c) => c._id === edit._id) : null;

  // Edit: level aur parent tree se bharo
  useEffect(() => {
    if (!self) return;
    setLevel(self.depth);
    if (self.depth === 2) setRootId(self.ancestors[0]);
    if (self.depth === 3) { setRootId(self.ancestors[0]); setSubId(self.ancestors[1]); }
  }, [self?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add with preset (from "+" in the list): preset.parentId = root (level 2) or sub (level 3)
  useEffect(() => {
    if (isEdit || !preset?.parentId) return;
    if (initialLevel === 2) setRootId(preset.parentId);
    if (initialLevel === 3) { setRootId(preset.rootId); setSubId(preset.parentId); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const roots = tree;
  const subs = roots.find((r) => r._id === rootId)?.children || [];
  const parentId = level === 1 ? null : level === 2 ? rootId : subId;
  const parent = flat.find((c) => c._id === parentId);
  const siblings = level === 1 ? roots : parent?.children || [];
  const cleanNames = names.map((n) => n.trim()).filter(Boolean);
  const dupes = cleanNames.filter((n, i) =>
    cleanNames.findIndex((x) => x.toLowerCase() === n.toLowerCase()) !== i ||
    siblings.some((s) => s._id !== edit?._id && s.name.trim().toLowerCase() === n.toLowerCase()));
  const multi = !isEdit && level > 1;
  const path = [...(parent?.path || []), cleanNames[0] || (isEdit ? edit.name : "New category")];

  const onFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!IMG_TYPES.includes(f.type)) return context.openAlertBox("error", "Please choose a JPG, PNG or WEBP image.");
    if (f.size > 5 * 1024 * 1024) return context.openAlertBox("error", "Image must be under 5 MB.");
    setFile(f);
    setImage(URL.createObjectURL(f));
  };

  const uploadImage = async () => {
    const fd = new FormData();
    fd.append("images", file);
    const res = await postData("/api/category/upload-images", fd);
    if (res?.error || !res?.images?.length) throw new Error(res?.message || "Image upload failed");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (level > 1 && !parentId) return context.openAlertBox("error", level === 2 ? "Choose a main category" : "Choose a sub-category");
    if (!cleanNames.length) return context.openAlertBox("error", "Category name is required");
    if (dupes.length) return context.openAlertBox("error", `"${dupes[0]}" already exists here`);
    if (isEdit && self && parentId && (parentId === self._id || flat.find((c) => c._id === parentId)?.ancestors.includes(self._id)))
      return context.openAlertBox("error", "A category can't be moved inside itself");

    setSaving(true);
    try {
      const parentFields = { parentCatId: parentId, parentCatName: parent?.name || null };
      if (isEdit) {
        if (level === 1 && file) {
          if (edit.images?.[0]) await deleteData(`/api/category/deleteimage?img=${edit.images[0]}`).catch(() => {});
          await uploadImage();
        }
        const payload = { name: cleanNames[0], ...parentFields };
        if (level === 1 && !file) payload.images = image ? edit.images || [] : [];
        if (level > 1) payload.images = edit.images || [];
        const res = await putData(`/api/category/${edit._id}`, payload);
        if (!res?.success) throw new Error(res?.message || "Could not update category");
        context.openAlertBox("success", "Category updated");
      } else {
        if (level === 1 && file) await uploadImage();
        const results = [];
        for (const name of cleanNames) results.push(await postData("/api/category/createcat", { name, ...parentFields }));
        const failed = results.filter((r) => !r?.success).length;
        if (failed === results.length) throw new Error(results[0]?.message || "Could not create category");
        context.openAlertBox(failed ? "error" : "success",
          failed ? `${results.length - failed} added, ${failed} failed` : `${results.length} categor${results.length === 1 ? "y" : "ies"} added`);
      }
      context.setIsOpenFullScreenPanel({ open: false });
    } catch (err) {
      context.openAlertBox("error", err.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const setName = (i, v) => setNames((list) => list.map((n, j) => (j === i ? v : n)));
  const onNameKey = (i, e) => {
    if (multi && e.key === "Enter") { e.preventDefault(); setNames((l) => [...l.slice(0, i + 1), "", ...l.slice(i + 1)]); }
  };
  const pasteMany = (i, e) => {
    if (!multi) return;
    const text = e.clipboardData.getData("text");
    if (!/[\n,]/.test(text)) return;
    e.preventDefault();
    const parts = text.split(/[\n,]/).map((t) => t.trim()).filter(Boolean);
    setNames((l) => [...l.slice(0, i), ...parts, ...l.slice(i + 1)].filter((n, j, arr) => n || j === arr.length - 1));
  };

  return (
    <form onSubmit={submit} className="pdPanel">
      <div className="pdPanel__grid">
        <div className="flex flex-col gap-4">
          {!isEdit && (
            <div className="pdCard">
              <div className="pdCard__head">
                <div className="pdCard__title">Category type</div>
                <div className="pdCard__sub">Where this category sits in your catalogue.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {LEVEL_CARDS.map(([n, Icon, title, sub]) => (
                  <button type="button" key={n} className={`catLevel ${level === n ? "is-on" : ""}`}
                    disabled={(n === 2 && !roots.length && !loadingTree) || (n === 3 && !flat.some((c) => c.depth === 2) && !loadingTree)}
                    onClick={() => { setLevel(n); if (n === 1) setNames((l) => [l[0] || ""]); }}>
                    <span className="flex items-center gap-2 text-[13px] font-[700] text-gray-900"><Icon /> {title}</span>
                    <span className="text-[12px] text-gray-500">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {level > 1 && (
            <div className="pdCard">
              <div className="pdCard__head">
                <div className="pdCard__title">{isEdit ? "Parent (move)" : "Parent"}</div>
                <div className="pdCard__sub">{isEdit ? "Change the parent to move this category with everything inside it." : "Choose where the new categories go."}</div>
              </div>
              <div className={`grid gap-3 ${level === 3 ? "sm:grid-cols-2" : ""}`}>
                <div>
                  <label className="pdLabel">Main category <em>*</em></label>
                  <select className="pdInput" value={rootId} disabled={loadingTree} onChange={(e) => { setRootId(e.target.value); setSubId(""); }}>
                    <option value="">{loadingTree ? "Loading…" : "Select main category"}</option>
                    {roots.filter((r) => !(isEdit && level === 2 && r._id === edit._id)).map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
                {level === 3 && (
                  <div>
                    <label className="pdLabel">Sub-category <em>*</em></label>
                    <select className="pdInput" value={subId} disabled={!subs.length} onChange={(e) => setSubId(e.target.value)}>
                      <option value="">{rootId && !subs.length ? "No sub-categories here" : "Select sub-category"}</option>
                      {subs.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {isEdit && self?.descendants > 0 && (
                <div className="pdHint">{self.descendants} categor{self.descendants === 1 ? "y" : "ies"} inside will move too.</div>
              )}
            </div>
          )}

          <div className="pdCard">
            <div className="pdCard__head flex items-start justify-between gap-3">
              <div>
                <div className="pdCard__title">{multi ? "Names" : "Name"}</div>
                <div className="pdCard__sub">{multi ? "Add several at once — press Enter for a new row or paste a comma / line separated list." : "Shown to shoppers in menus, filters and breadcrumbs."}</div>
              </div>
              {multi && <span className="pdBadge">{cleanNames.length} to add</span>}
            </div>
            <div className="flex flex-col gap-2">
              {names.map((n, i) => {
                const isDupe = n.trim() && dupes.some((d) => d.toLowerCase() === n.trim().toLowerCase());
                return (
                  <div key={i} className="flex items-center gap-2">
                    <input className="pdInput" style={isDupe ? { borderColor: "#ef4444" } : undefined} value={n} maxLength={60}
                      autoFocus={i === names.length - 1 && i > 0}
                      placeholder={level === 1 ? "e.g. Fashion" : level === 2 ? "e.g. Men" : "e.g. T-shirts"}
                      onChange={(e) => setName(i, e.target.value)} onKeyDown={(e) => onNameKey(i, e)} onPaste={(e) => pasteMany(i, e)} />
                    {multi && names.length > 1 && (
                      <button type="button" className="pdIconBtn pdIconBtn--danger shrink-0" onClick={() => setNames((l) => l.filter((_, j) => j !== i))} aria-label="Remove"><FiX /></button>
                    )}
                  </div>
                );
              })}
            </div>
            {dupes.length > 0 && <div className="mt-2 text-[12px] text-[#dc2626] flex items-center gap-1.5"><FiAlertTriangle /> "{dupes[0]}" already exists at this level.</div>}
            {multi && (
              <button type="button" className="mt-3 text-[13px] font-[600] text-gray-700 hover:text-[#ff5252] flex items-center gap-1" onClick={() => setNames((l) => [...l, ""])}>
                <FiPlus /> Add another
              </button>
            )}
          </div>

          {level === 1 && (
            <div className="pdCard">
              <div className="pdCard__head">
                <div className="pdCard__title">Image</div>
                <div className="pdCard__sub">Used on the home page "Shop by Category" cards. Square, at least 400×400 px, JPG / PNG / WEBP under 5 MB.</div>
              </div>
              <div className="flex items-start gap-4">
                {image ? (
                  <div className="pdImg w-[140px] shrink-0">
                    <img src={image} alt="" className="!object-cover" />
                    <div className="pdImg__actions" style={{ opacity: 1 }}>
                      <button type="button" className="is-danger" onClick={() => { setImage(""); setFile(null); }} aria-label="Remove image"><FiTrash2 /></button>
                    </div>
                  </div>
                ) : null}
                <label className="pdDrop flex-1 min-h-[140px]">
                  <FiUploadCloud className="text-[22px] text-gray-400" />
                  <span className="text-[13px] font-[600] text-gray-800">{image ? "Replace image" : "Click to upload"}</span>
                  <span className="text-[11px] text-gray-400">JPG, PNG or WEBP</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFile} />
                </label>
              </div>
            </div>
          )}
        </div>

        <aside className="pdPanel__aside">
          <div className="pdCard">
            <div className="pdCard__title mb-3">Summary</div>
            <div className="text-[12px] text-gray-500 mb-1.5">Path</div>
            <div className="catPath mb-4">{path.map((p, i) => <span key={i}>{p}</span>)}</div>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Level</span><b className="text-gray-900">{LEVELS[level]}</b></div>
              {multi && <div className="flex justify-between"><span className="text-gray-500">Adding</span><b className="text-gray-900">{cleanNames.length}</b></div>}
              {isEdit && self && <>
                <div className="flex justify-between"><span className="text-gray-500">Products</span><b className="text-gray-900">{self.productCount || 0}</b></div>
                {level < 3 && <div className="flex justify-between"><span className="text-gray-500">Inside</span><b className="text-gray-900">{self.descendants}</b></div>}
              </>}
            </div>
            <button type="submit" className="pdBtn pdBtn--dark w-full mt-5 !h-[42px]" disabled={saving || loadingTree}>
              {saving ? <CircularProgress size={18} color="inherit" /> : isEdit ? "Save changes" : multi && cleanNames.length > 1 ? `Add ${cleanNames.length} categories` : "Add category"}
            </button>
            <button type="button" className="pdBtn pdBtn--light w-full mt-2" onClick={() => context.setIsOpenFullScreenPanel({ open: false })}>Cancel</button>
          </div>
          {isEdit && self?.productCount > 0 && (parentId !== (self.ancestors[self.ancestors.length - 1] || null)) && (
            <div className="pdCard !bg-[#fffbeb] !border-[#fde68a] text-[12px] text-[#92400e] flex gap-2">
              <FiAlertTriangle className="shrink-0 mt-0.5" />
              <span>{self.productCount} product(s) still point to the old parent path. Re-save them from Products if their main / sub category should change.</span>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
};

export default CategoryForm;
