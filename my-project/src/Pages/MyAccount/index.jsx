import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FiChevronRight, FiEye, FiEyeOff, FiHeart, FiLock, FiMapPin, FiPackage, FiShoppingCart } from "react-icons/fi";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { getData, postData, putData } from "../../utils/api";
import "./style.css";

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="accLabel">{label}</span>
    {children}
    {hint && <span className="block mt-1 text-[11px] text-gray-400">{hint}</span>}
  </label>
);

const PasswordInput = ({ name, value, onChange, placeholder, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} name={name} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled} autoComplete="new-password" className="accInput pr-10" />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700">
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
};

const emptyPw = { oldPassword: "", newPassword: "", confirmPassword: "" };

const MyAccount = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const user = context?.userData;

  const initialProfile = useMemo(() => ({
    name: user?.name || "", email: user?.email || "", mobile: user?.mobile || "", country: user?.country || "",
  }), [user?.name, user?.email, user?.mobile, user?.country]);

  const [profile, setProfile] = useState(initialProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState(emptyPw);
  const [showPwForm, setShowPwForm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [orderCount, setOrderCount] = useState(null);

  const hasPassword = !!user?.hasPassword;
  const dirty = JSON.stringify(profile) !== JSON.stringify(initialProfile);
  const missing = [!user?.mobile && "phone number", !user?.country && "country"].filter(Boolean);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("accesstoken")) history("/login");
  }, [context?.isLogin, history]);

  useEffect(() => { setProfile(initialProfile); }, [initialProfile]);

  useEffect(() => {
    if (!context?.isLogin) return;
    getData("/api/order/my-orders").then((res) => {
      if (res?.error === false) setOrderCount((res.data || []).length);
    });
  }, [context?.isLogin]);

  const onProfileChange = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onPwChange = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return context.openAlertBox("error", "Please enter your full name");
    if (!profile.mobile.trim()) return context.openAlertBox("error", "Please enter your phone number");
    if (!/^[0-9+\-\s]{7,15}$/.test(profile.mobile.trim())) return context.openAlertBox("error", "Please enter a valid phone number");

    setSavingProfile(true);
    const res = await putData(`/api/user/${user?._id}`, profile);
    setSavingProfile(false);
    if (res?.error !== true) {
      context.openAlertBox("success", res?.message || "Profile updated");
      // Header / sidebar mein turant naya naam dikhe
      context.setUserData((prev) => (prev ? { ...prev, ...(res?.user || {}), name: profile.name, mobile: profile.mobile, country: profile.country } : prev));
    } else {
      context.openAlertBox("error", res?.message || "Could not update profile");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (hasPassword && !pw.oldPassword) return context.openAlertBox("error", "Please enter your current password");
    if (pw.newPassword.length < 6) return context.openAlertBox("error", "New password must be at least 6 characters");
    if (pw.newPassword !== pw.confirmPassword) return context.openAlertBox("error", "New password and confirm password do not match");

    setSavingPw(true);
    const res = await postData("/api/user/reset-password", { email: user?.email, ...pw, isGoogleUser: !hasPassword });
    setSavingPw(false);
    if (res?.error !== true) {
      context.openAlertBox("success", res?.message || "Password updated");
      setPw(emptyPw);
      setShowPwForm(false);
      if (!hasPassword) context.setUserData((prev) => (prev ? { ...prev, hasPassword: true } : prev));
    } else {
      context.openAlertBox("error", res?.message || "Could not update password");
    }
  };

  const stats = [
    { to: "/my-orders", label: "Orders", value: orderCount ?? "—", icon: <FiPackage /> },
    { to: "/my-list", label: "Wishlist", value: context?.myListData?.length || 0, icon: <FiHeart /> },
    { to: "/cart", label: "In cart", value: context?.cartData?.length || 0, icon: <FiShoppingCart /> },
    { to: "/my-address", label: "Addresses", value: context?.addressList?.length || 0, icon: <FiMapPin /> },
  ];

  return (
    <section className="bg-[#fafafa] py-6 pb-14">
      <div className="container">
        <nav className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-4" aria-label="breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <FiChevronRight className="text-gray-300" />
          <span className="text-gray-900">My Account</span>
        </nav>

        <div className="accGrid">
          <AccountSidebar />

          <div className="flex flex-col gap-5 min-w-0">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map(({ to, label, value, icon }) => (
                <Link key={label} to={to} className="accStat group">
                  <span className="accStat__icon">{icon}</span>
                  <div>
                    <div className="text-[20px] font-[800] text-gray-900 leading-none">{value}</div>
                    <div className="mt-1 text-[12px] text-gray-500">{label}</div>
                  </div>
                  <FiChevronRight className="ml-auto text-gray-300 group-hover:text-gray-600 transition-colors" />
                </Link>
              ))}
            </div>

            {missing.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-md border border-[#fde68a] bg-[#fffbeb]">
                <span className="text-[18px] leading-none mt-0.5">👋</span>
                <div className="text-[13px] text-gray-700 leading-[20px]">
                  <b className="text-gray-900">Complete your profile.</b> Add your {missing.join(" and ")} below so we can reach you about your orders.
                </div>
              </div>
            )}

            {/* Personal info */}
            <div className="accCard">
              <div className="accCard__head">
                <div>
                  <h2>Personal Information</h2>
                  <div className="text-[13px] text-gray-500 mt-0.5">Update your name and contact details.</div>
                </div>
              </div>
              <form onSubmit={saveProfile} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full name">
                    <input name="name" value={profile.name} onChange={onProfileChange} disabled={savingProfile} className="accInput" placeholder="Your full name" />
                  </Field>
                  <Field label="Email address" hint="Email can't be changed.">
                    <input name="email" value={profile.email} disabled className="accInput is-readonly" />
                  </Field>
                  <Field label="Phone number">
                    <input name="mobile" value={profile.mobile} onChange={onProfileChange} disabled={savingProfile} className="accInput" placeholder="e.g. 98765 43210" inputMode="tel" />
                  </Field>
                  <Field label="Country">
                    <input name="country" value={profile.country} onChange={onProfileChange} disabled={savingProfile} className="accInput" placeholder="e.g. India" />
                  </Field>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <button type="submit" disabled={!dirty || savingProfile} className="accBtn accBtn--dark">
                    {savingProfile ? <CircularProgress size={16} color="inherit" /> : "Save changes"}
                  </button>
                  <button type="button" disabled={!dirty || savingProfile} onClick={() => setProfile(initialProfile)} className="accBtn accBtn--light">
                    Discard
                  </button>
                </div>
              </form>
            </div>

            {/* Security */}
            <div className="accCard">
              <div className="accCard__head">
                <div>
                  <h2>Login & Security</h2>
                  <div className="text-[13px] text-gray-500 mt-0.5">Manage how you sign in to your account.</div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="accStat__icon"><FiLock /></span>
                    <div>
                      <div className="text-[14px] font-[600] text-gray-900">Password</div>
                      <div className="text-[12px] text-gray-500">
                        {hasPassword ? "••••••••  ·  Use a strong password you don't use elsewhere." : "You sign in with Google. Set a password to also log in with email."}
                      </div>
                    </div>
                  </div>
                  {!showPwForm && (
                    <button type="button" onClick={() => setShowPwForm(true)} className="accBtn accBtn--light">
                      {hasPassword ? "Change password" : "Set password"}
                    </button>
                  )}
                </div>

                {showPwForm && (
                  <form onSubmit={savePassword} className="mt-5 pt-5 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hasPassword && (
                        <div className="md:col-span-2 md:max-w-[calc(50%-8px)]">
                          <Field label="Current password">
                            <PasswordInput name="oldPassword" value={pw.oldPassword} onChange={onPwChange} disabled={savingPw} placeholder="Enter current password" />
                          </Field>
                        </div>
                      )}
                      <Field label="New password" hint="At least 6 characters.">
                        <PasswordInput name="newPassword" value={pw.newPassword} onChange={onPwChange} disabled={savingPw} placeholder="New password" />
                      </Field>
                      <Field label="Confirm new password">
                        <PasswordInput name="confirmPassword" value={pw.confirmPassword} onChange={onPwChange} disabled={savingPw} placeholder="Re-enter new password" />
                      </Field>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <button type="submit" disabled={savingPw} className="accBtn accBtn--dark">
                        {savingPw ? <CircularProgress size={16} color="inherit" /> : hasPassword ? "Update password" : "Set password"}
                      </button>
                      <button type="button" disabled={savingPw} onClick={() => { setShowPwForm(false); setPw(emptyPw); }} className="accBtn accBtn--light">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
