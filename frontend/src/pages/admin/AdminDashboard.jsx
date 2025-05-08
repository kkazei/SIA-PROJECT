import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaUsers, FaBuilding, FaBullhorn, FaSignOutAlt, 
  FaBars, FaTimes, FaSpinner, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';

// Import smaller component files
import DashboardStats from './components/DashboardStats';
import UsersManagement from './components/UsersManagement';
import ApartmentsManagement from './components/ApartmentsManagement';
import AnnouncementsManagement from './components/AnnouncementsManagement';
import UserFormModal from './components/modals/UserFormModal';
import DeleteConfirmationModal from './components/modals/DeleteConfirmationModal';
import ResetPasswordModal from './components/modals/ResetPasswordModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    systemStats, fetchSystemStats,
    users, fetchUsers,
    selectedUser, getUserById, clearSelectedUser,
    apartments, fetchApartments, 
    announcements, fetchAnnouncements,
    createAnnouncement, updateAnnouncement, deleteAnnouncement,
    isLoading, error, success,
    clearError, clearSuccess
  } = useAdminStore();

  // Local state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
    phone: ''
  });
  const [userIdToReset, setUserIdToReset] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Filter states
  const [userFilters, setUserFilters] = useState({
    role: '',
    search: '',
    sort: 'createdAt',
    order: 'desc'
  });

  const [apartmentFilters, setApartmentFilters] = useState({
    status: '',
    sort: 'createdAt',
    order: 'desc'
  });

  const [announcementFilters, setAnnouncementFilters] = useState({
    sort: 'createdAt',
    order: 'desc'
  });

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Load initial data when component mounts
  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchSystemStats();
  }, [user, navigate, fetchSystemStats]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchSystemStats();
    } else if (activeTab === 'users') {
      fetchUsers(userFilters);
    } else if (activeTab === 'apartments') {
      fetchApartments(apartmentFilters);
    } else if (activeTab === 'announcements') {
      fetchAnnouncements(announcementFilters);
    }
  }, [
    activeTab, 
    userFilters, 
    apartmentFilters, 
    announcementFilters, 
    fetchSystemStats, 
    fetchUsers, 
    fetchApartments, 
    fetchAnnouncements
  ]);

  // Close mobile menu when changing tabs
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [activeTab]);

  // Clear error and success messages on unmount
  useEffect(() => {
    return () => {
      clearError();
      clearSuccess();
    };
  }, [clearError, clearSuccess]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  // Reset user form to default values
  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'tenant',
      phone: ''
    });
    clearSelectedUser();
  };

  // Open user form for editing
  const handleEditUser = async (userId) => {
    const user = await getUserById(userId);
    if (user) {
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password
        role: user.role || 'tenant',
        phone: user.phone || ''
      });
      setShowUserModal(true);
    }
  };

  // Open deletion confirmation modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  // Handle password reset
  const handleResetPassword = (userId) => {
    setUserIdToReset(userId);
    getUserById(userId);
    setShowResetPasswordModal(true);
  };

  // Handle logout with proper error handling
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Sidebar variants for animation
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

  const isExpanded = !collapsed;

  // Navigation items
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaHome size={20} /> },
    { id: 'users', name: 'Users', icon: <FaUsers size={20} /> },
    { id: 'apartments', name: 'Apartments', icon: <FaBuilding size={20} /> },
    { id: 'announcements', name: 'Announcements', icon: <FaBullhorn size={20} /> }
  ];

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-white min-h-screen">
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

      {/* Admin Sidebar */}
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
                  <span className="ml-1 text-xs bg-purple-800 text-white px-1 rounded">Admin</span>
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

        {/* Navigation Menu */}
        <div className="overflow-y-auto p-3 h-[calc(100vh-160px)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center py-3 px-3 rounded-lg mb-3 transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-blue-900 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-800"
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
                <div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold shadow-md">
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-white">{user.name || 'Admin'}</p>
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

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`p-4 lg:p-8 w-full transition-all duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Page Header */}
        <div className="mb-6 mt-16 lg:mt-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'dashboard' && 'System overview and statistics'}
            {activeTab === 'users' && 'Manage system users'}
            {activeTab === 'apartments' && 'View all property listings'}
            {activeTab === 'announcements' && 'Manage system announcements'}
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md flex items-center"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <FaExclamationCircle className="text-red-600 text-lg" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="flex-shrink-0 ml-4 text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md flex items-center"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <FaCheckCircle className="text-green-600 text-lg" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button 
                onClick={clearSuccess}
                className="flex-shrink-0 ml-4 text-green-500 hover:text-green-700"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-blue-600 text-4xl mb-2" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : (
          /* Content based on active tab */
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && systemStats && (
              <DashboardStats systemStats={systemStats} />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <UsersManagement 
                users={users}
                userFilters={userFilters}
                setUserFilters={setUserFilters}
                onAddUser={() => {
                  resetUserForm();
                  setShowUserModal(true);
                }}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteClick}
                onResetPassword={handleResetPassword}
                exportUsersToCSV={() => useAdminStore.getState().exportUsersToCSV(userFilters)}
                verifyUser={async (id) => {
                  const success = await useAdminStore.getState().verifyUser(id);
                  if (success) {
                    fetchUsers(userFilters);
                  }
                  return success;
                }}
              />
            )}

            {/* Apartments Tab */}
            {activeTab === 'apartments' && (
              <ApartmentsManagement 
                apartments={apartments}
                apartmentFilters={apartmentFilters}
                setApartmentFilters={setApartmentFilters}
              />
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <AnnouncementsManagement 
                announcements={announcements}
                announcementFilters={announcementFilters}
                setAnnouncementFilters={setAnnouncementFilters}
                onCreateAnnouncement={async (formData) => {
                  const result = await createAnnouncement(formData);
                  if (result) {
                    fetchAnnouncements(announcementFilters);
                  }
                  return result;
                }}
                onUpdateAnnouncement={async (id, formData) => {
                  const result = await updateAnnouncement(id, formData);
                  if (result) {
                    fetchAnnouncements(announcementFilters);
                  }
                  return result;
                }}
                onDeleteAnnouncement={async (id) => {
                  const result = await deleteAnnouncement(id);
                  if (result) {
                    fetchAnnouncements(announcementFilters);
                  }
                  return result;
                }}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Modals */}
      {showUserModal && (
        <UserFormModal
          userForm={userForm}
          setUserForm={setUserForm}
          selectedUser={selectedUser}
          onSubmit={async (e) => {
            e.preventDefault();
            const { createUser, updateUser } = useAdminStore.getState();
            
            if (selectedUser) {
              const updateData = { ...userForm };
              if (!updateData.password) delete updateData.password;
              const success = await updateUser(selectedUser._id, updateData);
              if (success) {
                resetUserForm();
                setShowUserModal(false);
                fetchUsers(userFilters);
              }
            } else {
              const success = await createUser(userForm);
              if (success) {
                resetUserForm();
                setShowUserModal(false);
                fetchUsers(userFilters);
              }
            }
          }}
          onClose={() => {
            resetUserForm();
            setShowUserModal(false);
          }}
        />
      )}

      {showDeleteConfirmation && userToDelete && (
        <DeleteConfirmationModal
          user={userToDelete}
          onConfirm={async () => {
            const success = await useAdminStore.getState().deleteUser(userToDelete._id);
            if (success) {
              setShowDeleteConfirmation(false);
              setUserToDelete(null);
              fetchUsers(userFilters);
            }
          }}
          onCancel={() => {
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
          }}
        />
      )}

      {showResetPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          password={newPassword}
          setPassword={setNewPassword}
          onConfirm={async () => {
            const userId = userIdToReset || selectedUser?._id;
            
            if (userId && newPassword) {
              const success = await useAdminStore.getState().resetUserPassword(userId, newPassword);
              if (success) {
                setShowResetPasswordModal(false);
                setNewPassword('');
                setUserIdToReset(null);
                clearSelectedUser();
              }
            } else {
              useAdminStore.getState().setError("Cannot reset password: No user ID available");
            }
          }}
          onCancel={() => {
            setShowResetPasswordModal(false);
            setNewPassword('');
            setUserIdToReset(null);
            clearSelectedUser();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;