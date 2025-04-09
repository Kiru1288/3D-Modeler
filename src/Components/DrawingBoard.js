import React, {
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react';
import { Stage, Layer, Line, Text } from "react-konva";
import { FiDownload, FiGrid, FiBox, FiTrash2, FiRotateCcw, FiRotateCw } from 'react-icons/fi';
import ThreeDCanvas from "./ThreeDCanvas";
import "./DrawingBoard.css";
import { FloorPlanContext } from '../context/FloorPlanContext';

// Global constants
const GRID_SPACING = 20;
const PROXIMITY_THRESHOLD = 25;

const SIDEBAR_WIDTH = 280;

function DrawingBoard() {
  // Shared floor plan context
  const { 
    walls, structures, 
    addWall, addStructure, 
    resetWalls, resetStructures 
  } = useContext(FloorPlanContext);
  
  



  // Local state declarations
  const [is3DMode, setIs3DMode] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [unit, setUnit] = useState("Meters");
  const [currentStructure, setCurrentStructure] = useState(null);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth - SIDEBAR_WIDTH,
    height: window.innerHeight
  });
  const [history, setHistory] = useState([{ walls: [], structures: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const stageRef = React.useRef(null); // Ref for Konva Stage

  
  

  // ---------------------------
  // History Management
  // ---------------------------
  const addToHistory = useCallback(() => {
    setHistory((prevHistory) => {
      const newState = { walls: [...walls], structures: [...structures] };
  
      if (
        prevHistory.length > 0 &&
        JSON.stringify(prevHistory[historyIndex]) === JSON.stringify(newState)
      ) {
        return prevHistory;
      }
  
      const updated = prevHistory.slice(0, historyIndex + 1);
      updated.push(newState);
      return updated;
    });
  
    setHistoryIndex((prev) => prev + 1);
  }, [walls, structures, historyIndex]);
  
  
    
  
  





  // ---------------------------
  // Event Listeners
  // ---------------------------
  // Window resize handler to update canvas size
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth - SIDEBAR_WIDTH,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------------------------
// Undo/Redo Handlers
// ---------------------------
const handleUndo = useCallback(() => {
  if (historyIndex > 0) {
    const prevState = history[historyIndex - 1];
    resetWalls(prevState.walls);
    resetStructures(prevState.structures);
    setHistoryIndex((prevIndex) => prevIndex - 1);
  }
}, [history, historyIndex, resetWalls, resetStructures]);

const handleRedo = useCallback(() => {
  if (historyIndex < history.length - 1) {
    const nextState = history[historyIndex + 1];
    resetWalls(nextState.walls);
    resetStructures(nextState.structures);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  }
}, [history, historyIndex, resetWalls, resetStructures]);

// ---------------------------
// Keyboard event for undo/redo
// ---------------------------
useEffect(() => {
  const handleKeyboard = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "z") {
        e.shiftKey ? handleRedo() : handleUndo();
        e.preventDefault();
      } else if (e.key.toLowerCase() === "y") {
        handleRedo();
        e.preventDefault();
      }
    }
  };

  window.addEventListener("keydown", handleKeyboard);
  return () => window.removeEventListener("keydown", handleKeyboard);
}, [handleRedo, handleUndo]); 


  // Record history whenever walls or structures change
  useEffect(() => {
    if (historyIndex === 0 || JSON.stringify(history[historyIndex]) !== JSON.stringify({ walls, structures })) {
      addToHistory();
    }
  }, [walls, structures, addToHistory, history, historyIndex]);
  

  // ---------------------------
  // File Upload Handler
  // ---------------------------
  const handleUpload = useCallback(() => {
    // const canvas = document.querySelector("canvas"); // Old way
    const stage = stageRef.current;
    if (!stage) {
      console.error("Konva Stage not found!");
      return;
    }
    try {
      // Get data URL from the stage
      const image = stage.toDataURL({ mimeType: "image/png" });
      const link = document.createElement("a");
      link.href = image;
      link.download = "floorplan.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading floor plan:", error);
    }
  }, [stageRef]); // Add stageRef to dependency array
  
  
  


  // ---------------------------
  // Mode & Tool Handling
  // ---------------------------
  // Handle tool selection with confirmation for unfinished room drawing
  const handleToolSelect = useCallback((toolType) => {
    console.log("Tool selected:", toolType); // ← add this
    setCurrentTool(toolType);
    setIsDrawing(false);
    setCurrentLine(null);
  }, []);
  


  const toggleView = useCallback(() => {
    setIs3DMode((prevMode) => !prevMode);
  }, []);
  // ---------------------------
  // Toolbar and Element Buttons
  // ---------------------------

  
  
  
  

  const elementButtons = [
    { id: 'wall', icon: '🧱', label: 'Wall', action: () => handleToolSelect('wall') },
    { id: 'room', icon: '🏠', label: 'Room', action: () => handleToolSelect('room') },
    { id: 'door', icon: '🚪', label: 'Door', action: () => handleToolSelect('door') },
    { id: 'window', icon: '🪟', label: 'Window', action: () => handleToolSelect('window') },
    { id: 'table', icon: '🪑', label: 'Table', action: () => handleToolSelect('table') },
    { id: 'sofa', icon: '🛋️', label: 'Sofa', action: () => handleToolSelect('sofa') },
    { id: 'bed', icon: '🛏️', label: 'Bed', action: () => handleToolSelect('bed') },
    { id: 'chair', icon: '💺', label: 'Chair', action: () => handleToolSelect('chair') },
    { id: 'kitchen', icon: '🍳', label: 'Kitchen', action: () => handleToolSelect('kitchen') },
    { id: 'bath', icon: '🛁', label: 'Bath', action: () => handleToolSelect('bath') },
    { id: 'toilet', icon: '🚽', label: 'Toilet', action: () => handleToolSelect('toilet') },
    { id: 'plant', icon: '🪴', label: 'Plant', action: () => handleToolSelect('plant') },
    { id: 'stairs', icon: '🪜', label: 'Stairs', action: () => handleToolSelect('stairs') },
    { id: 'carpet', icon: '🧶', label: 'Carpet', action: () => handleToolSelect('carpet') },
    { id: 'tiles', icon: '🔲', label: 'Tiles', action: () => handleToolSelect('tiles') },
    { id: 'lamp', icon: '💡', label: 'Lamp', action: () => handleToolSelect('lamp') },
  ];
  
  

  // ---------------------------
  // Mouse Event Handlers
  // ---------------------------
  const handleDrawStart = useCallback((e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    console.log("Mouse down at:", pos);
  
    const rawSnapped = {
      x: Math.round(pos.x / GRID_SPACING) * GRID_SPACING,
      y: Math.round(pos.y / GRID_SPACING) * GRID_SPACING,
    };
  
    const snappedOrConnected = findNearbyEndpoint(rawSnapped.x, rawSnapped.y, walls) || rawSnapped;
  
    if (["wall", "door", "window", "room"].includes(currentTool)) {
      setIsDrawing(true);
      setCurrentLine({
        x1: snappedOrConnected.x,
        y1: snappedOrConnected.y,
        x2: snappedOrConnected.x,
        y2: snappedOrConnected.y,
      });
      console.log(`Started drawing ${currentTool}`);
    } else if (["table", "sofa", "bed", "chair", "kitchen", "bath", "toilet", "plant", "stairs", "carpet", "tiles", "lamp"].includes(currentTool)) {
      // For furniture and decor items, add them directly at the clicked position
      addStructure({
        type: currentTool,
        x: snappedOrConnected.x,
        y: snappedOrConnected.y,
        width: getDefaultWidth(currentTool),
        height: getDefaultHeight(currentTool),
        rotation: 0
      });
      console.log(`Added ${currentTool} at position:`, snappedOrConnected);
    }
  }, [currentTool, walls, addStructure]);
     

  const findNearbyEndpoint = (x, y, walls) => {
    for (const wall of walls) {
      const endpoints = [
        { x: wall.x1, y: wall.y1 },
        { x: wall.x2, y: wall.y2 },
      ];
  
      for (const point of endpoints) {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        if (distance <= PROXIMITY_THRESHOLD) {
          return point; 
        }
      }
    }
    return null;
  };
  
  

  const handleDrawEnd = useCallback(() => {
    if (isDrawing && currentLine) {
      const snappedStart = findNearbyEndpoint(currentLine.x1, currentLine.y1, walls) || {
        x: currentLine.x1,
        y: currentLine.y1
      };
      const snappedEnd = findNearbyEndpoint(currentLine.x2, currentLine.y2, walls) || {
        x: currentLine.x2,
        y: currentLine.y2
      };
      
      
      const newElement = {
        id: Date.now(),
        x1: snappedStart.x,
        y1: snappedStart.y,
        x2: snappedEnd.x,
        y2: snappedEnd.y,
        type: currentTool
      };
      
      
      if (snappedEnd.x !== currentLine.x2 || snappedEnd.y !== currentLine.y2) {
        console.log("🔗 Auto-snapped endpoint to:", snappedEnd);
      }
      
      if (["door", "window"].includes(currentTool)) {
        
  
        const width = Math.abs(currentLine.x2 - currentLine.x1);
const height = Math.abs(currentLine.y2 - currentLine.y1);
const x = Math.min(currentLine.x1, currentLine.x2);
const y = Math.min(currentLine.y1, currentLine.y2);

addStructure({
  id: Date.now(),
  x,
  y,
  width,
  height,
  type: currentTool
});
console.log("➕ Added window structure:", { x, y, width, height, type: currentTool });


} else if (["wall", "room"].includes(currentTool)) {
  addWall(newElement);

}

  
      setIsDrawing(false);
      setCurrentLine(null);
    }
  }, [isDrawing, currentTool, currentLine, addWall, addStructure, walls]);
  
  

  const handleDrawMove = useCallback((e) => {
    if (!isDrawing || !currentLine) return;

    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    const snappedPos = {
        x: Math.round(pos.x / GRID_SPACING) * GRID_SPACING,
        y: Math.round(pos.y / GRID_SPACING) * GRID_SPACING,
    };
    setCurrentLine((prev) => prev ? { ...prev, x2: snappedPos.x, y2: snappedPos.y } : null);


    
}, [isDrawing, currentLine]);

const getWallLength = (wall) => {
  if (!wall) return 0;
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const pixels = Math.sqrt(dx * dx + dy * dy);
  const meters = pixels / 100;
  return unit === "Feet" ? meters * 3.28084 : meters;
};


  
  

    
  


  
  const handleDoubleClick = useCallback(() => {
    if (currentTool === 'room' && currentStructure && currentStructure.points.length >= 4) {
      if (currentStructure) {
        addStructure(currentStructure);
      }
      setCurrentStructure(null);
      setCurrentTool(null);
    }
  }, [currentTool, currentStructure, addStructure]);

  // ---------------------------
  // Render Helpers
  // ---------------------------
  // Render grid lines based on canvas size and dark mode
  const renderGrid = useCallback(() => {
    const gridLines = [];
    const { width, height } = canvasSize;
  
    for (let i = 0; i < width; i += GRID_SPACING) {
      gridLines.push(
        <Line
          key={`v${i}`}
          points={[i, 0, i, height]}
          stroke={darkMode ? "#333" : "#ddd"}
          strokeWidth={i % 100 === 0 ? 1 : 0.5}
        />
      );
    }
  
    for (let i = 0; i < height; i += GRID_SPACING) {
      gridLines.push(
        <Line
          key={`h${i}`}
          points={[0, i, width, i]}
          stroke={darkMode ? "#333" : "#ddd"}
          strokeWidth={i % 100 === 0 ? 1 : 0.5}
        />
      );
    }
  
    return gridLines;
  }, [canvasSize, darkMode]);
  
  // Render structure based on its type
  const renderStructure = useCallback((structure) => {
    if (!structure) return null;
    switch (structure.type) {
     
      case 'door':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#8B4513" // brown
            strokeWidth={2}
            closed
          />
        );
      
      case 'window':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#1E90FF" // blue
            strokeWidth={2}
            closed
          />
        );
      
      case 'room':
        return (
          <Line
            key={structure.id}
            points={structure.points}
            stroke={darkMode ? "#fff" : "#000"}
            strokeWidth={2}
            closed
          />
        );

      case 'table':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#8B4513" // brown
            strokeWidth={2}
            closed
            fill="#A0522D" // sienna
          />
        );

      case 'sofa':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#D2691E" // chocolate
            strokeWidth={2}
            closed
            fill="#D2691E" // chocolate
          />
        );

      case 'bed':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#8B4513" // brown
            strokeWidth={2}
            closed
            fill="#CD853F" // peru
          />
        );

      case 'chair':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#A0522D" // sienna
            strokeWidth={2}
            closed
            fill="#A0522D" // sienna
          />
        );

      case 'kitchen':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#808080" // grey
            strokeWidth={2}
            closed
            fill="#C0C0C0" // silver
          />
        );

      case 'bath':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#ADD8E6" // light blue
            strokeWidth={2}
            closed
            fill="#ADD8E6" // light blue
          />
        );

      case 'toilet':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#FFFFFF" // white
            strokeWidth={2}
            closed
            fill="#F0F0F0" // off-white
          />
        );

      case 'plant':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#228B22" // forest green
            strokeWidth={2}
            closed
            fill="#32CD32" // lime green
          />
        );

      case 'stairs':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#8B4513" // brown
            strokeWidth={2}
            closed
            fill="#D2B48C" // tan
          />
        );

      case 'carpet':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#800080" // purple
            strokeWidth={1}
            closed
            fill="#DDA0DD" // plum
          />
        );

      case 'tiles':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#A9A9A9" // dark grey
            strokeWidth={1}
            closed
            fill="#D3D3D3" // light grey
          />
        );

      case 'lamp':
        return (
          <Line
            key={structure.id}
            points={[
              structure.x, structure.y,
              structure.x + structure.width, structure.y,
              structure.x + structure.width, structure.y + structure.height,
              structure.x, structure.y + structure.height,
              structure.x, structure.y
            ]}
            stroke="#FFD700" // gold
            strokeWidth={2}
            closed
            fill="#FFFFE0" // light yellow
          />
        );

      default:
        return null;
    }
  }, [darkMode]);

  // Helper function to get default width based on element type
  const getDefaultWidth = (type) => {
    switch(type) {
      case 'table': return 60;
      case 'sofa': return 80;
      case 'bed': return 100;
      case 'chair': return 40;
      case 'kitchen': return 120;
      case 'bath': return 80;
      case 'toilet': return 40;
      case 'plant': return 30;
      case 'stairs': return 80;
      case 'carpet': return 100;
      case 'tiles': return 100;
      case 'lamp': return 30;
      default: return 50;
    }
  };

  // Helper function to get default height based on element type
  const getDefaultHeight = (type) => {
    switch(type) {
      case 'table': return 60;
      case 'sofa': return 40;
      case 'bed': return 80;
      case 'chair': return 40;
      case 'kitchen': return 60;
      case 'bath': return 50;
      case 'toilet': return 40;
      case 'plant': return 30;
      case 'stairs': return 120;
      case 'carpet': return 100;
      case 'tiles': return 100;
      case 'lamp': return 30;
      default: return 50;
    }
  };

  // ---------------------------
  // Render JSX
  // ---------------------------
  

    
              
  return (
    <>
      <div className={`app-container ${!darkMode ? 'light-theme' : ''}`}>
        {/* Top Toolbar - Centered Upload + Toggle */}
        <div
  className="top-toolbar"
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    height: "60px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--highlight)",
    padding: "0 20px",
    zIndex: 100,
    position: "fixed",
    left: SIDEBAR_WIDTH,
    right: 0,
    top: 0,
  }}
