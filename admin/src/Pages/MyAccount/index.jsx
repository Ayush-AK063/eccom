import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { FiCamera, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiLogOut, FiSettings, FiExternalLink, FiCalendar, FiClock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";
import { putData, postData, putDataForImage, getData } from "../../utils/api";
import { ActivityRow } from "../Activity/describe";
import { STORE_URL } from "../Settings/ui";
import "../Products/style.css";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—");
const ago = (d) => {
  if (!d) return "—";
  const h = (Date.now() - new Date(d)) / 36e5;
  if (h < 1) return "Less than an hour ago";
  if (h < 24) return `${Math.round(h)} hours ago`;
  return fmt(d);
};
const strength = (p) => {
  let n = 0;
  if (p.length >= 8) n++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++;
  if (/\d/.test(p)) n++;
  if (/[^A-Za-z0-9]/.test(p)) n++;
  return [["Too short", "#dc2626"], ["Weak", "#f97316"], ["Okay", "#eab308"], ["Good", "#22c55e"], ["Strong", "#059669"]][p.length < 6 ? 0 : Math.max(1, n)];
};

const PwInput = ({ value, onChange, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} className="pdInput pr-10" value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
};

const MyAccount = () => {
  const context = useContext(MyContext);
  const user = context?.userData || {};
  const [form, setForm] = useState({ name: "", mobile: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [activity, setActivity] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (!user._id) return;
    setForm({ name: user.name || "", mobile: user.mobile || "", country: user.country || "" });
    getData(`/api/activity?userId=${user._id}&limit=8`).then((r) => setActivity(r?.data || []));
  }, [user._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = form.name !== (user.name || "") || form.mobile !== (user.mobile || "") || form.country !== (user.country || "");
  const hasPassword = !!user.hasPassword;
  const google = !!(user.loginWithGoogle || user.googleId);

  const pickAvatar = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(f.type)) return context.openAlertBox("error", "Please choose a JPG, PNG or WEBP image");
    if (f.size > 3 * 1024 * 1024) return context.openAlertBox("error", "Image must be under 3 MB");
    setUploading(true);
    const fd = new FormData();
    fd.append("avatar", f);
    const res = await putDataForImage("/api/user/user-avatar", fd);
    setUploading(false);
    if (res?.avatar) { context.setUserData({ ...user, avatar: res.avatar }); context.openAlertBox("success", "Profile photo updated"); }
    else context.openAlertBox("error", res?.message || "Upload failed");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return context.openAlertBox("error", "Please enter your name");
    if (form.mobile && !/^\+?[\d\s-]{7,15}$/.test(form.mobile.trim())) return context.openAlertBox("error", "Please enter a valid phone number");
    setSaving(true);
    const res = await putData(`/api/user/${user._id}`, { name: form.name.trim(), mobile: form.mobile.trim(), country: form.country.trim() });
    setSaving(false);
    if (res?.error !== true) { context.setUserData({ ...user, ...form }); context.openAlertBox("success", "Profile saved"); }
    else context.openAlertBox("error", res?.message || "Could not save profile");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (hasPassword && !pw.oldPassword) return context.openAlertBox("error", "Please enter your current password");
    if (pw.newPassword.length < 6) return context.openAlertBox("error", "New password must be at least 6 characters");
    if (pw.newPassword !== pw.confirmPassword) return context.openAlertBox("error", "The new passwords don't match");
    setPwSaving(true);
    const res = await postData("/api/user/change-password", pw);
    setPwSaving(false);
    if (res?.error !== true) {
      context.openAlertBox("success", res?.message || "Password updated");
      context.setUserData({ ...user, hasPassword: true });
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwOpen(false);
    } else context.openAlertBox("error", res?.message || "Could not change password");
  };

  const st = strength(pw.newPassword);

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-[1100px]">
      <div>
        <h1 className="text-[22px] font-[700] text-gray-900 tracking-tight">My profile</h1>
        <div className="text-[14px] text-gray-500">Your admin account, sign-in and security.</div>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="h-[88px] bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#374151]" />
        <div className="px-5 pb-5 flex flex-wrap items-end gap-4 -mt-10">
          <label className="relative w-[92px] h-[92px] rounded-full border-4 border-white bg-gray-100 overflow-hidden cursor-pointer group shrink-0 shadow-sm" title="Change photo">
            {user.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="w-full h-full flex items-center justify-center bg-[#111827] text-white text-[30px] font-[700]">{(user.name || "A")[0].toUpperCase()}</span>}
            <span className={`absolute inset-0 flex items-center justify-center bg-black/50 text-white transition-opacity ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {uploading ? <CircularProgress size={22} color="inherit" /> : <FiCamera className="text-[20px]" />}
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickAvatar} disabled={uploading} />
          </label>
          <div className="flex-1 min-w-[200px] pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-[700] text-gray-900">{user.name || "Admin"}</h2>
              <span className="pdBadge !bg-[#111827] !text-white"><FiShield /> Admin</span>
              {user.verify_email && <span className="pdBadge pdBadge--green"><FiCheck /> Verified</span>}
            </div>
            <div className="text-[13px] text-gray-500 flex items-center gap-1.5"><FiMail className="text-gray-400" /> {user.email}</div>
          </div>
          <div className="flex gap-2 pb-1">
            <a className="pdBtn pdBtn--light" href={STORE_URL} target="_blank" rel="noreferrer"><FiExternalLink /> View store</a>
            <button className="pdBtn pdBtn--light hover:!border-[#ef4444] hover:!text-[#dc2626]" onClick={() => context.logout()}><FiLogOut /> Log out</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-gray-100">
          {[
            [FiCalendar, "Member since", fmt(user.createdAt)],
            [FiClock, "Last sign-in", ago(user.last_login_date)],
            [FiLock, "Password", hasPassword ? "Set" : "Not set"],
            [FcGoogle, "Google sign-in", google ? "Connected" : "Not connected"],
          ].map(([Icon, l, v]) => (
            <div key={l} className="px-5 py-3 border-r border-gray-100 last:border-0 flex items-center gap-3">
              <Icon className="text-gray-400 shrink-0" />
              <div className="min-w-0"><div className="text-[11px] text-gray-500">{l}</div><div className="text-[13px] font-[600] text-gray-900 truncate">{v}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <form onSubmit={saveProfile} className="pdCard">
            <div className="pdCard__head"><div className="pdCard__title">Personal details</div><div className="pdCard__sub">Shown to other admins and in order emails you send.</div></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="pdLabel">Full name <em>*</em></label>
                <input className="pdInput" value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </div>
              <div>
                <label className="pdLabel">Email</label>
                <input className="pdInput" value={user.email || ""} disabled />
                <div className="pdHint">Your sign-in email can't be changed here.</div>
              </div>
              <div>
                <label className="pdLabel">Phone</label>
                <input className="pdInput" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
              <div>
                <label className="pdLabel">Country</label>
                <input className="pdInput" value={form.country} maxLength={60} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" autoComplete="country-name" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button className="pdBtn pdBtn--dark" disabled={!dirty || saving}>{saving ? <CircularProgress size={16} color="inherit" /> : "Save changes"}</button>
              {dirty && <button type="button" className="pdBtn pdBtn--light" onClick={() => setForm({ name: user.name || "", mobile: user.mobile || "", country: user.country || "" })}>Discard</button>}
            </div>
          </form>

          <div className="pdCard">
            <div className="pdCard__head flex items-start justify-between gap-3">
              <div><div className="pdCard__title">Password & security</div><div className="pdCard__sub">Use a strong password you don't use anywhere else.</div></div>
              {!pwOpen && <button className="pdBtn pdBtn--light !h-9" onClick={() => setPwOpen(true)}><FiLock /> {hasPassword ? "Change password" : "Set a password"}</button>}
            </div>
            {!pwOpen ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-md border border-gray-100">
                  <FiLock className="text-gray-400" />
                  <div className="flex-1"><div className="text-[13px] font-[600] text-gray-900">Email & password</div><div className="text-[12px] text-gray-500">{hasPassword ? "You can sign in with your email and password." : "No password yet — set one to sign in without Google."}</div></div>
                  <span className={`pdBadge ${hasPassword ? "pdBadge--green" : ""}`}>{hasPassword ? "On" : "Off"}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-md border border-gray-100">
                  <FcGoogle />
                  <div className="flex-1"><div className="text-[13px] font-[600] text-gray-900">Google</div><div className="text-[12px] text-gray-500">{google ? "Signed in with Google before — it stays connected." : "Sign in with Google on the login page to connect it."}</div></div>
                  <span className={`pdBadge ${google ? "pdBadge--green" : ""}`}>{google ? "On" : "Off"}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={savePassword} className="flex flex-col gap-4 max-w-[420px]">
                {hasPassword && (
                  <div><label className="pdLabel">Current password</label><PwInput value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} autoComplete="current-password" /></div>
                )}
                <div>
                  <label className="pdLabel">New password</label>
                  <PwInput value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
                  {pw.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= ["Too short", "Weak", "Okay", "Good", "Strong"].indexOf(st[0]) ? st[1] : "#e5e7eb" }} />)}</div>
                      <div className="text-[11px] mt-1" style={{ color: st[1] }}>{st[0]}{st[0] !== "Strong" && pw.newPassword.length >= 6 ? " — mix upper & lower case, numbers and symbols" : ""}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="pdLabel">Confirm new password</label>
                  <PwInput value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} autoComplete="new-password" />
                  {pw.confirmPassword && pw.confirmPassword !== pw.newPassword && <div className="text-[11px] text-[#dc2626] mt-1">Passwords don't match</div>}
                </div>
                <div className="flex gap-2">
                  <button className="pdBtn pdBtn--dark" disabled={pwSaving}>{pwSaving ? <CircularProgress size={16} color="inherit" /> : hasPassword ? "Update password" : "Set password"}</button>
                  <button type="button" className="pdBtn pdBtn--light" onClick={() => { setPwOpen(false); setPw({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}>Cancel</button>
                </div>
                {hasPassword && <div className="text-[12px] text-gray-500">Forgot it? Log out and use “Forgot password” on the login page.</div>}
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="pdCard !p-0">
            <div className="px-[18px] pt-[18px] pb-2 flex items-center justify-between">
              <div className="pdCard__title">Your recent activity</div>
              <Link to={`/activity`} className="text-[12px] font-[600] text-gray-500 hover:text-gray-900">All activity</Link>
            </div>
            {activity === null ? <div className="p-4"><div className="h-20 rounded bg-gray-100 animate-pulse" /></div>
              : activity.length ? <div className="divide-y divide-gray-100 pb-2">{activity.map((a) => <ActivityRow key={a._id} a={a} showUser={false} />)}</div>
                : <div className="px-[18px] pb-[18px] text-[12px] text-gray-400">Sign-ins and changes will show here.</div>}
          </div>

          <div className="pdCard">
            <div className="pdCard__title mb-3">Shortcuts</div>
            <div className="flex flex-col gap-1">
              {[["/settings", FiSettings, "Store settings"], ["/users", FiShield, "Admins & customers"], ["/activity", FiClock, "Live activity"]].map(([to, Icon, l]) => (
                <Link key={to} to={to} className="flex items-center gap-3 h-9 px-2 rounded-md text-[13px] font-[500] text-gray-700 hover:bg-gray-50 hover:text-gray-900"><Icon className="text-gray-400" /> {l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
