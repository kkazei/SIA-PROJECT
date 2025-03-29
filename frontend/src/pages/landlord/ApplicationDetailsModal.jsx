import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

const ApplicationDetailsModal = ({ isOpen, onClose, application, handleProcess, processingStatus }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Application Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Tenant Information</h3>
          <p><strong>Name:</strong> {application.tenant_id?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {application.tenant_id?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {application.tenant_id?.phone || 'N/A'}</p>

          <h3 className="text-lg font-bold mt-6 mb-4">Apartment Information</h3>
          <p><strong>Room:</strong> {application.apartment_id?.room || 'N/A'}</p>
          <p><strong>Rent:</strong> ₱{application.apartment_id?.rent?.toLocaleString() || 'N/A'}</p>
          <p><strong>Description:</strong> {application.apartment_id?.description || 'N/A'}</p>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Application Date:</p>
                <p className="font-medium">{formatDate(application.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Requested Move-in Date:</p>
                <p className="font-medium text-blue-700">{formatDate(application.details?.moveInDate)}</p>
                {application.status === 'pending' && (
                  <p className="text-xs text-gray-500 mt-1">
                    First payment will be due 1 month after this date if approved
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600">Additional Comments:</p>
                <p className="font-medium">{application.details?.additionalComments || 'None provided'}</p>
              </div>
            </div>
          </div>

          {application.status === 'pending' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Process Application</h3>

              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-sm">
                <p className="font-medium text-yellow-800">Important:</p>
                <ul className="list-disc list-inside text-yellow-700 mt-1">
                  <li>Approving this application will assign the tenant to this apartment</li>
                  <li>Any other pending applications from this tenant will be automatically rejected</li>
                  <li>
                    Rent will be due 1 month after the requested move-in date (
                    {formatDate(application.details?.moveInDate)})
                  </li>
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
                  onClick={() => handleProcess(application, 'rejected', rejectionReason)}
                  disabled={processingStatus.status}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {processingStatus.status && processingStatus.id === application._id ? (
                    <>
                      <FaSpinner className="inline animate-spin mr-1" />
                      Processing...
                    </>
                  ) : (
                    <>Reject Application</>
                  )}
                </button>
                <button
                  onClick={() => handleProcess(application, 'approved')}
                  disabled={processingStatus.status}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {processingStatus.status && processingStatus.id === application._id ? (
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

          {application.status !== 'pending' && (
            <div className="mb-6 border-t pt-4">
              <div className="flex items-center mb-3">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2
                      ${
                        application.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                >
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
                <span className="text-gray-600">on {formatDate(application.processedDate)}</span>
              </div>
              {application.processedReason && (
                <div>
                  <p className="text-gray-600 font-medium">Reason:</p>
                  <p>{application.processedReason}</p>
                </div>
              )}
              {application.status === 'approved' && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <h4 className="font-medium text-green-800">Apartment Assignment Details:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Move-in Date:</span>
                      <span className="ml-2 font-medium">{formatDate(application.details?.moveInDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">First Payment Due:</span>
                      <span className="ml-2 font-medium">
                        {formatDate(
                          new Date(
                            new Date(application.details?.moveInDate).setMonth(
                              new Date(application.details?.moveInDate).getMonth() + 1
                            )
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;