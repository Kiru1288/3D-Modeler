import React, { useState } from "react";
import "../styling/toolbar.css";

const Toolbar = ({ onSwitchMode, onUndo, onRedo, onClearCanvas }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="toolbar-container">
      {/* 🔽 Always Visible Hamburger Menu */}
      <button
        className="hamburger-menu"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        ☰
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="dropdown-menu">
          <p style={{ color: "gold" }}>Menu Item 1</p>
          <p style={{ color: "gold" }}>Menu Item 2</p>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
