import { create } from 'zustand';
import axios from 'axios';

// Define base URLs once at the top of the file
const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
const API_URL = `${BASE_URL}/api/qr`;

// Set default axios configs
axios.defaults.withCredentials = true;

// Utility function to process image paths
const processImagePath = (path) => {
  if (!path || path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export const useQRImageStore = create((set, get) => ({
  qrImages: [],
  currentQRImage: null,
  loading: false,
  error: null,
  message: null,

  // Get all QR images (for landlords)
  getQRImages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(API_URL);
      
      // Process image paths using the utility function
      const processedQRImages = response.data.data.map(qrImage => ({
        ...qrImage,
        image_path: processImagePath(qrImage.image_path)
      }));
      
      set({ 
        qrImages: processedQRImages, 
        loading: false 
      });
      return processedQRImages;
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
          error: error.response?.data?.message || 'Error fetching QR images' 
        });
      }
      console.error('Error fetching QR images:', error);
      throw error;
    }
  },

  // Get QR images for tenant
  getTenantQRImages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/qr-images`);
      
      // Process image paths using the utility function
      const processedQRImages = response.data.data.map(qrImage => ({
        ...qrImage,
        image_path: processImagePath(qrImage.image_path)
      }));
      
      set({ 
        qrImages: processedQRImages, 
        loading: false 
      });
      return processedQRImages;
    } catch (error) {
      if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.' 
        });
      } else if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'Only tenants can access landlord QR images.' 
        });
      } else if (error.response?.status === 404) {
        // If tenant has no apartment assigned
        set({ 
          loading: false,
          qrImages: [],
          error: "You don't have any assigned apartment yet."
        });
        return [];
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error fetching landlord QR images' 
        });
      }
      console.error('Error fetching tenant QR images:', error);
      throw error;
    }
  },

  // Get a single QR image by ID
  getQRImageById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      // Process using the utility function
      const qrImage = {
        ...response.data.data,
        image_path: processImagePath(response.data.data?.image_path)
      };
      
      set({ 
        currentQRImage: qrImage, 
        loading: false 
      });
      return qrImage;
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
          error: error.response?.data?.message || 'Error fetching QR image' 
        });
      }
      console.error('Error fetching QR image:', error);
      throw error;
    }
  },

  // Create a new QR image
  createQRImage: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Ensure we're using credentials with the request
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const newQRImages = [...get().qrImages, response.data.data];
      
      set({ 
        qrImages: newQRImages,
        loading: false,
        message: 'QR image created successfully!'
      });
      
      return response.data.data;
    } catch (error) {
      // Provide more specific error messages for auth issues
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to create QR images. Please ensure you are logged in as a landlord.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error creating QR image' 
        });
      }
      console.error('Error creating QR image:', error);
      throw error;
    }
  },

  // Update an existing QR image
  updateQRImage: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const updatedQRImages = get().qrImages.map(qrImage => 
        qrImage._id === id ? response.data.data : qrImage
      );
      
      set({ 
        qrImages: updatedQRImages,
        currentQRImage: response.data.data,
        loading: false,
        message: 'QR image updated successfully!'
      });
      
      return response.data.data;
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to update this QR image.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error updating QR image' 
        });
      }
      console.error('Error updating QR image:', error);
      throw error;
    }
  },

  // Delete a QR image
  deleteQRImage: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });
      
      const filteredQRImages = get().qrImages.filter(
        qrImage => qrImage._id !== id
      );
      
      set({ 
        qrImages: filteredQRImages,
        loading: false,
        message: 'QR image deleted successfully!'
      });
      
      return true;
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 403) {
        set({ 
          loading: false, 
          error: 'You do not have permission to delete this QR image.'
        });
      } else if (error.response?.status === 401) {
        set({ 
          loading: false, 
          error: 'Your session has expired. Please log in again.'
        });
      } else {
        set({ 
          loading: false, 
          error: error.response?.data?.message || 'Error deleting QR image' 
        });
      }
      console.error('Error deleting QR image:', error);
      throw error;
    }
  },

  // Set current QR image (for editing)
  setCurrentQRImage: (qrImage) => {
    set({ currentQRImage: qrImage });
  },

  // Clear current QR image
  clearCurrentQRImage: () => {
    set({ currentQRImage: null });
  },

  // Clear error or success message
  clearMessage: () => {
    set({ error: null, message: null });
  }
}));
