import React, { useState } from "react";

const Toolbar = ({ onClearCanvas, onSwitchMode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleClear = () => {
    if (typeof onClearCanvas !== "function") {
      console.error("❌ onClearCanvas is not a function");
      return;
    }

    if (window.confirm("Are you sure you want to clear the canvas?")) {
      onClearCanvas();
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="toolbar">
      <button onClick={onSwitchMode}>🔄 Switch to 2D/3D</button>
      <button onClick={handleClear}>🗑️ Clear Canvas</button>
      <button onClick={toggleDarkMode}>{isDarkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}</button>
    </div>
  );
};

export default Toolbar;
