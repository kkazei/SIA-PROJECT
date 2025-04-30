import { create } from "zustand";
import axios from "axios";

// Define base URLs
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "";
const API_URL = `${BASE_URL}/api/tenants`;

// Set axios to include credentials in requests
axios.defaults.withCredentials = true;

export const useTenantStore = create((set, get) => ({
  tenants: [],
  selectedTenant: null,
  loading: false,
  error: null,
  message: null,

  // Fetch all tenants for the landlord's apartments
  fetchTenants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/landlord-tenants`);
      
      set({
        tenants: response.data.data,
        loading: false
      });
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tenants:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch tenants"
      });
      throw error;
    }
  },

  fetchUnassignedTenants: async () => {
    set({ loading: true, error: null });
    try {
      // Fix the API URL - make sure it includes the full path
      const response = await axios.get(`${API_URL}/unassigned`, {
        withCredentials: true // Ensure cookies are sent with the request
      });
      
      console.log("Unassigned tenants API response:", response);
      
      if (response.data && response.data.success) {
        set({ 
          unassignedTenants: response.data.data || [], 
          loading: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch unassigned tenants");
      }
    } catch (error) {
      console.error("Error fetching unassigned tenants:", error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || error.message || "Error fetching unassigned tenants"
      });
      return [];
    }
  },

  // Get detailed tenant information with application data
  getTenantById: async (tenantId) => {
    set({ loading: true, error: null });
    try {
      // Get basic tenant info
      const tenantResponse = await axios.get(`${API_URL}/${tenantId}`);
      const tenant = tenantResponse.data.data;
      
      // Get tenant's active application/lease data
      if (tenant.apartment?._id) {
        try {
          const applicationResponse = await axios.get(`${BASE_URL}/api/applications/tenant/${tenantId}/active`);
          if (applicationResponse.data.success && applicationResponse.data.data) {
            // Merge application data with tenant data
            tenant.duration = applicationResponse.data.data.duration;
            tenant.phoneNumber = applicationResponse.data.data.phoneNumber;
            tenant.moveInDate = applicationResponse.data.data.moveInDate;
            tenant.additionalComments = applicationResponse.data.data.additionalComments;
          }
        } catch (appError) {
          console.error("Could not fetch application data:", appError);
          // Continue with basic tenant data even if application fetch fails
        }
      }
      
      set({ loading: false });
      return tenant;
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || "Failed to fetch tenant details" 
      });
      throw error;
    }
  },

  // Clear messages and errors
  clearMessages: () => set({ error: null, message: null })
}));