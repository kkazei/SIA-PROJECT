import { create } from "zustand";
import axios from "axios";


const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";

export const useMaintenanceStore = create((set, get) => ({
  maintenanceRequests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  success: null,
  
  // Fetch all maintenance requests
  fetchMaintenance: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fix: Add leading slash to API path
      const response = await axios.get(`${API_URL}/api/maintenance`, { withCredentials: true });
      set({ 
        maintenanceRequests: response.data, 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch maintenance requests", 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Get a single maintenance request by ID
  getMaintenanceById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Fix: Add leading slash to API path
      const response = await axios.get(`${API_URL}/api/maintenance/${id}`, { withCredentials: true });
      set({ 
        selectedRequest: response.data, 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching maintenance request with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch maintenance request", 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Create a new maintenance request
  createMaintenance: async (maintenanceData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      // Fix: Add leading slash to API path
      const response = await axios.post(`${API_URL}/api/maintenance`, maintenanceData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new request to the state
      const updatedRequests = [...get().maintenanceRequests, response.data];
      
      set({ 
        maintenanceRequests: updatedRequests, 
        isLoading: false,
        success: "Maintenance request created successfully" 
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      set({ 
        error: error.response?.data?.message || "Failed to create maintenance request", 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Update an existing maintenance request
  updateMaintenance: async (id, updateData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      // Fix: Add leading slash to API path
      const response = await axios.put(`${API_URL}/api/maintenance/${id}`, updateData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update the request in the state
      const updatedRequests = get().maintenanceRequests.map(request => 
        request._id === id ? response.data : request
      );
      
      set({ 
        maintenanceRequests: updatedRequests,
        selectedRequest: response.data,
        isLoading: false,
        success: "Maintenance request updated successfully" 
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating maintenance request with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to update maintenance request", 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Delete a maintenance request
  deleteMaintenance: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      // Fix: Add leading slash to API path
      await axios.delete(`${API_URL}/api/maintenance/${id}`, { withCredentials: true });
      
      // Remove the deleted request from the state
      const updatedRequests = get().maintenanceRequests.filter(request => request._id !== id);
      
      set({ 
        maintenanceRequests: updatedRequests, 
        isLoading: false,
        success: "Maintenance request deleted successfully" 
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting maintenance request with ID ${id}:`, error);
      set({ 
        error: error.response?.data?.message || "Failed to delete maintenance request", 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Clear error message
  clearError: () => set({ error: null }),
  
  // Clear success message
  clearSuccess: () => set({ success: null }),
  
  // Set selected request
  setSelectedRequest: (request) => set({ selectedRequest: request }),
  
  // Clear selected request
  clearSelectedRequest: () => set({ selectedRequest: null }),
  
  // Reset store state
  resetStore: () => set({ 
    maintenanceRequests: [],
    selectedRequest: null,
    isLoading: false,
    error: null,
    success: null
  })
}));