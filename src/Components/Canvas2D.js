import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// The 2D canvas component for rendering floor plans
const Canvas2D = ({ elements, selectedElement, onSelectElement, width, height }) => {
  const canvasRef = useRef(null);

  // Setup canvas and draw elements
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw all elements
    elements.forEach((element, index) => {
      const isSelected = selectedElement === index;
      
      // Set color based on element type with fallback to default
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
        path: "#d3d3d3"
      };
      
      const color = colorMap[element.type] || "#cccccc";
      
      // Draw element based on type
      drawElement(ctx, element, color, isSelected);
    });
  }, [elements, selectedElement]);

  // Draw individual element on canvas
  const drawElement = (ctx, element, color, isSelected) => {
    const { type, x, y, width: elementWidth, height: elementHeight, rotation = 0 } = element;
    
    // Save canvas state to restore after transformations
    ctx.save();
    
    // Translate to element position
    ctx.translate(x + elementWidth / 2, y + elementHeight / 2);
    
    // Apply rotation if specified
    if (rotation) {
      ctx.rotate(rotation);
    }
    
    // Style settings
    ctx.fillStyle = color;
    ctx.strokeStyle = isSelected ? '#0088ff' : '#333333';
    ctx.lineWidth = isSelected ? 2 : 1;
    
    // Draw based on element type
    switch(type) {
      case 'sofa':
        drawSofa(ctx, elementWidth, elementHeight);
        break;
      case 'sectional':
        drawSectional(ctx, elementWidth, elementHeight);
        break;
      case 'chair':
        drawChair(ctx, elementWidth, elementHeight);
        break;
      case 'bed':
        drawBed(ctx, elementWidth, elementHeight);
        break;
      case 'table':
        drawTable(ctx, elementWidth, elementHeight);
        break;
      case 'desk':
        drawDesk(ctx, elementWidth, elementHeight);
        break;
      case 'bookshelf':
        drawBookshelf(ctx, elementWidth, elementHeight);
        break;
      case 'bath':
        drawBath(ctx, elementWidth, elementHeight);
        break;
      case 'shower':
        drawShower(ctx, elementWidth, elementHeight);
        break;
      case 'toilet':
        drawToilet(ctx, elementWidth, elementHeight);
        break;
      case 'refrigerator':
        drawRefrigerator(ctx, elementWidth, elementHeight);
        break;
      case 'kitchen-island':
        drawKitchenIsland(ctx, elementWidth, elementHeight);
        break;
      case 'lamp':
        drawLamp(ctx, elementWidth, elementHeight);
        break;
      case 'chandelier':
        drawChandelier(ctx, elementWidth, elementHeight);
        break;
      case 'plant':
        drawPlant(ctx, elementWidth, elementHeight);
        break;
      case 'pool':
        drawPool(ctx, elementWidth, elementHeight);
        break;
      default:
        // Default rectangle for any other elements
        ctx.fillRect(-elementWidth / 2, -elementHeight / 2, elementWidth, elementHeight);
        ctx.strokeRect(-elementWidth / 2, -elementHeight / 2, elementWidth, elementHeight);
    }
    
    // Restore canvas state
    ctx.restore();
  };

  // Element-specific drawing functions
  const drawSofa = (ctx, width, height) => {
    // Main body
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Add back details
    ctx.fillStyle = '#b0866b';
    ctx.fillRect(-width / 2, -height / 2, width, height / 4);
    
    // Add cushion lines
    ctx.beginPath();
    ctx.moveTo(-width / 4, -height / 2 + height / 4);
    ctx.lineTo(-width / 4, height / 2);
    ctx.moveTo(width / 4, -height / 2 + height / 4);
    ctx.lineTo(width / 4, height / 2);
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    
    // Border
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawSectional = (ctx, width, height) => {
    // L-shape
    ctx.fillRect(-width / 2, -height / 2, width * 0.75, height);
    ctx.fillRect(width * 0.25 - width / 2, -height / 2, width * 0.25, height * 0.6);
    
    // Back details
    ctx.fillStyle = '#c57e5e';
    ctx.fillRect(-width / 2, -height / 2, width * 0.75, height / 4);
    ctx.fillRect(width * 0.25 - width / 2, -height / 2, width * 0.25, height / 4);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width * 0.75, height);
    ctx.strokeRect(width * 0.25 - width / 2, -height / 2, width * 0.25, height * 0.6);
  };

  const drawChair = (ctx, width, height) => {
    // Chair seat
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Chair back
    ctx.fillStyle = '#8c4120';
    ctx.fillRect(-width / 2, -height / 2, width, height / 4);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawBed = (ctx, width, height) => {
    // Bed frame
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Pillow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-width / 2 + width * 0.1, -height / 2 + height * 0.1, width * 0.8, height * 0.2);
    
    // Mattress lines
    ctx.beginPath();
    ctx.moveTo(-width / 2 + width * 0.05, -height / 2 + height * 0.4);
    ctx.lineTo(width / 2 - width * 0.05, -height / 2 + height * 0.4);
    ctx.moveTo(-width / 2 + width * 0.05, -height / 2 + height * 0.7);
    ctx.lineTo(width / 2 - width * 0.05, -height / 2 + height * 0.7);
    ctx.strokeStyle = '#888888';
    ctx.stroke();
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawTable = (ctx, width, height) => {
    // Table top
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Legs
    ctx.fillStyle = '#6b3510';
    const legWidth = Math.min(width, height) * 0.1;
    ctx.fillRect(-width / 2 + legWidth/2, -height / 2 + legWidth/2, legWidth, legWidth);
    ctx.fillRect(width / 2 - legWidth*1.5, -height / 2 + legWidth/2, legWidth, legWidth);
    ctx.fillRect(-width / 2 + legWidth/2, height / 2 - legWidth*1.5, legWidth, legWidth);
    ctx.fillRect(width / 2 - legWidth*1.5, height / 2 - legWidth*1.5, legWidth, legWidth);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawDesk = (ctx, width, height) => {
    // Desk top
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Drawer
    ctx.fillStyle = '#bc936c';
    ctx.fillRect(-width / 2, -height / 2 + height * 0.6, width * 0.3, height * 0.4);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    // Drawer handle
    ctx.beginPath();
    ctx.moveTo(-width / 2 + width * 0.15 - 5, -height / 2 + height * 0.8);
    ctx.lineTo(-width / 2 + width * 0.15 + 5, -height / 2 + height * 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawBookshelf = (ctx, width, height) => {
    // Main structure
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Shelves
    ctx.fillStyle = '#6b3510';
    const numShelves = 4;
    const shelfHeight = height / (numShelves + 1);
    
    for (let i = 1; i <= numShelves; i++) {
      ctx.fillRect(-width / 2, -height / 2 + i * shelfHeight, width, 2);
    }
    
    // Books on shelves (simplified)
    ctx.fillStyle = '#c58343';
    for (let i = 0; i < numShelves; i++) {
      for (let j = 0; j < 3; j++) {
        const bookWidth = width / 4;
        const bookHeight = shelfHeight * 0.8;
        const startX = -width / 2 + j * (bookWidth + 5) + 5;
        const startY = -height / 2 + i * shelfHeight + 2;
        
        ctx.fillRect(startX, startY, bookWidth, bookHeight);
      }
    }
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawBath = (ctx, width, height) => {
    // Tub outline
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Inner basin
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10);
    
    // Drain
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#888888';
    ctx.fill();
    
    // Faucet
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(width / 2 - 15, -height / 2 + 5, 10, 10);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawShower = (ctx, width, height) => {
    // Shower base
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Glass door representation
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10);
    ctx.setLineDash([]);
    
    // Shower head
    ctx.beginPath();
    ctx.arc(0, -height / 2 + 15, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#c0c0c0';
    ctx.fill();
    
    // Drain
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#888888';
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawToilet = (ctx, width, height) => {
    // Base
    ctx.fillRect(-width / 2, -height / 2, width, height * 0.6);
    
    // Seat - oval
    ctx.beginPath();
    ctx.ellipse(0, -height / 2 + height * 0.3, width * 0.4, height * 0.25, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    
    // Tank
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-width / 2 + width * 0.1, -height / 2 + height * 0.6, width * 0.8, height * 0.4);
    ctx.strokeRect(-width / 2 + width * 0.1, -height / 2 + height * 0.6, width * 0.8, height * 0.4);
  };

  const drawRefrigerator = (ctx, width, height) => {
    // Main body
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Door divider
    ctx.beginPath();
    ctx.moveTo(-width / 2 + width * 0.1, 0);
    ctx.lineTo(width / 2 - width * 0.1, 0);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Handle
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(width / 2 - width * 0.15, -height / 2 + height * 0.2, 3, height * 0.3);
    ctx.fillRect(width / 2 - width * 0.15, -height / 2 + height * 0.7, 3, height * 0.2);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawKitchenIsland = (ctx, width, height) => {
    // Base
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Countertop detail
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(-width / 2 + 2, -height / 2 + 2, width - 4, height - 4);
    
    // Cabinet lines
    ctx.beginPath();
    ctx.moveTo(-width / 4, -height / 2);
    ctx.lineTo(-width / 4, height / 2);
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.moveTo(width / 4, -height / 2);
    ctx.lineTo(width / 4, height / 2);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  const drawLamp = (ctx, width, height) => {
    // Stand
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(0, -height / 4);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8B4513';
    ctx.stroke();
    
    // Base
    ctx.beginPath();
    ctx.arc(0, height / 2 - 5, width / 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#A0522D';
    ctx.fill();
    ctx.stroke();
    
    // Lampshade (cone shape in 2D)
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 4);
    ctx.lineTo(width / 2, -height / 4);
    ctx.lineTo(width / 4, -height / 2);
    ctx.lineTo(-width / 4, -height / 2);
    ctx.closePath();
    ctx.fillStyle = '#FFFFC0';
    ctx.fill();
    ctx.stroke();
  };

  const drawChandelier = (ctx, width, height) => {
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, width / 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.stroke();
    
    // Arms and lights
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * width / 3;
      const y = Math.sin(angle) * height / 3;
      
      // Arm
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Light bulb
      ctx.beginPath();
      ctx.arc(x, y, width / 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFA0';
      ctx.fill();
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Ceiling attachment
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -height / 3);
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawPlant = (ctx, width, height) => {
    // Pot
    ctx.beginPath();
    ctx.moveTo(-width / 3, height / 4);
    ctx.lineTo(width / 3, height / 4);
    ctx.lineTo(width / 4, height / 2);
    ctx.lineTo(-width / 4, height / 2);
    ctx.closePath();
    ctx.fillStyle = '#A0522D';
    ctx.fill();
    ctx.stroke();
    
    // Plant
    ctx.beginPath();
    ctx.arc(0, 0, width / 3, 0, Math.PI, true);
    ctx.fillStyle = '#228B22';
    ctx.fill();
    
    // Additional leaves
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI;
      const x = Math.cos(angle) * width / 4;
      const y = Math.sin(angle) * height / 4 - height / 8;
      
      ctx.beginPath();
      ctx.ellipse(x, y, width / 8, height / 10, 0, 0, 2 * Math.PI);
      ctx.fillStyle = '#32CD32';
      ctx.fill();
    }
  };

  const drawPool = (ctx, width, height) => {
    // Pool outline
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // Water area
    ctx.fillStyle = '#7EC0EE';
    ctx.fillRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10);
    
    // Water pattern
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(-width / 2 + 5, -height / 2 + 5 + i * (height - 10) / 4);
      ctx.lineTo(width / 2 - 5, -height / 2 + 5 + i * (height - 10) / 4);
    }
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  };

  // Handle click event to select the element
  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within any element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      
      // Simple rectangular hit detection
      if (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      ) {
        onSelectElement(i);
        return;
      }
    }
    
    // If we get here, no element was clicked
    onSelectElement(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{ background: '#f0f0f0' }}
    />
  );
};

Canvas2D.propTypes = {
  elements: PropTypes.array.isRequired,
  selectedElement: PropTypes.number,
  onSelectElement: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};

export default Canvas2D; 