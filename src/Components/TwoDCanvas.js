import React, { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";

const GRID_SIZE = 20;
const snapToGrid = (value, enabled) => (enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value);

const TwoDCanvas = ({ width, height, onDraw, onSwitchMode }) => {
  const [walls, setWalls] = useState([]);
  const [newWall, setNewWall] = useState(null);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [history, setHistory] = useState([[]]);
  const [redoStack, setRedoStack] = useState([]);
  const stageRef = useRef(null);

  const saveToHistory = (newWalls) => {
    setHistory((prev) => [...prev, newWalls]);
    setRedoStack([]);
  };

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = { x: snapToGrid(pos.x, snapEnabled), y: snapToGrid(pos.y, snapEnabled) };

    if (!newWall) {
      setNewWall({ x1: snappedPos.x, y1: snappedPos.y, x2: snappedPos.x, y2: snappedPos.y });
    }
  };

  const handleMouseMove = (e) => {
    if (newWall) {
      const pos = e.target.getStage().getPointerPosition();
      const snappedPos = { x: snapToGrid(pos.x, snapEnabled), y: snapToGrid(pos.y, snapEnabled) };
      setNewWall({ ...newWall, x2: snappedPos.x, y2: snappedPos.y });
    }
  };

  const handleMouseUp = () => {
    if (newWall) {
      const updatedWalls = [...walls, newWall];
      setWalls(updatedWalls);
      saveToHistory(updatedWalls);
      onDraw(updatedWalls);
      setNewWall(null);
    }
  };

  const undo = () => {
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

  const redo = () => {
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

  const resetCanvas = () => {
    setWalls([]);
    setHistory([[]]);
    setRedoStack([]);
    console.log("🗑️ Reset triggered - Everything cleared");
  };

  return (
    <div className="canvas-container">
      {/* 🔥 Black-Gold Toolbar with 2D/3D Button Inside */}
      <div className="toolbar black-gold-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px" }}>
        {/* Left Buttons */}
        <div>
          <button className="button-31" onClick={() => {
            setGridVisible((prev) => !prev);
            console.log("✅ Grid toggled:", !gridVisible);
          }}>
            {gridVisible ? "Hide Grid" : "Show Grid"}
          </button>

          <button className="button-31" onClick={() => {
            setSnapEnabled((prev) => !prev);
            console.log("✅ Snap toggled:", !snapEnabled);
          }}>
            Snap: {snapEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* 🔄 Centered 2D/3D Toggle Button - Now Inside Toolbar */}
        <div style={{ textAlign: "center" }}>
          <button className="button-31" onClick={() => {
            onSwitchMode();
            console.log("✅ 2D/3D Toggle clicked");
          }}>
            🔄 2D/3D
          </button>
        </div>

        {/* Right Buttons */}
        <div>
          <button className="button-31" onClick={() => {
            undo();
            console.log("✅ Undo clicked");
          }}>⏪ Undo</button>

          <button className="button-31" onClick={() => {
            redo();
            console.log("✅ Redo clicked");
          }}>⏩ Redo</button>

          <button className="button-31" onClick={() => {
            resetCanvas();
            console.log("✅ Reset clicked");
          }}>🗑️ Reset</button>
        </div>
      </div>

      {/* 🎨 Canvas */}
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-gray-200"
      >
        <Layer>
          {gridVisible &&
            Array.from({ length: Math.ceil(width / GRID_SIZE) }).map((_, i) => (
              <Line key={`v-${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, height]} stroke="#e0e0e0" strokeWidth={1} />
            ))}
          {gridVisible &&
            Array.from({ length: Math.ceil(height / GRID_SIZE) }).map((_, i) => (
              <Line key={`h-${i}`} points={[0, i * GRID_SIZE, width, i * GRID_SIZE]} stroke="#e0e0e0" strokeWidth={1} />
            ))}

          {walls.map((wall, i) => (
            <Line
              key={i}
              points={[wall.x1, wall.y1, wall.x2, wall.y2]}
              stroke="black"
              strokeWidth={4}
              shadowBlur={5}
              shadowColor="rgba(0, 0, 0, 0.3)"
            />
          ))}

          {newWall && (
            <Line
              points={[newWall.x1, newWall.y1, newWall.x2, newWall.y2]}
              stroke="gray"
              strokeWidth={2}
              dash={[10, 5]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default TwoDCanvas;
