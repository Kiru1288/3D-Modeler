import React, { useState } from "react";
import TwoDCanvas from "./TwoDCanvas";
import ThreeDCanvas from "./ThreeDCanvas";
import Toolbar from "./Toolbar";

const DrawingBoard = () => {
  const [is3DMode, setIs3DMode] = useState(false);
  const [walls, setWalls] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [redoStack, setRedoStack] = useState([]);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const handleSwitchMode = () => {
    setIs3DMode((prev) => !prev);
    console.log("🚀 Switching to", is3DMode ? "2D" : "3D");
  };

  const updateWalls = (newWalls) => {
    setWalls(newWalls);
    setHistory((prev) => [...prev, newWalls]);
    setRedoStack([]);
    console.log("✅ Walls updated in DrawingBoard:", newWalls);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const prevStep = history[history.length - 2];
      setRedoStack((prev) => [history[history.length - 1], ...prev]);
      setHistory((prev) => prev.slice(0, -1));
      setWalls(prevStep);
      console.log("⏪ Undo performed:", prevStep);
    } else {
      console.warn("⚠️ Undo not possible, no previous step.");
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextStep = redoStack[0];
      setRedoStack((prev) => prev.slice(1));
      setHistory((prev) => [...prev, nextStep]);
      setWalls(nextStep);
      console.log("⏩ Redo performed:", nextStep);
    } else {
      console.warn("⚠️ Redo not possible, no further steps.");
    }
  };

  const handleReset = () => {
    setWalls([]);
    setHistory([[]]);
    setRedoStack([]);
    console.log("🗑️ Reset triggered - Everything cleared");
  };

  const handleToggleGrid = () => {
    setGridVisible((prev) => !prev);
    console.log("📏 Grid toggled:", !gridVisible);
  };

  const handleToggleSnap = () => {
    setSnapEnabled((prev) => !prev);
    console.log("🧲 Snap toggled:", !snapEnabled);
  };

  return (
    <div className="w-screen h-screen relative bg-gray-100">
      <Toolbar
        onSwitchMode={handleSwitchMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearCanvas={handleReset}
        onToggleGrid={handleToggleGrid}
        onToggleSnap={handleToggleSnap}
      />

      {is3DMode ? (
        <ThreeDCanvas moves={walls} is3DMode={is3DMode} />
      ) : (
        <TwoDCanvas
          width={window.innerWidth}
          height={window.innerHeight}
          onDraw={updateWalls}
          gridVisible={gridVisible}
          snapEnabled={snapEnabled}
          onSwitchMode={handleSwitchMode}  // ✅ FIX: Now correctly passing the function
        />
      )}
    </div>
  );
};

export default DrawingBoard;
