// src/Components/WallWithCutout.js
import React from "react";
import * as THREE from "three";

const WallWithCutout = ({ wall, structure }) => {
  const { x1, y1, x2, y2 } = wall;
  const windowWidth = structure.width || 100;
  const windowHeight = structure.height || 100;
  const height = 150; // same wall height
  const thickness = 5; // thin overlay

  // Wall orientation
  const dx = x2 - x1;
  const dy = y2 - y1;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const centerX = (x1 + x2) / 2;
  const centerZ = (y1 + y2) / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-wallLength / 2, -height / 2);
  shape.lineTo(wallLength / 2, -height / 2);
  shape.lineTo(wallLength / 2, height / 2);
  shape.lineTo(-wallLength / 2, height / 2);
  shape.lineTo(-wallLength / 2, -height / 2);

  const hole = new THREE.Path();
  hole.moveTo(-windowWidth / 2, -windowHeight / 2);
  hole.lineTo(windowWidth / 2, -windowHeight / 2);
  hole.lineTo(windowWidth / 2, windowHeight / 2);
  hole.lineTo(-windowWidth / 2, windowHeight / 2);
  hole.lineTo(-windowWidth / 2, -windowHeight / 2);
  shape.holes.push(hole);

  const geometry = new THREE.ShapeGeometry(shape);
  geometry.translate(0, height / 2, 0); // lift wall to floor level

  return (
    <mesh
      geometry={geometry}
      position={[centerX, 0, centerZ]}
      rotation={[0, -angle, 0]}
    >
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
};

export default WallWithCutout;
