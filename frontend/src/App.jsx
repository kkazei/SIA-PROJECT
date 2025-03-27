import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from "./pages/auth/SignUpPage";
import EmailVerificationPage from './pages/auth/EmailVerificationPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import HomePage from './pages/ui/HomePage';
import OAuthSuccess from './pages/auth/OAuthSuccess';
import RoleSelection from './pages/auth/RoleSelection';

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
							<HomePage />
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