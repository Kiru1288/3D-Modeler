import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const approved = localStorage.getItem("approved"); // ✅ stored after login

    const isLoggedIn = !!token || !!email;
    const hasValidRole = allowedRoles.length === 0 || allowedRoles.includes(role);

    // ✅ Must be logged in, approved, and have valid role
    setIsAllowed(isLoggedIn && approved === "true" && hasValidRole);
    setAuthChecked(true);
  }, [allowedRoles]);

  if (!authChecked) return null; // avoid flicker

  return isAllowed ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
