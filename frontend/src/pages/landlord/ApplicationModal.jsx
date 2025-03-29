import React, { useEffect, useState } from 'react';
import { useApplicationStore } from '../../store/applicationStore';
import { useAuthStore } from '../../store/authStore';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaFilter } from 'react-icons/fa';
import ApplicationDetailsModal from './ApplicationDetailsModal'; // Import the details modal

const ApplicationModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { 
    fetchLandlordApplications, 
    processApplication, 
    landlordApplications, 
    loading, 
    error, 
    message 
  } = useApplicationStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({ id: null, status: false });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLandlordApplications();
    }
  }, [isOpen, fetchLandlordApplications]);

  useEffect(() => {
    if (message) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  }, [message]);

  const filteredApplications = landlordApplications?.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  }) || [];

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true); // Open the details modal
  };

  const handleProcess = async (application, status, rejectionReason = '') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingStatus({ id: application._id, status: true });
      await processApplication(
        application._id, 
        status, 
        status === 'rejected' ? rejectionReason : 'Application approved'
      );
      setShowDetailsModal(false);
      setSelectedApplication(null);
      fetchLandlordApplications();
    } catch (err) {
      console.error('Error processing application:', err);
    } finally {
      setProcessingStatus({ id: null, status: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Apartment Applications</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>
        <div className="p-6">
          {/* Filter and Refresh */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center bg-white rounded-lg shadow px-3 py-2">
              <FaFilter className="text-gray-500 mr-2" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-gray-700"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={() => fetchLandlordApplications()}
              className="ml-2 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg"
              title="Refresh Applications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Success and Error Messages */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded shadow">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Applications Table */}
          {!loading && filteredApplications.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {application.tenant_id?.avatar ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={application.tenant_id.avatar} 
                                  alt="" 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 font-semibold">
                                    {application.tenant_id?.name?.charAt(0) || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.tenant_id?.name || 'Unknown Tenant'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.tenant_id?.email || 'No email provided'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{application.apartment_id?.room || 'Unknown Apartment'}</div>
                          <div className="text-sm text-gray-500">Rent: ₱{application.apartment_id?.rent?.toLocaleString() || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(application)} // Open details modal
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FaEye className="mr-1" />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden">
                {filteredApplications.map((application) => (
                  <div key={application._id} className="bg-gray-50 mb-4 p-4 rounded-lg shadow">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">Tenant:</p>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {application.tenant_id?.avatar ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover" 
                              src={application.tenant_id.avatar} 
                              alt="" 
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-semibold">
                                {application.tenant_id?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.tenant_id?.name || 'Unknown Tenant'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.tenant_id?.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">Apartment:</p>
                      <p className="text-sm text-gray-500">{application.apartment_id?.room || 'Unknown Apartment'}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">Applied On:</p>
                      <p className="text-sm text-gray-500">{formatDate(application.createdAt)}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">Status:</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(application)} // Open details modal
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FaEye className="mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Applications */}
          {!loading && landlordApplications?.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-gray-500">There are currently no tenant applications for your apartments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)} // Close the details modal
        application={selectedApplication} // Pass the selected application
        handleProcess={handleProcess} // Pass the process handler
        processingStatus={processingStatus} // Pass the processing status
      />
    </div>
  );
};

export default ApplicationModal;