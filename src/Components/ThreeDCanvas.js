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
  const { camera, gl } = useThree();

  useEffect(() => {
    if (is3DMode) {
      console.log("🔄 Resetting Camera for 3D Mode...");
      camera.position.set(500, 600, 1000); // ✅ Ensuring a proper default position
      camera.lookAt(0, 0, 0);
    }
  }, [is3DMode, camera]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[500, 600, 1000]} fov={50} />
      <ambientLight intensity={0.8} />
      <SpotLight position={[200, 600, 200]} intensity={1.5} castShadow />

      {/* ✅ Ensuring correct camera movement */}
      <OrbitControls 
        args={[camera, gl.domElement]}
        enableDamping={true}
        dampingFactor={0.05}
        enableRotate={true}  
        enablePan={true}     
        enableZoom={true}    
        screenSpacePanning={true} 
        minDistance={50}  
        maxDistance={2000}
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} 
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
    <Canvas
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      shadows
      gl={{ preserveDrawingBuffer: true, alpha: true }} 
      camera={{ position: [500, 600, 1000], fov: 50 }} 
    >
      <Scene walls={moves} is3DMode={is3DMode} wallColor={selectedColor} />
      <ExportControls ref={ref} />
    </Canvas>
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
