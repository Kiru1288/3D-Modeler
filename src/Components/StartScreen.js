import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { FiSun, FiMoon, FiLogIn, FiPlay, FiCopy } from 'react-icons/fi'; // Import theme toggle icons
import { db } from '../Backend/firebaseConfig';
import './DrawingBoard.css'; // Import shared styles
import artreumLogo from '../Assets/artreum-logo.png'; // Import the logo

const StartScreen = ({ onStart }) => {
  const [accessKey, setAccessKey] = useState('');
  const [accessValid, setAccessValid] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Add state for dark mode, default to true (dark)
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Set initial theme based on system preference only on mount
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark); // Use the preference

    // Also keep the focus logic, but it should run based on accessValid changes
    // So we need a separate effect for that.
  }, []); // Empty dependency array: Run only once on mount

  useEffect(() => {
    // Focus input when the access key screen becomes valid (project name screen appears)
    if (accessValid) {
        document.getElementById("main-input")?.focus();
    }
  }, [accessValid]); // Run only when accessValid changes

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const validateAccessKey = async () => {
    const keyInput = accessKey.trim().toUpperCase();
    if (keyInput.length !== 9) {
      setError("Access key must be exactly 9 characters.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, "accessKeys"), where("key", "==", keyInput));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setAccessValid(true);
      } else {
        setError("Invalid access key.");
      }
    } catch (e) {
      console.error("❌ Firebase query error:", e);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
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

        <h1>{accessValid ? "Name Your Project" : "Enter Access Key"}</h1>

        {!accessValid ? (
          <>
            <input
              id="main-input"
              type="text"
              maxLength="9"
              placeholder="Enter your 9-digit key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="start-input"
              onKeyDown={(e) => e.key === 'Enter' && validateAccessKey()}
              aria-label="Access Key"
            />
            {error && <div className="error-message" aria-live="polite">{error}</div>}
            <div className="start-buttons">
              <button
                className="toolbar-btn start-action-btn"
                onClick={validateAccessKey}
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? "Checking..." : <><FiLogIn /> Submit Key</>}
              </button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Remove Embedded Styles - They are now in DrawingBoard.css or similar */}
      {/* <style>{` ... `}</style> */}
    </div>
  );
};

export default StartScreen;
