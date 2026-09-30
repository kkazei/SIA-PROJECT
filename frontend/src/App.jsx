import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react';
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/public/LandingPage.jsx'
import { useAuthStore } from './store/authStore';
import { SocketProvider } from './context/SocketContext';
import { getRolePath } from './utils/roleRouting';

// Lazy load authentication pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const UnauthorizedPage = lazy(() => import('./pages/auth/Unauthorized'));
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

const BrowseApartmentsPage = lazy(() => import('./pages/tenant/BrowseApartmentsPage.jsx'));
const MessagingPage = lazy(() => import('./pages/messaging/MessagingPage.jsx'));

const LandlordRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    if (user.role !== 'landlord') {
        return <Navigate to='/unauthorized' replace />;
    }
    
    return children;
};

const TenantRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    if (user.role !== 'tenant') {
        return <Navigate to='/unauthorized' replace />;
    }
    
    return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuthStore();
    
    if (user.role !== 'admin') {
        return <Navigate to='/unauthorized' replace />;
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
        return <Navigate to={getRolePath(user.role)} replace />;
    }

    return children;
};

const DashboardRouter = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    
    useEffect(() => {
      // Check if user needs role selection
      if (isAuthenticated && user && (!user.role || user.role === 'unset')) {
        console.log("User has no role, redirecting to role selection");
        navigate('/role-selection', { replace: true });
        return;
      }
      
      // Route based on role
            if (user?.role) {
                navigate(getRolePath(user.role), { replace: true });
      }
    }, [user, isAuthenticated, navigate]);
    
    return <LoadingSpinner />;
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
        <SocketProvider>
            {/* Wrap routes in Suspense to handle lazy loading */}
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Landing page - eagerly loaded */}
                    <Route path='/' element={<LandingPage />} />
                    <Route path='/browse-apartments' element={<BrowseApartmentsPage />} />
                    
                    {/* Dashboard for authenticated users */}
                    <Route
                        path='/dashboard'
                        element={
                            <ProtectedRoute>
                                <DashboardRouter />
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
                    
                    <Route
                        path='/tenant/browse-apartments'
                        element={
                            <ProtectedRoute>
                                <TenantRoute>
                                    <BrowseApartmentsPage />
                                </TenantRoute>
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route path="/tenant">
                        <Route
                            path="messages"
                            element={
                                <ProtectedRoute allowedRoles={['tenant']}>
                                    <MessagingPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                    
                    <Route path="/landlord">
                        <Route
                            path="messages"
                            element={
                                <ProtectedRoute allowedRoles={['landlord']}>
                                    <MessagingPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                  
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
                    <Route path='/unauthorized' element={<UnauthorizedPage />} />
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
                    <Route
                        path="/role-selection"
                        element={
                            <ProtectedRoute allowUnassigned>
                                <RoleSelection />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* catch all routes */}
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
            </Suspense>
        </SocketProvider>
    );
}

export default App;
