import React, { useState, useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { RiFolderUploadFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { postData, getData, deleteData } from "../../utils/api";
import { MyContext } from "../../App";

const AddProductSize = () => {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sizeList, setSizeList] = useState([]);
    const context = useContext(MyContext);

    useEffect(() => {
        fetchSizes();
    }, []);

    const fetchSizes = async () => {
        try {
            const res = await getData("/api/productSize");
            if (res?.success) {
                setSizeList(res?.data || []);
            }
        } catch (error) {
            console.log("Error fetching Sizes", error);
        }
    }

    const handleAddSize = async (e) => {
        e.preventDefault();
        if (name === "") {
            context.openAlertBox("error", "Size value is required");
            return;
        }
        setIsLoading(true);
        try {
            const res = await postData("/api/productSize/create", { name }, {
                withCredentials: true,
            });

            if (res?.success) {
                context.openAlertBox("success", "Product Size Added Successfully");
                setName("");
                fetchSizes();
            } else {
                context.openAlertBox("error", res?.message || "Something went wrong");
            }
        } catch (error) {
            console.log(error);
            context.openAlertBox("error", "Server Error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSize = async (id) => {
        try {
            const res = await deleteData(`/api/productSize/${id}`);
            if (res?.success) {
                context.openAlertBox("success", "Product Size Deleted Successfully");
                fetchSizes();
            } else {
                context.openAlertBox("error", res?.message || "Failed to delete Size");
            }
        } catch (error) {
            console.log(error);
            context.openAlertBox("error", "Server Error");
        }
    }

    return (
        <div className="flex gap-4 p-5 h-full">
            <div className="w-[40%] bg-white p-5 rounded-md shadow-sm border border-[rgba(0,0,0,0.1)]">
                <h2 className="text-[20px] font-[600] mb-4">Add Product Size</h2>
                <form onSubmit={handleAddSize} className="form flex flex-col gap-4">
                    <div className="w-full">
                        <h3 className="text-[14px] font-[500] mb-1">Value</h3>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. XL"
                            className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="btn-blue btn-lg w-full mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            <>
                                <RiFolderUploadFill className="text-[20px] text-white" />
                                <span className="ml-2">Add Size</span>
                            </>
                        )}
                    </Button>
                </form>
            </div>

            <div className="w-[60%] bg-white p-5 rounded-md shadow-sm border border-[rgba(0,0,0,0.1)]">
                <h2 className="text-[20px] font-[600] mb-4">Size List</h2>
                <div className="max-h-[60vh] overflow-y-auto">
                    {sizeList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {sizeList.map((size, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-[rgba(0,0,0,0.1)] rounded-md bg-[#fafafa]">
                                    <span className="font-[500]">{size.name}</span>
                                    <button
                                        onClick={() => handleDeleteSize(size._id)}
                                        className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-all"
                                    >
                                        <FaTrash className="text-[14px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No Size options added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProductSize;
