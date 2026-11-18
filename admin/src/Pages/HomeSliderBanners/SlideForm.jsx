import React, { useContext, useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { FiUploadCloud, FiX, FiInfo, FiCheck } from "react-icons/fi";
import { postData, putData } from "../../utils/api";
import { MyContext } from "../../App";
import { SLIDE_TYPES, FIELD_LABELS, typeInfo } from "./slideTypes";
import "./style.css";

// Add + Edit dono isi form se (data ho to edit)
const SlideForm = ({ data }) => {
  const context = useContext(MyContext);
  const isEdit = !!data?._id;
  const [type, setType] = useState(data?.type || "Left Big Banner");
  const [fields, setFields] = useState({
    bannerHeading: data?.bannerHeading || "",
    title: data?.title || "",
    startAtOnlyPrice: data?.startAtOnlyPrice || "",
    redirectUrl: data?.redirectUrl || "",
  });
  // Schedule
  const toLocal = (v) => { if (!v) return ""; const t = new Date(v); return new Date(t - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
  const [isActive, setIsActive] = useState(data?.isActive !== false);
  const [startAt, setStartAt] = useState(toLocal(data?.startAt));
  const [endAt, setEndAt] = useState(toLocal(data?.endAt));
  const [oldImages, setOldImages] = useState(data?.images || []);
  const [files, setFiles] = useState([]); // { file, url }
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const info = typeInfo(type);

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.url)), [files]);

  const addFiles = (list) => {
    const imgs = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setFiles((prev) => [...prev, ...imgs.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const allImages = [...oldImages.map((src) => ({ src, old: true })), ...files.map((f) => ({ src: f.url, old: false }))];
  const preview = allImages[0]?.src;
  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!allImages.length) return context.openAlertBox("error", "Please add an image");
    setIsLoading(true);
    try {
      let uploaded = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f.file));
        const up = await postData("/api/homeSlide/upload-images", fd, { withCredentials: true });
        if (up?.error || !up?.images) {
          context.openAlertBox("error", up?.message || "Image upload failed");
          return;
        }
        uploaded = up.images;
      }
      const payload = {
        images: [...oldImages, ...uploaded],
        type,
        bannerHeading: info.fields.includes("bannerHeading") ? fields.bannerHeading.trim() : "",
        title: info.fields.includes("title") ? fields.title.trim() : "",
        startAtOnlyPrice: info.fields.includes("startAtOnlyPrice") ? String(fields.startAtOnlyPrice).trim() : "",
        redirectUrl: fields.redirectUrl.trim(),
        isActive,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      };
      const res = isEdit
        ? await putData(`/api/homeSlide/${data._id}`, payload, { withCredentials: true })
        : await postData("/api/homeSlide/create", payload, { withCredentials: true });
      if (res?.success) {
        context.openAlertBox("success", isEdit ? "Banner updated" : "Banner added");
        context.setIsOpenFullScreenPanel({ open: false });
        context.setRefetchHomeSlides((p) => !p);
      } else {
        context.openAlertBox("error", res?.message || "Something went wrong");
      }
    } catch {
      context.openAlertBox("error", "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="slideForm">
      <div className="slideForm__grid">
        {/* Left: fields */}
        <div className="flex flex-col gap-5">
          <section className="sfCard">
            <div className="sfCard__title">Placement</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SLIDE_TYPES.map((t) => (
                <button type="button" key={t.value} onClick={() => setType(t.value)}
                  className={`sfType ${type === t.value ? "is-active" : ""}`}>
                  <PlacementMini type={t.value} />
                  <span className="min-w-0 text-left">
                    <span className="block text-[13px] font-[600] text-gray-900">{t.value}</span>
                    <span className="block text-[11px] text-gray-500 truncate">{t.short} · {t.ratio.replace(/ /g, "")}</span>
                  </span>
                  {type === t.value && <FiCheck className="ml-auto text-[#111827] shrink-0" />}
                </button>
              ))}
            </div>
            <div className={`mt-3 flex items-start gap-2 text-[12px] px-3 py-2 rounded-md ${info.live ? "bg-gray-50 text-gray-600" : "bg-[#fffbeb] text-[#92400e]"}`}>
              <FiInfo className="mt-[2px] shrink-0" />
              <span>{info.where}. Recommended size <b>{info.size}</b>.{info.single ? " If you add more than one, only the first is shown." : ""}</span>
            </div>
          </section>

          <section className="sfCard">
            <div className="sfCard__title">Content</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {info.fields.map((k) => (
                <label key={k} className={k === "bannerHeading" ? "sm:col-span-2" : ""}>
                  <span className="sfLabel">{FIELD_LABELS[k].label}</span>
                  <input className="sfInput" value={fields[k]} onChange={set(k)} placeholder={FIELD_LABELS[k].placeholder}
                    inputMode={k === "startAtOnlyPrice" ? "numeric" : undefined} />
                </label>
              ))}
              <label className="sm:col-span-2">
                <span className="sfLabel">Link (where the banner opens)</span>
                <input className="sfInput" value={fields.redirectUrl} onChange={set("redirectUrl")} placeholder="/productListing?category=…" />
              </label>
            </div>
            {!info.fields.length && <div className="mt-3 text-[12px] text-gray-400">This banner type shows the image only — put any text inside the image.</div>}
          </section>

          <section className="sfCard">
            <div className="text-[14px] font-[700] text-gray-900">Visibility & schedule</div>
            <div className="text-[12px] text-gray-500 mb-3">Run a banner only for a sale — it appears and disappears by itself.</div>
            <button type="button" onClick={() => setIsActive(!isActive)} className="flex items-center gap-3 mb-3">
              <span className={`relative w-9 h-5 rounded-full transition-colors ${isActive ? "bg-[#111827]" : "bg-gray-300"}`}><span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-4" : ""}`} /></span>
              <span className="text-[13px] font-[600]">{isActive ? "Active" : "Paused — not shown on the store"}</span>
            </button>
            <div className="grid sm:grid-cols-2 gap-3">
              <label><span className="sfLabel">Show from</span><input type="datetime-local" className="sfInput" value={startAt} onChange={(e) => setStartAt(e.target.value)} /></label>
              <label><span className="sfLabel">Show until</span><input type="datetime-local" className="sfInput" value={endAt} onChange={(e) => setEndAt(e.target.value)} /></label>
            </div>
            <div className="mt-2 text-[12px] text-gray-400">Leave empty to show right away / forever.</div>
            {startAt && endAt && new Date(endAt) <= new Date(startAt) && <div className="mt-1 text-[12px] text-[#dc2626]">“Show until” must be after “Show from”.</div>}
          </section>

          <section className="sfCard">
            <div className="sfCard__title">Image{type === "Left Big Banner" ? "s" : ""}</div>
            <div
              className={`sfDrop ${dragOver ? "is-over" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            >
              <FiUploadCloud className="text-[26px] text-gray-400" />
              <div className="text-[13px] font-[600] text-gray-800">Drop images here or <span className="text-[#ff5252]">browse</span></div>
              <div className="text-[11px] text-gray-400">JPG, PNG or WEBP · {info.size} recommended</div>
              <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>

            {allImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {allImages.map((img, i) => (
                  <div key={img.src} className="sfThumb" style={{ aspectRatio: info.ratio }}>
                    <img src={img.src} alt="" />
                    {i === 0 && <span className="sfThumb__tag">Cover</span>}
                    {!img.old && <span className="sfThumb__tag sfThumb__tag--new">New</span>}
                    <button type="button" aria-label="Remove image" className="sfThumb__x"
                      onClick={() => img.old ? setOldImages((p) => p.filter((s) => s !== img.src)) : setFiles((p) => p.filter((f) => f.url !== img.src))}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: live preview */}
        <aside className="slideForm__aside">
          <section className="sfCard">
            <div className="sfCard__title">Live preview</div>
            <BannerPreview type={type} image={preview} {...fields} />
            <div className="mt-4">
              <div className="sfLabel">Where it appears on the home page</div>
              <PlacementMap type={type} />
            </div>
          </section>
          <button type="submit" disabled={isLoading} className="sfSubmit">
            {isLoading ? <CircularProgress size={20} color="inherit" /> : isEdit ? "Save changes" : "Publish banner"}
          </button>
          <button type="button" onClick={() => context.setIsOpenFullScreenPanel({ open: false })} className="sfCancel">Cancel</button>
        </aside>
      </div>
    </form>
  );
};

// Storefront jaisa preview (gradient + text)
export const BannerPreview = ({ type, image, bannerHeading, title, startAtOnlyPrice }) => {
  const info = typeInfo(type);
  const hero = type === "Left Big Banner";
  const side = type === "Right Top Banner" || type === "Right Down Banner";
  return (
    <div className="sfPreview" style={{ aspectRatio: info.ratio }}>
      {image ? <img src={image} alt="" /> : <div className="sfPreview__empty">No image yet</div>}
      {image && (hero || side) && <div className="sfPreview__shade" />}
      {image && hero && (
        <div className="sfPreview__text sfPreview__text--hero">
          {bannerHeading && <div className="text-[11px] text-white/90">{bannerHeading}</div>}
          {title && <div className="text-[18px] font-[700] leading-tight">{title}</div>}
          {startAtOnlyPrice && <div className="text-[11px]">Starting at only <b className="text-[#ff5252] text-[16px]">₹{startAtOnlyPrice}</b></div>}
          <span className="sfPreview__btn">SHOP NOW</span>
        </div>
      )}
      {image && side && (
        <div className="sfPreview__text sfPreview__text--side">
          {bannerHeading && <div className="text-[13px] font-[600] leading-snug">{bannerHeading}</div>}
          {startAtOnlyPrice && <div className="text-[10px] text-white/80">From <b className="text-[#ff5252] text-[14px]">₹{startAtOnlyPrice}</b></div>}
          <span className="text-[10px] font-[600] underline underline-offset-2">SHOP NOW</span>
        </div>
      )}
    </div>
  );
};

// Home page ka chhota wireframe, chosen jagah red
export const PlacementMap = ({ type }) => {
  const on = (t) => (type === t ? "is-on" : "");
  return (
    <div className="sfMap">
      <div className="sfMap__bar" />
      <div className="sfMap__hero">
        <div className={`sfMap__box sfMap__big ${on("Left Big Banner")}`} />
        <div className="sfMap__col">
          <div className={`sfMap__box ${on("Right Top Banner")}`} />
          <div className={`sfMap__box ${on("Right Down Banner")}`} />
        </div>
      </div>
      <div className="sfMap__row"><i /><i /><i /><i /><i /><i /></div>
      <div className={`sfMap__box sfMap__wide ${on("v2 Banner")}`} />
      <div className="sfMap__row"><i /><i /><i /><i /><i /><i /></div>
    </div>
  );
};

const PlacementMini = ({ type }) => (
  <span className="sfMini">
    <span className={`sfMini__big ${type === "Left Big Banner" ? "is-on" : ""}`} />
    <span className="sfMini__col">
      <span className={type === "Right Top Banner" ? "is-on" : ""} />
      <span className={type === "Right Down Banner" ? "is-on" : ""} />
    </span>
    <span className={`sfMini__wide ${type === "v2 Banner" ? "is-on" : ""}`} />
  </span>
);

export default SlideForm;
