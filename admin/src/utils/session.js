import axios from "axios";

// Login session: tokens localStorage mein.
// "Remember me" OFF → browser band hote hi logout (session cookie `liveSession` se pata chalta hai).
// Access token expire → refresh token se chupchaap naya token, phir wahi request dobara.
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const LIVE = "liveSession=1";

export const saveSession = (accessToken, refreshToken, remember = true) => {
  localStorage.setItem("accesstoken", accessToken || "");
  localStorage.setItem("refreshtoken", refreshToken || "");
  if (remember) localStorage.removeItem("sessionOnly");
  else localStorage.setItem("sessionOnly", "1");
  document.cookie = `${LIVE}; path=/; SameSite=Lax`; // expiry nahi = browser band hone tak
};

export const clearSession = () => {
  ["accesstoken", "refreshtoken", "sessionOnly"].forEach((k) => localStorage.removeItem(k));
  document.cookie = "liveSession=; path=/; max-age=0";
};

// App start par: "remember" nahi tha aur browser naya khula → logout
export const checkBrowserSession = () => {
  if (localStorage.getItem("sessionOnly") === "1" && !document.cookie.split("; ").includes(LIVE)) clearSession();
};

let refreshing = null;
export const refreshAccessToken = () => {
  const rt = localStorage.getItem("refreshtoken");
  if (!rt) return Promise.resolve(null);
  if (!refreshing) {
    refreshing = fetch(`${apiUrl}/api/user/refresh-token`, { method: "POST", headers: { Authorization: `Bearer ${rt}` } })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.ok && d?.data?.accessToken) {
          localStorage.setItem("accesstoken", d.data.accessToken);
          return d.data.accessToken;
        }
        if (r.status === 401 || r.status === 403) clearSession(); // session sach mein khatam
        return null;
      })
      .catch(() => null) // network error → tokens mat hatao
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

const skip = (url = "") => /\/api\/user\/(login|refresh-token|google-login|register|reset-password|verify)/.test(url);
export const shouldRefresh = (status, url) => status === 401 && !!localStorage.getItem("refreshtoken") && !skip(url);

// axios (getData / putData / deleteData) — 401 pe ek baar refresh + retry
axios.interceptors.response.use((r) => r, async (err) => {
  const cfg = err?.config;
  if (cfg && !cfg._retried && shouldRefresh(err?.response?.status, cfg.url)) {
    cfg._retried = true;
    const token = await refreshAccessToken();
    if (token) {
      cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
      return axios(cfg);
    }
  }
  throw err;
});
