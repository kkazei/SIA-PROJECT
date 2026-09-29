import React from 'react';
import { motion } from 'framer-motion';
import { FaKey, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordModal = ({ user, password, setPassword, onConfirm, onCancel }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  // Backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Modal animation
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.1 } }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
      onClick={onCancel}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-yellow-600 p-4 text-white">
          <h3 className="text-xl font-bold flex items-center">
            <FaKey className="mr-2" /> Reset Password
          </h3>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-5">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Set a new password for this user. The user will need to use this password for their next login.
            </p>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pr-10 shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            {password && password.length < 6 && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!password || password.length < 6}
              onClick={onConfirm}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !password || password.length < 6 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
              }`}
            >
              Reset Password
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResetPasswordModal;