import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Backend/AuthContext';

import { FiSun, FiMoon, FiPlay, FiCopy } from 'react-icons/fi';
import './DrawingBoard.css';
import artreumLogo from '../Assets/artreum-logo.png';

const StartScreen = ({ onStart }) => {
  const { user, approved, loading } = useAuth();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (!loading && user && !approved) {
      navigate("/pending-approval");
    }
  }, [user, approved, loading, navigate]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleStart = () => {
    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }
    setError('');
    setLocalLoading(true);
    setTimeout(() => {
      onStart(projectName);
    }, 500);
  };

  const themeClass = !darkMode ? 'light-theme' : '';

  if (loading) {
    return (
      <div className="start-screen-container flex justify-center items-center min-h-screen text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`app-container ${darkMode ? '' : 'light-theme'} start-screen-container`}>
        <img src={artreumLogo} alt="Artreum Homes Logo" className="start-screen-logo" />
  
        <div className="start-card text-center">
          {/* ✅ Add theme toggle here */}
          <button
            onClick={toggleDarkMode}
            className="theme-toggle-btn start-theme-toggle"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
  
          <h1 className="text-white text-xl mb-4">Please log in to continue</h1>
          <a href="/login" className="toolbar-btn start-action-btn text-black bg-[#FACC15] px-6 py-2 rounded-md">
            Log In
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`app-container ${themeClass} start-screen-container`}>
      <img src={artreumLogo} alt="Artreum Homes Logo" className="start-screen-logo" />

      <div className="start-card" role="main">
        {/* ✅ Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="theme-toggle-btn start-theme-toggle"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
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
            disabled={localLoading}
          >
            {localLoading ? "Starting..." : <><FiPlay /> Start from Scratch</>}
          </button>
          <button
            className="toolbar-btn start-secondary-btn"
            disabled
            title="This feature is coming soon"
          >
            <FiCopy /> Choose from Examples
            <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '5px' }}>
              (Coming Soon)
            </span>
          </button>
          <a href="/login" className="toolbar-btn start-action-btn text-black bg-[#FACC15] px-6 py-2 rounded-md">
  Log In
</a>

        </div>
      </div>
    </div>
  );
};

export default StartScreen;
