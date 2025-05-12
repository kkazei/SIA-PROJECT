import { create } from "zustand";
import { persist } from "zustand/middleware"; // Import persist middleware
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null, // Add explicit token storage
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

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/login`, { email, password });
          const { user, token, needsEmailVerification } = response.data; // Extract token
          
          set({
            isAuthenticated: true,
            user: user,
            token: token, // Store token explicitly
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

      // Update check-auth to store token as well
      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/check-auth`);
          
          // Make sure your API returns a token here too
          set({ 
            user: response.data.user, 
            token: response.data.token, // Store token from response
            isAuthenticated: true, 
            isCheckingAuth: false 
          });
          
          return response.data.user;
        } catch (error) {
          console.error("Auth check error:", error);
          set({ 
            user: null,
            token: null, // Clear token on failed auth
            isAuthenticated: false, 
            isCheckingAuth: false, 
            error: null 
          });
          
          return null;
        }
      },

      // Make sure logout clears token
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${API_URL}/logout`);
          set({ 
            user: null, 
            token: null, // Clear token on logout
            isAuthenticated: false, 
            error: null, 
            isLoading: false 
          });
        } catch (error) {
          set({ error: "Error logging out", isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/verify-email`, { code });
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          // Return the entire response data which includes needsRoleSelection flag
          return response.data;
        } catch (error) {
          set({ error: error.response.data.message || "Error verifying email", isLoading: false });
          throw error;
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

      // Update other auth methods as needed...
    }),
    {
      name: "auth-store", // Storage key
      getStorage: () => localStorage // Use localStorage for persistence
    }
  )
);