import React, { useEffect, memo, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  Html,
  SpotLight as DreiSpotLight,
  Sky,
  Environment
} from "@react-three/drei";
import * as THREE from "three";
import Door from "./Doors/Door";
import Window from "./Windows";
import Structure from "./Structure";
import JoystickController from "./JoystickController";
import grassTextureImg from '../Assets/texture-grass-field.jpg';
import { useLoader } from '@react-three/fiber';
import stoneWallImg from '../Assets/stone-wall.jpg';
import whiteWallImg from '../Assets/white-wall-textures.jpg';
import brickWallImg from '../Assets/brick_4_diff_4k.jpg';
import patternedDoorImg from '../Assets/full-frame-shot-patterned-wall_1048944-16000472.avif';
import { Group, Rect } from 'react-konva';
import WallWithCutout from './WallWithCutout';






// -----------------------
// Materials
// -----------------------
const MATERIALS = {
  WALL: new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.5,
    metalness: 0.1,
  }),
  FLOOR: new THREE.MeshStandardMaterial({
    color: "#e0e0e0",
    roughness: 0.8,
    metalness: 0.2,
  }),
  BEAM: new THREE.MeshStandardMaterial({
    color: "#696969", // dark gray
    roughness: 0.5,
    metalness: 0.3,
  }),
  GRASS: new THREE.MeshStandardMaterial({
    color: "#4caf50",
    roughness: 0.9,
    metalness: 0.1,
  }),
  WINDOW: new THREE.MeshPhysicalMaterial({
    color: "#a8d8ff",
    transmission: 0.5,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
  }),
  DOOR: new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.6,
    metalness: 0.2,
  }),
  FLOOR_TILE: new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.9,
    metalness: 0.0,
  }),
  FLOOR_CARPET: new THREE.MeshStandardMaterial({
    color: "#d3d3d3",
    roughness: 0.8,
    metalness: 0.0,
  }),
  CEILING: new THREE.MeshStandardMaterial({
    color: "#f0f0f0",
    roughness: 0.7,
    metalness: 0.0,
  }),
  FURNITURE: new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.6,
    metalness: 0.2,
  }),
  WALL_CONCRETE: new THREE.MeshStandardMaterial({
    color: "#808080",
    roughness: 0.6,
    metalness: 0.1,
  }),
  WALL_DRYWALL: new THREE.MeshStandardMaterial({
    color: "#f5f5f5",
    roughness: 0.5,
    metalness: 0.0,
  }),
  WALL_BRICK: new THREE.MeshStandardMaterial({
    color: "#b22222",
    roughness: 0.7,
    metalness: 0.0,
  }),
  DOOR_SLIDING: new THREE.MeshStandardMaterial({
    color: "#deb887",
    roughness: 0.5,
    metalness: 0.2,
  }),
  DOOR_FRENCH: new THREE.MeshStandardMaterial({
    color: "#fffaf0",
    roughness: 0.4,
    metalness: 0.3,
  }),
  WINDOW_BAY: new THREE.MeshPhysicalMaterial({
    color: "#add8e6",
    transmission: 0.6,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
  }),
  WINDOW_CASEMENT: new THREE.MeshPhysicalMaterial({
    color: "#87ceeb",
    transmission: 0.5,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
  }),
  FURNITURE_TABLE: new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.6,
    metalness: 0.2,
  }),
  FURNITURE_CHAIR: new THREE.MeshStandardMaterial({
    color: "#a0522d",
    roughness: 0.5,
    metalness: 0.2,
  }),
  FURNITURE_SOFA: new THREE.MeshStandardMaterial({
    color: "#d2691e",
    roughness: 0.7,
    metalness: 0.1,
  }),
  DECOR_PLANT: new THREE.MeshStandardMaterial({
    color: "#228b22",
    roughness: 0.8,
    metalness: 0.0,
  }),
  DECOR_LAMP: new THREE.MeshStandardMaterial({
    color: "#ffd700",
    roughness: 0.3,
    metalness: 0.5,
  }),

  ROOM_WALL: new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.6,
    metalness: 0.0,
  }),
  
};

const SCALE = 0.01; // 1 unit in 2D = 1m → In 3D, scale it to 1/100


