import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

axios.defaults.withCredentials = true;

export const useTenantDashboardStore = create((set, get) => ({
  tenantDetails: null,
  announcements: [],
  paymentQR: null,
  loading: false,
  error: null,
  success: null,
  
  // Fetch tenant details including apartment information
  fetchTenantDetails: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/details`);
      
      if (response.data.success) {
        set({ 
          tenantDetails: response.data.tenant,
          paymentQR: response.data.tenant.paymentQR || null,
          loading: false 
        });
        return response.data.tenant;
      } else {
        throw new Error(response.data.message || "Failed to fetch tenant details");
      }
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      set({ 
        error: error.response?.data?.message || error.message || "Failed to fetch tenant details", 
        loading: false 
      });
      throw error;
    }
  },
  
  // Fetch announcements from landlord
  fetchAnnouncements: async () => {
    set({ loading: true, error: null });
    try {
      // Use the new dedicated endpoint
      const response = await axios.get(`${API_URL}/tenant-announcements`);
      
      if (response.data.success) {
        const announcements = response.data.data?.map(announcement => {
          if (announcement.image_path) {
            return {
              ...announcement,
              image_path: announcement.image_path.startsWith('http') 
                ? announcement.image_path 
                : `${import.meta.env.MODE === "development" ? "http://localhost:5000" : ""}${announcement.image_path}`
            };
          }
          return announcement;
        }) || [];
        
        set({ 
          announcements,
          loading: false 
        });
      } else {
        console.warn("No success flag in announcement response");
        set({ 
          announcements: [],
          loading: false 
        });
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      
      // If the main endpoint fails, try the fallback
      try {
        console.log("Trying fallback endpoint...");
        const fallbackResponse = await axios.get(`${API_URL}/tenant-announcements/all`);
        
        if (fallbackResponse.data.success) {
          const announcements = fallbackResponse.data.data?.map(announcement => {
            if (announcement.image_path) {
              return {
                ...announcement,
                image_path: announcement.image_path.startsWith('http') 
                  ? announcement.image_path 
                  : `${import.meta.env.MODE === "development" ? "http://localhost:5000" : ""}${announcement.image_path}`
              };
            }
            return announcement;
          }) || [];
          
          set({ 
            announcements,
            loading: false 
          });
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      
      // If both fail, set empty announcements
      set({ 
        announcements: [],
        error: error.response?.data?.message || 'Failed to fetch announcements', 
        loading: false 
      });
    }
  },
  
  // Submit payment proof
  submitPayment: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const formData = new FormData();
      formData.append('amount', data.amount || '');
      formData.append('referenceNumber', data.referenceNumber);
      
      if (data.proofImage) {
        formData.append('proofImage', data.proofImage);
      }
      
      const response = await axios.post(`${API_URL}/tenant/payments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set({ 
        loading: false,
        success: "Payment proof submitted successfully!" 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => set({ success: null }), 3000);
      
      return response.data;
    } catch (error) {
      console.error("Error submitting payment:", error);
      set({ 
        error: error.response?.data?.message || "Failed to submit payment proof", 
        loading: false 
      });
      throw error;
    }
  },
  
  // Submit inquiry to landlord
  submitInquiry: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      
      if (data.attachmentFile) {
        formData.append('attachment', data.attachmentFile);
      }
      
      const response = await axios.post(`${API_URL}/tenant/inquiries`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set({ 
        loading: false,
        success: "Inquiry submitted successfully!" 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => set({ success: null }), 3000);
      
      return response.data;
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      set({ 
        error: error.response?.data?.message || "Failed to submit inquiry", 
        loading: false 
      });
      throw error;
    }
  },
  
  // Get payment history
  fetchPaymentHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/tenant/payments`);
      
      set({ loading: false });
      return response.data.payments || [];
    } catch (error) {
      console.error("Error fetching payment history:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch payment history", 
        loading: false 
      });
      return [];
    }
  },
  
  // Clear error message
  clearError: () => set({ error: null }),
  
  // Clear success message
  clearSuccess: () => set({ success: null }),
  
  // Reset store data (for logout)
  resetStore: () => set({ 
    tenantDetails: null, 
    announcements: [], 
    paymentQR: null, 
    loading: false, 
    error: null, 
    success: null 
  })
}));