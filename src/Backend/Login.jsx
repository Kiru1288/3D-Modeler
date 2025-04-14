import React, { useState } from 'react';
import '../Components/DrawingBoard.css';

import artreumLogo from '../Assets/artreum-logo.png';
import { googleLogin, facebookLogin, yahooLogin } from './authBackend';
import { FiSun, FiMoon, FiLogIn } from 'react-icons/fi';

export default function Login() {
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogin = async (providerFn) => {
    setError('');
    try {
      await providerFn();
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    }
  };

  return (
    <div className={`app-container ${darkMode ? '' : 'light-theme'} start-screen-container`}>
      <img src={artreumLogo} alt="Artreum Homes Logo" className="start-screen-logo" />

      <div className="start-card text-center">
        <button
          onClick={toggleDarkMode}
          className="theme-toggle-btn start-theme-toggle"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <h1 className="text-white text-2xl mb-4">Log In</h1>
        {error && <p className="error-message text-red-400">{error}</p>}

        <div className="start-buttons flex flex-col gap-3">
          <button
            className="toolbar-btn start-action-btn text-black bg-[#FACC15]"
            onClick={() => handleLogin(googleLogin)}
          >
            Sign in with Google
          </button>
          <button
            className="toolbar-btn start-action-btn text-white bg-blue-600"
            onClick={() => handleLogin(facebookLogin)}
          >
            Sign in with Facebook
          </button>
          <button
            className="toolbar-btn start-action-btn text-white bg-purple-600"
            onClick={() => handleLogin(yahooLogin)}
          >
            Sign in with Yahoo
          </button>
        </div>
      </div>
    </div>
  );
}
