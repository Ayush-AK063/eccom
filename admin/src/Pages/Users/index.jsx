import React, { useContext, useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { LuPhone } from "react-icons/lu";
import { MdOutlineMailOutline } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { FaRegUserCircle } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MyContext } from "../../App";
import { getData, deleteData } from "../../utils/api";

const PAGE_SIZE = 10;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const Users = () => {
  const context = useContext(MyContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const loadUsers = () => {
    setIsLoading(true);
    getData("/api/user/all").then((res) => {
      if (res?.error === false) setUsers(res?.data || []);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Search: naam, email, phone, date
  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) =>
        [u.name, u.email, u.mobile, formatDate(u.createdAt)].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      )
    : users;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageUsers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Admin accounts select nahi hote
  const selectable = pageUsers.filter((u) => u.role !== "admin");
  const allOnPageSelected = selectable.length > 0 && selectable.every((u) => selected.includes(u._id));

  const toggleOne = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAllOnPage = () => {
    const ids = selectable.map((u) => u._id);
    setSelected((prev) =>
      allOnPageSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0 || isDeleting) return;
    if (!window.confirm(`Delete ${selected.length} user(s)? Their cart, addresses and wishlist will also be removed. This can't be undone.`)) return;
    setIsDeleting(true);
    const res = await deleteData("/api/user/delete-multiple", { data: { ids: selected } });
    setIsDeleting(false);
    if (res?.error === false) {
      context.openAlertBox("success", res?.message || "Users deleted");
      setSelected([]);
      loadUsers();
    } else {
      context.openAlertBox("error", res?.message || "Could not delete users");
    }
  };

  return (
    <div className="my-4 bg-white shadow-md card sm:rounded-lg">
      <div className="flex items-center justify-between w-full gap-3 px-5 py-5">
        <h2 className="text-[18px] font-[600] whitespace-nowrap">
          Users List <span className="text-[14px] font-[400] text-gray-500">({filtered.length})</span>
        </h2>

        <div className="flex items-center gap-3 ml-auto">
          {selected.length > 0 && (
            <Button variant="contained" color="error" size="small" className="flex gap-1 whitespace-nowrap"
              onClick={deleteSelected} disabled={isDeleting}>
              {isDeleting ? <CircularProgress size={16} color="inherit" /> : <RiDeleteBin6Line />}
              Delete ({selected.length})
            </Button>
          )}
          <TextField size="small" className="w-[300px]" placeholder="Search name, email, phone, date"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="relative pb-5 mt-2 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3 pr-0" width="5%">
                <Checkbox size="small" checked={allOnPageSelected} onChange={toggleAllOnPage}
                  disabled={selectable.length === 0} />
              </th>
              <th className="px-6 py-3 whitespace-nowrap">User</th>
              <th className="px-6 py-3 whitespace-nowrap">Email</th>
              <th className="px-6 py-3 whitespace-nowrap">Phone</th>
              <th className="px-6 py-3 whitespace-nowrap">Email Verified</th>
              <th className="px-6 py-3 whitespace-nowrap">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="py-10 text-center"><CircularProgress color="inherit" /></td></tr>
            ) : pageUsers.length === 0 ? (
              <tr><td colSpan="6" className="py-10 text-center text-gray-500">{q ? "No users match your search." : "No users yet."}</td></tr>
            ) : (
              pageUsers.map((user) => {
                const isAdminUser = user.role === "admin";
                return (
                  <tr key={user._id} className="bg-white border-b border-gray-200 odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-2 pr-0">
                      {isAdminUser ? (
                        <span className="inline-block w-[38px]" />
                      ) : (
                        <Checkbox size="small" checked={selected.includes(user._id)} onChange={() => toggleOne(user._id)} />
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-[40px] h-[40px] rounded-full object-cover" />
                        ) : (
                          <FaRegUserCircle className="text-[40px] text-gray-400" />
                        )}
                        <span className="font-[500] text-gray-800 whitespace-nowrap">{user.name}</span>
                        {isAdminUser && (
                          <span className="px-2 py-[2px] text-[11px] font-[600] uppercase rounded bg-blue-100 text-blue-800">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <span className="flex items-center gap-2 whitespace-nowrap"><MdOutlineMailOutline />{user.email}</span>
                    </td>
                    <td className="px-6 py-2">
                      <span className="flex items-center gap-2 whitespace-nowrap"><LuPhone />{user.mobile || "—"}</span>
                    </td>
                    <td className="px-6 py-2">
                      {user.verify_email ? (
                        <span className="inline-block px-3 py-1 text-[11px] font-[500] text-white bg-green-600 rounded-full">Verified</span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-[11px] font-[500] text-white bg-red-500 rounded-full">Not Verified</span>
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <span className="flex items-center gap-2 whitespace-nowrap"><SlCalender />{formatDate(user.createdAt)}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end px-4 pt-2 pb-4">
          <Pagination count={totalPages} page={currentPage} onChange={(e, v) => setPage(v)} color="primary" />
        </div>
      )}
    </div>
  );
};

export default Users;
