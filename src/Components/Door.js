import React from 'react';

const Door = ({ x, y, width, height }) => {
  return (
    <mesh position={[x, 0, y]}>
      <boxGeometry args={[width, height, 0.1]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
  );
};

export default Door;
