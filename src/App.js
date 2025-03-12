import React, { useState } from "react";
import Toolbar from "./Components/Toolbar";
import DrawingBoard from "./Components/DrawingBoard";
import "./styling/App.css";
import { FloorPlanProvider } from './context/FloorPlanContext';
import ThreeDCanvas from "./Components/ThreeDCanvas";

const TOOLS = Object.freeze({
  DRAW_ROOM: 'drawRoom',
  ADD_SURFACE: 'addSurface',
  PLACE_DOOR: 'placeDoor',
  PLACE_WINDOW: 'placeWindow',
  PLACE_STRUCTURAL: 'placeStructural'
});

function App() {
  // State Variables:
  // floorplan: Holds the data (an image URL) for a 2D floorplan that the user uploads.
  // colorScheme: Stores the current color scheme (like "light", "dark", etc.) to adjust the look of your app.
  // currentTool: Keeps track of which tool (e.g., draw room, add surface, place door, etc.) is currently active.
  const [floorplan, setFloorplan] = useState(null);
  const [colorScheme, setColorScheme] = useState("light");
  const [currentTool, setCurrentTool] = useState(null);

  // 1. Handler for uploading a 2D floorplan image
  // Purpose:
  // Opens a file dialog to let the user select an image file, then reads it as a data URL and updates the floorplan state.
  // How It Works:
  // - A hidden file input is created.
  // - When a file is selected, a FileReader converts it into a format the browser can display.
  // - The result is stored in the floorplan state.
  const handleUploadFloorplan = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Accept images; adjust if needed

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFloorplan(e.target.result);
          console.log("Floorplan uploaded.");
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  // 2. Handler for drawing a room
  // Purpose:
  // Activates the "draw room" tool.
  // How It Works:
  // Sets the currentTool state to "drawRoom", which later tells the DrawingBoard to start drawing a room when the user interacts with it.
  const handleDrawRoom = () => {
    setCurrentTool(TOOLS.DRAW_ROOM);
    console.log("Switched to Draw Room mode.");
  };

  // 3. Handler for adding a surface/floor texture
  // Purpose:
  // Switches the current tool to adding a surface (e.g., applying floor texture).
  // How It Works:
  // Sets the currentTool state to "addSurface".
  const handleAddSurface = () => {
    setCurrentTool(TOOLS.ADD_SURFACE);
    console.log("Switched to Add Surface mode.");
  };

  // 4. Handler for placing a door (with type provided)
  // Purpose:
  // Activates the door placement tool.
  // How It Works:
  // Takes a parameter (doorType) and updates currentTool to a string that includes the door type (like "placeDoor-single"). This lets the DrawingBoard know which type of door to place.
  const handlePlaceDoor = (doorType) => {
    setCurrentTool(`placeDoor-${doorType}`);
    console.log("Switched to Place Door mode:", doorType);
  };

  // 5. Handler for placing a window (with type provided)
  // Purpose:
  // Activates the window placement tool.
  // How It Works:
  // Similar to the door handler, it updates currentTool with the specific window type.
  const handlePlaceWindow = (windowType) => {
    setCurrentTool(`placeWindow-${windowType}`);
    console.log("Switched to Place Window mode:", windowType);
  };

  // 6. Handler for placing structural elements
  // Purpose:
  // Activates the tool for placing structural elements (e.g., beams, columns).
  // How It Works:
  // Updates currentTool accordingly.
  const handlePlaceStructural = () => {
    setCurrentTool("placeStructural");
    console.log("Switched to Place Structural mode.");
  };

  // 7. Handler for changing the color scheme
  // Purpose:
  // Updates the visual theme of your app.
  // How It Works:
  // Changes the colorScheme state to the selected scheme (like "light" or "dark") which then applies different styles through CSS.
  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    console.log("Color scheme changed to:", scheme);
  };

  // 8. Rendering the App
  // App Container:
  // The <div> uses dynamic class names: it always has "App" and also includes the current color scheme (like "light" or "dark").
  // This allows your CSS to apply different styles based on the theme.
  // Toolbar Component:
  // Receives all the handler functions as props. When you click a button on the toolbar, the corresponding handler is executed.
  // DrawingBoard Component:
  // Receives the currentTool and floorplan props so it can display the uploaded floorplan and adjust its behavior based on the active tool.
  return (
    <FloorPlanProvider>
      <div className={`App ${colorScheme}`}>
        <Toolbar
          onUploadFloorplan={handleUploadFloorplan}
          onDrawRoom={handleDrawRoom}
          onAddSurface={handleAddSurface}
          onPlaceDoor={handlePlaceDoor}
          onPlaceWindow={handlePlaceWindow}
          onPlaceStructural={handlePlaceStructural}
          onColorSchemeChange={handleColorSchemeChange}
        />
        <DrawingBoard currentTool={currentTool} floorplan={floorplan} />
        <ThreeDCanvas />
      </div>
    </FloorPlanProvider>
  );
}

export default App;
