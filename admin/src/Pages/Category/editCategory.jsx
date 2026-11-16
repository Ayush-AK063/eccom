import React, { useState, useContext, useEffect } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
import Button from "@mui/material/Button";
import { RiFolderUploadFill } from "react-icons/ri";
import { CircularProgress } from "@mui/material";
import { putData, postData, deleteData } from "../../utils/api";
import { MyContext } from "../../App";
import UploadBox from "../../Components/UploadBox";
import { IoIosCloseCircle } from "react-icons/io";

const EditCategory = ({ data }) => {
    const [name, setName] = useState(data?.name || "");
    const [previews, setPreviews] = useState(data?.images || []);
    const [selectedFiles, setSelectedFiles] = useState([]); // New files only
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(MyContext);

    const onChangeFile = (e) => {
        const files = Array.from(e.target.files);
        const allowedTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

        if (files.length === 0) return;

        const file = files[0];

        if (!allowedTypes.includes(file.type)) {
            context.openAlertBox(
                "error",
                "Please select a valid JPG/JPEG/PNG/WEBP image file."
            );
            return false;
        }

        const newPreview = URL.createObjectURL(file);
        setPreviews([newPreview]); // Replace old array with new 1-item array purely for local viewing
        setSelectedFiles([file]); // Track file to upload manually
    };

    const removeImage = () => {
        setPreviews([]);
        setSelectedFiles([]);
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();

        if (name.trim() === "") {
            context.openAlertBox("error", "Category name is required");
            return;
        }

        setIsLoading(true);

        let finalImages = [...(data?.images || [])]; // Fallback to existing if unchanged

        // Upload new image if user selected one
        if (selectedFiles.length > 0) {

            // 1) Delete old image from Cloudinary if one existed
            if (data?.images?.length > 0) {
                try {
                    await deleteData(`/api/category/deleteimage?img=${data.images[0]}`);
                } catch (error) {
                    console.error("Failed to delete old image:", error);
                }
            }

            const formdata = new FormData();
            formdata.append("images", selectedFiles[0]);

            try {
                const uploadRes = await postData("/api/category/upload-images", formdata, {
                    withCredentials: true,
                });

                if (uploadRes?.error) {
                    context.openAlertBox("error", uploadRes?.message || "Image upload failed");
                    setIsLoading(false);
                    return;
                }

                // Note: We don't need to assign uploadRes.images to finalImages 
                // because the backend /create or /update handles the global imagesArr automatically.
            } catch (error) {
                context.openAlertBox("error", "Image upload error");
                setIsLoading(false);
                return;
            }
        }

        const payload = {
            name: name,
            images: finalImages,
        };

        try {
            const res = await putData(`/api/category/${data?._id}`, payload, {
                withCredentials: true,
            });

            setIsLoading(false);

            if (res?.success) {
                context.openAlertBox("success", "Category Updated Successfully");
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
                <form onSubmit={handleEditCategory} className="form py-3 p-8">
                    <div className="max-h-[72vh] overflow-y-scroll pr-4 pt-4">
                        <div className="grid grid-cols-1 mb-3">
                            <div className="col w-full">
                                <h3 className="text-[14px] font-[500] mb-1">Category Name</h3>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <h3 className="text-[14px] font-[500] mb-1 mt-5">Category Image</h3>
                        <div className="uploadBox flex  items-center gap-4">
                            {previews?.length > 0 &&
                                previews.map((previewUrl, index) => (
                                    <div
                                        key={index}
                                        className="uploadBox-item w-[150px] h-[150px] bg-gray-100 rounded-md border flex items-center justify-center relative overflow-hidden group"
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <IoIosCloseCircle
                                            className="absolute top-2 right-2 text-2xl text-red-500 bg-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-10"
                                            onClick={removeImage}
                                        />
                                    </div>
                                ))}

                            <UploadBox multiple={false} name="images" onChange={onChangeFile} />
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
                                Update Category
                            </>
                        )}
                    </Button>
                </form>
            </section>
        </div>
    );
};

export default EditCategory;
