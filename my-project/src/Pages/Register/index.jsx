import React, { useContext, useState } from "react";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import AuthLayout, { AuthDivider, AuthField, AuthSwitch, GoogleButton } from "../../components/AuthLayout";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isShowConfirm, setIsShowConfirm] = useState(false);

  const context = useContext(MyContext);
  const history = useNavigate();

  // Google se sign up / login — backend naya user bana deta hai agar pehle se nahi hai
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

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });
  };

  // const validValue = Object.values(formFields).every((el) => el);

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (formFields.name === "") {
      context.openAlertBox("error", "name field required");
      setIsLoading(false);
      return false;
    }

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

    if (formFields.password.length < 6) {
      context.openAlertBox("error", "Password must be at least 6 characters");
      setIsLoading(false);
      return false;
    }

    if (formFields.password !== confirmPassword) {
      context.openAlertBox("error", "Password and confirm password do not match");
      setIsLoading(false);
      return false;
    }

    postData("/api/user/register", formFields).then((res) => {
      if (res?.error !== true) {
        setIsLoading(false);
        context.openAlertBox("success", res?.message);
        localStorage.setItem("userEmail", formFields.email)
        localStorage.removeItem("actionType")
        setConfirmPassword("")
        setFormFields({
          name: "",
          email: "",
          password: "",
        });
        history("/verify");
      } else {
        context.openAlertBox("error", res?.message);
        setIsLoading(false);
      }
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      panelTitle="Join ClassyShop today."
      panelText="Create an account to save your favourites, check out faster and keep track of every order."
    >
      <GoogleButton onClick={handleGoogleLogin} loading={isGoogleLoading}>Sign up with Google</GoogleButton>
      <AuthDivider />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <AuthField label="Full name">
          <input type="text" name="name" value={formFields.name} onChange={onChangeInput}
            disabled={isLoading} autoComplete="name" placeholder="Your full name" className="authInput" />
        </AuthField>

        <AuthField label="Email address">
          <input type="email" name="email" value={formFields.email} onChange={onChangeInput}
            disabled={isLoading} autoComplete="email" placeholder="you@example.com" className="authInput" />
        </AuthField>

        <AuthField label="Password">
          <div className="relative">
            <input type={isShowPassword ? "text" : "password"} name="password" value={formFields.password} onChange={onChangeInput}
              disabled={isLoading} autoComplete="new-password" placeholder="Create a password" className="authInput pr-11" />
            <button type="button" className="authEye" aria-label={isShowPassword ? "Hide password" : "Show password"}
              onClick={() => setIsShowPassword(!isShowPassword)}>
              {isShowPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          <span className="block mt-1.5 text-[11px] text-gray-400">Use at least 6 characters.</span>
        </AuthField>

        <AuthField label="Confirm password">
          <div className="relative">
            <input type={isShowConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading} autoComplete="new-password" placeholder="Re-enter your password" className="authInput pr-11" />
            <button type="button" className="authEye" aria-label={isShowConfirm ? "Hide password" : "Show password"}
              onClick={() => setIsShowConfirm(!isShowConfirm)}>
              {isShowConfirm ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {confirmPassword && (
            <span className={`block mt-1.5 text-[11px] font-[600] ${confirmPassword === formFields.password ? "text-[#15803d]" : "text-red-500"}`}>
              {confirmPassword === formFields.password ? "✓ Passwords match" : "Passwords don't match"}
            </span>
          )}
        </AuthField>

        <button type="submit" disabled={isLoading} className="authSubmit mt-2">
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "Create account"}
        </button>
        <div className="text-[11px] text-gray-400 text-center leading-[17px]">
          We’ll email you a one-time code to verify your address.
        </div>
      </form>

      <AuthSwitch text="Already have an account?" to="/login" cta="Log in" />
    </AuthLayout>
  );
};

export default Register;
