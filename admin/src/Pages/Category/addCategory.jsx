import React, { useState, useContext } from "react";
import UploadBox from "../../Components/UploadBox";
import { IoClose } from "react-icons/io5";
import Button from "@mui/material/Button";
import { RiFolderUploadFill } from "react-icons/ri";
import { CircularProgress } from "@mui/material";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";

const AddCategory = () => {
  const [formFields, setFormFields] = useState({ name: "" });
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(MyContext);

  const onChangeInput = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

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
    setPreviews([newPreview]); // Replace old array with new 1-item array
    setSelectedFiles([file]);
  };

  const removeImage = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    setSelectedFiles(updatedFiles);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (formFields.name === "") {
      context.openAlertBox("error", "Category name is required");
      return;
    }

    setIsLoading(true);

    try {
      // If files exist, first upload them to the backend
      if (selectedFiles.length > 0) {
        const formdata = new FormData();
        for (let file of selectedFiles) {
          formdata.append("images", file);
        }

        const uploadRes = await postData("/api/category/upload-images", formdata, {
          withCredentials: true,
        });

        if (uploadRes?.error) {
          context.openAlertBox("error", uploadRes.message || "Image upload failed");
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        name: formFields.name,
        // The backend automatically uses the globally set imagesArr from uploadImages
        parentCatName: null,
        parentCatId: null,
      };

      const res = await postData("/api/category/createcat", payload, {
        withCredentials: true,
      });

      if (res?.success) {
        context.openAlertBox("success", "Category Added Successfully");
        setFormFields({ name: "" });
        setPreviews([]);
        setSelectedFiles([]);
        context.setIsOpenFullScreenPanel({
          open: false,
        });
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

  return (
    <div>
      <section className="pt-5">
        <form onSubmit={handleAddCategory} className="form py-3 p-8">
          <div className="max-h-[72vh] overflow-y-scroll pr-4 pt-4">
            <div className="grid grid-cols-1 mb-3">
              <div className="col w-[50%]">
                <h3 className="text-[18px] font-[600] mb-1">Category Name</h3>
                <input
                  type="text"
                  name="name"
                  value={formFields.name}
                  onChange={onChangeInput}
                  className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                />
              </div>
            </div>

            <br />

            <h3 className="text-[18px] font-[600] mb-1">Category Image</h3>

            <div className="grid grid-cols-7 gap-4">
              {previews?.length > 0 &&
                previews.map((img, index) => (
                  <div key={index} className="uploadBoxWrapper relative">
                    <span
                      onClick={() => removeImage(index)}
                      className="absolute -top-[8px] -right-[8px] z-50 flex items-center justify-center w-[18px] h-[18px] rounded-full overflow-hidden bg-red-700 cursor-pointer"
                    >
                      <IoClose className="text-white text-[18px]" />
                    </span>

                    <div className="flex flex-col items-center justify-center relative uploadbox rounded-sm overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-full bg-gray-100 cursor-pointer hover:bg-gray-200">
                      <img
                        className="w-full h-full object-cover"
                        alt={"image"}
                        src={img}
                      />
                    </div>
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
                Upload and View
              </>
            )}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default AddCategory;
