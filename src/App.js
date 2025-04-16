import React, { useState } from "react";
import DrawingBoard from "./Components/DrawingBoard";
import ThreeDCanvas from "./Components/ThreeDCanvas";
import { FloorPlanProvider } from "./context/FloorPlanContext";
import StartScreen from "./Components/StartScreen"; 
import "./styling/App.css";

function App() {
  // State Variables:
  // eslint-disable-next-line no-unused-vars
  const [colorScheme, setColorScheme] = useState("light");
  // eslint-disable-next-line no-unused-vars
  const [currentTool, setCurrentTool] = useState(null);

  // New: Track the project name, if null show StartScreen first
  const [projectName, setProjectName] = useState(null);

  // 8. Conditional Rendering
  // If no project name is entered, show StartScreen before rendering the main app
  if (!projectName) {
    return <StartScreen onStart={setProjectName} />;
  }

  // 9. Rendering the App UI
  return (
    <FloorPlanProvider>
      <div className={`App ${colorScheme}`}>
        <DrawingBoard currentTool={currentTool} />
        <ThreeDCanvas />
      </div>
    </FloorPlanProvider>
  );
}

export default App;
