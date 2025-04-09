import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

// Update the import path as needed:
import glassTextureSrc from "../Assets/Texturelabs_Glass_139L.jpg";

const Window = ({ position, size, rotation }) => {
  // Load the new glass texture first:
  const glassTexture = useLoader(TextureLoader, glassTextureSrc);

  if (!size || typeof size.width !== "number" || typeof size.height !== "number") {
    console.warn("❌ Invalid size object passed to <Window />", size);
    return null;
  }

  const frameThickness = 0.05;
  const glassOffset = 0.03; // Offset to avoid overlapping (Z-fighting)

  return (
    <group position={position} rotation={rotation}>
      {/* Window Frame */}
      <mesh castShadow>
        <boxGeometry
          args={[size.width + frameThickness, size.height + frameThickness, frameThickness]}
        />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Glass */}
      <mesh position={[0, 0, glassOffset]} transparent>
        <boxGeometry args={[size.width, size.height, frameThickness / 2]} />
        <meshPhysicalMaterial
          map={glassTexture}
          opacity={0.8}
          transparent
          roughness={0.2}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default Window;
