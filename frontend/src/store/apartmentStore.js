import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api/apartments" 
  : "/api/apartments";

axios.defaults.withCredentials = true;

export const useApartmentStore = create((set, get) => ({
  apartments: [],
  currentApartment: null,
  isLoading: false,
  error: null,
  message: null,

  // Fetch all apartments for landlord
  getApartments: async (statusFilter = null) => {
    set({ isLoading: true, error: null });
    try {
      let url = API_URL;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      
      const response = await axios.get(url);
      set({ 
        // Updated to match controller response format
        apartments: response.data.data || [], 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching apartments"
      });
      throw error;
    }
  },

  // Get single apartment details
  getApartmentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ 
        // Updated to match controller response format
        currentApartment: response.data.data, 
        isLoading: false 
      });
      return response.data.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching apartment details"
      });
      throw error;
    }
  },

  // Create a new apartment - updated to use FormData for file uploads
  createApartment: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      // FormData is already configured for file uploads
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add new apartment to the list
      const updatedApartments = [...get().apartments, response.data.data];
      
      set({
        apartments: updatedApartments,
        isLoading: false,
        message: "Apartment created successfully"
      });
      
      return response.data.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error creating apartment"
      });
      throw error;
    }
  },

  // Update an existing apartment - updated to use FormData for file uploads
  updateApartment: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      // FormData is already configured for file uploads
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update apartment in the list
      const updatedApartments = get().apartments.map(apt => 
        apt._id === id ? response.data.data : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: response.data.data,
        isLoading: false,
        message: "Apartment updated successfully"
      });
      
      return response.data.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error updating apartment"
      });
      throw error;
    }
  },

  // Delete an apartment
  deleteApartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`);
      
      // Remove apartment from the list
      const updatedApartments = get().apartments.filter(apt => apt._id !== id);
      
      set({
        apartments: updatedApartments,
        isLoading: false,
        message: "Apartment deleted successfully"
      });
      
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error deleting apartment"
      });
      throw error;
    }
  },

  // Assign tenant to apartment
  assignTenant: async (apartmentId, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/assign-tenant`, {
        apartmentId,
        tenantId
      });
      
      // Update apartment in the list
      const updatedApartments = get().apartments.map(apt => 
        apt._id === apartmentId ? response.data.data : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: response.data.data,
        isLoading: false,
        message: "Tenant assigned successfully"
      });
      
      return response.data.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error assigning tenant"
      });
      throw error;
    }
  },

  // Vacate apartment (remove tenant) - updated to match the controller endpoint
  vacateApartment: async (apartmentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/vacate`, {
        apartmentId
      });
      
      // Update apartment in the list
      const updatedApartments = get().apartments.map(apt => 
        apt._id === apartmentId ? response.data.data : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: response.data.data,
        isLoading: false,
        message: "Apartment vacated successfully"
      });
      
      return response.data.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error vacating apartment"
      });
      throw error;
    }
  },

  // Get available apartments (for tenants)
  getAvailableApartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/list/available`);
      set({ 
        apartments: response.data.data, 
        isLoading: false 
      });
      return response.data.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching available apartments"
      });
      throw error;
    }
  },

  // Set current apartment (for editing)
  setCurrentApartment: (apartment) => {
    set({ currentApartment: apartment });
  },

  // Clear current apartment
  clearCurrentApartment: () => {
    set({ currentApartment: null });
  },

  // Clear any error or success message
  clearMessages: () => {
    set({
      error: null,
      message: null
    });
  }
}));