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
  const [snapPoint, setSnapPoint] = useState(null);

  
  

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
  }, [walls, structures]);
  
  
    
  
  





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
    console.log("[handleUndo] Restoring structures:", prevState.structures);
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
  const lastStateRef = React.useRef(null);
  
  useEffect(() => {
    const currentState = JSON.stringify({ walls, structures });
    console.log("Current state:", currentState);
  
    if (lastStateRef.current !== currentState) {
      lastStateRef.current = currentState;
      addToHistory();
    }
  }, [walls, structures, addToHistory]);
  

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

  // Categorized element buttons for better organization
  const [activeCategory, setActiveCategory] = useState('walls');
  
  const elementCategories = [
    { id: 'walls', label: 'Walls & Structure', icon: '📐' },
    { id: 'doors', label: 'Doors & Windows', icon: '🚪' },
    { id: 'furniture', label: 'Furniture', icon: '🛋️' },
    { id: 'kitchen', label: 'Kitchen & Bath', icon: '🔪' },
    { id: 'fixtures', label: 'Fixtures & Decor', icon: '💡' },
    { id: 'outdoor', label: 'Outdoor', icon: '🌳' }
  ];

  const categorizedElements = {
    // Walls & Structural elements
    walls: [
      { id: 'wall', icon: '🧊', label: 'Wall', action: () => handleToolSelect('wall') },
      { id: 'room', icon: '🏛️', label: 'Room', action: () => handleToolSelect('room') },
      { id: 'column', icon: '🏛️', label: 'Column', action: () => handleToolSelect('column') },
      { id: 'beam', icon: '📏', label: 'Beam', action: () => handleToolSelect('beam') },
      { id: 'stairs', icon: '📶', label: 'Stairs', action: () => handleToolSelect('stairs') },
      { id: 'railing', icon: '🔄', label: 'Railing', action: () => handleToolSelect('railing') },
      { id: 'ceiling', icon: '⬜', label: 'Ceiling', action: () => handleToolSelect('ceiling') },
    ],
    
    // Doors & Windows
    doors: [
      { id: 'door', icon: '🚪', label: 'Door', action: () => handleToolSelect('door') },
      { id: 'sliding-door', icon: '↔️', label: 'Sliding Door', action: () => handleToolSelect('sliding-door') },
      { id: 'french-door', icon: '🚪', label: 'French Door', action: () => handleToolSelect('french-door') },
      { id: 'window', icon: '🪟', label: 'Window', action: () => handleToolSelect('window') },
      { id: 'bay-window', icon: '🏙️', label: 'Bay Window', action: () => handleToolSelect('bay-window') },
      { id: 'skylight', icon: '☀️', label: 'Skylight', action: () => handleToolSelect('skylight') },
    ],
    
    // Furniture
    furniture: [
      { id: 'sofa', icon: '🛋️', label: 'Sofa', action: () => handleToolSelect('sofa') },
      { id: 'sectional', icon: '🔄', label: 'L-Sectional', action: () => handleToolSelect('sectional') },
      { id: 'bed', icon: '🛏️', label: 'Bed', action: () => handleToolSelect('bed') },
      { id: 'table', icon: '🎲', label: 'Table', action: () => handleToolSelect('table') },
      { id: 'desk', icon: '💻', label: 'Desk', action: () => handleToolSelect('desk') },
      { id: 'chair', icon: '🪑', label: 'Chair', action: () => handleToolSelect('chair') },
      { id: 'bookshelf', icon: '📚', label: 'Bookshelf', action: () => handleToolSelect('bookshelf') },
      { id: 'wardrobe', icon: '👕', label: 'Wardrobe', action: () => handleToolSelect('wardrobe') },
      { id: 'dresser', icon: '🧳', label: 'Dresser', action: () => handleToolSelect('dresser') },
      { id: 'nightstand', icon: '📖', label: 'Nightstand', action: () => handleToolSelect('nightstand') },
    ],
    
    // Kitchen & Bath
    kitchen: [
      { id: 'kitchen', icon: '🍽️', label: 'Kitchen', action: () => handleToolSelect('kitchen') },
      { id: 'stove', icon: '🔥', label: 'Stove', action: () => handleToolSelect('stove') },
      { id: 'refrigerator', icon: '❄️', label: 'Refrigerator', action: () => handleToolSelect('refrigerator') },
      { id: 'kitchen-island', icon: '⬜', label: 'Island', action: () => handleToolSelect('kitchen-island') },
      { id: 'counter', icon: '📏', label: 'Counter', action: () => handleToolSelect('counter') },
      { id: 'cabinet', icon: '🗄️', label: 'Cabinet', action: () => handleToolSelect('cabinet') },
      { id: 'sink', icon: '💧', label: 'Sink', action: () => handleToolSelect('sink') },
      { id: 'bath', icon: '🛀', label: 'Bath', action: () => handleToolSelect('bath') },
      { id: 'shower', icon: '🚿', label: 'Shower', action: () => handleToolSelect('shower') },
      { id: 'toilet', icon: '🚽', label: 'Toilet', action: () => handleToolSelect('toilet') },
      { id: 'vanity', icon: '🪞', label: 'Vanity', action: () => handleToolSelect('vanity') },
    ],
    
    // Fixtures & Decor
    fixtures: [
      { id: 'lamp', icon: '💡', label: 'Lamp', action: () => handleToolSelect('lamp') },
      { id: 'ceiling-light', icon: '☀️', label: 'Ceiling Light', action: () => handleToolSelect('ceiling-light') },
      { id: 'chandelier', icon: '✨', label: 'Chandelier', action: () => handleToolSelect('chandelier') },
      { id: 'carpet', icon: '📦', label: 'Carpet', action: () => handleToolSelect('carpet') },
      { id: 'tiles', icon: '🔳', label: 'Tiles', action: () => handleToolSelect('tiles') },
      { id: 'plant', icon: '🌿', label: 'Plant', action: () => handleToolSelect('plant') },
      { id: 'artwork', icon: '🖼️', label: 'Artwork', action: () => handleToolSelect('artwork') },
      { id: 'tv', icon: '📺', label: 'TV', action: () => handleToolSelect('tv') },
      { id: 'fireplace', icon: '🔥', label: 'Fireplace', action: () => handleToolSelect('fireplace') },
    ],
    
    // Outdoor elements
    outdoor: [
      { id: 'deck', icon: '🏕️', label: 'Deck', action: () => handleToolSelect('deck') },
      { id: 'patio', icon: '⬜', label: 'Patio', action: () => handleToolSelect('patio') },
      { id: 'pool', icon: '💦', label: 'Pool', action: () => handleToolSelect('pool') },
      { id: 'garden', icon: '🌱', label: 'Garden', action: () => handleToolSelect('garden') },
      { id: 'fence', icon: '🔲', label: 'Fence', action: () => handleToolSelect('fence') },
      { id: 'path', icon: '🛣️', label: 'Path', action: () => handleToolSelect('path') },
      { id: 'outdoor-furniture', icon: '🪑', label: 'Outdoor Furniture', action: () => handleToolSelect('outdoor-furniture') },
      { id: 'bbq', icon: '♨️', label: 'BBQ', action: () => handleToolSelect('bbq') },
    ],
  };
  
  // Get currently displayed elements based on active category
  const currentElements = categorizedElements[activeCategory] || [];

  // Helper function to get default width/height for furniture items
  const getDefaultWidth = (itemType) => {
    const defaultSizes = {
      'wall': 100,
      'door': 90,
      'sliding-door': 120,
      'french-door': 180,
      'window': 90,
      'bay-window': 180,
      'sofa': 200,
      'sectional': 250,
      'table': 120,
      'desk': 150,
      'bed': 200,
      'chair': 60,
      'bookshelf': 100,
      'kitchen': 240,
      'stove': 60,
      'refrigerator': 70,
      'kitchen-island': 180,
      'counter': 200,
      'cabinet': 80,
      'bath': 170,
      'shower': 90,
      'toilet': 60,
      'vanity': 100,
      'wardrobe': 120,
      'dresser': 100,
      'nightstand': 50,
      'deck': 400,
      'patio': 350,
      'pool': 300,
      'bbq': 80,
    };
    
    return defaultSizes[itemType] || 100;
  };
  
  const getDefaultHeight = (itemType) => {
    const defaultSizes = {
      'wall': 20,
      'door': 210,
      'sliding-door': 210,
      'french-door': 210,
      'window': 120,
      'bay-window': 120,
      'sofa': 100,
      'sectional': 200,
      'table': 80,
      'desk': 70,
      'bed': 200,
      'chair': 60,
      'bookshelf': 40,
      'kitchen': 60,
      'stove': 60,
      'refrigerator': 70,
      'kitchen-island': 100,
      'counter': 60,
      'cabinet': 60,
      'bath': 80,
      'shower': 90,
      'toilet': 70,
      'vanity': 60,
      'wardrobe': 60,
      'dresser': 50,
      'nightstand': 50,
      'deck': 400,
      'patio': 350,
      'pool': 200,
      'bbq': 60,
    };
    
    return defaultSizes[itemType] || 60;
  };

  // ---------------------------
  // Mouse Event Handlers
  // ---------------------------
  const handleDrawStart = useCallback((e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    
    const rawSnapped = {
      x: Math.round(pos.x / GRID_SPACING) * GRID_SPACING,
      y: Math.round(pos.y / GRID_SPACING) * GRID_SPACING,
    };
  
    const snappedOrConnected = findNearbyEndpoint(rawSnapped.x, rawSnapped.y, walls) || rawSnapped;
  
    if (["wall", "room"].includes(currentTool)) {
      setIsDrawing(true);
      setCurrentLine({
        x1: snappedOrConnected.x,
        y1: snappedOrConnected.y,
        x2: snappedOrConnected.x,
        y2: snappedOrConnected.y,
      });
      console.log(`Started drawing ${currentTool}`);
    } else if (["door", "sliding-door", "french-door", "window", "bay-window", "skylight"].includes(currentTool)) {
      // For doors and windows, start drawing a line to set dimensions
      setIsDrawing(true);
      setCurrentLine({
        x1: snappedOrConnected.x,
        y1: snappedOrConnected.y,
        x2: snappedOrConnected.x,
        y2: snappedOrConnected.y,
        type: currentTool
      });
    } else {
      // For all other elements (furniture, fixtures, etc), add directly at click position
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
        { x: (wall.x1 + wall.x2) / 2, y: (wall.y1 + wall.y2) / 2, isMidpoint: true },
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
      const snapStart = findNearbyEndpoint(currentLine.x1, currentLine.y1, walls);
const snapEnd = findNearbyEndpoint(currentLine.x2, currentLine.y2, walls);

const snappedStart = snapStart ? { x: snapStart.x, y: snapStart.y } : {
  x: Math.round(currentLine.x1 / GRID_SPACING) * GRID_SPACING,
  y: Math.round(currentLine.y1 / GRID_SPACING) * GRID_SPACING
};

const snappedEnd = snapEnd ? { x: snapEnd.x, y: snapEnd.y } : {
  x: Math.round(currentLine.x2 / GRID_SPACING) * GRID_SPACING,
  y: Math.round(currentLine.y2 / GRID_SPACING) * GRID_SPACING
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
      
      if (["door", "sliding-door", "french-door", "window", "bay-window", "skylight"].includes(currentTool)) {
        // Calculate width, height and position for door/window structures
        const width = Math.abs(currentLine.x2 - currentLine.x1);
        const height = Math.abs(currentLine.y2 - currentLine.y1);
        const x = Math.min(currentLine.x1, currentLine.x2);
        const y = Math.min(currentLine.y1, currentLine.y2);
        
        // Don't add tiny elements (prevent accidental clicks)
        if (width < 10 || height < 10) {
          setIsDrawing(false);
          setCurrentLine(null);
          return;
        }

        addStructure({
          id: Date.now(),
          x,
          y,
          width,
          height,
          type: currentTool,
          // Calculate the rotation based on the line direction
          rotation: Math.atan2(currentLine.y2 - currentLine.y1, currentLine.x2 - currentLine.x1)
        });
        
      } else if (["wall", "room"].includes(currentTool)) {
        // Prevent adding zero-length walls
        if (newElement.x1 === newElement.x2 && newElement.y1 === newElement.y2) {
          setIsDrawing(false);
          setCurrentLine(null);
          return;
        }
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
  
    const nearbySnap = findNearbyEndpoint(snappedPos.x, snappedPos.y, walls);
    setSnapPoint(nearbySnap); // 👈 update snap indicator
  
    setCurrentLine((prev) =>
      prev ? { ...prev, x2: snappedPos.x, y2: snappedPos.y } : null
    );
  }, [isDrawing, currentLine, walls]);
  

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
    
    // Common element rendering (rectangular shapes with different colors)
    const renderRectangular = (stroke, fill) => (
      <Line
        key={structure.id}
        points={[
          structure.x, structure.y,
          structure.x + structure.width, structure.y,
          structure.x + structure.width, structure.y + structure.height,
          structure.x, structure.y + structure.height,
          structure.x, structure.y
        ]}
        stroke={stroke}
        strokeWidth={2}
        closed
        fill={fill}
        dash={structure.type && structure.type.includes('dashed') ? [10, 5] : undefined}
      />
    );
    
    // Structure color mappings
    const colors = {
      // Door types
      'door': { stroke: '#8B4513', fill: '#CD853F' },
      'sliding-door': { stroke: '#8B4513', fill: '#DAA520' },
      'french-door': { stroke: '#8B4513', fill: '#B8860B' },
      
      // Window types
      'window': { stroke: '#1E90FF', fill: '#87CEEB' },
      'bay-window': { stroke: '#1E90FF', fill: '#ADD8E6' },
      'skylight': { stroke: '#4682B4', fill: '#B0E0E6' },
      
      // Structural elements
      'stairs': { stroke: '#696969', fill: '#A9A9A9' },
      'column': { stroke: '#696969', fill: '#A9A9A9' },
      'beam': { stroke: '#696969', fill: '#A9A9A9' },
      'railing': { stroke: '#A0522D', fill: '#CD853F' },
      'ceiling': { stroke: '#A9A9A9', fill: '#DCDCDC' },
      
      // Furniture
      'table': { stroke: '#8B4513', fill: '#A0522D' },
      'sofa': { stroke: '#D2691E', fill: '#D2691E' },
      'sectional': { stroke: '#D2691E', fill: '#E9967A' },
      'bed': { stroke: '#8B4513', fill: '#CD853F' },
      'chair': { stroke: '#A0522D', fill: '#A0522D' },
      'desk': { stroke: '#A0522D', fill: '#DEB887' },
      'bookshelf': { stroke: '#8B4513', fill: '#DEB887' },
      'wardrobe': { stroke: '#8B4513', fill: '#D2B48C' },
      'dresser': { stroke: '#8B4513', fill: '#DEB887' },
      'nightstand': { stroke: '#8B4513', fill: '#D2B48C' },
      
      // Kitchen & Bath
      'kitchen': { stroke: '#808080', fill: '#C0C0C0' },
      'stove': { stroke: '#696969', fill: '#A9A9A9' },
      'refrigerator': { stroke: '#708090', fill: '#B0C4DE' },
      'kitchen-island': { stroke: '#808080', fill: '#D3D3D3' },
      'counter': { stroke: '#696969', fill: '#DCDCDC' },
      'cabinet': { stroke: '#8B4513', fill: '#DEB887' },
      'sink': { stroke: '#4682B4', fill: '#B0C4DE' },
      'bath': { stroke: '#ADD8E6', fill: '#ADD8E6' },
      'shower': { stroke: '#4682B4', fill: '#B0E0E6' },
      'toilet': { stroke: '#FFFFFF', fill: '#F0F0F0' },
      'vanity': { stroke: '#8B4513', fill: '#D2B48C' },
      
      // Fixtures & Decor
      'lamp': { stroke: '#FFD700', fill: '#FFFFE0' },
      'ceiling-light': { stroke: '#FFD700', fill: '#FFFACD' },
      'chandelier': { stroke: '#DAA520', fill: '#F0E68C' },
      'carpet': { stroke: '#800080', fill: '#DDA0DD' },
      'tiles': { stroke: '#A9A9A9', fill: '#D3D3D3' },
      'plant': { stroke: '#228B22', fill: '#32CD32' },
      'artwork': { stroke: '#4682B4', fill: '#87CEEB' },
      'tv': { stroke: '#2F4F4F', fill: '#696969' },
      'fireplace': { stroke: '#8B0000', fill: '#DC143C' },
      
      // Outdoor
      'deck': { stroke: '#8B4513', fill: '#DEB887' },
      'patio': { stroke: '#808080', fill: '#C0C0C0' },
      'pool': { stroke: '#4682B4', fill: '#87CEEB' },
      'garden': { stroke: '#228B22', fill: '#90EE90' },
      'fence': { stroke: '#A0522D', fill: '#CD853F' },
      'path': { stroke: '#A9A9A9', fill: '#D3D3D3' },
      'outdoor-furniture': { stroke: '#8B4513', fill: '#F4A460' },
      'bbq': { stroke: '#2F4F4F', fill: '#696969' },
      
      // Default
      'default': { stroke: darkMode ? '#ffffff' : '#000000', fill: darkMode ? '#666666' : '#cccccc' }
    };
    
    // Get colors for this structure type, fallback to default
    const colorSet = colors[structure.type] || colors.default;
    
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
      
      // For all other structures, render as rectangular shapes with type-specific colors
      default:
        return renderRectangular(colorSet.stroke, colorSet.fill);
    }
  }, [darkMode]);

  // Add styles for categories
  const categoryBtnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    margin: '4px',
    backgroundColor: darkMode ? '#222222' : '#f0f0f0',
    border: `1px solid ${darkMode ? '#444444' : '#dddddd'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    width: 'calc(33.33% - 8px)',
    height: '90px',
    boxShadow: darkMode ? '0 2px 5px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
  };

  const activeCategoryStyle = {
    ...categoryBtnStyle,
    backgroundColor: darkMode ? '#333333' : '#e0e0e0',
    borderColor: darkMode ? '#FACC15' : '#666666',
    borderWidth: '2px',
    boxShadow: darkMode ? '0 3px 7px rgba(250,204,21,0.2)' : '0 3px 7px rgba(0,0,0,0.2)',
  };

  const categoryIconStyle = {
    fontSize: '2rem',
    marginBottom: '10px',
  };

  const categoryLabelStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    textAlign: 'center',
    color: darkMode ? '#eeeeee' : '#333333',
  };

  const elementBtnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 4px',
    backgroundColor: darkMode ? '#222222' : '#f5f5f5',
    border: `1px solid ${darkMode ? '#444444' : '#dddddd'}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    height: '75px',
    boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
  };

  const activeElementStyle = {
    ...elementBtnStyle,
    backgroundColor: darkMode ? '#333333' : '#e0e0e0',
    borderColor: darkMode ? '#FACC15' : '#666666',
    borderWidth: '2px',
    boxShadow: darkMode ? '0 2px 5px rgba(250,204,21,0.2)' : '0 2px 5px rgba(0,0,0,0.2)',
  };

  const elementIconStyle = {
    fontSize: '1.6rem',
    marginBottom: '5px',
  };

  const elementLabelStyle = {
    fontSize: '0.7rem',
    fontWeight: '600',
    textAlign: 'center',
    color: darkMode ? '#eeeeee' : '#333333',
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
          <div style={{
            width: `${SIDEBAR_WIDTH}px`,
            height: '100vh',
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            borderRight: `1px solid ${darkMode ? '#333333' : '#dddddd'}`,
            padding: '70px 15px 20px',
            overflowY: 'auto',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ 
                padding: '10px 0 10px 5px', 
                borderBottom: `1px solid ${darkMode ? '#444444' : '#dddddd'}`,
                marginBottom: '15px',
                color: darkMode ? '#ffffff' : '#333333',
                fontWeight: '700',
                fontSize: '1.3rem'
              }}>Add Elements</h2>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0', 
                marginBottom: '15px',
                justifyContent: 'space-between' 
              }}>
                {elementCategories.map((category) => (
                  <button
                    key={category.id}
                    style={activeCategory === category.id ? activeCategoryStyle : categoryBtnStyle}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span style={categoryIconStyle}>{category.icon}</span>
                    <span style={categoryLabelStyle}>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
  
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                padding: '0 0 10px 5px', 
                borderBottom: `1px solid ${darkMode ? '#444444' : '#dddddd'}`,
                marginBottom: '15px',
                color: darkMode ? '#ffffff' : '#333333',
                fontWeight: '600',
                fontSize: '1.2rem'
              }}>
                {elementCategories.find(c => c.id === activeCategory)?.label || 'Elements'}
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '0 5px'
              }}>
                {currentElements.map((element) => (
                  <button
                    key={element.id}
                    style={currentTool === element.id ? activeElementStyle : elementBtnStyle}
                    onClick={element.action}
                  >
                    <span style={elementIconStyle}>{element.icon}</span>
                    <span style={elementLabelStyle}>{element.label}</span>
                  </button>
                ))}
              </div>
            </div>
  
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ 
                padding: '10px 0 10px 5px', 
                borderBottom: `1px solid ${darkMode ? '#444444' : '#dddddd'}`,
                marginBottom: '15px',
                color: darkMode ? '#ffffff' : '#333333',
                fontWeight: '700',
                fontSize: '1.3rem'
              }}>Settings</h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                padding: '5px 10px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  color: darkMode ? '#ffffff' : '#333333',
                  fontWeight: '500',
                }}>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={() => setShowGrid(!showGrid)}
                    style={{ 
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  Show Grid
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  color: darkMode ? '#ffffff' : '#333333',
                  fontWeight: '500',
                }}>
                  <input
                    type="checkbox"
                    checked={snapEnabled}
                    onChange={() => setSnapEnabled(!snapEnabled)}
                    style={{ 
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  Enable Snapping
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  color: darkMode ? '#ffffff' : '#333333',
                  fontWeight: '500',
                }}>
                  <input
                    type="checkbox"
                    checked={!darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    style={{ 
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  Light Mode
                </label>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.95rem',
                  color: darkMode ? '#ffffff' : '#333333',
                  fontWeight: '500',
                }}>
                  <span>Unit:</span>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: darkMode ? '#333333' : '#f5f5f5',
                      color: darkMode ? '#ffffff' : '#333333',
                      border: `1px solid ${darkMode ? '#444444' : '#dddddd'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      width: '120px',
                      boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                    }}
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
        <div style={{
          marginLeft: is3DMode ? 0 : `${SIDEBAR_WIDTH}px`,
          marginTop: '60px',
          width: is3DMode ? '100vw' : `calc(100vw - ${SIDEBAR_WIDTH}px)`,
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
          transition: 'margin-left 0.3s ease-in-out'
        }}>
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
              {snapPoint && (
  <React.Fragment>
    <Line
      points={[snapPoint.x - 8, snapPoint.y, snapPoint.x + 8, snapPoint.y]}
      stroke="gold"
      strokeWidth={2}
    />
    <Line
      points={[snapPoint.x, snapPoint.y - 8, snapPoint.x, snapPoint.y + 8]}
      stroke="gold"
      strokeWidth={2}
    />
  </React.Fragment>
)}

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