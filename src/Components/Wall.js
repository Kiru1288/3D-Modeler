import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

const createWallGeometry = (width, height, depth) => {
  return new THREE.BoxGeometry(width, height, depth);
};

const Wall = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  width = 10, 
  height = 30, 
  depth = 2,
  type = 'brick' 
}) => {
  // Load the appropriate textures based on wall type
  const texturePath = useMemo(() => {
    switch(type) {
      case 'brick':
        return {
          colorMap: '/textures/brick_diffuse.jpg',
          normalMap: '/textures/brick_normal.jpg',
          roughnessMap: '/textures/brick_roughness.jpg',
        };
      case 'concrete':
        return {
          colorMap: '/textures/concrete_diffuse.jpg',
          normalMap: '/textures/concrete_normal.jpg',
          roughnessMap: '/textures/concrete_roughness.jpg',
        };
      case 'drywall':
        return {
          colorMap: '/textures/drywall_diffuse.jpg',
          normalMap: '/textures/drywall_normal.jpg',
          roughnessMap: '/textures/drywall_roughness.jpg',
        };
      default:
        return {
          colorMap: '/textures/brick_diffuse.jpg',
          normalMap: '/textures/brick_normal.jpg',
          roughnessMap: '/textures/brick_roughness.jpg',
        };
    }
  }, [type]);

  // Try to load textures
  try {
    const [colorMap, normalMap, roughnessMap] = useLoader(TextureLoader, [
      texturePath.colorMap,
      texturePath.normalMap,
      texturePath.roughnessMap,
    ]);

    // Configure texture mapping
    if (colorMap && normalMap && roughnessMap) {
      [colorMap, normalMap, roughnessMap].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(width / 10, height / 10);
      });
    }

    return (
      <mesh position={position} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    );
  } catch (e) {
    // Fallback to simple material if textures fail to load
    console.warn("Failed to load textures for wall", e);
    return (
      <mesh position={position} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={type === 'brick' ? '#b22222' : type === 'concrete' ? '#808080' : '#f5f5f5'} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    );
  }
};

export default Wall; 