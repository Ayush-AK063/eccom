import React from "react";
import { FiCheck } from "react-icons/fi";

import { LOW_STOCK } from "./utils";

export const StockBadge = ({ n, low = LOW_STOCK }) =>
  n <= 0 ? <span className="pdBadge pdBadge--red"><i />Out of stock</span>
    : n <= (low ?? LOW_STOCK) ? <span className="pdBadge pdBadge--amber"><i />Low · {n}</span>
      : <span className="pdBadge pdBadge--green"><i />In stock · {n}</span>;

export const Check = ({ checked, onChange, disabled, label = "Select" }) => (
  <button type="button" disabled={disabled} onClick={onChange} aria-pressed={checked} aria-label={label}
    className={`pdCheck ${checked ? "is-on" : ""}`}>{checked && <FiCheck />}</button>
);

export const ProductImage = ({ src, className = "pdThumb" }) =>
  src ? <img src={src} alt="" className={className} />
    : <span className={`${className} flex items-center justify-center text-[10px] text-gray-400`}>No image</span>;
