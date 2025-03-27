import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,

	signup: async (email, password, name) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, name });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
    
// Update this in your auth store
login: async (email, password) => {
	set({ isLoading: true, error: null });
	try {
	  const response = await axios.post(`${API_URL}/login`, { email, password });
	  const { user, needsEmailVerification } = response.data;
	  
	  set({
		isAuthenticated: true,
		user: user,
		error: null,
		isLoading: false,
	  });
	  
	  // Check if user needs email verification
	  if (needsEmailVerification || !user.isVerified) {
		return { needsEmailVerification: true };
	  }
	  
	  // Check if user needs to select a role
	  if (!user.role || user.role === 'unset') {
		return { needsRoleSelection: true };
	  }
	  
	  return { success: true };
	} catch (error) {
	  set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
	  throw error;
	}
  },

	// Add Google OAuth methods
	initiateGoogleLogin: () => {
		// This will redirect to Google OAuth page
		window.location.href = `${API_URL}/google`;
	},

	// Handle role selection after OAuth signup
	// Update in your authStore.js
setRole: async (role) => {
	set({ isLoading: true, error: null });
	try {
	  const response = await axios.post(`${API_URL}/set-role`, { role });
	  
	  // Explicitly ensure isVerified is true in the local user object
	  const updatedUser = {
		...response.data.user,
		isVerified: true
	  };
	  
	  // Update the store with the updated user
	  set({
		isAuthenticated: true,
		user: updatedUser,
		error: null,
		isLoading: false,
	  });
	  
	  return updatedUser;
	} catch (error) {
	  set({ 
		error: error.response?.data?.message || "Error setting role", 
		isLoading: false 
	  });
	  throw error;
	}
  },

	// Process OAuth callback/success
	processOAuthCallback: async () => {
		set({ isLoading: true, error: null });
		try {
			// This assumes the token is already set in cookies by the backend
			const response = await axios.get(`${API_URL}/check-auth`);
			
			// Make sure this is returning ALL user data including role
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
			
			// Return the complete user object for decision-making
			return response.data.user;
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "OAuth authentication failed", 
				isLoading: false 
			});
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},

	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},

	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
}));