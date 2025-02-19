import { create } from "zustand";
import axios from "axios";

export const useMaintenanceStore = create((set) => ({
    maintenanceRequests: [],
    isLoading: false,
    error: null,
    fetchMaintenance: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get("/api/maintenance", { withCredentials: true });
            set({ maintenanceRequests: response.data, isLoading: false });
        } catch (error) {
            set({ error: "Failed to fetch maintenance requests", isLoading: false });
        }
    },
}));
