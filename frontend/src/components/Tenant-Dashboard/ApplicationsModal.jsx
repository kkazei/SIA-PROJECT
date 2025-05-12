import React, { useEffect } from "react";
import { useApplicationStore } from "../../store/applicationStore";

const ApplicationsModal = ({ isOpen, closeModal }) => {
  const { 
    tenantApplications, 
    fetchTenantApplications, 
    loading, 
    error,
    getStatusColor,
    formatDate
  } = useApplicationStore();

  useEffect(() => {
    if (isOpen) {
      fetchTenantApplications();
    }
  }, [isOpen, fetchTenantApplications]);

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case "approved":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case "rejected":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      case "ended":
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>Ended</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Your Applications</h3>
          <button onClick={closeModal} className="text-gray-500  hover:text-gray-700">
            ✖
          </button>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your applications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : tenantApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <div>
              {tenantApplications.map((app) => (
                <div key={app._id} className="mb-6 border rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{app.apartment_id.room}</h4>
                      <p className="text-sm text-gray-600">Applied on {formatDate(app.createdAt)}</p>
                    </div>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rent</p>
                        <p>₱{app.apartment_id.rent?.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Move-in Date</p>
                        <p>{formatDate(app.moveInDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p>{app.duration} {app.duration === 1 ? 'month' : 'months'}</p>
                      </div>
                      {app.processedDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {app.status === "ended" ? "Tenancy Ended On" : "Processed On"}
                          </p>
                          <p>{formatDate(app.processedDate)}</p>
                        </div>
                      )}
                    </div>
                    
                    {app.additionalComments && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Your Comments</p>
                        <p className="text-gray-700">{app.additionalComments}</p>
                      </div>
                    )}
                    
                    {app.processedReason && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Landlord's Response</p>
                        <p className="text-gray-700">{app.processedReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
        </div>
      </div>
    </div>
  );
};

export default ApplicationsModal;