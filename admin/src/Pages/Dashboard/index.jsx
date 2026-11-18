import React, { useState } from "react";
import DashboardBoxes from "../../Components/DashboardBoxes";
import { MdWavingHand } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import Button from "@mui/material/Button";
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";
import AdminBadge from "../../Components/AdminBadge";
import OrdersTable from "../../Components/OrdersTable";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Progress from "../../Components/ProgressBar";
import { BiEditAlt } from "react-icons/bi";
import { CgEye } from "react-icons/cg";
import { RiDeleteBin6Line } from "react-icons/ri";
import TooltipMUI from "@mui/material/Tooltip";
import Pagination from "@mui/material/Pagination";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { HiOutlinePlusSm } from "react-icons/hi";
import { MyContext } from "../../App";
import { useContext, useEffect } from "react";
import { getData, deleteData } from "../../utils/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Dashboard = () => {
  const [isOpenOrderedProduct, setIsOpenOrderedProduct] = useState(null);

  const isShowOrderedProduct = (index) => {
    if (isOpenOrderedProduct === index) {
      setIsOpenOrderedProduct(null);
    } else {
      setIsOpenOrderedProduct(index);
    }
  };

  const context = useContext(MyContext);

  const [categoryFilterValue, isCategoryFilterValue] = useState("");
  const [productList, setProductList] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    getData("/api/category").then((res) => {
      if (res?.success) {
        setCategoryData(res?.data);
      }
    });
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilterValue]);

  const fetchProducts = () => {
    let url = `/api/product?page=${page}&perPage=8`;
    if (categoryFilterValue !== "") {
      url += `&category=${categoryFilterValue}`;
    }

    getData(url).then((res) => {
      if (res?.success) {
        setProductList(res?.products);
        setTotalPages(res?.totalPages);
      }
    });
  };

  const deleteProductItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const res = await deleteData(`/api/product/deleteproduct/${id}`);
      if (res?.success) {
        context.openAlertBox("success", "Product deleted successfully");
        fetchProducts();
      } else {
        context.openAlertBox("error", res?.message || "Failed to delete product");
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // ── Dashboard stats + chart ──
  const [stats, setStats] = useState(null);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState("Total_Sales"); // ya "Total_Users"

  useEffect(() => {
    getData(`/api/order/dashboard-stats?year=${chartYear}`).then((res) => {
      if (res?.error === false) setStats(res.data);
    });
  }, [chartYear]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleChangeCatFilter = (event) => {
    isCategoryFilterValue(event.target.value);
  };

  return (
    <>
      <div className="w-full bg-[#f1faff] py-2 px-5 border border-[rgba(0,0,0,0.1)] flex items-center mb-5 rounded-md justify-between">
        <div className="info">
          <h1 className="text-[35px] font-bold leading-10 mb-3">
            Good Morning,
            <br />
            Admin <MdWavingHand className="text-[#f5ec3f] inline" />
          </h1>
          <p>
            Here’s What happening on your store today. See the statistics at
            once.
          </p>
          <br />
          <br />
          <Button
            className="btn-blue !capitalize"
            onClick={() =>
              context.setIsOpenFullScreenPanel({
                open: true,
                model: "Add Product",
              })
            }
          >
            <FaPlus />
            Add Product
          </Button>
        </div>

        <img src="/shop-illustration.webp" alt="" className="w-[250px]" />
      </div>
      <DashboardBoxes stats={stats} />

      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-[18px] font-[600]">Products</h2>
        </div>

        <div className="flex items-center justify-between w-full pl-5 pr-5">
          <div className="col w-[20%]">
            <h4 className="text-[15px] font-[600] mb-2">Category By</h4>

            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel id="demo-simple-select-helper-label">
                Category
              </InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={categoryFilterValue}
                label="Category"
                onChange={handleChangeCatFilter}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {categoryData.length > 0 && categoryData.map((cat, index) => (
                  <MenuItem key={index} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="col w-[32%] ml-auto flex items-center gap-3">
            <Button className="btn-blue !bg-green-600 btn-sm">
              <AiOutlineCloudDownload className="text-[#fff] font-bold text-[24px]" />
              Export
            </Button>
            <Button className="btn-blue btn-sm">
              <HiOutlinePlusSm className="text-[#fff] font-bold text-[24px]" />
              Add Product
            </Button>
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
                  Product
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  sub-category
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {productList?.length > 0 ? (
                productList.map((product, index) => (
                  <tr key={index} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                    <td className="px-6 pr-0 py-2">
                      <div className="w-[60px]">
                        <Checkbox {...label} size="small" />
                      </div>
                    </td>

                    <td className="px-0 py-2">
                      <div className="flex items-center gap-4 w-[250px]">
                        <div className="img w-[65px] h-[65px] overflow-hidden group rounded-md p-1 border bg-white">
                          <Link to={`/product/${product._id}`}>
                            <img
                              src={product.images?.length > 0 ? product.images[0] : "https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp"}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-all"
                            />
                          </Link>
                        </div>

                        <div className="info w-[75%]">
                          <h3 className="font-[600] text-[15px] leading-5 hover:text-primary">
                            <Link to={`/product/${product._id}`}>{product.name}</Link>
                          </h3>
                          <span className="text-[13px] text-gray-400">{product.brand || "No Brand"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-2">{product.catId?.name || product.catName || "N/A"}</td>

                    <td className="px-6 py-2">{product.subCat || "N/A"}</td>

                    <td className="px-6 py-2">
                      <div className="flex items-center gap-1 flex-col">
                        <span className="oldPrice line-through text-gray-500 text-[13px] font-[500]">
                          {product.oldprice ? `Rs ${product.oldprice}` : "-"}
                        </span>
                        <span className="price text-primary text-[14px] font-[600]">
                          Rs {product.price}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-2">
                      <p className="text-[14px] w-[100px]">
                        <span className="font-[600]">{product.countInStock}</span> Items
                      </p>
                      <Progress value={product.countInStock > 0 ? 100 : 0} type={product.countInStock > 0 ? "success" : "error"} />
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <TooltipMUI title="Edit Product" placement="bottom-start">
                          <Button onClick={() => context.setIsOpenFullScreenPanel({
                            open: true,
                            model: "Edit Product",
                            data: product
                          })} className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]">
                            <BiEditAlt className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>

                        <TooltipMUI
                          title="View Product Details"
                          placement="bottom-start"
                        >
                          <Button onClick={() => context.setIsOpenFullScreenPanel({
                            open: true,
                            model: "View Product",
                            data: product
                          })} className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]">
                            <CgEye className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>

                        <TooltipMUI title="Remove Product" placement="bottom-start">
                          <Button onClick={() => deleteProductItem(product._id)} className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]">
                            <RiDeleteBin6Line className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 font-semibold text-gray-500">
                    No Products Found
                  </td>
                </tr>
              )}
            </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end pt-4 px-4 pb-4">
        <Pagination
          count={totalPages || 1}
          page={page}
          color="primary"
          onChange={handlePageChange}
        />
      </div>
    </div >

      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-[18px] font-[600]">Recent Orders</h2>
          <Link to="/orders" className="text-primary text-[14px] font-[500]">View all</Link>
        </div>
        <OrdersTable limit={5} />
      </div>

      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5 pb-0">
          <h2 className="text-[18px] font-[600]">Total Users & Total Sales</h2>
        </div>

        <div className="flex items-center justify-between gap-5 px-5 py-5 pt-3">
          <div className="flex items-center gap-5">
            <span onClick={() => setChartType("Total_Users")}
              className={`flex items-center gap-1 text-[15px] cursor-pointer ${chartType === "Total_Users" ? "font-[600]" : "opacity-60"}`}>
              <span className="block w-[8px] h-[8px] rounded-full bg-[#3278fa]"></span>
              Total Users
            </span>
            <span onClick={() => setChartType("Total_Sales")}
              className={`flex items-center gap-1 text-[15px] cursor-pointer ${chartType === "Total_Sales" ? "font-[600]" : "opacity-60"}`}>
              <span className="block w-[8px] h-[8px] rounded-full bg-[#10b981]"></span>
              Total Sales
            </span>
          </div>
          <Select size="small" value={chartYear} onChange={(e) => setChartYear(e.target.value)} className="w-[110px]">
            {yearOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </div>
        <div className="w-full h-[450px] px-2 pb-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.monthly || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false}
                tickFormatter={(v) => chartType === "Total_Sales" ? "₹" + Number(v).toLocaleString("en-IN") : v} />
              <Tooltip formatter={(v) => chartType === "Total_Sales"
                ? Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : v} />
              <Legend />
              <Bar dataKey={chartType} name={chartType === "Total_Sales" ? "Total Sales" : "Total Users"}
                fill={chartType === "Total_Sales" ? "#10b981" : "#3278fa"} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
