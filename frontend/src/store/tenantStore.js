import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api/users" 
  : "/api/users";

axios.defaults.withCredentials = true;

export const useTenantStore = create((set, get) => ({
  tenants: [],
  loading: false,
  error: null,
  
  // Fetch all tenant users
  fetchTenants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenants`);
      set({ 
        tenants: response.data.users,
        loading: false 
      });
      return response.data.users;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error fetching tenants"
      });
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },
  
  // Get unassigned tenants (those without an apartment)
  getUnassignedTenants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenants/unassigned`);
      set({ 
        tenants: response.data.users,
        loading: false 
      });
      return response.data.users;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error fetching unassigned tenants"
      });
      console.error('Error fetching unassigned tenants:', error);
      throw error;
    }
  },
  
  // Get a single tenant by ID
  getTenantById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenants/${id}`);
      return response.data.user;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error fetching tenant"
      });
      console.error('Error fetching tenant:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // Search for tenants by name or email
  searchTenants: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenants/search?q=${query}`);
      set({ 
        tenants: response.data.users,
        loading: false 
      });
      return response.data.users;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error searching tenants"
      });
      console.error('Error searching tenants:', error);
      throw error;
    }
  },
  
  // Filter tenants by occupation status
  filterTenants: async (occupied = null) => {
    set({ loading: true, error: null });
    try {
      let url = `${API_URL}/tenants`;
      if (occupied !== null) {
        url += `?occupied=${occupied}`;
      }
      const response = await axios.get(url);
      set({ 
        tenants: response.data.users,
        loading: false 
      });
      return response.data.users;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Error filtering tenants"
      });
      console.error('Error filtering tenants:', error);
      throw error;
    }
  },
  
  // Sort tenants by name or date
  sortTenants: (criteria = 'name') => {
    const tenants = [...get().tenants];
    
    if (criteria === 'name') {
      tenants.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === 'date') {
      tenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    set({ tenants });
    return tenants;
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
  
  // Clear tenants data
  clearTenants: () => {
    set({ 
      tenants: [],
      loading: false,
      error: null 
    });
  }
}));