import React, { useState, useEffect, useContext } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Rating from "@mui/material/Rating";
import UploadBox from "../../Components/UploadBox";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { IoClose } from "react-icons/io5";
import Button from "@mui/material/Button";
import { RiFolderUploadFill } from "react-icons/ri";
import { CircularProgress } from "@mui/material";
import { getData, postData, putData, deleteData } from "../../utils/api";
import { MyContext } from "../../App";

const EditProduct = ({ data }) => {
  const context = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);

  const [categoryData, setCategoryData] = useState([]);
  const [ramList, setRamList] = useState([]);
  const [weightList, setWeightList] = useState([]);
  const [sizeList, setSizeList] = useState([]);

  const [formFields, setFormFields] = useState({
    name: data?.name || "",
    description: data?.description || "",
    brand: data?.brand || "",
    price: data?.price || 0,
    oldprice: data?.oldprice || 0,
    discount: data?.discount || 0,
    countInStock: data?.countInStock || 0,
    rating: data?.rating || 0,
    productFlags: data?.productFlags || [],
    productRam: data?.productRam || "",
    size: data?.size || "",
    productWeight: data?.productWeight || "",
    catId: data?.catId?._id || data?.catId || "",
    subCatId: data?.subCatId?._id || data?.subCatId || "",
    thirdSubCatId: data?.thirdSubCatId?._id || data?.thirdSubCatId || ""
  });

  const [previews, setPreviews] = useState(data?.images || []);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchRams();
    fetchWeights();
    fetchSizes();
  }, []);

  const fetchCategories = () => {
    getData("/api/category").then((res) => {
      if (res?.success) {
        setCategoryData(res?.data);
      }
    });
  };

  const fetchRams = async () => {
    try {
      const res = await getData("/api/productRam");
      if (res?.success) setRamList(res?.data || []);
    } catch (error) { console.log(error); }
  };

  const fetchWeights = async () => {
    try {
      const res = await getData("/api/productWeight");
      if (res?.success) setWeightList(res?.data || []);
    } catch (error) { console.log(error); }
  };

  const fetchSizes = async () => {
    try {
      const res = await getData("/api/productSize");
      if (res?.success) setSizeList(res?.data || []);
    } catch (error) { console.log(error); }
  };

  const handleChange = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setFormFields({ ...formFields, rating: newValue });
  };

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      const files = Array.from(e.target.files);
      const newPreviews = files.map((file) => URL.createObjectURL(file));

      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    } catch (error) {
      console.log(error);
    }
  };

  const removeImg = async (index) => {
    const imgUrl = previews[index];

    // Optimistically update PREVIEWS
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);

    // Find what to do based on URL type
    if (imgUrl.startsWith("blob:")) {
      const nonBlobCount = previews.filter(p => !p.startsWith("blob:")).length;
      const fileIndex = index - nonBlobCount;
      if (fileIndex >= 0) {
        const newFiles = [...selectedFiles];
        newFiles.splice(fileIndex, 1);
        setSelectedFiles(newFiles);
      }
    } else {
      // Fire and forget delete - don't block the UI
      deleteData(`/api/product/deleteimage?img=${imgUrl}`).catch(e => console.log(e));
    }

    setPreviews(newPreviews);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    if (formFields.name === "") {
      context.openAlertBox("error", "Product name is required");
      return;
    }
    if (formFields.catId === "") {
      context.openAlertBox("error", "Product Category is required");
      return;
    }

    setIsLoading(true);

    try {
      let uploadedImages = [];
      // 1. Upload Images First
      if (selectedFiles.length > 0) {
        const formdata = new FormData();
        for (let file of selectedFiles) {
          formdata.append("images", file);
        }

        const uploadRes = await postData("/api/product/upload-images", formdata, {
          withCredentials: true,
        });

        if (uploadRes?.error) {
          context.openAlertBox("error", uploadRes.message || "Image upload failed");
          setIsLoading(false);
          return;
        }

        uploadedImages = uploadRes.images || [];
      }

      // Extract Names from IDs for the payload
      const mainCat = categoryData.find(c => c._id === formFields.catId);
      const subCat = mainCat?.children?.find(c => c._id === formFields.subCatId);
      const thirdCat = subCat?.children?.find(c => c._id === formFields.thirdSubCatId);

      // 2. Map Payload
      const payload = {
        name: formFields.name,
        description: formFields.description,
        brand: formFields.brand,
        price: Number(formFields.price),
        oldprice: Number(formFields.oldprice),
        discount: Number(formFields.discount),
        countInStock: Number(formFields.countInStock),
        rating: Number(formFields.rating),
        productFlags: formFields.productFlags,
        productRam: formFields.productRam,
        size: formFields.size,
        productWeight: formFields.productWeight,
        catId: formFields.catId || null,
        catName: mainCat ? mainCat.name : null,
        subCatId: formFields.subCatId || null,
        subCat: subCat ? subCat.name : null,
        thirdSubCatId: formFields.thirdSubCatId || null,
        thirdSubCat: thirdCat ? thirdCat.name : null,
        images: [...previews.filter(p => !p.startsWith("blob:")), ...uploadedImages]
      };

      // 3. Edit Product
      const res = await putData(`/api/product/updateproduct/${data._id}`, payload, {
        withCredentials: true,
      });

      if (res?.success) {
        context.openAlertBox("success", "Product Updated Successfully");
        context.setIsOpenFullScreenPanel({
          open: false,
        });
      } else {
        context.openAlertBox("error", res?.message || "Product Creation Failed");
      }
    } catch (error) {
      console.log(error);
      context.openAlertBox("error", "Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="pt-5 flex-1 w-full bg-[#fbfbfb]">
      <form onSubmit={handleEditProduct} className="form py-3 p-8">
        <div className="max-h-[72vh] overflow-y-scroll pr-4 pb-4">
          <div className="grid grid-cols-1 mb-3">
            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Name</h3>
              <input
                type="text"
                name="name"
                value={formFields.name}
                onChange={handleChange}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 mb-3">
            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Description</h3>
              <textarea
                name="description"
                value={formFields.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                className="w-full h-[140px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white resize-none text-left"
              />
            </div>
          </div>

          {/* Categories Row */}
          <div className="grid grid-cols-3 mb-3 gap-4">
            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Category</h3>
              <Select
                name="catId"
                className="w-full bg-white"
                size="small"
                value={formFields.catId}
                onChange={(e) => setFormFields({ ...formFields, catId: e.target.value, subCatId: "", thirdSubCatId: "" })}
                displayEmpty
              >
                <MenuItem value=""><em>Select Main Category</em></MenuItem>
                {categoryData.map((cat, idx) => (
                  <MenuItem key={idx} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </div>

            <div className="col">
              <h3 className={`text-[14px] font-[500] mb-1 ${!formFields.catId ? 'text-gray-400' : ''}`}>Product Sub-Category</h3>
              <Select
                name="subCatId"
                className="w-full bg-white"
                size="small"
                value={formFields.subCatId}
                onChange={(e) => setFormFields({ ...formFields, subCatId: e.target.value, thirdSubCatId: "" })}
                displayEmpty
                disabled={!formFields.catId}
              >
                <MenuItem value=""><em>Select Sub Category</em></MenuItem>
                {categoryData.find((c) => c._id === formFields.catId)?.children?.map((subCat, idx) => (
                  <MenuItem key={idx} value={subCat._id}>{subCat.name}</MenuItem>
                ))}
              </Select>
            </div>

            <div className="col">
              <h3 className={`text-[14px] font-[500] mb-1 ${!formFields.subCatId ? 'text-gray-400' : ''}`}>Third Level Category</h3>
              <Select
                name="thirdSubCatId"
                className="w-full bg-white"
                size="small"
                value={formFields.thirdSubCatId}
                onChange={(e) => setFormFields({ ...formFields, thirdSubCatId: e.target.value })}
                displayEmpty
                disabled={!formFields.subCatId}
              >
                <MenuItem value=""><em>Select Third Category</em></MenuItem>
                {categoryData.find((c) => c._id === formFields.catId)?.children?.find((sc) => sc._id === formFields.subCatId)?.children?.map((tCat, idx) => (
                  <MenuItem key={idx} value={tCat._id}>{tCat.name}</MenuItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Details Row 1 */}
          <div className="grid grid-cols-4 mb-3 gap-4">
            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Price</h3>
              <input
                type="number"
                name="price"
                value={formFields.price}
                onChange={handleChange}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Old Price</h3>
              <input
                type="number"
                name="oldprice"
                value={formFields.oldprice}
                onChange={handleChange}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Discount (%)</h3>
              <input
                type="number"
                name="discount"
                value={formFields.discount}
                onChange={handleChange}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Brand</h3>
              <input
                type="text"
                name="brand"
                value={formFields.brand}
                onChange={handleChange}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white"
              />
            </div>
          </div>

          {/* Details Row 2 */}
          <div className="grid grid-cols-4 mb-3 gap-4">
            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Flags</h3>
              <Select
                multiple
                name="productFlags"
                className="w-full bg-white"
                size="small"
                value={formFields.productFlags}
                onChange={handleChange}
              >
                <MenuItem value="popular">Popular</MenuItem>
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="featured">Featured</MenuItem>
              </Select>
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Stock</h3>
              <input
                type="number"
                name="countInStock"
                value={formFields.countInStock}
                onChange={handleChange}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Rams</h3>
              <Select
                name="productRam"
                className="w-full bg-white"
                size="small"
                value={formFields.productRam}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value={""}>None</MenuItem>
                {ramList.map((ram, index) => (
                  <MenuItem key={index} value={ram.name}>{ram.name}</MenuItem>
                ))}
              </Select>
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Weight</h3>
              <Select
                name="productWeight"
                className="w-full bg-white"
                size="small"
                value={formFields.productWeight}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value={""}>None</MenuItem>
                {weightList.map((weight, index) => (
                  <MenuItem key={index} value={weight.name}>{weight.name}</MenuItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Details Row 3 */}
          <div className="grid grid-cols-4 mb-3 gap-4">
            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Size</h3>
              <Select
                name="size"
                className="w-full bg-white"
                size="small"
                value={formFields.size}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value={""}>None</MenuItem>
                {sizeList.map((size, index) => (
                  <MenuItem key={index} value={size.name}>{size.name}</MenuItem>
                ))}
              </Select>
            </div>

            <div className="col">
              <h3 className="text-[14px] font-[500] mb-1">Product Rating</h3>
              <Rating name="half-rating" value={formFields.rating} onChange={handleRatingChange} precision={0.5} />
            </div>
          </div>

          {/* Media Module */}
          <div className="col w-full px-0 mt-5">
            <h3 className="font-[600] text-[16px] mb-3">Media and Images</h3>
            <div className="grid grid-cols-7 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="uploadBoxWrapper relative">
                  <span
                    onClick={() => removeImg(index)}
                    className="absolute -top-[8px] -right-[8px] z-50 flex items-center justify-center w-[18px] h-[18px] rounded-full overflow-hidden bg-red-700 cursor-pointer shadow-md"
                  >
                    <IoClose className="text-white text-[14px]" />
                  </span>
                  <div className="flex flex-col items-center justify-center relative uploadbox rounded-sm overflow-hidden border border-solid border-[rgba(0,0,0,0.2)] h-[120px] w-full bg-white">
                    <LazyLoadImage
                      className="w-full h-full object-contain p-1"
                      effect="blur"
                      alt={`preview-${index}`}
                      src={preview}
                    />
                  </div>
                </div>
              ))}
              <UploadBox multiple={true} onChange={onChangeFile} />
            </div>
          </div>

          <br />
          <hr />
        </div>

        <div className="mt-4">
          <Button type="submit" className="btn-blue btn-lg w-full" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <RiFolderUploadFill className="text-[25px] text-white" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct;
