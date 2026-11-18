import Button from "@mui/material/Button";
import React, { useContext, useState } from "react";
import { IoMdLogIn } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../App";

const ChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formFields, setFormFields] = useState({
    email: localStorage.getItem('userEmail'),
    newPassword: "",
    confirmPassword: "",
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

    if (formFields.newPassword === "") {
      context.openAlertBox("error", "newPassword required");
      setIsLoading(false);
      return false;
    }

    if (formFields.confirmPassword === "") {
      context.openAlertBox("error", "confirmPassword required");
      setIsLoading(false);
      return false;
    }

    if (formFields.newPassword !== formFields.confirmPassword) {
      context.openAlertBox(
        "error",
        "newPassword & confirmPassword must be same"
      );
      setIsLoading(false);
      return false;
    }

    postData("/api/user/reset-password", formFields).then((res) => {
      if (!res.error) {
        context.openAlertBox("success", res?.message);
        localStorage.removeItem("userEmail");
        localStorage.removeItem("actionType");
        history("/login");
      } else {
        context.openAlertBox("error", res?.message);
        setIsLoading(false);
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
          <NavLink to="/login" exact={true} activeClassName="isActive">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] bg-[#f1f1f1] !px-5 flex gap-1">
              <IoMdLogIn className="text-[15px]" />
              Sign In
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
          You can change your password here
        </h1>

        <br />

        <form action="" className="w-full px-8 mt-3" onSubmit={handleSubmit}>

          <div className="form-group w-full">
            <h4 className="text-[14px] font-[500] mb-1">New Password</h4>
            <div className="relative w-full">
              <input
                type={showPassword === true ? "text" : "password"}
                label="New Password"
                name="newPassword"
                value={formFields.newPassword}
                disabled={isLoading === true ? true : false}
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

          <div className="form-group w-full">
            <h4 className="text-[14px] font-[500] mb-1 mt-4">Confirm Password</h4>
            <div className="relative w-full">
              <input
                type={showPassword2 === true ? "text" : "password"}
                label="Confirm Password"
                name="confirmPassword"
                value={formFields.confirmPassword}
                disabled={isLoading === true ? true : false}
                onChange={onChangeInput}
                className="w-full h-[45px] bg-[#fff] border-2 focus:border-[rgba(0,0,0,0.7)] px-3 focus:outline-none rounded-md border-[rgba(0,0,0,0.1)]"
              />
              <Button
                className="!absolute top-[8px] !text-[rgba(0,0,0,0.7)] right-[10px] !w-[30px]
               !h-[30px] !min-w-[30px] !z-50 !rounded-full"
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 === true ? (
                  <FaEye className="text-[20px]" />
                ) : (
                  <FaEyeSlash className="text-[20px]" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full btn-blue btn-org flex gap-3"
          >
            {isLoading === true ? (
              <CircularProgress color="inherit" />
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
