import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";

const GRID_SIZE = 20;

const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const TwoDCanvas = ({ width, height, settings, onDraw, clearTrigger }) => {
  const [walls, setWalls] = useState([]);
  const [newWall, setNewWall] = useState(null);
  const stageRef = useRef(null);

  useEffect(() => {
    setWalls([]); // Clear canvas when clearTrigger changes
  }, [clearTrigger]);

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = { x: snapToGrid(pos.x), y: snapToGrid(pos.y) };

    if (!newWall) {
      setNewWall({ x1: snappedPos.x, y1: snappedPos.y, x2: snappedPos.x, y2: snappedPos.y });
    }
  };

  const handleMouseMove = (e) => {
    if (newWall) {
      const pos = e.target.getStage().getPointerPosition();
      const snappedPos = { x: snapToGrid(pos.x), y: snapToGrid(pos.y) };
      setNewWall({ ...newWall, x2: snappedPos.x, y2: snappedPos.y });
    }
  };

  const handleMouseUp = () => {
    if (newWall) {
      const updatedWalls = [...walls, newWall];
      setWalls(updatedWalls);
      console.log("Walls in 2D:", updatedWalls); // Debug log
      onDraw(updatedWalls);
      setNewWall(null);
    }
  };

  return (
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
        {/* Draw Grid */}
        {Array.from({ length: Math.ceil(width / GRID_SIZE) }).map((_, i) => (
          <Line
            key={`v-${i}`}
            points={[i * GRID_SIZE, 0, i * GRID_SIZE, height]}
            stroke="#e0e0e0"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: Math.ceil(height / GRID_SIZE) }).map((_, i) => (
          <Line
            key={`h-${i}`}
            points={[0, i * GRID_SIZE, width, i * GRID_SIZE]}
            stroke="#e0e0e0"
            strokeWidth={1}
          />
        ))}

        {/* Draw Walls */}
        {walls.map((wall, i) => (
          <Line
            key={i}
            points={[wall.x1, wall.y1, wall.x2, wall.y2]}
            stroke="black"
            strokeWidth={4}
          />
        ))}

        {/* Temporary Wall Preview */}
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
  );
};

export default TwoDCanvas;