// -----------------------
// Materials with textures
// -----------------------
const createBrickTexture = () => {
  const textureLoader = new THREE.TextureLoader();
  const brickColor = textureLoader.load('/textures/brick_diffuse.jpg');
  const brickNormal = textureLoader.load('/textures/brick_normal.jpg');
  const brickRoughness = textureLoader.load('/textures/brick_roughness.jpg');
  
  // Set repeat pattern for the textures
  [brickColor, brickNormal, brickRoughness].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.5, 0.5);
  });
  
  return new THREE.MeshStandardMaterial({
    map: brickColor,
    normalMap: brickNormal,
    roughnessMap: brickRoughness,
    roughness: 0.8,
    metalness: 0.1,
  });
};

const createWoodTexture = () => {
  const textureLoader = new THREE.TextureLoader();
  const woodColor = textureLoader.load('/textures/wood_diffuse.jpg');
  const woodNormal = textureLoader.load('/textures/wood_normal.jpg');
  
  // Set repeat pattern for the textures
  [woodColor, woodNormal].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  });
  
  return new THREE.MeshStandardMaterial({
    map: woodColor,
    normalMap: woodNormal,
    roughness: 0.7,
    metalness: 0.0,
  });
};

// Initialize textures - this function creates placeholder textures to use before actual textures load
const initializePlaceholderMaterials = () => {
  return {
    WALL_BRICK: new THREE.MeshStandardMaterial({
      color: "#b22222",
      roughness: 0.7,
      metalness: 0.0,
    }),
    FURNITURE_WOOD: new THREE.MeshStandardMaterial({
      color: "#8b4513",
      roughness: 0.6,
      metalness: 0.0,
    })
  };
};

// Load textures asynchronously
(() => {
  try {
    const brickMaterial = createBrickTexture();
    const woodMaterial = createWoodTexture();
    
    MATERIALS.WALL_BRICK = brickMaterial;
    MATERIALS.WALL_WOOD = woodMaterial;
    MATERIALS.FURNITURE_TABLE = woodMaterial.clone();
    MATERIALS.FURNITURE_CHAIR = woodMaterial.clone();
    
    
    
    
    console.log("Textures loaded successfully");
  } catch (error) {
    console.error("Error loading textures:", error);
    // If texture loading fails, use placeholder materials
    const placeholders = initializePlaceholderMaterials();
    Object.assign(MATERIALS, placeholders);
  }
})();

// -----------------------
// Wall Component
// -----------------------
const Wall = ({ x1, y1, x2, y2, height = 40, thickness = 5, type, material }) => {
  // Default to a material if none provided or if there's an issue
  let wallMaterial;
  try {
    wallMaterial = material || MATERIALS[type] || MATERIALS.WALL_CONCRETE;
  } catch (error) {
    // Fallback to a basic material
    wallMaterial = new THREE.MeshStandardMaterial({
      color: "#b76728", // Brown color like in screenshot
      roughness: 0.7,
      metalness: 0.1,
    });
  }
  
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  return (
    <group
      position={[(x1 + x2) / 2, height / 2, -(y1 + y2) / 2]}
      rotation={[0, -angle, 0]}
    >
      {/* Main wall */}
      <mesh
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, height, thickness]} />
        <primitive object={wallMaterial} attach="material" />

      </mesh>
    </group>
  );
};

// -----------------------
// Lighting Component
// -----------------------
const Lighting = () => (
  <>
    {/* Simple ambient light for even illumination */}
    <ambientLight intensity={0.4} />
<directionalLight position={[10, 10, 5]} intensity={1.0} castShadow />
<hemisphereLight skyColor="#b1e1ff" groundColor="#b97a20" intensity={0.3} />

    
    {/* Main directional light - simulates sun */}
    <directionalLight 
      position={[300, 400, 300]} 
      intensity={0.8} 
      castShadow 
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-500}
      shadow-camera-right={500}
      shadow-camera-top={500}
      shadow-camera-bottom={-500}
      shadow-camera-far={1500}
      shadow-bias={-0.0001}
    />
  </>
);



// Add natural terrain features - very minimal
const TerrainFeatures = () => {
  // Empty component as we're going for a clean look
  return null;
};

