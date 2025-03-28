import { useState } from 'react';
import { toast } from 'react-hot-toast';

const ApplicationCard = ({ application, onUpdateStatus, detailed = false }) => {
  const [showDetails, setShowDetails] = useState(detailed);
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [leaseData, setLeaseData] = useState({
    leaseStart: application.moveInDate ? new Date(application.moveInDate).toISOString().split('T')[0] : '',
    leaseEnd: application.moveInDate ? 
      new Date(new Date(application.moveInDate).setFullYear(
        new Date(application.moveInDate).getFullYear() + 1
      )).toISOString().split('T')[0] : ''
  });
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'canceled': return 'bg-gray-500';
      default: return 'bg-yellow-500'; // pending
    }
  };

  const handleLeaseInputChange = (e) => {
    const { name, value } = e.target;
    setLeaseData({
      ...leaseData,
      [name]: value
    });
  };
  
  const propertyTitle = application.property?.title || 'Unknown Property';
  const tenantName = application.tenant?.name || 'Unknown Tenant';
  
  const handleApprove = () => {
    if (showLeaseForm) {
      // Validate lease dates
      if (!leaseData.leaseStart || !leaseData.leaseEnd) {
        toast.error("Please provide both lease start and end dates");
        return;
      }
      
      const startDate = new Date(leaseData.leaseStart);
      const endDate = new Date(leaseData.leaseEnd);
      
      if (endDate <= startDate) {
        toast.error("Lease end date must be after the start date");
        return;
      }
      
      onUpdateStatus(application._id, 'approved', leaseData);
    } else {
      setShowLeaseForm(true); // First show the lease form
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {propertyTitle}
            </h3>
            <p className="text-sm text-gray-600">
              From: <span className="font-medium">{tenantName}</span> • Applied on {formatDate(application.createdAt)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(application.status)}`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </div>
        </div>
        
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                <p className="text-sm">{application.tenant?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Desired Move-in Date</p>
                <p className="text-sm">{formatDate(application.moveInDate)}</p>
              </div>
            </div>
            
            {application.message && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Applicant Message</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{application.message}</p>
              </div>
            )}
            
            {application.documents && application.documents.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Submitted Documents</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.documents.map((doc, index) => (
                    <a 
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {doc.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {application.landlordNotes && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Your Notes</p>
                <p className="text-sm bg-blue-50 p-3 rounded">{application.landlordNotes}</p>
              </div>
            )}
            
            {application.status === 'pending' && (
              <>
                {showLeaseForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Set Lease Terms</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Lease Start Date</label>
                        <input 
                          type="date"
                          name="leaseStart"
                          value={leaseData.leaseStart}
                          onChange={handleLeaseInputChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Lease End Date</label>
                        <input 
                          type="date"
                          name="leaseEnd"
                          value={leaseData.leaseEnd}
                          onChange={handleLeaseInputChange}
                          className="w-full px-3 py-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>* Setting lease terms is required for tenant approval.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {showLeaseForm ? 'Confirm Approval' : 'Approve'}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(application._id, 'rejected')}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;