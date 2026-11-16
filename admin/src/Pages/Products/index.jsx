import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import React, { useContext, useEffect, useState } from "react";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { HiOutlinePlusSm } from "react-icons/hi";
import { Link } from "react-router-dom";
import TooltipMUI from "@mui/material/Tooltip";
import { BiEditAlt } from "react-icons/bi";
import { CgEye } from "react-icons/cg";
import { RiDeleteBin6Line } from "react-icons/ri";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";
import { getData, deleteData, postData } from "../../utils/api";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Products = () => {
  const [productList, setProductList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilterValue, isCategoryFilterValue] = useState("");
  const [subCategoryFilterValue, isSubCategoryFilterValue] = useState("");
  const [thirdCategoryFilterValue, isThirdCategoryFilterValue] = useState("");

  const Context = useContext(MyContext);

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
    window.scrollTo(0, 0);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Context.isOpenFullScreenPanel, page, categoryFilterValue, subCategoryFilterValue, thirdCategoryFilterValue, searchQuery]);

  const fetchProducts = () => {
    let url = `/api/product?page=${page}&perPage=10`;
    if (categoryFilterValue !== "") {
      url += `&category=${categoryFilterValue}`;
    }
    if (subCategoryFilterValue !== "") {
      url += `&subCategory=${subCategoryFilterValue}`;
    }
    if (thirdCategoryFilterValue !== "") {
      url += `&thirdCategory=${thirdCategoryFilterValue}`;
    }
    if (searchQuery !== "") {
      url += `&search=${searchQuery}`;
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
        Context.openAlertBox("success", "Product deleted successfully");
        fetchProducts();
        setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
      } else {
        Context.openAlertBox("error", res?.message || "Failed to delete product");
      }
    }
  };

  const deleteMultipleProducts = async () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
      const res = await postData(`/api/product/delete-multiple`, { ids: selectedProducts });
      if (res?.success) {
        Context.openAlertBox("success", "Selected products deleted successfully");
        setSelectedProducts([]);
        fetchProducts();
      } else {
        Context.openAlertBox("error", res?.message || "Failed to delete selected products");
      }
    }
  };

  const selectAllProducts = (event) => {
    if (event.target.checked) {
      setSelectedProducts(productList.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const selectSingleProduct = (event, id) => {
    if (event.target.checked) {
      setSelectedProducts([...selectedProducts, id]);
    } else {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    }
  };

  const handleChangeCatFilter = (event) => {
    isCategoryFilterValue(event.target.value);
    isSubCategoryFilterValue("");
    isThirdCategoryFilterValue("");
  };

  const handleChangeSubCatFilter = (event) => {
    isSubCategoryFilterValue(event.target.value);
    isThirdCategoryFilterValue("");
  };

  const handleChangeThirdCatFilter = (event) => {
    isThirdCategoryFilterValue(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5 flex-wrap gap-4">
          <h2 className="text-[18px] font-[600]">Products</h2>
          <div className="flex items-center justify-end gap-3 flex-wrap ml-auto">
            {selectedProducts.length > 0 && (
              <Button className="btn-blue !bg-red-600 btn-sm whitespace-nowrap" onClick={deleteMultipleProducts}>
                <RiDeleteBin6Line className="text-[#fff] font-bold text-[20px] mr-1" />
                Delete Selected ({selectedProducts.length})
              </Button>
            )}
            <Button className="btn-blue !bg-green-600 btn-sm whitespace-nowrap">
              <AiOutlineCloudDownload className="text-[#fff] font-bold text-[20px] mr-1" />
              Export
            </Button>
            <Button className="btn-blue btn-sm whitespace-nowrap"
              onClick={() => Context.setIsOpenFullScreenPanel({
                open: true,
                model: "Add Product"
              })}>
              <HiOutlinePlusSm className="text-[#fff] font-bold text-[20px] mr-1" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full px-5 gap-4">
          <div className="flex items-center gap-4 w-[70%]">
            <div className="col">
              <h4 className="text-[13px] text-gray-500 font-[600] mb-1 uppercase">Category</h4>
              <FormControl sx={{ minWidth: 160 }} size="small">
                <Select
                  value={categoryFilterValue}
                  onChange={handleChangeCatFilter}
                  displayEmpty
                  className="bg-[#f1f1f1]"
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categoryData.length > 0 && categoryData.map((cat, index) => (
                    <MenuItem key={index} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col">
              <h4 className={`text-[13px] font-[600] mb-1 uppercase ${!categoryFilterValue ? 'text-gray-300' : 'text-gray-500'}`}>Sub Category</h4>
              <FormControl sx={{ minWidth: 160 }} size="small" disabled={!categoryFilterValue}>
                <Select
                  value={subCategoryFilterValue}
                  onChange={handleChangeSubCatFilter}
                  displayEmpty
                  className="bg-[#f1f1f1]"
                >
                  <MenuItem value="">
                    <em>All Sub Categories</em>
                  </MenuItem>
                  {categoryData.find((c) => c._id === categoryFilterValue)?.children?.map((subCat, index) => (
                    <MenuItem key={index} value={subCat._id}>{subCat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col">
              <h4 className={`text-[13px] font-[600] mb-1 uppercase ${!subCategoryFilterValue ? 'text-gray-300' : 'text-gray-500'}`}>Third Level</h4>
              <FormControl sx={{ minWidth: 160 }} size="small" disabled={!subCategoryFilterValue}>
                <Select
                  value={thirdCategoryFilterValue}
                  onChange={handleChangeThirdCatFilter}
                  displayEmpty
                  className="bg-[#f1f1f1]"
                >
                  <MenuItem value="">
                    <em>All Third Levels</em>
                  </MenuItem>
                  {categoryData.find((c) => c._id === categoryFilterValue)?.children?.find((sc) => sc._id === subCategoryFilterValue)?.children?.map((tCat, index) => (
                    <MenuItem key={index} value={tCat._id}>{tCat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="col w-[30%] ml-auto mt-5">
            <div className="searchBox w-full h-[40px] bg-[#f1f1f1] rounded-md relative flex items-center px-4">
              <input type="text" placeholder="Search here..." className="w-full bg-transparent outline-none text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="relative mt-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="px-6 pr-0 py-3" width="5%">
                  <div className="w-[40px]">
                    <Checkbox {...label} size="small"
                      checked={productList?.length > 0 && selectedProducts.length === productList.length}
                      onChange={selectAllProducts} />
                  </div>
                </th>
                <th scope="col" className="px-0 py-3 whitespace-nowrap">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Sub-category
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Third Level
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
                      <div className="w-[40px]">
                        <Checkbox {...label} size="small"
                          checked={selectedProducts.includes(product._id)}
                          onChange={(e) => selectSingleProduct(e, product._id)} />
                      </div>
                    </td>

                    <td className="px-0 py-2">
                      <div className="flex items-center gap-4 w-[250px]">
                        <div className="img w-[65px] h-[65px] overflow-hidden group rounded-md p-1 border">
                          <Link to={`/product/${product._id}`}>
                            {product.images?.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-all"
                              />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-[11px] text-gray-400 bg-gray-100 font-semibold text-center leading-[1] rounded-sm">No Image</span>
                            )}
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

                    <td className="px-6 py-2">{product.thirdSubCat || "N/A"}</td>

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
                      <p className="text-[14px]">
                        <span className="font-[600]">{product.countInStock}</span>
                      </p>
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <TooltipMUI title="Edit Product" placement="bottom-start">
                          <Button onClick={() => Context.setIsOpenFullScreenPanel({
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
                          <Button onClick={() => Context.setIsOpenFullScreenPanel({
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
                  <td colSpan="8" className="text-center py-5 font-semibold text-gray-500">
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
      </div>
    </>
  );
};

export default Products;
