import React, { useState, useEffect } from "react";
import { useLeaseStore } from "../../store/leaseStore";
import { FaFileContract, FaDownload, FaSpinner, FaEye, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFile, FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LeaseAgreementModal = ({ isOpen, closeModal, apartment }) => {
  const [activeTab, setActiveTab] = useState("details");
  const { leaseDocuments, fetchTenantLeases, loading, error, clearMessages } = useLeaseStore();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "preview"
  
  useEffect(() => {
    // Your existing effect code
  }, [isOpen, apartment, fetchTenantLeases, clearMessages]);

  useEffect(() => {
    // Your existing logging effect
  }, [isOpen, apartment]);

  if (!isOpen) return null;

  // Your existing helper functions remain unchanged
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    
    // Handle address as a simple string
    if (typeof address === 'string') {
      return address;
    }
    
    // Handle address as an object
    if (typeof address === 'object') {
      const parts = [];
      
      // Check for nested location object structure
      if (address.location && typeof address.location === 'object') {
        if (address.location.street) parts.push(address.location.street);
        if (address.location.city) parts.push(address.location.city);
        if (address.location.state) parts.push(address.location.state);
        if (address.location.zipCode) parts.push(address.location.zipCode);
        if (address.location.country) parts.push(address.location.country);
      } 
      // Check for direct property structure
      else {
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.zipCode) parts.push(address.zipCode);
        if (address.country) parts.push(address.country);
      }
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
      
      // Last resort: If there's any string property, return it
      for (const key in address) {
        if (typeof address[key] === 'string') {
          return address[key];
        }
      }
      
      return JSON.stringify(address);
    }
    
    return "Address details not available";
  };
  
  const handleDownload = (document, filename) => {
    if (!document || !document.fileUrl) {
      console.error("Invalid document or missing fileUrl:", document);
      return;
    }
    
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = filename || 'lease-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewLease = (document) => {
    if (!document || !document.fileUrl) {
      console.error("Invalid document or missing fileUrl:", document);
      return;
    }
    
    console.log("Viewing document with URL:", document.fileUrl);
    setSelectedDocument(document);
    setViewMode("preview");
  };

  const getDocumentIcon = (filePath) => {
    if (!filePath) return <FaFileContract className="text-blue-400" />;
    
    const ext = filePath.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return <FaFilePdf className="text-red-400" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FaFileImage className="text-purple-400" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };

  const backToDocumentsList = () => {
    setViewMode("list");
    setSelectedDocument(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-hidden">
      {/* Fixed size modal container */}
      <div className="w-full max-w-4xl h-[90vh] mx-auto rounded-lg bg-gray-800 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center bg-gray-900 px-4 py-5 border-b border-gray-700">
          <div className="flex items-center">
            <FaFileContract className="text-blue-400 mr-2 text-xl" />
            <h3 className="text-xl font-medium text-white">Lease Agreement</h3>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "details"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Lease Details
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "documents"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Documents
          </button>
        </div>

        {/* Scrollable content area */}
        <div 
          className="overflow-y-auto flex-1 px-4 py-5 text-white"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(107, 114, 128, 0.3) transparent',
          }}
        >
          {/* Your existing tab content here */}
          {activeTab === "details" && (
            <div className="space-y-4">
              {!apartment ? (
                <p className="text-gray-400">No lease information available.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Property Details Section */}
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Property Details</h4>
                      <div className="bg-gray-700 p-4 rounded-md">
                        <p className="mb-2">
                          <span className="text-gray-400">Property: </span>
                          <span className="text-white font-medium">{apartment.room || "N/A"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-400">Type: </span>
                          <span className="text-white font-medium">{apartment.propertyType || "Residential"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-400">Bedrooms: </span>
                          <span className="text-white font-medium">{apartment.bedrooms || "N/A"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-400">Bathrooms: </span>
                          <span className="text-white font-medium">{apartment.bathrooms || "N/A"}</span>
                        </p>
                        <div className="mb-2">
                          <span className="text-gray-400 block mb-1">Address:</span>
                          {apartment.address ? (
                            <div className="text-white pl-1">
                              {typeof apartment.address === 'string' ? (
                                <p>{apartment.address}</p>
                              ) : (
                                <>
                                  {(apartment.address.street || (apartment.address.location && apartment.address.location.street)) && (
                                    <p className="mb-0.5">
                                      {apartment.address.street || apartment.address.location?.street}
                                    </p>
                                  )}
                                  
                                  <p className="mb-0.5">
                                    {(apartment.address.city || (apartment.address.location && apartment.address.location.city)) && 
                                      apartment.address.city || apartment.address.location?.city}
                                  
                                    {(apartment.address.state || (apartment.address.location && apartment.address.location.state)) && 
                                      `, ${apartment.address.state || apartment.address.location?.state}`}
                                  
                                    {(apartment.address.zipCode || (apartment.address.location && apartment.address.location.zipCode)) && 
                                      ` ${apartment.address.zipCode || apartment.address.location?.zipCode}`}
                                  </p>
                                  
                                  {(apartment.address.country || (apartment.address.location && apartment.address.location.country)) && (
                                    <p className="mt-0.5 font-medium">
                                      {apartment.address.country || apartment.address.location?.country}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">No address provided</span>
                          )}
                        </div>
                        {apartment.description && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-gray-400 mb-1">Description:</p>
                            <p className="text-white">{apartment.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lease Terms Section */}
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Lease Terms</h4>
                      <div className="bg-gray-700 p-4 rounded-md">
                        <p className="mb-2">
                          <span className="text-gray-400">Monthly Rent: </span>
                          <span className="text-green-400 font-medium">₱{apartment.rent?.toLocaleString() || "N/A"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-400">Move-In Date: </span>
                          <span className="text-white font-medium">{formatDate(apartment.moveInDate || apartment.createdAt)}</span>
                        </p>
                        {apartment.paymentInfo?.nextDueDate && (
                          <p className="mb-2">
                            <span className="text-gray-400">Next Payment Due: </span>
                            <span className="text-white font-medium">{formatDate(apartment.paymentInfo.nextDueDate)}</span>
                          </p>
                        )}
                        <p className="mb-2">
                          <span className="text-gray-400">Security Deposit: </span>
                          <span className="text-white font-medium">₱{(apartment.securityDeposit || apartment.rent)?.toLocaleString() || "N/A"}</span>
                        </p>
                        {apartment.paymentInfo?.paymentStatus && (
                          <p className="mb-2">
                            <span className="text-gray-400">Payment Status: </span>
                            <span className={`font-medium px-2 py-0.5 rounded ${
                              apartment.paymentInfo.paymentStatus === 'paid' ? 'bg-green-800 text-green-200' :
                              apartment.paymentInfo.paymentStatus === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                              'bg-red-800 text-red-200'
                            }`}>
                              {apartment.paymentInfo.paymentStatus.charAt(0).toUpperCase() + apartment.paymentInfo.paymentStatus.slice(1)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Landlord Information Section */}
                  {apartment.landlord_id && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold mb-2">Landlord Information</h4>
                      <div className="bg-gray-700 p-4 rounded-md">
                        <div className="flex items-center">
                          {apartment.landlord_id.avatar ? (
                            <img 
                              src={apartment.landlord_id.avatar}
                              alt={apartment.landlord_id.name}
                              className="w-12 h-12 rounded-full mr-4 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40?text=User";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-4">
                              {apartment.landlord_id.name?.charAt(0).toUpperCase() || "L"}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{apartment.landlord_id.name || "Landlord"}</p>
                            {apartment.landlord_id.email && (
                              <p className="text-sm text-gray-400">{apartment.landlord_id.email}</p>
                            )}
                            {apartment.landlord_id.phone && (
                              <p className="text-sm text-gray-400">{apartment.landlord_id.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions Section */}
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Terms & Conditions</h4>
                    <div className="bg-gray-700 p-4 rounded-md">
                      <div className="max-h-60 overflow-y-auto">
                        <p className="mb-4">
                          <span className="font-semibold">1. Payment Terms:</span> Rent is due on the 1st of each month. 
                          Late payments are subject to a penalty fee of 5% of the rental amount per day of delay.
                        </p>
                        <p className="mb-4">
                          <span className="font-semibold">2. Security Deposit:</span> The security deposit is refundable within 
                          30 days after moving out, subject to deductions for damages beyond normal wear and tear.
                        </p>
                        <p className="mb-4">
                          <span className="font-semibold">3. Maintenance:</span> Tenant is responsible for minor repairs and 
                          regular maintenance. Major repairs are the landlord's responsibility.
                        </p>
                        <p className="mb-4">
                          <span className="font-semibold">4. Utilities:</span> Tenant is responsible for all utility payments 
                          including electricity, water, and internet.
                        </p>
                        <p className="mb-4">
                          <span className="font-semibold">5. House Rules:</span> Quiet hours from 10 PM to 7 AM. 
                          No unauthorized modifications to the property. No pets without prior approval.
                        </p>
                        {apartment.leaseTerms && (
                          <p className="mb-4">{apartment.leaseTerms}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Images Section */}
                  {apartment.images && apartment.images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">Property Images</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {apartment.images.map((image, index) => (
                          <div key={index} className="bg-gray-700 p-2 rounded-md">
                            <img 
                              src={image} 
                              alt={`Property ${index + 1}`}
                              className="w-full h-40 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : viewMode === "list" ? (
                // Show document list
                leaseDocuments && leaseDocuments.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm">The following lease documents are available:</p>
                    <div className="grid grid-cols-1 gap-4">
                      {leaseDocuments.map((doc) => (
                        <div key={doc._id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                          <div className="flex items-center">
                            {getDocumentIcon(doc.filePath)}
                            <div className="ml-3">
                              <p className="font-medium text-white">{doc.description || "Lease Document"}</p>
                              <p className="text-sm text-gray-400">
                                Uploaded: {formatDate(doc.uploadDate || doc.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewLease(doc)}
                              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded flex items-center"
                            >
                              <FaEye className="mr-1" /> View
                            </button>
                            <button
                              onClick={() => handleDownload(doc, doc.description || "lease-document")}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
                            >
                              <FaDownload className="mr-1" /> Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FaFileContract className="mx-auto text-4xl text-gray-500 mb-3" />
                    <p className="text-gray-400">No lease documents available.</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Your landlord has not uploaded any lease documents yet.
                    </p>
                  </div>
                )
              ) : (
                // Show document preview - directly embedded in the page
                <div>
                  <button
                    onClick={backToDocumentsList}
                    className="mb-4 flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to documents
                  </button>

                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {selectedDocument && selectedDocument.fileUrl ? (
                      selectedDocument.fileUrl.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={selectedDocument.fileUrl}
                          className="w-full h-[60vh]"
                          title="PDF Document"
                        />
                      ) : (
                        <div className="flex justify-center p-4">
                          <img
                            src={selectedDocument.fileUrl}
                            alt="Document"
                            className="max-w-full h-auto"
                            onLoad={() => console.log("Image loaded successfully")}
                            onError={(e) => {
                              console.error("Image failed to load:", e);
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/400x300?text=Document+Preview+Unavailable";
                            }}
                          />
                        </div>
                      )
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Unable to load document preview
                      </div>
                    )}
                  </div>

                  {/* Direct link as fallback */}
                  {selectedDocument && selectedDocument.fileUrl && (
                    <div className="mt-4 text-center">
                      <a
                        href={selectedDocument.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <FaExternalLinkAlt className="mr-2" /> Open document in new tab
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-900 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
        </div>
      </div>
    </div>
  );
};

export default LeaseAgreementModal;