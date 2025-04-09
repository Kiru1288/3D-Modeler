// src/context/FloorPlanContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';

export const FloorPlanContext = createContext();

export const FloorPlanProvider = ({ children }) => {
  const [walls, setWalls] = useState([]);
  const [structures, setStructures] = useState([]);
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
      await db.add('history', { walls: walls, structures: structures });
    }
  };

  const undo = async () => {
    if (!db) return;
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const allStates = await store.getAll();

    if (allStates.length > 1) {
      setWalls(allStates[allStates.length - 2].walls);
      setStructures(allStates[allStates.length - 2].structures);
      await db.delete('history', allStates[allStates.length - 1].id);
    }
  };

  const addWall = useCallback((wall) => {
    const wallWithType = { ...wall, type: wall.type || 'brick' };
    setWalls(prev => [...prev, wallWithType]);
    if (db) db.add('history', { walls: [...walls, wallWithType], structures: structures });
  }, [db]);

  const addStructure = useCallback((structure) => {
    const id = `structure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let defaults = { depth: 2 };
    
    switch(structure.type) {
      case 'table':
        defaults = { height: 30, depth: 5 };
        break;
      case 'sofa':
        defaults = { height: 40, depth: 15 };
        break;
      case 'bed':
        defaults = { height: 50, depth: 10 };
        break;
      case 'door':
        defaults = { material: 'wood', doorType: 'hinged' };
        break;
      case 'window':
        defaults = { material: 'glass', windowType: 'casement' };
        break;
      default:
        break;
    }
    
    const structureWithDefaults = { 
      ...defaults, 
      ...structure, 
      id 
    };
    
    setStructures(prev => [...prev, structureWithDefaults]);
    if (db) db.add('history', { walls: walls, structures: [...structures, structureWithDefaults] });
  }, [db, walls, structures]);

  const removeWall = (wallId) => {
    setWalls(prev => prev.filter(wall => wall.id !== wallId));
    saveStateToDB();
  };

  const removeStructure = (structureId) => {
    setStructures(prev => prev.filter(structure => structure.id !== structureId));
    saveStateToDB();
  };

  const resetWalls = useCallback((newWalls) => {
    const wallsWithTypes = newWalls.map(wall => ({
      ...wall,
      type: wall.type || 'brick'
    }));
    setWalls(wallsWithTypes);
    if (db) db.add('history', { walls: wallsWithTypes, structures: structures });
  }, [db, structures]);

  const resetStructures = useCallback((newStructures) => {
    setStructures(newStructures);
    if (db) db.add('history', { walls: walls, structures: newStructures });
  }, [db, walls]);

  return (
    <FloorPlanContext.Provider
      value={{
        walls,
        structures,
        addWall,
        removeWall,
        addStructure,
        removeStructure,
        undo,
        resetWalls,
        resetStructures
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
};

