import React, { useState, useEffect } from "react";

const LeaseAgreementModal = ({ isOpen, closeModal }) => {
  const [leaseImages, setLeaseImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch lease agreement images
      // TODO: Implement API call to fetch lease images
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4">
          <h3 className="text-xl font-medium">Lease Agreement</h3>
          <button onClick={closeModal} className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading lease agreement...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : leaseImages.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
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
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {leaseImages.map((image, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={`Lease Agreement Page ${index + 1}`}
                    className="w-full object-contain"
                  />
                  <div className="p-2 bg-gray-50 text-sm text-gray-500 text-center">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaseAgreementModal;