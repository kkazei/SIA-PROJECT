import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { FaSpinner } from 'react-icons/fa';

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
  // Extract logout function from authStore
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

  // Handle announcement operations via store
  const handleCreateAnnouncement = async (formData) => {
    const result = await createAnnouncement(formData);
    if (result) {
      fetchAnnouncements(announcementFilters);
    }
    return result;
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    const result = await updateAnnouncement(id, formData);
    if (result) {
      fetchAnnouncements(announcementFilters);
    }
    return result;
  };

  const handleDeleteAnnouncement = async (id) => {
    const result = await deleteAnnouncement(id);
    if (result) {
      fetchAnnouncements(announcementFilters);
    }
    return result;
  };

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

  // Handle password reset - Store the user ID directly
  const handleResetPassword = (userId) => {
    // Store the ID in state to use directly when confirming
    setUserIdToReset(userId);
    // Also get the user details for display in the modal
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Logged in as <span className="font-semibold text-blue-600">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Success</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'users', 'apartments', 'announcements'].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
          ) : (
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
                      // Refresh the users list after verification
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
                  onCreateAnnouncement={handleCreateAnnouncement}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                />
              )}
            </>
          )}
        </div>
      </main>

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
            // Add debugging to help identify the issue
            console.log("Reset password for user:", {
              userIdToReset,
              selectedUserId: selectedUser?._id,
              newPassword: newPassword ? "Password set" : "No password"
            });
            
            // Try the ID from userIdToReset first, fall back to selectedUser._id if needed
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
              // Show an explicit error if we couldn't get a user ID
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