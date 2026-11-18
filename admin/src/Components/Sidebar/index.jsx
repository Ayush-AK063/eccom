import Button from "@mui/material/Button";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FaImage } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { RiProductHuntLine } from "react-icons/ri";
import { TbCategory2 } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { TbLogout } from "react-icons/tb";
import { SiBloglovin } from "react-icons/si";
import { FaAngleDown } from "react-icons/fa";
import { Collapse } from "react-collapse";
import { MyContext } from "../../App";

const Sidebar = () => {
  const [subMenuIndex, setSubMenuIndex] = useState(null);

  const isOpenSubMenu = (index) => {
    if (subMenuIndex === index) {
      setSubMenuIndex(null);
    } else {
      setSubMenuIndex(index);
    }
  };

  const context = useContext(MyContext);

  return (
    <>
      <div
        className={`sidebar py-2 px-4 fixed top-0 left-0 bg-[#fff] h-full border-r border-[rgba(0,0,0,0.1)] w-[${context.isSidebarOpen === true ? "20%" : "0%"
          }]`}
      >
        <div className="py-2 w-full">
          <Link to="/">
            <img
              src="https://ecme-react.themenate.net/img/logo/logo-light-full.png"
              alt=""
              className="w-[120px]"
            />
          </Link>
        </div>

        <ul className="mt-4">
          <li>
            <Link to="/">
              <Button className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start">
                <RxDashboard className="text-[18px]" /> <span>Dashboard</span>
              </Button>
            </Link>
          </li>
          <li>
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start"
              onClick={() => isOpenSubMenu(1)}
            >
              <FaImage className="text-[18px]" /> <span>Home Slides</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${subMenuIndex === 1 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={subMenuIndex === 1 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/homeSlider/list">
                    <Button className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Add Home Banner List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Home Slide",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Home Banner Slide
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>
          <li>
            <Link to="/users">
              <Button className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start">
                <FiUsers className="text-[18px]" /> <span>Users</span>
              </Button>
            </Link>
          </li>
          <li>
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start"
              onClick={() => isOpenSubMenu(3)}
            >
              <RiProductHuntLine className="text-[18px]" />{" "}
              <span>Products</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${subMenuIndex === 3 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={subMenuIndex === 3 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/products">
                    <Button className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Product List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Product",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Product Upload
                  </Button>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Product RAM",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Product RAM
                  </Button>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Product Weight",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Product Weight
                  </Button>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Product Size",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Product Size
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>
          <li>
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start"
              onClick={() => isOpenSubMenu(4)}
            >
              <TbCategory2 className="text-[18px]" /> <span>Category</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown
                  className={`transition-all ${subMenuIndex === 4 ? "rotate-180" : ""
                    }`}
                />
              </span>
            </Button>

            <Collapse isOpened={subMenuIndex === 4 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/category/list">
                    <Button className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] shrink-0 rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      <span className="text-left leading-tight">Category List</span>
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add New Category",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] shrink-0 rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    <span className="text-left leading-tight">Add a Category</span>
                  </Button>
                </li>
                <li className="w-full">
                  <Link to="/subCategory/list">
                    <Button className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] shrink-0 rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      <span className="text-left leading-tight">Sub Category List</span>
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add New Sub Category",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] shrink-0 rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    <span className="text-left leading-tight">Add a Sub Category</span>
                  </Button>
                </li>
                <li className="w-full">
                  <Link to="/thirdCategory/list">
                    <Button className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] shrink-0 rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      <span className="text-left leading-tight">Third Level Category List</span>
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() =>
                      context.setIsOpenFullScreenPanel({
                        open: true,
                        model: "Add Third Level Category",
                      })
                    }
                  >
                    <span className="block w-[5px] h-[5px] shrink-0 rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    <span className="text-left leading-tight">Add a Third Level Category</span>
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>
          <li>
            <Button
              className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start"
              onClick={() => isOpenSubMenu(5)}
            >
              <SiBloglovin className="text-[18px]" /> <span>Blogs</span>
              <span className="ml-auto w-[30px] h-[30px] flex items-center justify-center">
                <FaAngleDown className={`transition-all ${subMenuIndex === 5 ? "rotate-180" : ""}`} />
              </span>
            </Button>

            <Collapse isOpened={subMenuIndex === 5 ? true : false}>
              <ul className="w-full">
                <li className="w-full">
                  <Link to="/blog/list">
                    <Button className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3">
                      <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                      Blog List
                    </Button>
                  </Link>
                </li>
                <li className="w-full">
                  <Button
                    className="!text-[rgba(0,0,0,0.6)] !text-[13px] !font-[600] !capitalize !justify-start !w-full !pl-9 flex gap-3"
                    onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Add Blog" })}
                  >
                    <span className="block w-[5px] h-[5px] rounded-full bg-[rgba(0,0,0,0.2)]"></span>
                    Add Blog
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>
          <li>
            <Link to="/orders">
              <Button className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start">
                <IoBagCheckOutline className="text-[20px]" />{" "}
                <span>Orders</span>
              </Button>
            </Link>
          </li>
          <li>
            <Button className="w-full !capitalize !py-2 hover:!bg-[#f1f1f1] items-center flex gap-3 text-[14px] !font-[600] !text-[rgba(0,0,0,0.8)] !justify-start"
              onClick={() => context.logout()}>
              <TbLogout className="text-[20px]" /> <span>Logout</span>
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
