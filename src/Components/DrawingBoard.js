import React, { useState, useEffect, useRef } from "react";
import TwoDCanvas from "./TwoDCanvas";
import ThreeDCanvas from "./ThreeDCanvas";
import { Stage, Layer, Rect } from "react-konva";


const DrawingBoard = () => {
  const [is3DMode, setIs3DMode] = useState(false);
  const [walls, setWalls] = useState([]);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [projectName, setProjectName] = useState("Floorplan");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [unit, setUnit] = useState("meters");
  const [zoomScale, setZoomScale] = useState(1);
  const [measurements, setMeasurements] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const twoDCanvasRef = useRef(null);
  const threeDCanvasRef = useRef(null);
  const [structures, setStructures] = useState([]);



  
 
  




const renderStructures = () => {
  return structures.map((structure, index) => (
    <mesh key={index} position={[0, structure.height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[structure.width, structure.height, structure.width]} />
      <meshStandardMaterial
        color={
          structure.type === "room" ? "lightblue"
          : structure.type === "wall" ? "gray"
          : structure.type === "surface" ? "tan"
          : structure.type === "door" ? "brown"
          : structure.type === "window" ? "lightgray"
          : structure.type === "beam" ? "darkgray"
          : "sienna"
        }
      />
    </mesh>
  ));
};


  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleSwitchMode = () => setIs3DMode((prev) => !prev);

  

const updateMeasurements = (walls) => {
    const newMeasurements = walls.map((wall) => {
      const length = Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
      return {
        x: (wall.x1 + wall.x2) / 2,
        y: (wall.y1 + wall.y2) / 2,
        length: unit === "meters" ? `${(length / 100).toFixed(2)} m` : `${(length / 2.54).toFixed(2)} in`,
      };
    });
    setMeasurements(newMeasurements);
  };

  


  const addStructure = (type, width, height) => {
    const colorMap = {
      room: "#ADD8E6", // Light Blue
      wall: "#A9A9A9", // Dark Gray
      surface: "#D2B48C", // Tan
      door: "#8B4513", // Saddle Brown
      window: "#87CEFA", // Light Sky Blue
      beam: "#696969", // Dim Gray
      column: "#8B0000", // Dark Red
    };

    
  
    const newStructure = {
      id: structures.length,
      type,
      x: 100 + structures.length * 10,
      y: 100,
      width,
      height,
      color: colorMap[type] || "black",
    };
  
    setStructures((prev) => [...prev, newStructure]);
  };

  const updateStructure = (id, newX, newY) => {
    setStructures((prevStructures) =>
      prevStructures.map((structure) =>
        structure.id === id ? { ...structure, x: newX, y: newY } : structure
      )
    );
  };
  
  
const export2D = () => {
  const canvas = document.querySelector("canvas");

  if (!canvas) {
    console.warn("⚠️ No 2D canvas found for export!");
    return;
  }

  const link = document.createElement("a");
  link.download = `${projectName}_2D.png`; 
  link.href = canvas.toDataURL("image/png");
  link.click();

  console.log("✅ 2D Floorplan Exported Successfully!");
};




const export3D = () => {
  if (!threeDCanvasRef.current || !threeDCanvasRef.current.getCanvas) {
    console.warn("⚠️ Scene reference not found!");
    return;
  }

  const canvas = threeDCanvasRef.current.getCanvas();
  const link = document.createElement("a");
  link.download = `${projectName}_3D.png`; 
  link.href = canvas.toDataURL("image/png");
  link.click();
};

const addRoom = () => setStructures((prev) => [...prev, { type: "room", width: 300, height: 300 }]);
const addWall = () => setStructures((prev) => [...prev, { type: "wall", width: 200, height: 20 }]);
const addSurface = () => setStructures((prev) => [...prev, { type: "surface", width: 250, height: 10 }]);
const addDoor = () => setStructures((prev) => [...prev, { type: "door", width: 80, height: 200 }]);
const addWindow = () => setStructures((prev) => [...prev, { type: "window", width: 120, height: 100 }]);
const addBeam = () => setStructures((prev) => [...prev, { type: "beam", width: 100, height: 20 }]);
const addColumn = () => setStructures((prev) => [...prev, { type: "column", width: 30, height: 200 }]);



  

return (
  <div className={`w-screen h-screen relative ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
    {measurements.map((dim, index) => (
      <div key={index} style={{
        position: "absolute", left: `${dim.x}px`, top: `${dim.y}px`,
        background: "black", color: "gold", padding: "2px 5px",
        borderRadius: "5px", border: "1px solid gold", fontSize: "12px"
      }}>
        {dim.length}
      </div>
    ))}

    {/* 🛠 Sidebar Controls for Adding Structures */}
    <div style={{ position: "fixed", top: "10px", right: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 1100 }}>
      <button onClick={() => addStructure("room", 300, 300)}>🛋️ Add Room</button>
      <button onClick={() => addStructure("wall", 200, 20)}>🧱 Add Wall</button>
      <button onClick={() => addStructure("surface", 250, 10)}>🟤 Add Surface</button>
      <button onClick={() => addStructure("door", 80, 200)}>🚪 Add Door</button>
      <button onClick={() => addStructure("window", 120, 100)}>🪟 Add Window</button>
      <button onClick={() => addStructure("beam", 100, 20)}>🔩 Add Beam</button>
      <button onClick={() => addStructure("column", 30, 200)}>🏛️ Add Column</button>
    </div>


    <button className="hamburger-menu" onClick={() => setIsMenuOpen((prev) => !prev)}
  style={{
    fontSize: "24px", padding: "10px", background: "black", color: "gold",
    border: "2px solid gold", borderRadius: "6px", cursor: "pointer",
    position: "fixed", top: "80px", left: "20px", zIndex: 1100
  }}>
  ☰
</button>


{isSettingsOpen && (
  <div className="settings-menu" style={{
    position: "absolute", top: "120px", left: "200px", background: "black",
    border: "2px solid gold", borderRadius: "5px", padding: "10px",
    zIndex: 1100, minWidth: "200px"
  }}>
    <h3 style={{ color: "gold", marginBottom: "10px" }}>⚙️ Settings</h3>

    <label style={{ color: "white", display: "block", marginBottom: "5px" }}>
      <input type="checkbox" checked={gridVisible} onChange={() => setGridVisible((prev) => !prev)} />
      Show Grid
    </label>

    <label style={{ color: "white", display: "block", marginBottom: "5px" }}>
      <input type="checkbox" checked={snapEnabled} onChange={() => setSnapEnabled((prev) => !prev)} />
      Enable Snapping
    </label>

    <label style={{ color: "white", display: "block", marginBottom: "5px" }}>
      <input type="checkbox" checked={darkMode} onChange={() => setDarkMode((prev) => !prev)} />
      Dark Mode
    </label>

    <label style={{ color: "white", display: "block", marginBottom: "5px" }}>
      Unit:
      <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{
        marginLeft: "5px", background: "black", color: "gold",
        border: "1px solid gold", padding: "3px"
      }}>
        <option value="meters">Meters</option>
        <option value="inches">Inches</option>
      </select>
    </label>

    <button onClick={() => setIsSettingsOpen(false)} style={{
      color: "gold", background: "none", border: "1px solid gold",
      padding: "5px", cursor: "pointer", marginTop: "10px"
    }}>Close</button>
  </div>
)}




{isMenuOpen && (
  <div className="dropdown-menu" style={{
    position: "absolute", top: "120px", left: "20px", background: "black",
    border: "2px solid gold", borderRadius: "5px", padding: "10px",
    zIndex: 1100, minWidth: "150px"
  }}>
    <button onClick={export2D} style={{
      color: "gold", background: "none", border: "none",
      cursor: "pointer", marginTop: "10px"
    }}>📸 Export 2D</button>

    <button onClick={export3D} style={{
      color: "gold", background: "none", border: "none",
      cursor: "pointer"
    }}>🎥 Export 3D</button>

    <button onClick={() => setIsSettingsOpen((prev) => !prev)} style={{
      color: "gold", background: "none", border: "none",
      cursor: "pointer", marginTop: "10px"
    }}>⚙️ Settings</button>
  </div>
)}


    {/* 🟢 3D Mode Toggle */}
    {is3DMode ? (
      <ThreeDCanvas 
      ref={threeDCanvasRef} 
      moves={walls} 
      structures={structures} 
      is3DMode={is3DMode} 
      zoomScale={zoomScale} 
      selectedColor={selectedColor} 
    />
    
    
    ) : (
      <TwoDCanvas
        ref={twoDCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onDraw={(walls) => {
          setWalls(walls);
          updateMeasurements(walls);
        }}
        gridVisible={gridVisible}
        snapEnabled={snapEnabled}
        onSwitchMode={handleSwitchMode}
        zoomScale={zoomScale}
        selectedColor={selectedColor}
      />
    )}

    {/* 🟡 Konva 2D Structures */}
    <Stage width={window.innerWidth} height={window.innerHeight} style={{ background: "#ddd" }}>
      <Layer>
        {structures.map((structure) => (
          <Rect
            key={structure.id}
            x={structure.x}
            y={structure.y}
            width={structure.width}
            height={structure.height}
            fill={structure.color}
            draggable
            onDragEnd={(e) => updateStructure(structure.id, e.target.x(), e.target.y())}
          />
        ))}
      </Layer>
    </Stage>
  </div>
);


}

export default DrawingBoard;
