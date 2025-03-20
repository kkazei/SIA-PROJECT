import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

axios.defaults.withCredentials = true;

export const useApartmentStore = create((set) => ({
    apartments: [],
    error: null,
    isLoading: false,
    message: null,

    createApartment: async (room, rent, description) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/apartments`, { room, rent, description });
            set((state) => ({
                apartments: [...state.apartments, response.data],
                message: "Apartment created successfully",
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error creating apartment", isLoading: false });
            throw error;
        }
    },

    fetchApartments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/apartments`);
            set({ apartments: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error fetching apartments", isLoading: false });
            throw error;
        }
    },
    
    assignTenantToApartment: async (apartmentId, tenantId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/assign-tenant`, {
                apartmentId,
                tenantId
            });
            
            // Update the apartments state to reflect the assigned tenant
            set((state) => ({
                apartments: state.apartments.map(apartment => 
                    apartment._id === apartmentId 
                        ? { ...apartment, tenant_id: tenantId }
                        : apartment
                ),
                message: "Tenant assigned successfully",
                isLoading: false
            }));
            
            return response.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error assigning tenant to apartment", 
                isLoading: false 
            });
            throw error;
        }
    }
}));