import React, { useRef, useEffect, useState, useContext, memo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Edges,
  Grid,
  PerspectiveCamera,
  useHelper,
  Html,
  TransformControls,
} from "@react-three/drei";
import * as THREE from "three";
import { FloorPlanContext } from "../context/FloorPlanContext";
import Door from "./Doors/Door";

// -----------------------
// Materials
// -----------------------
const MATERIALS = {
  WALL: new THREE.MeshStandardMaterial({
    color: "#cccccc",
    roughness: 0.7,
    metalness: 0.1,
  }),
  FLOOR: new THREE.MeshStandardMaterial({
    color: "#f0f0f0",
    roughness: 0.8,
    metalness: 0.2,
  }),
  WINDOW: new THREE.MeshPhysicalMaterial({
    color: "#a8d8ff",
    transmission: 0.5,
    transparency: 1,
    roughness: 0,
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
const Wall = ({ start, end, height, thickness = 0.2 }) => {
  const wallRef = useRef(); // Moved outside of conditional to fix React Hook rules

  if (!start || !end) return null; // Now this condition is AFTER useRef()

  const startVec = new THREE.Vector2(start?.x || 0, start?.z || 0);
  const endVec = new THREE.Vector2(end?.x || 0, end?.z || 0);
  const length = endVec.sub(startVec).length();
  const angle = Math.atan2((end?.z || 0) - (start?.z || 0), (end?.x || 0) - (start?.x || 0));

  const position = [
    ((start?.x || 0) + (end?.x || 0)) / 2,  // Fixing the grouping
    height / 2,
    ((start?.z || 0) + (end?.z || 0)) / 2,  // Fixing the grouping
  ];

  return (
    <mesh ref={wallRef} position={position} rotation={[0, angle, 0]} castShadow receiveShadow>
      <boxGeometry attach="geometry" args={[length, height, thickness]} />
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
// Room Component
// -----------------------
const Room = ({ points, height }) => {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].z);
  points.slice(1).forEach((point) => {
    shape.lineTo(point.x, point.z);
  });
  shape.closePath();

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry attach="geometry" args={[shape]} />
        <primitive object={MATERIALS.FLOOR} attach="material" />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <shapeGeometry attach="geometry" args={[shape]} />
        <meshStandardMaterial
          attach="material"
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// -----------------------
// Lighting Component
// -----------------------
const Lighting = () => {
  const sunLight = useRef();
  useHelper(sunLight, THREE.DirectionalLightHelper, 5);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={sunLight}
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight intensity={0.3} groundColor={new THREE.Color("#b97a20")} />
    </>
  );
};

// -----------------------
// Main ThreeDCanvas Component
// -----------------------
const ThreeDCanvas = ({ walls = [], structures = [] }) => {
  const { walls: contextWalls, structures: contextStructures } = useContext(FloorPlanContext);
  const [cameraPosition, setCameraPosition] = useState([10, 10, 10]);
  const [showGrid, setShowGrid] = useState(true); 
  const [showMeasurements, setShowMeasurements] = useState(true);


  // -----------------------
  // Camera Controls
  // -----------------------
  const Controls = () => {
    const { camera } = useThree();
    useEffect(() => {
      camera.position.set(...cameraPosition);
      camera.lookAt(0, 0, 0);
    }, [camera, cameraPosition]);
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

  // -----------------------
  // Measurements Component
  // -----------------------
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

  return (
    <Canvas shadows gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={cameraPosition} />
      <Controls />
      <Lighting />

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[100, 100]}
          position={[0, 0, 0]}
          cellSize={1}
          cellThickness={1}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#9f9f9f"
          fadeDistance={50}
          fadeStrength={1}
        />
      )}

{Array.isArray(walls) && walls.length > 0 &&
  walls.map((wall, i) => <Wall key={i} {...wall} />)}

))

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
      {showMeasurements && <Measurements walls={walls} />}
    </Canvas>
  );
};

////KIRUUUUUUUU

export default memo(ThreeDCanvas);
