import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Plane, SpotLight, PerspectiveCamera } from "@react-three/drei";


// ✅ Wall Component (Ensures Proper Positioning)
const Wall = ({ x1, y1, x2, y2, height, thickness }) => {
  if (
    typeof x1 !== "number" || typeof y1 !== "number" ||
    typeof x2 !== "number" || typeof y2 !== "number"
  ) {
    console.warn("❌ Invalid wall coordinates:", { x1, y1, x2, y2 });
    return null; // Skip rendering invalid walls
  }

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  return (
    <mesh
      position={[(x1 + x2) / 2, height / 2, -(y1 + y2) / 2]} // Fix positioning
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="white" />
      <Edges color="black" threshold={15} />
    </mesh>
  );
};

// ✅ Fix Scene to Read Walls Properly
const Scene = ({ walls = [], is3DMode }) => {
  useEffect(() => {
    console.log("✅ Walls in 3D:", walls);
  }, [walls]);

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
        enableRotate={is3DMode}
        maxPolarAngle={is3DMode ? Math.PI / 2.2 : 0}
        minPolarAngle={0}
      />

      {/* ✅ Full-Screen Floor */}
      <Plane args={[3000, 3000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#F5DEB3" />
      </Plane>

      {/* ✅ Render Walls (Ensure Valid x1, y1, x2, y2) */}
      {walls.map((wall, i) => (
        <Wall key={i} {...wall} height={30} thickness={2} />
      ))}
    </>
  );
};

// ✅ Fix Data Being Sent to 3D Mode
const ThreeDCanvas = ({ moves = [], is3DMode }) => {
  if (!Array.isArray(moves) || moves.length === 0) {
    console.warn("❌ No walls detected in ThreeDCanvas");
  }

  return (
    <Canvas
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      shadows
    >
      <Scene walls={moves} is3DMode={is3DMode} />
    </Canvas>
  );
};

export default ThreeDCanvas;
