import React, { useEffect, memo, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  Html,
  SpotLight as DreiSpotLight,
  Sky
} from "@react-three/drei";
import * as THREE from "three";
import Door from "./Doors/Door";
import Window from "./Windows";
import JoystickController from "./JoystickController";

// -----------------------
// Materials
// -----------------------
const MATERIALS = {
  WALL: new THREE.MeshStandardMaterial({
    color: "#cccccc",
    roughness: 0.5,
    metalness: 0.1,
  }),
  FLOOR: new THREE.MeshStandardMaterial({
    color: "#e0e0e0",
    roughness: 0.8,
    metalness: 0.2,
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
};

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
const Wall = ({ x1, y1, x2, y2, height = 30, thickness = 2, type, material }) => {
  const wallMaterial = material || MATERIALS[type] || MATERIALS.WALL_CONCRETE;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Load texture color based on wall type, used as fallback if wallMaterial is unavailable
  let wallColor;
  switch(type) {
    case 'brick':
      wallColor = '#b22222'; // Brick red
      break;
    case 'concrete':
      wallColor = '#808080'; // Gray
      break;
    case 'drywall':
      wallColor = '#f5f5f5'; // Off-white
      break;
    default:
      wallColor = '#cccccc'; // Default gray
  }
  // Using wallColor in debug: console.log("Wall color for material fallback:", wallColor);

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
        <primitive object={wallMaterial} />
      </mesh>
      
      {/* Baseboard */}
      <mesh
        position={[0, -height/2 + 1, thickness/2 + 0.1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, 2, 0.2]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Opposite baseboard */}
      <mesh
        position={[0, -height/2 + 1, -thickness/2 - 0.1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, 2, 0.2]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
    </group>
  );
};

// -----------------------
// Lighting Component
// -----------------------
const Lighting = () => (
  <>
    <ambientLight intensity={0.7} />
    <directionalLight 
      position={[0, 100, 0]} 
      intensity={1.0} 
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
    <directionalLight position={[50, 50, 50]} intensity={0.4} />
    <hemisphereLight intensity={0.5} groundColor={new THREE.Color("#8BC34A")} />
  </>
);

// Add natural terrain features
const TerrainFeatures = () => (
  <group>
    {/* Add a few rocks - very subtle */}
    {Array.from({ length: 4 }).map((_, idx) => {
      const x = (Math.random() - 0.5) * 800;
      const z = (Math.random() - 0.5) * 800;
      const scale = 0.5 + Math.random() * 1;
      
      return (
        <mesh 
          key={`rock-${idx}`} 
          position={[x, scale/3, z]} 
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[scale, 6, 6]} />
          <meshStandardMaterial 
            color="#C5E1A5" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      );
    })}
    
    {/* Add small bushes - simple green spheres, very subtle */}
    {Array.from({ length: 6 }).map((_, idx) => {
      const x = (Math.random() - 0.5) * 700;
      const z = (Math.random() - 0.5) * 700;
      const scale = 1 + Math.random() * 2;
      const yPos = scale * 0.1;
      
      return (
        <group 
          key={`bush-${idx}`} 
          position={[x, yPos, z]}
        >
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[scale, 8, 8]} />
            <meshStandardMaterial 
              color="#C5E1A5" 
              roughness={1.0}
            />
          </mesh>
        </group>
      );
    })}
  </group>
);

// -----------------------
// New Scene Component
// -----------------------
const Scene = ({ walls = [], is3DMode }) => {
  useEffect(() => {
    console.log("🎭 Walls Rendered in Scene:", walls.length);
  }, [walls, is3DMode]);

  const cameraProps = is3DMode
    ? { position: [0, 100, 200], fov: 55 }
    : { position: [0, 1000, 0], fov: 50 };

  return (
    <>
      <PerspectiveCamera makeDefault {...cameraProps} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        panSpeed={0.5}
        minDistance={10}
        maxDistance={800}
        maxPolarAngle={Math.PI / 2.1}
        screenSpacePanning={true}
        target={[0, 0, 0]}
        enableRotate={true}
      />

      {/* Render Walls with better textures */}
      <group>
        {walls.map((wall, i) => {
          if (!wall || !wall.x1 || !wall.y1 || !wall.x2 || !wall.y2) return null;
          
          // Add proper material based on wall type
          let wallMaterial;
          switch(wall.type) {
            case 'concrete':
              wallMaterial = MATERIALS.WALL_CONCRETE;
              break;
            case 'brick':
              wallMaterial = MATERIALS.WALL_BRICK;
              break;
            case 'drywall':
              wallMaterial = MATERIALS.WALL_DRYWALL;
              break;
            default:
              wallMaterial = MATERIALS.WALL;
              break;
          }
          
          return (
            <Wall 
              key={i} 
              {...wall} 
              height={30} 
              thickness={5}
              type={wall.type || 'brick'}
              material={wallMaterial}
            />
          );
        })}
      </group>
    </>
  );
};

