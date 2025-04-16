import React from 'react';
import * as THREE from 'three';

const Wall = ({ x1, y1, x2, y2, height = 40, thickness = 5, type, material }) => {
  // Create a custom material with a deep black color
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x000000), // Pure black using Color object
    roughness: 0.3, // Reduced roughness for darker appearance
    metalness: 0.8, // Increased metalness for better black reflection
    emissive: new THREE.Color(0x000000), // Black emissive color
    emissiveIntensity: 0.1, // Slight emission to enhance darkness
  });

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  return (
    <group
      position={[(x1 + x2) / 2, height / 2, -(y1 + y2) / 2]}
      rotation={[0, -angle, 0]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>
    </group>
  );
};

export default Wall; 