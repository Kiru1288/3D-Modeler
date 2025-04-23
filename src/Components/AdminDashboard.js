import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  const approveUser = async (uid) => {
    await axios.put(`http://localhost:3001/api/users/approve/${uid}`);
    fetchUsers();
  };

  const deleteUser = async (uid) => {
    await axios.delete(`http://localhost:3001/api/users/${uid}`);
    fetchUsers();
  };

  const promoteToAdmin = async (uid) => {
    await axios.put(`http://localhost:3001/api/users/promote/${uid}`);
    fetchUsers();
  };

  const demoteToUser = async (uid) => {
    await axios.put(`http://localhost:3001/api/users/demote/${uid}`);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const approvedUsers = users.filter((u) => u.approved).length;
  const pendingUsers = users.filter((u) => !u.approved).length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <div style={styles.statsRow}>
          <div style={styles.card}><span>Total Users</span><strong>{totalUsers}</strong></div>
          <div style={styles.card}><span>Admins</span><strong>{totalAdmins}</strong></div>
          <div style={styles.card}><span>Approved</span><strong>{approvedUsers}</strong></div>
          <div style={styles.card}><span>Pending</span><strong>{pendingUsers}</strong></div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} style={idx % 2 === 0 ? styles.altRow : {}}>
                  <td>{u.email}</td>
                  <td>{`${u.firstName || ""} ${u.lastName || ""}`}</td>
                  <td>{u.role}</td>
                  <td>{u.approved ? "✅ Approved" : "⏳ Pending"}</td>
                  <td style={styles.actions}>
                    {!u.approved && (
                      <button style={styles.btnBlue} onClick={() => approveUser(u.id)}>Approve</button>
                    )}
                    <button style={styles.btnRed} onClick={() => deleteUser(u.id)}>Delete</button>
                    {u.role === "user" && u.approved && (
                      <button style={styles.btnGreen} onClick={() => promoteToAdmin(u.id)}>Promote</button>
                    )}
                    {u.role === "admin" && (
                      <button style={styles.btnGray} onClick={() => demoteToUser(u.id)}>Demote</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#0d0d0d",
    color: "#fff",
    minHeight: "100vh",
    padding: "40px 0",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "95%",
    maxWidth: "1100px",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    fontSize: "38px",
    color: "#ffd700",
    textAlign: "center",
    marginBottom: "40px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "22px",
    marginBottom: "45px",
  },
  card: {
    background: "linear-gradient(135deg, #1b1b1b, #111)",
    border: "1px solid #333",
    borderRadius: "14px",
    padding: "26px 30px",
    boxShadow: "0 0 12px rgba(255, 215, 0, 0.08)",
    textAlign: "center",
    fontSize: "17px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#141414",
    fontSize: "16px",
  },
  altRow: {
    backgroundColor: "#1c1c1c",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    paddingTop: "6px",
  },
  btnBlue: {
    background: "#007bff",
    color: "#fff",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  btnRed: {
    background: "#d72638",
    color: "#fff",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  btnGreen: {
    background: "#28a745",
    color: "#fff",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  btnGray: {
    background: "#555",
    color: "#fff",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default AdminDashboard;
