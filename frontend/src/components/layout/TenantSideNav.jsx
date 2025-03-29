import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  FaHome,
  FaClipboardList,
  FaFileContract,
  FaBullhorn,
  FaHistory,
  FaEnvelope,
  FaSignOutAlt,
  FaChevronRight,
  FaChevronLeft,
  FaSearch
} from 'react-icons/fa';

const TenantSideNav = ({ onToggle, onModalOpen }) => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed);
  };

  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <FaHome size={20} />,
      modal: false,
      path: '/tenant/dashboard'  // Changed from '/tenant-dashboard' to match App.jsx route
    },
    {
      id: 'browseApartments',
      name: 'Browse Apartments',
      icon: <FaSearch size={20} />,
      modal: true
    },
    {
      id: 'applications',
      name: 'My Applications',
      icon: <FaClipboardList size={20} />,
      modal: true
    },
    {
      id: 'lease',
      name: 'Lease Agreement',
      icon: <FaFileContract size={20} />,
      modal: true
    },
    {
      id: 'announcements',
      name: 'Announcements',
      icon: <FaBullhorn size={20} />,
      modal: true,
    },
    {
      id: 'paymentHistory', // Changed from 'payments'
      name: 'Payment History',
      icon: <FaHistory size={20} />,
      modal: true
    },
    {
      id: 'inquiries',
      name: 'Inquiries',
      icon: <FaEnvelope size={20} />,
      modal: true
    }
  ];

  const handleNavigation = (item) => {
    if (item.modal) {
      onModalOpen(item.id);
    } else if (item.path) {
      // Add replace: true to prevent navigation stack issues
      navigate(item.path, { replace: true });
    }
  };

  return (
    <div
      className={`${
        collapsed ? '-left-14 lg:left-0' : 'left-0'
      } ${
        collapsed ? 'w-16' : 'w-64'
      } bg-gray-900 text-white h-screen fixed top-0 transition-all duration-300 z-40 shadow-xl`}
    >
      {/* Toggle Button */}
      <button
        className={`absolute top-4 ${
          collapsed ? 'right-[-17px]' : '-right-4'
        } bg-gray-900 text-white p-2 rounded-full shadow-md`}
        onClick={toggleSidebar}
      >
        {collapsed ? <FaChevronRight size={20} /> : <FaChevronLeft size={20} />}
      </button>

      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img 
            src="/image/Logo.png" 
            alt="Logo" 
            className={`${collapsed ? 'w-10 h-12' : 'w-14 h-16'}`}
          />
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
                className="w-12 h-12 rounded-full border-2 border-gray-700"
              />
            ) : (
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                {user.name ? user.name[0].toUpperCase() : 'T'}
              </div>
            )}
            {!collapsed && (
              <div>
                <p className="font-semibold">{user.name || 'Tenant'}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="mt-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.modal ? (
                <button
                  onClick={() => handleNavigation(item)}
                  className={`flex items-center px-4 py-3 w-full hover:bg-gray-800 transition-colors ${
                    location.hash === `#${item.id}` ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="mr-3">{item.icon}</div>
                  {!collapsed && <span>{item.name}</span>}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                      isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                    }`
                  }
                >
                  <div className="mr-3">{item.icon}</div>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              )}
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center text-left w-full px-4 py-3 hover:bg-red-700 text-red-400 hover:text-white transition-colors"
            >
              <div className="mr-3">
                <FaSignOutAlt size={20} />
              </div>
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default TenantSideNav;