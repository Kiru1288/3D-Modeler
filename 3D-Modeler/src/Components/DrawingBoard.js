import React, { useState } from "react";
import TwoDCanvas from "./TwoDCanvas";
import ThreeDCanvas from "./ThreeDCanvas";
import Toolbar from "./Toolbar";

const DrawingBoard = () => {
  const [is3DMode, setIs3DMode] = useState(false);
  const [walls, setWalls] = useState([]);

  const handleSwitchMode = () => {
    console.log("🚀 Switching to", is3DMode ? "2D" : "3D");
    setIs3DMode((prev) => !prev);
  };

  const updateWalls = (newWalls) => {
    console.log("✅ Walls updated in DrawingBoard:", newWalls);
    setWalls(newWalls.map((wall) => ({
      x1: wall.x1, y1: wall.y1,
      x2: wall.x2, y2: wall.y2
    }))); // Ensure only x1, y1, x2, y2 are stored
  };

  const handleClearCanvas = () => {
    console.log("🧹 Canvas Cleared!");
    setWalls([]);  // Clears all stored walls
  };

  return (
    <div className="w-screen h-screen relative bg-gray-100">
      <Toolbar onSwitchMode={handleSwitchMode} onClearCanvas={handleClearCanvas} />

      {is3DMode ? (
        <ThreeDCanvas moves={walls} is3DMode={is3DMode} />
      ) : (
        <TwoDCanvas width={window.innerWidth} height={window.innerHeight} onDraw={updateWalls} />
      )}
    </div>
  );
};

export default DrawingBoard;
