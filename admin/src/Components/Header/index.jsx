import React, { useContext } from "react";
import Button from "@mui/material/Button";
import { FaRegBell } from "react-icons/fa";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import { FaRegUser } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from "../../App";
import { RiMenuFoldLine } from "react-icons/ri";
import { RiMenuUnfoldLine } from "react-icons/ri";
import { Link } from "react-router-dom";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 3,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = () => {
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const openMyAcc = Boolean(anchorMyAcc);
  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const context = useContext(MyContext);

  const logout = () => {
    setAnchorMyAcc(null);
    context.logout();
  };

  return (
    <header
      className={`flex items-center justify-between w-full h-[auto] py-2 pr-7 shadow-md bg-[#fff] ${context.isSidebarOpen === true ? "pl-64" : "pl-5"
        } transition-all`}
    >
      <div className="part-1">
        <Button
          className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px] !text-[rgba(0,0,0,0.8)]"
          onClick={() => context.setIsSidebarOpen(!context.isSidebarOpen)}
        >
          {context.isSidebarOpen === true ? (
            <RiMenuFoldLine className="text-[24px] font-[900] text-[rgba(0,0,0,0.8)]" />
          ) : (
            <RiMenuUnfoldLine className="text-[24px] font-[900] text-[rgba(0,0,0,0.8)]" />
          )}
        </Button>
      </div>

      <div className="part-2 w-[40%] flex items-center justify-end gap-5">
        <IconButton aria-label="cart">
          <StyledBadge badgeContent={4} color="secondary">
            <FaRegBell />
          </StyledBadge>
        </IconButton>

        {context.isLogin === true ? (
          <div className="relative">
            <div
              className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer"
              onClick={handleClickMyAcc}
            >
              <img
                src={context?.userData?.avatar ? context.userData.avatar : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt=""
                className="object-cover w-full h-full"
              />
            </div>

            <Menu
              anchorEl={anchorMyAcc}
              id="account-menu"
              open={openMyAcc}
              onClose={handleCloseMyAcc}
              onClick={handleCloseMyAcc}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleCloseMyAcc} className="!bg-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer">
                    <img
                      src={context?.userData?.avatar ? context.userData.avatar : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="info">
                    <h3 className="text-[15px] font-[500] leading-5">
                      {context?.userData?.name}
                    </h3>
                    <p className="text-[12px] font-[400] opacity-70">
                      {context?.userData?.email}
                    </p>
                  </div>
                </div>
              </MenuItem>
              <Divider />
              <Link to="/my-account">
                <MenuItem
                  onClick={handleCloseMyAcc}
                  className="flex items-center gap-3"
                >
                  <FaRegUser className="text-[16px]" />
                  <span className="text-[14px]">Profile</span>
                </MenuItem>
              </Link>
              <MenuItem
                onClick={logout}
                className="flex items-center gap-3"
              >
                <IoMdLogOut className="text-[16px]" />
                <span className="text-[14px]">Sign Out</span>
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <Link to="/login">
            <Button className="btn-blue btn-sm !rounded-full">SignIn</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
