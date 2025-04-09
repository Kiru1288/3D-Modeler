import React, { useState } from "react";
import Toolbar from "./Components/Toolbar";
import DrawingBoard from "./Components/DrawingBoard";
import ThreeDCanvas from "./Components/ThreeDCanvas";
import { FloorPlanProvider } from "./context/FloorPlanContext";
import StartScreen from "./Components/StartScreen"; 
import "./styling/App.css";

const TOOLS = Object.freeze({
  DRAW_ROOM: 'drawRoom',
  ADD_SURFACE: 'addSurface',
  PLACE_DOOR: 'placeDoor',
  PLACE_WINDOW: 'placeWindow',
  PLACE_STRUCTURAL: 'placeStructural'
});

function App() {
  // State Variables:
  const [floorplan, setFloorplan] = useState(null);
  const [colorScheme, setColorScheme] = useState("light");
  const [currentTool, setCurrentTool] = useState(null);

  // New: Track the project name, if null show StartScreen first
  const [projectName, setProjectName] = useState(null);

  // 1. Handler for uploading a 2D floorplan image
  const handleUploadFloorplan = () => {
    const canvas = document.querySelector("canvas"); 
    if (!canvas) {
      console.error("Canvas not found!");
      return;
    }
  
    try {
      const image = canvas.toDataURL("image/png"); 
      const link = document.createElement("a");
      link.href = image;
      link.download = "floorplan.png"; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading floor plan:", error);
    }
  };

  // 2. Handler for drawing a room
  const handleDrawRoom = () => {
    setCurrentTool(TOOLS.DRAW_ROOM);
    console.log("Switched to Draw Room mode.");
  };

  // 3. Handler for adding a surface/floor texture
  const handleAddSurface = () => {
    setCurrentTool(TOOLS.ADD_SURFACE);
    console.log("Switched to Add Surface mode.");
  };

  // 4. Handler for placing a door
  const handlePlaceDoor = (doorType) => {
    setCurrentTool(`placeDoor-${doorType}`);
    console.log("Switched to Place Door mode:", doorType);
  };

  // 5. Handler for placing a window
  const handlePlaceWindow = (windowType) => {
    setCurrentTool(`placeWindow-${windowType}`);
    console.log("Switched to Place Window mode:", windowType);
  };

  // 6. Handler for placing structural elements
  const handlePlaceStructural = () => {
    setCurrentTool("placeStructural");
    console.log("Switched to Place Structural mode.");
  };

  // 7. Handler for changing the color scheme
  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    console.log("Color scheme changed to:", scheme);
  };

  // 8. Conditional Rendering
  // If no project name is entered, show StartScreen before rendering the main app
  if (!projectName) {
    return <StartScreen onStart={setProjectName} />;
  }

  // 9. Rendering the App UI
  return (
    <FloorPlanProvider>
      <div className={`App ${colorScheme}`}>
        
        <DrawingBoard currentTool={currentTool} floorplan={floorplan} />
        <ThreeDCanvas />
      </div>
    </FloorPlanProvider>
  );
}

export default App;
