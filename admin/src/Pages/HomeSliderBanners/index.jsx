import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import React, { useContext, useEffect, useState } from "react";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { HiOutlinePlusSm } from "react-icons/hi";
import { Link } from "react-router-dom";
import TooltipMUI from "@mui/material/Tooltip";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BiEditAlt } from "react-icons/bi";
import { CgEye } from "react-icons/cg";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";
import { getData, deleteData, postData } from "../../utils/api";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const HomeSliderBanner = () => {
  const [slideList, setSlideList] = useState([]);
  const [selectedSlides, setSelectedSlides] = useState([]);
  const Context = useContext(MyContext);

  useEffect(() => {
    fetchSlides();
  }, [Context.refetchHomeSlides]);

  const fetchSlides = async () => {
    try {
      const res = await getData("/api/homeSlide");
      if (res?.success) {
        setSlideList(res?.data || []);
      }
    } catch (error) {
      console.log("Error fetching slides", error);
    }
  };

  const deleteSlide = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this slide?")) return;
      const res = await deleteData(`/api/homeSlide/${id}`);
      if (res?.success) {
        Context.openAlertBox("success", "Slide deleted successfully");
        fetchSlides();
        setSelectedSlides(selectedSlides.filter((sid) => sid !== id));
      } else {
        Context.openAlertBox("error", res?.message || "Failed to delete slide");
      }
    } catch (error) {
      console.log("Error deleting slide", error);
      Context.openAlertBox("error", "Server Error");
    }
  };

  const deleteMultipleSlides = async () => {
    if (selectedSlides.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedSlides.length} selected slides?`)) {
      try {
        const res = await postData(`/api/homeSlide/delete-multiple`, { ids: selectedSlides });
        if (res?.success) {
          Context.openAlertBox("success", "Selected slides deleted successfully");
          setSelectedSlides([]);
          fetchSlides();
        } else {
          Context.openAlertBox("error", res?.message || "Failed to delete selected slides");
        }
      } catch (error) {
        console.log("Error deleting multiple slides", error);
        Context.openAlertBox("error", "Server Error");
      }
    }
  };

  const selectAllSlides = (event) => {
    if (event.target.checked) {
      setSelectedSlides(slideList.map((s) => s._id));
    } else {
      setSelectedSlides([]);
    }
  };

  const selectSingleSlide = (event, id) => {
    if (event.target.checked) {
      setSelectedSlides([...selectedSlides, id]);
    } else {
      setSelectedSlides(selectedSlides.filter((sid) => sid !== id));
    }
  };

  return (
    <>
      <div className="card my-4 shadow-md sm:rounded-lg bg-white">
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-[18px] font-[600]">Home Slider Banners</h2>
          <div className="col w-auto ml-auto flex items-center justify-end gap-3 flex-wrap">
            {selectedSlides.length > 0 && (
              <Button className="btn-blue !bg-red-600 btn-sm whitespace-nowrap" onClick={deleteMultipleSlides}>
                <RiDeleteBin6Line className="text-[#fff] font-bold text-[20px] mr-1" />
                Delete Selected ({selectedSlides.length})
              </Button>
            )}
            <Button className="btn-blue !bg-green-600 btn-sm whitespace-nowrap">
              <AiOutlineCloudDownload className="text-[#fff] font-bold text-[24px] mr-1" />
              Export
            </Button>
            <Button
              className="btn-blue btn-sm whitespace-nowrap"
              onClick={() =>
                Context.setIsOpenFullScreenPanel({
                  open: true,
                  model: "Add Home Slide",
                })
              }
            >
              <HiOutlinePlusSm className="text-[#fff] font-bold text-[24px] mr-1" />
              Add Home Slide
            </Button>
          </div>
        </div>

        <div className="relative mt-5 pb-5 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="px-6 pr-0 py-3" width="10%">
                  <div className="w-[60px]">
                    <Checkbox {...label} size="small"
                      checked={slideList?.length > 0 && selectedSlides.length === slideList.length}
                      onChange={selectAllSlides} />
                  </div>
                </th>
                <th scope="col" className="px-0 py-3 whitespace-nowrap">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {slideList?.length !== 0 && slideList?.map((item, index) => {
                return (
                  <tr key={index} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                    <td className="px-6 pr-0 py-2">
                      <div className="w-[80px]">
                        <Checkbox {...label} size="small"
                          checked={selectedSlides.includes(item?._id)}
                          onChange={(e) => selectSingleSlide(e, item?._id)} />
                      </div>
                    </td>

                    <td className="px-0 py-2">
                      <div className="flex justify-center items-center w-[300px] group">
                        <div className="w-full h-full overflow-hidden rounded-md flex justify-center items-center">
                          <img
                            src={item?.images[0]}
                            alt="slide"
                            className="max-w-full max-h-[100px] object-contain transition-all group-hover:scale-105"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                        {item?.type}
                      </span>
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <TooltipMUI title="Edit Slide" placement="bottom-start">
                          <Button
                            className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                            onClick={() =>
                              Context.setIsOpenFullScreenPanel({
                                open: true,
                                model: "Edit Home Slide",
                                data: item,
                              })
                            }
                          >
                            <BiEditAlt className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>

                        <TooltipMUI title="View Slide Details" placement="bottom-start">
                          <Button
                            className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                            onClick={() =>
                              Context.setIsOpenFullScreenPanel({
                                open: true,
                                model: "View Home Slide",
                                data: item,
                              })
                            }
                          >
                            <CgEye className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>

                        <TooltipMUI title="Remove Slide" placement="bottom-start">
                          <Button
                            className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                            onClick={() => deleteSlide(item?._id)}
                          >
                            <RiDeleteBin6Line className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                          </Button>
                        </TooltipMUI>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {slideList?.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No Home Slides Found
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-4 px-4 pb-4">
          <Pagination count={10} color="primary" />
        </div>
      </div>
    </>
  );
};

export default HomeSliderBanner;