// -----------------------
// New Scene Component
// -----------------------
const Scene = ({ walls = [], is3DMode, previewMode, structures = [] }) => {

  const cameraProps = is3DMode
    ? { position: [0, 250, 250], fov: 60 }
    : { position: [0, 1000, 0], fov: 50 };

  return (
    <>
      

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        panSpeed={0.5}
        minDistance={300}
        maxDistance={800}
        maxPolarAngle={Math.PI / 2.1}
        screenSpacePanning={true}
        target={[0, 0, 0]}
        enableRotate={true}
      />

      {/* Render Walls with better textures */}
      <group>
        {walls && walls.length > 0 ? (
          walls.map((wall, i) => {
            if (!wall) {
              return null;
            }
            
            if (!wall.x1 || wall.x1 === undefined || !wall.y1 || wall.y1 === undefined || 
                !wall.x2 || wall.x2 === undefined || !wall.y2 || wall.y2 === undefined) {
              return null;
            }
            
            // Add proper material based on wall type
            let wallMaterial = MATERIALS.WALL; // default fallback

if (wall.type === "room") {
  wallMaterial = MATERIALS.ROOM_WALL;
} else if (wall.type === "brick") {
  wallMaterial = MATERIALS.WALL_BRICK;
} else if (wall.type && MATERIALS[wall.type.toUpperCase()]) {
  wallMaterial = MATERIALS[wall.type.toUpperCase()];
}

            
            
            return (
              <>
               
               <Wall 
  key={i} 
  {...wall} 
  height={40}     // closer to door height
  thickness={10}   // thinner and not intrusive
  type={wall.type}
  material={wallMaterial}
/>


              </>
            );
            
          })
        ) : null}
       
      </group>
    </>
  );
};

const Controls = ({ controlsRef, previewMode }) => {
  const { camera, gl } = useThree();

  return (
    <OrbitControls
      ref={(ref) => {
        if (ref) controlsRef.current = ref;
      }}
      args={[camera, gl.domElement]}
      enabled={!previewMode} // 🔥 disable during walkthrough
      enableDamping
      dampingFactor={0.05}
      panSpeed={1.5}
      screenSpacePanning={true}
      rotateSpeed={0.8}
      enableRotate={true}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
};

const Measurements = ({ walls }) => {
  if (!walls || !Array.isArray(walls) || walls.length === 0) {
    return null;
  }

  return walls
    .filter(wall => {
      // Check if wall has the properties needed for measurement
      if (!wall) return false;
      
      // Handle walls with x1/y1/x2/y2 properties
      return typeof wall.x1 === 'number' && 
             typeof wall.y1 === 'number' && 
             typeof wall.x2 === 'number' && 
             typeof wall.y2 === 'number';
    })
    .map((wall, i) => {
      // Handle walls with x1/y1/x2/y2 properties
      const startVec = new THREE.Vector2(wall.x1 || 0, wall.y1 || 0);
      const endVec = new THREE.Vector2(wall.x2 || 0, wall.y2 || 0);
      
      // Calculate length
      const length = startVec.distanceTo(endVec);

      // Calculate midpoint
      const midpoint = [
        (wall.x1 + wall.x2) / 2,
        45, // Position the labels just above the walls
        -(wall.y1 + wall.y2) / 2, // Note the negative sign for z-coordinate
      ];

      return (
        <Html key={i} position={midpoint} center>
          <div 
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {length.toFixed(2)}m
          </div>
        </Html>
      );
    });
};

const CameraPathPreview = ({ pathPoints = [], enabled, speed = 2, onEnd, controlsRef }) => {
  const { set, camera } = useThree();
  const currentIndex = useRef(0);
  const progress = useRef(0);
  const walkthroughCamera = useRef();

  useEffect(() => {
    if (enabled && pathPoints.length > 1) {
      currentIndex.current = 0;
      progress.current = 0;

      const start = pathPoints[0];
      walkthroughCamera.current?.position.set(...start);

      // Set camera as default
      if (walkthroughCamera.current) {
        set({ camera: walkthroughCamera.current });
        walkthroughCamera.current.lookAt(...pathPoints[1]);

        if (controlsRef?.current) {
          controlsRef.current.object = walkthroughCamera.current;
          controlsRef.current.target.set(...pathPoints[1]);
          controlsRef.current.update();
        }
      }
    }
  }, [enabled, pathPoints, controlsRef, set]);

  useFrame((_, delta) => {
    if (!enabled || pathPoints.length < 2) return;

    const cam = walkthroughCamera.current;
    if (!cam) return;

    const i = currentIndex.current;
    if (i >= pathPoints.length - 1) {
      onEnd?.();
      return;
    }

    const from = new THREE.Vector3(...pathPoints[i]);
    const to = new THREE.Vector3(...pathPoints[i + 1]);

    const direction = new THREE.Vector3().subVectors(to, from).normalize();
    const distance = from.distanceTo(to);
    const step = speed * delta;
    progress.current += step / distance;

    if (progress.current >= 1) {
      currentIndex.current++;
      progress.current = 0;
      return;
    }

    const newPos = new THREE.Vector3().lerpVectors(from, to, progress.current);
    cam.position.copy(newPos);

    const lookAt = new THREE.Vector3().addVectors(newPos, direction);
    cam.lookAt(lookAt);

    if (controlsRef?.current) {
      controlsRef.current.target.copy(lookAt);
      controlsRef.current.update();
    }
  });

  return (
    <PerspectiveCamera
      ref={walkthroughCamera}
      makeDefault
      fov={60}
      position={[0, 10, 0]} 
      far={100000}// This will be replaced on mount
    />
  );
};




  
  
  

const getWallRotationFromCoords = (x1, y1, x2, y2) => {
  const angle = Math.atan2(y2 - y1, x2 - x1); // direction in radians
  return angle;
};
  
const snapWalls = (walls, threshold = 10) => {
  if (!walls || walls.length === 0) {
    return [];
  }
  
  try {
    const snapped = [...walls].map(wall => ({...wall})); // Deep clone to avoid mutation
    
    // Safety check - verify all walls have required properties
    const validWalls = snapped.every(wall => 
      wall && 
      typeof wall.x1 === 'number' && 
      typeof wall.y1 === 'number' && 
      typeof wall.x2 === 'number' && 
      typeof wall.y2 === 'number'
    );
    
    if (!validWalls) {
      return walls; // Return original walls if invalid data
    }

    // First pass - snap to exact 20-unit grid
    for (let i = 0; i < snapped.length; i++) {
      const wall = snapped[i];
      
      // Snap to grid
      wall.x1 = Math.round(wall.x1 / 20) * 20;
      wall.y1 = Math.round(wall.y1 / 20) * 20;
      wall.x2 = Math.round(wall.x2 / 20) * 20;
      wall.y2 = Math.round(wall.y2 / 20) * 20;
    }

    // Second pass - snap endpoints to each other
    for (let i = 0; i < snapped.length; i++) {
      for (let j = 0; j < snapped.length; j++) {
        if (i === j) continue;

        const a1 = snapped[i];
        const a2 = snapped[j];

        const points = [
          ["x1", "y1"],
          ["x2", "y2"],
        ];

        points.forEach(([px1, py1]) => {
          points.forEach(([px2, py2]) => {
            const dx = a1[px1] - a2[px2];
            const dy = a1[py1] - a2[py2];
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < threshold) {
              a1[px1] = a2[px2];
              a1[py1] = a2[py2];
            }
          });
        });
      }
    }
    
    return snapped;
  } catch (error) {
    return walls; // Return original walls if error
  }
};

