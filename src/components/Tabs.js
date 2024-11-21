import React, { useState, useEffect } from 'react';
import './Tabs.css'; // Importing CSS for styling
import AuxillariesHookUpDiagram from './AuxillariesHookUpDiagram'; // Importing the component
import CavityLayout from './CavityLayout';
import MoldTemperatureMaps from './MoldTemperatureMaps';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('Auxillaries Hook Up Diagram');
  const [tabData, setTabData] = useState({
    'Auxillaries Hook Up Diagram': {},
    'Cavity Layout': {},
    'Mold Temperature Maps': {},
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [showBottomTabs, setShowBottomTabs] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [selectedSubTabs, setSelectedSubTabs] = useState({});
  const [currentSubTab, setCurrentSubTab] = useState('');
  const [rectangles, setRectangles] = useState([
    { x: 140, y: 100, width: 210, height: 400, id: 1 },
    { x: 70, y: 250, width: 350, height: 100, id: 2 },
  ]);
  const [dragging, setDragging] = useState(null);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setCurrentSubTab('');
    const bottomTabs = {
      'Auxillaries Hook Up Diagram': ['Side A', 'Side B', 'Center Plates', 'Plate X', 'Plate Y'],
      'Cavity Layout': ['Side A', 'Side B'],
      'Mold Temperature Maps': [
        'Side A Before Molding',
        'Side B Before Molding',
        'Center Plate Before Molding',
        'Side A During Molding',
        'Side B During Molding',
        'Center Plate During Molding',
      ],
    };
    setShowBottomTabs(bottomTabs[tabName] || []);
  };

  const handleSubTabClick = (subTab) => {
    setCurrentSubTab(subTab);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 10));
  const handleZoomInput = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 10 && value <= 200) setZoomLevel(value);
  };

  const handleClear = () => {
    setTabData((prev) => ({
      ...prev,
      [activeTab]: {},
    }));
  };

  const handleSave = () => {
    console.log('Current Tab Data:', tabData);
    console.log('Selected Sub Tabs:', selectedSubTabs);

    const saveData = { tabData, selectedSubTabs };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_tabs_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    setShowPrintOptions(true);
  };
  
  const handlePrintSubTab = () => {
    const selectedTabs = Object.keys(selectedSubTabs); // Get all selected tabs
    if (selectedTabs.length === 0) {
      alert('No tabs or subtabs selected to print.');
      return;
    }
  
    selectedTabs.forEach((tab) => {
      const subtabs = selectedSubTabs[tab] || []; // Get selected subtabs for this tab
      subtabs.forEach((subTab) => {
        const printContents = document.createElement('div');
        printContents.innerHTML = `Contents for: ${tab} - ${subTab}`;
        
        // Open new window for each subtab and print
        const newWindow = window.open('', '_blank');
        newWindow.document.write('<html><head><title>Print</title></head><body>');
        newWindow.document.write(printContents.innerHTML);
        newWindow.document.write('</body></html>');
        newWindow.document.close();
        newWindow.print();
        newWindow.onafterprint = () => newWindow.close();
      });
    });
  
    setShowPrintOptions(false); // Hide the print options after printing
  };
  

  const handleSubTabSelection = (subTab, tabType) => {
    setSelectedSubTabs((prev) => {
      const currentSelection = prev[tabType] || [];
      return currentSelection.includes(subTab)
        ? { ...prev, [tabType]: currentSelection.filter((item) => item !== subTab) }
        : { ...prev, [tabType]: [...currentSelection, subTab] };
    });
  };

  // Rectangle movement and resizing functions
  const handleMouseDown = (e, id) => {
    const rect = rectangles.find((r) => r.id === id);
    if (rect) setDragging({ id, offsetX: e.clientX - rect.x, offsetY: e.clientY - rect.y });
  };

  const handleMouseMove = (e) => {
    if (dragging && !dragging.resizing) {
      const { id, offsetX, offsetY } = dragging;
      setRectangles((rects) =>
        rects.map((rect) => (rect.id === id ? { ...rect, x: e.clientX - offsetX, y: e.clientY - offsetY } : rect))
      );
    }
  };

  const handleMouseUp = () => setDragging(null);

  const handleResizeMouseDown = (e, id, position) => {
    e.stopPropagation();
    setDragging({ id, position, resizing: true });
  };

  const handleResizeMouseMove = (e) => {
    if (dragging?.resizing) {
      setRectangles((rects) =>
        rects.map((rect) => {
          if (rect.id === dragging.id) {
            const newRect = { ...rect };
            if (dragging.position.includes("right")) newRect.width = e.clientX - rect.x;
            if (dragging.position.includes("bottom")) newRect.height = e.clientY - rect.y;
            if (dragging.position.includes("left")) {
              newRect.width += rect.x - e.clientX;
              newRect.x = e.clientX;
            }
            if (dragging.position.includes("top")) {
              newRect.height += rect.y - e.clientY;
              newRect.y = e.clientY;
            }
            return newRect;
          }
          return rect;
        })
      );
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleResizeMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleResizeMouseMove);
    };
  }, [dragging]);

  return (
    <div className="tabs-container">
      <div className="tabs">
        {['Auxillaries Hook Up Diagram', 'Cavity Layout', 'Mold Temperature Maps'].map((tabName) => (
          <button
            key={tabName}
            className={`tab ${activeTab === tabName ? 'active' : ''}`}
            onClick={() => handleTabClick(tabName)}
          >
            {tabName}
          </button>
        ))}
      </div>

      <div className="date-picker-container">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <div className="tab-content" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: '0 0', overflow: 'auto' }}>
        {activeTab === 'Auxillaries Hook Up Diagram' && (
          <AuxillariesHookUpDiagram data={tabData[activeTab]} setData={(data) => setTabData((prev) => ({ ...prev, [activeTab]: data }))} />
        )}
        {activeTab === 'Cavity Layout' && (
            <CavityLayout
              data={tabData[activeTab]}
              setData={(data) => setTabData((prev) => ({ ...prev, [activeTab]: data }))}
            />
          )}

          {activeTab === 'Mold Temperature Maps' && (
            <MoldTemperatureMaps
              data={tabData[activeTab]}
              setData={(data) => setTabData((prev) => ({ ...prev, [activeTab]: data }))}
            />
          )}
        {rectangles.map((rect) => (
          <div
            key={rect.id}
            className="resizable-rectangle"
            style={{ top: rect.y, left: rect.x, width: rect.width, height: rect.height, position: 'absolute', border: '2px solid black' }}
            onMouseDown={(e) => handleMouseDown(e, rect.id)}
          >
            {["top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "center"].map((pos) => (
              <div
                key={pos}
                className={`resize-node ${pos}`}
                onMouseDown={(e) => handleResizeMouseDown(e, rect.id, pos)}
              />
            ))}
          </div>
        ))}
      </div>

      {showBottomTabs.length > 0 && (
        <div className="bottom-tabs">
          {showBottomTabs.map((subTab) => (
            <button key={subTab} className={`bottom-tab ${currentSubTab === subTab ? 'active' : ''}`} onClick={() => handleSubTabClick(subTab)}>
              {subTab}
            </button>
          ))}
        </div>
      )}

      <div className="bottom-section">
        <div className="zoom-buttons">
          <button className="zoom-button" onClick={handleZoomIn}>➕</button>
          <input type="number" value={zoomLevel} onChange={handleZoomInput} className="zoom-input" />
          <button className="zoom-button" onClick={handleZoomOut}>➖</button>
        </div>
        <div className="action-buttons">
          <button className="clear-button" onClick={handleClear}>Clear</button>
          <button className="save-button" onClick={handleSave}>Save</button>
          <button className="print-button" onClick={handlePrint}>Print</button>
          <button className="print-button" onClick={handlePrint}>Close</button>
        </div>
      </div>

      {showPrintOptions && (
  <div className="print-options">
    <p>Select tabs and subtabs to print:</p>
    {Object.keys(tabData).map((tab) => (
      <div key={tab} className="tab-checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={selectedSubTabs[tab]?.length > 0 || false}
            onChange={() =>
              setSelectedSubTabs((prev) => ({
                ...prev,
                [tab]: prev[tab]?.length ? [] : showBottomTabs,
              }))
            }
          />
          {tab}
        </label>
        <div className="subtab-checkboxes">
          {showBottomTabs.map((subTab) => (
            <label key={subTab} className="subtab-checkbox">
              <input
                type="checkbox"
                checked={selectedSubTabs[tab]?.includes(subTab) || false}
                onChange={() => handleSubTabSelection(subTab, tab)}
              />
              {subTab}
            </label>
          ))}
        </div>
      </div>
    ))}
    <button onClick={handlePrintSubTab}>Print Selected</button>
    <button onClick={() => setShowPrintOptions(false)}>Cancel</button>
  </div>
)}

    </div>
  );
};

export default Tabs;