>

  
  <button className="toolbar-btn" onClick={handleUpload} title="Download Floorplan">
    <FiDownload className="button-icon" />
  </button>

  <button
    className={`toolbar-btn ${is3DMode ? 'active' : ''}`}
    onClick={toggleView}
    title={is3DMode ? "Switch to 2D View" : "Switch to 3D View"}
  >
    {is3DMode ? <FiGrid className="button-icon" /> : <FiBox className="button-icon" />}
    <span className="button-label">
      {is3DMode ? "Switch to 2D" : "Switch to 3D"}
    </span>
  </button>

  <button className="toolbar-btn" onClick={() => {
    setCurrentTool(null);
    setCurrentLine(null);
    setIsDrawing(false);
    resetWalls([]);
    resetStructures([]);
    setHistory([{ walls: [], structures: [] }]);
    setHistoryIndex(0);
    console.log("🧼 Canvas cleared.");
  }} title="Clear Canvas">
    <FiTrash2 className="button-icon" />
    <span className="button-label">Clear Canvas</span>
  </button>


  <button className="toolbar-btn" onClick={handleUndo} title="Undo (Ctrl+Z)">
    <FiRotateCcw className="button-icon" />
    <span className="button-label">Undo</span>
  </button>

  <button className="toolbar-btn" onClick={handleRedo} title="Redo (Ctrl+Y)">
    <FiRotateCw className="button-icon" />
    <span className="button-label">Redo</span>
  </button>
