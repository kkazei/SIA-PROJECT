import React from 'react';
import LandlordSideNav from './LandlordSideNav';

const LandlordLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <LandlordSideNav />
      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen p-4">
        {children}
      </div>
    </div>
  );
};

export default LandlordLayout;