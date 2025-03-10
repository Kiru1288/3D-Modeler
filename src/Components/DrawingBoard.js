import React, {
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react';
import { Stage, Layer, Line, Text } from "react-konva";
import ThreeDCanvas from "./ThreeDCanvas";
import "./DrawingBoard.css";
import { FloorPlanContext } from '../context/FloorPlanContext';

// Global constants
const GRID_SPACING = 20;
const SIDEBAR_WIDTH = 280;

function DrawingBoard() {
  // Shared floor plan context
  const { walls, structures, addWall, removeWall, addStructure, removeStructure, undo } = useContext(FloorPlanContext);



  // Local state declarations
  const [is3DMode, setIs3DMode] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState("Meters");
  const [colorScheme, setColorScheme] = useState("Light");
  const [currentStructure, setCurrentStructure] = useState(null);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth - SIDEBAR_WIDTH,
    height: window.innerHeight
  });
  const [history, setHistory] = useState([{ walls: [], structures: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // ---------------------------
  // History Management
  // ---------------------------
  const addToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      walls: [...walls],
      structures: [...structures],
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, walls, structures]);

  const toggleView = () => setIs3DMode((prev) => !prev);
  <button onClick={toggleView} className="toggle-btn">
  {is3DMode ? "Switch to 2D" : "Switch to 3D"}
</button>



  // ---------------------------
  // Event Listeners
  // ---------------------------
  // Window resize handler to update canvas size
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth - SIDEBAR_WIDTH,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------------------
// Undo/Redo Handlers
// ---------------------------
const handleUndo = useCallback(() => {
  if (historyIndex > 0) {
    const prevState = history[historyIndex - 1]; 
    if (prevState) {
      addWall(prevState.walls);
      addStructure(prevState.structures);
    }
    setHistoryIndex(historyIndex - 1);
  }
}, [history, historyIndex]);


const handleRedo = useCallback(() => {
  if (historyIndex < history.length - 1) {
    const nextState = history[historyIndex + 1]; 
    if (nextState) {
      addWall(nextState.walls);
      addStructure(nextState.structures);
    }
    setHistoryIndex(historyIndex + 1);
  }
}, [history, historyIndex]);

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
}, [handleRedo, handleUndo]); // This is now safe


  // Record history whenever walls or structures change
  useEffect(() => {
    addToHistory();
  }, [addToHistory, walls, structures]);

  // ---------------------------
  // File Upload Handler
  // ---------------------------
  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.png,.pdf';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        console.log("File selected:", file.name);
        // Add your file processing logic here
      }
    };
    input.click();
  }, []);

  // ---------------------------
  // Mode & Tool Handling
  // ---------------------------
  // Toggle 3D mode
  const toggle3DMode = useCallback(() => {
    setIs3DMode(prev => !prev);
  }, []);

  // Handle tool selection with confirmation for unfinished room drawing
  const handleToolSelect = useCallback((toolType) => {
    // Check for unfinished room drawing
    if (
      currentTool === 'room' &&
      currentStructure?.points?.length > 0 &&
      toolType !== 'room'
    ) {
      const confirmSwitch = window.confirm(
        'You have an unfinished room drawing. Switching tools will discard it. Continue?'
      );
      if (!confirmSwitch) return;
    }
    // Reset drawing states
    setIsDrawing(false);
    setCurrentLine(null);
    // Manage room tool state specifically
    if (toolType === 'room') {
      if (currentTool !== 'room') {
        setCurrentStructure(null);
      }
    } else if (currentTool === 'room') {
      setCurrentStructure(null);
    }
    setCurrentTool(toolType);
  }, [currentTool, currentStructure]);

  // ---------------------------
  // Toolbar and Element Buttons
  // ---------------------------
  const toolbarButtons = [
    { id: 'upload', label: 'Upload 2D Floorplan', action: handleUpload, icon: '📁' },
    { id: 'wall', label: 'Draw Wall', action: () => handleToolSelect('wall'), icon: '🧱' },
    { id: 'room', label: 'Draw Room', action: () => handleToolSelect('room'), icon: '🏠' },
    { id: 'door', label: 'Place Door', action: () => handleToolSelect('door'), icon: '🚪' },
    { id: 'window', label: 'Place Window', action: () => handleToolSelect('window'), icon: '🪟' },
    { id: 'surface', label: 'Add Surface', action: () => handleToolSelect('surface'), icon: '⬜' },
    { id: 'placeStructural', label: 'Place Structural', action: () => handleToolSelect('structural'), icon: '➖' }
  ];

  const elementButtons = [
    { id: 'wall', icon: '🧱', label: 'Wall', action: () => handleToolSelect('wall') },
    { id: 'room', icon: '🏠', label: 'Room', action: () => handleToolSelect('room') },
    { id: 'surface', icon: '⬜', label: 'Surface', action: () => handleToolSelect('surface') },
    { id: 'door', icon: '🚪', label: 'Door', action: () => handleToolSelect('door') },
    { id: 'window', icon: '🪟', label: 'Window', action: () => handleToolSelect('window') },
    { id: 'beam', icon: '➖', label: 'Beam', action: () => handleToolSelect('beam') },
    { id: 'column', icon: '⬛', label: 'Column', action: () => handleToolSelect('column') }
  ];

  // ---------------------------
  // Mouse Event Handlers
  // ---------------------------
  const handleDrawStart = useCallback((e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    // Snap position if enabled
    const snappedPos = snapEnabled
      ? {
          x: Math.round(pos.x / GRID_SPACING) * GRID_SPACING,
          y: Math.round(pos.y / GRID_SPACING) * GRID_SPACING
        }
      : pos;

    switch (currentTool) {
      case 'wall':
        setIsDrawing(true);
        setCurrentLine({
          x1: snappedPos.x,
          y1: snappedPos.y,
          x2: snappedPos.x,
          y2: snappedPos.y
        });
        break;
      case 'door':
      case 'window': {
        const newStructure = {
          type: currentTool,
          x: snappedPos.x,
          y: snappedPos.y,
          width: currentTool === 'door' ? 80 : 100,
          height: currentTool === 'door' ? 20 : 100,
          id: `${currentTool}-${Date.now()}`
        };
        if (currentStructure) {
          addStructure(currentStructure);
        }
        

        break;
      }
      case 'room':
        if (!currentStructure?.points?.length) {
          setCurrentStructure({
            type: 'room',
            points: [snappedPos.x, snappedPos.y],
            id: `room-${Date.now()}`
          });
        } else {
          setCurrentStructure(prev => ({
            ...prev,
            points: [...prev.points, snappedPos.x, snappedPos.y]
          }));
        }
        break;
      default:
        break;
    }
  }, [currentTool, snapEnabled, currentStructure]);

  const handleDrawMove = useCallback((e) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    const snappedPos = snapEnabled
      ? {
          x: Math.round(pos.x / GRID_SPACING) * GRID_SPACING,
          y: Math.round(pos.y / GRID_SPACING) * GRID_SPACING
        }
      : pos;
    setCurrentLine(prev => prev ? { ...prev, x2: snappedPos.x, y2: snappedPos.y } : null);
  }, [isDrawing, snapEnabled]);

  const handleDrawEnd = useCallback(() => {
    if (!isDrawing) return;
    if (currentTool === 'wall') {
      addWall(currentLine);

    }
    setIsDrawing(false);
    setCurrentLine(null);
  }, [isDrawing, currentLine, currentTool]);

  const handleDoubleClick = useCallback(() => {
    if (currentTool === 'room' && currentStructure && currentStructure.points.length >= 4) {
      if (currentStructure) {
        addStructure(currentStructure);
      }
      

      setCurrentStructure(null);
      setCurrentTool(null);
    }
  }, [currentTool, currentStructure]);

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
            stroke={darkMode ? "#fff" : "#000"}
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
              structure.x, structure.y + structure.height
            ]}
            stroke={darkMode ? "#88ccff" : "#4488ff"}
            strokeWidth={2}
            closed
          />
        );
      default:
        return null;
    }
  }, [darkMode]);

  // ---------------------------
  // Undo/Redo Handlers
  // ---------------------------
  
  // ---------------------------
  // Render JSX
  // ---------------------------
  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Top Toolbar */}
      <div className="top-toolbar">
        <div className="toolbar-buttons">
          {toolbarButtons.map(button => (
            <button
              key={button.id}
              className={`toolbar-btn ${currentTool === button.id ? 'active' : ''}`}
              onClick={button.action}
            >
              <span className="button-icon">{button.icon}</span>
              <span className="button-label">{button.label}</span>
            </button>
          ))}
        </div>
        <div className="color-scheme-selector">
          <span>Color Scheme:</span>
          <select 
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
            className="color-scheme-select"
          >
            <option value="Light">Light</option>
            <option value="Dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="view-toggle">
          <button 
            className={`view-btn ${!is3DMode ? 'active' : ''}`}
            onClick={() => setIs3DMode(false)}
          >
            2D View
          </button>
          <button 
            className={`view-btn ${is3DMode ? 'active' : ''}`}
            onClick={() => setIs3DMode(true)}
          >
            3D View
          </button>
        </div>
        <div className="elements-section">
          <h2>Add Elements</h2>
          <div className="elements-grid">
            {elementButtons.map(element => (
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
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              Dark Mode
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

      {/* Main Canvas Area */}
      <div className="canvas-area">
      is3DMode ? (
        <ThreeDCanvas
          walls={walls ?? []}  
          structures={structures ?? []}  
          showGrid={showGrid}
        />
          <Stage
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
              {walls.map((wall, i) => (
                <Line
                  key={`wall-${i}`}
                  points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                  stroke={darkMode ? "#fff" : "#000"}
                  strokeWidth={2}
                />
              ))}
              {currentLine && (
                <Line
                  points={[currentLine.x1, currentLine.y1, currentLine.x2, currentLine.y2]}
                  stroke={darkMode ? "#fff" : "#000"}
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              )}
              {structures.map(renderStructure)}
              {currentStructure && currentStructure.points && (
                <Line
                  points={currentStructure.points}
                  stroke={darkMode ? "#fff" : "#000"}
                  strokeWidth={2}
                  closed={currentStructure.points.length >= 6}
                />
              )}
            </Layer>
          </Stage>
        )
      </div>
    </div>
  );
}

export default DrawingBoard;
