import React, { useState, useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { CircularProgress, MenuItem, Select } from "@mui/material";
import { RiFolderUploadFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { postData, getData, deleteData } from "../../utils/api";
import { MyContext } from "../../App";

const AddProductWeight = () => {
    const [weightValue, setWeightValue] = useState("");
    const [weightUnit, setWeightUnit] = useState("kg");
    const [isLoading, setIsLoading] = useState(false);
    const [weightList, setWeightList] = useState([]);
    const context = useContext(MyContext);

    useEffect(() => {
        fetchWeights();
    }, []);

    const fetchWeights = async () => {
        try {
            const res = await getData("/api/productWeight");
            if (res?.success) {
                setWeightList(res?.data || []);
            }
        } catch (error) {
            console.log("Error fetching Weights", error);
        }
    }

    const handleAddWeight = async (e) => {
        e.preventDefault();
        if (weightValue === "") {
            context.openAlertBox("error", "Weight value is required");
            return;
        }

        const name = `${weightValue}${weightUnit}`;
        setIsLoading(true);
        try {
            const res = await postData("/api/productWeight/create", { name }, {
                withCredentials: true,
            });

            if (res?.success) {
                context.openAlertBox("success", "Product Weight Added Successfully");
                setWeightValue("");
                setWeightUnit("kg");
                fetchWeights();
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

    const handleDeleteWeight = async (id) => {
        try {
            const res = await deleteData(`/api/productWeight/${id}`);
            if (res?.success) {
                context.openAlertBox("success", "Product Weight Deleted Successfully");
                fetchWeights();
            } else {
                context.openAlertBox("error", res?.message || "Failed to delete Weight");
            }
        } catch (error) {
            console.log(error);
            context.openAlertBox("error", "Server Error");
        }
    }

    return (
        <div className="flex gap-4 p-5 h-full">
            <div className="w-[40%] bg-white p-5 rounded-md shadow-sm border border-[rgba(0,0,0,0.1)]">
                <h2 className="text-[20px] font-[600] mb-4">Add Product Weight</h2>
                <form onSubmit={handleAddWeight} className="form flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="w-full">
                            <h3 className="text-[14px] font-[500] mb-1">Value</h3>
                            <input
                                type="number"
                                name="weightValue"
                                value={weightValue}
                                onChange={(e) => setWeightValue(e.target.value)}
                                placeholder="e.g. 1"
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                            />
                        </div>
                        <div className="w-[100px] shrink-0">
                            <h3 className="text-[14px] font-[500] mb-1">Unit</h3>
                            <Select
                                value={weightUnit}
                                onChange={(e) => setWeightUnit(e.target.value)}
                                size="small"
                                className="w-full h-[40px] bg-[#fafafa]"
                            >
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="kg">kg</MenuItem>
                                <MenuItem value="oz">oz</MenuItem>
                                <MenuItem value="lb">lb</MenuItem>
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
                                <span className="ml-2">Add Weight</span>
                            </>
                        )}
                    </Button>
                </form>
            </div>

            <div className="w-[60%] bg-white p-5 rounded-md shadow-sm border border-[rgba(0,0,0,0.1)]">
                <h2 className="text-[20px] font-[600] mb-4">Weight List</h2>
                <div className="max-h-[60vh] overflow-y-auto">
                    {weightList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {weightList.map((weight, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-[rgba(0,0,0,0.1)] rounded-md bg-[#fafafa]">
                                    <span className="font-[500]">{weight.name}</span>
                                    <button
                                        onClick={() => handleDeleteWeight(weight._id)}
                                        className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-all"
                                    >
                                        <FaTrash className="text-[14px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No Weight options added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProductWeight;
