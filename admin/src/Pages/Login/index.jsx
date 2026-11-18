import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiBarChart2, FiBox, FiUsers } from "react-icons/fi";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import { saveSession } from "../../utils/session";

const POINTS = [
  { icon: <FiBarChart2 />, text: "Sales, orders and revenue at a glance" },
  { icon: <FiBox />, text: "Manage products, categories and banners" },
  { icon: <FiUsers />, text: "Track customers and their orders" },
];

const inputCls =
  "w-full h-[46px] pl-10 pr-3 rounded-md border border-gray-200 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 disabled:bg-gray-50";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Remember me: ON → 30 din login + email yaad; OFF → browser band hote hi logout
  const [remember, setRemember] = useState(() => localStorage.getItem("rememberMe") !== "false");
  const [formFields, setFormFields] = useState({ email: "", password: "" });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) setFormFields((prev) => ({ ...prev, email: savedEmail }));
  }, []);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.email.trim()) return context.openAlertBox("error", "Email is required");
    if (!formFields.password) return context.openAlertBox("error", "Password is required");

    setIsLoading(true);
    postData("/api/user/login", { ...formFields, adminLogin: true, remember }, { withCredentials: true }).then((res) => {
      setIsLoading(false);
      if (res?.error !== true) {
        context.openAlertBox("success", res?.message);
        saveSession(res?.data?.accessToken, res?.data?.refreshToken, remember);
        if (remember) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", formFields.email);
        } else {
          localStorage.setItem("rememberMe", "false");
          localStorage.removeItem("rememberedEmail");
        }
        context.setUserData(res?.data?.user);
        context.setIsLogin(true);
        setFormFields({ email: remember ? formFields.email : "", password: "" });
        history("/");
      } else {
        context.openAlertBox("error", res?.message);
        if (res?.message?.toLowerCase().includes("not verified")) {
          localStorage.setItem("userEmail", formFields.email);
          localStorage.removeItem("actionType");
          history("/verify-account");
        }
      }
    });
  };

  const forgotPassword = () => {
    if (!formFields.email.trim()) return context.openAlertBox("error", "Enter your email first, then click Forgot password");
    localStorage.setItem("userEmail", formFields.email);
    localStorage.setItem("actionType", "forgot-password");
    postData("/api/user/forgot-password", { email: formFields.email }).then((res) => {
      if (res?.error === false) {
        context.openAlertBox("success", res?.message || "OTP sent");
        history("/verify-account");
      } else {
        context.openAlertBox("error", res?.message || "Something went wrong");
      }
    });
  };

  return (
    <section className="min-h-screen w-full flex bg-white">
      {/* Left brand panel */}
      <aside className="hidden lg:flex w-[46%] max-w-[640px] relative flex-col justify-between overflow-hidden bg-[#111827] text-white p-12">
        <div className="absolute -top-24 -right-24 w-[360px] h-[360px] rounded-full bg-[#ff5252]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-[320px] h-[320px] rounded-full bg-[#3b82f6]/15 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-md bg-[#ff5252] flex items-center justify-center text-[18px]"><FiShield /></span>
          <span className="text-[17px] font-[700] tracking-tight">Admin Console</span>
        </div>

        <div className="relative">
          <img src="/shop-illustration.webp" alt="" className="w-full max-w-[380px] mb-10 opacity-95" />
          <h2 className="text-[30px] leading-[1.2] font-[700] tracking-tight">Run your store from one place.</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-[14px] text-gray-300">
                <span className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white">{p.icon}</span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[12px] text-gray-500">© {new Date().getFullYear()} Admin Console</div>
      </aside>

      {/* Right form */}
      <main className="flex-1 flex items-center justify-center px-5 py-12 bg-[#fafafa]">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="w-9 h-9 rounded-md bg-[#ff5252] text-white flex items-center justify-center text-[18px]"><FiShield /></span>
            <span className="text-[17px] font-[700] text-gray-900">Admin Console</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h1 className="text-[24px] font-[700] text-gray-900 tracking-tight">Sign in</h1>
            <div className="mt-1 text-[14px] text-gray-500">Use your admin email and password.</div>

            <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="block text-[13px] font-[600] text-gray-700 mb-1.5">Email address</span>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" value={formFields.email} onChange={onChangeInput} disabled={isLoading}
                    autoComplete="email" placeholder="admin@example.com" className={inputCls} autoFocus />
                </div>
              </label>

              <label className="block">
                <span className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-[600] text-gray-700">Password</span>
                  <button type="button" onClick={forgotPassword} className="text-[12px] font-[600] text-[#ff5252] hover:underline">
                    Forgot password?
                  </button>
                </span>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} name="password" value={formFields.password} onChange={onChangeInput}
                    disabled={isLoading} autoComplete="current-password" placeholder="Enter your password" className={`${inputCls} !pr-11`} />
                  <button type="button" aria-label="Toggle password" onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </label>

              <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={isLoading}
                  className="w-4 h-4 accent-[#111827]" />
                Remember me <span className="text-gray-400">· stay signed in for 30 days</span>
              </label>

              <button type="submit" disabled={isLoading}
                className="mt-2 h-[46px] w-full rounded-md bg-[#111827] text-white text-[14px] font-[600] flex items-center justify-center transition hover:bg-[#ff5252] disabled:opacity-70">
                {isLoading ? <CircularProgress size={20} color="inherit" /> : "Sign in"}
              </button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-gray-400">
            <FiShield /> Restricted area — only admin accounts can sign in.
          </div>
        </div>
      </main>
    </section>
  );
};

export default Login;
