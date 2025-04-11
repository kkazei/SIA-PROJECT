import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaClipboardList,
  FaFileContract,
  FaBullhorn,
  FaHistory,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSearch,
  FaMoneyBillWave
} from 'react-icons/fa';

const TenantSideNav = ({ onToggle, onModalOpen }) => {
  // Initialize collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('tenant-sidebar-collapsed');
    return savedState === null ? true : JSON.parse(savedState);
  });

  // For mobile view
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  // Sync state with parent component on mount
  useEffect(() => {
    if (onToggle) onToggle(collapsed);
  }, [collapsed, onToggle]);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileOpen(false);
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

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

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
      id: 'paymentHistory',
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
      navigate(item.path, { replace: true });
    }
  };

  // Sidebar animation variants
  const sidebarVariants = {
    expanded: { width: 256, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 64, transition: { duration: 0.3, ease: "easeInOut" } },
    mobileOpen: { 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    mobileClosed: { 
      x: "-100%", 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-gray-900 text-white shadow-lg"
          aria-label="Toggle Navigation"
        >
          <motion.div
            initial={false}
            animate={mobileOpen ? "open" : "closed"}
          >
            {mobileOpen ? (
              <FaTimes size={24} />
            ) : (
              <FaBars size={24} />
            )}
          </motion.div>
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        className={`hidden lg:block bg-gray-900 text-white h-screen fixed top-0 left-0 transition-all duration-300 z-40 shadow-xl`}
      >
        {/* Toggle Button with animated icon */}
        <div
          className="absolute top-4 -right-4 bg-gray-900 text-white p-2 rounded-full shadow-md cursor-pointer"
          onClick={toggleSidebar}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
          </motion.div>
        </div>

        {/* Sidebar Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <motion.img 
              src="/image/Logo.png" 
              alt="Logo" 
              className={`${collapsed ? 'w-10 h-12' : 'w-14 h-16'}`}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              whileHover={{ scale: 1.1 }}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  className="text-xl font-bold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  RentFlow
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-gray-700 ${collapsed ? 'hidden' : 'block'} lg:block`}>
          {user && (
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <motion.img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border-2 border-gray-700"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div 
                  className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {user.name ? user.name[0].toUpperCase() : 'T'}
                </motion.div>
              )}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={itemVariants.hidden}
                    animate={itemVariants.visible}
                    exit={itemVariants.hidden}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-semibold">{user.name || 'Tenant'}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
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
                    <motion.div 
                      className="mr-3"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={itemVariants.hidden}
                          animate={itemVariants.visible}
                          exit={itemVariants.hidden}
                          transition={{ duration: 0.3 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
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
                    <motion.div 
                      className="mr-3"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={itemVariants.hidden}
                          animate={itemVariants.visible}
                          exit={itemVariants.hidden}
                          transition={{ duration: 0.3 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center text-left w-full px-4 py-3 hover:bg-red-700 text-red-400 hover:text-white transition-colors"
              >
                <motion.div 
                  className="mr-3"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaSignOutAlt size={20} />
                </motion.div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={itemVariants.hidden}
                      animate={itemVariants.visible}
                      exit={itemVariants.hidden}
                      transition={{ duration: 0.3 }}
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          </ul>
        </nav>
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={mobileOpen ? "mobileOpen" : "mobileClosed"}
        className="fixed top-0 left-0 bg-gray-900 text-white h-screen w-64 z-40 shadow-xl lg:hidden"
      >
        {/* Mobile Sidebar Header */}
        <div className="flex justify-between items-center p-4 mt-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <img src="/image/Logo.png" alt="Logo" className="w-12 h-14" />
            <span className="text-xl font-bold">RentFlow</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
            <FaTimes size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
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
              <div>
                <p className="font-semibold">{user.name || 'Tenant'}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Links */}
        <nav className="mt-4">
          <motion.ul 
            className="space-y-1"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {navItems.map((item) => (
              <motion.li 
                key={item.id}
                variants={{
                  hidden: { x: -20, opacity: 0 },
                  visible: { x: 0, opacity: 1 }
                }}
              >
                {item.modal ? (
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`flex items-center px-4 py-3 w-full hover:bg-gray-800 transition-colors ${
                      location.hash === `#${item.id}` ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="mr-3">{item.icon}</div>
                    <span>{item.name}</span>
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
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </motion.li>
            ))}
            <motion.li
              variants={{
                hidden: { x: -20, opacity: 0 },
                visible: { x: 0, opacity: 1 }
              }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center text-left w-full px-4 py-3 hover:bg-red-700 text-red-400 hover:text-white transition-colors"
              >
                <div className="mr-3">
                  <FaSignOutAlt size={20} />
                </div>
                <span>Logout</span>
              </button>
            </motion.li>
          </motion.ul>
        </nav>
      </motion.div>
    </>
  );
};

export default TenantSideNav;