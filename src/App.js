import React from "react";
import DrawingBoard from "./Components/DrawingBoard";
import "./App.css"; 

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <DrawingBoard />
    </div>
  );
}

export default App;
