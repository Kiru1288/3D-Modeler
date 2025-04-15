import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import doorTexture from '../../Assets/full-frame-shot-patterned-wall_1048944-16000472.avif';

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
  const texture = useLoader(TextureLoader, doorTexture);

  // Convert position to 3D space (y is used as Z in 3D)
  // Door bottom should be exactly at floor level
  const position = [x, height / 2, -y];

  // Handle door click to open/close
  const handleDoorClick = (e) => {
    e.stopPropagation();
    
    if (doorType === 'sliding-door') {
      // Sliding doors slide to the side instead of rotating
      setIsOpen(!isOpen);
      setIsAnimating(true);
      targetRotation.current = isOpen ? 0 : width * 0.8; // Slide most of the width
    } else {
      // Regular and french doors rotate
      setIsOpen(!isOpen);
      setIsAnimating(true);
      targetRotation.current = isOpen ? 0 : Math.PI / 2; // 90 degrees open
    }
  };

  // Animation for door opening/closing
  useFrame(() => {
    if (!isAnimating) return;

    if (doorType === 'sliding-door' && doorRef.current) {
      // Animation for sliding door
      const step = 4;
      const currentPos = doorRef.current.position.x;
      const targetPos = isOpen ? targetRotation.current : 0;
      
      if (Math.abs(currentPos - targetPos) < step) {
        doorRef.current.position.x = targetPos;
        setIsAnimating(false);
        return;
      }
      
      if (currentPos < targetPos) {
        doorRef.current.position.x += step;
      } else {
        doorRef.current.position.x -= step;
      }
    } else if (pivotRef.current) {
      // Animation for hinged doors
      const step = 0.05;
      const currentRot = pivotRef.current.rotation.y;
      const targetRot = targetRotation.current;
      
      if (Math.abs(currentRot - targetRot) < step) {
        pivotRef.current.rotation.y = targetRot;
        setIsAnimating(false);
        return;
      }
      
      if (currentRot < targetRot) {
        pivotRef.current.rotation.y += step;
      } else {
        pivotRef.current.rotation.y -= step;
      }
    }
  });

  // Apply rotation based on the prop (for wall alignment)
  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.rotation.y = rotation;
    }
  }, [rotation]);

  // Render different door types
  const renderDoor = () => {
    switch (doorType) {
      case 'sliding-door':
        return (
          <group position={position} ref={frameRef}>
            {/* Door frame */}
            <mesh receiveShadow>
              <boxGeometry args={[width + 10, height + 10, depth]} />
              <meshStandardMaterial color="#b76728" />
            </mesh>
            
            {/* Inner cutout */}
            <mesh position={[0, 0, depth/2 + 0.1]}>
              <boxGeometry args={[width - 10, height - 10, depth + 1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Sliding door panel */}
            <mesh 
              ref={doorRef}
              position={[0, 0, 0.01]} // Added slight Z-axis offset
              castShadow 
              receiveShadow
              onClick={handleDoorClick}
            >
              <boxGeometry args={[width - 15, height - 15, depth - 2]} />
              <meshStandardMaterial map={texture} color="#a87329" />
              
              {/* Door handle */}
              <mesh position={[width/2 - 20, 0, depth/2]}>
                <boxGeometry args={[5, 15, 3]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
            </mesh>
          </group>
        );
        
      case 'french-door':
        return (
          <group position={position} ref={frameRef}>
            {/* Door frame */}
            <mesh receiveShadow>
              <boxGeometry args={[width + 10, height + 10, depth]} />
              <meshStandardMaterial color="#b76728" />
            </mesh>
            
            {/* Inner cutout */}
            <mesh position={[0, 0, depth/2 + 0.1]}>
              <boxGeometry args={[width - 10, height - 10, depth + 1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Left door panel */}
            <group 
              ref={pivotRef} 
              position={[-width/4, 0, 0]}
              onClick={handleDoorClick}
            >
              <mesh 
                position={[-width/4, 0, 0]}
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[width/2 - 5, height - 15, depth - 2]} />
                <meshStandardMaterial map={texture} color="#a87329" />
                
                {/* Door handle */}
                <mesh position={[width/4 - 10, 0, depth/2]}>
                  <boxGeometry args={[5, 15, 3]} />
                  <meshStandardMaterial color="#d4af37" />
                </mesh>
              </mesh>
            </group>
            
            {/* Right door panel (static in this example) */}
            <mesh 
              position={[width/4, 0, 0.01]} // Added slight Z-axis offset
              castShadow 
              receiveShadow
              onClick={handleDoorClick}
            >
              <boxGeometry args={[width/2 - 5, height - 15, depth - 2]} />
              <meshStandardMaterial map={texture} color="#a87329" />
              
              {/* Door handle */}
              <mesh position={[-width/4 + 10, 0, depth/2]}>
                <boxGeometry args={[5, 15, 3]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
            </mesh>
          </group>
        );
      
      default: // Regular hinged door
        return (
          <group position={position} ref={frameRef}>
            {/* Door frame */}
            <mesh receiveShadow>
              <boxGeometry args={[width + 10, height + 10, depth]} />
              <meshStandardMaterial color="#b76728" />
            </mesh>
            
            {/* Inner cutout for door */}
            <mesh position={[0, 0, depth/2 + 0.1]}>
              <boxGeometry args={[width - 10, height - 10, depth + 1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* Door pivot point - at edge of door */}
            <group 
              ref={pivotRef} 
              position={[-width/2 + 5, 0, 0]} 
              onClick={handleDoorClick}
            >
              {/* Door itself - positioned so it rotates around its edge */}
              <mesh 
                ref={doorRef}
                position={[width/2 - 5, 0, 0.01]} // Added slight Z-axis offset
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[width - 10, height - 10, depth - 2]} />
                <meshStandardMaterial map={texture} color="#a87329" />
              </mesh>
              
              {/* Door handle */}
              <mesh 
                position={[width - 20, 0, depth/2]} 
                castShadow
              >
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
  doorType: PropTypes.string
};

export default Door;
