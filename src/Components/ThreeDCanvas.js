import React, { useEffect, memo, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  Html,
  Plane,
  SpotLight,
} from "@react-three/drei";
import * as THREE from "three";
import Door from "./Doors/Door";
import { Sky } from '@react-three/drei';
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import brickColor from "../Assets/brick_4_diff_4k.jpg";
import brickNormal from "../Assets/brick_4_nor_dx_4k.jpg";
import brickRoughness from "../Assets/brick_4_rough_4k.jpg";
import brickAO from "../Assets/brick_4_ao_4k.jpg";
import doorImg from '../Assets/Microsoft-Fluentui-Emoji-Flat-Door-Flat.512.png';
import windowImg from '../Assets/Microsoft-Fluentui-Emoji-Flat-Window-Flat.512.png';

import { FloorPlanContext } from '../context/FloorPlanContext';
import JoystickController from "./JoystickController";
import woodFloorTexture from "../Assets/wood_floor_worn_disp_4k.png";
import Window from "./Windows"; 






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
};

// -----------------------
// Wall Component
// -----------------------
const Wall = ({ x1, y1, x2, y2, height = 30, thickness = 2, type }) => {
  const [brickColorMap, brickNormalMap, brickRoughnessMap, brickAOMap] = useLoader(TextureLoader, [
    brickColor,
    brickNormal,
    brickRoughness,
    brickAO,
  ]);

  const [woodMap] = useLoader(TextureLoader, [woodFloorTexture]);

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  useEffect(() => {
    const maps = type === "room"
      ? [woodMap]
      : [brickColorMap, brickNormalMap, brickRoughnessMap, brickAOMap];

    maps.forEach((map) => {
      if (map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(length / 10, height / 10);
      }
    });

    console.log(`🧱 Rendering wall of type: ${type}`, {
      position: [(x1 + x2) / 2, height / 2, -(y1 + y2) / 2],
      texture: type === "room" ? "wood" : "brick"
    });
  }, [type, woodMap, brickColorMap, brickNormalMap, brickRoughnessMap, brickAOMap, length, height]);

  return (
    <mesh
      position={[(x1 + x2) / 2, height / 2, -(y1 + y2) / 2]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      {type === "room" ? (
        <meshStandardMaterial map={woodMap} />
      ) : (
        <meshStandardMaterial
          map={brickColorMap}
          normalMap={brickNormalMap}
          roughnessMap={brickRoughnessMap}
          aoMap={brickAOMap}
        />
      )}
    </mesh>
  );
};


const CameraFollower = ({ path }) => {
  const ref = useRef();
  const index = useRef(0);

  useFrame(() => {
    if (path.length === 0 || !ref.current) return;

    // Move along the wall path
    const current = path[index.current % path.length];
    const next = path[(index.current + 1) % path.length];

    const cam = ref.current;
    cam.position.lerp({ x: current.x, y: 5, z: current.y }, 0.1);
    cam.lookAt(next.x, 0, next.y);

    // Move to next point once close enough
    if (
      Math.abs(cam.position.x - current.x) < 0.2 &&
      Math.abs(cam.position.z - current.y) < 0.2
    ) {
      index.current = (index.current + 1) % path.length;
    }
  });

  return (
    <PerspectiveCamera ref={ref} makeDefault position={[0, 5, 0]} fov={75} />
  );
};


// -----------------------
// Window Component
// -----------------------

// -----------------------
// Lighting Component
// -----------------------
const Lighting = () => (
  <>
    <ambientLight intensity={1.0} />
    <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
    <hemisphereLight intensity={0.6} groundColor={new THREE.Color("#b97a20")} />
  </>
);

// -----------------------
// New Scene Component
// -----------------------
const Scene = ({ walls = [], is3DMode }) => {
  



  
  useEffect(() => {
  console.log("🎭 Walls Rendered in Scene:", walls);
  console.log("🎬 Rendering Scene with Walls:", walls);
  console.log("📸 Camera Props:", is3DMode ? "3D View" : "2D View");
}, [walls, is3DMode]);


  const cameraProps = is3DMode
    ? { position: [0, 800, 800], fov: 40 }
    : { position: [0, 1000, 0], fov: 90 };

  return (
    <>
      <PerspectiveCamera makeDefault {...cameraProps} />
      <ambientLight intensity={1.0} />
      <SpotLight position={[150, 500, 150]} intensity={1.5} castShadow />

      <OrbitControls
  enableDamping
  dampingFactor={0.05}
  rotateSpeed={0.6}
  zoomSpeed={0.8}
  panSpeed={0.5}
  minDistance={10}
  maxDistance={800}
  maxPolarAngle={Math.PI / 2}
  screenSpacePanning={true}
  target={[0, 0, 0]}
  enableRotate={true}
/>





      {/* Full-Screen Floor */}
      <Plane args={[3000, 3000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
  <meshStandardMaterial color="#7cfc00" /> {/* Lawn green */}
</Plane>


      {/* Render Walls (Ensure Valid x1, y1, x2, y2) */}
      {walls.map((wall, i) => {
  console.log(`🧱 Wall #${i}:`, wall);
  return <Wall key={i} {...wall} height={30} thickness={2} type={wall.type} />;
})}


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













// Define the missing 'Measurements' component
const Measurements = ({ walls }) => {
  return walls
    .filter(wall => wall.start && wall.end)
    .map((wall, i) => {
      const startVec = new THREE.Vector2(wall.start?.x || 0, wall.start?.z || 0);
      const endVec = new THREE.Vector2(wall.end?.x || 0, wall.end?.z || 0);
      const length = endVec.sub(startVec).length();

      const midpoint = [
        (wall.start?.x || 0 + wall.end?.x || 0) / 2,
        wall.height / 2,
        (wall.start?.z || 0 + wall.end?.z || 0) / 2,
      ];

      return (
        <Html key={i} position={midpoint}>
          <div className="measurement-label">{length.toFixed(2)}m</div>
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
  const holdIntervalRef = React.useRef(null);
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

  const startMoving = (direction) => {
    if (canvasRef.current?.moveCamera) {
      canvasRef.current.moveCamera(direction);
      holdIntervalRef.current = setInterval(() => {
        canvasRef.current.moveCamera(direction);
      }, 100);
    }
  };

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

  const getSceneOffset = (walls) => {
    if (!walls.length) return { x: 0, y: 0 };

    let sumX = 0, sumY = 0;
    walls.forEach(wall => {
      sumX += wall.x1 + wall.x2;
      sumY += wall.y1 + wall.y2;
    });

    const avgX = sumX / (2 * walls.length);
    const avgY = sumY / (2 * walls.length);

    return { x: avgX, y: avgY };
  };


  const calculateCenter = (objects) => {
    if (!objects.length) return new THREE.Vector3(0, 0, 0);

    let sumX = 0, sumZ = 0;
    objects.forEach(obj => {
      sumX += (obj.x1 + obj.x2) / 2;
      sumZ += (obj.y1 + obj.y2) / 2;
    });

    const avgX = sumX / objects.length;
    const avgZ = sumZ / objects.length;

    return new THREE.Vector3(avgX, 0, -avgZ);
  };



  const stopMoving = () => {
    clearInterval(holdIntervalRef.current);
  };


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
    const controls = controlsRef.current;
    const moveCamera = (direction) => {
      const step = 20;
      const newPos = camera.position.clone();

      switch (direction) {
        case "up":
          newPos.z -= step;
          break;
        case "down":
          newPos.z += step;
          break;
        case "left":
          newPos.x -= step;
          break;
        case "right":
          newPos.x += step;
          break;
        case "reset": {
          const center = calculateCenter(walls);
          newPos.set(center.x, 300, center.z);
          camera.position.copy(newPos);
          camera.lookAt(center);
          if (controls) {
            controls.target.set(center.x, 0, center.z);
            controls.update();
          }
          return;
        }
        default:
          return;
      }

      camera.position.copy(newPos);
      camera.lookAt(0, 0, 0);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    };

    useEffect(() => {
      if (canvasRef?.current) {
        canvasRef.current.moveCamera = moveCamera;
      }
    }, [camera, moveCamera, canvasRef]);

    return null;
  };

    
    
    
      

    

  const changeCameraAngle = () => {
    if (!canvasRef.current?.moveCamera) return;
    canvasRef.current.moveCamera("reset");
  };
  
  
  
  
    
    
  
  
  
  
  const btnStyle = {
    width: "50px",
    height: "50px",
    fontSize: "24px",
    borderRadius: "10px",
    border: "1px solid #999",
    backgroundColor: "#f4f4f4",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    cursor: "pointer",
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
     
     

      




      
      



<Canvas shadows 
gl={{ antialias: true }} 
ref={canvasRef}
style={{ background: "#ccefff" }}
>
<Sky sunPosition={[100, 20, 100]} />

  <Controls controlsRef={controlsRef} />
  <CameraControls
  controlsRef={controlsRef}
  canvasRef={canvasRef}
  walls={snappedWalls}
/>



  <Lighting />
  <Scene walls={snappedWalls} is3DMode={is3DMode} />

  <Grid
    args={[100, 100]}
    position={[0, 0, 0]}
    cellSize={1}
    cellThickness={0.5}
    cellColor="#8f8f8f"
    sectionSize={5}
    sectionThickness={1}
    sectionColor="#bfbfbf"
    fadeDistance={50}
    fadeStrength={1}
  />
  

  {structures.map((structure, i) => {
  if (
    !structure || 
    !structure.type || 
    typeof structure.width !== "number" || 
    typeof structure.height !== "number" || 
    structure.width <= 0 || 
    structure.height <= 0
  ) {
    console.warn(`🚫 Skipping invalid structure [${i}]:`, structure);
    return null;
  }

  console.log(`🧩 Structure #${i}:`, structure);

  switch (structure.type) {
    case "window":
      return (
        <Window
  key={i}
  position={[structure.x, 15, -structure.y]} 
  size={{ width: structure.width, height: structure.height }}
  rotation={[0, 0, 0]}
/> // ✅ Correct!

      );
    case "door":
      return <Door key={i} {...structure} />;
    default:
      return null;
  }
})}

{structures.map((structure, i) => {
  if (
    !structure || 
    !structure.type || 
    structure.width === 0 || 
    structure.height === 0
  ) {
    console.warn(`🚫 Skipping invalid structure [${i}]:`, structure);
    return null;
  }

  console.log(`🧩 Structure #${i}:`, structure);

  switch (structure.type) {
    case "window":
  if (structure.width && structure.height) {
    return (
      <Window
        key={i}
        position={[structure.x, 15, -structure.y]} 
        size={{ width: structure.width, height: structure.height }}
        rotation={[0, 0, 0]} 
      />
    );
  } else {
        return null;
      }
    case "door":
      return <Door key={i} {...structure} />;
    default:
      return null;
  }
})}


{structures.map((structure, i) => {
  if (!structure || !structure.type || structure.width <= 0 || structure.height <= 0) {
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
    default:
      return null;
  }
})}







<Measurements walls={snappedWalls} />

  <Scene walls={moves} is3DMode={is3DMode} />
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

export default memo(ThreeDCanvas);