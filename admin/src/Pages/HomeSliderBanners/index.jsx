import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiEye, FiTrash2, FiCheck, FiImage, FiLink, FiX } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData, deleteData, postData } from "../../utils/api";
import { SLIDE_TYPES, typeInfo } from "./slideTypes";
import { PlacementMap } from "./SlideForm";
import "./style.css";

const GRID = { "4 / 1": "grid-cols-1 lg:grid-cols-2", "16 / 9": "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" };

const HomeSliderBanner = () => {
  const Context = useContext(MyContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState([]);

  const fetchSlides = async () => {
    const res = await getData("/api/homeSlide?admin=1");
    if (res?.success) setSlides(res?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, [Context.refetchHomeSlides]);

  const counts = useMemo(() => Object.fromEntries(SLIDE_TYPES.map((t) => [t.value, slides.filter((s) => s.type === t.value).length])), [slides]);
  const groups = SLIDE_TYPES.filter((t) => tab === "all" || t.value === tab);
  const open = (model, data) => Context.setIsOpenFullScreenPanel({ open: true, model, data });
  const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const deleteOne = async (id) => {
    if (!window.confirm("Delete this banner? This cannot be undone.")) return;
    const res = await deleteData(`/api/homeSlide/${id}`);
    if (res?.success) {
      Context.openAlertBox("success", "Banner deleted");
      setSelected((p) => p.filter((x) => x !== id));
      fetchSlides();
    } else Context.openAlertBox("error", res?.message || "Failed to delete banner");
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.length} banner(s)? This cannot be undone.`)) return;
    const res = await postData("/api/homeSlide/delete-multiple", { ids: selected });
    if (res?.success) {
      Context.openAlertBox("success", `${selected.length} banner(s) deleted`);
      setSelected([]);
      fetchSlides();
    } else Context.openAlertBox("error", res?.message || "Failed to delete banners");
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">Home banners</h1>
          <div className="text-[14px] text-gray-500">Images shown on the storefront home page · {slides.length} total</div>
        </div>
        <button onClick={() => open("Add Home Slide")}
          className="h-10 px-4 rounded-md bg-[#111827] text-white text-[13px] font-[600] flex items-center gap-2 hover:bg-[#ff5252] transition">
          <FiPlus /> Add banner
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto bg-white border border-gray-200 rounded-md p-1.5">
        <button className={`hsTab ${tab === "all" ? "is-active" : ""}`} onClick={() => setTab("all")}>All <b>{slides.length}</b></button>
        {SLIDE_TYPES.map((t) => (
          <button key={t.value} className={`hsTab ${tab === t.value ? "is-active" : ""}`} onClick={() => setTab(t.value)}>
            {t.value} <b>{counts[t.value]}</b>
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="sticky top-2 z-20 flex items-center gap-3 bg-[#111827] text-white rounded-md px-4 py-2.5 shadow-lg">
          <span className="text-[13px] font-[600]">{selected.length} selected</span>
          <button onClick={() => setSelected([])} className="text-[12px] text-gray-300 hover:text-white flex items-center gap-1"><FiX /> Clear</button>
          <button onClick={deleteSelected} className="ml-auto h-8 px-3 rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-[12px] font-[600] flex items-center gap-1.5">
            <FiTrash2 /> Delete selected
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="aspect-video rounded-md bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        groups.map((t) => {
          const list = slides.filter((s) => s.type === t.value);
          if (tab === "all" && !list.length) return null;
          return (
            <section key={t.value} className={`bg-white border border-gray-200 rounded-md ${selected.length ? "hsSelecting" : ""}`}>
              <div className="flex flex-wrap items-start gap-4 px-5 py-4 border-b border-gray-100">
                <div className="w-[120px] shrink-0 hidden sm:block"><PlacementMap type={t.value} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[15px] font-[700] text-gray-900">{t.value}</h2>
                    <span className="text-[11px] font-[600] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{list.length}</span>
                    {t.live
                      ? <span className="text-[11px] font-[600] text-[#059669] bg-[#ecfdf5] px-1.5 py-0.5 rounded">Live on home</span>
                      : <span className="text-[11px] font-[600] text-[#b45309] bg-[#fffbeb] px-1.5 py-0.5 rounded">Not shown</span>}
                  </div>
                  <div className="mt-1 text-[12px] text-gray-500">{t.where} · {t.size}</div>
                  {t.single && list.length > 1 && <div className="mt-1 text-[12px] text-[#b45309]">Only the first banner is shown — {list.length - 1} extra.</div>}
                </div>
                <button onClick={() => open("Add Home Slide")} className="h-8 px-3 rounded-md border border-gray-200 text-[12px] font-[600] text-gray-700 flex items-center gap-1.5 hover:border-gray-900">
                  <FiPlus /> Add
                </button>
              </div>

              <div className="p-5">
                {list.length ? (
                  <div className={`grid gap-4 ${GRID[t.ratio]}`}>
                    {list.map((s, i) => (
                      <SlideCard key={s._id} s={s} index={i} selected={selected.includes(s._id)} hidden={t.single && i > 0}
                        onToggle={() => toggle(s._id)} onEdit={() => open("Edit Home Slide", s)} onView={() => open("View Home Slide", s)} onDelete={() => deleteOne(s._id)} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <FiImage className="text-[26px] text-gray-300" />
                    <div className="text-[13px] text-gray-500">No {t.value.toLowerCase()} yet</div>
                    <button onClick={() => open("Add Home Slide")} className="text-[13px] font-[600] text-[#ff5252] hover:underline">Add one</button>
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}

      {!loading && !slides.length && tab === "all" && (
        <div className="bg-white border border-gray-200 rounded-md flex flex-col items-center gap-2 py-16 text-center">
          <FiImage className="text-[30px] text-gray-300" />
          <div className="text-[15px] font-[600] text-gray-800">No banners yet</div>
          <div className="text-[13px] text-gray-500">Add a hero banner to start decorating your home page.</div>
          <button onClick={() => open("Add Home Slide")} className="mt-2 h-9 px-4 rounded-md bg-[#111827] text-white text-[13px] font-[600] flex items-center gap-2"><FiPlus /> Add banner</button>
        </div>
      )}
    </div>
  );
};

// Schedule ke hisaab se abhi live hai ya nahi
const liveState = (s) => {
  const now = Date.now();
  if (s.isActive === false) return "Paused";
  if (s.startAt && new Date(s.startAt) > now) return `Starts ${new Date(s.startAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  if (s.endAt && new Date(s.endAt) <= now) return "Ended";
  return null;
};

const SlideCard = ({ s, index, selected, hidden: notFirst, onToggle, onEdit, onView, onDelete }) => {
  const off = liveState(s);
  const hidden = notFirst || !!off;
  const info = typeInfo(s.type);
  const text = s.title || s.bannerHeading;
  return (
    <div className={`hsCard ${selected ? "is-selected" : ""}`}>
      <div className="hsCard__media" style={{ aspectRatio: info.ratio }} onClick={onView}>
        <img src={s.images?.[0]} alt="" className={`absolute inset-0 w-full h-full object-cover ${hidden ? "opacity-50" : ""}`} />
        <button type="button" aria-label="Select banner" className="hsCard__check" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
          {selected && <FiCheck />}
        </button>
        {s.images?.length > 1 && <span className="hsCard__count"><FiImage /> {s.images.length}</span>}
        {hidden && <span className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-[#fffbeb] text-[#b45309] text-[11px] font-[600]">{off || "Not shown"}</span>}
        {!off && s.endAt && <span className="absolute right-2 bottom-2 px-1.5 py-0.5 rounded bg-white/90 text-gray-700 text-[11px] font-[600]">Until {new Date(s.endAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-[600] text-gray-900 truncate">{text || <span className="text-gray-400 font-[500]">Banner {index + 1} · image only</span>}</div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
            {s.startAtOnlyPrice && <span className="text-gray-600 font-[600] mr-1">From ₹{s.startAtOnlyPrice}</span>}
            <FiLink className="shrink-0" /> <span className="truncate">{s.redirectUrl || "/"}</span>
          </div>
        </div>
        <button className="hsIconBtn" title="Edit" onClick={onEdit}><FiEdit2 /></button>
        <button className="hsIconBtn" title="View" onClick={onView}><FiEye /></button>
        <button className="hsIconBtn hsIconBtn--danger" title="Delete" onClick={onDelete}><FiTrash2 /></button>
      </div>
    </div>
  );
};

export default HomeSliderBanner;
