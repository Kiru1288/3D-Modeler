import React, { useState, useEffect, useRef } from "react";
import TwoDCanvas from "./TwoDCanvas";
import ThreeDCanvas from "./ThreeDCanvas";


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

  
  // 📤 **Export 2D as PNG**
const export2D = () => {
  const canvas = document.querySelector("canvas"); // ✅ Ensure we select the right canvas

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

      <div style={{ position: "fixed", top: "50%", left: "20px", transform: "translateY(-50%)", zIndex: 1100 }}>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          style={{
            width: "40px",
            height: "40px",
            border: "2px solid gold",
            borderRadius: "6px",
            cursor: "pointer",
            background: selectedColor,
          }}
        />
      </div>

      <button className="hamburger-menu" onClick={() => setIsMenuOpen((prev) => !prev)}
        style={{ fontSize: "24px", padding: "10px", background: "black", color: "gold", border: "2px solid gold",
          borderRadius: "6px", cursor: "pointer", position: "fixed", top: "80px", left: "20px", zIndex: 1100 }}>
        ☰
      </button>

      {isMenuOpen && (
        <div className="dropdown-menu" style={{ position: "absolute", top: "120px", left: "20px", background: "black",
          border: "2px solid gold", borderRadius: "5px", padding: "10px", zIndex: 1100, minWidth: "150px" }}>
          <button onClick={() => setIsSettingsOpen((prev) => !prev)} style={{ color: "gold", background: "none", border: "none", cursor: "pointer" }}>⚙️ Settings</button>
          {isSettingsOpen && (
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => setDarkMode((prev) => !prev)} style={{ color: "gold", background: "none", border: "none", cursor: "pointer" }}>
                {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </button>
              <button onClick={() => setUnit(unit === "meters" ? "feet" : "meters")} style={{ color: "gold", background: "none", border: "none", cursor: "pointer" }}>
                Unit: {unit === "meters" ? "Feet/Inches" : "Meters/Centimeters"}
              </button>
            </div>
          )}
          <button onClick={export2D} style={{ color: "gold", background: "none", border: "none", cursor: "pointer", marginTop: "10px" }}>📸 Export 2D</button>
          <button onClick={export3D} style={{ color: "gold", background: "none", border: "none", cursor: "pointer" }}>🎥 Export 3D</button>
        </div>
      )}

      <div className="project-name" style={{
        textAlign: "center", fontSize: "20px", fontWeight: "bold", color: "gold",
        padding: "10px", background: "black", borderBottom: "2px solid gold",
        position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
        width: "100%", zIndex: 1000
      }}>
        {projectName}
      </div>

      {is3DMode ? (
        <ThreeDCanvas ref={threeDCanvasRef} moves={walls} is3DMode={is3DMode} zoomScale={zoomScale} selectedColor={selectedColor} />
      ) : (
        <TwoDCanvas ref={twoDCanvasRef} width={window.innerWidth} height={window.innerHeight} onDraw={(walls) => {
            setWalls(walls);
            updateMeasurements(walls);
          }}
          gridVisible={gridVisible} snapEnabled={snapEnabled} onSwitchMode={handleSwitchMode} zoomScale={zoomScale}
          selectedColor={selectedColor} />
      )}
    </div>
  );
};

export default DrawingBoard;
