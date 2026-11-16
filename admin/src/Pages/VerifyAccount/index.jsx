import Button from "@mui/material/Button";
import React, { useContext, useState } from "react";
import { IoMdLogIn } from "react-icons/io";
import { PiUserCirclePlus } from "react-icons/pi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import OtpBox from "../../Components/OtpBox";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";

const VerifyAccount = () => {
  const [otp, setOtp] = useState("");

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const context = useContext(MyContext);
  const history = useNavigate();

  const verifyOTP = (e) => {
    e.preventDefault();

    const actionType = localStorage.getItem("actionType");

    if (actionType !== "forgot-password") {
      postData("/api/user/verifyemail", {
        email: localStorage.getItem("userEmail"),
        otp: otp,
      }).then((res) => {
        if (res?.error === false) {
          context.openAlertBox("success", res?.message);
          localStorage.removeItem("userEmail");
          history("/login");
        } else {
          context.openAlertBox("error", res?.message);
        }
      });
    } else {
      postData("/api/user/verify-forgot-password-otp", {
        email: localStorage.getItem("userEmail"),
        otp: otp,
      }).then((res) => {
        if (res?.error === false) {
          context.openAlertBox("success", res?.message);
          history("/change-password");
        } else {
          context.openAlertBox("error", res?.message);
        }
      });
    }
  };

  const resendOtp = () => {
    if (localStorage.getItem("actionType") === 'forgot-password') {
      postData("/api/user/forgot-password", {
        email: localStorage.getItem("userEmail"),
      }).then((res) => {
        if (res?.error === false) {
          context.openAlertBox("success", res?.message || "OTP sent");
        } else {
          context.openAlertBox("error", res?.message || "Something went wrong");
        }
      });
    } else {
      postData("/api/user/resend-otp", {
        email: localStorage.getItem("userEmail"),
      }).then((res) => {
        if (res?.error === false) {
          context.openAlertBox("success", res?.message);
        } else {
          context.openAlertBox("error", res?.message);
        }
      });
    }
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
          <img
            src="/verify2.png"
            alt="verify-icon"
            className="w-[100px] m-auto"
          />
        </div>

        <h1 className="text-center text-[30px] font-[800] mt-4">
          Welcome Back! <br />
          Please Verify Your Email
        </h1>

        <br />

        <p className="text-center text-[15px]">
          OTP send to <span className="text-primary font-bold">{localStorage.getItem("userEmail")}</span>
        </p>

        <br />

        <form onSubmit={verifyOTP} action="">
          <div className="text-center flex items-center justify-center flex-col">
            <OtpBox length={6} onChange={handleOtpChange} />
          </div>

          <br />

          <div className="w-[300px] m-auto">
            <button type="submit" className="btn-blue w-full">Verify OTP</button>
          </div>

          <div className="text-center mt-4">
            <span className="text-[14px] font-[500]">
              Didn't receive OTP?{" "}
              <span
                className="text-primary cursor-pointer hover:underline font-[700]"
                onClick={resendOtp}
              >
                Resend OTP
              </span>
            </span>
          </div>
        </form>
      </div>
    </section>
  );
};

export default VerifyAccount;
