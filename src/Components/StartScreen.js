import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiPlay, FiCopy } from 'react-icons/fi'; // Import theme toggle icons
import './DrawingBoard.css'; // Import shared styles
import artreumLogo from '../Assets/artreum-logo.png'; // Import the logo

const StartScreen = ({ onStart }) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Add state for dark mode, default to true (dark)
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Set initial theme based on system preference only on mount
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark); // Use the preference

    // Focus the input field when component mounts
    document.getElementById("main-input")?.focus();
  }, []); // Empty dependency array: Run only once on mount

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleStart = () => {
    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      onStart(projectName);
    }, 500);
  };

  // Theme class applied to the main container based on *local* darkMode state
  const themeClass = !darkMode ? 'light-theme' : '';

  return (
    // Ensure themeClass is correctly applied
    <div className={`app-container ${themeClass} start-screen-container`}>
      {/* Add the logo image before the card */}
      <img src={artreumLogo} alt="Artreum Homes Logo" className="start-screen-logo" />

      <div className="start-card" role="main">
        {/* Theme Toggle Button */}
        <button onClick={toggleDarkMode} className="theme-toggle-btn start-theme-toggle" title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <h1>Name Your Project</h1>

        <input
          id="main-input"
          type="text"
          placeholder="e.g., My Dream House"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="start-input"
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          aria-label="Project Name"
        />
        {error && <div className="error-message">{error}</div>}
        <div className="start-buttons">
          <button
            className="toolbar-btn start-action-btn"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting..." : <><FiPlay /> Start from Scratch</>}
          </button>
          <button
            className="toolbar-btn start-secondary-btn"
            disabled
            title="This feature is coming soon"
          >
            <FiCopy /> Choose from Examples
            <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '5px' }}>(Coming Soon)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
