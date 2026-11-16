import React, { useState, useEffect, useContext } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
import Button from "@mui/material/Button";
import { RiFolderUploadFill } from "react-icons/ri";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { CircularProgress } from "@mui/material";
import { getData, postData } from "../../utils/api";
import { MyContext } from "../../App";

const AddThirdCategory = () => {
    const [productCategory, setProductCategory] = useState("");
    const [parentSubCategory, setParentSubCategory] = useState("");
    const [thirdCatInputs, setThirdCatInputs] = useState([{ id: Date.now(), name: "" }]);
    const [categoryData, setCategoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(MyContext);

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

    const handleChangeProductCategory = (event) => {
        setProductCategory(event.target.value);
        setParentSubCategory(""); // Reset 2nd level dropdown on main flip
    };

    const handleChangeParentSubCategory = (event) => {
        setParentSubCategory(event.target.value);
    };

    const handleAddInput = () => {
        setThirdCatInputs([...thirdCatInputs, { id: Date.now(), name: "" }]);
    };

    const handleRemoveInput = (id) => {
        if (thirdCatInputs.length === 1) return;
        setThirdCatInputs(thirdCatInputs.filter((input) => input.id !== id));
    };

    const handleInputChange = (id, value) => {
        const updatedInputs = thirdCatInputs.map((input) =>
            input.id === id ? { ...input, name: value } : input
        );
        setThirdCatInputs(updatedInputs);
    };

    const handleAddThirdCategory = async (e) => {
        e.preventDefault();

        if (productCategory === "") {
            context.openAlertBox("error", "Please select a main Product Category");
            return;
        }

        if (parentSubCategory === "") {
            context.openAlertBox("error", "Please select a Parent Sub Category");
            return;
        }

        // Filter out empty names
        const validInputs = thirdCatInputs.filter((input) => input.name.trim() !== "");

        if (validInputs.length === 0) {
            context.openAlertBox("error", "Please provide at least one Third Level Category name");
            return;
        }

        setIsLoading(true);

        const mainCatObj = categoryData.find((cat) => cat._id === productCategory);
        const selectedParentCat = mainCatObj?.children?.find((c) => c._id === parentSubCategory);

        try {
            const promises = validInputs.map((input) => {
                const payload = {
                    name: input.name,
                    images: [],
                    parentCatName: selectedParentCat?.name,
                    parentCatId: selectedParentCat?._id,
                };
                return postData("/api/category/createcat", payload, { withCredentials: true });
            });

            const results = await Promise.all(promises);

            // Check if any failed
            const hasError = results.some((res) => !res?.success);

            setIsLoading(false);

            if (hasError) {
                context.openAlertBox("error", "Some third level categories failed to add. Please try again.");
            } else {
                context.openAlertBox("success", "Third Level Categories Added Successfully");
                setProductCategory("");
                setParentSubCategory("");
                setThirdCatInputs([{ id: Date.now(), name: "" }]);
                context.setIsOpenFullScreenPanel({
                    open: false,
                });
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
                <form onSubmit={handleAddThirdCategory} className="form py-3 p-8">
                    <div className="max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                        <div className="grid grid-cols-1 mb-3 gap-5">
                            <div className="col w-[50%]">
                                <h3 className="text-[14px] font-[500] mb-1">
                                    Product Category
                                </h3>
                                <Select
                                    id="productCatDropdown"
                                    className="w-full bg-[#fafafa]"
                                    size="small"
                                    value={productCategory}
                                    onChange={handleChangeProductCategory}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>Select Main Category</em>
                                    </MenuItem>
                                    {categoryData?.map((cat, index) => (
                                        <MenuItem key={index} value={cat._id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>

                                <div className="mt-4">
                                    <h3 className={`text-[14px] font-[500] mb-1 ${(!productCategory || categoryData.find((c) => c._id === productCategory)?.children?.length === 0) ? 'text-gray-400' : ''}`}>
                                        Parent Sub Category
                                    </h3>
                                    <Select
                                        id="parentSubCatDropdown"
                                        className="w-full bg-[#fafafa]"
                                        size="small"
                                        value={parentSubCategory}
                                        onChange={handleChangeParentSubCategory}
                                        displayEmpty
                                        disabled={!productCategory || categoryData.find((c) => c._id === productCategory)?.children?.length === 0}
                                    >
                                        <MenuItem value="">
                                            <em>Select Sub Category</em>
                                        </MenuItem>
                                        {categoryData?.find((c) => c._id === productCategory)?.children?.map((subCat, index) => (
                                            <MenuItem key={index} value={subCat._id}>
                                                {subCat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className="col w-[50%]">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[14px] font-[500] mb-0">Third Level Category Names</h3>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={handleAddInput}
                                        className="!capitalize !text-green-600"
                                    >
                                        + Add More
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {thirdCatInputs.map((input, index) => (
                                        <div key={input.id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={input.name}
                                                onChange={(e) => handleInputChange(input.id, e.target.value)}
                                                placeholder="Enter third level category name..."
                                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                            />
                                            {thirdCatInputs.length > 1 && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleRemoveInput(input.id)}
                                                    className="!min-w-[40px] !h-[40px] !p-0"
                                                >
                                                    X
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                            <>
                                <RiFolderUploadFill className="text-[25px] text-white" />
                                Add Third Level Categories
                            </>
                        )}
                    </Button>
                </form>
            </section>
        </div>
    );
};

export default AddThirdCategory;
