import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api/posts' : '/api/posts';

export const useAnnouncementStore = create((set) => ({
  announcements: [],
  isLoading: false,
  error: null,
  currentAnnouncement: null,
  success: '',
  
  // Fetch all announcements
  fetchAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      set({ 
        announcements: response.data.data, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch announcements', 
        isLoading: false 
      });
    }
  },
  
  // Create a new announcement
  createAnnouncement: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set((state) => ({ 
        announcements: [response.data.data, ...state.announcements],
        isLoading: false,
        success: 'Announcement created successfully'
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => set({ success: '' }), 3000);
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create announcement', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update an announcement
  updateAnnouncement: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set((state) => ({
        announcements: state.announcements.map(announcement => 
          announcement._id === id ? response.data.data : announcement
        ),
        isLoading: false,
        success: 'Announcement updated successfully'
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => set({ success: '' }), 3000);
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update announcement', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Delete an announcement
  deleteAnnouncement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      
      set((state) => ({
        announcements: state.announcements.filter(announcement => announcement._id !== id),
        isLoading: false,
        success: 'Announcement deleted successfully'
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => set({ success: '' }), 3000);
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete announcement', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Set current announcement for editing
  setCurrentAnnouncement: (announcement) => {
    set({ currentAnnouncement: announcement });
  },
  
  // Clear success message
  clearSuccess: () => {
    set({ success: '' });
  },
  
  // Clear error message
  clearError: () => {
    set({ error: null });
  }
}));