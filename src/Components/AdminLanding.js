import React from "react";
import { useNavigate } from "react-router-dom";

const AdminLanding = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Welcome, Admin 👑</h1>
        <p style={styles.subheading}>Choose where you'd like to go</p>

        <div style={styles.btnGroup}>
          <button onClick={() => navigate("/admin")} style={{ ...styles.button, ...styles.panel }}>
            🛠 Admin Panel
          </button>
          <button onClick={() => navigate("/")} style={{ ...styles.button, ...styles.builder }}>
            🏗 3D Builder
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #0f0f0f, #1c1c1c)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },
  card: {
    background: "#1e1e1e",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "450px",
    width: "100%",
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.1)",
    border: "1px solid gold",
    textAlign: "center",
  },
  heading: {
    fontSize: "32px",
    color: "gold",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  subheading: {
    fontSize: "16px",
    color: "#bbb",
    marginBottom: "30px",
  },
  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  button: {
    padding: "14px 22px",
    fontSize: "16px",
    borderRadius: "8px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
  },
  panel: {
    backgroundColor: "#333",
    color: "gold",
    border: "2px solid gold",
  },
  builder: {
    backgroundColor: "gold",
    color: "#000",
  },
};

export default AdminLanding;
