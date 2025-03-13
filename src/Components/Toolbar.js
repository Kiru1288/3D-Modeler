import React from "react";
import "../styling/toolbar.css";

const Toolbar = ({ onUploadFloorplan }) => {
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
      </div>
    </div>
  );
};

export default Toolbar;