</div>

        {/* Sidebar (Only for 2D Mode) */}
        {!is3DMode && (
          <div className="sidebar">
            <div className="elements-section">
              <h2>Add Elements</h2>
              <div className="elements-grid">
                {elementButtons.map((element) => (
                  <button
                    key={element.id}
                    className={`element-btn ${currentTool === element.id ? 'active' : ''}`}
                    onClick={element.action}
                  >
                    <span className="element-icon">{element.icon}</span>
                    <span className="element-label">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>
  
            <div className="settings-section">
              <h2>Settings</h2>
              <div className="settings-list">
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={() => setShowGrid(!showGrid)}
                  />
                  Show Grid
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={snapEnabled}
                    onChange={() => setSnapEnabled(!snapEnabled)}
                  />
                  Enable Snapping
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={!darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  Light Mode
                </label>
                <div className="setting-item">
                  <span>Unit:</span>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="unit-select"
                  >
                    <option value="Meters">Meters</option>
                    <option value="Feet">Feet</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Canvas Area */}
        <div className="canvas-area">
          {is3DMode ? (
           <ThreeDCanvas
           walls={walls.map((wall) => ({
             x1: wall.x1,
             y1: wall.y1,
             x2: wall.x2,
             y2: wall.y2,
             height: 30,
             thickness: 2,
             type: wall.type, 
           }))}
           structures={structures}
           is3DMode={is3DMode}
         />
         
          ) : (
            <Stage
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="drawing-stage"
              onMouseDown={handleDrawStart}
              onMouseMove={handleDrawMove}
              onMouseUp={handleDrawEnd}
              onDblClick={handleDoubleClick}
            >
              <Layer>
                {showGrid && renderGrid()}
                {walls.map((wall, i) => {
                  const midY = (wall.y1 + wall.y2) / 2 - 20;
                  const midX = (wall.x1 + wall.x2) / 2 + 15;
                  const textValue = `${getWallLength(wall).toFixed(2)} ${unit}`;
                  const textWidth = textValue.length * 7;
  
                  return (
                    <React.Fragment key={`wall-label-${i}`}>
                      <Line
  points={[wall.x1, wall.y1, wall.x2, wall.y2]}
  stroke={wall.type === 'room' ? 'purple' : 'gray'}
  strokeWidth={2}
/>


                      <Text
                        x={midX - textWidth / 2}
                        y={Math.max(midY, 10)}
                        text={textValue}
                        fontSize={13}
                        fontFamily="Orbitron, sans-serif"
                        fill="#FFD700"
                        stroke="black"
                        strokeWidth={0.6}
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOffset={{ x: 1, y: 1 }}
                        shadowOpacity={0.5}
                      />
                    </React.Fragment>
                  );
                })}
                {structures.map((structure, i) => renderStructure(structure))}
                {isDrawing &&
                  currentLine &&
                  (() => { 
                    const midX = (currentLine.x1 + currentLine.x2) / 2;
                    const midY = (currentLine.y1 + currentLine.y2) / 2 - 10;
                    const textValue = `${getWallLength(currentLine).toFixed(2)} ${unit}`;
                    const textWidth = textValue.length * 7;
  
                    return (
                      <>
                        <Line
                          points={[currentLine.x1, currentLine.y1, currentLine.x2, currentLine.y2]}
                          stroke="gray"
                          strokeWidth={2}
                          dash={[10, 5]}
                        />
                        <Text
                          x={midX - textWidth / 2}
                          y={Math.max(midY, 10)}
                          text={textValue}
                          fontSize={14}
                          fill="gray"
                          stroke="black"
                          strokeWidth={0.5}
                        />
                      </>
                    );
                  })()}
              </Layer>
            </Stage>
          )}
        </div>
      </div>
    </>
  );
  
  

  
}

export default DrawingBoard;