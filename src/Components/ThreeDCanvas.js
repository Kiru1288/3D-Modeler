import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Edges, Plane, SpotLight, PerspectiveCamera } from "@react-three/drei";

const Wall = ({ x1, y1, x2, y2, height, thickness, color }) => {
  if (typeof x1 !== "number" || typeof y1 !== "number" || typeof x2 !== "number" || typeof y2 !== "number") {
    console.warn("❌ Invalid wall coordinates:", { x1, y1, x2, y2 });
    return null;
  }

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  return (
    <mesh position={[(x1 + x2) / 2, height / 2, -(y1 + y2) / 2]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={color || "#ffffff"} />
      <Edges color="black" threshold={15} />
    </mesh>
  );
};

const Scene = ({ walls = [], is3DMode, wallColor }) => {
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

      <OrbitControls enablePan enableZoom enableRotate={is3DMode} maxPolarAngle={is3DMode ? Math.PI / 2.2 : 0} minPolarAngle={0} />

      <Plane args={[3000, 3000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#F5DEB3" />
      </Plane>

      {walls.map((wall, i) => (
        <Wall key={i} {...wall} height={30} thickness={2} color={wallColor} />
      ))}
    </>
  );
};

// ✅ Corrected: `useThree` is now inside the Canvas Component
const ThreeDCanvas = forwardRef(({ moves = [], is3DMode, selectedColor }, ref) => {
  return (
    <Canvas
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      shadows
      gl={{ preserveDrawingBuffer: true, alpha: true }} // ✅ Fix Transparent Export
    >
      <Scene walls={moves} is3DMode={is3DMode} wallColor={selectedColor} />

      <ExportControls ref={ref} /> {/* ✅ This ensures export works */}
    </Canvas>
  );
});

// ✅ Move `useThree` INSIDE the Canvas Component for Export
const ExportControls = forwardRef((_, ref) => {
  const { gl, scene } = useThree(); // ✅ Use `useThree` properly inside Canvas

  useImperativeHandle(ref, () => ({
    getScene: () => scene, // ✅ Expose scene for exporting
    getCanvas: () => gl.domElement, // ✅ Expose canvas element for PNG export
  }));

  return null; // ✅ This component doesn't render anything
});

export default ThreeDCanvas;
