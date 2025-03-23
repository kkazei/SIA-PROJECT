import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const OAuthSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const { processOAuthCallback } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const user = await processOAuthCallback();
        
        // Check if user is new and needs to select a role
        // This assumes your backend sets createdAt timestamp
        const isNewUser = user.createdAt && 
                         ((new Date() - new Date(user.createdAt)) < 60 * 60 * 1000); // Created in last hour
        
        if (isNewUser) {
          navigate('/role-selection');
        } else {
          navigate('/dashboard');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Completing your sign in...
            </h2>
          </>
        ) : error ? (
          <>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Login
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default OAuthSuccess;