const DynamicCamera = ({ walls, controlsRef }) => {

  const cameraRef = useRef();
  const { set } = useThree();

  

  useEffect(() => {
    if (!walls || walls.length === 0) return;
  
    const center = getStructureCenter(walls);
    const camera = cameraRef.current;
  
    // Dynamically calculate scene bounds
    const bounds = new THREE.Box3();
    walls.forEach(w => {
      bounds.expandByPoint(new THREE.Vector3(w.x1, 0, -w.y1));
      bounds.expandByPoint(new THREE.Vector3(w.x2, 0, -w.y2));
    });
    const size = bounds.getSize(new THREE.Vector3()).length();
    const distance = size * 1.2;
  
    // Position the camera based on bounds
    camera.position.set(center.x + distance, distance, center.z + distance);
    camera.lookAt(center.x, center.y, center.z);
    set({ camera });
  
    if (controlsRef?.current) {
      controlsRef.current.target.set(center.x, center.y, center.z);
      controlsRef.current.update();
    }
  }, [walls, set]);
  

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={60} />;
};


// -----------------------
// Main ThreeDCanvas Component
// -----------------------
const ThreeDCanvas = ({ walls = [], structures = [], moves = [], is3DMode }) => {
  // Create sample walls if none provided
  const effectiveWalls = walls.length > 0 ? walls : [];
  const doorTexture = useLoader(THREE.TextureLoader, patternedDoorImg);
doorTexture.wrapS = doorTexture.wrapT = THREE.RepeatWrapping;
doorTexture.repeat.set(1, 1);


  
  const snappedWalls = snapWalls(effectiveWalls);
  window.walls = snappedWalls;

  const canvasRef = React.useRef(null);
  const controlsRef = React.useRef(); 
  const [walkThroughPath, setWalkThroughPath] = React.useState([]);
  const [previewMode, setPreviewMode] = React.useState(false);
  const brickWallTexture = useLoader(THREE.TextureLoader, brickWallImg);
  const whiteWallTexture = useLoader(THREE.TextureLoader, whiteWallImg);
  
  brickWallTexture.wrapS = brickWallTexture.wrapT = THREE.RepeatWrapping;
  brickWallTexture.repeat.set(2, 2);
  
  whiteWallTexture.wrapS = whiteWallTexture.wrapT = THREE.RepeatWrapping;
  whiteWallTexture.repeat.set(2, 2);
  
  MATERIALS.WALL = new THREE.MeshStandardMaterial({
    map: brickWallTexture,
    roughness: 0.8,
    metalness: 0.3,
  });
  
  MATERIALS.ROOM_WALL = new THREE.MeshStandardMaterial({
    map: whiteWallTexture,
    roughness: 0.6,
    metalness: 0.1,
  });
  


  useEffect(() => {
    const newPath = generateWalkthroughPath(snappedWalls, structures);
    
    newPath.forEach((point, index) => {
     
    });
  
    setWalkThroughPath((prevPath) => {
      const prevStr = JSON.stringify(prevPath);
      const newStr = JSON.stringify(newPath);
      return prevStr !== newStr ? newPath : prevPath;
    });
  }, [walls, structures, snappedWalls]);
  

  useEffect(() => {
    const handleKeyDown = (e) => {
      const action = e.key.toLowerCase();

      switch (action) {
        case 'w':
          canvasRef.current?.moveCamera?.('up');
          break;
        case 's':
          canvasRef.current?.moveCamera?.('down');
          break;
        case 'a':
          canvasRef.current?.moveCamera?.('left');
          break;
        case 'd':
          canvasRef.current?.moveCamera?.('right');
          break;
        case 'r':
          canvasRef.current?.moveCamera?.('reset');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef]);

  const generateWalkthroughPath = (walls = []) => {
    if (!walls || walls.length === 0) return [];
  
    const offset = 20;
    const stepsPerWall = 10;
    const points = [];
  
    const centerVec3 = getStructureCenter(walls);
    const center = new THREE.Vector2(centerVec3.x, -centerVec3.z); // Convert to 2D center
  
    walls.forEach((wall) => {
      const { x1, y1, x2, y2 } = wall;
      const p1 = new THREE.Vector2(x1, y1);
      const p2 = new THREE.Vector2(x2, y2);
      const mid = new THREE.Vector2().addVectors(p1, p2).multiplyScalar(0.5);
      const dir = new THREE.Vector2().subVectors(p2, p1).normalize();
      const normal = new THREE.Vector2(-dir.y, dir.x); // perpendicular
  
      // Flip normal if pointing outward
      const toCenter = new THREE.Vector2().subVectors(center, mid);
      if (normal.dot(toCenter) < 0) {
        normal.negate();
      }
  
      // Push multiple points along wall with inward offset
      for (let t = 0; t <= 1; t += 1 / stepsPerWall) {
        const interp = new THREE.Vector2().lerpVectors(p1, p2, t);
        const offsetPoint = interp.add(normal.clone().multiplyScalar(offset));
        points.push([offsetPoint.x, 10, -offsetPoint.y]);
      }
    });
  
    return points;
  };
  
  
  
  
  const CameraControls = ({ controlsRef, walls, canvasRef }) => {
    const { camera } = useThree();
    
    const moveCamera = useCallback((direction) => {
      if (!controlsRef.current) return;
      
      // Camera movement logic
      const cameraDirection = new THREE.Vector3();
      const camera = controlsRef.current.object;
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();
      
      const speed = 5;
      const sideways = new THREE.Vector3().crossVectors(
        cameraDirection,
        new THREE.Vector3(0, 1, 0)
      );
      
      switch (direction) {
        case "forward":
          camera.position.add(cameraDirection.multiplyScalar(speed));
          break;
        case "backward":
          camera.position.add(cameraDirection.multiplyScalar(-speed));
          break;
        case "left":
          camera.position.add(sideways.multiplyScalar(speed));
          break;
        case "right":
          camera.position.add(sideways.multiplyScalar(-speed));
          break;
        default:
          break;
      }
      
      controlsRef.current.target.copy(
        camera.position.clone().add(cameraDirection)
      );
    }, [controlsRef]);

    useEffect(() => {
      if (canvasRef?.current) {
        canvasRef.current.moveCamera = moveCamera;
      }
    }, [camera, moveCamera, canvasRef]);

    return null;
  };

  const handleMoveJoystick = ({ x, y }) => {
    const controls = controlsRef.current;
    if (!controls || !controls.object) return;
  
    const camera = controls.object;
    const speed = 1.5; // adjust to desired speed
    
  
    // Move in world directions (not camera-relative)
    const move = new THREE.Vector3(x * speed, 0, y * speed);
  
    camera.position.add(move);
    controls.target.add(move); // Keep orbit controls target synced
    controls.update();
  };
  
  const handleRotateJoystick = ({ x, y }) => {
    const controls = controlsRef.current;
    if (!controls || !controls.target || !controls.object) {
      console.warn("⚠️ OrbitControls not ready");
      return;
    }

    
  
    const rotateSpeed = 0.05;
  
    // Create vector from camera to target
    const offset = new THREE.Vector3();
    offset.copy(controls.object.position).sub(controls.target);
  
    // Calculate spherical coordinates
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(offset);
  
    // Adjust spherical angles based on joystick input
    spherical.theta -= x * rotateSpeed; // horizontal
    spherical.phi -= y * rotateSpeed;   // vertical
  
    // Clamp phi to prevent flipping
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.01, Math.PI / 2.1);
  
    // Convert spherical back to Cartesian
    offset.setFromSpherical(spherical);
  
    // Apply new camera position and look at target
    controls.object.position.copy(controls.target).add(offset);
    controls.object.lookAt(controls.target);
    controls.update();
  };
  
  return (
    <>



<Canvas
  shadows
  gl={{ 
    antialias: true, 
    alpha: false,
    powerPreference: "high-performance",
    depth: true,
    stencil: false,
    preserveDrawingBuffer: true,
    toneMappingExposure: 1.2,
  }}
  onCreated={({ gl }) => {
    gl.setClearColor("#91c788"); // Match your plane/floor color

  }}
  camera={{ fov: 45, near: 0.1, far: 10000 }}
  ref={canvasRef}
  style={{ background: "#b3d9ff" }}
  dpr={[1, 2]}
>
  {/* 🔵 Sky dome */}
 

  {/* 🔵 Fog to blend distant objects */}
  
        {/* Simple sky settings */}
        <Sky
  distance={5000}
  sunPosition={[200, 500, 100]}
  inclination={0.6}
  azimuth={0.25}
  rayleigh={0.01}
  turbidity={0.01}
  mieCoefficient={0.0001}
  mieDirectionalG={0.8}
  exposure={1.0}
  renderOrder={-10}
  material-transparent={false}
  material-depthWrite={true} // ✅ important!
/>







        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight 
          skyColor="#b1e1ff" 
          groundColor="#b97a20" 
          intensity={0.5} 
        />

        {/* Very minimal fog */}
        


        <Controls controlsRef={controlsRef} previewMode={previewMode} />

        <CameraControls
          controlsRef={controlsRef}
          canvasRef={canvasRef}
          walls={snappedWalls}
        />

        <Lighting />
        
        {/* Enhanced floor with reference markers */}
        <Floor walls={snappedWalls} />

        
        {/* Render walls */}
        <Scene 
  walls={snappedWalls} 
  is3DMode={is3DMode} 
  previewMode={previewMode} 
  structures={structures}
/>



        {/* Render structures */}
        {structures.map((structure, i) => {
          // Validate structure exists
          if (!structure || !structure.type) {
            return null;
          }

          // Common validation for dimensional structures
          const needsDimensions = [
            'window', 'door', 'sliding-door', 'french-door', 'bay-window', 'skylight',
            'table', 'sofa', 'sectional', 'bed', 'chair', 'desk', 'bookshelf', 'wardrobe', 
            'dresser', 'nightstand', 'kitchen', 'stove', 'refrigerator', 'kitchen-island', 
            'counter', 'cabinet', 'sink', 'bath', 'shower', 'toilet', 'vanity', 'lamp', 
            'ceiling-light', 'chandelier', 'carpet', 'tiles', 'plant', 'artwork', 'tv', 
            'fireplace', 'deck', 'patio', 'pool', 'garden', 'fence', 'path', 
            'outdoor-furniture', 'bbq', 'column', 'beam', 'railing', 'ceiling'
          ];
          
          if (needsDimensions.includes(structure.type)) {
            if (typeof structure.width !== 'number' || 
                typeof structure.height !== 'number' ||
                structure.width <= 0 || 
                structure.height <= 0) {
              // Skip invalid structures but don't log errors
              return null;
            }
          }

          // Render the appropriate component based on type
          switch (structure.type) {
            case "window":
            case "bay-window":
              let rotationY = 0;
let nearestWall = null;
let minDistance = Infinity;

// Loop through walls and find the nearest one
snappedWalls.forEach(wall => {
  if (!wall.x1 || !wall.y1 || !wall.x2 || !wall.y2) return;

  const wallMidX = (wall.x1 + wall.x2) / 2;
  const wallMidY = (wall.y1 + wall.y2) / 2;

  const dist = Math.hypot(structure.x - wallMidX, structure.y - wallMidY);

  if (dist < minDistance) {
    minDistance = dist;
    nearestWall = wall;
  }
});

if (nearestWall) {
  const dx = nearestWall.x2 - nearestWall.x1;
  const dy = nearestWall.y2 - nearestWall.y1;
  rotationY = Math.atan2(dy, dx);
}

return (
  <group
    key={i}
    position={[structure.x, 45, -structure.y]} // lowered from 75 to 45
    rotation={[0, rotationY, 0]}
  >
    <mesh castShadow receiveShadow position={[0, 0, 6]}>
      <boxGeometry args={[structure.width * 0.6, structure.height * 0.5, 2]} />
      <meshPhysicalMaterial
        color="#87CEEB"
        transmission={0.9}
        transparent
        opacity={0.5}
        roughness={0.1}
        metalness={0.05}
        clearcoat={0.1}
      />
    </mesh>
  </group>
);

              
            case "skylight":
              return (
                <group key={i} position={[structure.x, 30, -structure.y]} rotation={[0, structure.rotation || 0, 0]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[structure.width, 2, structure.height]} />
                    <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
                  </mesh>
                </group>
              );
              
case "door":
case "french-door":
case "sliding-door": {
  const is2D = !is3DMode;
  const doorWidth = structure.width || 60;
  const doorHeight = structure.height || 20;

  if (is2D && structure.type === "sliding-door") {
    return (
      <Group key={i}>
        <Rect
          x={structure.x - doorWidth / 2}
          y={structure.y - doorHeight / 2}
          width={doorWidth}
          height={doorHeight}
          stroke="#deb887"
          strokeWidth={2}
          dash={[4, 2]}
        />
        <Rect
          x={structure.x - doorWidth / 2}
          y={structure.y - doorHeight / 2}
          width={doorWidth / 2}
          height={doorHeight}
          fill="rgba(135, 206, 235, 0.3)"
        />
        <Rect
          x={structure.x}
          y={structure.y - doorHeight / 2}
          width={doorWidth / 2}
          height={doorHeight}
          fill="rgba(135, 206, 235, 0.3)"
        />
      </Group>
    );
  }

  // 3D Mode logic for all door types
  let rotationY = 0;
  let nearestWall = null;
  let minDistance = Infinity;

  snappedWalls.forEach(wall => {
    if (!wall.x1 || !wall.y1 || !wall.x2 || !wall.y2) return;
    const mx = (wall.x1 + wall.x2) / 2;
    const my = (wall.y1 + wall.y2) / 2;
    const dist = Math.hypot(structure.x - mx, structure.y - my);
    if (dist < minDistance) {
      minDistance = dist;
      nearestWall = wall;
    }
  });

  if (nearestWall) {
    rotationY = getWallRotationFromCoords(
      nearestWall.x1,
      nearestWall.y1,
      nearestWall.x2,
      nearestWall.y2
    );
  }

  if (structure.type === "sliding-door") {
    const displayHeight = structure.height * 0.3; // Scaled down height
    const displayWidth = structure.width;
    const frameDepth = 6;
  
    return (
      <group
        key={i}
        position={[structure.x, displayHeight / 2, -structure.y]}
        rotation={[0, rotationY, 0]}
      >
        {/* Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[displayWidth, displayHeight, frameDepth]} />
          <meshStandardMaterial color="#deb887" />
        </mesh>
  
        {/* Sliding glass pane (left) */}
        <mesh position={[-displayWidth / 4, 0, 3]}>
          <boxGeometry args={[displayWidth / 2 - 4, displayHeight - 10, 2]} />
          <meshPhysicalMaterial
            color="#87CEEB"
            transmission={0.7}
            transparent
            opacity={0.3}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>
  
        {/* Sliding glass pane (right) */}
        <mesh position={[displayWidth / 4, 0, 3]}>
          <boxGeometry args={[displayWidth / 2 - 4, displayHeight - 10, 2]} />
          <meshPhysicalMaterial
            color="#87CEEB"
            transmission={0.7}
            transparent
            opacity={0.3}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>
      </group>
    );
  }
  

  // Default door and french door
  return (
    <group
      key={i}
      position={[structure.x, (structure.height / 2) + 0.5, -structure.y]}
      rotation={[0, rotationY, 0]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[60, 140, 6]} />
        <meshStandardMaterial map={doorTexture} />
      </mesh>

      <mesh position={[25, 70, 4]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

                
              
            // Furniture items
            case "table":
            case "sofa":
            case "sectional":
            case "bed":
            case "chair":
            case "desk":
            case "bookshelf":
            case "wardrobe":
            case "dresser":
            case "nightstand":
            // Kitchen & Bath items
            case "kitchen":
            case "stove":
            case "refrigerator":
            case "kitchen-island":
            case "counter":
            case "cabinet":
            case "sink":
            case "bath":
            case "shower":
            case "toilet":
            case "vanity":
            // Fixtures & Decor
            case "lamp":
            case "ceiling-light":
            case "chandelier":
            case "carpet":
            case "tiles":
            case "plant":
            case "artwork":
            case "tv":
            case "fireplace":
            // Outdoor elements
            case "deck":
            case "patio":
            case "pool":
            case "garden":
            case "fence":
            case "path":
            case "outdoor-furniture":
            case "bbq":
            // Structural elements
            case "column":
            case "beam":
            case "railing":
            case "ceiling":
              // Use the Structure component for all these types
              default:
  return (
    <Structure 
      key={i} 
      type={structure.type}
      x={structure.x}
      y={structure.y}
      width={structure.width}
      height={structure.height}
      depth={structure.depth || 30}
      rotation={structure.rotation || 0}
    />
  );
} // ✅ <-- this closes the `switch`

          

        })}

        {/* Measurements */}
        <Measurements walls={snappedWalls} />
        
        {/* Walkthrough camera */}
        {previewMode ? (
  <CameraPathPreview
    pathPoints={walkThroughPath}
    enabled={previewMode}
    speed={45}
    controlsRef={controlsRef}
    onEnd={() => setPreviewMode(false)}
    maxPolarAngle={Math.PI / 2.5} // ⬅️ Already done, but try reducing it more if needed

  />
) : (
  <DynamicCamera walls={snappedWalls} />
)}




      </Canvas>

      {is3DMode && (
        <button
          onClick={() => setPreviewMode(prev => !prev)}
          style={{
            backgroundColor: "#FFD700",
            color: "black",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            marginRight: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            zIndex: 1000,
            position: 'absolute',
            top: 80,
            right: 20,
          }}
        >
          {previewMode ? "⏹️ Stop Walkthrough" : "▶️ Start Walkthrough"}
        </button>
      )}

      {is3DMode && (
        <>
          <JoystickController onMove={handleMoveJoystick} position="left" />
          <JoystickController onMove={handleRotateJoystick} position="right" />
        </>
      )}
    </>
  );
};


const Floor = () => {
  const grassTexture = useLoader(THREE.TextureLoader, grassTextureImg);
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(5000, 5000); // massive tile repeat

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, 0, 0]} // always centered
    >
      <planeGeometry args={[100000, 100000]} /> {/* ⬅️ Big enough to look infinite */}
      <meshStandardMaterial
        map={grassTexture}
        color="#91c788"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};





const Ceiling = () => {
  // Return null to completely remove the ceiling
  return null;
};
const getStructureCenter = (walls = []) => {
  if (!walls.length) return new THREE.Vector3(0, 0, 0);

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  walls.forEach(wall => {
    [[wall.x1, wall.y1], [wall.x2, wall.y2]].forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return new THREE.Vector3(centerX, 10, -centerY); // y=10 so camera aims at model height
};

const findNearestWall = (structure, walls) => {
  let minDist = Infinity;
  let nearestWall = null;

  walls.forEach(wall => {
    if (!wall.x1 || !wall.y1 || !wall.x2 || !wall.y2) return;

    const midX = (wall.x1 + wall.x2) / 2;
    const midY = (wall.y1 + wall.y2) / 2;
    const dist = Math.hypot(midX - structure.x, midY - structure.y);

    if (dist < minDist) {
      minDist = dist;
      nearestWall = wall;
    }
  });

  return nearestWall;
};



export default memo(ThreeDCanvas);