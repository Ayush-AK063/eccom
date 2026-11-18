import React, { useContext, useEffect, useState } from "react";
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { putData, postData, putDataForImage, getData, deleteData } from "../../utils/api";
import { Collapse } from "react-collapse";
import { RiFolderUploadFill } from "react-icons/ri";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";

const MyAccount = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [isChangedPasswordFormShow, setIsChangedPasswordFormShow] = useState(false);
    const [isAddAddressFormShow, setIsAddAddressFormShow] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [addressList, setAddressList] = useState([]);

    // Address Action States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);

    const [formFields, setFormFields] = useState({
        name: "",
        email: "",
        mobile: "",
        country: "",
    });

    const [changePassword, setChangePassword] = useState({
        email: "",
        oldPassword: "",
        newPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [addressFields, setAddressFields] = useState({
        name: "",
        mobile: "",
        pincode: "",
        flatHouse: "",
        areaStreet: "",
        landmark: "",
        townCity: "",
        state: "",
        country: "India",
        isDefault: false,
    });

    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        if (context?.userData) {
            setFormFields({
                name: context?.userData?.name || "",
                email: context?.userData?.email || "",
                mobile: context?.userData?.mobile || "",
                country: context?.userData?.country || "",
            });

            setChangePassword((prev) => ({
                ...prev,
                email: context?.userData?.email || "",
            }));

            const userAvatar = [];
            if (context?.userData?.avatar) {
                userAvatar.push(context?.userData?.avatar);
            }
            setPreviews(userAvatar);

            fetchAddresses(context?.userData?._id);
        }
    }, [context?.userData]);

    const fetchAddresses = (userId) => {
        if (!userId) return;
        getData(`/api/address/${userId}`).then((res) => {
            if (res?.error === false) {
                setAddressList(res.data);
            }
        });
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields({
            ...formFields,
            [name]: value,
        });
    };

    const onChangePasswordInput = (e) => {
        const { name, value } = e.target;
        setChangePassword({
            ...changePassword,
            [name]: value,
        });
    };

    const onChangeAddressInput = (e) => {
        const { name, value } = e.target;
        setAddressFields({
            ...addressFields,
            [name]: value,
        });
    };

    const formdata = new FormData();

    const onChangeFile = async (e, apiEndPoint) => {
        try {
            const files = e.target.files;
            const allowedTypes = [
                "image/jpg",
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

            setUploading(true);

            for (let file of files) {
                if (allowedTypes.includes(file.type)) {
                    formdata.append(`avatar`, file);

                    putDataForImage("/api/user/user-avatar", formdata, {
                        withCredentials: true,
                    }).then((res) => {
                        setUploading(false);
                        if (res?.message === "Image uploaded successfully" || res?.avatar) {
                            let avatar = [];
                            avatar.push(res?.avatar);
                            setPreviews(avatar);
                            context.setUserData({
                                ...context.userData,
                                avatar: res?.avatar
                            });
                            context.openAlertBox("success", "Profile picture updated");
                        }
                    });
                } else {
                    context.openAlertBox(
                        "error",
                        "Please select a valid JPG/JPEG/PNG/WEBP image file."
                    );
                    setUploading(false);
                    return false;
                }
            }
        } catch (error) {
            console.log(error);
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formFields.name === "") {
            context.openAlertBox("error", "Name field is required");
            setIsLoading(false);
            return;
        }

        if (formFields.mobile === "") {
            context.openAlertBox("error", "Phone number is required");
            setIsLoading(false);
            return;
        }

        if (formFields.country === "") {
            context.openAlertBox("error", "Country field is required");
            setIsLoading(false);
            return;
        }

        putData(`/api/user/${context?.userData?._id}`, formFields, { withCredentials: true }).then(
            (res) => {
                setIsLoading(false);
                if (res?.error !== true) {
                    context.openAlertBox("success", "Profile updated successfully");
                    context.setUserData({
                        ...context.userData,
                        name: formFields.name,
                        mobile: formFields.mobile,
                        country: formFields.country
                    });
                } else {
                    context.openAlertBox("error", res?.message || "Failed to update profile");
                }
            }
        );
    };

    const handleEditBtnClick = (addr) => {
        setEditId(addr._id);
        setAddressFields({
            name: addr.name,
            mobile: addr.mobile,
            pincode: addr.pincode,
            flatHouse: addr.flatHouse,
            areaStreet: addr.areaStreet,
            landmark: addr.landmark,
            townCity: addr.townCity,
            state: addr.state,
            country: addr.country,
            isDefault: addr.isDefault || false,
        });
        setIsAddAddressFormShow(true);
        // Scroll to form smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteBtnClick = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleViewBtnClick = (addr) => {
        setViewData(addr);
        setIsViewModalOpen(true);
    };

    const confirmDeleteAddress = () => {
        setIsLoading3(true);
        deleteData(`/api/address/${deleteId}`).then((res) => {
            setIsLoading3(false);
            if (res?.error === false) {
                context.openAlertBox("success", "Address deleted successfully");
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                fetchAddresses(context?.userData?._id);
            } else {
                context.openAlertBox("error", res?.message || "Failed to delete address");
            }
        });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setIsLoading2(true);

        if (changePassword.oldPassword === "") {
            context.openAlertBox("error", "Old password is required");
            setIsLoading2(false);
            return;
        }

        if (changePassword.newPassword === "") {
            context.openAlertBox("error", "New password is required");
            setIsLoading2(false);
            return;
        }

        if (changePassword.confirmPassword === "") {
            context.openAlertBox("error", "Confirm password is required");
            setIsLoading2(false);
            return;
        }

        if (changePassword.newPassword !== changePassword.confirmPassword) {
            context.openAlertBox("error", "New password and confirm password do not match");
            setIsLoading2(false);
            return;
        }

        postData(`/api/user/reset-password`, changePassword, { withCredentials: true }).then(
            (res) => {
                setIsLoading2(false);
                if (res?.error !== true) {
                    context.openAlertBox("success", "Password changed successfully");
                    setChangePassword({
                        ...changePassword,
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    });
                    setIsChangedPasswordFormShow(false);
                } else {
                    context.openAlertBox("error", res?.message || "Failed to change password");
                }
            }
        );
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        setIsLoading3(true);

        const requiredFields = ["name", "mobile", "pincode", "flatHouse", "areaStreet", "townCity", "state", "country"];
        for (let field of requiredFields) {
            if (addressFields[field] === "") {
                context.openAlertBox("error", `Please fill all required fields: ${field} is missing`);
                setIsLoading3(false);
                return;
            }
        }

        const payload = {
            ...addressFields,
            userId: context?.userData?._id
        };

        if (editId) {
            // Update mode
            putData(`/api/address/${editId}`, payload, { withCredentials: true }).then(
                (res) => {
                    setIsLoading3(false);
                    if (res?.error !== true) {
                        context.openAlertBox("success", "Address updated successfully");
                        setEditId(null);
                        setAddressFields({
                            name: "",
                            mobile: "",
                            pincode: "",
                            flatHouse: "",
                            areaStreet: "",
                            landmark: "",
                            townCity: "",
                            state: "",
                            country: "India",
                            isDefault: false,
                        });
                        setIsAddAddressFormShow(false);
                        fetchAddresses(context?.userData?._id);
                    } else {
                        context.openAlertBox("error", res?.message || "Failed to update address");
                    }
                }
            );
        } else {
            // Create mode
            postData(`/api/address/add`, payload, { withCredentials: true }).then(
                (res) => {
                    setIsLoading3(false);
                    if (res?.error !== true) {
                        context.openAlertBox("success", "Address added successfully");
                        setAddressFields({
                            name: "",
                            mobile: "",
                            pincode: "",
                            flatHouse: "",
                            areaStreet: "",
                            landmark: "",
                            townCity: "",
                            state: "",
                            country: "India",
                            isDefault: false,
                        });
                        setIsAddAddressFormShow(false);
                        fetchAddresses(context?.userData?._id);
                    } else {
                        context.openAlertBox("error", res?.message || "Failed to add address");
                    }
                }
            );
        }
    };

    return (
        <section className="p-8 pb-0">
            <div className="card bg-white shadow-md rounded-md p-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[20px] font-[600]">My Account</h2>
                    <div className="flex gap-3">
                        <Button
                            className="btn-blue btn-sm"
                            onClick={() => {
                                if (isAddAddressFormShow && editId) {
                                    setEditId(null);
                                    setAddressFields({
                                        name: "",
                                        mobile: "",
                                        pincode: "",
                                        flatHouse: "",
                                        areaStreet: "",
                                        landmark: "",
                                        townCity: "",
                                        state: "",
                                        country: "India",
                                        isDefault: false,
                                    });
                                }
                                setIsAddAddressFormShow(!isAddAddressFormShow);
                            }}
                        >
                            {isAddAddressFormShow ? "Close Address Form" : "Add Address"}
                        </Button>
                        <Button
                            className="btn-blue btn-sm"
                            onClick={() => setIsChangedPasswordFormShow(!isChangedPasswordFormShow)}
                        >
                            {isChangedPasswordFormShow ? "Close Change Password" : "Change Password"}
                        </Button>
                    </div>
                </div>
                <hr />
                <br />

                <div className="flex flex-col items-center justify-center w-full mb-8">
                    <div className="w-[110px] h-[110px] mb-4 rounded-full relative overflow-hidden group flex items-center justify-center bg-gray-200">
                        {uploading === true ? (
                            <CircularProgress color="inherit" />
                        ) : (
                            <>
                                {previews && previews.length > 0 && previews[0] ? (
                                    previews.map((img, index) => (
                                        <img
                                            src={img}
                                            key={index}
                                            alt="profile"
                                            className="object-cover w-full h-full"
                                        />
                                    ))
                                ) : (
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                        alt="default"
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </>
                        )}

                        <div className="absolute flex items-center justify-center cursor-pointer top-0 left-0 z-50 w-full h-full overlay opacity-0 transition-all bg-[rgba(0,0,0,0.7)] group-hover:opacity-100">
                            <RiFolderUploadFill className="text-[#fff] text-[22px]" />
                            <input
                                type="file"
                                onChange={(e) => onChangeFile(e, "/api/user/user-avatar")}
                                name="avatar"
                                accept="image/*"
                                className="absolute top-0 left-0 w-full h-full opacity-0"
                            />
                        </div>
                    </div>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1">Full Name</h3>
                            <input
                                type="text"
                                name="name"
                                value={formFields.name}
                                onChange={onChangeInput}
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                            />
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1">Email</h3>
                            <input
                                type="email"
                                name="email"
                                value={formFields.email}
                                disabled
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none rounded-sm p-3 text-sm bg-[#e9ecef] cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mb-8">
                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1">Phone Number</h3>
                            <input
                                type="text"
                                name="mobile"
                                value={formFields.mobile}
                                onChange={onChangeInput}
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                            />
                        </div>

                        <div className="col">
                            <h3 className="text-[14px] font-[500] mb-1">Country</h3>
                            <input
                                type="text"
                                name="country"
                                value={formFields.country}
                                onChange={onChangeInput}
                                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 w-full">
                        <Button
                            type="submit"
                            className="btn-blue btn-lg !w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
                        </Button>
                    </div>
                </form>
            </div>

            <Collapse isOpened={isChangedPasswordFormShow}>
                <div className="card bg-white shadow-md rounded-md p-8 mb-8">
                    <h2 className="text-[20px] font-[600] mb-4">Change Password</h2>
                    <hr />
                    <br />

                    <form className="form" onSubmit={handlePasswordChange}>
                        <div className="grid grid-cols-2 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Old Password</h3>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={changePassword.oldPassword}
                                    onChange={onChangePasswordInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>

                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">New Password</h3>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={changePassword.newPassword}
                                    onChange={onChangePasswordInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mb-8">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Confirm Password</h3>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={changePassword.confirmPassword}
                                    onChange={onChangePasswordInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 w-full">
                            <Button
                                type="submit"
                                className="btn-blue btn-lg !w-full"
                                disabled={isLoading2}
                            >
                                {isLoading2 ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Collapse>

            <Collapse isOpened={isAddAddressFormShow}>
                <div className="card bg-white shadow-md rounded-md p-8 mb-8" id="address-form">
                    <h2 className="text-[20px] font-[600] mb-4">
                        {editId ? "Edit Address" : "Add Address"}
                    </h2>
                    <hr />
                    <br />

                    <form className="form" onSubmit={handleAddAddress}>
                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Country/Region</h3>
                                <select
                                    name="country"
                                    value={addressFields.country}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm px-3 text-sm bg-[#fafafa]"
                                >
                                    <option value="India">India</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Full name (First and Last name)</h3>
                                <input
                                    type="text"
                                    name="name"
                                    value={addressFields.name}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Mobile number</h3>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={addressFields.mobile}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                                <p className="text-[12px] text-gray-500 mt-1">May be used to assist delivery</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Pincode</h3>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={addressFields.pincode}
                                    onChange={onChangeAddressInput}
                                    placeholder="6 digits [0-9] PIN code"
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Flat, House no., Building, Company, Apartment</h3>
                                <input
                                    type="text"
                                    name="flatHouse"
                                    value={addressFields.flatHouse}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Area, Street, Sector, Village</h3>
                                <input
                                    type="text"
                                    name="areaStreet"
                                    value={addressFields.areaStreet}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-5">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Landmark</h3>
                                <input
                                    type="text"
                                    name="landmark"
                                    value={addressFields.landmark}
                                    onChange={onChangeAddressInput}
                                    placeholder="E.g. near apollo hospital"
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mb-8">
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">Town/City</h3>
                                <input
                                    type="text"
                                    name="townCity"
                                    value={addressFields.townCity}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm bg-[#fafafa]"
                                />
                            </div>
                            <div className="col">
                                <h3 className="text-[14px] font-[500] mb-1">State</h3>
                                <select
                                    name="state"
                                    value={addressFields.state}
                                    onChange={onChangeAddressInput}
                                    className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm px-3 text-sm bg-[#fafafa]"
                                >
                                    <option value="">Choose a state</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Ladakh">Ladakh</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Puducherry">Puducherry</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 mb-8">
                            <div className="col flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    id="adminIsDefault"
                                    checked={addressFields.isDefault}
                                    onChange={(e) => setAddressFields({ ...addressFields, isDefault: e.target.checked })}
                                    className="w-[18px] h-[18px] cursor-pointer"
                                />
                                <label htmlFor="adminIsDefault" className="text-[15px] font-[500] cursor-pointer text-gray-800 tracking-wide">Make this my default address</label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 w-full">
                            <Button
                                type="submit"
                                className="btn-blue btn-lg !w-full"
                                disabled={isLoading3}
                            >
                                {isLoading3 ? <CircularProgress size={24} color="inherit" /> : "Save"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Collapse>

            <div className="card bg-white shadow-md rounded-md p-8">
                <h2 className="text-[20px] font-[600] mb-4">Saved Addresses</h2>
                <hr />
                <br />

                {addressList?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {addressList.map((addr, index) => (
                            <div key={index} className="border border-gray-200 rounded-md p-5 shadow-sm bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[16px] font-[600]">{addr.name}</h3>
                                            {addr.isDefault && (
                                                <span className="bg-blue-100 text-blue-800 text-[11px] font-[600] px-2 py-[2px] rounded uppercase tracking-wider">Default</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <IconButton size="small" sx={{ color: '#4b5563', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }} onClick={() => handleViewBtnClick(addr)}><FiEye className="text-[18px]" /></IconButton>
                                            <IconButton size="small" sx={{ color: '#4b5563', '&:hover': { color: '#059669', bgcolor: '#ecfdf5' } }} onClick={() => handleEditBtnClick(addr)}><FiEdit className="text-[18px]" /></IconButton>
                                            <IconButton size="small" sx={{ color: '#4b5563', '&:hover': { color: '#dc2626', bgcolor: '#fef2f2' } }} onClick={() => handleDeleteBtnClick(addr._id)}><FiTrash2 className="text-[18px]" /></IconButton>
                                        </div>
                                    </div>
                                    <p className="text-[14px] text-gray-700 mb-1">
                                        <span className="font-[500] text-gray-900">Mobile:</span> {addr.mobile}
                                    </p>
                                    <p className="text-[14px] text-gray-700 leading-relaxed max-w-[90%]">
                                        {addr.flatHouse}, {addr.areaStreet}<br />
                                        {addr.landmark ? `${addr.landmark}, ` : ""}
                                        {addr.townCity}, {addr.state} - {addr.pincode}<br />
                                        {addr.country}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-5">No addresses saved yet.</p>
                )}
            </div>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle className="flex items-center justify-between">
                    <span className="font-[600]">View Address</span>
                    <IconButton onClick={() => setIsViewModalOpen(false)}><IoCloseSharp /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {viewData && (
                        <div className="flex flex-col gap-3">
                            {viewData.isDefault && (
                                <div className="mb-1"><span className="bg-blue-100 text-blue-800 text-[12px] font-[600] px-2 py-1 rounded uppercase tracking-wider">Default Address</span></div>
                            )}
                            <p className="text-[15px]"><b className="font-[600]">Name:</b> {viewData.name}</p>
                            <p className="text-[15px]"><b className="font-[600]">Mobile:</b> {viewData.mobile}</p>
                            <p className="text-[15px]"><b className="font-[600]">Flat/House No:</b> {viewData.flatHouse}</p>
                            <p className="text-[15px]"><b className="font-[600]">Street/Area:</b> {viewData.areaStreet}</p>
                            <p className="text-[15px]"><b className="font-[600]">Landmark:</b> {viewData.landmark || "N/A"}</p>
                            <p className="text-[15px]"><b className="font-[600]">Town/City:</b> {viewData.townCity}</p>
                            <p className="text-[15px]"><b className="font-[600]">State:</b> {viewData.state}</p>
                            <p className="text-[15px]"><b className="font-[600]">Pincode:</b> {viewData.pincode}</p>
                            <p className="text-[15px]"><b className="font-[600]">Country:</b> {viewData.country}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this address? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDeleteAddress} color="error" variant="contained" disabled={isLoading3}>
                        {isLoading3 ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

        </section>
    );
};

export default MyAccount;
