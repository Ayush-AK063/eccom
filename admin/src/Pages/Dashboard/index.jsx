import React, { useState } from "react";
import DashboardBoxes from "../../Components/DashboardBoxes";
import { MdWavingHand } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import Button from "@mui/material/Button";
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";
import AdminBadge from "../../Components/AdminBadge";
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
  LineChart,
  Line,
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

  const [chart1Data, setChart1Data] = useState([
    {
      name: "JAN",
      Total_Users: 4000,
      Total_Sales: 2400,
      amt: 2400,
    },
    {
      name: "FEB",
      Total_Users: 3000,
      Total_Sales: 1398,
      amt: 2210,
    },
    {
      name: "MAR",
      Total_Users: 2000,
      Total_Sales: 9800,
      amt: 2290,
    },
    {
      name: "APR",
      Total_Users: 2780,
      Total_Sales: 3908,
      amt: 2000,
    },
    {
      name: "MAY",
      Total_Users: 1890,
      Total_Sales: 4800,
      amt: 2181,
    },
    {
      name: "JUNE",
      Total_Users: 2390,
      Total_Sales: 3800,
      amt: 2500,
    },
    {
      name: "JULY",
      Total_Users: 3490,
      Total_Sales: 4300,
      amt: 2100,
    },
    {
      name: "AUG",
      Total_Users: 3490,
      Total_Sales: 4300,
      amt: 2100,
    },
    {
      name: "SEPT",
      Total_Users: 3490,
      Total_Sales: 4300,
      amt: 2100,
    },
    {
      name: "OCT",
      Total_Users: 3490,
      Total_Sales: 4300,
      amt: 2100,
    },
    {
      name: "NOV",
      Total_Users: 3490,
      Total_Sales: 4300,
      amt: 2100,
    },
    {
      name: "DEC",
      Total_Users: 3490,
      Total_Sales: 4300,
      amt: 2100,
    },
  ]);

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
      <DashboardBoxes />

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
        </div>
        <div className="relative mt-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Order Id
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Payment Id
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Phone no.
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Pincode
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Total Amount
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  User Id
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Order Status
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-gray-200">
                <td className="px-6 py-4 font-[500]">
                  <Button
                    className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                    onClick={() => {
                      isShowOrderedProduct(0);
                    }}
                  >
                    {isOpenOrderedProduct === 0 ? (
                      <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    ) : (
                      <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    )}
                  </Button>
                </td>
                <td className="px-6 py-4 font-[500]">
                  <span className="text-primary font-[700]">
                    6846a3b9228db479bb58221a
                  </span>
                </td>
                <td className="px-6 py-4 font-[500]">
                  <span className="text-primary font-[700]">jvkdnj837kjbf</span>
                </td>
                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                  Ayush martand 57
                </td>
                <td className="px-6 py-4 font-[500]">918347737397</td>
                <td className="px-6 py-4 font-[500]">
                  <span className="block w-[400px]">
                    asnnan s jc sj jbasbfuabfb j csj ccs j India
                  </span>
                </td>
                <td className="px-6 py-4 font-[500]">210001</td>
                <td className="px-6 py-4 font-[500]">45999</td>
                <td className="px-6 py-4 font-[500]">
                  ayushmartandas@gmail.com
                </td>
                <td className="px-6 py-4 font-[500]">
                  <span className="text-primary font-[700]">
                    68020c35228db479bb25633a
                  </span>
                </td>
                <td className="px-6 py-4 font-[500]">
                  <AdminBadge status="pending" />
                </td>
                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                  2025-06-09
                </td>
              </tr>

              {isOpenOrderedProduct === 0 && (
                <tr>
                  <td className="pl-28 " colSpan="6">
                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Product Id
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Product Title
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Image
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Sub Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b border-gray-200">
                          <td className="px-6 py-4 font-[500]">
                            <span className="text-gray-600">
                              6846a3b9228db479bb58221a
                            </span>
                          </td>
                          <td className="px-6 py-4 font-[500]">
                            abajjhvsvchj hjs jhvcadv....
                          </td>
                          <td className="px-6 py-4 font-[500] whitespace-nowrap">
                            <img
                              src=""
                              className="w-[40px] h-[40px] object-cover rounded-md"
                            />
                          </td>
                          <td className="px-6 py-4 font-[500]">2</td>
                          <td className="px-6 py-4 font-[500]">2000</td>
                          <td className="px-6 py-4 font-[500]">1300</td>
                        </tr>

                        <tr className="bg-white border-b border-gray-200">
                          <td className="px-6 py-4 font-[500]">
                            <span className="text-gray-600">
                              6846a3b9228db479bb58221a
                            </span>
                          </td>
                          <td className="px-6 py-4 font-[500]">
                            abajjhvsvchj hjs jhvcadv....
                          </td>
                          <td className="px-6 py-4 font-[500] whitespace-nowrap">
                            <img
                              src=""
                              className="w-[40px] h-[40px] object-cover rounded-md"
                            />
                          </td>
                          <td className="px-6 py-4 font-[500]">2</td>
                          <td className="px-6 py-4 font-[500]">2000</td>
                          <td className="px-6 py-4 font-[500]">1300</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}

              <tr className="bg-white border-b border-gray-200">
                <td className="px-6 py-4 font-[500]">
                  <Button
                    className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                    onClick={() => {
                      isShowOrderedProduct(1);
                    }}
                  >
                    {isOpenOrderedProduct === 1 ? (
                      <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    ) : (
                      <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                    )}
                  </Button>
                </td>
                <td className="px-6 py-4 font-[500]">
                  <span className="text-primary font-[700]">
                    6846a3b9228db479bb58221a
                  </span>
                </td>
                <td className="px-6 py-4 font-[500]">
                  <span className="text-primary font-[700]">jvkdnj837kjbf</span>
                </td>
                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                  Ayush martand 57
                </td>
                <td className="px-6 py-4 font-[500]">918347737397</td>
                <td className="px-6 py-4 font-[500]">
                  <span className="block w-[400px]">
                    asnnan s jc sj jbasbfuabfb j csj ccs j India
                  </span>
                </td>
                <td className="px-6 py-4 font-[500]">210001</td>
                <td className="px-6 py-4 font-[500]">45999</td>
                <td className="px-6 py-4 font-[500]">
                  ayushmartandas@gmail.com
                </td>
                <td className="px-6 py-4 font-[500]">
                  <span className="text-primary font-[700]">
                    68020c35228db479bb25633a
                  </span>
                </td>
                <td className="px-6 py-4 font-[500]">
                  <AdminBadge status="pending" />
                </td>
                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                  2025-06-09
                </td>
              </tr>

              {isOpenOrderedProduct === 1 && (
                <tr>
                  <td className="pl-28 " colSpan="6">
                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Product Id
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Product Title
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Image
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 whitespace-nowrap"
                          >
                            Sub Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b border-gray-200">
                          <td className="px-6 py-4 font-[500]">
                            <span className="text-primary">
                              6846a3b9228db479bb58221a
                            </span>
                          </td>
                          <td className="px-6 py-4 font-[500]">
                            abajjhvsvchj hjs jhvcadv....
                          </td>
                          <td className="px-6 py-4 font-[500] whitespace-nowrap">
                            <img
                              src=""
                              className="w-[40px] h-[40px] object-cover rounded-md"
                            />
                          </td>
                          <td className="px-6 py-4 font-[500]">2</td>
                          <td className="px-6 py-4 font-[500]">2000</td>
                          <td className="px-6 py-4 font-[500]">1300</td>
                        </tr>

                        <tr className="bg-white border-b border-gray-200">
                          <td className="px-6 py-4 font-[500]">
                            <span className="text-primary">
                              6846a3b9228db479bb58221a
                            </span>
                          </td>
                          <td className="px-6 py-4 font-[500]">
                            abajjhvsvchj hjs jhvcadv....
                          </td>
                          <td className="px-6 py-4 font-[500] whitespace-nowrap">
                            <img
                              src=""
                              className="w-[40px] h-[40px] object-cover rounded-md"
                            />
                          </td>
                          <td className="px-6 py-4 font-[500]">2</td>
                          <td className="px-6 py-4 font-[500]">2000</td>
                          <td className="px-6 py-4 font-[500]">1300</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5 pb-0">
          <h2 className="text-[18px] font-[600]">Total Users & Total Sales</h2>
        </div>

        <div className="flex items-center gap-5 px-5 py-5 pt-1">
          <span className="flex items-center gap-1 text-[15px]">
            <span className="block w-[8px] h-[8px] rounded-full bg-green-600"></span>
            Total Users
          </span>

          <span className="flex items-center gap-1 text-[15px]">
            <span className="block w-[8px] h-[8px] rounded-full bg-primary"></span>
            Total Sales
          </span>
        </div>
        <LineChart
          width={1000}
          height={500}
          data={chart1Data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="none" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Total_Sales"
            stroke="#8884d8"
            strokeWidth={3}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="Total_Users"
            stroke="#82ca9d"
            strokeWidth={3}
          />
        </LineChart>
      </div>
    </>
  );
};

export default Dashboard;
