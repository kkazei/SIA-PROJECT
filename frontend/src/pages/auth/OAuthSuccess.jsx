import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const OAuthSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const { processOAuthCallback } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const user = await processOAuthCallback();
        
        // Only redirect to role selection if role is not set
        // or if this is a brand new user (created in the last hour)
        const isNewUser = !user.role || user.role === 'unset' || 
                         (user.createdAt && 
                         ((new Date() - new Date(user.createdAt)) < 3600000)); // 1 hour
        
        if (isNewUser) {
          navigate('/role-selection');
        } else {
          // User already has a role, go to dashboard
          navigate('/');
        }
      } catch (err) {
        setError('Failed to complete authentication. Please try again.');
        console.error('OAuth callback error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [processOAuthCallback, navigate]);

  if (isProcessing) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthSuccess;