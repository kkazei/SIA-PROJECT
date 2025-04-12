import React, { useState, useEffect } from "react";
import { FaHome, FaSearchLocation, FaClipboardList, FaSignOutAlt, FaBars } from "react-icons/fa";

const NoApartmentSideNavBar = ({ userName, onBrowseClick, onApplicationsClick, onLogout, pendingCount, onSidebarToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Mobile sidebar visibility
  const [activeTab, setActiveTab] = useState("dashboard");

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onSidebarToggle(!collapsed); // Notify parent about the sidebar state
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
    setCollapsed(false); // Ensure the sidebar is fully expanded when opened in mobile view
    onSidebarToggle(false); // Ensure expanded state in mobile view
  };

  const isExpanded = !collapsed;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed z-50 top-4 left-4 bg-gray-800 text-white p-3 rounded-full lg:hidden"
        onClick={toggleSidebarVisibility}
        aria-label={isSidebarVisible ? "Close navigation" : "Open navigation"}
      >
        <FaBars size={20} />
      </button>

      {/* Overlay for mobile */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebarVisibility}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isExpanded ? "w-64" : "w-20"}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Remove the home icon button in mobile view */}
            <button
              onClick={toggleSidebar}
              className="focus:outline-none transition-transform hover:scale-105 hidden lg:block"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaHome className="text-white" />
              </div>
            </button>
            {isExpanded && <h1 className="text-lg font-bold">RentFlow</h1>}
          </div>
        </div>

        {/* Menu */}
        <div className="p-4">
          <p className={`text-sm text-gray-400 mb-3 ${isExpanded ? "block" : "hidden"}`}>MAIN MENU</p>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FaHome className="mr-3" />
            {isExpanded && "Dashboard"}
          </button>

          <button
            onClick={() => {
              setActiveTab("browse");
              onBrowseClick();
            }}
            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
              activeTab === "browse"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FaSearchLocation className="mr-3" />
            {isExpanded && "Browse Apartments"}
          </button>

          <button
            onClick={() => {
              setActiveTab("applications");
              onApplicationsClick();
            }}
            className={`w-full flex items-center py-2 px-3 rounded-lg mb-2 ${
              activeTab === "applications"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } relative`}
          >
            <FaClipboardList className="mr-3" />
            {isExpanded && "My Applications"}
            {pendingCount > 0 && isExpanded && (
              <span className="absolute right-2 top-2 bg-blue-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {isExpanded && (
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-gray-400">New Tenant</p>
              </div>
            </div>
          )}

          {isExpanded && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center py-2 text-red-400 hover:text-red-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NoApartmentSideNavBar;