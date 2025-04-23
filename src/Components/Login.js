import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { googleLogin, facebookLogin, yahooLogin } from "../firebase/firebaseAuth";
import artreumLogo from '../Assets/artreum-logo.png';

const Login = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSocialLogin = async (providerFn, label) => {
    try {
      const { user, role } = await providerFn();
      if (!user?.email) throw new Error("No user info received.");

      localStorage.setItem("token", "social-login");
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", role);
      localStorage.setItem("approved", "true");

      setMessage(`✅ ${label} login: ${user.email} (${role})`);

      setTimeout(() => {
        navigate(role === "admin" ? "/admin-landing" : "/");
      }, 1000);
    } catch (err) {
      // ✅ Redirect unapproved users
      if (err.message.toLowerCase().includes("not approved")) {
        navigate("/pending-approval");
      } else {
        setMessage(`❌ ${label} login failed: ${err.message}`);
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={artreumLogo} alt="Artreum Logo" style={styles.logo} />
        <h1 style={styles.heading}>Welcome</h1>
        <p style={styles.subheading}>Login with your social account</p>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.btnGroup}>
          <button onClick={() => handleSocialLogin(googleLogin, "Google")} style={{ ...styles.button, ...styles.google }}>
            <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" style={styles.icon} />
            Continue with Google
          </button>
          <button onClick={() => handleSocialLogin(facebookLogin, "Facebook")} style={{ ...styles.button, ...styles.facebook }}>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/facebook-new.png" alt="Facebook" style={styles.icon} />
            Continue with Facebook
          </button>
          <button onClick={() => handleSocialLogin(yahooLogin, "Yahoo")} style={{ ...styles.button, ...styles.yahoo }}>
            <img src="https://img.icons8.com/color/20/000000/yahoo.png" alt="Yahoo" style={styles.icon} />
            Continue with Yahoo
          </button>
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine}></span>
        </div>

        <p style={styles.footer}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#000000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#111111",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    border: "0.5px solid rgba(255, 255, 255, 0.1)",
  },
  logo: {
    width: "280px",
    marginBottom: "32px",
    filter: "brightness(1.1) contrast(1.1)",
  },
  heading: {
    fontSize: "36px",
    color: "#ffffff",
    marginBottom: "12px",
    fontWeight: "400",
    letterSpacing: "1px",
    fontFamily: "'Outfit', sans-serif",
  },
  subheading: {
    fontSize: "16px",
    color: "#888888",
    marginBottom: "32px",
    letterSpacing: "0.5px",
    fontFamily: "'Inter', sans-serif",
  },
  message: {
    marginBottom: "16px",
    color: "#ff4444",
    fontWeight: "500",
    fontSize: "14px",
  },
  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  button: {
    padding: "12px 20px",
    fontSize: "14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },
  icon: {
    height: "20px",
    width: "20px",
  },
  google: {
    backgroundColor: "#ffffff",
    color: "#333333",
    border: "1px solid #333333",
  },
  facebook: {
    backgroundColor: "#1877f2",
    color: "#ffffff",
  },
  yahoo: {
    backgroundColor: "#6001d2",
    color: "#ffffff",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "0.5px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    padding: "0 12px",
    color: "#888888",
    fontSize: "12px",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif",
  },
  footer: {
    marginTop: "24px",
    color: "#888888",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
  },
  link: {
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login;
