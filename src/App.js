import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import DrawingBoard from "./Components/DrawingBoard";
import ThreeDCanvas from "./Components/ThreeDCanvas";
import { FloorPlanProvider } from "./context/FloorPlanContext";
import StartScreen from "./Components/StartScreen";
import ExampleGallery from "./Components/ExampleGallery";
import "./styling/App.css";

function App() {
  const [colorScheme, setColorScheme] = useState("light");
  const [currentTool, setCurrentTool] = useState(null);
  const [projectName, setProjectName] = useState(null);

  const location = useLocation();

  // Only show StartScreen on "/" route
  if (!projectName && location.pathname === "/") {
    return <StartScreen onStart={setProjectName} />;
  }

  return (
    <FloorPlanProvider>
      <div className={`App ${colorScheme}`}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <DrawingBoard currentTool={currentTool} />
                <ThreeDCanvas />
              </>
            }
          />
          <Route path="/examples" element={<ExampleGallery />} />
        </Routes>
      </div>
    </FloorPlanProvider>
  );
}

// Wrap with Router
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
