import React, { useState, useEffect } from "react";
import { useLeaseStore } from "../../store/leaseStore";
import { useAuthStore } from "../../store/authStore";

const LeaseAgreementModal = ({ isOpen, closeModal }) => {
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // Add debug state
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [currentProof, setCurrentProof] = useState(null);

  const { user } = useAuthStore();
  const { 
    leaseDocuments, 
    fetchTenantLeases, 
    loading: storeLoading, 
    error: storeError 
  } = useLeaseStore();

  const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000' 
    : '';

  // Function to refresh lease documents
  const refreshLeases = () => {
    console.log("Manually refreshing leases...");
    setRefreshKey(prev => prev + 1);
    setLoading(true);
  };

  // Function to view lease document
  const handleViewLease = (documentPath) => {
    setCurrentProof(`${API_BASE_URL}${documentPath}`);
    setProofModalOpen(true);
  };

  // This effect runs when the modal is opened or refreshKey changes
  useEffect(() => {
    if (isOpen && user?._id) {
      setLoading(true);
      setError(null);
      
      // Log the fetching process for debugging
      console.log("Fetching lease documents for user:", user._id);
      
      // Reset the current document index to show the newest document first
      setCurrentDocIndex(0);
      
      // Fetch lease documents when modal opens
      fetchTenantLeases(user._id)
        .then((docs) => {
          console.log("Lease documents fetched:", docs?.length || 0, "documents");
          if (docs?.length > 0) {
            console.log("First document:", docs[0]);
          }
          // Set debug info to display in UI
          setDebugInfo({
            userId: user._id,
            docsCount: docs?.length || 0,
            firstDocPath: docs?.[0]?.filePath || "No path",
            timestamp: new Date().toISOString()
          });
        })
        .catch(err => {
          console.error("Error fetching lease documents:", err);
          setError(err.message || "Failed to load lease documents");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, user, fetchTenantLeases, refreshKey]); // refreshKey triggers re-fetch

  // Clean up when the modal closes
  useEffect(() => {
    if (!isOpen) {
      // No need to reset the store here as it's shared with TenantDetailsModal
    }
  }, [isOpen]);

  // Function to determine if a file is PDF
  const isPdf = (filePath) => {
    return filePath?.toLowerCase().endsWith('.pdf');
  };

  // Safe accessor for current document
  const getCurrentDocument = () => {
    if (!leaseDocuments || leaseDocuments.length === 0 || currentDocIndex >= leaseDocuments.length) {
      return null;
    }
    return leaseDocuments[currentDocIndex];
  };

  const currentDocument = getCurrentDocument();

  if (!isOpen) return null;

  // Combine loading states
  const isLoading = loading || storeLoading;
  // Combine error states
  const displayError = error || storeError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Lease Agreement</h3>
          <div className="flex items-center space-x-3">
            {/* Make the refresh button more prominent */}
            <button 
              onClick={refreshLeases}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
              title="Refresh Lease Documents"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button onClick={closeModal} className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Debug info section with timestamp to verify refreshes */}
          {debugInfo && (
            <div className="mb-4 p-2 border border-blue-200 bg-blue-50 text-blue-800 text-xs rounded">
              <p>Debug: User ID: {debugInfo.userId}</p>
              <p>Documents loaded: {debugInfo.docsCount}</p>
              <p>First doc path: {debugInfo.firstDocPath}</p>
              <p>Last refresh: {debugInfo.timestamp}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading lease agreement...</p>
            </div>
          ) : displayError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{displayError}</p>
            </div>
          ) : !leaseDocuments || leaseDocuments.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              {/* No documents UI */}
              <div className="mb-4">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <p className="text-gray-500">No lease agreement available</p>
              <p className="text-sm text-gray-400 mt-1">
                Contact your landlord for more information
              </p>
              {/* Info about where to upload leases */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p>Your landlord can upload lease documents from the tenant management section.</p>
                <p className="mt-2">If documents were recently uploaded, click the Refresh button above.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Document navigation */}
              {leaseDocuments.length > 1 && (
                <div className="flex items-center justify-between w-full mb-4 px-4">
                  <button 
                    onClick={() => setCurrentDocIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentDocIndex === 0}
                    className={`px-4 py-2 rounded ${
                      currentDocIndex === 0 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Document {currentDocIndex + 1} of {leaseDocuments.length}
                  </span>
                  <button 
                    onClick={() => setCurrentDocIndex(prev => Math.min(leaseDocuments.length - 1, prev + 1))}
                    disabled={currentDocIndex === leaseDocuments.length - 1}
                    className={`px-4 py-2 rounded ${
                      currentDocIndex === leaseDocuments.length - 1 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Current document display - with improved error handling */}
              {currentDocument ? (
                <div className="w-full border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 py-2 px-4 font-medium text-gray-700">
                    {currentDocument.description || "Lease Document"}
                    <span className="text-sm text-gray-500 ml-2">
                      (Uploaded: {new Date(currentDocument.uploadDate).toLocaleDateString()})
                    </span>
                  </div>
                  
                  {isPdf(currentDocument.filePath) ? (
                    <div className="h-[60vh]">
                      <iframe
                        src={`${API_BASE_URL}${currentDocument.filePath}`}
                        className="w-full h-full"
                        title="Lease Document"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4">
                      <img
                        src={`${API_BASE_URL}${currentDocument.filePath}`}
                        alt="Lease Document"
                        className="max-h-[60vh] object-contain"
                        onError={(e) => {
                          console.error("Image failed to load:", `${API_BASE_URL}${currentDocument.filePath}`);
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/400x600?text=Image+Not+Found";
                          e.target.classList.add("border", "border-red-300");
                        }}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Image URL: {API_BASE_URL}{currentDocument.filePath}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-3 text-sm text-gray-500">
                    <p>Uploaded: {new Date(currentDocument.uploadDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleViewLease(currentDocument.filePath)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Document
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded">
                  Document not available. Please try again.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          {currentDocument && (
            <a
              href={`${API_BASE_URL}${currentDocument.filePath}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3"
            >
              Download
            </a>
          )}
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>

      {/* Document/Proof Modal */}
      {proofModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto relative">
            <button 
              onClick={() => setProofModalOpen(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-6 flex justify-center">
              {currentProof ? (
                currentProof.endsWith('.pdf') ? (
                  <iframe 
                    src={currentProof} 
                    className="w-full h-[70vh]" 
                    title="Document Viewer"
                  />
                ) : (
                  <img src={currentProof} alt="Document" className="max-w-full h-auto" />
                )
              ) : (
                <p className="text-center text-gray-500">Document not available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseAgreementModal;