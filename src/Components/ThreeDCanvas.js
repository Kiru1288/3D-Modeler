import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
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

// ✅ Camera Movement Hook with Debugging Logs
const useCameraControls = () => {
  const { camera } = useThree();
  const speed = 5; 
  const moveRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    console.log("🎥 Camera Detected:", camera.position);

    const moveCamera = () => {
      camera.position.x += moveRef.current.x * speed;
      camera.position.z -= moveRef.current.y * speed;

      console.log("🎯 Updated Camera Position:", camera.position);
    };

    const interval = setInterval(moveCamera, 16);
    return () => clearInterval(interval);
  }, [camera]);
};

const Scene = ({ walls = [], is3DMode, wallColor }) => {
  const { camera, gl } = useThree();
  useCameraControls();

  useEffect(() => {
    console.log("🔄 is3DMode Changed:", is3DMode);
    if (is3DMode) {
      camera.position.set(600, 800, 1200);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      console.log("✅ Camera Reset for 3D Mode:", camera.position);
    }
  }, [is3DMode, camera]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[600, 800, 1200]} fov={50} />
      <ambientLight intensity={0.9} />
      <SpotLight position={[300, 700, 300]} intensity={1.5} castShadow />

      <OrbitControls
        args={[camera, gl.domElement]}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.8}
        zoomSpeed={0.6}
        panSpeed={0.5}
        enableRotate
        enablePan
        enableZoom
        screenSpacePanning={false}
        minDistance={100}
        maxDistance={2500}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2}
      />

      <Plane args={[3000, 3000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#F5DEB3" />
      </Plane>

      {walls.map((wall, i) => (
        <Wall key={i} {...wall} height={30} thickness={2} color={wallColor} />
      ))}
    </>
  );
};

const ThreeDCanvas = forwardRef(({ moves = [], is3DMode, selectedColor }, ref) => {

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        shadows
        gl={{ preserveDrawingBuffer: true, alpha: true }}
        camera={{ position: [600, 800, 1200], fov: 50 }}
      >
        <Scene walls={moves} is3DMode={is3DMode} wallColor={selectedColor} />
        <ExportControls ref={ref} />
      </Canvas>
    </div>
  );
});

const ExportControls = forwardRef((_, ref) => {
  const { gl, scene } = useThree();

  useImperativeHandle(ref, () => ({
    getScene: () => scene,
    getCanvas: () => gl.domElement,
  }));

  return null;
});

export default ThreeDCanvas;
