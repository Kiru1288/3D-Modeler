import React from "react";
import PropTypes from "prop-types";
import * as THREE from "three";

const Window = ({ position, size, rotation = [0, 0, 0], type = 'window' }) => {
  const { width = 90, height = 120 } = size;
  
  // Render different window types
  const renderWindow = () => {
    switch (type) {
      case 'bay-window':
        return (
          <group position={position} rotation={rotation}>
            {/* Bay window consists of three window panes at angles */}
            <group>
              {/* Center pane */}
              <mesh castShadow receiveShadow position={[0, 0, -15]}>
                <boxGeometry args={[width * 0.6, height, 5]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
              </mesh>
              <mesh castShadow position={[0, 0, -15]}>
                <boxGeometry args={[width * 0.6 + 10, height + 10, 5]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              
              {/* Left angled pane */}
              <mesh castShadow receiveShadow position={[-width * 0.3 - 15, 0, -8]} rotation={[0, Math.PI / 8, 0]}>
                <boxGeometry args={[width * 0.4, height, 5]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
              </mesh>
              <mesh castShadow position={[-width * 0.3 - 15, 0, -8]} rotation={[0, Math.PI / 8, 0]}>
                <boxGeometry args={[width * 0.4 + 10, height + 10, 5]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              
              {/* Right angled pane */}
              <mesh castShadow receiveShadow position={[width * 0.3 + 15, 0, -8]} rotation={[0, -Math.PI / 8, 0]}>
                <boxGeometry args={[width * 0.4, height, 5]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
              </mesh>
              <mesh castShadow position={[width * 0.3 + 15, 0, -8]} rotation={[0, -Math.PI / 8, 0]}>
                <boxGeometry args={[width * 0.4 + 10, height + 10, 5]} />
                <meshStandardMaterial color="#A0522D" />
              </mesh>
              
              {/* Base platform beneath the window */}
              <mesh position={[0, -height / 2 - 5, -10]} castShadow receiveShadow>
                <boxGeometry args={[width + 30, 10, 30]} />
                <meshStandardMaterial color="#D2B48C" />
              </mesh>
            </group>
          </group>
        );
        
      case 'skylight':
        return (
          <group position={position} rotation={rotation}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, 5, height]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
            <mesh position={[0, -2, 0]} receiveShadow>
              <boxGeometry args={[width - 10, 5, height - 10]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
          </group>
        );
        
      default: // Standard window
        return (
          <group position={position} rotation={rotation}>
            {/* Window frame (outer) */}
            <mesh castShadow>
              <boxGeometry args={[width + 10, height + 10, 5]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
            
            {/* Glass pane */}
            <mesh position={[0, 0, 0]} receiveShadow>
              <boxGeometry args={[width - 10, height - 10, 5]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>
            
            {/* Window frame dividers */}
            <mesh castShadow>
              <boxGeometry args={[5, height - 5, 6]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
            <mesh castShadow>
              <boxGeometry args={[width - 5, 5, 6]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
          </group>
        );
    }
  };
  
  return renderWindow();
};

Window.propTypes = {
  position: PropTypes.array.isRequired,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  rotation: PropTypes.array,
  type: PropTypes.string
};

export default Window;
