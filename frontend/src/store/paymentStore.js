import { create } from 'zustand';
import axios from 'axios';

// Define API base URL for development vs. production
const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000' 
  : '';

const usePaymentStore = create((set) => ({
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  
  // Submit payment proof
  submitPaymentProof: async (formData) => {
    set({ loading: true, error: null });
    
    try {
      console.log('Submitting payment proof...');
      
      // Log the form data keys for debugging
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value instanceof File ? `File: ${value.name}` : value;
      }
      console.log('Form data entries:', formDataEntries);
      
      const response = await axios.post(`${API_BASE_URL}/api/payments/upload-and-create`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );
      
      console.log('Payment proof submission response:', response.data);
      
      // Add new payment to the state
      if (response.data && response.data.payment) {
        set((state) => ({
          payments: [response.data.payment, ...state.payments],
          loading: false
        }));
      } else {
        set({ loading: false });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Server response error data:', error.response.data);
        console.error('Server response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to submit payment proof' 
      });
      
      throw error;
    }
  },
  
  // Get tenant payments
  getTenantPayments: async (tenantId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/tenant/${tenantId}`, {
        withCredentials: true
      });
      
      set({ 
        payments: response.data.payments || [],
        loading: false
      });
      
      return response.data.payments;
    } catch (error) {
      console.error('Error fetching tenant payments:', error);
      
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to load payment history',
        payments: []
      });
      
      return [];
    }
  },
  
  // Get payment details by ID
  getPaymentById: async (paymentId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/${paymentId}`, {
        withCredentials: true
      });
      
      set({ 
        selectedPayment: response.data.payment,
        loading: false
      });
      
      return response.data.payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to load payment details'
      });
      
      throw error;
    }
  },
  
  // Clear payment store data (for logout)
  clearPaymentData: () => {
    set({ 
      payments: [],
      selectedPayment: null,
      error: null
    });
  }
}));

export { usePaymentStore };
