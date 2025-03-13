import React, { useEffect, memo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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
const Wall = ({ x1, y1, x2, y2, height = 30, thickness = 2 }) => {
  useEffect(() => {
    if (
      typeof x1 !== "number" || typeof y1 !== "number" ||
      typeof x2 !== "number" || typeof y2 !== "number"
    ) {
      console.warn("❌ Invalid wall coordinates:", { x1, y1, x2, y2 });
      return;
    }
    console.log("✅ Final Walls Before Rendering:", { x1, y1, x2, y2 });
  }, [x1, y1, x2, y2]);
  

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  console.log(`🧱 Rendering Wall: (${x1}, ${y1}) -> (${x2}, ${y2}), Length: ${length}, Angle: ${angle}`);

  return (
    <mesh
      position={[(x1 + x2) / 2, height / 2, -(y1 + y2) / 2]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};



// -----------------------
// Window Component
// -----------------------
const Window = ({ position, size, rotation }) => {
  const frameThickness = 0.05;
  return (
    <group position={position} rotation={rotation}>
      {/* Window Frame */}
      <mesh castShadow>
        <boxGeometry
          attach="geometry"
          args={[size.width + frameThickness, size.height + frameThickness, frameThickness]}
        />
        <meshStandardMaterial attach="material" color="#333333" />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, frameThickness / 2]}>
        <planeGeometry attach="geometry" args={[size.width, size.height]} />
        <primitive object={MATERIALS.WINDOW} attach="material" />
      </mesh>
    </group>
  );
};

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
  enablePan={true} 
  enableZoom={true} 
  enableRotate={true} 
  panSpeed={0.5}
  minDistance={2}
  maxDistance={50}
  maxPolarAngle={Math.PI / 2}
  screenSpacePanning={true} 
  target={[0, 0, 0]} 
/>


      {/* Full-Screen Floor */}
      <Plane args={[3000, 3000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#eaeaea" />
      </Plane>

      {/* Render Walls (Ensure Valid x1, y1, x2, y2) */}
      {walls.map((wall, i) => (
        <Wall key={i} {...wall} height={30} thickness={2} />
      ))}
    </>
  );
};

// Define the missing 'Controls' component
const Controls = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 800, 800);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2}
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

// -----------------------
// Main ThreeDCanvas Component
// -----------------------
const ThreeDCanvas = ({ walls = [], structures = [], moves = [], is3DMode }) => {
  const cameraRef = React.useRef();

  const changeCameraAngle = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 500, 500);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <>
      <button onClick={changeCameraAngle} style={{ position: 'absolute', top: 10, right: 10 }}>Change Angle</button>
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 800, 800]} />
        <Controls />
        <Lighting />
        <Scene walls={walls} is3DMode={is3DMode} />
        {/* Grid */}
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
        {Array.isArray(walls) && walls.length > 0 &&
          walls.map((wall, i) => <Wall key={i} {...wall} />)}
        {/* Render Structures (windows, doors, etc.) */}
        {structures.length > 0 &&
          structures.map((structure, i) => {
            switch (structure.type) {
              case "window":
                return <Window key={i} {...structure} />;
              case "door":
                return <Door key={i} {...structure} />;
              default:
                return null;
            }
          })}
        {/* Render Measurements */}
        <Measurements walls={walls} />
        {/* New Scene Component */}
        <Scene walls={moves} is3DMode={is3DMode} />
      </Canvas>
    </>
  );
};

export default memo(ThreeDCanvas);