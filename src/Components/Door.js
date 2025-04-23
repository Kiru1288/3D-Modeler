import React from 'react';
import PropTypes from 'prop-types';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import doorTexture from '../../Assets/wooden-surface-with-aged-paint.jpg';

const Door = ({ x = 0, y = 0, z = 0, width = 1, height = 2, depth = 0.1 }) => {
  const texture = useLoader(TextureLoader, doorTexture);

  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

Door.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  z: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  depth: PropTypes.number,
};

export default Door;
