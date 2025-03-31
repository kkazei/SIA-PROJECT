import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from "./pages/auth/SignUpPage";
import EmailVerificationPage from './pages/auth/EmailVerificationPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import LandingPage from './pages/LandingPage'
import OAuthSuccess from './pages/auth/OAuthSuccess';
import DashboardPage from './pages/landlord/DashboardPage';
import TenantDashboard from './pages/tenant/TenantDashboard';
import RoleSelection from './pages/auth/RoleSelection';
import TenantPage from './pages/landlord/TenantPage'; // Import the TenantPage component
import Announcement from './pages/landlord/Announcement'; // Import the Announcement component
import MaintenancePage from './pages/landlord/MaintenancePage'; // Import the MaintenancePage component
import ArchivePage from './pages/landlord/ArchivePage'; // Import the ArchivePage component
import LandlordLayout from './components/layout/LandlordLayout'; // Import the LandlordLayout component
import LandlordApplications from "./pages/landlord/LandlordApplications"; // Import the LandlordApplications component
import InquiryPage from "./pages/landlord/InquiriesPage"; // Import the InquiryPage component

import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

// Update the ProtectedRoute component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
  
    // Check if the user is authenticated at all
    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }
  
    // Get and immediately clear the bypass flag to prevent it from persisting
    const bypassVerification = localStorage.getItem('bypassVerification') === 'true';
    if (bypassVerification) {
      localStorage.removeItem('bypassVerification');
    }
  
    // Check verification status, skipping for Google users and when bypass flag is set
    const skipVerification = user.googleId || bypassVerification || user.isVerified;
    if (!skipVerification) {
      return <Navigate to='/verify-email' replace />;
    }
  
    return children;
};

// Route component that checks user role and redirects accordingly
const RoleBasedRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    // If user is a landlord, redirect to landlord dashboard
    if (user.role === 'landlord') {
        return <Navigate to='/landlord/dashboard' replace />;
    } else if (user.role === 'tenant') {
        return <Navigate to='/tenant/dashboard' replace />;
    }
    
    // For users without a specific role, show the regular home page
    return children;
};

// For landlord routes, ensure only landlords can access
const LandlordRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    // If not a landlord, redirect to home
    if (user.role !== 'landlord') {
        return <Navigate to='/' replace />;
    }
    
    return children;
};

// For tenant routes, ensure only tenants can access
const TenantRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    // If not a tenant, redirect to home
    if (user.role !== 'tenant') {
        return <Navigate to='/' replace />;
    }
    
    return children;
};

// redirect authenticated users to the appropriate dashboard
const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && (user.isVerified || user.googleId)) {
        // If user is landlord, redirect to landlord dashboard
        if (user.role === 'landlord') {
            return <Navigate to='/landlord/dashboard' replace />;
        }
        // If user is tenant, redirect to tenant dashboard
        else if (user.role === 'tenant') {
            return <Navigate to='/tenant/dashboard' replace />;
        }
        // Otherwise redirect to home
        return <Navigate to='/' replace />;
    }

    return children;
};

function App() {
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return <LoadingSpinner />;

    return (
            <Routes>
                <Route
                    path='/'
                    element={<LandingPage />}
                />
                {/* Dashboard for authenticated users */}
                <Route
                    path='/dashboard'
                    element={
                        <ProtectedRoute>
                            <RoleBasedRoute>
                                <LandingPage />
                            </RoleBasedRoute>
                        </ProtectedRoute>
                    }
                />
                {/* Landlord Routes */}
                <Route
                    path='/landlord/dashboard'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <DashboardPage />
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/landlord/tenants'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <LandlordLayout>
                                    <TenantPage />
                                </LandlordLayout>
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/landlord/announcements'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <LandlordLayout>
                                    <Announcement />
                                </LandlordLayout>
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/maintenance'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <LandlordLayout>
                                    <MaintenancePage />
                                </LandlordLayout>
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/archive'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <LandlordLayout>
                                    <ArchivePage />
                                </LandlordLayout>
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/landlord/applications'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <LandlordApplications />
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/landlord/inquiries'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <InquiryPage />
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                {/* Tenant Routes */}
                <Route
                    path='/tenant/dashboard'
                    element={
                        <ProtectedRoute>
                            <TenantRoute>
                                <TenantDashboard />
                            </TenantRoute>
                        </ProtectedRoute>
                    }
                />
              

                <Route
                    path='/signup'
                    element={
                        <RedirectAuthenticatedUser>
                            <SignUpPage />
                        </RedirectAuthenticatedUser>
                    }
                />
                <Route
                    path='/login'
                    element={
                        <RedirectAuthenticatedUser>
                            <LoginPage />
                        </RedirectAuthenticatedUser>
                    }
                />
                <Route path='/verify-email' element={<EmailVerificationPage />} />
                <Route
                    path='/forgot-password'
                    element={
                        <RedirectAuthenticatedUser>
                            <ForgotPasswordPage />
                        </RedirectAuthenticatedUser>
                    }
                />
                <Route
                    path='/reset-password/:token'
                    element={
                        <RedirectAuthenticatedUser>
                            <ResetPasswordPage />
                        </RedirectAuthenticatedUser>
                    }
                />
                
                {/* OAuth routes */}
                <Route path="/oauth-success" element={<OAuthSuccess />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                {/* catch all routes */}
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
    );
}

export default App;