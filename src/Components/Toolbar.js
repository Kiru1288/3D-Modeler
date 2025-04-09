import React, { useState } from "react";
import "../styling/toolbar.css";

const Toolbar = ({
  onUploadFloorplan,
  onDrawRoom,
  onAddSurface,
  onPlaceDoor,
  onPlaceWindow,
  onPlaceStructural,
  onColorSchemeChange,
}) => {
  // States to toggle the dropdown menus
  const [showDoorMenu, setShowDoorMenu] = useState(false);
  const [showWindowMenu, setShowWindowMenu] = useState(false);

  return (
    <div className="toolbar black-gold-toolbar">
      {/* LEFT-SIDE BUTTONS */}
      <div className="side-buttons">
        <button
          className="button-31"
          onClick={() => {
            console.log("Clicked: Upload Floorplan");
            onUploadFloorplan();
          }}
        >
          Upload 2D Floorplan
        </button>

        <button
          className="button-31"
          onClick={() => {
            console.log("Clicked: Draw Room");
            onDrawRoom();
          }}
        >
          Draw Room
        </button>

        <button
          className="button-31"
          onClick={() => {
            console.log("Clicked: Add Surface");
            onAddSurface();
          }}
        >
          Add Surface
        </button>
      </div>

      {/* DOOR DROPDOWN */}
      <div className="dropdown">
        <button
          className="button-31"
          onClick={() => {
            console.log("Clicked: Place Door dropdown");
            setShowDoorMenu(!showDoorMenu);
          }}
        >
          Place Door
        </button>
        {showDoorMenu && (
          <div className="dropdown-content open">
            <button
              className="button-31"
              onClick={() => {
                console.log("Selected: Single Door");
                onPlaceDoor("single");
              }}
            >
              Single Door
            </button>
            <button
              className="button-31"
              onClick={() => {
                console.log("Selected: Double Door");
                onPlaceDoor("double");
              }}
            >
              Double Door
            </button>
            <button
              className="button-31"
              onClick={() => {
                console.log("Selected: Sliding Door");
                onPlaceDoor("sliding");
              }}
            >
              Sliding Door
            </button>
          </div>
        )}
      </div>

      {/* WINDOW DROPDOWN */}
      <div className="dropdown">
        <button
          className="button-31"
          onClick={() => {
            console.log("Clicked: Place Window dropdown");
            setShowWindowMenu(!showWindowMenu);
          }}
        >
          Place Window
        </button>
        {showWindowMenu && (
          <div className="dropdown-content open">
            <button
              className="button-31"
              onClick={() => {
                console.log("Selected: Casement Window");
                onPlaceWindow("casement");
              }}
            >
              Casement Window
            </button>
            <button
              className="button-31"
              onClick={() => {
                console.log("Selected: Sliding Window");
                onPlaceWindow("sliding");
              }}
            >
              Sliding Window
            </button>
            <button
              className="button-31"
              onClick={() => {
                console.log("Selected: Bay Window");
                onPlaceWindow("bay");
              }}
            >
              Bay Window
            </button>
          </div>
        )}
      </div>

      {/* STRUCTURAL */}
      <button
        className="button-31"
        onClick={() => {
          console.log("Clicked: Place Structural");
          onPlaceStructural();
        }}
      >
        Place Structural
      </button>

      {/* COLOR SCHEME SWITCHER */}
      <label htmlFor="colorScheme" style={{ marginLeft: "15px", marginRight: "5px" }}>
        Color Scheme:
      </label>
      <select
        id="colorScheme"
        onChange={(e) => {
          console.log("Color scheme changed to:", e.target.value);
          onColorSchemeChange(e.target.value);
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};

export default Toolbar;
