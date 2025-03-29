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
  FaBars
} from 'react-icons/fa';

const LandlordSideNav = () => {
  const [collapsed, setCollapsed] = useState(false);
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
      path: '/tenants',
      name: 'Tenants',
      icon: <FaUsers size={20} />
    },
    {
      path: '/apartments',
      name: 'Apartments',
      icon: <FaDoorOpen size={20} />
    },
    {
      path: '/announcements',
      name: 'Announcements',
      icon: <FaBullhorn size={20} />
    },
    {
      path: '/concerns',
      name: 'Concerns',
      icon: <FaEnvelope size={20} />
    },
    {
      path: '/payments',
      name: 'Payments',
      icon: <FaMoneyBillWave size={20} />
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: <FaCog size={20} />
    }
  ];

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-40 shadow-xl`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src="/image/logo.png" alt="Logo" className="w-10 h-10" />
            <span className="text-xl font-bold">RentEase</span>
          </div>
        )}
        <button
          className={`p-2 rounded-md hover:bg-gray-700 ${collapsed ? 'mx-auto' : ''}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars size={20} />
        </button>
      </div>

      {!collapsed && user && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
              {user.name ? user.name[0].toUpperCase() : 'L'}
            </div>
            <div>
              <p className="font-semibold">{user.name || 'Landlord'}</p>
              <p className="text-sm text-gray-400">{user.email || 'landlord@example.com'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="py-4">
        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${
                      collapsed ? 'justify-center' : 'px-4'
                    } py-3 hover:bg-gray-800 transition-colors ${
                      isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                    }`
                  }
                >
                  <div className={collapsed ? 'mx-auto' : 'mr-3'}>{item.icon}</div>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center text-left w-full ${
                  collapsed ? 'justify-center' : 'px-4'
                } py-3 hover:bg-red-700 text-red-400 hover:text-white transition-colors`}
              >
                <div className={collapsed ? 'mx-auto' : 'mr-3'}>
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