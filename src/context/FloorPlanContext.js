// src/context/FloorPlanContext.js
import React, { createContext, useState, useEffect } from 'react';
import { produce } from "immer";
import { openDB } from 'idb';

export const FloorPlanContext = createContext({
  walls: [],
  structures: [],
  addWall: () => {},
  removeWall: () => {},
  addStructure: () => {},
  removeStructure: () => {},
  undo: () => {},
});

export function FloorPlanProvider({ children }) {
  const [state, setState] = useState({ walls: [], structures: [] });
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB('floorPlanDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('history')) {
            db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
          }
        },
      });
      setDb(database);
    };
    initDB();
  }, []);

  const saveStateToDB = async () => {
    if (db) {
      await db.add('history', { walls: state.walls, structures: state.structures });
    }
  };

  const undo = async () => {
    if (!db) return;  // Prevents running before IndexedDB is initialized
  
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const allStates = await store.getAll();
    
    if (allStates.length > 1) {
      setState(allStates[allStates.length - 2]);
      await db.delete('history', allStates[allStates.length - 1].id);
    }
  };

  // Add a new wall
  const addWall = (newWall) => {
    const nextState = produce(state, (draft) => {
      draft.walls.push(newWall);
    });
  
    setState(nextState);
  
    if (db) {
      db.add('history', { walls: nextState.walls, structures: nextState.structures });
    }
  };
  

  // Remove a wall
  const removeWall = (wallId) => {
    setState(produce((draft) => {
      draft.walls = draft.walls.filter(wall => wall.id !== wallId);
    }));
    saveStateToDB();
  };

  // Add a new structure (door, window, etc.)
  const addStructure = (newStructure) => {
    const nextState = produce(state, (draft) => {
      draft.structures.push(newStructure);
    });
  
    setState(nextState);
  
    if (db) {
      db.add('history', { walls: nextState.walls, structures: nextState.structures });
    }
  };
  
  

  // Remove a structure
  const removeStructure = (structureId) => {
    setState(produce((draft) => {
      draft.structures = draft.structures.filter(structure => structure.id !== structureId);
    }));
    saveStateToDB();
  };

  return (
    <FloorPlanContext.Provider value={{ 
      walls: state.walls, 
      structures: state.structures, 
      addWall, 
      removeWall, 
      addStructure, 
      removeStructure, 
      undo
    }}>
      {children}
    </FloorPlanContext.Provider>
  );
}
