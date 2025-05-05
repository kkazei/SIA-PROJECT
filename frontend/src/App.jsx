import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'; // Add lazy and Suspense
import LoadingSpinner from './components/ui/LoadingSpinner'
import LandingPage from './pages/LandingPage' // Keep this eagerly loaded
import { useAuthStore } from './store/authStore';

// Lazy load authentication pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const OAuthSuccess = lazy(() => import('./pages/auth/OAuthSuccess'));
const RoleSelection = lazy(() => import('./pages/auth/RoleSelection'));

// Lazy load landlord pages
const DashboardPage = lazy(() => import('./pages/landlord/DashboardPage'));
const TenantPage = lazy(() => import('./pages/landlord/TenantPage'));
const Announcement = lazy(() => import('./pages/landlord/Announcement'));
const MaintenancePage = lazy(() => import('./pages/landlord/MaintenancePage'));
const ArchivePage = lazy(() => import('./pages/landlord/ArchivePage'));
const LandlordApplications = lazy(() => import('./pages/landlord/LandlordApplications'));
const InquiryPage = lazy(() => import('./pages/landlord/InquiriesPage'));

// Lazy load tenant pages
const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Lazy load layouts
const LandlordLayout = lazy(() => import('./components/layout/LandlordLayout'));

// Keep the route protection components
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
  
    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }
  
    const bypassVerification = localStorage.getItem('bypassVerification') === 'true';
    if (bypassVerification) {
      localStorage.removeItem('bypassVerification');
    }
  
    const skipVerification = user.googleId || bypassVerification || user.isVerified;
    if (!skipVerification) {
      return <Navigate to='/verify-email' replace />;
    }
  
    return children;
};

// Keep the rest of your route protection components unchanged
const RoleBasedRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuthStore();
    
    // Add safety checks
    if (!isAuthenticated || !user) {
        console.log("User not authenticated or user object missing");
        return <Navigate to='/login' replace />;
    }
    
    // Add logging to see what's happening
    console.log("Current user role:", user.role);
    
    if (!user.role) {
        console.log("User has no role assigned");
        return <Navigate to='/role-selection' replace />;
    }
    
    // Rest of your routing logic
    if (user.role === 'admin') {
        return <Navigate to='/admin/dashboard' replace />;
    } else if (user.role === 'landlord') {
        return <Navigate to='/landlord/dashboard' replace />;
    } else if (user.role === 'tenant') {
        return <Navigate to='/tenant/dashboard' replace />;
    }
    
    // Fallback - shouldn't reach here if roles are properly set
    console.warn("User has unrecognized role:", user.role);
    return children;
};

const LandlordRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    if (user.role !== 'landlord') {
        return <Navigate to='/' replace />;
    }
    
    return children;
};

const TenantRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    if (user.role !== 'tenant') {
        return <Navigate to='/' replace />;
    }
    
    return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    if (user.role !== 'admin') {
        return <Navigate to='/' replace />;
    }
    
    return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && (user.isVerified || user.googleId)) {
        if (user.role === 'admin') {
            return <Navigate to='/admin/dashboard' replace />;
        } else if (user.role === 'landlord') {
            return <Navigate to='/landlord/dashboard' replace />;
        } else if (user.role === 'tenant') {
            return <Navigate to='/tenant/dashboard' replace />;
        }
        return <Navigate to='/' replace />;
    }

    return children;
};

function App() {
    const { isCheckingAuth, checkAuth, user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    
    // Add more detailed loading conditions
    if (isCheckingAuth || (isAuthenticated && !user)) {
        console.log("Waiting for auth check or user data...");
        return <LoadingSpinner />;
    }
    
    // Add debugging in production
    console.log("Auth state:", { isAuthenticated, userExists: !!user, role: user?.role });

    return (
        // Wrap routes in Suspense to handle lazy loading
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Landing page - eagerly loaded */}
                <Route path='/' element={<LandingPage />} />
                
                {/* Dashboard for authenticated users */}
                <Route
                    path='/dashboard'
                    element={
                        <ProtectedRoute>
                            {/* Directly redirect based on user role without nested components */}
                            {({ user }) => {
                                if (user?.role === 'landlord') return <Navigate to='/landlord/dashboard' replace />;
                                if (user?.role === 'tenant') return <Navigate to='/tenant/dashboard' replace />;
                                if (user?.role === 'admin') return <Navigate to='/admin/dashboard' replace />;
                                return <Navigate to='/' replace />;
                            }}
                        </ProtectedRoute>
                    }
                />
                
                {/* Admin Routes */}
                <Route
                    path='/admin/dashboard'
                    element={
                        <ProtectedRoute>
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
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
                
                {/* The rest of your routes remain the same but will now be lazy-loaded */}
                <Route
                    path='/landlord/tenants'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <TenantPage />
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path='/landlord/announcements'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <Suspense fallback={<LoadingSpinner />}>
                                    <LandlordLayout>
                                        <Announcement />
                                    </LandlordLayout>
                                </Suspense>
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path='/maintenance'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <Suspense fallback={<LoadingSpinner />}>
                                    <LandlordLayout>
                                        <MaintenancePage />
                                    </LandlordLayout>
                                </Suspense>
                            </LandlordRoute>
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path='/archive'
                    element={
                        <ProtectedRoute>
                            <LandlordRoute>
                                <Suspense fallback={<LoadingSpinner />}>
                                    <LandlordLayout>
                                        <ArchivePage />
                                    </LandlordLayout>
                                </Suspense>
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
              
                {/* Auth Routes */}
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
        </Suspense>
    );
}

export default App;