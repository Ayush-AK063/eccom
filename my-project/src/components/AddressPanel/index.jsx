import React, { useContext, useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { MyContext } from "../../App";
import { postData, putData } from "../../utils/api";

const EMPTY_ADDRESS = {
    name: "",
    mobile: "",
    pincode: "",
    flatHouse: "",
    areaStreet: "",
    landmark: "",
    townCity: "",
    state: "",
    country: "India",
    addressType: "Home",
    isDefault: false,
};

// Common Add / Edit address form — drawer ke andar, context se khulta hai
// (My Address page aur Checkout dono se use hota hai)
const AddressPanel = () => {
    const context = useContext(MyContext);
    const editAddress = context?.editAddress; // null = add mode
    const [isLoading, setIsLoading] = useState(false);
    const [addressFields, setAddressFields] = useState(EMPTY_ADDRESS);

    // Panel khulte hi form bharo (edit) ya khaali karo (add)
    useEffect(() => {
        if (!context?.openAddressPanel) return;
        if (editAddress) {
            const fields = {};
            for (const key of Object.keys(EMPTY_ADDRESS)) {
                fields[key] = editAddress[key] ?? EMPTY_ADDRESS[key];
            }
            setAddressFields(fields);
        } else {
            setAddressFields(EMPTY_ADDRESS);
        }
    }, [context?.openAddressPanel, editAddress]);

    const onChangeAddressInput = (e) => {
        const { name, value } = e.target;
        setAddressFields({
            ...addressFields,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ["name", "mobile", "pincode", "flatHouse", "areaStreet", "townCity", "state", "country"];
        for (let field of requiredFields) {
            if (String(addressFields[field] || "").trim() === "") {
                context.openAlertBox("error", `Please fill all required fields: ${field} is missing`);
                return;
            }
        }

        setIsLoading(true);
        try {
            const res = editAddress
                ? await putData(`/api/address/${editAddress._id}`, addressFields)
                : await postData(`/api/address/add`, addressFields);

            if (res?.error !== true) {
                context.openAlertBox("success", editAddress ? "Address updated successfully" : "Address added successfully");
                await context.getAddresses();
                context.closeAddressPanel();
            } else {
                context.openAlertBox("error", res?.message || "Failed to save address");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[rgba(0,0,0,0.2)]">
                <h4>{editAddress ? "Edit Address" : "Add Delivery Address"}</h4>
                <IoClose className="text-[20px] cursor-pointer" onClick={context.closeAddressPanel} />
            </div>

            <div className="flex-1 p-5 overflow-y-auto">
                        <form className="form" onSubmit={handleSubmit}>
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
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        {/* Add more states... */}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-5">
                                <h3 className="text-[14px] font-[500] mb-2">Address Type</h3>
                                <div className="flex items-center gap-6">
                                    {["Home", "Office"].map((type) => (
                                        <label key={type} className="flex items-center gap-2 text-[14px] cursor-pointer">
                                            <input
                                                type="radio"
                                                name="addressType"
                                                value={type}
                                                checked={addressFields.addressType === type}
                                                onChange={onChangeAddressInput}
                                                className="w-4 h-4 cursor-pointer accent-[#ff5252]"
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 mb-8">
                                <div className="col flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        id="isDefault"
                                        checked={addressFields.isDefault}
                                        onChange={(e) => setAddressFields({ ...addressFields, isDefault: e.target.checked })}
                                        className="w-[18px] h-[18px] cursor-pointer"
                                    />
                                    <label htmlFor="isDefault" className="text-[15px] font-[500] cursor-pointer text-gray-800 tracking-wide">Make this my default address</label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 w-full">
                                <Button
                                    type="submit"
                                    className="btn-org btn-lg w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save"}
                                </Button>
                            </div>
                        </form>
            </div>
        </div>
    );
};

export default AddressPanel;
