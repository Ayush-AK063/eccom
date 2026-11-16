import React, { useState, useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { CircularProgress, MenuItem, Select } from "@mui/material";
import { RiFolderUploadFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { postData, getData, deleteData } from "../../utils/api";
import { MyContext } from "../../App";

const AddProductRam = () => {
    const [ramValue, setRamValue] = useState("");
    const [ramUnit, setRamUnit] = useState("GB");
    const [isLoading, setIsLoading] = useState(false);
    const [ramList, setRamList] = useState([]);
    const context = useContext(MyContext);

    useEffect(() => {
        fetchRams();
    }, []);

    const fetchRams = async () => {
        try {
            const res = await getData("/api/productRam");
            if (res?.success) {
                setRamList(res?.data || []);
            }
        } catch (error) {
            console.log("Error fetching Rams", error);
        }
    }

    const handleAddRam = async (e) => {
        e.preventDefault();
        if (ramValue === "") {
            context.openAlertBox("error", "RAM value is required");
            return;
        }

        const name = `${ramValue}${ramUnit}`;
        setIsLoading(true);
        try {
            const res = await postData("/api/productRam/create", { name }, {
                withCredentials: true,
            });

            if (res?.success) {
                context.openAlertBox("success", "Product RAM Added Successfully");
                setRamValue("");
                setRamUnit("GB");
                fetchRams(); // Refresh list after adding
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

    const handleDeleteRam = async (id) => {
        try {
            const res = await deleteData(`/api/productRam/${id}`);
            if (res?.success) {
                context.openAlertBox("success", "Product RAM Deleted Successfully");
                fetchRams();
            } else {
                context.openAlertBox("error", res?.message || "Failed to delete RAM");
            }
        } catch (error) {
            console.log(error);
            context.openAlertBox("error", "Server Error");
        }
    }


    return (
        <div className="flex gap-4 p-5 h-full">
            {/* Left side: Form */}
            <div className="w-[40%] bg-white p-5 rounded-md shadow-sm border border-[rgba(0,0,0,0.1)]">
                <h2 className="text-[20px] font-[600] mb-4">Add Product RAM</h2>
                <form onSubmit={handleAddRam} className="form flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="w-full">
                            <h3 className="text-[14px] font-[500] mb-1">Value</h3>
                            <input
                                type="number"
                                name="ramValue"
                                value={ramValue}
                                onChange={(e) => setRamValue(e.target.value)}
                                placeholder="e.g. 8"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                            />
                        </div>
                        <div className="w-[100px] shrink-0">
                            <h3 className="text-[14px] font-[500] mb-1">Unit</h3>
                            <Select
                                value={ramUnit}
                                onChange={(e) => setRamUnit(e.target.value)}
                                size="small"
                                className="w-full h-[40px] bg-[#fafafa]"
                            >
                                <MenuItem value="KB">KB</MenuItem>
                                <MenuItem value="MB">MB</MenuItem>
                                <MenuItem value="GB">GB</MenuItem>
                                <MenuItem value="TB">TB</MenuItem>
                            </Select>
                        </div>
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
                                <span className="ml-2">Add RAM</span>
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Right side: List */}
            <div className="w-[60%] bg-white p-5 rounded-md shadow-sm border border-[rgba(0,0,0,0.1)]">
                <h2 className="text-[20px] font-[600] mb-4">RAM List</h2>
                <div className="max-h-[60vh] overflow-y-auto">
                    {ramList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {ramList.map((ram, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-[rgba(0,0,0,0.1)] rounded-md bg-[#fafafa]">
                                    <span className="font-[500]">{ram.name}</span>
                                    <button
                                        onClick={() => handleDeleteRam(ram._id)}
                                        className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-all"
                                    >
                                        <FaTrash className="text-[14px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No RAM options added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProductRam;
