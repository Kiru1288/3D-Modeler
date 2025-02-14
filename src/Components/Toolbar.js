import React, { useState } from "react";

const Toolbar = ({ onClearCanvas, onSwitchMode, onUndo, onRedo, onToggleGrid, onToggleSnap }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  return (
    <div className="toolbar">
      <div className="menu-container">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰ Menu</button>
        <div className={`menu-content ${isMenuOpen ? "open" : ""}`}>
          <button className="button-31" onClick={() => {
            setGridVisible(prev => !prev);
            if (onToggleGrid) {
              onToggleGrid();
              console.log("✅ Grid toggled:", gridVisible ? "Hiding Grid" : "Showing Grid");
            } else {
              console.error("❌ onToggleGrid is undefined");
            }
          }}>
            {gridVisible ? "Hide Grid" : "Show Grid"}
          </button>

          <button className="button-31" onClick={() => {
            setSnapEnabled(prev => !prev);
            if (onToggleSnap) {
              onToggleSnap();
              console.log("✅ Snap toggled:", snapEnabled ? "Disabling Snap" : "Enabling Snap");
            } else {
              console.error("❌ onToggleSnap is undefined");
            }
          }}>
            Snap: {snapEnabled ? "ON" : "OFF"}
          </button>

          <button className="button-31" onClick={() => {
            if (onUndo) {
              onUndo();
              console.log("✅ Undo clicked");
            } else {
              console.error("❌ onUndo is undefined");
            }
          }}>⏪ Undo</button>

          <button className="button-31" onClick={() => {
            if (onRedo) {
              onRedo();
              console.log("✅ Redo clicked");
            } else {
              console.error("❌ onRedo is undefined");
            }
          }}>⏩ Redo</button>

          <button className="button-31" onClick={() => {
            if (onClearCanvas) {
              onClearCanvas();
              console.log("✅ Reset clicked");
            } else {
              console.error("❌ onClearCanvas is undefined");
            }
          }}>🗑️ Reset</button>
        </div>
      </div>

      <div className="center-btn">
        <button className="primary-btn" onClick={() => {
          if (onSwitchMode) {
            onSwitchMode();
            console.log("✅ 2D/3D Toggle clicked");
          } else {
            console.error("❌ onSwitchMode is undefined");
          }
        }}>
          🔄 2D/3D
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
