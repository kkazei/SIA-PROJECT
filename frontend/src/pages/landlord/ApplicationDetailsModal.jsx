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
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl lg:max-w-2xl lg:h-auto lg:max-h-[80vh] overflow-auto lg:overflow-visible"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Application Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tenant Information */}
          <div>
            <h3 className="text-lg font-bold mb-4">Tenant Information</h3>
            <p><strong>Name:</strong> {application.tenant_id?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {application.tenant_id?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {application.tenant_id?.phone || 'N/A'}</p>
          </div>

          {/* Apartment Information */}
          <div>
            <h3 className="text-lg font-bold mb-4">Apartment Information</h3>
            <p><strong>Room:</strong> {application.apartment_id?.room || 'N/A'}</p>
            <p><strong>Rent:</strong> ₱{application.apartment_id?.rent?.toLocaleString() || 'N/A'}</p>
            <p><strong>Description:</strong> {application.apartment_id?.description || 'N/A'}</p>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">Application Details</h3>
            <p><strong>Application Date:</strong> {formatDate(application.createdAt)}</p>
            <p><strong>Requested Move-in Date:</strong> {formatDate(application.details?.moveInDate)}</p>
            <p><strong>Additional Comments:</strong> {application.details?.additionalComments || 'None provided'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          {application.status === 'pending' && (
            <>
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
            </>
          )}
          {application.status !== 'pending' && (
            <div className="text-sm text-gray-600">
              <p><strong>Status:</strong> {application.status.charAt(0).toUpperCase() + application.status.slice(1)}</p>
              {application.processedReason && (
                <p><strong>Reason:</strong> {application.processedReason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;