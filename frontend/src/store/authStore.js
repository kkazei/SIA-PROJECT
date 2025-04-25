import { create } from "zustand";
import { persist } from "zustand/middleware"; // Import persist middleware
import axios from "axios";

// Use absolute URLs in production to avoid routing issues
const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "https://sia-project-fg0k.onrender.com"; // Replace with your actual production backend URL

const API_URL = `${API_BASE}/api/auth`;

axios.defaults.withCredentials = true;

// Create a persisted store to maintain auth state across page reloads
export const useAuthStore = create(
  persist(
    (set) => ({
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
          set({ 
            error: error.response?.data?.message || "Error signing up", 
            isLoading: false 
          });
          throw error;
        }
      },
      
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
          set({ 
            error: error.response?.data?.message || "Error logging in", 
            isLoading: false 
          });
          throw error;
        }
      },

      // Add Google OAuth methods - update the URLs to use API_BASE
      initiateGoogleLogin: () => {
        // This will redirect to Google OAuth page
        window.location.href = `${API_URL}/google`;
      },

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
          const response = await axios.get(`${API_URL}/check-auth`);
          
          set({
            isAuthenticated: true,
            user: response.data.user,
            error: null,
            isLoading: false,
          });
          
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
          // Still clear the local state even if the API call fails
          set({ user: null, isAuthenticated: false, error: null, isLoading: false });
          console.error("Logout error:", error);
        }
      },

      // Other methods remain the same...
      verifyEmail: async (code) => {
        // Existing implementation
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/verify-email`, { code });
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return response.data;
        } catch (error) {
          set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/check-auth`);
          set({ 
            user: response.data.user, 
            isAuthenticated: true, 
            isCheckingAuth: false 
          });
          return response.data.user;
        } catch (error) {
          set({ 
            user: null,
            isAuthenticated: false, 
            error: null, 
            isCheckingAuth: false 
          });
        }
      },

      // Remaining methods stay the same...
      forgotPassword: async (email) => {
        // Existing implementation
      },

      resetPassword: async (token, password) => {
        // Existing implementation
      },
    }),
    {
      name: "rentflow-auth-storage", // Name for the storage key
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);