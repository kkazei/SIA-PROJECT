import React, { useEffect, useState } from 'react';
import { useApplicationStore } from '../../store/applicationStore';
import { useAuthStore } from '../../store/authStore';
import LandlordLayout from '../../components/layout/LandlordLayout';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaFilter } from 'react-icons/fa';

const LandlordApplications = () => {
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
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchLandlordApplications();
  }, [fetchLandlordApplications]);

  useEffect(() => {
    if (message) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  }, [message]);

  // Filter applications based on selected filter
  const filteredApplications = landlordApplications?.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  }) || [];

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  // Update the handleProcess function to better handle specific error cases
  const handleProcess = async (application, status) => {
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
      setRejectionReason('');
      setSelectedApplication(null);
      // Refresh applications list after processing
      fetchLandlordApplications();
    } catch (err) {
      console.error('Error processing application:', err);
      // Display specific error message if tenant already has an apartment
      if (err.response?.data?.message?.includes('already assigned to another apartment')) {
        alert('This tenant is already assigned to another apartment. They cannot be assigned to multiple apartments.');
      }
    } finally {
      setProcessingStatus({ id: null, status: false });
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <LandlordLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Apartment Applications</h1>
          
          <div className="flex items-center mt-4 md:mt-0">
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
        </div>

        {/* Success message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded shadow">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button 
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Applications table */}
        {!loading && filteredApplications.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apartment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
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
                        <div className="text-xs text-gray-500">
                          {application.details?.moveInDate ? `Move-in: ${formatDate(application.details.moveInDate)}` : ''}
                        </div>
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
                            onClick={() => handleViewDetails(application)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaEye className="mr-1" />
                            Details
                          </button>
                          
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleProcess(application, 'approved')}
                                disabled={processingStatus.status && processingStatus.id === application._id}
                                className="text-green-600 hover:text-green-900 flex items-center disabled:opacity-50"
                              >
                                {processingStatus.status && processingStatus.id === application._id ? (
                                  <FaSpinner className="mr-1 animate-spin" />
                                ) : (
                                  <FaCheck className="mr-1" />
                                )}
                                Approve
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowDetailsModal(true);
                                }}
                                disabled={processingStatus.status && processingStatus.id === application._id}
                                className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                              >
                                <FaTimes className="mr-1" />
                                Reject
                              </button>
                            </>
                          )}
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
                  <div className="flex items-center mb-4">
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
                      onClick={() => handleViewDetails(application)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FaEye className="mr-1" />
                      Details
                    </button>
                    
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleProcess(application, 'approved')}
                          disabled={processingStatus.status && processingStatus.id === application._id}
                          className="text-green-600 hover:text-green-900 flex items-center disabled:opacity-50"
                        >
                          {processingStatus.status && processingStatus.id === application._id ? (
                            <FaSpinner className="mr-1 animate-spin" />
                          ) : (
                            <FaCheck className="mr-1" />
                          )}
                          Approve
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailsModal(true);
                          }}
                          disabled={processingStatus.status && processingStatus.id === application._id}
                          className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                        >
                          <FaTimes className="mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Application Details</h2>
              <button onClick={() => {
                setShowDetailsModal(false);
                setSelectedApplication(null);
                setRejectionReason('');
              }} className="text-gray-500 hover:text-gray-700">
                ✖
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Tenant Information</h3>
                <div className="flex items-center mb-4">
                  {selectedApplication.tenant_id?.avatar ? (
                    <img 
                      className="h-16 w-16 rounded-full object-cover mr-4" 
                      src={selectedApplication.tenant_id.avatar} 
                      alt="Tenant" 
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                      <span className="text-gray-600 font-bold text-xl">
                        {selectedApplication.tenant_id?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg">{selectedApplication.tenant_id?.name || 'Unknown Tenant'}</p>
                    <p className="text-gray-600">{selectedApplication.tenant_id?.email || 'No email provided'}</p>
                    <p className="text-gray-600">Phone: {selectedApplication.details?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Apartment Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{selectedApplication.apartment_id?.room || 'Unknown Apartment'}</p>
                  <p className="text-gray-600">Rent: ₱{selectedApplication.apartment_id?.rent?.toLocaleString() || 'N/A'}</p>
                  <p className="text-gray-600">
                    Address: {
                      typeof selectedApplication.apartment_id?.address === 'object'
                        ? `${selectedApplication.apartment_id?.address?.street || ''}, 
                           ${selectedApplication.apartment_id?.address?.city || ''}`
                        : (selectedApplication.apartment_id?.address || 'Not provided')
                    }
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Application Date:</p>
                    <p className="font-medium">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Requested Move-in Date:</p>
                    <p className="font-medium text-blue-700">{formatDate(selectedApplication.details?.moveInDate)}</p>
                    {selectedApplication.status === 'pending' && (
                      <p className="text-xs text-gray-500 mt-1">
                        First payment will be due 1 month after this date if approved
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Additional Comments:</p>
                    <p className="font-medium">{selectedApplication.details?.additionalComments || 'None provided'}</p>
                  </div>
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4">Process Application</h3>
                  
                  <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-sm">
                    <p className="font-medium text-yellow-800">Important:</p>
                    <ul className="list-disc list-inside text-yellow-700 mt-1">
                      <li>Approving this application will assign the tenant to this apartment</li>
                      <li>Any other pending applications from this tenant will be automatically rejected</li>
                      <li>Rent will be due 1 month after the requested move-in date ({formatDate(selectedApplication.details?.moveInDate)})</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Reason (required for rejection)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                      placeholder="Provide a reason for approval or rejection..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleProcess(selectedApplication, 'rejected')}
                      disabled={processingStatus.status}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    >
                      {processingStatus.status && processingStatus.id === selectedApplication._id ? (
                        <>
                          <FaSpinner className="inline animate-spin mr-1" />
                          Processing...
                        </>
                      ) : (
                        <>Reject Application</>
                      )}
                    </button>
                    <button
                      onClick={() => handleProcess(selectedApplication, 'approved')}
                      disabled={processingStatus.status}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    >
                      {processingStatus.status && processingStatus.id === selectedApplication._id ? (
                        <>
                          <FaSpinner className="inline animate-spin mr-1" />
                          Processing...
                        </>
                      ) : (
                        <>Approve Application</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {selectedApplication.status !== 'pending' && (
                <div className="mb-6 border-t pt-4">
                  <div className="flex items-center mb-3">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2
                      ${selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                    <span className="text-gray-600">
                      on {formatDate(selectedApplication.processedDate)}
                    </span>
                  </div>
                  {selectedApplication.processedReason && (
                    <div>
                      <p className="text-gray-600 font-medium">Reason:</p>
                      <p>{selectedApplication.processedReason}</p>
                    </div>
                  )}
                  {selectedApplication.status === 'approved' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-md">
                      <h4 className="font-medium text-green-800">Apartment Assignment Details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Move-in Date:</span>
                          <span className="ml-2 font-medium">{formatDate(selectedApplication.details?.moveInDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">First Payment Due:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(new Date(new Date(selectedApplication.details?.moveInDate).setMonth(
                              new Date(selectedApplication.details?.moveInDate).getMonth() + 1
                            )))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedApplication(null);
                  setRejectionReason('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </LandlordLayout>
  );
};

export default LandlordApplications;