import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import React, { useContext, useEffect, useState } from "react";
import { HiOutlinePlusSm } from "react-icons/hi";
import TooltipMUI from "@mui/material/Tooltip";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BiEditAlt } from "react-icons/bi";
import { MyContext } from "../../App";
import { getData, deleteData, postData } from "../../utils/api";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const BlogList = () => {
  const [blogList, setBlogList] = useState([]);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const Context = useContext(MyContext);

  useEffect(() => {
    fetchBlogs();
  }, [Context.refetchBlogs]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    const res = await getData("/api/blog");
    if (res?.error === false) {
      setBlogList(res?.data || []);
    }
    setIsLoading(false);
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    const res = await deleteData(`/api/blog/${id}`);
    if (res?.error === false) {
      Context.openAlertBox("success", "Blog deleted successfully");
      setSelectedBlogs((prev) => prev.filter((bid) => bid !== id));
      fetchBlogs();
    } else {
      Context.openAlertBox("error", res?.message || "Failed to delete blog");
    }
  };

  const deleteMultipleBlogs = async () => {
    if (selectedBlogs.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedBlogs.length} selected blogs?`)) return;
    const res = await postData(`/api/blog/delete-multiple`, { ids: selectedBlogs });
    if (res?.error === false) {
      Context.openAlertBox("success", "Selected blogs deleted successfully");
      setSelectedBlogs([]);
      fetchBlogs();
    } else {
      Context.openAlertBox("error", res?.message || "Failed to delete selected blogs");
    }
  };

  const selectAll = (e) => {
    setSelectedBlogs(e.target.checked ? blogList.map((b) => b._id) : []);
  };

  const selectOne = (e, id) => {
    setSelectedBlogs((prev) => (e.target.checked ? [...prev, id] : prev.filter((bid) => bid !== id)));
  };

  return (
    <div className="card my-4 shadow-md sm:rounded-lg bg-white">
      <div className="flex items-center justify-between px-5 py-5">
        <h2 className="text-[18px] font-[600]">Blog List</h2>
        <div className="col w-auto ml-auto flex items-center justify-end gap-3 flex-wrap">
          {selectedBlogs.length > 0 && (
            <Button className="btn-blue !bg-red-600 btn-sm whitespace-nowrap" onClick={deleteMultipleBlogs}>
              <RiDeleteBin6Line className="text-[#fff] font-bold text-[20px] mr-1" />
              Delete Selected ({selectedBlogs.length})
            </Button>
          )}
          <Button
            className="btn-blue btn-sm whitespace-nowrap"
            onClick={() => Context.setIsOpenFullScreenPanel({ open: true, model: "Add Blog" })}
          >
            <HiOutlinePlusSm className="text-[#fff] font-bold text-[24px] mr-1" />
            Add Blog
          </Button>
        </div>
      </div>

      <div className="relative mt-5 pb-5 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 pr-0 py-3" width="10%">
                <div className="w-[60px]">
                  <Checkbox {...label} size="small"
                    checked={blogList.length > 0 && selectedBlogs.length === blogList.length}
                    onChange={selectAll} />
                </div>
              </th>
              <th scope="col" className="px-0 py-3 whitespace-nowrap">Image</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Title</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Description</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {blogList.map((item) => (
              <tr key={item._id} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
                <td className="px-6 pr-0 py-2">
                  <div className="w-[80px]">
                    <Checkbox {...label} size="small"
                      checked={selectedBlogs.includes(item._id)}
                      onChange={(e) => selectOne(e, item._id)} />
                  </div>
                </td>
                <td className="px-0 py-2">
                  <div className="w-[200px] overflow-hidden rounded-md group">
                    <img src={item?.images?.[0]} alt="blog"
                      className="w-full max-h-[100px] object-cover transition-all group-hover:scale-105" />
                  </div>
                </td>
                <td className="px-6 py-2 text-black font-[500] min-w-[200px]">{item.title}</td>
                <td className="px-6 py-2 min-w-[300px]">
                  {item.description?.length > 120 ? item.description.substr(0, 120) + "..." : item.description}
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <TooltipMUI title="Edit Blog" placement="bottom-start">
                      <Button
                        className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                        onClick={() => Context.setIsOpenFullScreenPanel({ open: true, model: "Edit Blog", data: item })}
                      >
                        <BiEditAlt className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                      </Button>
                    </TooltipMUI>
                    <TooltipMUI title="Remove Blog" placement="bottom-start">
                      <Button
                        className="!w-[35px] !h-[35px] !min-w-[35px] !border !border-[rgb(0,0,0,0.2)] hover:!bg-[#ccc] !rounded-md bg-[#f1f1f1]"
                        onClick={() => deleteBlog(item._id)}
                      >
                        <RiDeleteBin6Line className="text-[rgb(0,0,0,0.7)] text-[24px]" />
                      </Button>
                    </TooltipMUI>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && blogList.length === 0 && (
          <div className="p-4 text-center text-gray-500">No Blogs Found</div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
