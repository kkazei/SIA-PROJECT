import { create } from 'zustand';
import axios from 'axios';

// Define base URLs once at the top of the file
const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
const API_URL = `${BASE_URL}/api/inquiries`;

// Set default axios configs
axios.defaults.withCredentials = true;

// Utility function to process image paths
const processImagePaths = (images) => {
  if (!images || !Array.isArray(images)) return [];
  return images.map(path => {
    if (!path || path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  });
};

export const useInquiryStore = create((set, get) => ({
  inquiries: [],
  currentInquiry: null,
  loading: false,
  error: null,
  message: null,

  // Get all inquiries for the logged-in tenant
  getTenantInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant`);
      
      // Process image paths
      const processedInquiries = response.data.data.map(inquiry => ({
        ...inquiry,
        images: processImagePaths(inquiry.images)
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
      console.error('Error fetching tenant inquiries:', error);
      throw error;
    }
  },

  // Get all inquiries for the logged-in landlord
  getLandlordInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/landlord`);
      
      // Process image paths
      const processedInquiries = response.data.data.map(inquiry => ({
        ...inquiry,
        images: processImagePaths(inquiry.images)
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
      console.error('Error fetching landlord inquiries:', error);
      throw error;
    }
  },

  // Get a single inquiry by ID
  getInquiryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      // Process image paths
      const inquiry = {
        ...response.data.data,
        images: processImagePaths(response.data.data?.images)
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

  // Create a new inquiry (for tenants)
  createInquiry: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        timeout: 30000, // 30 seconds timeout for large uploads
        onUploadProgress: progressEvent => {
          console.log('Upload progress:', Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
      
      // Process the returned inquiry to fix image paths
      const newInquiry = {
        ...response.data.data,
        images: processImagePaths(response.data.data?.images)
      };
      
      // Update state with the new inquiry
      const newInquiries = [...get().inquiries, newInquiry];
      
      set({ 
        inquiries: newInquiries,
        loading: false,
        message: 'Inquiry submitted successfully!'
      });
      
      return newInquiry;
    } catch (error) {
      // Provide more specific error messages for auth issues
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to create inquiries. Please ensure you are logged in as a tenant.'
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

  // Add a response to an inquiry
  addResponse: async (id, message) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/${id}/respond`, { message });
      
      // Process the returned inquiry to fix image paths
      const updatedInquiry = {
        ...response.data.data,
        images: processImagePaths(response.data.data?.images)
      };
      
      // Update the list of inquiries
      const updatedInquiries = get().inquiries.map(inquiry => 
        inquiry._id === id ? updatedInquiry : inquiry
      );
      
      set({ 
        inquiries: updatedInquiries,
        currentInquiry: updatedInquiry,
        loading: false,
        message: 'Response added successfully!'
      });
      
      return updatedInquiry;
    } catch (error) {
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to respond to this inquiry.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error adding response' 
        });
      }
      console.error('Error adding response:', error);
      throw error;
    }
  },

  // Update inquiry status (landlord only)
  updateInquiryStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, statusData);
      
      // Process the returned inquiry to fix image paths
      const updatedInquiry = {
        ...response.data.data,
        images: processImagePaths(response.data.data?.images)
      };
      
      // Update the list of inquiries
      const updatedInquiries = get().inquiries.map(inquiry => 
        inquiry._id === id ? updatedInquiry : inquiry
      );
      
      set({ 
        inquiries: updatedInquiries,
        currentInquiry: updatedInquiry,
        loading: false,
        message: `Inquiry status updated to ${statusData.status} successfully!`
      });
      
      return updatedInquiry;
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

  // Set current inquiry (for viewing details)
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
  },

  // Filter inquiries by status
  filterInquiriesByStatus: (status) => {
    const allInquiries = get().inquiries;
    if (!status || status === 'All') {
      return allInquiries;
    }
    return allInquiries.filter(inquiry => inquiry.status === status);
  },

  // Get inquiry statistics (for landlord dashboard)
  getInquiryStats: () => {
    const inquiries = get().inquiries;
    
    const stats = {
      total: inquiries.length,
      open: inquiries.filter(i => i.status === 'Open').length,
      inProgress: inquiries.filter(i => i.status === 'In Progress').length,
      approved: inquiries.filter(i => i.status === 'Approved').length,
      resolved: inquiries.filter(i => i.status === 'Resolved').length,
      closed: inquiries.filter(i => i.status === 'Closed').length,
      byCategory: {
        maintenance: inquiries.filter(i => i.category === 'Maintenance').length,
        paymentIssue: inquiries.filter(i => i.category === 'Payment Issue').length,
        complaint: inquiries.filter(i => i.category === 'Complaint').length,
        generalInquiry: inquiries.filter(i => i.category === 'General Inquiry').length,
        other: inquiries.filter(i => i.category === 'Other').length,
      }
    };
    
    return stats;
  }
}));