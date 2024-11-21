import React, { useEffect, useRef, useState } from 'react';
import './AuxillariesHookUpDiagram.css';
import SidebarTools from './SidebarTools';

const MoldTemperatureMaps = ({ activeTab }) => {
  const canvasRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [imageSize, setImageSize] = useState({ width: 150, height: 100 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState(null); // Track selected tool
  const [placedSymbols, setPlacedSymbols] = useState([]); // Track placed symbols
  const [isTableVisible, setIsTableVisible] = useState(false); // State to show/hide table modal
  const [greyBoxes, setGreyBoxes] = useState([]); // Track the grey boxes on the canvas
  const [tableData, setTableData] = useState([
    ['', '', '', '', ''], // Initial 6 rows with 5 columns each
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ]);

  const handleKeyPressInCell = (e, rowIndex, colIndex) => {
    if (e.key === 'Enter') {
      const isLastRow = rowIndex === tableData.length - 1;
      const isLastCol = colIndex === tableData[0].length - 1;

      let newTableData = [...tableData];

      if (isLastRow) {
        // Add a new row
        newTableData.push(new Array(newTableData[0].length).fill(''));
      }

      if (isLastCol) {
        // Add a new column to each row
        newTableData = newTableData.map((row) => [...row, '']);
      }

      setTableData(newTableData);
    }
  };

  const handleTableChange = (e, rowIndex, colIndex) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex] = e.target.textContent; 
    setTableData(newTableData);
  };

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  };

  const drawImage = (ctx) => {
    if (imageElement) {
      ctx.drawImage(imageElement, imagePosition.x, imagePosition.y, imageSize.width, imageSize.height);
      drawNodes(ctx);
    }
  };

  const drawNodes = (ctx) => {
    const nodeSize = 8;
    const positions = [
      { x: imagePosition.x - nodeSize / 2, y: imagePosition.y - nodeSize / 2 }, // top-left
      { x: imagePosition.x + imageSize.width / 2 - nodeSize / 2, y: imagePosition.y - nodeSize / 2 }, // top-center
      { x: imagePosition.x + imageSize.width - nodeSize / 2, y: imagePosition.y - nodeSize / 2 }, // top-right
      { x: imagePosition.x - nodeSize / 2, y: imagePosition.y + imageSize.height / 2 - nodeSize / 2 }, // middle-left
      { x: imagePosition.x + imageSize.width / 2 - nodeSize / 2, y: imagePosition.y + imageSize.height / 2 - nodeSize / 2 }, // middle-center
      { x: imagePosition.x + imageSize.width - nodeSize / 2, y: imagePosition.y + imageSize.height / 2 - nodeSize / 2 }, // middle-right
      { x: imagePosition.x - nodeSize / 2, y: imagePosition.y + imageSize.height - nodeSize / 2 }, // bottom-left
      { x: imagePosition.x + imageSize.width / 2 - nodeSize / 2, y: imagePosition.y + imageSize.height - nodeSize / 2 }, // bottom-center
      { x: imagePosition.x + imageSize.width - nodeSize / 2, y: imagePosition.y + imageSize.height - nodeSize / 2 }, // bottom-right
    ];

    positions.forEach((pos) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(pos.x, pos.y, nodeSize, nodeSize);
    });
  };

  const drawSymbols = (ctx) => {
    placedSymbols.forEach((symbol) => {
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      switch (symbol.tool) {
        case 'Circle':
          ctx.arc(symbol.x, symbol.y, 15, 0, 2 * Math.PI);
          break;
        case 'Square':
          ctx.fillRect(symbol.x - 15, symbol.y - 15, 30, 30);
          break;
          case 'Triangle':
            ctx.moveTo(symbol.x, symbol.y - 20);
            ctx.lineTo(symbol.x + 17, symbol.y + 15);
            ctx.lineTo(symbol.x - 17, symbol.y + 15);
            ctx.closePath();
            ctx.fill();
            break;
    
          case 'Line':
            ctx.moveTo(symbol.x - 20, symbol.y);
            ctx.lineTo(symbol.x + 20, symbol.y);
            ctx.stroke();
            break;
    
          case 'Arrow':
            // Draw a simple arrow pointing to the right
            ctx.moveTo(symbol.x - 20, symbol.y);
            ctx.lineTo(symbol.x + 10, symbol.y);
            ctx.lineTo(symbol.x + 5, symbol.y - 5);
            ctx.moveTo(symbol.x + 10, symbol.y);
            ctx.lineTo(symbol.x + 5, symbol.y + 5);
            ctx.stroke();
            break;
    
          case 'Text':
            ctx.font = "20px Arial";
            ctx.fillText("A", symbol.x, symbol.y);
            break;
    
          case 'Plus':
            ctx.moveTo(symbol.x, symbol.y - 15);
            ctx.lineTo(symbol.x, symbol.y + 15);
            ctx.moveTo(symbol.x - 15, symbol.y);
            ctx.lineTo(symbol.x + 15, symbol.y);
            ctx.stroke();
            break;
    
          case 'Minus':
            ctx.moveTo(symbol.x - 15, symbol.y);
            ctx.lineTo(symbol.x + 15, symbol.y);
            ctx.stroke();
            break;
    
          case 'Star':
            // A basic star shape with 5 points
            const outerRadius = 15;
            const innerRadius = 7;
            const points = 5;
            let angle = Math.PI / points;
    
            for (let i = 0; i < 2 * points; i++) {
              const r = (i % 2 === 0) ? outerRadius : innerRadius;
              const x = symbol.x + Math.cos(i * angle) * r;
              const y = symbol.y + Math.sin(i * angle) * r;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
    
          case 'Hexagon':
            const hexRadius = 20;
            for (let i = 0; i < 6; i++) {
              const x = symbol.x + hexRadius * Math.cos((Math.PI / 3) * i);
              const y = symbol.y + hexRadius * Math.sin((Math.PI / 3) * i);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            break;
    
          default:
            break;
        }
      });
    };

  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const mousePos = getMousePos(canvas, event);
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    if (selectedTool) {
      // Place the symbol when a tool is selected
      setPlacedSymbols((prevSymbols) => [
        ...prevSymbols,
        { tool: selectedTool, x: mousePos.x, y: mousePos.y },
      ]);
      setSelectedTool(null); // Reset tool after placement
    } else {
      // Handle image dragging and resizing as per original functionality
      const nodeSize = 8;
      const positions = [
        { x: imagePosition.x, y: imagePosition.y }, // top-left
        { x: imagePosition.x + imageSize.width / 2, y: imagePosition.y }, // top-center
        { x: imagePosition.x + imageSize.width, y: imagePosition.y }, // top-right
        { x: imagePosition.x, y: imagePosition.y + imageSize.height / 2 }, // middle-left
        { x: imagePosition.x + imageSize.width / 2, y: imagePosition.y + imageSize.height / 2 }, // middle-center
        { x: imagePosition.x + imageSize.width, y: imagePosition.y + imageSize.height / 2 }, // middle-right
        { x: imagePosition.x, y: imagePosition.y + imageSize.height }, // bottom-left
        { x: imagePosition.x + imageSize.width / 2, y: imagePosition.y + imageSize.height }, // bottom-center
        { x: imagePosition.x + imageSize.width, y: imagePosition.y + imageSize.height }, // bottom-right
      ];

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        if (
          mousePos.x >= pos.x - nodeSize / 2 &&
          mousePos.x <= pos.x + nodeSize / 2 &&
          mousePos.y >= pos.y - nodeSize / 2 &&
          mousePos.y <= pos.y + nodeSize / 2
        ) {
          setResizing(i);
          return;
        }
      }

      if (
        mousePos.x >= imagePosition.x &&
        mousePos.x <= imagePosition.x + imageSize.width &&
        mousePos.y >= imagePosition.y &&
        mousePos.y <= imagePosition.y + imageSize.height
      ) {
        setDragging(true);
        setMouseOffset({
          x: mousePos.x - imagePosition.x,
          y: mousePos.y - imagePosition.y,
        });
      }
    }
  };

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const mousePos = getMousePos(canvas, event);

    if (dragging) {
      setImagePosition({
        x: mousePos.x - mouseOffset.x,
        y: mousePos.y - mouseOffset.y,
      });
    } else if (resizing !== null) {
      switch (resizing) {
        case 0: // Top-left corner
          setImagePosition({
            x: mousePos.x,
            y: mousePos.y,
          });
          setImageSize({
            width: imageSize.width + (imagePosition.x - mousePos.x),
            height: imageSize.height + (imagePosition.y - mousePos.y),
          });
          break;
  
        case 1: // Top-center
          setImagePosition((prevPosition) => ({
            ...prevPosition,
            y: mousePos.y,
          }));
          setImageSize((prevSize) => ({
            ...prevSize,
            height: imageSize.height + (imagePosition.y - mousePos.y),
          }));
          break;
  
        case 2: // Top-right corner
          setImagePosition((prevPosition) => ({
            ...prevPosition,
            y: mousePos.y,
          }));
          setImageSize({
            width: mousePos.x - imagePosition.x,
            height: imageSize.height + (imagePosition.y - mousePos.y),
          });
          break;
  
        case 3: // Middle-left
          setImagePosition((prevPosition) => ({
            ...prevPosition,
            x: mousePos.x,
          }));
          setImageSize({
            width: imageSize.width + (imagePosition.x - mousePos.x),
          });
          break;
  
        case 5: // Middle-right
          setImageSize({
            width: mousePos.x - imagePosition.x,
          });
          break;
  
        case 6: // Bottom-left corner
          setImagePosition({
            x: mousePos.x,
          });
          setImageSize({
            width: imageSize.width + (imagePosition.x - mousePos.x),
            height: mousePos.y - imagePosition.y,
          });
          break;
  
        case 7: // Bottom-center
          setImageSize({
            height: mousePos.y - imagePosition.y,
          });
          break;
  
        case 8: // Bottom-right corner
          setImageSize({
            width: mousePos.x - imagePosition.x,
            height: mousePos.y - imagePosition.y,
          });
          break;
  
        default:
          break;
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(null);
  };

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImageElement(img);
        setImageFile(file);
        setImageSize({ width: img.width / 2, height: img.height / 2 });
      };
    }
  };

  // New function for handling the table button click
  // Handle Table button click
  const handleTableButtonClick = () => {
    setIsTableVisible(true);
  };

  // Handle closing the table modal
  const handleCloseTable = () => {
    setIsTableVisible(false);
  };

  const handleToolSelect = (toolName) => {
    setSelectedTool(toolName); // Set the active tool
  };

  const handleCellBlur = (e, rowIndex, colIndex) => {
    const updatedValue = e.target.textContent;
    handleTableChange(rowIndex, colIndex, updatedValue);
  };

  const handleCanvasClick = (e) => {
    if (selectedTool) {
      // If a tool is selected and a box is clicked, turn that box grey
      const boxId = e.target.id; // Assume each box has an ID
      if (!greyBoxes.includes(boxId)) {
        setGreyBoxes([...greyBoxes, boxId]);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const handleDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      drawGrid(ctx, canvas.width, canvas.height); // Draw grid
      drawImage(ctx); // Draw uploaded image
      drawSymbols(ctx); // Draw placed symbols
    };

    handleDraw();
  }, [imageElement, imagePosition, imageSize, placedSymbols]);

  const handleDocumentClick = (event) => {
    // Reset cursor to default after placing the symbol
    document.body.style.cursor = 'default';
  };
  
  // Attach an event listener on mount to reset the cursor after placing
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
  
  return (
    <div className="container">
      <SidebarTools onToolSelect={handleToolSelect} />
      <canvas
        ref={canvasRef}
        width="1456"
        height="1000"
        style={{ border: '1px solid #000', background: '#e3ecef', cursor: selectedTool ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    {/* Date Picker */}
    {/* <div className="date-picker-container">
          <input type="date" className="date-picker" />
        </div> */}

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="imageUpload"
        onChange={handleImageUpload}
      />
      
      <label htmlFor="imageUpload" className="add-image-button">
        Add Image
      </label>

      {/* Add Table Button */}
      <button
        onClick={handleTableButtonClick}
        className="table-button"
        style={{ marginLeft: '10px' }}
      >
        Add Table
      </button>

      {/* Table Modal */}
      {isTableVisible && (
        <div className="modal">
          <div className="modal-content">
            <h2>Waterline Table Side A</h2>
            <table className="waterline-table">
              <thead>
                <tr>
                  <th>Line Number</th>
                  <th>TempIn</th>
                  <th>TempOut</th>
                  <th>Flow Rate</th>
                  <th>Diff Pressure</th>
                </tr>
              </thead>
              <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleCellBlur(e, rowIndex, colIndex)} // Handle cell blur
                      onKeyPress={(e) => handleKeyPressInCell(e, rowIndex, colIndex)}
                                      onChange={(e) => handleTableChange(e, rowIndex, colIndex)}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            </table>

            {/* Dropdowns */}
            <div className="dropdowns">
              <div>
                <label>Coolants:</label>
                <select>
                  <option value="water">Water</option>
                  <option value="oil">Oil</option>
                </select>
              </div>
              <div>
                <label>Temperature Units:</label>
                <select>
                  <option value="celsius">Celsius</option>
                  <option value="fahrenheit">Fahrenheit</option>
                </select>
              </div>
              <div>
                <label>Flow Units:</label>
                <select>
                  <option value="gpm">GPM</option>
                  <option value="lpm">LPM</option>
                </select>
              </div>
              <div>
                <label>Pressure Units:</label>
                <select>
                  <option value="psi">PSI</option>
                  <option value="bar">Bar</option>
                  <option value="bar">Mpa</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCloseTable}>OK</button>
              <button onClick={handleCloseTable}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoldTemperatureMaps;