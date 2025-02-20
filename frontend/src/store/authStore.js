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
    userRole: null,

    signup: async (user_email, password, user_fullname, user_phone) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, { user_email, password, user_fullname, user_phone });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response.data.message || "Error signing up", isLoading: false });
            throw error;
        }
    },

    signupTenant: async (tenant_email, password, tenant_fullname, tenant_phone) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup-tenant`, { tenant_email, password, tenant_fullname, tenant_phone });
            set({ user: response.data.tenant, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error signing up tenant", isLoading: false });
            throw error;
        }
    },

    login: async (user_email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { user_email, password });
            set({
                isAuthenticated: true,
                user: response.data.user,
                isLoading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },

    TenantLogin: async (tenant_email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/TenantLogin`, { tenant_email, password });
            set({
                isAuthenticated: true,
                user: response.data.user,
                isLoading: false,
                userRole: "tenant",
            });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
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
            set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            console.log("Checking authentication...");
            const response = await axios.get(`${API_URL}/check-auth`);
            
            if (response.data.user) {
                console.log("User authenticated:", response.data.user);
                set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
            } else {
                console.log("No user logged in.");
                set({ isAuthenticated: false, isCheckingAuth: false });
            }
        } catch {
            console.log("No active session.");
            set({ isAuthenticated: false, isCheckingAuth: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error sending reset email", isLoading: false });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password`, { token, password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error resetting password", isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false, isLoading: false, userRole: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error logging out", isLoading: false });
            throw error;
        }
    },
}));