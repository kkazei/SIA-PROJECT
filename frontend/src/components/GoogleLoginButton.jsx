import { useAuthStore } from '../store/authStore';
import { FcGoogle } from 'react-icons/fc';

const GoogleLoginButton = () => {
  const { initiateGoogleLogin, isLoading } = useAuthStore();

  return (
    <button
      onClick={initiateGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <FcGoogle className="text-xl" />
      <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleLoginButton;