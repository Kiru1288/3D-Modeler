import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../Backend/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(null);
  const [approved, setApproved] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔄 Auth state changed:", currentUser ? currentUser.email : "No user");

      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || null);

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setRole(userData.role);
            setApproved(userData.approved !== undefined ? userData.approved : true);

            // ✅ Hardcode super-admin role for testing
            if (currentUser.email === "super@admin.com") {
              setRole("super-admin");
              setApproved(true);
              return;
            }

          } else {
            const pendingRef = doc(db, "pendingUsers", currentUser.uid);
            const pendingSnap = await getDoc(pendingRef);

            if (pendingSnap.exists()) {
              setRole("user");
              setApproved(false);
              console.log("⏳ Found user in pendingUsers");
            } else {
              setRole(null);
              setApproved(false);
            }
          }

        } catch (error) {
          console.error("⚠️ Error fetching user role:", error);
          setRole(null);
          setApproved(false);
        }
      } else {
        setUser(null);
        setEmail(null);
        setRole(null);
        setApproved(false);
      }

      setLoading(false);
    });

    return () => {
      console.log("🛑 Unsubscribing from auth state listener");
      unsubscribe();
    };
  }, []);

  // ✅ Redirect Based on Role — ⛔ approval check temporarily disabled
  useEffect(() => {
    if (!user || loading) return;

    console.log(`🚀 Checking Redirect | Role: ${role} | Approved: ${approved}`);

    /*
    // 🔒 Disable approval check during testing
    if (!approved) {
      console.warn("⏳ User is not approved. Redirecting to /pending-approval...");
      if (pathname !== "/pending-approval") {
        navigate("/pending-approval", { replace: true });
      }
      return;
    }
    */

    if (role === "super-admin") {
      console.log("✅ Super Admin logged in. Can access everything.");
      if (pathname === "/") navigate("/super-admin/panel", { replace: true });
    } else if (role === "admin") {
      console.log("✅ Redirecting Admin to /admin/dashboard");
      if (pathname === "/") navigate("/admin/dashboard", { replace: true });
    } else {
      console.log("✅ Redirecting User to /3d-builder");
      if (pathname === "/") navigate("/3d-builder", { replace: true });
    }
  }, [user, role, approved, loading]);

  // ✅ Role Guard — ⛔ disable role restrictions for testing
  useEffect(() => {
    if (!user || loading) return;

    /*
    if (pathname.startsWith("/admin") && !["admin", "super-admin"].includes(role)) {
      console.warn(`🚨 Unauthorized access to ${pathname} by role: ${role}`);
      navigate("/3d-builder", { replace: true });
    }

    if (pathname.startsWith("/super-admin") && role !== "super-admin") {
      console.warn(`🚨 Unauthorized access to ${pathname} by role: ${role}`);
      navigate("/3d-builder", { replace: true });
    }
    */
  }, [user, role, pathname, loading]);

  return (
    <AuthContext.Provider value={{ user, role, email, approved, loading }}>
      {loading ? <p className="text-gray-500">Authenticating...</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
