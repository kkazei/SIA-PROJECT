import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api/posts' : '/api/posts';

// Set default axios configs
axios.defaults.withCredentials = true;

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  currentAnnouncement: null,
  loading: false,
  error: null,
  message: null,

  // Get all announcements
  getAnnouncements: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      set({ 
        announcements: response.data.data, 
        loading: false 
      });
      return response.data.data;
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

  // Get a single announcement by ID
  getAnnouncementById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ 
        currentAnnouncement: response.data.data, 
        loading: false 
      });
      return response.data.data;
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