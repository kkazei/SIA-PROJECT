import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  FaHome,
  FaUsers,
  FaBullhorn,
  FaSignOutAlt,
  FaClipboardList,
  FaHammer,
  FaMailBulk,
  FaComments // Add this import for the messaging icon
} from 'react-icons/fa';

const LandlordSideNav = ({ onToggle }) => {
  // Change this to false for expanded by default on desktop
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  // For mobile visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  // Set initial state based on screen size
  useEffect(() => {
    // Only collapse by default on small screens
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [location]);

  // Notify parent component about sidebar state changes
  useEffect(() => {
    if (onToggle) {
      // For desktop, consider it expanded if either manually expanded or hovering
      const isEffectivelyExpanded = !collapsed || (isHovering && window.innerWidth >= 1024);
      onToggle(!isEffectivelyExpanded);
    }
  }, [collapsed, isHovering, onToggle]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
  };

  const toggleSidebarVisibility = () => {
    const newVisibilityState = !isSidebarVisible;
    setIsSidebarVisible(newVisibilityState);
    // Expand sidebar when opened in mobile view
    if (newVisibilityState) setCollapsed(false);
  };
  
  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) { // Only apply hover effect on desktop
      setIsHovering(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) { // Only apply hover effect on desktop
      setIsHovering(false);
    }
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
    // Add the messaging link here
    {
      path: '/messages',
      name: 'Messages',
      icon: <FaComments size={20} />
    },
    {
      path: '/archive',
      name: 'Archive',
      icon: <FaMailBulk size={20} />
    },
  ];

  // Determine if sidebar should be expanded (either manually or by hover on desktop)
  const isExpanded = !collapsed || (isHovering && window.innerWidth >= 1024);

  return (
    <>
      {/* Enhanced Toggle Button with Dynamic Movement Animation */}
      <button
        className={`
          fixed z-50 lg:hidden
          flex flex-col justify-center items-center
          w-12 h-12 bg-gray-900 rounded-full shadow-lg
          transition-all duration-700 ease-in-out
          ${isSidebarVisible 
            ? 'top-4 right-4 transform translate-x-0 rotate-90' 
            : 'top-4 left-4 transform translate-x-0 rotate-0'
          }
          hover:scale-110 hover:bg-gray-800
        `}
        onClick={toggleSidebarVisibility}
        aria-label={isSidebarVisible ? "Close navigation" : "Open navigation"}
        style={{
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Improved animated hamburger icon that transforms to X */}
        <span className={`
          block bg-white w-6 h-0.5 rounded-full 
          transform transition-all duration-500 ease-in-out
          ${isSidebarVisible ? 'rotate-45 translate-y-1.5 w-5' : 'mb-1.5 rotate-0 w-6'}
        `}></span>
        <span className={`
          block bg-white w-6 h-0.5 rounded-full 
          transition-all duration-500 ease-in-out
          ${isSidebarVisible ? 'opacity-0 scale-0 w-1' : 'opacity-100 scale-100 w-6'}
        `}></span>
        <span className={`
          block bg-white w-6 h-0.5 rounded-full 
          transform transition-all duration-500 ease-in-out
          ${isSidebarVisible ? '-rotate-45 -translate-y-1.5 w-5' : 'mt-1.5 rotate-0 w-6'}
        `}></span>
      </button>

      {/* Overlay for mobile - closes sidebar when clicking outside */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebarVisibility}
        ></div>
      )}

      {/* Main Sidebar */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-screen z-40
          bg-gray-900 text-white shadow-xl
          transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        {/* Sidebar Header - integrated close functionality for mobile */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo button that also toggles sidebar on desktop */}
            <button
              onClick={window.innerWidth >= 1024 ? toggleSidebar : toggleSidebarVisibility}
              className="focus:outline-none transition-transform hover:scale-105"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <img 
                src="/image/Logo.png" 
                alt="Logo" 
                className={`transition-all duration-300 ${isExpanded ? 'w-12 h-12' : 'w-10 h-10'}`}
              />
            </button>
            
            {/* Brand name - smoothly fades and scales */}
            <div 
              className={`
                overflow-hidden transition-all duration-300 ease-in-out 
                ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
              `}
            >
              <span className="text-xl font-bold whitespace-nowrap">RentFlow</span>
            </div>
          </div>
        </div>

        {/* User Profile - smoothly collapses */}
        <div 
          className={`
            border-b border-gray-700 transition-all duration-300 ease-in-out
            ${isExpanded ? 'h-auto py-4 px-4' : 'h-0 py-0 overflow-hidden'}
          `}
        >
          {user && (
            <div className="flex items-center space-x-3 transition-opacity duration-300">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'L'}
                </div>
              )}
              <div>
                <p className="font-semibold">{user.name || 'Landlord'}</p>
                <p className="text-xs text-gray-400">{user.email || 'landlord@example.com'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="py-4 transition-all duration-300">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center py-3 px-4 hover:bg-gray-800 
                    transition-all duration-200 ease-in-out
                    ${isActive ? 'bg-gray-800 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                  `}
                  onClick={() => {
                    // Close sidebar on mobile when a link is clicked
                    if (window.innerWidth < 1024) {
                      setIsSidebarVisible(false);
                    }
                  }}
                >
                  <div className={`
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'mr-3' : 'mx-auto'}
                  `}>
                    {item.icon}
                  </div>
                  <span className={`
                    transition-all duration-300 ease-in-out whitespace-nowrap
                    ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
                  `}>
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
            
            {/* Logout Button */}
            <li className="mt-6">
              <button
                onClick={() => {
                  handleLogout();
                  // Also close the sidebar on mobile
                  if (window.innerWidth < 1024) {
                    setIsSidebarVisible(false);
                  }
                }}
                className={`
                  flex items-center w-full py-3 px-4
                  text-red-400 hover:text-white hover:bg-red-700  
                  transition-all duration-200 ease-in-out
                  border-l-4 border-transparent
                `}
              >
                <div className={`
                  transition-all duration-300 ease-in-out
                  ${isExpanded ? 'mr-3' : 'mx-auto'}
                `}>
                  <FaSignOutAlt size={20} />
                </div>
                <span className={`
                  transition-all duration-300 ease-in-out whitespace-nowrap
                  ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
                `}>
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default LandlordSideNav;