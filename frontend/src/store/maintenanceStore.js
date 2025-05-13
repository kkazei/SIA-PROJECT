import { create } from "zustand";
import axios from "axios";

// Fix: The API_URL should be the base URL without trailing slash
const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";

export const useMaintenanceStore = create((set, get) => ({
  maintenanceRequests: [],
  archivedRequests: [],  // Make sure this is initialized as an empty array
  selectedRequest: null,
  statistics: null,
  isLoading: false,
  error: null,
  success: null,
  
  // Fetch all maintenance requests for the landlord
  fetchMaintenance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/maintenance/landlord`, { withCredentials: true });
      set({ 
        maintenanceRequests: response.data.data, 
        isLoading: false 
      });
      return response.data.data;
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
      const response = await axios.get(`${API_URL}/api/maintenance/${id}`, { withCredentials: true });
      set({ 
        selectedRequest: response.data.data, 
        isLoading: false 
      });
      return response.data.data;
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
      // Ensure apartment_id is included in the data
      if (!maintenanceData.apartment_id) {
        throw new Error("Apartment selection is required");
      }
      
      const response = await axios.post(`${API_URL}/api/maintenance/create`, maintenanceData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const updatedRequests = [...get().maintenanceRequests, response.data.data];
      
      set({ 
        maintenanceRequests: updatedRequests, 
        isLoading: false,
        success: response.data.message || "Maintenance request created successfully" 
      });
      
      return response.data.data;
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
      // Ensure apartment_id is still included if it exists in the update data
      const response = await axios.put(`${API_URL}/api/maintenance/${id}`, updateData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const updatedRequests = get().maintenanceRequests.map(request => 
        request._id === id ? response.data.data : request
      );
      
      set({ 
        maintenanceRequests: updatedRequests,
        selectedRequest: response.data.data,
        isLoading: false,
        success: response.data.message || "Maintenance request updated successfully" 
      });
      
      return response.data.data;
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
      const response = await axios.delete(`${API_URL}/api/maintenance/${id}`, { withCredentials: true });
      
      const updatedRequests = get().maintenanceRequests.filter(request => request._id !== id);
      
      set({ 
        maintenanceRequests: updatedRequests, 
        isLoading: false,
        success: response.data.message || "Maintenance request deleted successfully" 
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

  // Get maintenance statistics
  fetchMaintenanceStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/maintenance/stats`, { withCredentials: true });
      set({ 
        statistics: response.data.data, 
        isLoading: false 
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching maintenance statistics:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch maintenance statistics", 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Fetch all archived maintenance requests for the landlord
  fetchArchivedMaintenance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/maintenance/archived`, { withCredentials: true });
      set({ 
        archivedRequests: response.data.data || [], 
        isLoading: false 
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching archived maintenance requests:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch archived maintenance requests", 
        isLoading: false,
        archivedRequests: []
      });
      return null;
    }
  },
  
  // Archive a maintenance request
  archiveMaintenance: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axios.put(`${API_URL}/api/maintenance/archive/${id}`, {}, { 
        withCredentials: true 
      });
      
      const updatedRequests = get().maintenanceRequests.filter(req => req._id !== id);
      
      set({ 
        maintenanceRequests: updatedRequests, 
        isLoading: false,
        success: "Maintenance request archived successfully" 
      });
      
      return true;
    } catch (error) {
      console.error("Error archiving maintenance request:", error);
      set({ 
        error: error.response?.data?.message || "Failed to archive maintenance request", 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Restore an archived maintenance request
  restoreArchive: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await axios.put(`${API_URL}/api/maintenance/restore/${id}`, {}, { 
        withCredentials: true 
      });
      
      const updatedArchivedRequests = get().archivedRequests.filter(req => req._id !== id);
      
      set({ 
        archivedRequests: updatedArchivedRequests, 
        isLoading: false,
        success: "Maintenance request restored successfully" 
      });
      
      get().fetchMaintenance();
      
      return true;
    } catch (error) {
      console.error("Error restoring maintenance request:", error);
      set({ 
        error: error.response?.data?.message || "Failed to restore maintenance request", 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Permanently delete a maintenance request (from archive)
  permanentlyDeleteMaintenance: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await axios.delete(`${API_URL}/api/maintenance/permanent/${id}`, { 
        withCredentials: true 
      });
      
      // Remove from archived list
      const updatedArchivedRequests = get().archivedRequests.filter(req => req._id !== id);
      
      set({ 
        archivedRequests: updatedArchivedRequests, 
        isLoading: false,
        success: "Maintenance record permanently deleted" 
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
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
    archivedRequests: [],
    selectedRequest: null,
    statistics: null,
    isLoading: false,
    error: null,
    success: null
  })
}));