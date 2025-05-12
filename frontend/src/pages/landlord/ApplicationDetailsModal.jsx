import React, { useState } from 'react';
import { FaSpinner, FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaEye } from 'react-icons/fa';
import Swal from "sweetalert2"; // Import SweetAlert2

const ApplicationDetailsModal = ({ isOpen, onClose, application, handleProcess, processingStatus }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingDocument, setViewingDocument] = useState(null);
  
  // Base URL for file access
  const BASE_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:5000" 
    : "";

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Function to get appropriate icon based on file type
  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt className="text-gray-500" />;
    
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <FaFileImage className="text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FaFilePdf className="text-red-500" />;
    } else {
      return <FaFileAlt className="text-gray-500" />;
    }
  };
  
  // Function to view document
  const viewDocument = (docPath) => {
    if (!docPath) return;
    
    // If it's an image, show it in a modal
    const url = `${BASE_URL}/${docPath}`;
    setViewingDocument(url);
    
    // For different file types, you might want to use different viewers
    const extension = docPath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      Swal.fire({
        title: 'Document Preview',
        html: `<img src="${url}" alt="Document" class="max-w-full max-h-[70vh]">`,
        width: '80%',
        showCloseButton: true,
        showConfirmButton: false,
      });
    } else {
      // For other file types, open in new tab
      window.open(url, '_blank');
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to reject this application.",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Enter rejection reason (optional)",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reject it!",
    });

    if (result.isConfirmed) {
      const rejectionReason = result.value || "No reason provided";
      await handleProcess(application, "rejected", rejectionReason);
      Swal.fire("Rejected!", "The application has been rejected.", "success");
    }
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to approve this application.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    });

    if (result.isConfirmed) {
      await handleProcess(application, "approved");
      Swal.fire("Approved!", "The application has been approved.", "success");
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl lg:max-w-2xl lg:h-auto lg:max-h-[80vh] overflow-auto"
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
            <p><strong>Phone:</strong> {application.phoneNumber || application.tenant_id?.phone || 'N/A'}</p>
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
            <p><strong>Requested Move-in Date:</strong> {formatDate(application.moveInDate)}</p>
            <p><strong>Lease Duration:</strong> {application.duration || 'N/A'} months</p>
            <p><strong>Additional Comments:</strong> {application.additionalComments || 'None provided'}</p>
          </div>
          
          {/* Documents Section - New Addition */}
          <div className="lg:col-span-2 mt-4">
            <h3 className="text-lg font-bold mb-4">Submitted Documents</h3>
            
            {/* Valid ID */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Valid ID</h4>
              {application.validId ? (
                <div className="flex items-center p-3 border rounded bg-gray-50">
                  <span className="mr-2">{getFileIcon(application.validId)}</span>
                  <span className="flex-grow truncate">{application.validId.split('/').pop()}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewDocument(`uploads/${application.validId}`)} 
                      className="text-blue-500 hover:text-blue-700"
                      title="View document"
                    >
                      <FaEye />
                    </button>
                    <a 
                      href={`${BASE_URL}/uploads/${application.validId}`} 
                      download 
                      className="text-green-500 hover:text-green-700"
                      title="Download document"
                    >
                      <FaDownload />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No valid ID file available</p>
              )}
            </div>
            
            {/* Additional Documents */}
            <div>
              <h4 className="font-semibold mb-2">Additional Documents</h4>
              {application.additionalDocuments && application.additionalDocuments.length > 0 ? (
                <div className="space-y-2">
                  {application.additionalDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center p-3 border rounded bg-gray-50">
                      <span className="mr-2">{getFileIcon(doc)}</span>
                      <span className="flex-grow truncate">{doc.split('/').pop()}</span>
                      <div className="flex space-x-2">
                        <a 
                          href={`${BASE_URL}/uploads/${doc}`} 
                          download 
                          className="text-green-500 hover:text-green-700"
                          title="Download document"
                        >
                          <FaDownload />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No additional documents provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          {application.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
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
                onClick={handleApprove}
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