import React from 'react';
import * as THREE from 'three';
import { ExtrudeGeometry } from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const WallWithCutout = ({ length, height, thickness, cutouts = [], material }) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, height);
  shape.lineTo(length, height);
  shape.lineTo(length, 0);
  shape.lineTo(0, 0);

  cutouts.forEach(({ x, y, w, h }) => {
    const hole = new THREE.Path();
    hole.moveTo(x, y);
    hole.lineTo(x, y + h);
    hole.lineTo(x + w, y + h);
    hole.lineTo(x + w, y);
    hole.lineTo(x, y);
    shape.holes.push(hole);
  });

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false
  });

  geometry.center();

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial attach="material" {...material} />
    </mesh>
  );
};

export default WallWithCutout;
