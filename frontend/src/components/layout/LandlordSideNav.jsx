import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Archive, Bell, Building2, ChevronLeft, ClipboardList, Hammer, Home, LogOut, Menu, MessageSquare, Users, X } from 'lucide-react';

const LandlordSideNav = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsSidebarVisible(false);
  }, [location]);

  useEffect(() => {
    if (onToggle) {
      const isEffectivelyExpanded = !collapsed || (isHovering && window.innerWidth >= 1024);
      onToggle(!isEffectivelyExpanded);
    }
  }, [collapsed, isHovering, onToggle]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setCollapsed((isCollapsed) => !isCollapsed);

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible((isVisible) => {
      if (!isVisible) setCollapsed(false);
      return !isVisible;
    });
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

  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { path: '/dashboard', name: 'Dashboard', icon: Home },
        { path: '/landlord/tenants', name: 'Tenants', icon: Users },
        { path: '/landlord/applications', name: 'Applications', icon: ClipboardList },
      ],
    },
    {
      label: 'Stay in touch',
      items: [
        { path: '/landlord/messages', name: 'Messages', icon: MessageSquare },
        { path: '/landlord/announcements', name: 'Announcements', icon: Bell },
      ],
    },
    {
      label: 'Property care',
      items: [
        { path: '/maintenance', name: 'Maintenance', icon: Hammer },
        { path: '/archive', name: 'Archive', icon: Archive },
      ],
    },
  ];

  // Determine if sidebar should be expanded (either manually or by hover on desktop)
  const isExpanded = !collapsed || (isHovering && window.innerWidth >= 1024);

  return (
    <>
      <button className="landlord-mobile-nav-toggle" onClick={toggleSidebarVisibility} aria-label={isSidebarVisible ? 'Close navigation' : 'Open navigation'} aria-expanded={isSidebarVisible}>
        {isSidebarVisible ? <X size={21} /> : <Menu size={21} />}
      </button>

      {isSidebarVisible && <button className="landlord-nav-overlay" onClick={toggleSidebarVisibility} aria-label="Close navigation" />}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`landlord-nav-shell ${isSidebarVisible ? 'is-mobile-visible' : ''} ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
      >
        <div className="landlord-nav-brand-row">
          <button className="landlord-nav-brand" onClick={window.innerWidth >= 1024 ? toggleSidebar : toggleSidebarVisibility} aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
            <img src="/brand-mark.svg" alt="" />
            <span>RentFlow</span>
          </button>
          {isExpanded && <span className="landlord-nav-role">LANDLORD</span>}
          {isExpanded && <button className="landlord-nav-collapse" onClick={toggleSidebar} aria-label="Collapse sidebar" title="Collapse sidebar"><ChevronLeft size={17} /></button>}
        </div>

        <div className="landlord-nav-profile">
          {user?.avatar ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" /> : <span>{user?.name?.[0]?.toUpperCase() || 'L'}</span>}
          <div className="landlord-nav-profile-copy">
            <strong>{user?.name || 'Landlord'}</strong>
            <small>{user?.email || 'landlord@example.com'}</small>
          </div>
        </div>

        <nav className="landlord-nav-menu" aria-label="Landlord navigation">
          {navGroups.map((group) => (
            <div className="landlord-nav-group" key={group.label}>
              {isExpanded && <p>{group.label}</p>}
              {group.items.map((item) => {
                const Icon = item.icon;
                return <NavLink key={item.path} to={item.path} title={!isExpanded ? item.name : undefined} className={({ isActive }) => `landlord-nav-link ${isActive ? 'is-active' : ''}`} onClick={() => window.innerWidth < 1024 && setIsSidebarVisible(false)}><Icon size={18} strokeWidth={1.9} /><span>{item.name}</span></NavLink>;
              })}
            </div>
          ))}
        </nav>

        <div className="landlord-nav-footer">
          <div className="landlord-nav-context"><Building2 size={15} /><span>Renting, made calmer.</span></div>
          <button className="landlord-nav-logout" onClick={handleLogout} title={!isExpanded ? 'Log out' : undefined}><LogOut size={18} /><span>Log out</span></button>
        </div>
      </aside>
    </>
  );
};

export default LandlordSideNav;