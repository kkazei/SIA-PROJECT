import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuthStore();
  
  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Get the latest user data from the server
        const userData = await checkAuth();
        
        console.log("OAuth success - user data:", userData);
        
        // Check if user needs to select a role
        if (!userData?.role || userData.role === 'unset') {
          console.log("User needs to select a role, redirecting to role selection");
          navigate('/role-selection', { replace: true });
        } else {
          // User already has a role, redirect to their dashboard
          console.log("User has role:", userData.role);
          
          if (userData.role === 'landlord') {
            navigate('/landlord/dashboard', { replace: true });
          } else if (userData.role === 'tenant') {
            navigate('/tenant/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true }); // Fallback
          }
        }
      } catch (error) {
        console.error("Error in OAuth success handler:", error);
        navigate('/login', { replace: true });
      }
    };
    
    handleOAuthSuccess();
  }, [navigate, checkAuth]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <LoadingSpinner />
      <p className="mt-4 text-gray-300">Completing login...</p>
    </div>
  );
};

export default OAuthSuccess;