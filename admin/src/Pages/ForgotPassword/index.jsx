import Button from "@mui/material/Button";
import React, { useContext, useState } from "react";
import { IoMdLogIn } from "react-icons/io";
import { PiUserCirclePlus } from "react-icons/pi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const context = useContext(MyContext);
  const history = useNavigate();

  const onChangeInput = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "") {
      context.openAlertBox("error", "Email is required");
      return;
    }

    setIsLoading(true);

    postData("/api/user/forgot-password", { email }).then((res) => {
      setIsLoading(false);
      if (res?.error !== true) {
        context.openAlertBox("success", res?.message);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("actionType", "forgot-password");
        history("/verify-account");
      } else {
        context.openAlertBox("error", res?.message);
      }
    });
  };

  return (
    <section className="bg-white w-full h-[100vh]">
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
          Having trouble to sign in? <br />
          Reset your password.
        </h1>

        <br />

        <form action="" className="w-full px-8 mt-3" onSubmit={handleSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Email</h4>
            <input
              type="email"
              placeholder="Enter your email..."
              name="email"
              value={email}
              onChange={onChangeInput}
              disabled={isLoading}
              className="w-full h-[45px] bg-[#fff] border-2 focus:border-[rgba(0,0,0,0.7)] px-3 focus:outline-none rounded-md border-[rgba(0,0,0,0.1)]"
            />
          </div>

          <Button type="submit" className="btn-blue btn-lg w-full" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
          </Button>

          <br />
          <br />
          <div className="text-center flex items-center justify-center gap-1">
            <span>Don't want to reset?</span>
            <Link
              to="/login"
              className="text-primary text-[15px] hover:underline hover:text-[rgba(0,0,0,0.6)] font-[700]"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
