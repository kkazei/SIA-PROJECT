import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/applications" : "/api/applications";

// Ensure credentials are included
axios.defaults.withCredentials = true;

export const useApplicationStore = create((set, get) => ({
  // Application states
  applications: [],
  propertyApplications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  message: null,

  // Submit a new application (for tenants)
  submitApplication: async (applicationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, applicationData);
      
      // Update applications state with the new application
      set(state => ({ 
        applications: [...state.applications, response.data.application],
        isLoading: false,
        message: "Application submitted successfully"
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error submitting application", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get all applications for a tenant (My Applications)
  getMyApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/my-applications`);
      
      set({ 
        applications: response.data.applications, 
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching your applications", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get all applications for a landlord
  getLandlordApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/landlord/all`);
      
      set({ 
        applications: response.data.applications, 
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching applications", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get applications for a specific property (for landlords)
  getPropertyApplications: async (propertyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/property/${propertyId}`);
      
      set({ 
        propertyApplications: response.data.applications, 
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching property applications", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get application details by ID
  getApplicationById: async (applicationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${applicationId}`);
      
      set({ 
        currentApplication: response.data.application, 
        isLoading: false 
      });
      
      return response.data.application;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching application details", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Update application status (for landlords)
  updateApplicationStatus: async (applicationId, statusData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${applicationId}/status`, statusData);
      
      // Update application in state
      set(state => ({
        applications: state.applications.map(app => 
          app._id === applicationId ? response.data.application : app
        ),
        propertyApplications: state.propertyApplications.map(app => 
          app._id === applicationId ? response.data.application : app
        ),
        currentApplication: get().currentApplication?._id === applicationId 
          ? response.data.application 
          : get().currentApplication,
        isLoading: false,
        message: `Application ${statusData.status} successfully`
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error updating application status", 
        isLoading: false 
      });
      throw error;
    }
  },


  updateLeaseTerm: async (propertyId, leaseData) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(
        `${API_URL}/property/${propertyId}/lease`, 
        leaseData,
        config
      );
      
      set({ 
        isLoading: false,
        message: "Lease terms updated successfully"
      });
      
      return response.data;
    } catch (error) {
      console.error("Update lease term error:", error);
      set({ 
        error: error.response?.data?.message || "Error updating lease terms", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Cancel an application (for tenants)
  cancelApplication: async (applicationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${applicationId}/cancel`);
      
      // Update applications state
      set(state => ({
        applications: state.applications.map(app => 
          app._id === applicationId ? response.data.application : app
        ),
        currentApplication: get().currentApplication?._id === applicationId 
          ? response.data.application 
          : get().currentApplication,
        isLoading: false,
        message: "Application canceled successfully"
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error canceling application", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Helper functions to manage state
  clearApplications: () => set({ applications: [], propertyApplications: [] }),
  
  resetCurrentApplication: () => set({ currentApplication: null }),
  
  clearMessage: () => set({ message: null }),
  
  clearError: () => set({ error: null })
}));