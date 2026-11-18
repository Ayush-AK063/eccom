import React, { useContext, useState } from "react";
import { FiEdit2, FiExternalLink } from "react-icons/fi";
import { MyContext } from "../../App";
import { typeInfo } from "./slideTypes";
import { BannerPreview, PlacementMap } from "./SlideForm";
import "./style.css";

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-t border-gray-100 first:border-0">
    <span className="text-[12px] font-[600] text-gray-500 shrink-0">{label}</span>
    <span className="text-[13px] text-gray-900 text-right break-all">{children || <span className="text-gray-400">—</span>}</span>
  </div>
);

const ViewHomeSlide = ({ data }) => {
  const context = useContext(MyContext);
  const [active, setActive] = useState(0);
  if (!data) return null;
  const info = typeInfo(data.type);
  const imgs = data.images || [];

  return (
    <div className="slideForm">
      <div className="slideForm__grid">
        <div className="flex flex-col gap-5">
          <section className="sfCard">
            <div className="sfCard__title">Preview</div>
            <BannerPreview type={data.type} image={imgs[active]} {...data} />
            {imgs.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {imgs.map((src, i) => (
                  <button key={src} onClick={() => setActive(i)} style={{ aspectRatio: info.ratio }}
                    className={`h-14 shrink-0 rounded overflow-hidden border-2 ${i === active ? "border-[#111827]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className="slideForm__aside">
          <section className="sfCard">
            <div className="sfCard__title">Details</div>
            <Row label="Type">{data.type}</Row>
            <Row label="Status">{info.live ? <span className="text-[#059669] font-[600]">Live on home</span> : <span className="text-[#b45309] font-[600]">Not shown</span>}</Row>
            {info.fields.includes("bannerHeading") && <Row label="Heading">{data.bannerHeading}</Row>}
            {info.fields.includes("title") && <Row label="Title">{data.title}</Row>}
            {info.fields.includes("startAtOnlyPrice") && <Row label="Starting price">{data.startAtOnlyPrice && `₹${data.startAtOnlyPrice}`}</Row>}
            <Row label="Link">{data.redirectUrl}</Row>
            <Row label="Images">{imgs.length}</Row>
            {data.updatedAt && <Row label="Updated">{new Date(data.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Row>}
            <div className="mt-4"><span className="sfLabel">Placement</span><PlacementMap type={data.type} /></div>
          </section>
          <button className="sfSubmit gap-2" onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Edit Home Slide", data })}>
            <FiEdit2 /> Edit banner
          </button>
          {imgs[active] && (
            <a href={imgs[active]} target="_blank" rel="noopener noreferrer" className="sfCancel flex items-center justify-center gap-2">
              <FiExternalLink /> Open image
            </a>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ViewHomeSlide;
