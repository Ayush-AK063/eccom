import React, { useState, useContext, useEffect } from "react";
import UploadBox from "../../Components/UploadBox";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { IoClose } from "react-icons/io5";
import Button from "@mui/material/Button";
import { RiFolderUploadFill } from "react-icons/ri";
import { CircularProgress, TextField } from "@mui/material";
import { postData, putData } from "../../utils/api";
import { MyContext } from "../../App";

// Add aur Edit dono ke liye ek hi form. `data` ho to Edit mode.
const BlogForm = ({ data }) => {
  const isEdit = Boolean(data?._id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [oldImages, setOldImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);

  useEffect(() => {
    if (data) {
      setTitle(data.title || "");
      setDescription(data.description || "");
      setOldImages(data.images || []);
    }
  }, [data]);

  const onChangeFile = (e) => {
    const files = Array.from(e.target.files);
    setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeOldImg = (index) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImg = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim() === "") {
      context.openAlertBox("error", "Please enter blog title");
      return;
    }
    if (description.trim() === "") {
      context.openAlertBox("error", "Please enter blog description");
      return;
    }
    if (oldImages.length + selectedFiles.length === 0) {
      context.openAlertBox("error", "Please add at least one image");
      return;
    }

    setIsLoading(true);
    try {
      let uploaded = [];
      if (selectedFiles.length > 0) {
        const formdata = new FormData();
        selectedFiles.forEach((file) => formdata.append("images", file));
        const uploadRes = await postData("/api/blog/upload-images", formdata, { withCredentials: true });
        if (uploadRes?.error || !uploadRes?.images) {
          context.openAlertBox("error", uploadRes?.message || "Image upload failed");
          return;
        }
        uploaded = uploadRes.images;
      }

      const payload = { title, description, images: [...oldImages, ...uploaded] };
      const res = isEdit
        ? await putData(`/api/blog/${data._id}`, payload, { withCredentials: true })
        : await postData("/api/blog/create", payload, { withCredentials: true });

      if (res?.error === false) {
        context.openAlertBox("success", res?.message || "Saved");
        context.setIsOpenFullScreenPanel({ open: false });
        context.setRefetchBlogs((prev) => !prev);
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

  const imageBox = (src, onRemove, key) => (
    <div key={key} className="uploadBoxWrapper relative">
      <span
        onClick={onRemove}
        className="absolute -top-[8px] -right-[8px] z-50 flex items-center justify-center w-[18px] h-[18px] rounded-full overflow-hidden bg-red-700 cursor-pointer shadow-md"
      >
        <IoClose className="text-white text-[14px]" />
      </span>
      <div className="flex flex-col items-center justify-center relative uploadbox rounded-sm overflow-hidden border border-solid border-[rgba(0,0,0,0.2)] h-[150px] w-full bg-white">
        <LazyLoadImage className="w-full h-full object-contain p-1" effect="blur" alt="blog" src={src} />
      </div>
    </div>
  );

  return (
    <section className="pt-5">
      <form onSubmit={handleSubmit} className="form py-3 p-8">
        <div className="grid grid-cols-1 gap-5 mb-5">
          <TextField fullWidth label="Blog Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <h3 className="text-[16px] font-[600] mb-3">Blog Images</h3>
        <div className="grid grid-cols-7 gap-4">
          {oldImages.map((img, index) => imageBox(img, () => removeOldImg(index), `old-${index}`))}
          {previews.map((img, index) => imageBox(img, () => removeNewImg(index), `new-${index}`))}
          <UploadBox multiple={true} onChange={onChangeFile} />
        </div>

        <br />
        <hr />
        <br />
        <Button type="submit" className="btn-blue btn-lg w-full" disabled={isLoading}>
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <RiFolderUploadFill className="text-[25px] text-white" />
              <span className="ml-2">{isEdit ? "Update Blog" : "Publish Blog"}</span>
            </>
          )}
        </Button>
      </form>
    </section>
  );
};

export default BlogForm;
