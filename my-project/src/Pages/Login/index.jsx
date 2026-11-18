import React from "react";
import { CircularProgress } from "@mui/material";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout, { AuthDivider, AuthField, AuthSwitch, GoogleButton } from "../../components/AuthLayout";
import { MyContext } from "../../App";
import { useContext } from "react";
import { postData } from "../../utils/api";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formFields.email === "") {
      context.openAlertBox("error", "email field required");
      setIsLoading(false);
      return false;
    }

    if (formFields.password === "") {
      context.openAlertBox("error", "password required");
      setIsLoading(false);
      return false;
    }

    postData("/api/user/login", formFields, { withCredentials: true }).then(
      (res) => {
        if (res?.error !== true) {
          setIsLoading(false);
          context.openAlertBox("success", res?.message);
          setFormFields({
            email: "",
            password: "",
          });

          localStorage.setItem("accesstoken", res?.data?.accessToken);
          localStorage.setItem("refreshtoken", res?.data?.refreshToken);

          context.setUserData(res?.data?.user);
          context.setIsLogin(true);

          history("/");
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading(false);
        }
      }
    );
  };

  // Forgot password page pe jao (email bhara ho to saath le jao)
  const forgotPassword = () => {
    if (formFields.email) localStorage.setItem("userEmail", formFields.email);
    localStorage.removeItem("otpVerified");
    localStorage.removeItem("actionType");
    history("/forgot-password");
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await postData("/api/user/google-login", { idToken });

      if (res?.error !== true) {
        localStorage.setItem("accesstoken", res?.data?.accessToken);
        localStorage.setItem("refreshtoken", res?.data?.refreshToken);
        context.setUserData(res?.data?.user);
        context.setIsLogin(true);
        context.openAlertBox("success", "Logged in with Google!");
        history("/");
      } else {
        context.openAlertBox("error", res?.message || "Google login failed");
      }
    } catch (error) {
      context.openAlertBox("error", error?.message || "Google login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };



  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue shopping."
      panelTitle="Good to see you again."
      panelText="Sign in to pick up where you left off — your cart, wishlist and orders are waiting."
    >
      <GoogleButton onClick={handleGoogleLogin} loading={isGoogleLoading} />
      <AuthDivider />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <AuthField label="Email address">
          <input type="email" name="email" value={formFields.email} onChange={onChangeInput}
            disabled={isLoading} autoComplete="email" placeholder="you@example.com" className="authInput" />
        </AuthField>

        <AuthField
          label="Password"
          right={
            <button type="button" onClick={forgotPassword} className="text-[12px] font-[600] text-primary hover:underline">
              Forgot password?
            </button>
          }
        >
          <div className="relative">
            <input type={isShowPassword ? "text" : "password"} name="password" value={formFields.password} onChange={onChangeInput}
              disabled={isLoading} autoComplete="current-password" placeholder="Enter your password" className="authInput pr-11" />
            <button type="button" className="authEye" aria-label={isShowPassword ? "Hide password" : "Show password"}
              onClick={() => setIsShowPassword(!isShowPassword)}>
              {isShowPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </AuthField>

        <button type="submit" disabled={isLoading} className="authSubmit mt-2">
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "Log in"}
        </button>
      </form>

      <AuthSwitch text="New to ClassyShop?" to="/register" cta="Create an account" />
    </AuthLayout>
  );
};

export default Login;
