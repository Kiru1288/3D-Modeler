import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import doorTextureImg from '../../Assets/full-frame-shot-patterned-wall_1048944-16000472.avif';


const Door = ({ 
  x = 0, 
  y = 0, 
  width = 90, 
  height = 210, 
  depth = 10, 
  rotation = 0, 
  doorType = 'door' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const doorRef = useRef();
  const frameRef = useRef();
  const pivotRef = useRef();
  const targetRotation = useRef(0);

  const doorTexture = useLoader(THREE.TextureLoader, doorTextureImg);
  doorTexture.wrapS = doorTexture.wrapT = THREE.RepeatWrapping;
  doorTexture.repeat.set(1, 1);

  const doorMaterial = new THREE.MeshStandardMaterial({
    map: doorTexture,
    roughness: 0.6,
    metalness: 0.2,
  });

  const position = [x, height / 2, -y];

  const handleDoorClick = (e) => {
    e.stopPropagation();

    if (doorType === 'sliding-door') {
      setIsOpen(!isOpen);
      setIsAnimating(true);
      targetRotation.current = isOpen ? 0 : width * 0.8;
    } else {
      setIsOpen(!isOpen);
      setIsAnimating(true);
      targetRotation.current = isOpen ? 0 : Math.PI / 2;
    }
  };

  useFrame(() => {
    if (!isAnimating) return;

    if (doorType === 'sliding-door' && doorRef.current) {
      const step = 4;
      const currentPos = doorRef.current.position.x;
      const targetPos = isOpen ? targetRotation.current : 0;

      if (Math.abs(currentPos - targetPos) < step) {
        doorRef.current.position.x = targetPos;
        setIsAnimating(false);
        return;
      }

      doorRef.current.position.x += currentPos < targetPos ? step : -step;
    } else if (pivotRef.current) {
      const step = 0.05;
      const currentRot = pivotRef.current.rotation.y;
      const targetRot = targetRotation.current;

      if (Math.abs(currentRot - targetRot) < step) {
        pivotRef.current.rotation.y = targetRot;
        setIsAnimating(false);
        return;
      }

      pivotRef.current.rotation.y += currentRot < targetRot ? step : -step;
    }
  });

  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.rotation.y = rotation;
    }
  }, [rotation]);

  const renderDoor = () => {
    switch (doorType) {
      case 'sliding-door':
        return (
          <group position={position} ref={frameRef}>
            <mesh receiveShadow>
              <boxGeometry args={[width + 10, height + 10, depth]} />
              <meshStandardMaterial color="#b76728" />
            </mesh>
            <mesh position={[0, 0, depth / 2 + 0.1]}>
              <boxGeometry args={[width - 10, height - 10, depth + 1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh
              ref={doorRef}
              position={[0, 0, 0.01]}
              castShadow
              receiveShadow
              onClick={handleDoorClick}
            >
              <boxGeometry args={[width - 15, height - 15, depth - 2]} />
              <primitive object={doorMaterial} attach="material" />
              <mesh position={[width / 2 - 20, 0, depth / 2]}>
                <boxGeometry args={[5, 15, 3]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
            </mesh>
          </group>
        );

      case 'french-door':
        return (
          <group position={position} ref={frameRef}>
            <mesh receiveShadow>
              <boxGeometry args={[width + 10, height + 10, depth]} />
              <meshStandardMaterial color="#b76728" />
            </mesh>
            <mesh position={[0, 0, depth / 2 + 0.1]}>
              <boxGeometry args={[width - 10, height - 10, depth + 1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <group ref={pivotRef} position={[-width / 4, 0, 0]} onClick={handleDoorClick}>
              <mesh position={[-width / 4, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[width / 2 - 5, height - 15, depth - 2]} />
                <primitive object={doorMaterial} attach="material" />
                <mesh position={[width / 4 - 10, 0, depth / 2]}>
                  <boxGeometry args={[5, 15, 3]} />
                  <meshStandardMaterial color="#d4af37" />
                </mesh>
              </mesh>
            </group>
            <mesh position={[width / 4, 0, 0.01]} castShadow receiveShadow>
              <boxGeometry args={[width / 2 - 5, height - 15, depth - 2]} />
              <primitive object={doorMaterial} attach="material" />
              <mesh position={[-width / 4 + 10, 0, depth / 2]}>
                <boxGeometry args={[5, 15, 3]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
            </mesh>
          </group>
        );

      default:
        return (
          <group position={position} ref={frameRef}>
            <mesh receiveShadow>
              <boxGeometry args={[width + 10, height + 10, depth]} />
              <meshStandardMaterial color="#b76728" />
            </mesh>
            <mesh position={[0, 0, depth / 2 + 0.1]}>
              <boxGeometry args={[width - 10, height - 10, depth + 1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <group ref={pivotRef} position={[-width / 2 + 5, 0, 0]} onClick={handleDoorClick}>
              <mesh
                ref={doorRef}
                position={[width / 2 - 5, 0, 0.01]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[width - 10, height - 10, depth - 2]} />
                <primitive object={doorMaterial} attach="material" />
              </mesh>
              <mesh position={[width - 20, 0, depth / 2]} castShadow>
                <boxGeometry args={[5, 15, 3]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
            </group>
          </group>
        );
    }
  };

  return renderDoor();
};

Door.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  depth: PropTypes.number,
  rotation: PropTypes.number,
  doorType: PropTypes.string,
};

export default Door;
