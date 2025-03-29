import { create } from 'zustand';
import axios from 'axios';

// Define base URLs once at the top of the file
const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
const API_URL = `${BASE_URL}/api/inquiries`;

// Set default axios configs
axios.defaults.withCredentials = true;

// Utility function to process image paths
const processImagePath = (path) => {
  if (!path || path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export const useInquiryStore = create((set, get) => ({
  inquiries: [],
  currentInquiry: null,
  loading: false,
  error: null,
  message: null,

  // Get all inquiries (for admins/landlords)
  getInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      
      // Process image paths using the utility function
      const processedInquiries = response.data.map(inquiry => ({
        ...inquiry,
        image_path: processImagePath(inquiry.image_path)
      }));
      
      set({ 
        inquiries: processedInquiries, 
        loading: false 
      });
      return processedInquiries;
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
          error: error.response?.data?.message || 'Error fetching inquiries' 
        });
      }
      console.error('Error fetching inquiries:', error);
      throw error;
    }
  },

  // Get inquiries for a specific tenant
  getTenantInquiries: async (tenantId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/${tenantId}`);
      
      // Process image paths using the utility function
      const processedInquiries = response.data.map(inquiry => ({
        ...inquiry,
        image_path: processImagePath(inquiry.image_path)
      }));
      
      set({ 
        inquiries: processedInquiries, 
        loading: false 
      });
      return processedInquiries;
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
          error: 'You do not have permission to access these inquiries.' 
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error fetching tenant inquiries' 
        });
      }
      console.error('Error fetching tenant inquiries:', error);
      throw error;
    }
  },

  // Get inquiries by status
  getInquiriesByStatus: async (status) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/status/${status}`);
      
      // Process image paths using the utility function
      const processedInquiries = response.data.map(inquiry => ({
        ...inquiry,
        image_path: processImagePath(inquiry.image_path)
      }));
      
      set({ 
        inquiries: processedInquiries, 
        loading: false 
      });
      return processedInquiries;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.' 
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || `Error fetching ${status} inquiries` 
        });
      }
      console.error(`Error fetching ${status} inquiries:`, error);
      throw error;
    }
  },

  // Get inquiries by category
  getInquiriesByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/category/${category}`);
      
      // Process image paths using the utility function
      const processedInquiries = response.data.map(inquiry => ({
        ...inquiry,
        image_path: processImagePath(inquiry.image_path)
      }));
      
      set({ 
        inquiries: processedInquiries, 
        loading: false 
      });
      return processedInquiries;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.' 
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || `Error fetching ${category} inquiries` 
        });
      }
      console.error(`Error fetching ${category} inquiries:`, error);
      throw error;
    }
  },

  // Get a single inquiry by ID
  getInquiryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      // Process using the utility function
      const inquiry = {
        ...response.data,
        image_path: processImagePath(response.data?.image_path)
      };
      
      set({ 
        currentInquiry: inquiry, 
        loading: false 
      });
      return inquiry;
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
          error: error.response?.data?.message || 'Error fetching inquiry' 
        });
      }
      console.error('Error fetching inquiry:', error);
      throw error;
    }
  },

  // Create a new inquiry
  createInquiry: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Ensure we're using credentials with the request
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const newInquiries = [...get().inquiries, response.data];
      
      set({ 
        inquiries: newInquiries,
        loading: false,
        message: 'Inquiry submitted successfully!'
      });
      
      return response.data;
    } catch (error) {
      // Provide more specific error messages for auth issues
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to submit inquiries. Please ensure you are logged in.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error submitting inquiry' 
        });
      }
      console.error('Error creating inquiry:', error);
      throw error;
    }
  },

  // Update an existing inquiry
  updateInquiry: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const updatedInquiries = get().inquiries.map(inquiry => 
        inquiry._id === id ? response.data : inquiry
      );
      
      set({ 
        inquiries: updatedInquiries,
        currentInquiry: response.data,
        loading: false,
        message: 'Inquiry updated successfully!'
      });
      
      return response.data;
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to update this inquiry.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error updating inquiry' 
        });
      }
      console.error('Error updating inquiry:', error);
      throw error;
    }
  },

  // Update inquiry status
  updateInquiryStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
        withCredentials: true
      });
      
      const updatedInquiries = get().inquiries.map(inquiry => 
        inquiry._id === id ? response.data : inquiry
      );
      
      set({ 
        inquiries: updatedInquiries,
        currentInquiry: get().currentInquiry?._id === id ? response.data : get().currentInquiry,
        loading: false,
        message: `Inquiry status updated to ${status}!`
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to update this inquiry status.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error updating inquiry status' 
        });
      }
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  },

  // Delete an inquiry
  deleteInquiry: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });
      
      const filteredInquiries = get().inquiries.filter(
        inquiry => inquiry._id !== id
      );
      
      set({ 
        inquiries: filteredInquiries,
        loading: false,
        message: 'Inquiry deleted successfully!'
      });
      
      return true;
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to delete this inquiry.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error deleting inquiry' 
        });
      }
      console.error('Error deleting inquiry:', error);
      throw error;
    }
  },

  // Set current inquiry (for editing or viewing details)
  setCurrentInquiry: (inquiry) => {
    set({ currentInquiry: inquiry });
  },

  // Clear current inquiry
  clearCurrentInquiry: () => {
    set({ currentInquiry: null });
  },

  // Clear error or success message
  clearMessage: () => {
    set({ error: null, message: null });
  }
}));