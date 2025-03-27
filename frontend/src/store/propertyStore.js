import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/properties" : "/api/properties";

// Ensure credentials are included
axios.defaults.withCredentials = true;

export const usePropertyStore = create((set, get) => ({
  properties: [],
  myProperties: [],
  currentProperty: null,
  isLoading: false,
  error: null,
  message: null,

  // Get all properties (with optional filtering)
  getAllProperties: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axios.get(`${API_URL}${queryString}`);
      
      set({ 
        properties: response.data.properties, 
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching properties", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get a single property by ID
  getPropertyById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ 
        currentProperty: response.data.property, 
        isLoading: false 
      });
      return response.data.property;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching property", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Get properties for the logged-in landlord
  getMyProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      // Include authorization header
      const response = await axios.get(`${API_URL}/landlord/my-properties`);
      
      set({ 
        myProperties: response.data.properties || [], 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching your properties", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Create a new property
  createProperty: async (propertyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, propertyData);
      
      // Update myProperties state with the new property
      set(state => ({ 
        myProperties: [...state.myProperties, response.data.property],
        isLoading: false,
        message: "Property created successfully"
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error creating property", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Update a property
  updateProperty: async (id, propertyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, propertyData);
      
      // Update both properties arrays with the updated property
      set(state => ({
        properties: state.properties.map(prop => 
          prop._id === id ? response.data.property : prop
        ),
        myProperties: state.myProperties.map(prop => 
          prop._id === id ? response.data.property : prop
        ),
        currentProperty: response.data.property,
        isLoading: false,
        message: "Property updated successfully"
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error updating property", 
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a property
  deleteProperty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`);
      
      // Remove the deleted property from both arrays
      set(state => ({
        properties: state.properties.filter(prop => prop._id !== id),
        myProperties: state.myProperties.filter(prop => prop._id !== id),
        isLoading: false,
        message: "Property deleted successfully"
      }));
      
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error deleting property", 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Clear property-related messages
  clearMessage: () => set({ message: null }),
  
  // Clear property-related errors
  clearError: () => set({ error: null }),
  
  // Reset current property
  resetCurrentProperty: () => set({ currentProperty: null })
}));