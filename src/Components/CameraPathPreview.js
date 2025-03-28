

import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CameraPathPreview = ({ pathPoints = [], enabled = false, speed = 0.001, onEnd }) => {
  const { camera } = useThree();
  const curve = useRef(null);
  const progress = useRef(0);

  useEffect(() => {
    curve.current = new THREE.CatmullRomCurve3(
      pathPoints.map((p) => new THREE.Vector3(...p))
    );
    if (enabled) {
      progress.current = 0;
    }
  }, [pathPoints, enabled]);

  useFrame(() => {
    if (!enabled || !curve.current) return;

    progress.current += speed;
    if (progress.current >= 1) {
      progress.current = 1;
      onEnd && onEnd();
    }

    const point = curve.current.getPointAt(progress.current);
    const lookAtPoint = curve.current.getPointAt(Math.min(progress.current + 0.01, 1));

    camera.position.set(point.x, point.y, point.z);
    camera.lookAt(lookAtPoint);
  });

  return null;
};

export default CameraPathPreview;
