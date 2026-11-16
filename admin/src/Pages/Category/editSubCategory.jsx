import React, { useState, useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { putData, getData } from "../../utils/api";
import { MyContext } from "../../App";

const EditSubCategory = ({ data }) => {
    const [parentCatId, setParentCatId] = useState(data?.parentCatId || "");
    const [subCatName, setSubCatName] = useState(data?.name || "");
    const [categoryData, setCategoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(MyContext);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        // Fetch all current top-level categories for the dropdown selector
        getData("/api/category").then((res) => {
            if (res?.success) {
                setCategoryData(res?.data);
            }
        });
    };

    const handleEditSubCategory = async (e) => {
        e.preventDefault();

        if (parentCatId === "") {
            context.openAlertBox("error", "Please select a parent category");
            return;
        }

        if (subCatName.trim() === "") {
            context.openAlertBox("error", "Sub Category name is required");
            return;
        }

        setIsLoading(true);

        const selectedCat = categoryData.find((cat) => cat._id === parentCatId);

        const payload = {
            name: subCatName,
            parentCatName: selectedCat?.name || data?.parentCatName,
            parentCatId: parentCatId,
        };

        try {
            const res = await putData(`/api/category/${data?._id}`, payload, {
                withCredentials: true,
            });

            setIsLoading(false);

            if (res?.success) {
                context.openAlertBox("success", "Sub Category Updated Successfully");
                context.setIsOpenFullScreenPanel({
                    open: false,
                });
            } else {
                context.openAlertBox("error", res?.message || "Something went wrong");
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            context.openAlertBox("error", "Server Error");
        }
    };

    return (
        <div>
            <section className="pt-5">
                <form onSubmit={handleEditSubCategory} className="form py-3 p-8">
                    <div className="max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                        <h3 className="text-[14px] font-[500] mb-1">Parent Category</h3>
                        <div className="grid grid-cols-1 mb-5">
                            <div className="col w-full">
                                <select
                                    value={parentCatId}
                                    onChange={(e) => setParentCatId(e.target.value)}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                >
                                    <option value="">Select Category</option>
                                    {categoryData?.length > 0 &&
                                        categoryData.map((cat, index) => (
                                            <option key={index} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 mb-3">
                            <div className="col w-full">
                                <h3 className="text-[14px] font-[500] mb-1">Sub Category Name</h3>
                                <input
                                    type="text"
                                    value={subCatName}
                                    onChange={(e) => setSubCatName(e.target.value)}
                                    placeholder="Enter Sub Category..."
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>
                    </div>

                    <br />
                    <hr />
                    <br />

                    <Button
                        type="submit"
                        className="btn-blue btn-lg w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            <span>Update Sub Category</span>
                        )}
                    </Button>
                </form>
            </section>
        </div>
    );
};

export default EditSubCategory;
