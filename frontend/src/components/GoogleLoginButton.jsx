import { useAuthStore } from '../store/authStore';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';

const GoogleLoginButton = () => {
  const { initiateGoogleLogin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // This will redirect to Google's OAuth page
    initiateGoogleLogin();
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      type="button"
    >
      <FcGoogle className="text-xl" />
      <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleLoginButton;