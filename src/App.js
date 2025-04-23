import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import DrawingBoard from "./Components/DrawingBoard";
import ThreeDCanvas from "./Components/ThreeDCanvas";
import { FloorPlanProvider } from "./context/FloorPlanContext";
import StartScreen from "./Components/StartScreen";
import ExampleGallery from "./Components/ExampleGallery";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import AdminDashboard from "./Components/AdminDashboard";
import AdminLanding from "./Components/AdminLanding";
import PendingApproval from "./Components/PendingApproval"; // ✅ New Import
import ProtectedRoute from "./Components/ProtectedRoute";
import "./styling/App.css";

function App() {
  const [colorScheme, setColorScheme] = useState("light");
  const [currentTool, setCurrentTool] = useState(null);
  const [projectName, setProjectName] = useState(null);

  const location = useLocation();
  const isHomeRoute = location.pathname === "/";

  return (
    <FloorPlanProvider>
      <div className={`App ${colorScheme}`}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                {!projectName && isHomeRoute ? (
                  <StartScreen onStart={setProjectName} />
                ) : (
                  <>
                    <DrawingBoard currentTool={currentTool} />
                    <ThreeDCanvas />
                  </>
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/examples" element={<ExampleGallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending-approval" element={<PendingApproval />} /> {/* ✅ New Route */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-landing"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLanding />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </FloorPlanProvider>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
