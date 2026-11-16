import Button from "@mui/material/Button";
import React, { useContext, useEffect, useState } from "react";
import { IoMdLogIn } from "react-icons/io";
import { PiUserCirclePlus } from "react-icons/pi";
import { BsFacebook } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { Link, NavLink, useNavigate } from "react-router-dom";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [remember, setRemember] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormFields((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  function handleClickGoogle() {
    setLoadingGoogle(true);
  }
  function handleClickFacebook() {
    setLoadingFacebook(true);
  }

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
        console.log(res);

        if (res?.error !== true) {
          setIsLoading(false);
          context.openAlertBox("success", res?.message);

          // localStorage.setItem("accesstoken", res?.data?.accessToken);
          // localStorage.setItem("refreshtoken", res?.data?.refreshToken);
          const accessToken = res?.data?.accessToken;
          const refreshToken = res?.data?.refreshToken;

          if (remember) {
            localStorage.setItem("accesstoken", accessToken || "");
            localStorage.setItem("refreshtoken", refreshToken || "");
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("rememberedEmail", formFields.email);
          } else {
            localStorage.setItem("accesstoken", accessToken || "");
            localStorage.setItem("refreshtoken", refreshToken || "");
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("rememberedEmail");
          }

          context.setUserData(res?.data?.user);
          context.setIsLogin(true);

          setFormFields({
            email: remember ? formFields.email : "",
            password: "",
          });
          history("/");
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading(false);
          if (res?.message?.toLowerCase().includes("not verified")) {
            localStorage.setItem("userEmail", formFields.email);
            localStorage.removeItem("actionType");
            history("/verify-account");
          }
        }
      });
  };

  const forgotPassword = () => {
    if (formFields.email === "") {
      context.openAlertBox("error", "Email field required");
      return false;
    }

    localStorage.setItem("userEmail", formFields.email);
    localStorage.setItem("actionType", "forgot-password");

    postData("/api/user/forgot-password", {
      email: formFields.email,
    }).then((res) => {
      if (res?.error === false) {
        context.openAlertBox("success", res?.message || "OTP sent");
        history("/verify-account"); // ✅ only navigate if success
      } else {
        context.openAlertBox("error", res?.message || "Something went wrong");
      }
    });
  };

  return (
    <section className="bg-white w-full h-full">
      <header className="flex fixed top-0 left-0 items-center z-50 justify-between w-full px-4 py-3">
        <Link to="/">
          <img
            src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
            alt=""
            className="w-[150px]"
          />
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/login" className={({ isActive }) => isActive ? "isActive" : ""}>
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] bg-[#f1f1f1] !px-5 flex gap-1">
              <IoMdLogIn className="text-[15px]" />
              Sign In
            </Button>
          </NavLink>

          <NavLink to="/signup" className={({ isActive }) => isActive ? "isActive" : ""}>
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] bg-[#f1f1f1] !px-5 flex gap-1">
              <PiUserCirclePlus className="text-[15px]" />
              Sign Up
            </Button>
          </NavLink>
        </div>
      </header>
      <img
        src="/signIn_bg.jpg"
        alt=""
        className="w-full h-full object-cover fixed top-0 left-0 opacity-25"
      />

      <div className="loginBox card w-[550px] h-[auto] pb-25 mx-auto pt-20 relative z-50">
        <div className="text-center">
          <img src="/signin_icon.png" alt="" className="m-auto" />
        </div>

        <h1 className="text-center text-[30px] font-[800] mt-4">
          Welcome Back! <br />
          Sign in with your credentials.
        </h1>

        <div className="flex items-center justify-center w-full mt-5 gap-4">
          <Button
            size="small"
            onClick={handleClickGoogle}
            endIcon={<FcGoogle className="!text-[28px]" />}
            loading={loadingGoogle}
            loadingPosition="end"
            variant="outlined"
            className="!bg-none !py-1 !text-[15px] !capitalize !px-5 !text-[rgba(0,0,0,0.8)]"
          >
            SignIn with Google
          </Button>

          <Button
            size="small"
            onClick={handleClickFacebook}
            endIcon={<BsFacebook className="!text-[28px] !text-blue-600" />}
            loading={loadingFacebook}
            loadingPosition="end"
            variant="outlined"
            className="!bg-none !py-1 !text-[15px] !capitalize !px-5 !text-[rgba(0,0,0,0.8)]"
          >
            SignIn with Facebook
          </Button>
        </div>

        <br />

        <div className="w-full flex items-center justify-center gap-1">
          <span className="flex items-center w-[120px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
          <span className="text-[14px] font-[500]">
            or, Sign in with your email
          </span>
          <span className="flex items-center w-[120px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
        </div>

        <br />

        <form action="" className="w-full px-8 mt-3" onSubmit={handleSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Email</h4>
            <input
              type="email"
              name="email"
              value={formFields.email}
              disabled={isLoading === true ? true : false}
              label="Email Id"
              onChange={onChangeInput}
              className="w-full h-[45px] bg-[#fff] border-2 focus:border-[rgba(0,0,0,0.7)] px-3 focus:outline-none rounded-md border-[rgba(0,0,0,0.1)]"
            />
          </div>

          <div className="form-group w-full">
            <h4 className="text-[14px] font-[500] mb-1">Password</h4>
            <div className="relative w-full">
              <input
                type={showPassword === true ? "text" : "password"}
                name="password"
                value={formFields.password}
                disabled={isLoading === true ? true : false}
                label="Password"
                onChange={onChangeInput}
                className="w-full h-[45px] bg-[#fff] border-2 focus:border-[rgba(0,0,0,0.7)] px-3 focus:outline-none rounded-md border-[rgba(0,0,0,0.1)]"
              />
              <Button
                className="!absolute top-[8px] !text-[rgba(0,0,0,0.7)] right-[10px] !w-[30px]
               !h-[30px] !min-w-[30px] !z-50 !rounded-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword === true ? (
                  <FaEye className="text-[20px]" />
                ) : (
                  <FaEyeSlash className="text-[20px]" />
                )}
              </Button>
            </div>
          </div>

          <div className="form-group flex items-center justify-between mb-4 w-full">
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label="Remember Me"
            />

            <span
              className="text-primary cursor-pointer text-[15px] hover:underline hover:text-[rgba(0,0,0,0.6)] font-[700]"
              onClick={forgotPassword}
            >
              Forgot Password?
            </span>
          </div>

          <Button type="submit" className="w-full btn-lg btn-blue flex gap-3">
            {isLoading === true ? (
              <CircularProgress color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Login;
