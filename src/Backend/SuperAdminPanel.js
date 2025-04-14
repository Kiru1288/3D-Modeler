import React, { useState, useEffect } from "react";
import {
  fetchUsers,
  fetchAdmins,
  approveUser,
  addAdmin,
  removeUser,
  removeAdmin,
} from "../Backend/userManagement"; // 🔹 adjust path if needed
import { useAuth } from "../Backend/AuthContext";
import { Plus, Trash2, CheckCircle } from "lucide-react";

export default function SuperAdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        const fetchedAdmins = await fetchAdmins();
        setUsers(fetchedUsers);
        setAdmins(fetchedAdmins);
        setPendingUsers(
          fetchedUsers.filter((u) => u.approved === false || u.role === undefined)
        );
      } catch (err) {
        setError("⚠️ Failed to fetch users.");
      }
    };
    fetchData();
  }, []);

  const handleApproveUser = async (userId, email) => {
    setLoading(true);
    try {
      await approveUser(userId, email, "user", currentUser.email);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError("⚠️ Failed to approve user.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (email) => {
    setLoading(true);
    try {
      await addAdmin(email, "super-admin", currentUser.email);
      setAdmins((prev) => [...prev, { id: email, email, role: "admin" }]);
    } catch (err) {
      setError("⚠️ Failed to add admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    setLoading(true);
    try {
      await removeAdmin(adminId, "super-admin", currentUser.email);
      setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
    } catch (err) {
      setError("⚠️ Failed to remove admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId, email) => {
    setLoading(true);
    try {
      await removeUser(userId, email, "user", "super-admin", currentUser.email);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError("⚠️ Failed to remove user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6">
      <h1 className="text-3xl font-bold text-[#CDB937] mb-6">Super Admin Panel</h1>

      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

      {/* ➕ Add New Admin */}
      <div className="mb-6 flex gap-3">
        <input
          type="email"
          placeholder="Enter admin email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white flex-grow"
        />
        <button
          onClick={() => handleMakeAdmin(newAdminEmail)}
          className={`flex items-center px-6 py-2 bg-[#CDB937] text-black rounded-md hover:bg-[#b49b2e] transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <Plus size={16} className="mr-1" /> {loading ? "Adding..." : "Add Admin"}
        </button>
      </div>

      {/* ⏳ Pending Approvals */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#CDB937] mb-4">Pending Approvals</h2>
        <table className="w-full border border-gray-700 text-center">
          <thead>
            <tr className="bg-[#222222] text-[#CDB937]">
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id} className="border border-gray-700">
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleApproveUser(user.id, user.email)}
                    className="flex items-center bg-green-500 px-4 py-1 rounded-md hover:bg-green-600 transition"
                    disabled={loading}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    {loading ? "Approving..." : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 👑 Admin List */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#CDB937] mb-4">Current Admins</h2>
        <table className="w-full border border-gray-700 text-center">
          <thead>
            <tr className="bg-[#222222] text-[#CDB937]">
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border border-gray-700">
                <td className="p-3">{admin.email}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="flex items-center bg-red-500 px-4 py-1 rounded-md hover:bg-red-600 transition"
                    disabled={loading}
                  >
                    <Trash2 size={16} className="mr-1" />
                    {loading ? "Removing..." : "Remove Admin"}
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
