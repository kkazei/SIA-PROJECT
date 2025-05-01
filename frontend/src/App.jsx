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
    const { user } = useAuthStore();
    
    if (user.role === 'admin') {
        return <Navigate to='/admin/dashboard' replace />;
    } else if (user.role === 'landlord') {
        return <Navigate to='/landlord/dashboard' replace />;
    } else if (user.role === 'tenant') {
        return <Navigate to='/tenant/dashboard' replace />;
    }
    
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
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return <LoadingSpinner />;

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
                            <RoleBasedRoute>
                                <LandingPage />
                            </RoleBasedRoute>
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