// src/Backend/PendingApproval.jsx
import React, { useState, useEffect } from 'react';
import '../Components/DrawingBoard.css'; // ✅ Reuse shared styles
import artreumLogo from '../Assets/artreum-logo.png';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function PendingApproval() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const themeClass = !darkMode ? 'light-theme' : '';

  return (
    <div className={`app-container ${themeClass} start-screen-container`}>
      <img src={artreumLogo} alt="Artreum Homes Logo" className="start-screen-logo" />

      <div className="start-card text-center">
        <button
          onClick={toggleDarkMode}
          className="theme-toggle-btn start-theme-toggle"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <h1 className="text-yellow-400 text-3xl font-extrabold mb-4">⏳ Account Pending Approval</h1>
        <p className="text-gray-400 text-lg">Your account is awaiting  approval.</p>
        <p className="text-gray-500 mt-1">Please check back later.</p>
      </div>
    </div>
  );
}
