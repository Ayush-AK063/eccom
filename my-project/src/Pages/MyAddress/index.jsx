import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import { FiChevronRight, FiEdit2, FiMapPin, FiPhone, FiPlus, FiTrash2 } from "react-icons/fi";
import AccountSidebar from "../../components/AccountSidebar";
import { MyContext } from "../../App";
import { deleteData } from "../../utils/api";
import "../MyAccount/style.css";
import "./style.css";

const MyAddress = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const addressList = context?.addressList || [];
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (!localStorage.getItem("accesstoken")) history("/login");
  }, [context?.isLogin, history]);

  // Default pehle
  const sorted = [...addressList].sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault));

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteData(`/api/address/${deleteTarget._id}`);
    setDeleting(false);
    if (res?.error === false) {
      context.openAlertBox("success", "Address deleted");
      setDeleteTarget(null);
      context.getAddresses();
    } else {
      context.openAlertBox("error", res?.message || "Failed to delete address");
    }
  };

  return (
    <section className="bg-[#fafafa] py-6 pb-14">
      <div className="container">
        <nav className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-4" aria-label="breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <FiChevronRight className="text-gray-300" />
          <Link to="/my-account" className="hover:text-primary">My Account</Link>
          <FiChevronRight className="text-gray-300" />
          <span className="text-gray-900">Addresses</span>
        </nav>

        <div className="accGrid">
          <AccountSidebar />

          <div className="accCard min-w-0">
            <div className="accCard__head">
              <div>
                <h2>My Addresses</h2>
                <div className="text-[13px] text-gray-500 mt-0.5">Manage where your orders are delivered.</div>
              </div>
              {addressList.length > 0 && (
                <button type="button" onClick={() => context.openAddressPanelFor(null)} className="accBtn accBtn--dark !min-w-0">
                  <FiPlus /> Add address
                </button>
              )}
            </div>

            <div className="p-5">
              {addressList.length === 0 ? (
                <div className="flex flex-col items-center text-center py-12">
                  <span className="w-[72px] h-[72px] rounded-full bg-[#fff1f0] text-primary text-[30px] flex items-center justify-center"><FiMapPin /></span>
                  <div className="mt-4 text-[17px] font-[700] text-gray-900">No saved addresses</div>
                  <div className="mt-1 text-[13px] text-gray-500">Add an address for faster checkout.</div>
                  <button type="button" onClick={() => context.openAddressPanelFor(null)} className="mt-5 accBtn accBtn--dark">
                    <FiPlus /> Add address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sorted.map((a) => (
                    <div key={a._id} className={`addrCard ${a.isDefault ? "is-default" : ""}`}>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-[15px] font-[700] text-gray-900">{a.name}</span>
                        <span className="addrTag">{a.addressType || "Home"}</span>
                        {a.isDefault && <span className="addrTag addrTag--default">Default</span>}
                      </div>
                      <div className="mt-2.5 text-[13px] text-gray-600 leading-[21px]">
                        {[a.flatHouse, a.areaStreet].filter(Boolean).join(", ")}
                        {a.landmark && <><br />Near {a.landmark}</>}
                        <br />{a.townCity}, {a.state} – {a.pincode}
                        {a.country && <><br />{a.country}</>}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[13px] font-[500] text-gray-800">
                        <FiPhone className="text-gray-400" /> {a.mobile}
                      </div>

                      <div className="addrCard__actions">
                        <button type="button" onClick={() => context.openAddressPanelFor(a)}><FiEdit2 /> Edit</button>
                        <span className="w-px h-4 bg-gray-200" />
                        <button type="button" className="hover:!text-primary" onClick={() => setDeleteTarget(a)}><FiTrash2 /> Delete</button>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={() => context.openAddressPanelFor(null)} className="addrCard addrCard--add">
                    <span className="w-[44px] h-[44px] rounded-full bg-gray-100 flex items-center justify-center text-[20px]"><FiPlus /></span>
                    <span className="text-[13px] font-[600]">Add a new address</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: "6px", maxWidth: 400 } }}>
        <div className="p-6">
          <span className="w-[48px] h-[48px] rounded-full bg-[#fff1f0] text-primary text-[20px] flex items-center justify-center"><FiTrash2 /></span>
          <div className="mt-4 text-[17px] font-[700] text-gray-900">Delete this address?</div>
          {deleteTarget && (
            <div className="mt-1.5 text-[13px] text-gray-600 leading-[20px]">
              <b className="text-gray-900">{deleteTarget.name}</b> · {deleteTarget.townCity}, {deleteTarget.state} – {deleteTarget.pincode}. This can’t be undone.
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="accBtn accBtn--light">Cancel</button>
            <button type="button" disabled={deleting} onClick={confirmDelete} className="accBtn !bg-[#dc2626] !text-white hover:!bg-[#b91c1c]">
              {deleting ? <CircularProgress size={16} color="inherit" /> : "Delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default MyAddress;
