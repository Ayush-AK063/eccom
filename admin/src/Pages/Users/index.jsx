import { LuPhone } from "react-icons/lu";
import Checkbox from "@mui/material/Checkbox";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMailOutline } from "react-icons/md";
import Pagination from "@mui/material/Pagination";
import SearchBox from "../../Components/SearchBox";
import { MyContext } from "../../App";
import { SlCalender } from "react-icons/sl";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Users = () => {
  const Context = useContext(MyContext);

  return (
    <>
      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between w-full px-5 py-5">
          <div className="col w-[20%]">
            <h2 className="text-[18px] font-[600]">Users List</h2>
          </div>

          <div className="col w-[40%] ml-auto">
            <SearchBox />
          </div>
        </div>
        <div className="relative mt-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="px-6 pr-0 py-3" width="10%">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </th>
                <th scope="col" className="px-0 py-3 whitespace-nowrap">
                  User Image
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  User Name
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  User Email
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  User Phone
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-0 py-2">
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[55px] h-[55px] overflow-hidden group rounded-md">
                      <Link to="/product/47646">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          alt=""
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Abc Xyz</td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><MdOutlineMailOutline/>abc@gmail.com</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><LuPhone />+91123456789</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><SlCalender />12-02-2024</span></td>

              </tr>
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-0 py-2">
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[55px] h-[55px] overflow-hidden group rounded-md">
                      <Link to="/product/47646">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          alt=""
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Abc Xyz</td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><MdOutlineMailOutline/>abc@gmail.com</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><LuPhone />+91123456789</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><SlCalender />12-02-2024</span></td>

              </tr>
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-0 py-2">
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[55px] h-[55px] overflow-hidden group rounded-md">
                      <Link to="/product/47646">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          alt=""
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Abc Xyz</td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><MdOutlineMailOutline/>abc@gmail.com</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><LuPhone />+91123456789</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><SlCalender />12-02-2024</span></td>

              </tr>
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-0 py-2">
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[55px] h-[55px] overflow-hidden group rounded-md">
                      <Link to="/product/47646">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          alt=""
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Abc Xyz</td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><MdOutlineMailOutline/>abc@gmail.com</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><LuPhone />+91123456789</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><SlCalender />12-02-2024</span></td>

              </tr>
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-0 py-2">
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[55px] h-[55px] overflow-hidden group rounded-md">
                      <Link to="/product/47646">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          alt=""
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Abc Xyz</td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><MdOutlineMailOutline/>abc@gmail.com</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><LuPhone />+91123456789</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><SlCalender />12-02-2024</span></td>

              </tr>
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" />
                  </div>
                </td>

                <td className="px-0 py-2">
                  <div className="flex items-center gap-4 w-[80px]">
                    <div className="img w-[55px] h-[55px] overflow-hidden group rounded-md">
                      <Link to="/product/47646">
                        <img
                          src="https://mui.com/static/images/avatar/1.jpg"
                          alt=""
                          className="w-full group-hover:scale-105 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-2">Abc Xyz</td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><MdOutlineMailOutline/>abc@gmail.com</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><LuPhone />+91123456789</span></td>

                <td className="px-6 py-2"><span className="flex items-center gap-2"><SlCalender />12-02-2024</span></td>

              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end pt-4 px-4 pb-4">
          <Pagination count={10} color="primary" />
        </div>
      </div>
    </>
  );
};

export default Users;
