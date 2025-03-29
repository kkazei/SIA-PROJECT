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

  // Get details for a specific tenant
  getTenantById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      set({
        selectedTenant: response.data.data,
        loading: false
      });
      
      return response.data.data;
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