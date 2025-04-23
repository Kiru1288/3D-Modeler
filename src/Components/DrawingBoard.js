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
import { Rect, Group  } from 'react-konva';


// Global constants
const GRID_SPACING = 20;
const PROXIMITY_THRESHOLD = 25;

const SIDEBAR_WIDTH = 280;

function distanceToSegment(point, wall) {
  const { x1, y1, x2, y2 } = wall;
  const A = point.x - x1;
  const B = point.y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = dot / lenSq;

  if (param < 0) param = 0;
  else if (param > 1) param = 1;

  const xx = x1 + param * C;
  const yy = y1 + param * D;
  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}


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
    { id: 'walls', label: 'Walls & Structure', icon: '' },
    { id: 'doors', label: 'Doors & Windows', icon: '' },
    { id: 'furniture', label: 'Furniture', icon: '' },
    { id: 'kitchen', label: 'Kitchen & Bath', icon: '' },
    { id: 'fixtures', label: 'Fixtures & Decor', icon: '' },
   
  ];

  const categorizedElements = {
    // Walls & Structural elements
    walls: [
      { id: 'wall', icon: '', label: 'Wall', action: () => handleToolSelect('wall') },
      { id: 'room', icon: '', label: 'Room', action: () => handleToolSelect('room') },
      { id: 'column', icon: '', label: 'Column', action: () => handleToolSelect('column') },
      { id: 'beam', icon: '', label: 'Beam', action: () => handleToolSelect('beam') },
      { id: 'stairs', icon: '', label: 'Stairs', action: () => handleToolSelect('stairs') },
      { id: 'railing', icon: '', label: 'Railing', action: () => handleToolSelect('railing') },
      
    ],
    
    // Doors & Windows
    doors: [
      { id: 'door', icon: '', label: 'Door', action: () => handleToolSelect('door') },
      { id: 'sliding-door', icon: '', label: 'Sliding Door', action: () => handleToolSelect('sliding-door') },
      { id: 'window', icon: '', label: 'Window', action: () => handleToolSelect('window') },
      
    ],
    
    
    // Furniture
    furniture: [
      { id: 'sofa', icon: '', label: 'Sofa', action: () => handleToolSelect('sofa') },
      { id: 'sectional', icon: '', label: 'L-Sectional', action: () => handleToolSelect('sectional') },
      { id: 'bed', icon: '', label: 'Bed', action: () => handleToolSelect('bed') },
      { id: 'table', icon: '', label: 'Table', action: () => handleToolSelect('table') },
      { id: 'desk', icon: '', label: 'Desk', action: () => handleToolSelect('desk') },
      { id: 'chair', icon: '', label: 'Chair', action: () => handleToolSelect('chair') },
      { id: 'bookshelf', icon: '', label: 'Bookshelf', action: () => handleToolSelect('bookshelf') },
      { id: 'wardrobe', icon: '', label: 'Wardrobe', action: () => handleToolSelect('wardrobe') },
     
    ],
    
    // Kitchen & Bath
    kitchen: [
      
      { id: 'stove', icon: '', label: 'Stove', action: () => handleToolSelect('stove') },
      { id: 'refrigerator', icon: '', label: 'Refrigerator', action: () => handleToolSelect('refrigerator') },
      { id: 'kitchen-island', icon: '', label: 'Island', action: () => handleToolSelect('kitchen-island') },
      { id: 'counter', icon: '', label: 'Counter', action: () => handleToolSelect('counter') },
      { id: 'cabinet', icon: '', label: 'Cabinet', action: () => handleToolSelect('cabinet') },
      { id: 'sink', icon: '', label: 'Sink', action: () => handleToolSelect('sink') },
      { id: 'bath', icon: '', label: 'Bath', action: () => handleToolSelect('bath') },
      { id: 'shower', icon: '', label: 'Shower', action: () => handleToolSelect('shower') },
      { id: 'toilet', icon: '', label: 'Toilet', action: () => handleToolSelect('toilet') },
     
    ],
    
    // Fixtures & Decor
    fixtures: [
      { id: 'lamp', icon: '', label: 'Lamp', action: () => handleToolSelect('lamp') },
      
      { id: 'chandelier', icon: '', label: 'Chandelier', action: () => handleToolSelect('chandelier') },
      { id: 'carpet', icon: '', label: 'Carpet', action: () => handleToolSelect('carpet') },
      { id: 'tiles', icon: '', label: 'Tiles', action: () => handleToolSelect('tiles') },
      { id: 'plant', icon: '', label: 'Plant', action: () => handleToolSelect('plant') },
      
      
    ],
    
    // Outdoor elements
   
  };
  
  // Get currently displayed elements based on active category
  const currentElements = categorizedElements[activeCategory] || [];

  // Helper function to get default width/height for furniture items
  const getDefaultWidth = (itemType) => {
    const defaultSizes = {
      'beam': 80,
      'railing': 45,
      'lamp': 30,
      'chandelier': 40,
      'carpet': 60,
      'tiles': 40,
 


      'column': 20,
      'wall': 100,
      'door': 90,
      'sliding-door': 120,
      'french-door': 180,
      'window': 90,
      'bay-window': 180,
      'sofa': 60,
      'sectional': 80,
      'table': 60,
      'desk': 80,
      'bed': 80,
      'chair': 60,
      'bookshelf': 100,
      'kitchen': 240,
      'stove': 35,
      'refrigerator': 70,
      'kitchen-island': 45,
      'counter': 50,
      'cabinet': 80,
      'bath': 80,
      'shower': 25,
      'toilet': 60,
      'vanity': 100,
      'wardrobe': 60,
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
      'column': 60,
      'beam': 15,
      'railing': 40, 
      'lamp': 30,
      'chandelier': 40,
      'carpet': 30,
      'tiles': 40,




      'wall': 20,
      'door': 210,
      'sliding-door': 210,
      'french-door': 210,
      'window': 15,
      'bay-window': 120,
      'sofa': 30,
      'sectional': 30,
      'table': 40,
      'desk': 40,
      'bed': 50,
      'chair': 60,
      'bookshelf': 40,
      'kitchen': 90,
      'stove': 35,
      'refrigerator': 70,
      'kitchen-island':45,
      'counter': 30,
      'cabinet': 60,
      'bath': 30,
      'shower': 25,
      'toilet': 70,
      'vanity': 60,
      'wardrobe': 20,
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
      // 🪟 Block drawing window if not near a wall
      if (currentTool === "window") {
        const nearWall = walls.some(wall => {
          return distanceToSegment(snappedOrConnected, wall) < 20;
        });
    
        if (!nearWall) {
          
          return;
        }
      }
    
      // Proceed normally
      setIsDrawing(true);
      setCurrentLine({
        x1: snappedOrConnected.x,
        y1: snappedOrConnected.y,
        x2: snappedOrConnected.x,
        y2: snappedOrConnected.y,
        type: currentTool
      });
    }
     else {
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

// Round endpoint precisely to nearest grid OR use exact match if near existing endpoint
const roundAndSnap = (val) => Math.round(val / GRID_SPACING) * GRID_SPACING;

const snappedStart = snapStart 
  ? { x: snapStart.x, y: snapStart.y } 
  : { x: roundAndSnap(currentLine.x1), y: roundAndSnap(currentLine.y1) };

const snappedEnd = snapEnd 
  ? { x: snapEnd.x, y: snapEnd.y } 
  : { x: roundAndSnap(currentLine.x2), y: roundAndSnap(currentLine.y2) };

  

      
      const newElement = {
        id: Date.now(),
        x1: snappedStart.x,
        y1: snappedStart.y,
        x2: snappedEnd.x,
        y2: snappedEnd.y,
        type: currentTool
      };
      
      if (snappedEnd.x !== currentLine.x2 || snappedEnd.y !== currentLine.y2) {
       
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
      'door': { stroke: '#A0522D', fill: '#F5DEB3' }, // wheat color

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

      case 'plant': {
        const { x, y, width, height } = structure;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2.5;
      
        const leafCount = 6;
        const leafColor = '#32CD32';
      
        return (
          <Group key={structure.id}>
            {/* Pot */}
            <Rect
              x={centerX - 6}
              y={centerY + radius - 4}
              width={12}
              height={8}
              fill="#8B4513"
              stroke="#5C3317"
              cornerRadius={2}
            />
      
            {/* Leaves in a circular pattern */}
            {Array.from({ length: leafCount }).map((_, i) => {
              const angle = (i / leafCount) * Math.PI * 2;
              const leafX = centerX + radius * Math.cos(angle);
              const leafY = centerY + radius * Math.sin(angle);
      
              return (
                <Line
                  key={`leaf-${i}`}
                  points={[centerX, centerY, leafX, leafY]}
                  stroke={leafColor}
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}
      
            {/* Plant center (stem base) */}
            <Rect
              x={centerX - 2}
              y={centerY - 2}
              width={4}
              height={4}
              fill="#006400"
              cornerRadius={2}
            />
          </Group>
        );
      }
      

      case 'chandelier': {
        const { x, y, width, height } = structure;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2.2;
      
        return (
          <Group key={structure.id}>
            {/* Outer circle (frame) */}
            <Line
              points={[]}
              sceneFunc={(ctx, shape) => {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fillStrokeShape(shape);
              }}
              fill="#F0E68C"
              stroke="#DAA520"
              strokeWidth={2}
            />
      
            {/* Hanging lines (arms) */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * Math.PI * 2;
              const endX = centerX + radius * Math.cos(angle);
              const endY = centerY + radius * Math.sin(angle);
      
              return (
                <Line
                  key={`arm-${i}`}
                  points={[centerX, centerY, endX, endY]}
                  stroke="#DAA520"
                  strokeWidth={1}
                />
              );
            })}
      
            {/* Central bulb */}
            <Rect
              x={centerX - 4}
              y={centerY - 4}
              width={8}
              height={8}
              fill="#ffff99"
              cornerRadius={4}
              shadowBlur={3}
              shadowColor="#FFD700"
            />
          </Group>
        );
      }
      

      case 'lamp': {
        const { x, y, width, height } = structure;
      
        const baseWidth = width * 0.4;
        const baseHeight = height * 0.2;
        const bulbRadius = Math.min(width, height) * 0.25;
        const bulbCenterX = x + width / 2;
        const bulbCenterY = y + height / 2 - bulbRadius;
      
        return (
          <Group key={structure.id}>
            {/* Lamp Base */}
            <Rect
              x={x + (width - baseWidth) / 2}
              y={y + height - baseHeight}
              width={baseWidth}
              height={baseHeight}
              fill="#555"
              stroke="#333"
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Bulb */}
            <Rect
              x={bulbCenterX - bulbRadius}
              y={bulbCenterY - bulbRadius}
              width={bulbRadius * 2}
              height={bulbRadius * 2}
              fill="#ffffcc"
              stroke="#999900"
              strokeWidth={1}
              cornerRadius={bulbRadius}
              shadowBlur={4}
              shadowColor="#ffeb3b"
            />
      
            {/* Light rays */}
            <Line
              points={[
                bulbCenterX, bulbCenterY - bulbRadius - 5,
                bulbCenterX, bulbCenterY - bulbRadius - 12
              ]}
              stroke="#ffd700"
              strokeWidth={1.5}
            />
            <Line
              points={[
                bulbCenterX - 10, bulbCenterY - 2,
                bulbCenterX - 18, bulbCenterY - 8
              ]}
              stroke="#ffd700"
              strokeWidth={1.5}
            />
            <Line
              points={[
                bulbCenterX + 10, bulbCenterY - 2,
                bulbCenterX + 18, bulbCenterY - 8
              ]}
              stroke="#ffd700"
              strokeWidth={1.5}
            />
          </Group>
        );
      }
      

      case 'toilet': {
        const { x, y, width, height } = structure;
      
        return (
          <>
            {/* Base Bowl */}
            <Rect
              x={x + width * 0.25}
              y={y + height * 0.4}
              width={width * 0.5}
              height={height * 0.45}
              fill="#f0f0f0"
              stroke="#ccc"
              cornerRadius={4}
            />
      
            {/* Seat */}
            <Rect
              x={x + width * 0.2}
              y={y + height * 0.35}
              width={width * 0.6}
              height={height * 0.2}
              fill="#ffffff"
              stroke="#aaa"
              cornerRadius={6}
            />
      
            {/* Tank */}
            <Rect
              x={x + width * 0.2}
              y={y}
              width={width * 0.6}
              height={height * 0.3}
              fill="#e0e0e0"
              stroke="#aaa"
              cornerRadius={2}
            />
          </>
        );
      }
      

      case 'shower': {
        const { x, y, width, height } = structure;
      
        return (
          <>
            {/* Shower Base */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#e0f7fa"
              stroke="#00acc1"
              strokeWidth={2}
              cornerRadius={6}
            />
      
            {/* Glass Door Panel */}
            <Rect
              x={x + width - 6}
              y={y}
              width={6}
              height={height}
              fill="#b2ebf2"
              stroke="#007c91"
              strokeWidth={1}
            />
      
            {/* Shower Head */}
            <Rect
              x={x + 4}
              y={y + 4}
              width={6}
              height={6}
              fill="#555"
            />
          </>
        );
      }
      

      case 'bath': {
        const { x, y, width, height } = structure;
      
        return (
          <>
            {/* Outer Tub */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#dcdcdc"
              stroke="#888"
              strokeWidth={2}
              cornerRadius={6}
            />
      
            {/* Inner Basin */}
            <Rect
              x={x + 5}
              y={y + 5}
              width={width - 10}
              height={height - 10}
              fill="#ffffff"
              stroke="#bbb"
              strokeWidth={1}
              cornerRadius={4}
            />
      
            {/* Faucet */}
            <Rect
              x={x + width / 2 - 2}
              y={y + 4}
              width={4}
              height={6}
              fill="#444"
            />
          </>
        );
      }
      

      case 'sink': {
        const { x, y, width, height } = structure;
      
        return (
          <>
            {/* Counter Frame */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#a9a9a9"
              stroke="#333"
              strokeWidth={1.5}
              cornerRadius={4}
            />
      
            {/* Sink Basin */}
            <Rect
              x={x + width * 0.2}
              y={y + height * 0.2}
              width={width * 0.6}
              height={height * 0.6}
              fill="#b0c4de"
              stroke="#000"
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Faucet (simple dot) */}
            <Rect
              x={x + width / 2 - 2}
              y={y + height * 0.1 - 2}
              width={4}
              height={4}
              fill="#444"
              cornerRadius={2}
            />
          </>
        );
      }
      

      case 'counter': {
        const { x, y, width, height } = structure;
      
        const topColor = '#D3D3D3'; // lighter top
        const baseColor = '#A9A9A9'; // darker base
        const outlineColor = '#333'; // sharp edge line
      
        return (
          <>
            {/* Base cabinet area */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={baseColor}
              stroke={outlineColor}
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Countertop shading layer */}
            <Rect
              x={x + 4}
              y={y + 4}
              width={width - 8}
              height={height - 8}
              fill={topColor}
              cornerRadius={2}
            />
      
            {/* Edge lines to make it look 3D-ish */}
            <Line
              points={[x, y + height, x + width, y + height]}
              stroke={outlineColor}
              strokeWidth={1}
            />
            <Line
              points={[x + width, y, x + width, y + height]}
              stroke={outlineColor}
              strokeWidth={1}
            />
          </>
        );
      }
      
      

      case 'kitchen-island': {
        const topColor = '#DCDCDC';
        const baseColor = '#a9a9a9';
        const borderColor = '#666';
      
        return (
          <>
            {/* Base */}
            <Rect
              x={structure.x}
              y={structure.y}
              width={structure.width}
              height={structure.height}
              fill={baseColor}
              stroke={borderColor}
              strokeWidth={1}
              cornerRadius={3}
            />
            {/* Countertop outline */}
            <Rect
              x={structure.x - 2}
              y={structure.y - 2}
              width={structure.width + 4}
              height={structure.height + 4}
              stroke={topColor}
              strokeWidth={1}
              dash={[5, 2]}
            />
          </>
        );
      }
      

      case 'refrigerator':
  return (
    <Group key={structure.id}>

      <Rect
        x={structure.x - structure.width / 2}
        y={structure.y - structure.height / 2}
        width={structure.width}
        height={structure.height}
        fill="#b0c4de"
        stroke="#000"
        strokeWidth={2}
        cornerRadius={5}
      />
      <Rect
        x={structure.x + structure.width / 4}
        y={structure.y - structure.height / 4}
        width={5}
        height={structure.height / 2}
        fill="#333"
      />
    </Group>
  );


      case 'stove': {
        const x = structure.x;
        const y = structure.y;
        const width = structure.width;
        const height = structure.height;
      
        const burnerSize = 10;
        const burnerOffsetX = [10, width - 20];
        const burnerOffsetY = [10, height - 20];
      
        return (
          <>
            {/* Stove Frame */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#ccc"
              stroke="#444"
              strokeWidth={1}
              cornerRadius={4}
            />
      
            {/* Burners */}
            {burnerOffsetX.map((dx, i) =>
              burnerOffsetY.map((dy, j) => (
                <Rect
                  key={`burner-${i}-${j}`}
                  x={x + dx}
                  y={y + dy}
                  width={burnerSize}
                  height={burnerSize}
                  fill="#333"
                  cornerRadius={burnerSize / 2}
                />
              ))
            )}
          </>
        );
      }
      
      case 'wardrobe': {
        const x = structure.x;
        const y = structure.y;
        const w = structure.width;
        const h = structure.height;
      
        const doorColor = '#D2B48C'; // tan wood color
        const borderColor = '#8B4513'; // darker brown for outline
        const handleColor = '#444';
      
        return (
          <>
            {/* Main frame */}
            <Rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={doorColor}
              stroke={borderColor}
              strokeWidth={2}
              cornerRadius={2}
            />
            
            {/* Divider line for doors */}
            <Line
              points={[x + w / 2, y, x + w / 2, y + h]}
              stroke={borderColor}
              strokeWidth={1}
            />
      
            {/* Left handle */}
            <Rect
              x={x + w / 2 - 10}
              y={y + h / 2 - 4}
              width={4}
              height={8}
              fill={handleColor}
              cornerRadius={2}
            />
      
            {/* Right handle */}
            <Rect
              x={x + w / 2 + 6}
              y={y + h / 2 - 4}
              width={4}
              height={8}
              fill={handleColor}
              cornerRadius={2}
            />
          </>
        );
      }
      
      case 'bookshelf': {
        const { x, y, width, height } = structure;
      
        const frameColor = '#8b4513'; // SaddleBrown frame
        const shelfColor = '#deb887'; // Lighter wood inside
        const bookColors = ['#d2691e', '#cd5c5c', '#6a5acd', '#20b2aa'];
      
        const shelfCount = 4;
        const shelfHeight = (height - 10) / (shelfCount + 1);
      
        const shelfRects = Array.from({ length: shelfCount }).map((_, i) => (
          <Rect
            key={`shelf-${i}`}
            x={x + 4}
            y={y + (i + 1) * shelfHeight}
            width={width - 8}
            height={2}
            fill={frameColor}
          />
        ));
      
        const bookRects = Array.from({ length: shelfCount }).flatMap((_, row) => {
          const bookWidth = (width - 16) / 3;
          return [0, 1, 2].map((col) => (
            <Rect
              key={`book-${row}-${col}`}
              x={x + 6 + col * (bookWidth + 2)}
              y={y + (row + 1) * shelfHeight - 6}
              width={bookWidth}
              height={6}
              fill={bookColors[(row + col) % bookColors.length]}
              cornerRadius={1}
            />
          ));
        });
      
        return (
          <>
            {/* Outer frame */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={shelfColor}
              stroke={frameColor}
              strokeWidth={2}
              cornerRadius={2}
            />
            
            {/* Shelves */}
            {shelfRects}
      
            {/* Books */}
            {bookRects}
          </>
        );
      }
      
      case 'chair': {
        const { x, y, width, height } = structure;
      
        const seatColor = '#a0522d';     // SaddleBrown
        const backrestColor = '#8b4513'; // Darker brown
        const legColor = '#3e2f23';      // Dark legs
      
        const legSize = 4;
        const seatPadding = 6;
        const backrestHeight = 6;
      
        return (
          <>
            {/* Seat */}
            <Rect
              x={x + seatPadding}
              y={y + seatPadding + backrestHeight}
              width={width - seatPadding * 2}
              height={height - seatPadding * 2 - backrestHeight}
              fill={seatColor}
              stroke="#654321"
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Backrest */}
            <Rect
              x={x + seatPadding}
              y={y + seatPadding}
              width={width - seatPadding * 2}
              height={backrestHeight}
              fill={backrestColor}
              cornerRadius={1}
            />
      
            {/* Legs (4 corners) */}
            <Rect x={x + 2} y={y + height - legSize - 2} width={legSize} height={legSize} fill={legColor} />
            <Rect x={x + width - legSize - 2} y={y + height - legSize - 2} width={legSize} height={legSize} fill={legColor} />
            <Rect x={x + 2} y={y + height - legSize * 3} width={legSize} height={legSize} fill={legColor} />
            <Rect x={x + width - legSize - 2} y={y + height - legSize * 3} width={legSize} height={legSize} fill={legColor} />
          </>
        );
      }
      
      case 'desk': {
        const { x, y, width, height } = structure;
      
        const surfaceColor = '#3a3a3a';      // Darker desk top
        const legColor = '#222222';         // Legs
        const drawerColor = '#555555';      // Left drawer block
        const handleColor = '#aaaaaa';
      
        const legSize = 5;
      
        return (
          <>
            {/* Desk surface */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={surfaceColor}
              stroke="#1e1e1e"
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Legs (4 corners) */}
            <Rect x={x + 2} y={y + 2} width={legSize} height={legSize} fill={legColor} />
            <Rect x={x + width - legSize - 2} y={y + 2} width={legSize} height={legSize} fill={legColor} />
            <Rect x={x + 2} y={y + height - legSize - 2} width={legSize} height={legSize} fill={legColor} />
            <Rect x={x + width - legSize - 2} y={y + height - legSize - 2} width={legSize} height={legSize} fill={legColor} />
      
            {/* Left drawer block */}
            <Rect
              x={x + 4}
              y={y + 4}
              width={width / 3.5}
              height={height - 8}
              fill={drawerColor}
              cornerRadius={1}
            />
      
            {/* Handle lines */}
            <Line
              points={[
                x + 10, y + height / 3,
                x + width / 3.5 - 10, y + height / 3
              ]}
              stroke={handleColor}
              strokeWidth={1}
            />
            <Line
              points={[
                x + 10, y + height * 2 / 3,
                x + width / 3.5 - 10, y + height * 2 / 3
              ]}
              stroke={handleColor}
              strokeWidth={1}
            />
          </>
        );
      }
      
      
      case 'table': {
        const { x, y, width, height } = structure;
      
        const legSize = 4;
        const fillColor = "#a0522d"; // wood tone
        const strokeColor = "#5e3d1c";
      
        return (
          <>
            {/* Tabletop */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Table legs (small dots at corners) */}
            <Rect x={x + 2} y={y + 2} width={legSize} height={legSize} fill="#3e2b1c" />
            <Rect x={x + width - legSize - 2} y={y + 2} width={legSize} height={legSize} fill="#3e2b1c" />
            <Rect x={x + 2} y={y + height - legSize - 2} width={legSize} height={legSize} fill="#3e2b1c" />
            <Rect x={x + width - legSize - 2} y={y + height - legSize - 2} width={legSize} height={legSize} fill="#3e2b1c" />
          </>
        );
      }
      
      case 'bed': {
        const { x, y, width, height } = structure;
      
        const blanketHeight = height * 0.65;
        const pillowHeight = 8;
        const pillowWidth = width * 0.35;
        const headboardHeight = 6;
      
        return (
          <>
            {/* Blanket */}
            <Rect
              x={x}
              y={y + headboardHeight}
              width={width}
              height={blanketHeight}
              fill="#4caf50" // green blanket
              stroke="#2e7d32"
              strokeWidth={1}
              cornerRadius={3}
            />
      
            {/* Pillow */}
            <Rect
              x={x + (width - pillowWidth) / 2}
              y={y + headboardHeight + 2}
              width={pillowWidth}
              height={pillowHeight}
              fill="#fff176" // yellow pillow
              stroke="#fdd835"
              strokeWidth={0.5}
              cornerRadius={3}
            />
      
            {/* Headboard */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={headboardHeight}
              fill="#8d4b24" // brown headboard
              stroke="#5d2e0e"
              strokeWidth={1}
            />
          </>
        );
      }
      
      
      case 'sectional': {
        const { x, y, width, height } = structure;
      
        const longLength = width * 0.65;
        const shortLength = height * 0.7;
        const armWidth = 5;
        const cushionSize = 10;
      
        const fillColor = "#a9a9a9";
        const pillowColor = "#c0c0c0";
      
        return (
          <>
            {/* Long section base */}
            <Rect
              x={x}
              y={y}
              width={longLength}
              height={height}
              fill={fillColor}
              stroke="#666"
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Short section base (L) */}
            <Rect
              x={x}
              y={y - shortLength}
              width={width * 0.4}
              height={shortLength}
              fill={fillColor}
              stroke="#666"
              strokeWidth={1}
              cornerRadius={2}
            />
      
            {/* Pillows on long section */}
            {[0, 1].map((i) => (
              <Rect
                key={`lpillow-${i}`}
                x={x + 10 + i * (cushionSize + 4)}
                y={y + 4}
                width={cushionSize}
                height={cushionSize}
                fill={pillowColor}
                cornerRadius={2}
              />
            ))}
      
            {/* Pillows on short section */}
            {[0].map((i) => (
              <Rect
                key={`spillow-${i}`}
                x={x + 4}
                y={y - shortLength + 8}
                width={cushionSize}
                height={cushionSize}
                fill={pillowColor}
                cornerRadius={2}
              />
            ))}
      
            {/* Armrests */}
            <Rect
              x={x}
              y={y}
              width={armWidth}
              height={height}
              fill="#888"
            />
            <Rect
              x={x}
              y={y - shortLength}
              width={width * 0.4}
              height={armWidth}
              fill="#888"
            />
          </>
        );
      }
      
      case 'sofa': {
        const { x, y, width, height } = structure;
      
        const cushionGap = 4;
        const pillowHeight = height / 2.2;
        const cushionHeight = height / 2.2;
        const armWidth = 12;
      
        return (
          <React.Fragment key={structure.id}>
            {/* Sofa Base */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#b22222"
              stroke="#7a1f1f"
              strokeWidth={2}
              cornerRadius={5}
            />
      
            {/* Cushions */}
            <Rect
              x={x + armWidth}
              y={y + height - cushionHeight - 5}
              width={(width - armWidth * 2 - cushionGap) / 2}
              height={cushionHeight}
              fill="#dc143c"
              cornerRadius={4}
            />
            <Rect
              x={x + armWidth + (width - armWidth * 2 - cushionGap) / 2 + cushionGap}
              y={y + height - cushionHeight - 5}
              width={(width - armWidth * 2 - cushionGap) / 2}
              height={cushionHeight}
              fill="#dc143c"
              cornerRadius={4}
            />
      
            {/* Back Pillows */}
            {[0, 1, 2].map((i) => (
              <Rect
                key={`pillow-${i}`}
                x={x + armWidth + i * ((width - armWidth * 2) / 3)}
                y={y + 5}
                width={(width - armWidth * 2) / 3 - 2}
                height={pillowHeight}
                fill="#e34234"
                cornerRadius={6}
              />
            ))}
      
            {/* Armrests */}
            <Rect
              x={x}
              y={y}
              width={armWidth}
              height={height}
              fill="#a52a2a"
              cornerRadius={8}
            />
            <Rect
              x={x + width - armWidth}
              y={y}
              width={armWidth}
              height={height}
              fill="#a52a2a"
              cornerRadius={8}
            />
          </React.Fragment>
        );
      }
      
      case 'window': {
        const x = Math.min(structure.x1 || structure.x, structure.x2 ?? structure.x + structure.width);
        const y = Math.min(structure.y1 || structure.y, structure.y2 ?? structure.y + structure.height);
        const width = Math.abs((structure.x2 ?? structure.x + structure.width) - (structure.x1 ?? structure.x));
        const height = structure.height || 100;
        const frameColor = '#1E90FF'; // Frame color
        const glassColor = 'rgba(135, 206, 250, 0.35)'; // Glass color
      
        return (
          <>
            {/* Outer Frame */}
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              stroke={frameColor}
              strokeWidth={2}
              cornerRadius={2}
            />
            
            {/* Glass Pane */}
            <Rect
              x={x + 2}
              y={y + 2}
              width={width - 4}
              height={height - 4}
              fill={glassColor}
              stroke="#87CEEB"
              strokeWidth={1}
            />
      
            {/* Divider */}
            {width > height ? (
              <Line
                points={[x + width / 2, y, x + width / 2, y + height]}
                stroke={frameColor}
                strokeWidth={1}
                dash={[3, 3]}
              />
            ) : (
              <Line
                points={[x, y + height / 2, x + width, y + height / 2]}
                stroke={frameColor}
                strokeWidth={1}
                dash={[3, 3]}
              />
            )}
          </>
        );
      }
      
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

        case 'sliding-door': {
          const x = Math.min(structure.x1 || structure.x, (structure.x2 !== undefined ? structure.x2 : structure.x + structure.width));
          const y = Math.min(structure.y1 || structure.y, (structure.y2 !== undefined ? structure.y2 : structure.y + structure.height));
          const width = Math.abs((structure.x2 ?? structure.x + structure.width) - (structure.x1 ?? structure.x));
          const height = structure.height || 100;

        
          const panelWidth = width / 2;
        
          return (
            <>
              {/* Sliding Door Track */}
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke="#deb887"
                strokeWidth={2}
                cornerRadius={2}
              />
        
              {/* Left Glass Panel */}
              <Rect
                x={x}
                y={y}
                width={panelWidth}
                height={height}
                fill="rgba(135, 206, 235, 0.35)"
                stroke="#87ceeb"
                strokeWidth={1}
              />
        
              {/* Right Glass Panel */}
              <Rect
                x={x + panelWidth}
                y={y}
                width={panelWidth}
                height={height}
                fill="rgba(135, 206, 235, 0.35)"
                stroke="#87ceeb"
                strokeWidth={1}
              />
        
              {/* Divider Line */}
              <Line
                points={[
                  x + panelWidth, y,
                  x + panelWidth, y + height
                ]}
                stroke="#444"
                strokeWidth={2}
                dash={[4, 3]}
              />
            </>
          );
        }
        
        
        

        case 'door': {
          const knobRadius = 4;
          const knobX = structure.x + structure.width - knobRadius * 2;
          const knobY = structure.y + structure.height / 2;
        
          return (
            <>
              {/* Door rectangle */}
              <Rect
                key={structure.id}
                x={structure.x}
                y={structure.y}
                width={structure.width}
                height={structure.height}
                fill="#a0522d"
                stroke="#5e3d1c"
                strokeWidth={2}
                cornerRadius={2}
              />
        
              {/* Knob */}
              <Rect
                x={knobX}
                y={knobY}
                width={knobRadius * 2}
                height={knobRadius * 2}
                fill="#333"
                cornerRadius={knobRadius}
                shadowBlur={2}
                shadowColor="#000"
              />
        
              {/* Hinge line (optional) */}
              <Line
                points={[
                  structure.x, structure.y,
                  structure.x, structure.y + structure.height
                ]}
                stroke="#8b4513"
                strokeWidth={1}
                dash={[4, 3]}
              />
            </>
          );
        }
        


        case 'stairs':
          const steps = 5;
          const stepHeight = structure.height / steps;
          const stepWidth = structure.width / steps;
        
          return Array.from({ length: steps }).map((_, i) => (
            <Line
              key={`${structure.id}-step-${i}`}
              points={[
                structure.x + i * stepWidth, structure.y + i * stepHeight,
                structure.x + (i + 1) * stepWidth, structure.y + i * stepHeight,
                structure.x + (i + 1) * stepWidth, structure.y + (i + 1) * stepHeight,
                structure.x + i * stepWidth, structure.y + (i + 1) * stepHeight,
                structure.x + i * stepWidth, structure.y + i * stepHeight,
              ]}
              stroke="#888"
              fill="#aaa"
              strokeWidth={1}
              closed
            />
          ));

          case 'railing': {
            const barCount = Math.max(2, Math.floor(structure.width / 15)); // spacing control
            const spacing = structure.width / (barCount + 1);
            const barHeight = structure.height || 30;
          
            const verticalBars = Array.from({ length: barCount }).map((_, i) => {
              const x = structure.x + spacing * (i + 1);
              return (
                <Line
                  key={`bar-${i}`}
                  points={[x, structure.y, x, structure.y + barHeight]}
                  stroke="#FACC15"
                  strokeWidth={1.5}
                />
              );
            });
          
            return (
              <>
                {/* Top and bottom rails */}
                <Line
                  key={`${structure.id}-top`}
                  points={[structure.x, structure.y, structure.x + structure.width, structure.y]}
                  stroke="#FACC15"
                  strokeWidth={2}
                />
                <Line
                  key={`${structure.id}-bottom`}
                  points={[structure.x, structure.y + barHeight, structure.x + structure.width, structure.y + barHeight]}
                  stroke="#FACC15"
                  strokeWidth={2}
                />
                {/* Vertical bars */}
                {verticalBars}
              </>
            );
          }
          

      
      // For all other structures, render as rectangular shapes with type-specific colors
      default:
        return renderRectangular(colorSet.stroke, colorSet.fill);
    }
  }, [darkMode]);

  // Add styles for categories
  const categoryBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    margin: '0',
    backgroundColor: '#1e1e1e',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
    width: 'calc(33.33% - 1px)',
    height: '40px',
  };

  const activeCategoryStyle = {
    ...categoryBtnStyle,
    backgroundColor: '#252525',
    borderColor: '#FACC15',
    borderWidth: '1px',
  };

  const categoryLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
  };

  const elementBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
    height: '32px',
  };

  const activeElementStyle = {
    ...elementBtnStyle,
    backgroundColor: '#252525',
    borderColor: '#FACC15',
    borderWidth: '2px',
  };

  const elementLabelStyle = {
    fontSize: '0.8rem',
    fontWeight: '500',
    textAlign: 'center',
    color: '#ffffff',
  };

  // Add styles for the sidebar container
  const sidebarStyle = {
    width: `${SIDEBAR_WIDTH}px`,
    height: '100vh',
    backgroundColor: '#121212',
    borderRight: '1px solid #333',
    padding: '45px 4px 4px',
    overflowY: 'auto',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  // Add styles for section headers
  const sectionHeaderStyle = {
    padding: '0 0 2px 2px',
    borderBottom: '1px solid #444',
    marginBottom: '4px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
  };

  // Add styles for the elements grid
  const elementsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2px',
    padding: '0'
  };

  // Add styles for section container
  const sectionContainerStyle = {
    marginBottom: '6px',
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
          <div style={sidebarStyle}>
            <div style={sectionContainerStyle}>
              <h2 style={sectionHeaderStyle}>Add Elements</h2>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1px', 
                marginBottom: '4px',
                justifyContent: 'space-between' 
              }}>
                {elementCategories.map((category) => (
                  <button
                    key={category.id}
                    style={activeCategory === category.id ? activeCategoryStyle : categoryBtnStyle}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span style={categoryLabelStyle}>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionContainerStyle}>
              <h3 style={{...sectionHeaderStyle, fontSize: '1rem'}}>
                {elementCategories.find(c => c.id === activeCategory)?.label || 'Elements'}
              </h3>
              <div style={elementsGridStyle}>
                {currentElements.map((element) => (
                  <button
                    key={element.id}
                    style={currentTool === element.id ? activeElementStyle : elementBtnStyle}
                    onClick={element.action}
                  >
                    <span style={elementLabelStyle}>{element.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionContainerStyle}>
              <h3 style={{...sectionHeaderStyle, fontSize: '1rem'}}>Settings</h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2px 4px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '3px',
                }}>
                  <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.85rem' }}>Show Grid</span>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={() => setShowGrid(!showGrid)}
                    style={{ 
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2px 4px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '3px',
                }}>
                  <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.85rem' }}>Enable Snapping</span>
                  <input
                    type="checkbox"
                    checked={snapEnabled}
                    onChange={() => setSnapEnabled(!snapEnabled)}
                    style={{ 
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2px 4px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '3px',
                }}>
                  <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.85rem' }}>Light Mode</span>
                  <input
                    type="checkbox"
                    checked={!darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    style={{ 
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '2px 4px',
                  backgroundColor: '#1e1e1e',
                  borderRadius: '3px',
                }}>
                  <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.85rem' }}>Unit</span>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#252525',
                      color: '#fff',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      width: '80px',
                      fontSize: '0.85rem'
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
             height: 250,
             thickness: 1000000,
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