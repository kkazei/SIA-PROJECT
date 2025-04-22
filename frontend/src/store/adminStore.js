import { create } from "zustand";
import axios from "axios";

// Define base URL
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";
const API_URL = `${BASE_URL}/api/admin`;

// Set axios to include credentials in requests
axios.defaults.withCredentials = true;

export const useAdminStore = create((set, get) => ({
  // State
  users: [],
  selectedUser: null,
  apartments: [],
  systemStats: null,
  isLoading: false,
  error: null,
  success: null,
  announcements: [],

  // Fetch system statistics
  fetchSystemStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/stats`, { withCredentials: true });
      
      set({ 
        systemStats: response.data.data,
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching system stats:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch system statistics", 
        isLoading: false 
      });
      return null;
    }
  },

  // Fetch all users
  fetchUsers: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      let queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.role) queryParams.append("role", filters.role);
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.order) queryParams.append("order", filters.order);
      if (filters.search) queryParams.append("search", filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}/users${queryString}`, { withCredentials: true });
      
      set({ 
        users: response.data.data, 
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch users", 
        isLoading: false 
      });
      return null;
    }
  },

  // Fetch user by ID
  getUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/users/${id}`, { withCredentials: true });
      
      set({ 
        selectedUser: response.data.data, 
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch user details", 
        isLoading: false 
      });
      return null;
    }
  },

  // Create new user
  createUser: async (userData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axios.post(`${API_URL}/users`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      set(state => ({ 
        users: [...state.users, response.data.data], 
        isLoading: false,
        success: "User created successfully" 
      }));
      
      return response.data.data;
    } catch (error) {
      console.error("Error creating user:", error);
      set({ 
        error: error.response?.data?.message || "Failed to create user", 
        isLoading: false 
      });
      return null;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      set(state => ({ 
        users: state.users.map(user => 
          user._id === id ? response.data.data : user
        ),
        selectedUser: response.data.data,
        isLoading: false,
        success: "User updated successfully" 
      }));
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to update user", 
        isLoading: false 
      });
      return null;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
      
      set(state => ({ 
        users: state.users.filter(user => user._id !== id),
        isLoading: false,
        success: "User deleted successfully" 
      }));
      
      return true;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to delete user", 
        isLoading: false 
      });
      return false;
    }
  },

  // Verify user
  verifyUser: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axios.patch(`${API_URL}/users/${id}/verify`, {}, {
        withCredentials: true
      });
      
      set(state => ({ 
        users: state.users.map(user => 
          user._id === id ? { ...user, isVerified: true } : user
        ),
        selectedUser: state.selectedUser && state.selectedUser._id === id ? 
          { ...state.selectedUser, isVerified: true } : state.selectedUser,
        isLoading: false,
        success: "User verified successfully" 
      }));
      
      return response.data.data;
    } catch (error) {
      console.error(`Error verifying user with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to verify user", 
        isLoading: false 
      });
      return null;
    }
  },

  // Reset user password
  resetUserPassword: async (userId, newPassword) => {
    set({ isLoading: true, error: null, success: null });
    try {
      // Add validation
      if (!userId) {
        throw new Error(`Cannot reset password: Invalid user ID`);
      }
      
      if (!newPassword || newPassword.trim() === '') {
        throw new Error('Password cannot be empty');
      }
      
      console.log(`Attempting to reset password for user ${userId}`);
      
      // Make sure we're sending the password in the format the backend expects
      const response = await axios.post(
        `${API_URL}/users/${userId}/reset-password`,
        { newPassword }, // Changed from { password: newPassword } to { newPassword }
        { withCredentials: true }
      );
      
      set({ 
        isLoading: false, 
        success: "Password reset successfully" 
      });
      return true;
    } catch (error) {
      // Log the full error to see what's happening
      console.error(`Error resetting password for user with ID ${userId}:`, error);
      console.error('Response data:', error.response?.data);
      
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || `Failed to reset password: ${error.message}`
      });
      return false;
    }
  },

  // Fetch all apartments (admin view)
  fetchApartments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      let queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.order) queryParams.append("order", filters.order);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}/apartments${queryString}`, { withCredentials: true });
      
      set({ 
        apartments: response.data.data, 
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching apartments:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch apartments", 
        isLoading: false 
      });
      return null;
    }
  },

  // Export user data to CSV
  exportUsersToCSV: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // First get the filtered user data
      let queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.role) queryParams.append("role", filters.role);
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.order) queryParams.append("order", filters.order);
      if (filters.search) queryParams.append("search", filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}/users${queryString}`, { withCredentials: true });
      
      // Convert user data to CSV format
      const users = response.data.data;
      if (!users || users.length === 0) {
        throw new Error("No users found to export");
      }
      
      // Define fields to include in CSV
      const fields = [
        '_id', 'name', 'email', 'phone', 'role', 
        'isVerified', 'createdAt', 'lastLogin'
      ];
      
      // Create CSV header row
      let csv = fields.join(',') + '\n';
      
      // Add user data rows
      users.forEach(user => {
        const row = fields.map(field => {
          // Format special fields
          if (field === 'createdAt' || field === 'lastLogin') {
            return user[field] ? `"${new Date(user[field]).toLocaleDateString()}"` : '""';
          }
          // Escape and quote string values
          if (typeof user[field] === 'string') {
            return `"${user[field].replace(/"/g, '""')}"`;
          }
          return user[field] !== undefined ? user[field] : '';
        }).join(',');
        csv += row + '\n';
      });
      
      // Create a download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'users-export.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Error exporting users to CSV:", error);
      set({ 
        error: error.message || "Failed to export users to CSV", 
        isLoading: false 
      });
      return false;
    }
  },

  // Fetch all announcements
  fetchAnnouncements: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      let queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.targetAudience) queryParams.append("targetAudience", filters.targetAudience);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.order) queryParams.append("order", filters.order);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await axios.get(`${API_URL}/announcements${queryString}`, { withCredentials: true });
      
      set({ 
        announcements: response.data.data, 
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching announcements:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch announcements", 
        isLoading: false 
      });
      return null;
    }
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/announcements/${id}`, { withCredentials: true });
      
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching announcement with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch announcement details", 
        isLoading: false 
      });
      return null;
    }
  },

  // Create new announcement
  createAnnouncement: async (announcementData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axios.post(`${API_URL}/announcements`, announcementData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      set(state => ({ 
        announcements: [...state.announcements, response.data.data], 
        isLoading: false,
        success: "Announcement created successfully" 
      }));
      
      return response.data.data;
    } catch (error) {
      console.error("Error creating announcement:", error);
      set({ 
        error: error.response?.data?.message || "Failed to create announcement", 
        isLoading: false 
      });
      return null;
    }
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axios.put(`${API_URL}/announcements/${id}`, announcementData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      set(state => ({ 
        announcements: state.announcements.map(announcement => 
          announcement._id === id ? response.data.data : announcement
        ),
        isLoading: false,
        success: "Announcement updated successfully" 
      }));
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating announcement with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to update announcement", 
        isLoading: false 
      });
      return null;
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await axios.delete(`${API_URL}/announcements/${id}`, { withCredentials: true });
      
      set(state => ({ 
        announcements: state.announcements.filter(announcement => announcement._id !== id),
        isLoading: false,
        success: "Announcement deleted successfully" 
      }));
      
      return true;
    } catch (error) {
      console.error(`Error deleting announcement with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to delete announcement", 
        isLoading: false 
      });
      return false;
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),
  
  // Clear success message
  clearSuccess: () => set({ success: null }),
  
  // Clear selected user
  clearSelectedUser: () => set({ selectedUser: null }),

  // Reset admin store state
  resetStore: () => set({
    users: [],
    selectedUser: null,
    apartments: [],
    systemStats: null,
    isLoading: false,
    error: null,
    success: null,
    announcements: []
  }),

  // Add a utility method to set errors manually
  setError: (errorMessage) => {
    set({ error: errorMessage });
  }
}));