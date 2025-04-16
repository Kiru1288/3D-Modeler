import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

// A general structure component that handles various furniture and room elements
const Structure = ({ 
  type, 
  x = 0, 
  y = 0, 
  width = 100, 
  height = 100, 
  depth = 30, 
  color = "#cccccc",
  rotation = 0
}) => {
  // Define materials for different structure types
  const materials = {
    table: { color: '#8b4513', roughness: 0.6, metalness: 0.2 },
    sofa: { color: '#d2691e', roughness: 0.7, metalness: 0.1 },
    bed: { color: '#deb887', roughness: 0.6, metalness: 0.1 },
    chair: { color: '#a0522d', roughness: 0.5, metalness: 0.2 },
    desk: { color: '#8b4513', roughness: 0.6, metalness: 0.2 },
    cabinet: { color: '#deb887', roughness: 0.5, metalness: 0.2 },
    default: { color: '#8b4513', roughness: 0.6, metalness: 0.2 }
  };

  const material = materials[type] || materials.default;

  // Color mapping for different structure types
  const colorMap = {
    sofa: "#d2691e",
    sectional: "#e9967a",
    chair: "#a0522d", 
    bed: "#e2d3b3",
    table: "#8b4513",
    desk: "#deb887",
    bookshelf: "#8b4513",
    kitchen: "#778899",
    stove: "#696969",
    refrigerator: "#b0c4de",
    'kitchen-island': "#a9a9a9",
    counter: "#a9a9a9",
    cabinet: "#8b4513",
    bath: "#add8e6",
    shower: "#b0e0e6",
    toilet: "#f5f5f5",
    sink: "#b0c4de",
    vanity: "#deb887",
    wardrobe: "#deb887",
    dresser: "#deb887",
    nightstand: "#deb887",
    lamp: "#ffffe0",
    'ceiling-light': "#fffacd",
    chandelier: "#f0e68c",
    plant: "#32cd32",
    artwork: "#87ceeb",
    tv: "#4a4a4a",
    fireplace: "#d84c4c",
    carpet: "#dda0dd",
    tiles: "#d3d3d3",
    deck: "#deb887",
    patio: "#c0c0c0",
    pool: "#87ceeb",
    garden: "#90ee90",
    fence: "#cd853f",
    path: "#d3d3d3",
    column: "#a9a9a9",
    beam: "#a9a9a9",
    railing: "#cd853f",
    ceiling: "#f0f0f0",
  };

  // Height mapping for different structure types
  const heightMap = {
    sofa: 40,
    sectional: 40,
    chair: 45,
    bed: 30,
    table: 75,
    desk: 75,
    bookshelf: 180,
    kitchen: 85,
    stove: 85,
    refrigerator: 180,
    'kitchen-island': 85,
    counter: 85,
    cabinet: 85,
    bath: 40,
    shower: 200,
    toilet: 40,
    sink: 85,
    vanity: 85,
    wardrobe: 180,
    dresser: 90,
    nightstand: 60,
    lamp: 150,
    'ceiling-light': 10,
    chandelier: 60,
    carpet: 1,
    tiles: 1,
    deck: 10,
    patio: 5,
    pool: 40,
    garden: 20,
    fence: 100,
    path: 2,
    column: 200,
    beam: 20,
    railing: 90,
    ceiling: 5
  };

  // Convert 2D position to 3D position (y becomes z-coordinate)
  // Divide by 2 to properly position on floor (center of object is at half height)
  const structureHeight = heightMap[type] || 40;
  const position = [x, structureHeight / 2, -y];

  // Determine the actual color to use
  const structureColor = colorMap[type] || color;

  // Structure-specific rendering
  const renderStructure = () => {
    switch(type) {
      case 'sofa':
        return (
          <group>
            {/* Base */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, 20, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 10, -height/2 + 5]} castShadow receiveShadow>
              <boxGeometry args={[width, 20, 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Arms */}
            <mesh position={[width/2 - 5, 10, 0]} castShadow receiveShadow>
              <boxGeometry args={[10, 20, height - 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            <mesh position={[-width/2 + 5, 10, 0]} castShadow receiveShadow>
              <boxGeometry args={[10, 20, height - 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
          </group>
        );
        
      case 'sectional':
        return (
          <group>
            {/* Main sofa section */}
            <mesh position={[-width/4, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width/2, 20, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Back for main section */}
            <mesh position={[-width/4, 10, -height/2 + 5]} castShadow receiveShadow>
              <boxGeometry args={[width/2, 20, 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* L-section */}
            <mesh position={[width/4, 0, -height/4]} castShadow receiveShadow>
              <boxGeometry args={[width/2, 20, height/2]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Back for L-section */}
            <mesh position={[width/2 - 5, 10, -height/4]} castShadow receiveShadow>
              <boxGeometry args={[10, 20, height/2]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Arms */}
            <mesh position={[-width/2 + 5, 10, 0]} castShadow receiveShadow>
              <boxGeometry args={[10, 20, height - 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
          </group>
        );
        
      case 'chair':
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 10, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 20, -height/2 + 5]} castShadow receiveShadow>
              <boxGeometry args={[width, 40, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Legs */}
            <mesh position={[width/2 - 5, -15, height/2 - 5]} castShadow>
              <boxGeometry args={[5, 20, 5]} />
              <meshStandardMaterial color="#2f2520" roughness={0.6} />
            </mesh>
            <mesh position={[-width/2 + 5, -15, height/2 - 5]} castShadow>
              <boxGeometry args={[5, 20, 5]} />
              <meshStandardMaterial color="#2f2520" roughness={0.6} />
            </mesh>
            <mesh position={[width/2 - 5, -15, -height/2 + 5]} castShadow>
              <boxGeometry args={[5, 20, 5]} />
              <meshStandardMaterial color="#2f2520" roughness={0.6} />
            </mesh>
            <mesh position={[-width/2 + 5, -15, -height/2 + 5]} castShadow>
              <boxGeometry args={[5, 20, 5]} />
              <meshStandardMaterial color="#2f2520" roughness={0.6} />
            </mesh>
          </group>
        );
        
      case 'bed':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, -10, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 10, height]} />
              <meshStandardMaterial color="#594d44" roughness={0.7} />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width - 10, 20, height - 10]} />
              <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
            </mesh>
            {/* Pillow */}
            <mesh position={[0, 12, -height/2 + 30]} castShadow receiveShadow>
              <boxGeometry args={[width - 40, 8, 40]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            {/* Headboard */}
            <mesh position={[0, 20, -height/2]} castShadow receiveShadow>
              <boxGeometry args={[width, 50, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
          </group>
        );
        
      case 'table':
        return (
          <group>
            {/* Tabletop */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 5, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Legs */}
            <mesh position={[width/2 - 5, -height/4, height/2 - 5]} castShadow>
              <boxGeometry args={[5, height/2, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            <mesh position={[-width/2 + 5, -height/4, height/2 - 5]} castShadow>
              <boxGeometry args={[5, height/2, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            <mesh position={[width/2 - 5, -height/4, -height/2 + 5]} castShadow>
              <boxGeometry args={[5, height/2, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            <mesh position={[-width/2 + 5, -height/4, -height/2 + 5]} castShadow>
              <boxGeometry args={[5, height/2, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
          </group>
        );
        
      case 'desk':
        return (
          <group>
            {/* Desktop */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 5, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Left side drawers */}
            <mesh position={[-width/2 + 15, -20, 0]} castShadow receiveShadow>
              <boxGeometry args={[30, 40, height - 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Right leg */}
            <mesh position={[width/2 - 5, -20, 0]} castShadow>
              <boxGeometry args={[5, 40, 5]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Keyboard tray or drawer */}
            <mesh position={[0, -12, 10]} castShadow receiveShadow>
              <boxGeometry args={[width - 60, 2, 30]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
          </group>
        );

      case 'bookshelf':
        return (
          <group>
            {/* Back panel */}
            <mesh position={[0, 0, -depth/2]} castShadow receiveShadow>
              <boxGeometry args={[width, structureHeight, 2]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Left side */}
            <mesh position={[-width/2 + 2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[4, structureHeight, depth]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Right side */}
            <mesh position={[width/2 - 2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[4, structureHeight, depth]} />
              <meshStandardMaterial color={structureColor} roughness={0.7} />
            </mesh>
            {/* Shelves - create 4-5 shelves */}
            {[...Array(5)].map((_, i) => (
              <mesh key={i} position={[0, -structureHeight/2 + 2 + i*structureHeight/5, 0]} castShadow receiveShadow>
                <boxGeometry args={[width - 4, 4, depth]} />
                <meshStandardMaterial color={structureColor} roughness={0.7} />
              </mesh>
            ))}
            {/* Books - represented as simple blocks with different colors */}
            {[...Array(8)].map((_, i) => {
              const bookWidth = 10 + Math.random() * 10;
              const bookHeight = 25 + Math.random() * 10;
              const bookDepth = depth - 5;
              const shelfIdx = Math.floor(i / 3);
              const posX = -width/2 + 20 + (i % 3) * 30;
              const posY = -structureHeight/2 + 20 + shelfIdx * structureHeight/5;
              
              return (
                <mesh key={`book-${i}`} position={[posX, posY, 0]} castShadow receiveShadow>
                  <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
                  <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 50%)`} roughness={0.8} />
                </mesh>
              );
            })}
          </group>
        );
        
      case 'bath':
        return (
          <group>
            {/* Tub */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, 40, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Inner cutout */}
            <mesh position={[0, 5, 0]}>
              <boxGeometry args={[width - 10, 30, height - 10]} />
              <meshStandardMaterial color="white" roughness={0.1} metalness={0.2} />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, 20, -height/2 + 5]} castShadow>
              <cylinderGeometry args={[3, 3, 15, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      case 'shower':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 2, height]} />
              <meshStandardMaterial color="white" roughness={0.2} />
            </mesh>
            {/* Glass walls - transparent */}
            <mesh position={[0, 100, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 200, height]} />
              <meshPhysicalMaterial color="#c0c0c0" transmission={0.8} transparent opacity={0.2} roughness={0} metalness={0.1} />
            </mesh>
            {/* Shower head */}
            <mesh position={[0, 180, -height/2 + 10]} castShadow>
              <cylinderGeometry args={[5, 5, 5, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      case 'toilet':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 20, height]} />
              <meshStandardMaterial color={structureColor} roughness={0.2} />
            </mesh>
            {/* Seat */}
            <mesh position={[0, 10, -5]} castShadow receiveShadow>
              <cylinderGeometry args={[width/3, width/2, 5, 16]} />
              <meshStandardMaterial color="white" roughness={0.1} />
            </mesh>
            {/* Tank */}
            <mesh position={[0, 25, -height/2 + 10]} castShadow receiveShadow>
              <boxGeometry args={[width - 10, 30, 15]} />
              <meshStandardMaterial color={structureColor} roughness={0.2} />
            </mesh>
          </group>
        );

      case 'refrigerator':
        return (
          <group>
            {/* Main body */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, structureHeight, depth]} />
              <meshStandardMaterial color={structureColor} roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Door line */}
            <mesh position={[2, 0, depth/2 + 0.1]} castShadow>
              <boxGeometry args={[width - 10, structureHeight - 10, 0.5]} />
              <meshStandardMaterial color="#666666" roughness={0.5} />
            </mesh>
            {/* Handle */}
            <mesh position={[width/2 - 5, 0, depth/2 + 2]} castShadow>
              <boxGeometry args={[2, 100, 2]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );

      case 'kitchen-island':
        return (
          <group>
            {/* Counter */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 5, height]} />
              <meshStandardMaterial color="#DCDCDC" roughness={0.3} />
            </mesh>
            {/* Base */}
            <mesh position={[0, -40, 0]} castShadow receiveShadow>
              <boxGeometry args={[width - 10, 80, height - 10]} />
              <meshStandardMaterial color={structureColor} roughness={0.5} />
            </mesh>
            {/* Add some decorative features */}
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
              <boxGeometry args={[width - 20, 1, height - 20]} />
              <meshStandardMaterial color="#999999" roughness={0.1} />
            </mesh>
          </group>
        );

      case 'lamp':
        return (
          <group>
            {/* Base */}
            <mesh position={[0, -70, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[width/2, width/3, 5, 16]} />
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </mesh>
            {/* Stem */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[2, 2, 140, 8]} />
              <meshStandardMaterial color="#A0522D" roughness={0.5} />
            </mesh>
            {/* Lampshade */}
            <mesh position={[0, 50, 0]} castShadow receiveShadow>
              <coneGeometry args={[width/2, 30, 16, 1, true]} />
              <meshStandardMaterial color={structureColor} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Light bulb (emissive) */}
            <mesh position={[0, 40, 0]}>
              <sphereGeometry args={[10, 16, 16]} />
              <meshStandardMaterial color="#FFFFA0" emissive="#FFFF80" emissiveIntensity={1.0} />
            </mesh>
          </group>
        );

      case 'chandelier':
        return (
          <group>
            {/* Central part */}
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[width/6, 16, 16]} />
              <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Arms */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * Math.PI * 2;
              const x = Math.cos(angle) * width/3;
              const z = Math.sin(angle) * width/3;
              
              return (
                <group key={i}>
                  <mesh position={[0, 0, 0]} rotation={[0, -angle, 0]} castShadow>
                    <cylinderGeometry args={[1, 1, width/2, 8]} />
                    <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[x, -20, z]} castShadow>
                    <sphereGeometry args={[5, 16, 16]} />
                    <meshStandardMaterial color="#FFFFA0" emissive="#FFFF80" emissiveIntensity={1.0} />
                  </mesh>
                </group>
              );
            })}
            {/* Ceiling attachment */}
            <mesh position={[0, 30, 0]} castShadow>
              <cylinderGeometry args={[3, 3, 10, 8]} />
              <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );

      case 'plant':
        return (
          <group>
            {/* Pot */}
            <mesh position={[0, -structureHeight/4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[width/2, width/3, structureHeight/2, 16]} />
              <meshStandardMaterial color="#A0522D" roughness={0.7} />
            </mesh>
            {/* Plant base */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[width/1.5, 16, 16]} />
              <meshStandardMaterial color={structureColor} roughness={0.9} />
            </mesh>
            {/* Plant details - small spheres for leaves */}
            {[...Array(20)].map((_, i) => {
              const radius = width/3;
              const phi = Math.acos(-1 + (2 * i) / 20);
              const theta = Math.sqrt(20 * Math.PI) * phi;
              
              const x = radius * Math.sin(phi) * Math.cos(theta);
              const y = radius * Math.sin(phi) * Math.sin(theta) + radius/2;
              const z = radius * Math.cos(phi);
              
              return (
                <mesh key={i} position={[x, y, z]} castShadow>
                  <sphereGeometry args={[width/10, 8, 8]} />
                  <meshStandardMaterial color={structureColor} roughness={0.8} />
                </mesh>
              );
            })}
          </group>
        );

      case 'pool':
        return (
          <group>
            {/* Pool hole */}
            <mesh position={[0, -20, 0]} receiveShadow>
              <boxGeometry args={[width, 40, height]} />
              <meshStandardMaterial color="#4682B4" />
            </mesh>
            {/* Water surface with transparency */}
            <mesh position={[0, -1, 0]} receiveShadow>
              <boxGeometry args={[width - 10, 2, height - 10]} />
              <meshPhysicalMaterial 
                color="#7EC0EE" 
                transparent={true} 
                opacity={0.7} 
                roughness={0.1} 
                metalness={0.1}
                transmission={0.5}
              />
            </mesh>
            {/* Pool edge */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 2, height]} />
              <meshStandardMaterial color="#F5F5DC" roughness={0.7} />
            </mesh>
          </group>
        );
        
      default:
        // Generic structure for any other type
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, structureHeight, height]} />
            <meshStandardMaterial color={structureColor} roughness={0.7} />
          </mesh>
        );
    }
  };

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {renderStructure()}
    </group>
  );
};

Structure.propTypes = {
  type: PropTypes.string.isRequired,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  depth: PropTypes.number,
  color: PropTypes.string,
  rotation: PropTypes.number
};

export default Structure; 