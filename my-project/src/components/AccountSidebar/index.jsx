import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FiCamera, FiHeart, FiLogOut, FiMapPin, FiPackage, FiUser } from "react-icons/fi";
import { MyContext } from "../../App";
import { getData, putDataForImage } from "../../utils/api";
import "./style.css";

const ALLOWED = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

// My Account / My List / My Orders / My Addresses — sab pages ka common sidebar
const AccountSidebar = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [uploading, setUploading] = useState(false);
  const user = context?.userData;

  useEffect(() => { setAvatar(user?.avatar || ""); }, [user?.avatar]);

  const onChangeFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      context.openAlertBox("error", "Please select a JPG, PNG or WEBP image.");
      return;
    }
    const formdata = new FormData();
    formdata.append("avatar", file);
    setUploading(true);
    try {
      const res = await putDataForImage("/api/user/user-avatar", formdata);
      if (res?.avatar) {
        setAvatar(res.avatar);
        context.setUserData((prev) => (prev ? { ...prev, avatar: res.avatar } : prev));
        context.openAlertBox("success", "Profile picture updated");
      } else {
        context.openAlertBox("error", res?.message || "Could not upload picture");
      }
    } finally {
      setUploading(false);
    }
  };

  const logout = () => {
    getData(`/api/user/logout?token=${localStorage.getItem("accesstoken")}`).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        context.setUserData(null);
        context.setCartData([]);
        context.setMyListData([]);
        context.openAlertBox("success", res?.message || "Logged out");
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        history("/");
      } else {
        context.openAlertBox("error", res?.message || "Could not log out");
      }
    });
  };

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const links = [
    { to: "/my-account", label: "My Profile", icon: <FiUser className="text-[17px] shrink-0" /> },
    { to: "/my-orders", label: "My Orders", icon: <FiPackage className="text-[17px] shrink-0" /> },
    { to: "/my-list", label: "My Wishlist", icon: <FiHeart className="text-[17px] shrink-0" />, count: context?.myListData?.length },
    { to: "/my-address", label: "My Addresses", icon: <FiMapPin className="text-[17px] shrink-0" />, count: context?.addressList?.length },
  ];

  return (
    <aside className="accSide">
      <div className="accSide__user">
        <label className="accSide__avatar" title="Change profile picture">
          {uploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : avatar ? (
            <img src={avatar} alt={user?.name || "Profile"} />
          ) : (
            <span className="text-[22px] font-[700] text-gray-500">{initials}</span>
          )}
          <span className="accSide__cam"><FiCamera /></span>
          <input type="file" accept="image/*" className="sr-only" onChange={onChangeFile} disabled={uploading} />
        </label>
        <div className="min-w-0">
          <div className="text-[12px] text-gray-500">Hello,</div>
          <div className="text-[15px] font-[700] text-gray-900 truncate">{user?.name || "Customer"}</div>
          <div className="text-[12px] text-gray-500 truncate">{user?.email}</div>
        </div>
      </div>

      <nav className="accSide__nav" aria-label="Account">
        {links.map(({ to, label, icon, count }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `accSide__link ${isActive ? "is-active" : ""}`}>
            {icon}
            <span className="flex-1">{label}</span>
            {count > 0 && <span className="accSide__count">{count}</span>}
          </NavLink>
        ))}
        <button type="button" onClick={logout} className="accSide__link accSide__logout">
          <FiLogOut className="text-[17px] shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AccountSidebar;
