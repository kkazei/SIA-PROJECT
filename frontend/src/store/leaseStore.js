import { create } from 'zustand';
import axios from 'axios';

// Define base URLs
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "";
const API_URL = `${BASE_URL}/api/leases`;

// Set axios to include credentials in requests
axios.defaults.withCredentials = true;

// Helper function to process file paths (similar to the one in apartmentStore)
const processFilePath = (path) => {
  if (!path) return null;
  if (typeof path === 'string' && path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export const useLeaseStore = create((set, get) => ({
  leaseDocuments: [],
  selectedDocument: null,
  loading: false,
  error: null,
  message: null,

  // Fetch all lease documents for a tenant
  fetchTenantLeases: async (tenantId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/${tenantId}`, {
        withCredentials: true
      });
      
      // Process file paths for each document - FIXED: using filePath instead of fileUrl
      const processedDocuments = response.data.data.map(doc => ({
        ...doc,
        fileUrl: processFilePath(doc.filePath) // Changed from doc.fileUrl to doc.filePath
      }));
      
      set({
        leaseDocuments: processedDocuments,
        loading: false
      });
      
      return processedDocuments;
    } catch (error) {
      console.error("Error fetching lease documents:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch lease documents"
      });
      throw error;
    }
  },

  // Upload a new lease document
  uploadLeaseDocument: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      // Process the file path and add to the list - FIXED: using filePath
      const processedDocument = {
        ...response.data.document,
        fileUrl: processFilePath(response.data.document.filePath) // Changed from fileUrl to filePath
      };

      set(state => ({
        leaseDocuments: [...state.leaseDocuments, processedDocument],
        loading: false,
        message: 'Lease document uploaded successfully'
      }));

      return processedDocument;
    } catch (error) {
      console.error("Error uploading lease document:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to upload lease document"
      });
      throw error;
    }
  },

  // Delete a lease document
  deleteLeaseDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });

      // Remove the document from the list
      set(state => ({
        leaseDocuments: state.leaseDocuments.filter(doc => doc._id !== id),
        loading: false,
        message: 'Lease document deleted successfully'
      }));
    } catch (error) {
      console.error("Error deleting lease document:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to delete lease document"
      });
      throw error;
    }
  },

  // Get a specific lease document
  getLeaseDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        withCredentials: true
      });

      // Process the file path - FIXED: using filePath
      const processedDocument = {
        ...response.data.data,
        fileUrl: processFilePath(response.data.data.filePath) // Changed from fileUrl to filePath
      };

      set({
        selectedDocument: processedDocument,
        loading: false
      });

      return processedDocument;
    } catch (error) {
      console.error("Error fetching lease document:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch lease document"
      });
      throw error;
    }
  },

  // Clear messages and errors
  clearMessages: () => set({ error: null, message: null }),

  // Reset store
  resetStore: () => set({ 
    leaseDocuments: [],
    selectedDocument: null,
    loading: false,
    error: null,
    message: null
  })
}));