import { create } from 'zustand';
import axios from 'axios';

// Define API base URL for development vs. production
const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000' 
  : '';

// Helper function to process image paths - ADDED THIS FUNCTION
const processImagePath = (path) => {
  if (!path) return null;
  if (typeof path === 'string' && path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const usePaymentStore = create((set, get) => ({
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
  
  // Get tenant payments - MODIFIED TO PROCESS PROOF URLS
  getTenantPayments: async (tenantId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/tenant/${tenantId}`, {
        withCredentials: true
      });
      
      // Process payment proof URLs
      const processedPayments = (response.data.payments || []).map(payment => ({
        ...payment,
        amount: Number(payment.amount || 0), // Ensure amount is a number for calculations
        displayUrl: processImagePath(payment.image_path || payment.proofUrl)
      }));
      
      set({ 
        payments: processedPayments,
        loading: false
      });
      
      return processedPayments;
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
  
  // NEW FUNCTION: Get all payments for landlord dashboard
  getAllPayments: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`, {
        withCredentials: true
      });
      
      // Process payment proof URLs and ensure amounts are numbers
      const processedPayments = (response.data.payments || []).map(payment => ({
        ...payment,
        amount: Number(payment.amount || 0), // Important for calculations
        displayUrl: processImagePath(payment.image_path || payment.proofUrl)
      }));
      
      console.log('All payments loaded:', processedPayments.length);
      
      set({ 
        payments: processedPayments,
        loading: false
      });
      
      return processedPayments;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to load payments',
        payments: []
      });
      
      return [];
    }
  },
  
  // Get payment details by ID - MODIFIED TO PROCESS PROOF URL
  getPaymentById: async (paymentId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/${paymentId}`, {
        withCredentials: true
      });
      
      // Process payment proof URL
      const processedPayment = response.data.payment ? {
        ...response.data.payment,
        proofUrl: processImagePath(response.data.payment.proofUrl)
      } : null;
      
      set({ 
        selectedPayment: processedPayment,
        loading: false
      });
      
      return processedPayment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to load payment details'
      });
      
      throw error;
    }
  },
  
  // Approve payment - ADD withCredentials: true 
  approvePayment: async (paymentId, remarks) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/payments/${paymentId}`, {
        status: 'approved',
        admin_remarks: remarks || 'Payment approved'
      }, { withCredentials: true }); // ADDED credentials
      
      // Update the payment in our local state too
      const currentPayments = get().payments;
      const updatedPayments = currentPayments.map(payment => 
        payment._id === paymentId 
          ? { ...payment, status: 'approved' } 
          : payment
      );
      
      set({ payments: updatedPayments });
      
      // After approval, refresh all payments for the dashboard
      get().getAllPayments();
      
      console.log('Payment approved:', response.data);
      return true;
    } catch (error) {
      console.error('Error approving payment:', error);
      return false;
    }
  },
  
  // Reject payment - ADD withCredentials: true
  rejectPayment: async (paymentId, remarks) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/payments/${paymentId}`, {
        status: 'rejected',
        admin_remarks: remarks || 'Payment rejected'
      }, { withCredentials: true }); // ADDED credentials
      
      // Update the payment in our local state too
      const currentPayments = get().payments;
      const updatedPayments = currentPayments.map(payment => 
        payment._id === paymentId 
          ? { ...payment, status: 'rejected' } 
          : payment
      );
      
      set({ payments: updatedPayments });
      
      console.log('Payment rejected:', response.data);
      return true;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      return false;
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

export { usePaymentStore, processImagePath };