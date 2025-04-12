import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const CameraPathPreview = ({ pathPoints, enabled, speed = 0.01, onEnd }) => {
  const { camera } = useThree();
  const indexRef = useRef(0);
  const progressRef = useRef(0);

  useFrame(() => {
    if (!enabled || pathPoints.length < 2) return;

    const i = Math.floor(indexRef.current);
    const nextIndex = i + 1;

    if (nextIndex >= pathPoints.length) {
      if (indexRef.current < pathPoints.length - 1) {
        onEnd?.();
        indexRef.current = pathPoints.length; // Prevent further calls
      }
      return;
    }

    const start = new THREE.Vector3(...pathPoints[i]);
    const end = new THREE.Vector3(...pathPoints[nextIndex]);
    const direction = end.clone().sub(start);
    const distance = direction.length();
    direction.normalize();

    progressRef.current += speed;
    if (progressRef.current >= distance) {
      indexRef.current += 1;
      progressRef.current = 0;
    }

    const move = direction.clone().multiplyScalar(progressRef.current);
    const newPos = start.clone().add(move);

    camera.position.copy(newPos);
    camera.lookAt(end);
  });

  return null;
};

export default CameraPathPreview;
