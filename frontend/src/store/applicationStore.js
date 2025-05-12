import { create } from 'zustand';
import axios from 'axios';

// Define base URLs
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "";
const API_URL = `${BASE_URL}/api/applications`;

// Set axios to include credentials in requests
axios.defaults.withCredentials = true;

export const useApplicationStore = create((set, get) => ({
  // State
  applications: [],
  tenantApplications: [],
  landlordApplications: [],
  selectedApplication: null,
  loading: false,
  error: null,
  message: null,
  
  // Submit a new application (for tenants)
  submitApplication: async (applicationData) => {
    set({ loading: true, error: null, message: null });
    try {
      // For FormData, make sure to NOT set Content-Type manually
      // Let axios set the boundary parameter automatically
      const config = {
        headers: {
          // Remove the Content-Type setting as axios will handle it
          // 'Content-Type': 'multipart/form-data'
        }
      };
      
      // Log attempt to submit
      console.log("Submitting application to:", `${API_URL}/submit`);
      
      // More detailed debugging of form data
      console.log("Form data contents:");
      for (let [key, value] of applicationData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Make a special check for the duration field
      console.log("Duration value:", applicationData.get('duration'));
      
      // Make sure duration is a valid number string
      const durationValue = applicationData.get('duration');
      if (!durationValue || isNaN(Number(durationValue)) || Number(durationValue) < 1) {
        // Force update the duration if it seems invalid
        applicationData.set('duration', '1');
        console.log("Duration corrected to:", applicationData.get('duration'));
      }
      
      const response = await axios.post(`${API_URL}/submit`, applicationData, config);
      
      // Add the new application to the tenant applications list
      const updatedApplications = [response.data.data, ...get().tenantApplications];
      
      set({
        tenantApplications: updatedApplications,
        loading: false,
        message: "Application submitted successfully"
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error submitting application:", error);
      // Log more details about the error
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to submit application"
      });
      throw error;
    }
  },
  
  // Get all applications for the current tenant
  fetchTenantApplications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant`);
      
      set({
        tenantApplications: response.data.data,
        loading: false
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tenant applications:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch your applications"
      });
      throw error;
    }
  },
  
  // Get all applications for the landlord's apartments
  fetchLandlordApplications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/landlord`);
      
      set({
        landlordApplications: response.data.data,
        loading: false
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching landlord applications:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch applications"
      });
      throw error;
    }
  },
  
  // Process an application (approve/reject) - for landlords
  processApplication: async (applicationId, status, reason) => {
    set({ loading: true, error: null, message: null });
    try {
      const response = await axios.patch(`${API_URL}/${applicationId}/process`, {
        status,
        reason
      });
      
      // Update the application in the landlordApplications list
      const updatedApplications = get().landlordApplications.map(app => 
        app._id === applicationId ? response.data.data : app
      );
      
      set({
        landlordApplications: updatedApplications,
        loading: false,
        message: `Application ${status} successfully`
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error processing application:", error);
      set({
        loading: false,
        error: error.response?.data?.message || `Failed to ${status} application`
      });
      throw error;
    }
  },
  
  // Get details for a specific application
  getApplicationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      set({
        selectedApplication: response.data.data,
        loading: false
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching application details:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch application details"
      });
      throw error;
    }
  },
  
  // Helper function to get application status color
  getStatusColor: (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  },
  
  // Helper function to format dates nicely
  formatDate: (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  // Clear messages and errors
  clearMessages: () => set({ error: null, message: null })
}));