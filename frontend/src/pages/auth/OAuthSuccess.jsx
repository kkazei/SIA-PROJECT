import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader } from 'lucide-react';

const OAuthSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const { processOAuthCallback} = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Updated to properly handle the return object from processOAuthCallback
        const result = await processOAuthCallback();
        
        // The updated processOAuthCallback should return {needsRole, user}
        if (result?.needsRole || !result?.user?.role) {
          console.log("User needs to select a role, redirecting to role selection");
          navigate('/role-selection');
        } else {
          console.log("User already has a role, redirecting to home");
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Loader className="h-10 w-10 text-green-400 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-green-400">Completing login...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
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