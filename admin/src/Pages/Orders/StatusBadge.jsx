import React from "react";
import { STATUS_META } from "./orderUtils";

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status, tone: "" };
  return <span className={`pdBadge ${m.tone ? `pdBadge--${m.tone}` : ""}`}><i />{m.label}</span>;
};

export default StatusBadge;
