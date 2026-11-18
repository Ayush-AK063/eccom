import React, { useContext, useState } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { CircularProgress } from "@mui/material";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";

export const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5173";
// "/collections/x.webp" jaisi store ki apni files admin mein bhi dikhen
export const imgSrc = (v) => (v && v.startsWith("/") ? STORE_URL + v : v);

export const Field = ({ label, hint, children, req }) => (
  <div>
    <label className="pdLabel">{label}{req && <em> *</em>}</label>
    {children}
    {hint && <div className="pdHint">{hint}</div>}
  </div>
);
export const Card = ({ title, sub, children, right }) => (
  <div className="pdCard">
    <div className="pdCard__head flex items-start justify-between gap-3">
      <div><div className="pdCard__title">{title}</div>{sub && <div className="pdCard__sub">{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>
);
export const Toggle = ({ on, onChange, label, sub }) => (
  <button type="button" onClick={() => onChange(!on)} className="flex items-start gap-3 text-left w-full">
    <span className={`pdSwitch mt-0.5 ${on ? "is-on" : ""}`} />
    <span><span className="block text-[13px] font-[600] text-gray-900">{label}</span>{sub && <span className="block text-[12px] text-gray-500">{sub}</span>}</span>
  </button>
);
export const Money = ({ value, onChange, placeholder = "0" }) => (
  <div className="pdAffix"><span>₹</span><input type="number" min="0" className="pdInput pdNum" value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></div>
);
export const Num = ({ value, onChange, suffix }) => (
  <div className="flex items-center gap-2"><input type="number" min="0" className="pdInput pdNum" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />{suffix && <span className="text-[13px] text-gray-500 shrink-0">{suffix}</span>}</div>
);

export const ImagePick = ({ value, onChange, label, hint, square, wide }) => {
  const context = useContext(MyContext);
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return context.openAlertBox("error", "Image must be under 2 MB");
    setBusy(true);
    const fd = new FormData(); fd.append("images", f);
    const res = await postData("/api/settings/upload", fd);
    setBusy(false);
    if (res?.url) onChange(res.url); else context.openAlertBox("error", res?.message || "Upload failed");
  };
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className={`${square ? "w-[64px] h-[64px]" : wide ? "w-[160px] h-[100px]" : "w-[160px] h-[64px]"} rounded-md border border-gray-200 bg-[#f9fafb] flex items-center justify-center overflow-hidden shrink-0`}>
          {value ? <img src={imgSrc(value)} alt="" className={`max-w-full max-h-full ${wide ? "object-cover w-full h-full" : "object-contain"}`} /> : <span className="text-[11px] text-gray-400">None</span>}
        </div>
        <label className="pdBtn pdBtn--light cursor-pointer">
          {busy ? <CircularProgress size={16} color="inherit" /> : <><FiUploadCloud /> {value ? "Replace" : "Upload"}</>}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" className="hidden" onChange={pick} />
        </label>
        {value && <button type="button" className="pdIconBtn pdIconBtn--danger" onClick={() => onChange("")} aria-label="Remove"><FiTrash2 /></button>}
      </div>
    </Field>
  );
};

