import React, { useState, useContext, useEffect } from "react";
import UploadBox from "../../Components/UploadBox";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { IoClose } from "react-icons/io5";
import Button from "@mui/material/Button";
import { RiFolderUploadFill } from "react-icons/ri";
import { CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { postData, putData } from "../../utils/api";
import { MyContext } from "../../App";

const EditHomeSlide = ({ data }) => {
    const [oldImages, setOldImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [type, setType] = useState('Left Big Banner');
    const [bannerHeading, setBannerHeading] = useState('');
    const [title, setTitle] = useState('');
    const [startAtOnlyPrice, setStartAtOnlyPrice] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(MyContext);

    useEffect(() => {
        if (data) {
            setOldImages(data.images || []);
            setType(data.type || 'Left Big Banner');
            setBannerHeading(data.bannerHeading || '');
            setTitle(data.title || '');
            setStartAtOnlyPrice(data.startAtOnlyPrice || '');
            setRedirectUrl(data.redirectUrl || '');
        }
    }, [data]);

    const onChangeFile = async (e) => {
        try {
            const files = Array.from(e.target.files);
            const newPreviews = files.map((file) => URL.createObjectURL(file));

            setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
            setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
        } catch (error) {
            console.log(error);
        }
    };

    const removeOldImg = (index) => {
        const newOldImages = [...oldImages];
        newOldImages.splice(index, 1);
        setOldImages(newOldImages);
    };

    const removeNewImg = (index) => {
        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const handleEditSlide = async (e) => {
        e.preventDefault();

        if (oldImages.length === 0 && selectedFiles.length === 0) {
            context.openAlertBox("error", "Please ensure at least one image exists");
            return;
        }

        setIsLoading(true);

        try {
            let newlyUploadedImages = [];

            if (selectedFiles.length > 0) {
                const formdata = new FormData();
                for (let file of selectedFiles) {
                    formdata.append("images", file);
                }

                const uploadRes = await postData("/api/homeSlide/upload-images", formdata, {
                    withCredentials: true,
                });

                if (uploadRes?.error || !uploadRes?.images) {
                    context.openAlertBox("error", uploadRes?.message || "Image upload failed");
                    setIsLoading(false);
                    return;
                }

                newlyUploadedImages = uploadRes.images;
            }

            const payload = {
                images: [...oldImages, ...newlyUploadedImages],
                type: type,
                bannerHeading: type === 'Left Big Banner' ? bannerHeading : '',
                title: title,
                startAtOnlyPrice: startAtOnlyPrice,
                redirectUrl: redirectUrl,
            };

            const res = await putData(`/api/homeSlide/${data._id}`, payload, {
                withCredentials: true,
            });

            if (res?.success) {
                context.openAlertBox("success", "Home Slide Updated Successfully");
                context.setIsOpenFullScreenPanel({ open: false });
                context.setRefetchHomeSlides((prev) => !prev);
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
                <form onSubmit={handleEditSlide} className="form py-3 p-8">

                    <div className="mb-5">
                        <FormControl fullWidth>
                            <InputLabel id="banner-type-select-label">Banner Type</InputLabel>
                            <Select
                                labelId="banner-type-select-label"
                                id="banner-type-select"
                                value={type}
                                label="Banner Type"
                                onChange={(e) => setType(e.target.value)}
                            >
                                <MenuItem value="Left Big Banner">Left Big Banner</MenuItem>
                                <MenuItem value="Right Top Banner">Right Top Banner</MenuItem>
                                <MenuItem value="Right Down Banner">Right Down Banner</MenuItem>
                                <MenuItem value="v2 Banner">v2 Banner</MenuItem>
                                <MenuItem value="v3 Banner">v3 Banner</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    {['Left Big Banner', 'Right Top Banner', 'Right Down Banner'].includes(type) && (
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            {type === 'Left Big Banner' && (
                                <div className="col-span-2">
                                    <TextField
                                        fullWidth
                                        label="Banner Heading (e.g., Big Saving Day Sale)"
                                        value={bannerHeading}
                                        onChange={(e) => setBannerHeading(e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="col-span-2 md:col-span-1">
                                <TextField
                                    fullWidth
                                    label="Product Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <TextField
                                    fullWidth
                                    label="Start At Only Price (e.g., 499)"
                                    value={startAtOnlyPrice}
                                    onChange={(e) => setStartAtOnlyPrice(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <TextField
                                    fullWidth
                                    label="Redirect URL"
                                    value={redirectUrl}
                                    onChange={(e) => setRedirectUrl(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-[72vh] overflow-y-scroll pr-4 mt-8">
                        <div className="grid grid-cols-7 gap-4">

                            {/* Render Existing Images */}
                            {oldImages.map((img, index) => (
                                <div key={`old-${index}`} className="uploadBoxWrapper relative">
                                    <span
                                        onClick={() => removeOldImg(index)}
                                        className="absolute -top-[8px] -right-[8px] z-50 flex items-center justify-center w-[18px] h-[18px] rounded-full overflow-hidden bg-red-700 cursor-pointer shadow-md"
                                    >
                                        <IoClose className="text-white text-[14px]" />
                                    </span>
                                    <div className="flex flex-col items-center justify-center relative uploadbox rounded-sm overflow-hidden border border-solid border-[rgba(0,0,0,0.2)] h-[150px] w-full bg-white">
                                        <LazyLoadImage
                                            className="w-full h-full object-contain p-1"
                                            effect="blur"
                                            alt={`old-img-${index}`}
                                            src={img}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Render New Previews */}
                            {previews.map((preview, index) => (
                                <div key={`new-${index}`} className="uploadBoxWrapper relative">
                                    <span
                                        onClick={() => removeNewImg(index)}
                                        className="absolute -top-[8px] -right-[8px] z-50 flex items-center justify-center w-[18px] h-[18px] rounded-full overflow-hidden bg-red-700 cursor-pointer shadow-md"
                                    >
                                        <IoClose className="text-white text-[14px]" />
                                    </span>
                                    <div className="flex flex-col items-center justify-center relative uploadbox rounded-sm overflow-hidden border border-solid border-[rgba(0,0,0,0.2)] h-[150px] w-full bg-white">
                                        <LazyLoadImage
                                            className="w-full h-full object-contain p-1 opacity-70 border-2 border-dashed border-blue-400"
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
                                <span className="ml-2">Save Changes</span>
                            </>
                        )}
                    </Button>
                </form>
            </section>
        </div>
    );
};

export default EditHomeSlide;
