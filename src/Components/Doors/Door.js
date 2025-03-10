import React from 'react';
import PropTypes from 'prop-types';

const Door = ({ x = 0, y = 0, z = 0, width = 1, height = 2, depth = 0.1 }) => {
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry attach="geometry" args={[width, height, depth]} />
      <meshStandardMaterial attach="material" color="#8b4513" />
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
