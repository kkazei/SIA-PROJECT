import { createStore } from 'vuex'; // Or your preferred state management library
import axios from 'axios';

// API URL for invoices
const API_URL = '/api/invoices';

export default createStore({
  state: {
    invoices: [],
    currentInvoice: null,
    isLoading: false,
    error: null,
    filters: {
      tenant_id: null,
      apartment_id: null,
      isPaid: null,
      isArchived: false
    }
  },
  
  getters: {
    // Get all invoices
    getAllInvoices: (state) => state.invoices,
    
    // Get currently selected invoice
    getCurrentInvoice: (state) => state.currentInvoice,
    
    // Check if data is loading
    isLoading: (state) => state.isLoading,
    
    // Get any error messages
    getError: (state) => state.error,
    
    // Get paid invoices
    getPaidInvoices: (state) => state.invoices.filter(invoice => invoice.paid_date !== null),
    
    // Get unpaid invoices
    getUnpaidInvoices: (state) => state.invoices.filter(invoice => invoice.paid_date === null),
    
    // Get archived invoices
    getArchivedInvoices: (state) => state.invoices.filter(invoice => invoice.isArchived),
    
    // Get total amount of all invoices
    getTotalAmount: (state) => state.invoices.reduce((total, invoice) => total + invoice.amount, 0),
    
    // Get total amount of paid invoices
    getTotalPaidAmount: (state) => {
      return state.invoices
        .filter(invoice => invoice.paid_date !== null)
        .reduce((total, invoice) => total + invoice.amount, 0);
    },
    
    // Get total amount of unpaid invoices
    getTotalUnpaidAmount: (state) => {
      return state.invoices
        .filter(invoice => invoice.paid_date === null)
        .reduce((total, invoice) => total + invoice.amount, 0);
    },
    
    // Get current filters
    getCurrentFilters: (state) => state.filters
  },
  
  mutations: {
    // Set all invoices
    SET_INVOICES(state, invoices) {
      state.invoices = invoices;
    },
    
    // Set current invoice
    SET_CURRENT_INVOICE(state, invoice) {
      state.currentInvoice = invoice;
    },
    
    // Add new invoice to state
    ADD_INVOICE(state, invoice) {
      state.invoices.unshift(invoice); // Add to beginning of array
    },
    
    // Update existing invoice
    UPDATE_INVOICE(state, updatedInvoice) {
      const index = state.invoices.findIndex(invoice => invoice._id === updatedInvoice._id);
      if (index !== -1) {
        state.invoices.splice(index, 1, updatedInvoice);
        if (state.currentInvoice && state.currentInvoice._id === updatedInvoice._id) {
          state.currentInvoice = updatedInvoice;
        }
      }
    },
    
    // Remove invoice from state
    REMOVE_INVOICE(state, invoiceId) {
      state.invoices = state.invoices.filter(invoice => invoice._id !== invoiceId);
      if (state.currentInvoice && state.currentInvoice._id === invoiceId) {
        state.currentInvoice = null;
      }
    },
    
    // Set loading state
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    
    // Set error state
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    // Update filters
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    }
  },
  
  actions: {
    // Fetch all invoices with optional filters
    async fetchInvoices({ commit, state }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // Build query parameters from filters
        const params = {};
        if (state.filters.tenant_id) params.tenant_id = state.filters.tenant_id;
        if (state.filters.apartment_id) params.apartment_id = state.filters.apartment_id;
        if (state.filters.isPaid !== null) params.isPaid = state.filters.isPaid;
        if (state.filters.isArchived !== null) params.isArchived = state.filters.isArchived;
        
        const response = await axios.get(API_URL, { params });
        commit('SET_INVOICES', response.data.invoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        commit('SET_ERROR', 'Failed to load invoices. Please try again.');
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Fetch single invoice by ID
    async fetchInvoiceById({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        commit('SET_CURRENT_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error(`Error fetching invoice ${id}:`, error);
        commit('SET_ERROR', 'Failed to load invoice. Please try again.');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Create a new invoice
    async createInvoice({ commit }, invoiceData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.post(API_URL, invoiceData);
        commit('ADD_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error('Error creating invoice:', error);
        commit('SET_ERROR', error.response?.data?.message || 'Failed to create invoice');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Update an existing invoice
    async updateInvoice({ commit }, { id, data }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.put(`${API_URL}/${id}`, data);
        commit('UPDATE_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error(`Error updating invoice ${id}:`, error);
        commit('SET_ERROR', error.response?.data?.message || 'Failed to update invoice');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Mark invoice as paid
    async markInvoiceAsPaid({ commit }, { id, paidDate = null }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.patch(`${API_URL}/${id}/pay`, { paid_date: paidDate });
        commit('UPDATE_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error(`Error marking invoice ${id} as paid:`, error);
        commit('SET_ERROR', 'Failed to mark invoice as paid');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Update invoice image
    async updateInvoiceImage({ commit }, { id, imagePath }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.patch(`${API_URL}/${id}/image`, { image_path: imagePath });
        commit('UPDATE_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error(`Error updating invoice image for ${id}:`, error);
        commit('SET_ERROR', 'Failed to update invoice image');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Toggle invoice visibility
    async toggleInvoiceVisibility({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.patch(`${API_URL}/${id}/visibility`);
        commit('UPDATE_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error(`Error toggling visibility for invoice ${id}:`, error);
        commit('SET_ERROR', 'Failed to toggle invoice visibility');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Toggle invoice archive status
    async toggleInvoiceArchive({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.patch(`${API_URL}/${id}/archive`);
        commit('UPDATE_INVOICE', response.data.invoice);
        return response.data.invoice;
      } catch (error) {
        console.error(`Error toggling archive status for invoice ${id}:`, error);
        commit('SET_ERROR', 'Failed to toggle invoice archive status');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Delete an invoice
    async deleteInvoice({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        await axios.delete(`${API_URL}/${id}`);
        commit('REMOVE_INVOICE', id);
        return true;
      } catch (error) {
        console.error(`Error deleting invoice ${id}:`, error);
        commit('SET_ERROR', 'Failed to delete invoice');
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Update filters and reload invoices
    async setFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters);
      await dispatch('fetchInvoices');
    },
    
    // Clear all filters
    async clearFilters({ commit, dispatch }) {
      commit('SET_FILTERS', {
        tenant_id: null,
        apartment_id: null,
        isPaid: null,
        isArchived: false
      });
      await dispatch('fetchInvoices');
    }
  }
});
