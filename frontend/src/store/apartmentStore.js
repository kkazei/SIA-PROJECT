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
        apartments: response.data.apartments, 
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
        currentApartment: response.data.apartment, 
        isLoading: false 
      });
      return response.data.apartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching apartment details"
      });
      throw error;
    }
  },

  // Create a new apartment
  createApartment: async (apartmentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, apartmentData);
      
      // Add new apartment to the list
      const updatedApartments = [...get().apartments, response.data.apartment];
      
      set({
        apartments: updatedApartments,
        isLoading: false,
        message: "Apartment created successfully"
      });
      
      return response.data.apartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error creating apartment"
      });
      throw error;
    }
  },

  // Update an existing apartment
  updateApartment: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, updateData);
      
      // Update apartment in the list
      const updatedApartments = get().apartments.map(apt => 
        apt._id === id ? response.data.apartment : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: response.data.apartment,
        isLoading: false,
        message: "Apartment updated successfully"
      });
      
      return response.data.apartment;
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
        apt._id === apartmentId ? response.data.apartment : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: response.data.apartment,
        isLoading: false,
        message: "Tenant assigned successfully"
      });
      
      return response.data.apartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error assigning tenant"
      });
      throw error;
    }
  },

  // Remove tenant from apartment
  removeTenant: async (apartmentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/remove-tenant/${apartmentId}`);
      
      // Update apartment in the list
      const updatedApartments = get().apartments.map(apt => 
        apt._id === apartmentId ? response.data.apartment : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: response.data.apartment,
        isLoading: false,
        message: "Tenant removed successfully"
      });
      
      return response.data.apartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error removing tenant"
      });
      throw error;
    }
  },

  // Clear any error or success message
  clearMessages: () => {
    set({
      error: null,
      message: null
    });
  }
}));