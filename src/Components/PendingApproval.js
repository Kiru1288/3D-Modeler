// src/Components/PendingApproval.js
import React from "react";

const PendingApproval = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🕒 Awaiting Approval</h2>
        <p style={styles.message}>
          Your account has been created successfully.<br />
          Please wait while an admin approves your access.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom right, #0f0f0f, #1c1c1c)",
    padding: "30px",
  },
  card: {
    background: "#1e1e1e",
    padding: "40px",
    borderRadius: "16px",
    border: "1px solid gold",
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.1)",
    textAlign: "center",
    maxWidth: "450px",
    width: "100%",
  },
  title: {
    color: "gold",
    fontSize: "28px",
    marginBottom: "20px",
  },
  message: {
    color: "#ccc",
    fontSize: "16px",
    lineHeight: "1.6",
  },
};

export default PendingApproval;
