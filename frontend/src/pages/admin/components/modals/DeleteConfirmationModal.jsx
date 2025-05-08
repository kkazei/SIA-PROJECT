import React from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const DeleteConfirmationModal = ({ user, onConfirm, onCancel }) => {
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
        <div className="bg-red-600 p-4 text-white">
          <h3 className="text-xl font-bold flex items-center">
            <FaTrash className="mr-2" /> Delete User
          </h3>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-3xl" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Are you sure you want to delete <span className="font-medium">{user?.name}</span>?
            </p>
            <p className="text-gray-500 text-sm">This action cannot be undone.</p>
            
            {user?.role === 'admin' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm font-medium flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Warning: You are deleting an admin user!
                </p>
              </div>
            )}
            
            {user?.role === 'landlord' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 text-sm">
                  Note: This will not delete any apartments or posts created by this landlord.
                </p>
              </div>
            )}
            
            {user?.role === 'tenant' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 text-sm">
                  Note: Any apartment associations will need to be updated separately.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmationModal;