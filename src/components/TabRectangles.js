import React, { useState } from 'react';
import './ResizableRectangles.css';

const ResizableRectangles = () => {
  // Initial states for the two rectangles (position and dimensions)
  const [rectangles, setRectangles] = useState([
    { x: 200, y: 100, width: 150, height: 300 }, // Vertical rectangle
    { x: 125, y: 175, width: 300, height: 150 }, // Horizontal rectangle
  ]);

  // Function to handle node dragging and resizing
  const handleNodeDrag = (index, nodeType, event) => {
    const { clientX, clientY } = event;
    setRectangles((prevRectangles) => {
      const newRectangles = [...prevRectangles];
      const rect = { ...newRectangles[index] };

      switch (nodeType) {
        case 'top-left':
          rect.x = clientX;
          rect.y = clientY;
          rect.width = rect.width + (rect.x - clientX);
          rect.height = rect.height + (rect.y - clientY);
          break;
        case 'top':
          rect.y = clientY;
          rect.height = rect.height + (rect.y - clientY);
          break;
        case 'top-right':
          rect.width = clientX - rect.x;
          rect.y = clientY;
          rect.height = rect.height + (rect.y - clientY);
          break;
        case 'right':
          rect.width = clientX - rect.x;
          break;
        case 'bottom-right':
          rect.width = clientX - rect.x;
          rect.height = clientY - rect.y;
          break;
        case 'bottom':
          rect.height = clientY - rect.y;
          break;
        case 'bottom-left':
          rect.x = clientX;
          rect.width = rect.width + (rect.x - clientX);
          rect.height = clientY - rect.y;
          break;
        case 'left':
          rect.x = clientX;
          rect.width = rect.width + (rect.x - clientX);
          break;
        case 'center':
          const deltaX = clientX - (rect.x + rect.width / 2);
          const deltaY = clientY - (rect.y + rect.height / 2);
          rect.x += deltaX;
          rect.y += deltaY;
          break;
        default:
          break;
      }

      newRectangles[index] = rect;
      return newRectangles;
    });
  };

  // Helper to render a rectangle with its nodes
  const renderRectangleWithNodes = (rect, index) => {
    const nodes = [
      { type: 'top-left', cx: rect.x, cy: rect.y },
      { type: 'top', cx: rect.x + rect.width / 2, cy: rect.y },
      { type: 'top-right', cx: rect.x + rect.width, cy: rect.y },
      { type: 'right', cx: rect.x + rect.width, cy: rect.y + rect.height / 2 },
      { type: 'bottom-right', cx: rect.x + rect.width, cy: rect.y + rect.height },
      { type: 'bottom', cx: rect.x + rect.width / 2, cy: rect.y + rect.height },
      { type: 'bottom-left', cx: rect.x, cy: rect.y + rect.height },
      { type: 'left', cx: rect.x, cy: rect.y + rect.height / 2 },
      { type: 'center', cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2 },
    ];

    return (
      <g key={index}>
        {/* Rectangle */}
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="transparent"
          stroke="black"
          strokeWidth="2"
        />
        {/* Nodes */}
        {nodes.map((node) => (
          <circle
            key={node.type}
            cx={node.cx}
            cy={node.cy}
            r="5"
            fill="red"
            onMouseDown={(e) => {
              e.preventDefault();
              document.addEventListener('mousemove', (event) => handleNodeDrag(index, node.type, event));
              document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', handleNodeDrag);
              });
            }}
          />
        ))}
      </g>
    );
  };

  return (
    <svg width="100%" height="500" className="resizable-rectangles">
      {rectangles.map((rect, index) => renderRectangleWithNodes(rect, index))}
    </svg>
  );
};

export default ResizableRectangles;
