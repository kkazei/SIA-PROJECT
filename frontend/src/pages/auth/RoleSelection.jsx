import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaUserAlt, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { getRolePath } from '../../utils/roleRouting';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const { setRole, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();

  // If user already has a role, redirect to dashboard
  useEffect(() => {
    if (user && user.role && user.role !== 'unset') {
      navigate(getRolePath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    try {
      // Call the setRole function from auth store
      const result = await setRole(selectedRole);
      
      navigate(getRolePath(result.role), { replace: true });
    } catch (err) {
      console.error('Error setting role:', err);
    }
  };

  if (!user) {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-300 animate-spin" />
      </div>
    );
  }

  // If user already has a role, don't show this page
  if (user.role && user.role !== 'unset') {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='auth-card max-w-md w-full backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden'
      >
        <div className="p-8 pb-4">
          <h2 className="auth-title text-3xl font-bold mb-1 text-center">
            Select Your Role
          </h2>
          <p className="text-gray-400 text-center mb-6">
            Choose how you'll use the apartment system
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg"
            >
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className={`cursor-pointer p-4 rounded-lg flex flex-col items-center ${
                  selectedRole === 'tenant' 
                    ? 'bg-blue-400/15 border-2 border-blue-300' 
                    : 'bg-gray-700 bg-opacity-50 border border-gray-600 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('tenant')}
              >
                <FaUserAlt className={`text-4xl mb-3 ${selectedRole === 'tenant' ? 'text-blue-300' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium ${selectedRole === 'tenant' ? 'text-blue-300' : 'text-gray-200'}`}>
                  Tenant
                </h3>
                <p className="text-sm text-gray-400 text-center mt-2">
                  I want to rent a property
                </p>
              </motion.div>
              
              <motion.div 
                className={`cursor-pointer p-4 rounded-lg flex flex-col items-center ${
                  selectedRole === 'landlord' 
                    ? 'bg-blue-400/15 border-2 border-blue-300' 
                    : 'bg-gray-700 bg-opacity-50 border border-gray-600 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('landlord')}
              >
                <FaHome className={`text-4xl mb-3 ${selectedRole === 'landlord' ? 'text-blue-300' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium ${selectedRole === 'landlord' ? 'text-blue-300' : 'text-gray-200'}`}>
                  Landlord
                </h3>
                <p className="text-sm text-gray-400 text-center mt-2">
                  I own properties to rent
                </p>
              </motion.div>
            </div>
            
            <div className="pt-4">
              <motion.button
                onClick={handleRoleSelection}
                disabled={!selectedRole || isLoading}
                whileHover={selectedRole ? { scale: 1.02 } : {}}
                whileTap={selectedRole ? { scale: 0.98 } : {}}
                className={`w-full py-3 px-4 font-bold rounded-lg shadow-lg transition-all duration-200 ${
                  !selectedRole 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'auth-submit text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950'
                }`}
              >
                {isLoading ? (
                  <Loader className='w-5 h-5 animate-spin mx-auto' />
                ) : (
                  'Continue'
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        <div className="auth-footer px-8 py-4 mt-6">
          <p className="text-xs text-center text-gray-500">
            You can change your role later in account settings if needed
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;