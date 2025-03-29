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
  FaChevronLeft
} from 'react-icons/fa';

const LandlordSideNav = () => {
  const [collapsed, setCollapsed] = useState(true); // Sidebar starts collapsed
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FaHome size={20} />
    },
    {
      path: '/landlord/tenants', // Update the path to match the route in App.jsx
      name: 'Tenants',
      icon: <FaUsers size={20} />
    },
    
    {
      path: '/landlord/announcements', // Update the path to match the route in App.jsx
      name: 'Announcements',
      icon: <FaBullhorn size={20} />
    },
    {
      path: '/maintenance', // Update the path to match the route in App.jsx
      name: 'Maintenance',
      icon: <FaEnvelope size={20} />
    },
    {
      path: '/archive', // Update the path to match the route in App.jsx
      name: 'Archive',
      icon: <FaMoneyBillWave size={20} />
    },
    
  ];

  return (
    <div
  className={`${
    collapsed ? '-left-14 lg:left-0' : 'left-0'
  } ${
    collapsed ? 'w-16' : 'w-64'
  } bg-gray-900 text-white h-screen fixed top-0 transition-all duration-300 z-40 shadow-xl`}
>
  {/* Toggle Button (Mobile & Desktop) */}
  <button
    className={`absolute top-4 ${
      collapsed ? 'right-[-17px]' : '-right-4'
    } bg-gray-900 text-white p-2 rounded-full shadow-md`}
    onClick={() => setCollapsed(!collapsed)}
  >
    {collapsed ? <FaChevronRight size={20} /> : <FaChevronLeft size={20} />}
  </button>

      {/* Sidebar Header */}
      <div className={`flex justify-between items-center p-4 border-b border-gray-700 ${collapsed ? 'hidden' : 'block'} lg:flex`}>
        <div className="flex items-center gap-3">
          <img src="/image/logo.png" alt="Logo" className="w-10 h-10" />
          {!collapsed && <span className="text-xl font-bold hidden lg:block">RentFlow</span>}
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-gray-700 ${collapsed ? 'hidden' : 'block'} lg:block`}>
        {user && (
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
              {user.name ? user.name[0].toUpperCase() : 'L'}
            </div>
            {!collapsed && (
              <div>
                <p className="font-semibold">{user.name || 'Landlord'}</p>
                <p className="text-sm text-gray-400">{user.email || 'landlord@example.com'}</p>
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
                  <div className="mr-3">{item.icon}</div>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
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
    </div>
  );
};

export default LandlordSideNav;