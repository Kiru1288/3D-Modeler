
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireRole({ children, allowedRoles }) {
  const { role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!allowedRoles.includes(role)) return <Navigate to="/3d-builder" replace />;

  return children;
}
