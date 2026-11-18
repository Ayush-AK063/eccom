import React, { useContext, useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { deleteData } from "../../utils/api";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";

const MyAddress = () => {
    const [isLoading3, setIsLoading3] = useState(false);

    // Address Action States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const context = useContext(MyContext);
    const history = useNavigate();
    const addressList = context?.addressList || [];

    useEffect(() => {
        const token = localStorage.getItem("accesstoken");
        if (!token) {
            history("/");
        }
    }, [context?.isLogin, history]);

    const handleEditBtnClick = (addr) => {
        context.openAddressPanelFor(addr);
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
                context.getAddresses();
            } else {
                context.openAlertBox("error", res?.message || "Failed to delete address");
            }
        });
    };

    return (
        <section className="w-full py-10">
            <div className="container flex gap-5">
                <div className="col1 w-[20%]">
                    <AccountSidebar />
                </div>

                <div className="col2 w-[80%]">
                    <div className="p-5 bg-white rounded-md shadow-md card mb-5">
                        <div className="flex items-center justify-between pb-3">
                            <h2 className="pb-0 text-[20px] font-[600]">My Addresses</h2>
                            <Button
                                className="btn-blue btn-sm"
                                onClick={() => context.openAddressPanelFor(null)}
                            >
                                Add Address
                            </Button>
                        </div>
                        <hr />
                        <br />


                        {addressList?.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {addressList.map((addr, index) => (
                                    <div key={index} className="border border-gray-200 rounded-md p-5 shadow-sm bg-gray-50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[16px] font-[600]">{addr.name}</h3>
                                                    <span className="bg-gray-200 text-gray-700 text-[11px] font-[600] px-2 py-[2px] rounded uppercase tracking-wider">{addr.addressType || "Home"}</span>
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
                </div>
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
                            <span className="inline-block mb-2 mr-2 bg-gray-200 text-gray-700 text-[11px] font-[600] px-2 py-[2px] rounded uppercase tracking-wider">{viewData.addressType || "Home"}</span>
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

export default MyAddress;
