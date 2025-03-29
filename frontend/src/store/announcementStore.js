import { create } from 'zustand';
import axios from 'axios';

// Define base URLs once at the top of the file
const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
const API_URL = `${BASE_URL}/api/posts`;

// Set default axios configs
axios.defaults.withCredentials = true;

// Utility function to process image paths
const processImagePath = (path) => {
  if (!path || path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  currentAnnouncement: null,
  loading: false,
  error: null,
  message: null,

  // Get all announcements (for landlords)
  getAnnouncements: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      
      // Process image paths using the utility function
      const processedAnnouncements = response.data.data.map(announcement => ({
        ...announcement,
        image_path: processImagePath(announcement.image_path)
      }));
      
      set({ 
        announcements: processedAnnouncements, 
        loading: false 
      });
      return processedAnnouncements;
    } catch (error) {
      // Handle unauthorized error (possible token expiration)
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.' 
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error fetching announcements' 
        });
      }
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  // Get announcements for the logged-in tenant
  getTenantAnnouncements: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/announcements`);
      
      // Process image paths using the utility function
      const processedAnnouncements = response.data.data.map(announcement => ({
        ...announcement,
        image_path: processImagePath(announcement.image_path)
      }));
      
      set({ 
        announcements: processedAnnouncements, 
        loading: false 
      });
      return processedAnnouncements;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.' 
        });
      } else if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'Only tenants can access landlord announcements.' 
        });
      } else if (error.response?.status === 404) {
        // If tenant has no apartment assigned
        set({ 
          loading: false,
          announcements: [],
          error: "You don't have any assigned apartment yet."
        });
        return [];
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error fetching landlord announcements' 
        });
      }
      console.error('Error fetching tenant announcements:', error);
      throw error;
    }
  },

  // Get a single announcement by ID
  getAnnouncementById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      // Process using the utility function
      const announcement = {
        ...response.data.data,
        image_path: processImagePath(response.data.data?.image_path)
      };
      
      set({ 
        currentAnnouncement: announcement, 
        loading: false 
      });
      return announcement;
    } catch (error) {
      // Handle unauthorized error
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.' 
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error fetching announcement' 
        });
      }
      console.error('Error fetching announcement:', error);
      throw error;
    }
  },

  // Create a new announcement
  createAnnouncement: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Ensure we're using credentials with the request
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const newAnnouncements = [...get().announcements, response.data.data];
      
      set({ 
        announcements: newAnnouncements,
        loading: false,
        message: 'Announcement created successfully!'
      });
      
      return response.data.data;
    } catch (error) {
      // Provide more specific error messages for auth issues
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to create announcements. Please ensure you are logged in as a landlord.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error creating announcement' 
        });
      }
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update an existing announcement
  updateAnnouncement: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const updatedAnnouncements = get().announcements.map(announcement => 
        announcement._id === id ? response.data.data : announcement
      );
      
      set({ 
        announcements: updatedAnnouncements,
        currentAnnouncement: response.data.data,
        loading: false,
        message: 'Announcement updated successfully!'
      });
      
      return response.data.data;
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to update this announcement.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error updating announcement' 
        });
      }
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete an announcement
  deleteAnnouncement: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });
      
      const filteredAnnouncements = get().announcements.filter(
        announcement => announcement._id !== id
      );
      
      set({ 
        announcements: filteredAnnouncements,
        loading: false,
        message: 'Announcement deleted successfully!'
      });
      
      return true;
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to delete this announcement.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error deleting announcement' 
        });
      }
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Set current announcement (for editing)
  setCurrentAnnouncement: (announcement) => {
    set({ currentAnnouncement: announcement });
  },

  // Clear current announcement
  clearCurrentAnnouncement: () => {
    set({ currentAnnouncement: null });
  },

  // Clear error or success message
  clearMessage: () => {
    set({ error: null, message: null });
  }
}));