import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaFileContract,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSearch,
  FaEnvelope  // Add FaEnvelope icon
} from 'react-icons/fa';

const TenantSideNav = ({ onToggle, onModalOpen }) => {
  // Initialize collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('tenant-sidebar-collapsed');
    return savedState === null ? false : JSON.parse(savedState);
  });

  // For mobile view
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  // Set active tab based on location
  useEffect(() => {
    if (location.pathname.includes('/tenant/dashboard')) {
      setActiveTab('dashboard');
    } else if (location.pathname.includes('/tenant/browse-apartments')) {
      setActiveTab('browseApartments');
    } else if (location.hash) {
      setActiveTab(location.hash.substring(1));
    }
  }, [location]);

  // Sync state with parent component on mount
  useEffect(() => {
    if (onToggle) onToggle(collapsed);
  }, [collapsed, onToggle]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    // Save to localStorage
    localStorage.setItem('tenant-sidebar-collapsed', JSON.stringify(newState));
    if (onToggle) onToggle(newState);
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
    setCollapsed(false);
    if (onToggle) onToggle(false);
  };

  const isExpanded = !collapsed;

  // Updated nav items - changed browseApartments to use path instead of modal
  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <FaHome size={20} />,
      modal: false,
      path: '/tenant/dashboard'
    },
    {
      id: 'browseApartments',
      name: 'Browse Apartments',
      icon: <FaSearch size={20} />,
      modal: false,
      path: '/tenant/browse-apartments'
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <FaEnvelope size={20} />,
      modal: false,
      path: '/tenant/messages'
    },
    {
      id: 'lease',
      name: 'Lease Agreement',
      icon: <FaFileContract size={20} />,
      modal: true
    }
  ];

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    if (item.modal) {
      onModalOpen(item.id);
    } else if (item.path) {
      navigate(item.path, { replace: true });
    }
  };

  const sidebarVariants = {
    expanded: {
      width: "256px",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      width: "80px",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed z-50 top-4 left-4 bg-blue-900 text-white p-3 rounded-full lg:hidden shadow-md hover:bg-blue-800 transition-all duration-300"
        onClick={toggleSidebarVisibility}
        aria-label={isSidebarVisible ? "Close navigation" : "Open navigation"}
      >
        {isSidebarVisible ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebarVisibility}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isSidebarVisible || !collapsed ? "expanded" : "collapsed"}
        className={`fixed top-0 left-0 h-screen z-50 bg-gray-900 border-r border-gray-800 shadow-md transition-transform duration-300 ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="focus:outline-none transition-transform hover:scale-110 hidden lg:block"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <div className="p-2 bg-blue-900 rounded-lg shadow-md hover:bg-blue-800 transition-all duration-200">
                <FaHome className="text-white" />
              </div>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center"
                >
                  <h1 className="text-lg font-bold text-white">
                    RentFlow
                  </h1>
                  <span className="ml-1 text-xs bg-blue-800 text-white px-1 rounded">Tenant</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile close button */}
          {isSidebarVisible && (
            <button 
              onClick={toggleSidebarVisibility} 
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          )}
        </div>

        {/* Simplified Menu Container */}
        <div className="overflow-y-auto p-3 h-[calc(100vh-160px)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center py-3 px-3 rounded-lg mb-3 transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-blue-900 text-white shadow-md" // Active state
                  : "text-gray-300 hover:bg-gray-800" // Inactive state
              }`}
            >
              <div className={`mr-3 transition-transform duration-200 ${activeTab === item.id ? 'transform scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Footer with User Info */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
          <AnimatePresence>
            {isExpanded && user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center mb-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-blue-700 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold shadow-md">
                    {user.name ? user.name[0].toUpperCase() : 'T'}
                  </div>
                )}
                <div className="ml-3">
                  <p className="font-medium text-white">{user.name || 'Tenant'}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[130px]">{user.email}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isExpanded ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-2.5 text-white rounded-lg bg-red-700 hover:bg-red-800 transition-all duration-200"
            >
              <FaSignOutAlt className="mr-2" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-3 text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default TenantSideNav;