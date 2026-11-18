import jwt from "jsonwebtoken";
import { Activity } from "../models/Activity.js";

// "Chrome · macOS" jaisa chhota naam (user-agent se)
const deviceOf = (req) => {
  const ua = String(req?.headers?.["user-agent"] || "");
  if (!ua) return "";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  const mobile = /Mobile|iPhone|Android/.test(ua) ? " (mobile)" : "";
  return [br, os].filter(Boolean).join(" · ") + mobile;
};

// Fire-and-forget: kabhi request fail na kare
export const logActivity = (userId, type, meta = {}, req) => {
  if (!userId) return;
  Activity.create({ userId, type, meta, device: deviceOf(req) }).catch(() => {});
};

// Bina auth wale routes (search) pe token ho to user nikaal lo
export const optionalUserId = (req) => {
  try {
    const token = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];
    if (!token || token === "null" || token === "undefined") return null;
    return jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN)?.id || null;
  } catch { return null; }
};
