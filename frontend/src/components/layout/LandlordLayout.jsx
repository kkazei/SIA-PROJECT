import React, { useState } from 'react';
import LandlordSideNav from './LandlordSideNav';

const LandlordLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);

  const handleToggle = (isCollapsed) => {
    setCollapsed(isCollapsed);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <LandlordSideNav onToggle={handleToggle} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default LandlordLayout;