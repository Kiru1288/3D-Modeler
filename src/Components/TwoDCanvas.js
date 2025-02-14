import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";

const GRID_SIZE = 20;
const snapToGrid = (value, enabled) => (enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value);

const TwoDCanvas = ({ width, height, settings, onDraw, clearTrigger }) => {
  const [walls, setWalls] = useState([]);
  const [newWall, setNewWall] = useState(null);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const stageRef = useRef(null);
  
  useEffect(() => {
    setWalls([]);
    setHistory([]);
    setCurrentStep(-1);
  }, [clearTrigger]);

  const saveToHistory = (newWalls) => {
    const newHistory = [...history.slice(0, currentStep + 1), newWalls];
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
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
    if (currentStep > 0) {
      setWalls(history[currentStep - 1]);
      setCurrentStep(currentStep - 1);
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setWalls(history[currentStep + 1]);
      setCurrentStep(currentStep + 1);
    }
  };

  const resetCanvas = () => {
    setWalls([]);
    setHistory([]);
    setCurrentStep(-1);
  };

  return (
    <div className="canvas-container">
      <div className="toolbar">
        
      </div>
      
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
