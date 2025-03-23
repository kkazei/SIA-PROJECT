import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FaUserAlt, FaHome } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const { setRole, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();

  // If user already has a role, redirect to dashboard
  useEffect(() => {
    if (user && user.role && user.role !== 'unset') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    try {
      await setRole(selectedRole);
      navigate('/');
    } catch (err) {
      console.error('Error setting role:', err);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  // If user already has a role, don't show this page
  if (user.role && user.role !== 'unset') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please select whether you are a tenant or a landlord
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center ${
                selectedRole === 'tenant' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setSelectedRole('tenant')}
            >
              <FaUserAlt className="text-4xl mb-3 text-blue-500" />
              <h3 className="text-lg font-medium">Tenant</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                I want to rent a property
              </p>
            </div>
            
            <div 
              className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center ${
                selectedRole === 'landlord' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setSelectedRole('landlord')}
            >
              <FaHome className="text-4xl mb-3 text-blue-500" />
              <h3 className="text-lg font-medium">Landlord</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                I own properties to rent
              </p>
            </div>
          </div>
          
          <div>
            <button
              onClick={handleRoleSelection}
              disabled={!selectedRole || isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                !selectedRole 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;