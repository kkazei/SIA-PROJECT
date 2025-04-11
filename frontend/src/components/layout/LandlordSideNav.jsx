import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  FaHome,
  FaUsers,
  FaDoorOpen,
  FaBullhorn,
  FaEnvelope,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaCog,
  FaChevronRight,
  FaChevronLeft,
  FaClipboardList, // Add this for applications
  FaHammer,
  FaMailchimp,
  FaMailBulk,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const LandlordSideNav = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(true); // Sidebar starts collapsed
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Sidebar visibility state
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed); // Notify parent about the state change
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FaHome size={20} />
    },
    {
      path: '/landlord/tenants',
      name: 'Tenants',
      icon: <FaUsers size={20} />
    },
    {
      path: '/landlord/applications',
      name: 'Applications',
      icon: <FaClipboardList size={20} />
    },
    {
      path: '/landlord/announcements',
      name: 'Announcements',
      icon: <FaBullhorn size={20} />
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      icon: <FaHammer size={20} />
    },
    {
      path: '/archive',
      name: 'Archive',
      icon: <FaMailBulk size={20} />
    },
  ];

  return (
    <>
      {/* Toggle Button for Mobile */}
      {!isSidebarVisible && (
        <button
          className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg lg:hidden"
          onClick={() => {
            setIsSidebarVisible(true);
            setCollapsed(false); // Expand sidebar when opened
          }}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        } ${
          collapsed ? 'w-20' : 'w-64' // Adjusted width when expanded
        } bg-gray-900 text-white h-screen fixed top-0 transition-all duration-500 ease-in-out z-40 shadow-xl lg:translate-x-0 overflow-y-auto`}
      >
        {/* Close Button for Mobile */}
        {isSidebarVisible && (
          <button
            className="absolute top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg lg:hidden"
            onClick={() => setIsSidebarVisible(false)}
          >
            <FaBars size={20} />
          </button>
        )}


        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isSidebarVisible) toggleSidebar(); // Only toggle if not in mobile view
              }}
              className={`focus:outline-none transition-transform transform hover:scale-110 hover:shadow-lg ${
                collapsed ? 'w-10 h-12' : 'w-14 h-16'
              }`}
              aria-label="Toggle Sidebar"
            >
              <img 
                src="/image/Logo.png" 
                alt="Logo" 
                className={`cursor-pointer transition-all ${
                  collapsed ? 'ml-0' : 'ml-0' // Add margin-left when collapsed
                }`}
              />
            </button>
            {!collapsed && <span className="text-xl font-bold">RentFlow</span>}
          </div>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-gray-700 ${collapsed ? 'hidden' : 'block'} lg:block`}>
          {user && (
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'L'}
                </div>
              )}
              {!collapsed && (
                <div>
                  <p className="font-semibold">{user.name || 'Landlord'}</p>
                  <p className="text-xs text-gray-400">{user.email || 'landlord@example.com'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className={`py-4 ${collapsed ? 'hidden' : 'block'} lg:block`}>
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                        isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                      }`
                    }
                  >
                    <div
                      className={`mr-3 transition-all ${
                        collapsed ? 'ml-2' : 'ml-0' // Add margin-left when collapsed
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-left w-full px-4 py-3 hover:bg-red-700 text-red-400 hover:text-white transition-colors"
                >
                  <div
                    className={`mr-3 transition-all ${
                      collapsed ? 'ml-2' : 'ml-0' // Add margin-left when collapsed
                    }`}
                  >
                    <FaSignOutAlt size={20} />
                  </div>
                  {!collapsed && <span>Logout</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default LandlordSideNav;