const Controls = ({ controlsRef }) => {
  const { camera, gl } = useThree();

  return (
    <OrbitControls
      ref={(ref) => {
        if (ref) {
          controlsRef.current = ref;
        }
      }}
      args={[camera, gl.domElement]}
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
  return walls
    .filter(wall => wall.start && wall.end)
    .map((wall, i) => {
      const startVec = new THREE.Vector2(wall.start?.x || 0, wall.start?.z || 0);
      const endVec = new THREE.Vector2(wall.end?.x || 0, wall.end?.z || 0);
      const length = endVec.sub(startVec).length();

      // Calculate midpoint between start and end points
      const midpoint = [
        (wall.start?.x || 0 + wall.end?.x || 0) / 2,
        wall.height / 2 + 15, // Position the labels above the walls
        (wall.start?.z || 0 + wall.end?.z || 0) / 2,
      ];

      return (
        <Html key={i} position={midpoint} center>
          <div 
            className="measurement-label"
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {length.toFixed(2)}m
          </div>
        </Html>
      );
    });
};

const CameraPathPreview = ({ pathPoints = [], enabled, speed = 0.5, onEnd }) => {
  const ref = useRef();
  const currentIndex = useRef(0);

  useFrame(() => {
    if (!enabled || pathPoints.length < 2 || !ref.current) return;

    const current = pathPoints[currentIndex.current];
    const next = pathPoints[(currentIndex.current + 1) % pathPoints.length];

    const cam = ref.current;
    cam.position.lerp(
      new THREE.Vector3(current[0], current[1], current[2]),
      speed * 0.1
    );
    cam.lookAt(next[0], next[1], next[2]);

    const dist = cam.position.distanceTo(new THREE.Vector3(...current));
    if (dist < 1) {
      currentIndex.current += 1;
      if (currentIndex.current >= pathPoints.length - 1) {
        currentIndex.current = 0;
        if (onEnd) onEnd();
      }
    }
  });

  return (
    <PerspectiveCamera ref={ref} makeDefault position={[0, 5, 0]} fov={75} />
  );
};

const snapWalls = (walls, threshold = 5) => {
  const snapped = [...walls];

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
};

// -----------------------
// Main ThreeDCanvas Component
// -----------------------
const ThreeDCanvas = ({ walls = [], structures = [], moves = [], is3DMode }) => {
  const snappedWalls = snapWalls(walls);
  const canvasRef = React.useRef(null);
  const controlsRef = React.useRef(); 
  const [walkThroughPath, setWalkThroughPath] = React.useState([]);
  const [previewMode, setPreviewMode] = React.useState(false);

  useEffect(() => {
    const newPath = generateWalkthroughPath(snappedWalls, structures);
    setWalkThroughPath((prevPath) => {
      const prevStr = JSON.stringify(prevPath);
      const newStr = JSON.stringify(newPath);
      return prevStr !== newStr ? newPath : prevPath;
    });
  }, [walls, structures, snappedWalls]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log("🔑 Key pressed:", e.key); 

      const action = e.key.toLowerCase();

      switch (action) {
        case 'w':
          console.log("⬆️ Move camera forward");
          canvasRef.current?.moveCamera?.('up');
          break;
        case 's':
          console.log("⬇️ Move camera backward");
          canvasRef.current?.moveCamera?.('down');
          break;
        case 'a':
          console.log("⬅️ Move camera left");
          canvasRef.current?.moveCamera?.('left');
          break;
        case 'd':
          console.log("➡️ Move camera right");
          canvasRef.current?.moveCamera?.('right');
          break;
        case 'r':
          console.log("🔄 Reset camera");
          canvasRef.current?.moveCamera?.('reset');
          break;
        default:
          console.log("⚠️ Unhandled key:", e.key);
          break;
      }
    };

    console.log("✅ Keyboard controls initialized");

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      console.log("❌ Keyboard controls removed");
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef]);

  const generateWalkthroughPath = (walls = [], structures = []) => {
    if (!walls || walls.length === 0 || !walls[0]) return [];

    const referenceWall = walls[0];
    if (!referenceWall.x1 || !referenceWall.x2 || !referenceWall.y1 || !referenceWall.y2) return [];
    
    const startX = (referenceWall.x1 + referenceWall.x2) / 2;
    
    const startZ = (referenceWall.y1 + referenceWall.y2) / 2;

    const dx = referenceWall.x2 - referenceWall.x1;
    const dz = referenceWall.y2 - referenceWall.y1;
    const wallLength = Math.hypot(dx, dz);
    const inwardNormal = [-dz / wallLength, dx / wallLength]; 

    const entryX = startX + inwardNormal[0] * 50;
    const entryZ = startZ + inwardNormal[1] * 50;

    const xs = walls.flatMap(w => [w.x1, w.x2]);
    const zs = walls.flatMap(w => [w.y1, w.y2]);

    const minX = Math.min(...xs) + 50;
    const maxX = Math.max(...xs) - 50;
    const minZ = Math.min(...zs) + 50;
    const maxZ = Math.max(...zs) - 50;

    const path = [[entryX, 10, -entryZ]];
    const spacing = 100;
    let forward = true;

    for (let z = minZ; z <= maxZ; z += spacing) {
      const row = [];
      for (let x = minX; x <= maxX; x += spacing) {
        row.push([x, 10, -z]); 
      }
      path.push(...(forward ? row : row.reverse()));
      forward = !forward;
    }

    return path;
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
    preserveDrawingBuffer: true
  }} 
  camera={{ fov: 45, near: 0.1, far: 2000 }}
  ref={canvasRef}
  style={{ background: "#E3F2FD" }} // Very light sky blue
  dpr={[1, 2]} // Responsive pixel ratio
