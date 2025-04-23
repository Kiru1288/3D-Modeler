import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Added Link
import { googleLogin, facebookLogin, yahooLogin } from "../firebase/firebaseAuth";

const Signup = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (providerFn, label) => {
    try {
      const user = await providerFn();
      setMessage(`✅ Logged in as ${user.email}`);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage(`❌ ${label} Login Failed: ${err.message}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Create Your Account</h1>
        <p style={styles.subheading}>Choose your preferred sign-up method</p>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.btnGroup}>
          <button onClick={() => handleLogin(googleLogin, "Google")} style={{ ...styles.button, ...styles.google }}>
            <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" style={styles.icon} />
            Sign up with Google
          </button>

          <button onClick={() => handleLogin(facebookLogin, "Facebook")} style={{ ...styles.button, ...styles.facebook }}>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/facebook-new.png" alt="Facebook" style={styles.icon} />
            Sign up with Facebook
          </button>

          <button onClick={() => handleLogin(yahooLogin, "Yahoo")} style={{ ...styles.button, ...styles.yahoo }}>
            <img src="https://img.icons8.com/color/20/000000/yahoo.png" alt="Yahoo" style={styles.icon} />
            Sign up with Yahoo
          </button>
        </div>

        <p style={styles.footer}>Your account will require admin approval before access.</p>

        {/* ✅ Login Link */}
        <p style={styles.loginLink}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: "linear-gradient(to bottom right, #0f0f0f, #1c1c1c)",
    minHeight: "100vh",
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
    marginBottom: "25px",
  },
  message: {
    color: "#ff5555",
    fontWeight: "600",
    marginBottom: "20px",
  },
  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
  },
  icon: {
    height: "20px",
    width: "20px",
  },
  google: {
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ddd",
  },
  facebook: {
    backgroundColor: "#1877f2",
    color: "#fff",
  },
  yahoo: {
    backgroundColor: "#6001d2",
    color: "#fff",
  },
  footer: {
    marginTop: "20px",
    color: "#888",
    fontSize: "14px",
  },
  loginLink: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#aaa",
  },
  link: {
    color: "gold",
    fontWeight: "bold",
    textDecoration: "none",
  },
};

export default Signup;
