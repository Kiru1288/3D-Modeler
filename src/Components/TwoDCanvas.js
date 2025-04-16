import React, { useRef, useState, forwardRef } from "react";
import { Stage, Layer, Line, Text } from "react-konva";

const GRID_SIZE = 20;
const snapToGrid = (value, enabled) =>
  enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;

const TwoDCanvas = forwardRef(({ width, height, onDraw, onSwitchMode, unit = "Meters" }, ref) => {
  const [walls, setWalls] = useState([]);
  const [newWall, setNewWall] = useState(null);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [history, setHistory] = useState([[]]);
  const [redoStack, setRedoStack] = useState([]);
  const internalStageRef = useRef(null);

  // Combine forwarded ref with internal ref
  const setCombinedRef = (node) => {
    internalStageRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const getWallLength = (wall) => {
    if (!wall) return 0;
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    const meters = pixels / 100;
    return unit === "Feet" ? meters * 3.28084 : meters;
  };

  const saveToHistory = (newWalls) => {
    setHistory((prev) => [...prev, newWalls]);
    setRedoStack([]);
  };

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = {
      x: snapToGrid(pos.x, snapEnabled),
      y: snapToGrid(pos.y, snapEnabled),
    };

    if (!newWall) {
      setNewWall({
        x1: snappedPos.x,
        y1: snappedPos.y,
        x2: snappedPos.x,
        y2: snappedPos.y,
      });
    }
  };

  // Define a colorMap and use it below for drawing walls
  const colorMap = {
    room: "rgb(173, 216, 230)",      // Light Blue
    wall: "rgb(169, 169, 169)",      // Dark Gray
    surface: "rgb(210, 180, 140)",   // Tan
    door: "rgb(139, 69, 19)",        // Saddle Brown
    window: "rgb(135, 206, 250)",    // Light Sky Blue
    beam: "rgb(105, 105, 105)",      // Dim Gray
    column: "rgb(139, 0, 0)",        // Dark Red
  };

  const handleMouseMove = (e) => {
    if (newWall) {
      const pos = e.target.getStage().getPointerPosition();
      const snappedPos = {
        x: snapToGrid(pos.x, snapEnabled),
        y: snapToGrid(pos.y, snapEnabled),
      };
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
      {/* Top Toolbar - Only Upload + Toggle */}
      <div
        className="toolbar black-gold-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 15px"
        }}
      >
        {/* Upload Button */}
        <button className="button-31" onClick={() => {
          const canvas = document.querySelector("canvas");
          if (!canvas) return;
          const image = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = image;
          link.download = "floorplan.png";
          link.click();
        }}>
          📁 Upload 2D Floorplan
        </button>
  
        {/* 2D/3D Toggle Button */}
        <button className="button-31" onClick={() => {
          onSwitchMode();
          console.log("✅ 2D/3D Toggle clicked");
        }}>
          🔄 2D/3D
        </button>
      </div>
  
      {/* Canvas Section */}
      <Stage
        width={width}
        height={height}
        ref={setCombinedRef}
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
              stroke={colorMap.wall}
              strokeWidth={4}
              shadowBlur={5}
              shadowColor="rgba(0, 0, 0, 0.3)"
            />
          ))}
          {newWall && (() => {
            const midX = (newWall.x1 + newWall.x2) / 2;
            const midY = (newWall.y1 + newWall.y2) / 2 - 20;
            const clampedMidY = Math.max(10, midY);
            const textValue = `${getWallLength(newWall).toFixed(2)} ${unit}`;
            const textWidth = textValue.length * 8;
  
            return (
              <Text
                x={midX - textWidth / 2}
                y={clampedMidY}
                text={textValue}
                fontSize={14}
                fill="white"
                stroke="black"
                strokeWidth={1}
                shadowColor="black"
                shadowBlur={2}
                shadowOffset={{ x: 1, y: 1 }}
                shadowOpacity={0.4}
              />
            );
          })()}
        </Layer>
      </Stage>
    </div>
  );
  
});

export default TwoDCanvas;
