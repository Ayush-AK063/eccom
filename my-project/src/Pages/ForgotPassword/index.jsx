import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { FiArrowLeft, FiCheck, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import AuthLayout, { AuthField } from "../../components/AuthLayout";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";

// Step 1: email -> OTP bhejo -> /verify
// Step 2 (OTP verify ke baad, otpVerified flag): naya password set karo
const ForgotPassword = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const verified = localStorage.getItem("actionType") === "forgot-password" && localStorage.getItem("otpVerified") === "1";

  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [pw, setPw] = useState({ newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ a: false, b: false });
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return context.openAlertBox("error", "Please enter a valid email address");
    setLoading(true);
    const res = await postData("/api/user/forgot-password", { email: email.trim() });
    setLoading(false);
    if (res?.error === false) {
      localStorage.setItem("userEmail", email.trim());
      localStorage.setItem("actionType", "forgot-password");
      localStorage.removeItem("otpVerified");
      context.openAlertBox("success", res?.message || "We sent a code to your email");
      history("/verify");
    } else {
      context.openAlertBox("error", res?.message || "Could not send the code");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) return context.openAlertBox("error", "Password must be at least 6 characters");
    if (pw.newPassword !== pw.confirmPassword) return context.openAlertBox("error", "Passwords do not match");
    setLoading(true);
    const res = await postData("/api/user/reset-password", { email: localStorage.getItem("userEmail"), ...pw });
    setLoading(false);
    if (!res?.error) {
      context.openAlertBox("success", res?.message || "Password updated. Please log in.");
      ["userEmail", "actionType", "otpVerified"].forEach((k) => localStorage.removeItem(k));
      history("/login");
    } else {
      context.openAlertBox("error", res?.message || "Could not reset password");
    }
  };

  const strength = pw.newPassword.length === 0 ? 0 : pw.newPassword.length < 6 ? 1 : /[A-Z]/.test(pw.newPassword) && /\d/.test(pw.newPassword) && pw.newPassword.length >= 8 ? 3 : 2;
  const match = pw.confirmPassword && pw.newPassword === pw.confirmPassword;

  if (verified) {
    return (
      <AuthLayout
        title="Set a new password"
        subtitle={<>For <b className="text-gray-900">{localStorage.getItem("userEmail")}</b></>}
        panelTitle="Almost there."
        panelText="Choose a strong password you haven't used before. You'll use it to log in from now on."
      >
        <form className="flex flex-col gap-4" onSubmit={resetPassword} noValidate>
          <AuthField label="New password">
            <div className="relative">
              <input type={show.a ? "text" : "password"} value={pw.newPassword} disabled={loading} autoComplete="new-password"
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} placeholder="At least 6 characters" className="authInput pr-11" />
              <button type="button" className="authEye" aria-label="Toggle password" onClick={() => setShow((s) => ({ ...s, a: !s.a }))}>
                {show.a ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
            <span className="authStrength" data-level={strength}><i /><i /><i /></span>
            <span className="block mt-1 text-[11px] text-gray-400">
              {["Use at least 6 characters.", "Too short — use at least 6 characters.", "Good — add a capital letter and a number to make it stronger.", "Strong password."][strength]}
            </span>
          </AuthField>

          <AuthField label="Confirm new password">
            <div className="relative">
              <input type={show.b ? "text" : "password"} value={pw.confirmPassword} disabled={loading} autoComplete="new-password"
                onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter new password" className="authInput pr-11" />
              <button type="button" className="authEye" aria-label="Toggle password" onClick={() => setShow((s) => ({ ...s, b: !s.b }))}>
                {show.b ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
            {pw.confirmPassword && (
              <span className={`flex items-center gap-1 mt-1.5 text-[11px] font-[600] ${match ? "text-[#15803d]" : "text-red-500"}`}>
                {match ? <><FiCheck /> Passwords match</> : "Passwords don't match"}
              </span>
            )}
          </AuthField>

          <button type="submit" disabled={loading} className="authSubmit mt-2">
            {loading ? <CircularProgress size={20} color="inherit" /> : "Update password"}
          </button>
        </form>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-[600] text-gray-600 hover:text-primary">
          <FiArrowLeft /> Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email linked to your account and we'll send you a 6-digit code."
      panelTitle="It happens to the best of us."
      panelText="We'll help you get back into your account in a minute."
    >
      <form className="flex flex-col gap-4" onSubmit={sendOtp} noValidate>
        <AuthField label="Email address">
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
              autoComplete="email" placeholder="you@example.com" className="authInput has-icon" autoFocus />
          </div>
        </AuthField>
        <button type="submit" disabled={loading} className="authSubmit mt-2">
          {loading ? <CircularProgress size={20} color="inherit" /> : "Send code"}
        </button>
      </form>
      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-[600] text-gray-600 hover:text-primary">
        <FiArrowLeft /> Back to login
      </Link>
    </AuthLayout>
  );
};

export default ForgotPassword;
