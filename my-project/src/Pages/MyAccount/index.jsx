import React, { useContext, useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { putData } from "../../utils/api";
import { Collapse } from "react-collapse";
import { postData } from "../../utils/api";

const MyAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangedPasswordFormShow, setIsChangedPasswordFormShow] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
  });

  const [ChangePassword, setChangePassword] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (!token) {
      history("/");
    }
  }, [context?.isLogin, history]);

  useEffect(() => {
    setUserId(context?.userData?._id);
    setFormFields({
      name: context?.userData?.name || "",
      email: context?.userData?.email || "",
      mobile: context?.userData?.mobile || "",
      country: context?.userData?.country || "",
    });

    setChangePassword({
      email: context?.userData?.email || "",
    });
  }, [context?.userData]);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });

    setChangePassword(() => {
      return {
        ...ChangePassword,
        [name]: value,
      };
    });
  };

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

    if (formFields.mobile === "") {
      context.openAlertBox("error", "phone no. required");
      setIsLoading(false);
      return false;
    }

    putData(`/api/user/${userId}`, formFields, { withCredentials: true }).then(
      (res) => {
        if (res?.error !== true) {
          setIsLoading(false);
          context.openAlertBox("success", res?.message);
          setFormFields({
            name: '',
            email: '',
            mobile: '',
          });
        } else {
          context.openAlertBox("error", res?.error);
          setIsLoading(false);
        }
      }
    );
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setIsLoading2(true);

    const isGoogleUser = !context?.userData?.hasPassword;

    // Only require old password for non-Google users
    if (!isGoogleUser && ChangePassword.oldPassword === "") {
      context.openAlertBox("error", "old password field required");
      setIsLoading2(false);
      return false;
    }

    if (ChangePassword.newPassword === "") {
      context.openAlertBox("error", "new password field required");
      setIsLoading2(false);
      return false;
    }

    if (ChangePassword.confirmPassword === "") {
      context.openAlertBox("error", "confirm password field required");
      setIsLoading2(false);
      return false;
    }

    if (ChangePassword.confirmPassword !== ChangePassword.newPassword) {
      context.openAlertBox("error", "confirm password and new password not match");
      setIsLoading2(false);
      return false;
    }

    const payload = {
      ...ChangePassword,
      isGoogleUser,   // backend uses this to skip old password check
    };

    postData(`/api/user/reset-password`, payload, { withCredentials: true }).then(
      (res) => {
        if (res?.error !== true) {
          setIsLoading2(false);
          context.openAlertBox("success", res?.message);
          setChangePassword({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setIsChangedPasswordFormShow(false);
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading2(false);
        }
      }
    );
  };

  return (
    <section className="w-full py-10">
      <div className="container flex gap-5">
        <div className="col1 w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-[50%]">

          {/* Complete profile banner — shown for any user missing phone/country */}
          {(!context?.userData?.mobile || !context?.userData?.country) && (
            <div className="flex items-start gap-3 mb-5 p-4 rounded-md border-l-4 border-[#ff5252] bg-[#fff5f5]">
              <span className="text-[22px]">👋</span>
              <div>
                <p className="font-[600] text-[15px] mb-1">Complete your profile</p>
                <p className="text-[13px] text-gray-600">
                  Please add your
                  {!context?.userData?.mobile && !context?.userData?.country
                    ? " phone number and country"
                    : !context?.userData?.mobile
                      ? " phone number"
                      : " country"}{" "}
                  below to get the full experience.
                </p>
              </div>
            </div>
          )}


          <div className="p-5 bg-white rounded-md shadow-md card mb-5">
            <div className="flex items-center pb-3">
              <h2 className="pb-0">My Profile</h2>
              <Button className="!ml-auto" onClick={() => setIsChangedPasswordFormShow(!isChangedPasswordFormShow)}>
                {context?.userData?.hasPassword ? "Change Password" : "Set Password"}
              </Button>
            </div>
            <hr />
            <form className="mt-8" action="" onSubmit={handleSubmit}>
              <div className="flex items-center gap-5">
                <div className="w-[50%]">
                  <TextField
                    name="name"
                    value={formFields.name}
                    disabled={isLoading === true ? true : false}
                    label="Full Name"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>

                <div className="w-[50%]">
                  <TextField
                    name="email"
                    value={formFields.email}
                    disabled={true}
                    label="Email"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>
              </div>
              <div className="flex items-center gap-5 mt-4">
                <div className="w-[50%]">
                  <TextField
                    name="mobile"
                    value={formFields.mobile || ""}
                    disabled={isLoading === true ? true : false}
                    label="Phone no."
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>
                <div className="w-[50%]">
                  <TextField
                    name="country"
                    value={formFields.country || ""}
                    disabled={isLoading === true ? true : false}
                    label="Country"
                    variant="outlined"
                    size="small"
                    className="w-full"
                    onChange={onChangeInput}
                  />
                </div>
              </div>

              <br />

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  className="btn-org btn-lg !w-[130px] flex gap-3"
                >
                  {isLoading === true ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    "Save"
                  )}
                </Button>

                <Button className="btn-org btn-border btn-lg !w-[130px]">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {
            isChangedPasswordFormShow === true &&
            <Collapse isOpened={isChangedPasswordFormShow}>
              <div className="p-5 bg-white rounded-md shadow-md card">
                <div className="flex items-center pb-3">
                  <h2 className="pb-0">{context?.userData?.hasPassword ? "Change Password" : "Set Password"}</h2>
                </div>
                <hr />
                <form className="mt-8" action="" onSubmit={handlePasswordChange}>
                  <div className="flex items-center gap-5">
                    {/* Hide Old Password if user hasn't set a password yet */}
                    {context?.userData?.hasPassword && (
                      <div className="w-[50%]">
                        <TextField
                          name="oldPassword"
                          value={ChangePassword.oldPassword}
                          disabled={isLoading2 === true ? true : false}
                          label="Old Password"
                          variant="outlined"
                          size="small"
                          className="w-full"
                          onChange={onChangeInput}
                        />
                      </div>
                    )}

                    <div className={context?.userData?.hasPassword ? "w-[50%]" : "w-full"}>
                      <TextField
                        name="newPassword"
                        value={ChangePassword.newPassword}
                        disabled={isLoading2 === true ? true : false}
                        label="New Password"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-5 mt-4">
                    <div className="w-[100%]">
                      <TextField
                        name="confirmPassword"
                        value={ChangePassword.confirmPassword}
                        disabled={isLoading2 === true ? true : false}
                        label="Confirm Password"
                        variant="outlined"
                        size="small"
                        className="w-full"
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>

                  <br />

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      className="btn-org btn-lg !w-[130px] flex gap-3"
                    >
                      {isLoading2 === true ? (
                        <CircularProgress color="inherit" />
                      ) : (
                        "Save"
                      )}
                    </Button>

                    <Button className="btn-org btn-border btn-lg !w-[130px]">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Collapse>
          }
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
