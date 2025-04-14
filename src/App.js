import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DrawingBoard from "./Components/DrawingBoard";
import ThreeDCanvas from "./Components/ThreeDCanvas";
import StartScreen from "./Components/StartScreen";
import AdminDashboard from "./Backend/AdminDashboard";
import SuperAdminPanel from "./Backend/SuperAdminPanel";

import { FloorPlanProvider } from "./context/FloorPlanContext";
import { AuthProvider } from "./Backend/AuthContext";
import Signup from "./Backend/Signup";
import Login from "./Backend/Login";
import PendingApproval from "./Backend/PendingApproval";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Backend/firebaseConfig";


function App() {
  const [projectName, setProjectName] = useState(null);
  const createTestSuperAdmin = async () => {
    try {
      await createUserWithEmailAndPassword(auth, "super@admin.com", "Test123!");
      console.log("✅ Super admin created");
    } catch (err) {
      console.error("⚠️ Error creating super admin:", err.message);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <FloorPlanProvider>
          <Routes>
            {!projectName && (
              <Route path="*" element={<StartScreen onStart={setProjectName} />} />
            )}

            {projectName && (
              <Route
                path="/"
                element={
                  <div className="App">
                    <DrawingBoard />
                    <ThreeDCanvas />
                  </div>
                }
              />
            )}

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/super-admin/panel" element={<SuperAdminPanel />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
<Route path="/login" element={<Login />} />
          </Routes>
        </FloorPlanProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
