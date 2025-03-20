import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

axios.defaults.withCredentials = true;

export const useTenantStore = create((set, get) => ({
  tenants: [],
  selectedTenant: null,
  loading: false,
  error: null,
  
  fetchTenants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/landlord/tenants`);
      set({ tenants: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching tenants", 
        loading: false 
      });
    }
  },
  
  getTenantById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenants/${id}`);
      set({ selectedTenant: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error fetching tenant details", 
        loading: false 
      });
      throw error;
    }
  },
  
  updateTenantStatus: async (tenantId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/tenants/${tenantId}/status`, { status });
      
      // Update tenant in the tenants list
      set(state => ({
        tenants: state.tenants.map(tenant => 
          tenant._id === tenantId ? { ...tenant, status } : tenant
        ),
        loading: false
      }));
      
      // Update selected tenant if it's the same one
      if (get().selectedTenant?._id === tenantId) {
        set(state => ({
          selectedTenant: { ...state.selectedTenant, status }
        }));
      }
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error updating tenant status", 
        loading: false 
      });
      throw error;
    }
  },
  
  uploadPaymentQR: async (file, details) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("qrImage", file);
      formData.append("details", details);
      
      const response = await axios.post(`${API_URL}/payment-qr`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || "Error uploading payment QR", 
        loading: false 
      });
      throw error;
    }
  }
}));