>
  {/* Ultra simplified sky settings */}
  <Sky 
    distance={450000}
    sunPosition={[0, 1, 0]} // Sun directly overhead
    inclination={0.6}
    azimuth={0.25}
    rayleigh={0.1} // Lower for more uniform blue
    turbidity={0.1} // Very clear sky
    mieCoefficient={0.0005}
    mieDirectionalG={0.5}
    exposure={1.0}
  />

  {/* Minimal fog for clean look */}
  <fog attach="fog" args={['#E3F2FD', 500, 2000]} />

  <Controls controlsRef={controlsRef} />
  <CameraControls
    controlsRef={controlsRef}
    canvasRef={canvasRef}
    walls={snappedWalls}
  />

  <Lighting />
  
  {/* Floor and terrain features */}
  <Floor type="GRASS" />
  <TerrainFeatures />
  <Ceiling />
  
  {/* Wall rendering */}
  <Scene walls={snappedWalls} is3DMode={is3DMode} />

  {/* Render structures (furniture, etc.) */}
  {structures.map((structure, i) => {
    if (
      !structure || 
      !structure.type || 
      typeof structure.width !== "number" || 
      typeof structure.height !== "number" || 
      structure.width <= 0 || 
      structure.height <= 0
    ) {
      return null;
    }

    switch (structure.type) {
      case "window":
        return (
          <Window
            key={i}
            position={[structure.x, 15, -structure.y]} 
            size={{ width: structure.width, height: structure.height }}
            rotation={[0, 0, 0]}
          />
        );
      case "door":
        return <Door key={i} {...structure} />;
      case "table":
        return (
          <group key={i} position={[structure.x, 0, -structure.y]}>
            {/* Table top */}
            <mesh position={[0, 15, 0]} castShadow receiveShadow>
              <boxGeometry args={[structure.width, 2, structure.height]} />
              <meshStandardMaterial {...MATERIALS.FURNITURE_TABLE} />
            </mesh>
            {/* Table legs */}
            <mesh position={[structure.width/2 - 5, 7.5, structure.height/2 - 5]} castShadow>
              <boxGeometry args={[3, 15, 3]} />
              <meshStandardMaterial {...MATERIALS.FURNITURE_TABLE} />
            </mesh>
            <mesh position={[structure.width/2 - 5, 7.5, -structure.height/2 + 5]} castShadow>
              <boxGeometry args={[3, 15, 3]} />
              <meshStandardMaterial {...MATERIALS.FURNITURE_TABLE} />
            </mesh>
            <mesh position={[-structure.width/2 + 5, 7.5, structure.height/2 - 5]} castShadow>
              <boxGeometry args={[3, 15, 3]} />
              <meshStandardMaterial {...MATERIALS.FURNITURE_TABLE} />
            </mesh>
            <mesh position={[-structure.width/2 + 5, 7.5, -structure.height/2 + 5]} castShadow>
              <boxGeometry args={[3, 15, 3]} />
              <meshStandardMaterial {...MATERIALS.FURNITURE_TABLE} />
            </mesh>
          </group>
        );
      // Add other structure cases as needed
      default:
        return null;
    }
  })}

  {/* Don't need multiple Scene components */}
  <Measurements walls={snappedWalls} />
  
  {/* Walkthrough camera */}
  <CameraPathPreview
    pathPoints={walkThroughPath}
    enabled={previewMode}
    speed={0.5}
    onEnd={() => setPreviewMode(false)}
  />
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

// Add Floor and Ceiling component definitions
const Floor = ({ type = "GRASS" }) => {
  return (
    <group>
      {/* Main flat grass ground - lighter color */}
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <meshStandardMaterial 
          color="#C5E1A5"
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      
      {/* Grid pattern - subtle lines */}
      <mesh position={[0, 0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3000, 3000, 100, 100]} />
        <meshStandardMaterial 
          color="#C5E1A5"
          wireframe={true}
          opacity={0.2}
          transparent={true}
        />
      </mesh>
    </group>
  );
};

const Ceiling = () => (
  <group>
    {/* Main ceiling - clean white surface */}
    <mesh position={[0, 30, 0]}>
      <boxGeometry args={[1000, 0.5, 1000]} />
      <meshBasicMaterial 
        color="#ffffff"
      />
    </mesh>
  </group>
);

export default memo(ThreeDCanvas);