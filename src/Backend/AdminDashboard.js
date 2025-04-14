import React, { useState, useEffect } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  fetchUsers,
  fetchPendingUsers,
  approveUser,
  rejectUser,
  removeUser,
  fetchDashboardStats
} from "./userManagement";
import { canDeleteUser } from "./security";
import { checkUserRole } from "./security";
import { useNavigate } from "react-router-dom";




export default function AdminDashboard() {
  const { user, role, email: adminEmail } = useAuth(); // ✅ Get admin email
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalPendingUsers: 0,
  });

  // ✅ Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      setUsers(await fetchUsers());
      setPendingUsers(await fetchPendingUsers());
      setDashboardStats(await fetchDashboardStats());
    };
    fetchData();
  }, []);

  useEffect(() => {
    const verifyRole = async () => {
      const hasAccess = await checkUserRole(user.uid, "admin");
      if (!hasAccess) {
        alert("Access denied. You do not have admin permissions.");
        navigate("/3d-builder"); 
      }
    };
  
    if (user) verifyRole();
  }, [user]);

  /* 
  ✅ Instantly Approve a User 
  - Removes user from `pendingUsers`
  - Adds to `users`
  - Updates `dashboardStats`
  */
  const handleApproveUser = async (userId, email) => {
    const success = await approveUser(userId, email, "user", adminEmail);

    if (success) {
      setPendingUsers(prev => prev.filter(user => user.id !== userId)); // ✅ Remove from pending
      setUsers(prev => [...prev, { id: userId, email, role: "user" }]); // ✅ Add to users list
      setDashboardStats(await fetchDashboardStats()); // ✅ Update stats
    }
  };

  const navigate = useNavigate();


  /* 
  ✅ Instantly Reject a User 
  - Removes from `pendingUsers`
  - Updates `dashboardStats`
  */
  const handleRejectUser = async (userId, email) => {
    const success = await rejectUser(userId, email, adminEmail);
    if (success) {
      setPendingUsers(prev => prev.filter(user => user.id !== userId)); // ✅ Remove from pending
      setDashboardStats(await fetchDashboardStats()); // ✅ Update stats
    }
  };

  /* 
  ✅ Instantly Remove a User 
  - Removes from `users`
  - Updates `dashboardStats`
  */
  const handleRemoveUser = async (userId, email, role) => {
    const success = await removeUser(userId, email, role, "admin", adminEmail);
    if (success) {
      setUsers(prev => prev.filter(user => user.id !== userId)); // ✅ Remove from users
      setDashboardStats(await fetchDashboardStats()); // ✅ Update stats
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6">
      <h1 className="text-3xl font-bold text-[#CDB937] mb-6">Admin Dashboard</h1>

      {/* 📊 Dashboard Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {["Total Users", "Total Admins", "Pending Users"].map((label, index) => {
          const values = [
            dashboardStats.totalUsers,
            dashboardStats.totalAdmins,
            dashboardStats.totalPendingUsers
          ];
          return (
            <div key={index} className="bg-[#1A1A1A] p-4 rounded-md text-center">
              <h3 className="text-xl font-bold text-[#CDB937]">{label}</h3>
              <p className="text-2xl">{values[index]}</p>
            </div>
          );
        })}
      </div>

      {/* 🕒 Pending Users Section */}
      <h2 className="text-2xl font-bold text-[#CDB937] mt-8">Pending Approvals</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 mt-4 text-center">
          <thead>
            <tr className="bg-[#1A1A1A] text-[#CDB937]">
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id} className="border border-gray-700">
                <td className="p-3">{user.email}</td>
                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => handleApproveUser(user.id, user.email)} // ✅ Calls `handleApproveUser`
                    className="flex items-center bg-green-500 px-4 py-1 rounded-md hover:bg-green-600 transition"
                  >
                    <CheckCircle size={16} className="mr-1" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectUser(user.id, user.email)} // ✅ Calls `handleRejectUser`
                    className="flex items-center bg-red-500 px-4 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    <Trash2 size={16} className="mr-1" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 👥 Approved Users Section */}
      <h2 className="text-2xl font-bold text-[#CDB937] mt-10">All Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 mt-4 text-center">
          <thead>
            <tr className="bg-[#1A1A1A] text-[#CDB937]">
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border border-gray-700">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleRemoveUser(user.id, user.email, user.role)} // ✅ Calls `handleRemoveUser`
                    className="flex items-center bg-red-500 px-4 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    <Trash2 size={16} className="mr-1" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
