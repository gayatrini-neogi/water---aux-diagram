import React from 'react';
import AuxillariesHookUpDiagram from '../AuxillariesHookUpDiagram';  // Assuming the previous code is in this file.

const SideA = () => {
  return (
    <div className="side-a-wrapper">
      <h2>Side A</h2>
      <AuxillariesHookUpDiagram activeTab="SideA" />
    </div>
  );
};

export default SideA;
