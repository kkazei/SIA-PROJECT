import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/ui/LoginPage'
import SignUpPage from "./pages/ui/SignUpPage";
import EmailVerificationPage from './pages/auth/EmailVerificationPage'
import ResetPasswordPage from './pages/ui/ResetPasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import DashboardPage from './pages/ui/DashboardPage';
import OAuthSuccess from './pages/auth/OAuthSuccess';
import RoleSelection from './pages/auth/RoleSelection';

import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';


const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    // Skip verification check for Google OAuth users
    if (!user.isVerified && !user.googleId) {
        return <Navigate to='/verify-email' replace />;
    }

    return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && (user.isVerified || user.googleId)) {
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
					element={
						<ProtectedRoute>
							<DashboardPage />
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