import { create } from 'zustand';
import axios from 'axios';

// Define base URLs
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "";
const API_URL = `${BASE_URL}/api/leases`;

// Set axios to include credentials in requests
axios.defaults.withCredentials = true;

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
      
      set({
        leaseDocuments: response.data.data,
        loading: false
      });
      
      return response.data.data;
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

      // Add the new document to the list
      set(state => ({
        leaseDocuments: [...state.leaseDocuments, response.data.document],
        loading: false,
        message: 'Lease document uploaded successfully'
      }));

      return response.data.document;
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

      set({
        selectedDocument: response.data.data,
        loading: false
      });

      return response.data.data;
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