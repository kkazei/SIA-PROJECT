import { create } from "zustand";
import axios from "axios";

// Define base URLs once at the top of the file
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "";
const API_URL = `${BASE_URL}/api/apartments`;

axios.defaults.withCredentials = true;

// Helper function to process image paths
const processImagePath = (path) => {
  if (!path) return null;
  if (typeof path === 'string' && path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
};

export const useApartmentStore = create((set, get) => ({
  apartments: [],
  currentApartment: null,
  isLoading: false,
  error: null,
  message: null,

  // Get all apartments for landlord
  getApartments: async (statusFilter = null) => {
    set({ isLoading: true, error: null });
    try {
      let url = API_URL;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      
      const response = await axios.get(url);
      
      // Process image paths for each apartment
      const processedApartments = response.data.data.map(apartment => ({
        ...apartment,
        images: apartment.images?.map(img => processImagePath(img)) || []
      }));
      
      set({ 
        apartments: processedApartments, 
        isLoading: false 
      });
      
      return processedApartments;
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
      
      // Process image URLs for the apartment
      const processedApartment = {
        ...response.data.data,
        images: response.data.data.images?.map(img => processImagePath(img)) || []
      };
      
      set({ 
        currentApartment: processedApartment, 
        isLoading: false 
      });
      
      return processedApartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching apartment details"
      });
      throw error;
    }
  },

  // Get apartment for tenant
  getTenantApartment: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/current`);
      
      // If no apartment data returned
      if (!response.data.data) {
        set({ 
          currentApartment: null,
          isLoading: false 
        });
        return null;
      }
      
      // Create a deep copy to avoid reference issues
      const apartmentData = response.data.data;
      
      console.log("Raw apartment data from API:", apartmentData);
      
      // Set a default next due date if not provided
      // Assuming rent is due on the 1st of next month if not specified
      let nextDueDate = null;
      if (apartmentData.nextDueDate) {
        nextDueDate = new Date(apartmentData.nextDueDate);
      } else if (apartmentData.paymentInfo?.nextDueDate) {
        nextDueDate = new Date(apartmentData.paymentInfo.nextDueDate);
      } else {
        // Default to 1st of next month
        const today = new Date();
        nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      }
      
      // Process image URLs and convert date strings to Date objects
      const processedApartment = {
        ...apartmentData,
        // Convert date strings to proper Date objects with fallbacks
        nextDueDate: nextDueDate,
        lastPaymentDate: apartmentData.lastPaymentDate ? new Date(apartmentData.lastPaymentDate) : 
                         (apartmentData.paymentInfo?.lastPaymentDate ? new Date(apartmentData.paymentInfo.lastPaymentDate) : null),
        moveInDate: apartmentData.moveInDate ? new Date(apartmentData.moveInDate) : null,
        createdAt: apartmentData.createdAt ? new Date(apartmentData.createdAt) : null,
        updatedAt: apartmentData.updatedAt ? new Date(apartmentData.updatedAt) : null,
        // Process images
        images: apartmentData.images?.map(img => processImagePath(img)) || []
      };
      
      // Debug output
      console.log("Original nextDueDate:", apartmentData.nextDueDate);
      console.log("Payment info nextDueDate:", apartmentData.paymentInfo?.nextDueDate);
      console.log("Processed nextDueDate:", processedApartment.nextDueDate);
      
      set({ 
        currentApartment: processedApartment,
        isLoading: false 
      });
      
      return processedApartment;
    } catch (error) {
      // If 404 (no apartment assigned), don't treat as error
      if (error.response?.status === 404) {
        set({
          currentApartment: null,
          isLoading: false
        });
        return null;
      }
      
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching tenant apartment"
      });
      throw error;
    }
  },

  // Create a new apartment
  createApartment: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Process image URLs for the new apartment
      const newApartment = {
        ...response.data.data,
        images: response.data.data.images?.map(img => processImagePath(img)) || []
      };
      
      const currentApartments = get().apartments;
      
      set({
        apartments: [...currentApartments, newApartment],
        isLoading: false,
        message: "Apartment created successfully"
      });
      
      return newApartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error creating apartment"
      });
      throw error;
    }
  },

  // Update an existing apartment
  updateApartment: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Process image URLs for the updated apartment
      const updatedApartment = {
        ...response.data.data,
        images: response.data.data.images?.map(img => processImagePath(img)) || []
      };
      
      // Update apartment in state
      const updatedApartments = get().apartments.map(apt => 
        apt._id === id ? updatedApartment : apt
      );
      
      set({
        apartments: updatedApartments,
        currentApartment: updatedApartment,
        isLoading: false,
        message: "Apartment updated successfully"
      });
      
      return updatedApartment;
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
      
      // Process image URLs for the updated apartment
      const updatedApartment = {
        ...response.data.data,
        images: response.data.data.images?.map(img => processImagePath(img)) || []
      };
      
      // Update apartment in the list
      const updatedApartments = get().apartments.map(apt => 
        apt._id === apartmentId ? updatedApartment : apt
      );
      
      set({
        apartments: updatedApartments,
        isLoading: false,
        message: response.data.message || "Tenant assigned successfully"
      });
      
      return updatedApartment;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error assigning tenant"
      });
      throw error;
    }
  },
  
  // Vacate apartment
  vacateApartment: async (apartmentId) => {
    set({ isLoading: true, error: null });
    try {
      // Make API call to backend to vacate the apartment
      const response = await axios.post(`${API_URL}/vacate`, { 
        apartmentId,
        updateApplicationStatus: true
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to vacate apartment");
      }
      
      // Update local state to reflect the changes
      const apartments = get().apartments;
      const updatedApartments = apartments.map(apt => {
        if (apt._id === apartmentId) {
          return {
            ...apt,
            status: 'available',
            tenant_id: null
          };
        }
        return apt;
      });
      
      set({
        apartments: updatedApartments,
        isLoading: false,
        message: "Apartment successfully vacated"
      });
      
      return true;
    } catch (error) {
      console.error("Error in vacateApartment:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error vacating apartment"
      });
      throw error; // Make sure to throw the error to be caught by the component
    }
  },
  
  // Get available apartments (for tenants to browse)
  getAvailableApartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/list/available`);
      
      // Process image URLs for each apartment
      const processedApartments = response.data.data.map(apartment => ({
        ...apartment,
        images: apartment.images?.map(img => processImagePath(img)) || []
      }));
      
      set({ 
        apartments: processedApartments, 
        isLoading: false 
      });
      
      return processedApartments;
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
  
  // Clear messages (error and success)
  clearMessages: () => {
    set({ error: null, message: null });
  },

  // Fetch apartments (alternative method)
  fetchApartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/apartments`, { 
        withCredentials: true 
      });
      
      if (response.data.success) {
        set({ 
          apartments: response.data.data, 
          isLoading: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch apartments");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching apartments"
      });
      return [];
    }
  }
}));