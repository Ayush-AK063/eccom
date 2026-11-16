import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import React, { useContext, useEffect, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { HiOutlinePlusSm } from "react-icons/hi";
import { Link } from "react-router-dom";
import TooltipMUI from "@mui/material/Tooltip";
import { BiEditAlt } from "react-icons/bi";
import { CgEye } from "react-icons/cg";
import { RiDeleteBin6Line } from "react-icons/ri";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";
import Chip from "@mui/material/Chip";
import { getData, deleteData, postData } from "../../utils/api";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const SubCatList = () => {
  const Context = useContext(MyContext);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCategories();
  }, [Context.isOpenFullScreenPanel]);

  useEffect(() => {
    if (categoryData.length > 0 && selectedCategories.length === categoryData.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedCategories, categoryData]);

  const handleSelectCategory = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((catId) => catId !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleSelectAll = (e) => {
    setIsAllSelected(e.target.checked);
    if (e.target.checked) {
      setSelectedCategories(categoryData.map(cat => cat._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const fetchCategories = () => {
    getData("/api/category").then((res) => {
      if (res?.success) {
        // Flatten children into individual list items for easier editing/deletion
        let flattenedSubCats = [];
        res.data.forEach((parent) => {
          if (parent?.children?.length > 0) {
            parent.children.forEach((child) => {
              flattenedSubCats.push({
                ...child,
                parentCatDetails: parent // Inject parent data for easy display
              });
            });
          }
        });
        setCategoryData(flattenedSubCats);
      }
    });
  };

  const deleteSubCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this sub category?")) {
      const res = await deleteData(`/api/category/${id}`);
      if (res?.success) {
        Context.openAlertBox("success", "Sub Category deleted successfully");
        fetchCategories();
        setSelectedCategories(selectedCategories.filter(catId => catId !== id));
      } else {
        Context.openAlertBox("error", res?.message || "Failed to delete sub category");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} sub categories?`)) {
      try {
        const res = await postData(`/api/category/bulk-delete`, { ids: selectedCategories }, { withCredentials: true });
        if (res?.success) {
          Context.openAlertBox("success", res.message);
          setSelectedCategories([]);
          fetchCategories();
        } else {
          Context.openAlertBox("error", res?.message || "Failed to delete sub categories");
        }
      } catch (error) {
        console.log(error);
        Context.openAlertBox("error", "Server Error");
      }
    }
  };
  return (
    <>
      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-[18px] font-[600]">Sub Category List</h2>
          <div className="col w-[auto] ml-auto flex items-center justify-end gap-3">
            {selectedCategories.length > 0 && (
              <Button className="btn-blue !bg-red-600 btn-sm !whitespace-nowrap" onClick={handleBulkDelete}>
                <RiDeleteBin6Line className="text-[#fff] font-bold text-[24px] mr-1" />
                Delete Selected ({selectedCategories.length})
              </Button>
            )}
            <Button className="btn-blue !bg-green-600 btn-sm !whitespace-nowrap">
              <AiOutlineCloudDownload className="text-[#fff] font-bold text-[24px] mr-1" />
              Export
            </Button>
            <Button
              className="btn-blue btn-sm !whitespace-nowrap"
              onClick={() =>
                Context.setIsOpenFullScreenPanel({
                  open: true,
                  model: "Add New Sub Category",
                })
              }
            >
              <HiOutlinePlusSm className="text-[#fff] font-bold text-[24px]" />
              Add New Sub Category
            </Button>
          </div>
        </div>

        <div className="relative mt-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="px-6 pr-0 py-3" width="10%">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small" checked={isAllSelected} onChange={handleSelectAll} />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-0 py-3 whitespace-nowrap"
                  width="150px"
                >
                  Category Image
                </th>
                <th
                  scope="col"
                  className="px-0 py-3 whitespace-nowrap"
                  width="150px"
                >
                  Category Name
                </th>
                <th
                  scope="col"
                  className="px-0 py-3 whitespace-nowrap"
                  width="250px"
                >
                  Sub Category Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap"
                  width="100px"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryData?.length > 0 ? (
                categoryData.map((subCat, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                  >
                    <td className="px-6 pr-0 py-2">
                      <div className="w-[80px]">
                        <Checkbox {...label} size="small" checked={selectedCategories.includes(subCat._id)} onChange={() => handleSelectCategory(subCat._id)} />
                      </div>
                    </td>

                    <td className="px-0 py-2">
                      <div className="flex justify-center items-center w-[70px] group">
                        <div className="w-full h-full overflow-hidden rounded-md flex justify-center items-center">
                          <Link to="#">
                            <img
                              src={
                                subCat?.parentCatDetails?.images?.length > 0
                                  ? subCat.parentCatDetails.images[0]
                                  : "https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp"
                              }
                              alt=""
                              className="max-w-full max-h-full object-contain transition-all group-hover:scale-105"
                            />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td>
                      <Chip label={subCat?.parentCatDetails?.name || subCat?.parentCatName} />
                    </td>

                    <td>
                      <span className="font-semibold text-gray-800">{subCat?.name}</span>
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <TooltipMUI
                          title="Edit Sub Category"
                          placement="bottom-start"
                        >
                          <Button
                            onClick={() => Context.setIsOpenFullScreenPanel({ open: true, model: "Edit Sub Category", data: subCat })}
                            className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                          >
                            <BiEditAlt className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>

                        <TooltipMUI
                          title="Remove Sub Category"
                          placement="bottom-start"
                        >
                          <Button
                            onClick={() => deleteSubCategory(subCat._id)}
                            className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                          >
                            <RiDeleteBin6Line className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No Sub Categories Found
                  </td>
                </tr>
              )}
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

export default SubCatList;
