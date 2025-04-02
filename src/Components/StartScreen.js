import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../Backend/firebaseConfig';

const StartScreen = ({ onStart }) => {
  const [accessKey, setAccessKey] = useState('');
  const [accessValid, setAccessValid] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.getElementById("main-input")?.focus();
  }, [accessValid]);

  
  

   
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
      console.log("🔎 Keys found:", snapshot.docs.map(doc => doc.data()));
  
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

  return (
    <div className="start-screen">
      <div className="start-card" role="main">
        <h1 tabIndex="0">{accessValid ? "Name Your Project" : "Enter Access Key"}</h1>

        {!accessValid ? (
          <>
            <input
              id="main-input"
              type="text"
              maxLength="9"
              placeholder="Enter your 9-digit key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="project-input"
              onKeyDown={(e) => e.key === 'Enter' && validateAccessKey()}
              aria-label="Access Key"
            />
            {error && <div className="error-message" aria-live="polite">{error}</div>}
            <div className="start-buttons">
              <button
                className="start-btn"
                onClick={validateAccessKey}
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? "Checking..." : "🔐 Submit Key"}
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
              className="project-input"
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              aria-label="Project Name"
            />
            {error && <div className="error-message">{error}</div>}
            <div className="start-buttons">
              <button
                className="start-btn"
                onClick={handleStart}
                disabled={loading}
              >
                {loading ? "Starting..." : "🚀 Start from Scratch"}
              </button>
              <button
                className="start-btn secondary"
                disabled
                title="This feature is coming soon"
              >
                🧩 Choose from Examples (Coming Soon)
              </button>
            </div>
          </>
        )}
      </div>

      {/* Embedded Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        :root {
          --bg-dark: #1E1E1E;
          --bg-secondary: #252525;
          --bg-tertiary: #2D2D2D;
          --highlight: #FFD700;
          --font-color: var(--highlight);
          --border-radius: 8px;
          --padding: 20px;
          --shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .start-screen {
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          color: var(--font-color);
          padding: 20px;
          box-sizing: border-box;
        }

        .start-card {
          background: var(--bg-secondary);
          padding: 40px;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 500px;
          text-align: center;
          animation: fadeIn 0.6s ease-out;
        }

        .start-card h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 30px;
          color: var(--highlight);
        }

        .project-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 1.1rem;
          border: 2px solid var(--highlight);
          border-radius: var(--border-radius);
          background: var(--bg-tertiary);
          color: white;
          margin-bottom: 12px;
        }

        .project-input::placeholder {
          color: #bbb;
          font-size: 0.95rem;
        }

        .error-message {
          color: red;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .start-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .start-btn {
          padding: 12px;
          border-radius: var(--border-radius);
          background: var(--highlight);
          color: black;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          border: none;
        }

        .start-btn:hover {
          background: #f0c000;
          transform: scale(1.03);
        }

        .start-btn:disabled {
          background: #777;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .start-btn.secondary {
          background: var(--bg-tertiary);
          border: 1px solid var(--highlight);
          color: var(--highlight);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
