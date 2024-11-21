import React, { useState } from 'react';
import './SidebarTools.css';

const cursorConfig = {
  Circle: 'url(/path-to-your-cursors/circle-cursor.png), auto',
  Square: 'url(https://i.postimg.cc/2j7L4d0V/square.png), auto',
  Triangle: 'url(/path-to-your-cursors/triangle-cursor.png), auto',
  Line: 'crosshair',
  Arrow: 'url(/path-to-your-cursors/arrow-cursor.png), auto',
  Cursor: 'default', // Reset to normal cursor
};

const SidebarTools = ({ onToolSelect }) => {
  const [activeTool, setActiveTool] = useState(null);

  const tools = [
    { name: 'Circle', icon: <circle cx="20" cy="20" r="15" fill="blue" /> },
    { name: 'Square', icon: <rect x="5" y="5" width="30" height="30" fill="blue" /> },
    { name: 'Triangle', icon: <polygon points="20,5 35,35 5,35" fill="blue" /> },
    { name: 'Line', icon: <line x1="5" y1="20" x2="35" y2="20" stroke="blue" strokeWidth="4" /> },
    { name: 'Arrow', icon: <polygon points="10,20 30,5 30,15 50,15 50,25 30,25 30,35" fill="blue" transform="scale(0.75)" /> },
    { name: 'Text', icon: <text x="5" y="20" fill="blue" fontSize="15">A</text> },
    { name: 'Plus', icon: (
      <>
        <line x1="15" y1="5" x2="15" y2="35" stroke="blue" strokeWidth="4" />
        <line x1="5" y1="20" x2="35" y2="20" stroke="blue" strokeWidth="4" />
      </>
    )},
    { name: 'Minus', icon: <line x1="5" y1="20" x2="35" y2="20" stroke="blue" strokeWidth="4" /> },
    { name: 'Star', icon: <polygon points="20,5 25,15 35,15 27,22 30,35 20,27 10,35 13,22 5,15 15,15" fill="blue" transform="scale(0.8)" /> },
    { name: 'Hexagon', icon: <polygon points="20,10 35,15 40,30 35,40 20,45 5,40 0,25 5,15" fill="blue" transform="scale(0.85)" /> },
    { name: 'Cursor', icon: <text x="5" y="25" fill="blue" fontSize="20">🖱️</text> }, // New cursor reset tool
  ];

  const handleToolClick = (toolName) => {
    setActiveTool(toolName);
    onToolSelect(toolName);

    // Set the cursor style based on the selected tool
    document.body.style.cursor = cursorConfig[toolName] || 'default';
  };

  return (
    <div className="sidebar-tools">
      {tools.map((tool) => (
        <div
          key={tool.name}
          className={`tool-box ${activeTool === tool.name ? 'active' : ''}`}
          onClick={() => handleToolClick(tool.name)}
          title={tool.name}
        >
          <svg width="40" height="40">
            {tool.icon}
          </svg>
        </div>
      ))}
    </div>
  );
};

export default SidebarTools;
