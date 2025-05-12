import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Add this import
import { usePaymentStore } from "../store/paymentStore";
import { useTenantStore } from "../store/tenantStore";
import { useLeaseStore } from "../store/leaseStore";
import { useApartmentStore } from "../store/apartmentStore";
import { useAuthStore } from "../store/authStore"; // Add this import
import Swal from "sweetalert2";

// Import the image path processor from one of the stores
import { processImagePath } from "../store/paymentStore";

const TenantDetailsModal = ({ isOpen, onClose, tenant, onTenancyEnded }) => {
  // Add navigate hook
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Get current user
  
  const [loading, setLoading] = useState(false);
  const [detailedTenant, setDetailedTenant] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [currentProof, setCurrentProof] = useState(null);

  // Lease document states
  const [leaseFile, setLeaseFile] = useState(null);
  const [isUploadingLease, setIsUploadingLease] = useState(false);
  const [leaseUploadMessage, setLeaseUploadMessage] = useState(null);

  // Add state for end tenancy process
  const [isEndingTenancy, setIsEndingTenancy] = useState(false);

  // Use our stores
  const { getTenantPayments, approvePayment, rejectPayment } = usePaymentStore();
  const { getTenantById } = useTenantStore();
  const {
    leaseDocuments,
    loading: leaseLoading,
    error: leaseError,
    fetchTenantLeases,
    uploadLeaseDocument,
    deleteLeaseDocument,
  } = useLeaseStore();
  const { vacateApartment } = useApartmentStore();

  // Fetch detailed tenant info, payment history, and lease documents when a tenant is selected
  useEffect(() => {
    if (isOpen && tenant?._id) {
      fetchTenantData();
    }

    // Clean up lease store when modal closes
    return () => {
      if (!isOpen) {
        useLeaseStore.getState().resetStore();
      }
    };
  }, [isOpen, tenant]);

  const fetchTenantData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch detailed tenant information via tenant store
      const tenantData = await getTenantById(tenant._id);
      if (tenantData) {
        setDetailedTenant(tenantData);
      } else {
        throw new Error("Failed to load tenant details");
      }

      // Get tenant payment history via payment store
      const payments = await getTenantPayments(tenant._id);
      setPaymentHistory(payments || []);

      // Get tenant lease documents via lease store
      await fetchTenantLeases(tenant._id);
    } catch (err) {
      console.error("Error fetching tenant details:", err);
      setError(err.message || "Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing payment proof
  const handleViewProof = (proofUrl) => {
    const fullUrl = processImagePath(proofUrl);
    console.log("Opening proof URL:", fullUrl);
    setCurrentProof(fullUrl);
    setProofModalOpen(true);
  };

  // Handle payment approval
  const handleApprovePayment = async (paymentId) => {
    setIsApproving(true);
    
    try {
      const success = await approvePayment(paymentId, "Payment approved by landlord");
      
      if (success) {
        // Update the local payment history to reflect the change
        setPaymentHistory(prevPayments => 
          prevPayments.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: "approved" } 
              : payment
          )
        );
        
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Payment Approved",
          text: "The payment has been approved successfully."
        });
        
        // Refresh this tenant's payment data instead of calling getAllPayments
        if (tenant?._id) {
          const updatedPayments = await getTenantPayments(tenant._id);
          setPaymentHistory(updatedPayments || []);
        }
      }
    } catch (err) {
      console.error("Error approving payment:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve payment"
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Handle payment rejection
  const handleRejectPayment = async (paymentId) => {
    setIsRejecting(true);
    try {
      const success = await rejectPayment(paymentId, "Payment rejected by landlord");
      
      if (success) {
        // Update the local payment history to reflect the change
        setPaymentHistory(prevPayments => 
          prevPayments.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: "rejected" } 
              : payment
          )
        );
      } else {
        throw new Error('Failed to reject payment');
      }
    } catch (err) {
      console.error("Error rejecting payment:", err);
      alert("Failed to reject payment: " + (err.message));
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle lease file selection
  const handleLeaseFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, images)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setLeaseUploadMessage({
          type: "error",
          text: "Please select a PDF or image file.",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setLeaseUploadMessage({
          type: "error",
          text: "File size should be less than 10MB.",
        });
        return;
      }

      setLeaseFile(file);
      setLeaseUploadMessage(null);
    }
  };

  // Upload lease document using our store
  const handleUploadLease = async () => {
    if (!leaseFile) {
      setLeaseUploadMessage({
        type: "error",
        text: "Please select a file first.",
      });
      return;
    }

    setIsUploadingLease(true);
    setLeaseUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", leaseFile);
      formData.append("tenant_id", tenant._id);
      formData.append("documentType", "lease");
      formData.append("description", "Lease Agreement");

      // Use our store to upload the document
      await uploadLeaseDocument(formData);

      setLeaseUploadMessage({
        type: "success",
        text: "Lease document uploaded successfully.",
      });

      // Clear the file input
      setLeaseFile(null);
      document.getElementById("leaseFileInput").value = "";
    } catch (err) {
      console.error("Error uploading lease document:", err);
      setLeaseUploadMessage({
        type: "error",
        text: err.message || "Failed to upload document",
      });
    } finally {
      setIsUploadingLease(false);
    }
  };

  // Handle deleting a lease document
  const handleDeleteLease = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteLeaseDocument(id);
        setLeaseUploadMessage({
          type: "success",
          text: "Document deleted successfully.",
        });
      } catch (err) {
        setLeaseUploadMessage({
          type: "error",
          text: "Failed to delete document.",
        });
      }
    }
  };

  // Function to view lease document
  const handleViewLease = (documentPath) => {
    setCurrentProof(documentPath);
    setProofModalOpen(true);
  };

  // Handle end tenancy function
  const handleEndTenancy = async () => {
    if (!detailedTenant?.apartment?._id) {
      console.error("No apartment ID found:", detailedTenant);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No apartment information found for this tenant."
      });
      return;
    }
    
    const apartmentId = detailedTenant.apartment._id;
    
    // Show confirmation dialog
    const result = await Swal.fire({
      title: "End Tenancy?",
      text: "This will remove the tenant from this apartment and make it available for new tenants. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, end tenancy",
      cancelButtonText: "Cancel"
    });
    
    if (result.isConfirmed) {
      setIsEndingTenancy(true);
      try {
        // Log for debugging
        console.log("Ending tenancy for apartment:", apartmentId);
        
        // Call the vacateApartment function with the apartment ID
        const success = await vacateApartment(apartmentId);
        
        if (success) {
          Swal.fire({
            icon: "success",
            title: "Tenancy Ended",
            text: "The apartment is now available for new tenants"
          });
          
          // Notify parent component about the change
          if (typeof onTenancyEnded === 'function') {
            onTenancyEnded();
          }
          
          // Close the modal
          onClose();
        } else {
          throw new Error("Failed to end tenancy");
        }
      } catch (error) {
        console.error("Error ending tenancy:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to end tenancy. Please try again."
        });
      } finally {
        setIsEndingTenancy(false);
      }
    }
  };

  // Add this function to handle messaging
  const handleMessageTenant = () => {
    if (!tenant || !tenant._id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot message this tenant. Tenant information is incomplete."
      });
      return;
    }
    
    // Close the modal
    onClose();
    
    // Navigate to the messaging page
    const path = user?.role === 'landlord' 
      ? `/landlord/messages?tenant=${tenant._id}`
      : `/tenant/messages?landlord=${tenant._id}`;
      
    navigate(path);
  };

  if (!isOpen || !tenant) return null;

  // Use either the fetched detailed tenant or the initial tenant object
  const displayTenant = detailedTenant || tenant;

  // Format date helper function with better error handling
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return dateString;
    }
  };

  // Calculate tenancy duration
  const getTenancyDuration = (moveInDate) => {
    if (!moveInDate) return "N/A";
    
    try {
      const start = new Date(moveInDate);
      const now = new Date();
      const diffInMonths = (now.getFullYear() - start.getFullYear()) * 12 + 
                           (now.getMonth() - start.getMonth());
      
      if (diffInMonths < 1) {
        const diffInDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
      }
      
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`;
    } catch (err) {
      console.error("Duration calculation error:", err);
      return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Tenant Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            ) : (
              <>
                {/* Tenant Profile */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden mx-auto md:mx-0">
                      {displayTenant.avatar ? (
                        <img
                          src={displayTenant.avatar}
                          alt={displayTenant.name || "Tenant"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{displayTenant.name?.charAt(0).toUpperCase() || "T"}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{displayTenant.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span> {displayTenant.email || "Not provided"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Phone:</span> {displayTenant.phoneNumber || displayTenant.phone || "Not provided"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Member Since:</span> {formatDate(displayTenant.createdAt)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Last Login:</span> {formatDate(displayTenant.lastLogin) || "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Room:</span> {displayTenant.apartment?.room || "Not Assigned"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Monthly Rent:</span> ₱
                          {displayTenant.apartment?.rent?.toLocaleString() || "0"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Lease Duration:</span> {displayTenant.duration ? `${displayTenant.duration} ${displayTenant.duration === 1 ? 'month' : 'months'}` : "Not specified"}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Move-in Date:</span> {formatDate(displayTenant.moveInDate) || "Not specified"}
                        </p>

                        <p className="text-gray-600">
                          <span className="font-medium">Status:</span>{" "}
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lease Documents Section - Using our store */}
                <div className="border-t pt-6 mb-6">
                  <h4 className="font-semibold text-lg mb-4">Lease Documents</h4>

                  {leaseLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : leaseError ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                      <p>{leaseError}</p>
                    </div>
                  ) : (
                    <>
                      {/* Current Lease Documents */}
                      {leaseDocuments.length > 0 ? (
                        <div className="mb-6">
                          <h5 className="font-medium mb-2">Current Documents</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {leaseDocuments.map((doc) => (
                              <div key={doc._id} className="border rounded-lg p-3 flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{doc.description || "Lease Document"}</p>
                                  <p className="text-sm text-gray-500">Uploaded: {formatDate(doc.createdAt)}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewLease(doc.fileUrl)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLease(doc._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-4">No lease documents uploaded yet.</p>
                      )}
                    </>
                  )}

                  {/* Upload New Lease Document */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="font-medium mb-3">Upload New Lease Document</h5>

                    {leaseUploadMessage && (
                      <div
                        className={`p-3 mb-3 rounded ${
                          leaseUploadMessage.type === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {leaseUploadMessage.text}
                      </div>
                    )}

                    <div className="flex flex-col space-y-3">
                      <input
                        type="file"
                        id="leaseFileInput"
                        onChange={handleLeaseFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label
                        htmlFor="leaseFileInput"
                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            {leaseFile ? leaseFile.name : "Click to select file or drag and drop"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 10MB)</p>
                        </div>
                      </label>

                      <button
                        onClick={handleUploadLease}
                        disabled={!leaseFile || isUploadingLease}
                        className={`bg-blue-600 text-white py-2 px-4 rounded-md ${
                          !leaseFile || isUploadingLease ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                        }`}
                      >
                        {isUploadingLease ? "Uploading..." : "Upload Lease Document"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4">Payment History</h4>
                  <div className="overflow-x-auto">
                    {paymentHistory.length > 0 ? (
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b text-left">Date</th>
                            <th className="py-2 px-4 border-b text-left">Amount</th>
                            <th className="py-2 px-4 border-b text-left">Reference #</th>
                            <th className="py-2 px-4 border-b text-left">Status</th>
                            <th className="py-2 px-4 border-b text-left">Proof</th>
                            <th className="py-2 px-4 border-b text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((payment) => (
                            <tr key={payment._id}>
                              <td className="py-2 px-4 border-b">{formatDate(payment.createdAt || payment.paymentDate)}</td>
                              <td className="py-2 px-4 border-b">₱{payment.amount?.toLocaleString() || 0}</td>
                              <td className="py-2 px-4 border-b">{payment.reference_number || "N/A"}</td>
                              <td className="py-2 px-4 border-b">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : payment.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {payment.status === "approved" 
                                    ? "Approved" 
                                    : payment.status === "pending"
                                      ? "Pending"
                                      : "Rejected"}
                                </span>
                              </td>
                              <td className="py-2 px-4 border-b">
                                {payment.image_path || payment.proofUrl ? (
                                  <button 
                                    onClick={() => handleViewProof(payment.image_path || payment.proofUrl)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                  >
                                    View
                                  </button>
                                ) : (
                                  "No proof"
                                )}
                              </td>
                              <td className="py-2 px-4 border-b">
                                {payment.status === "pending" && (
                                  <div className="flex space-x-1">
                                    <button 
                                      onClick={() => handleApprovePayment(payment._id)}
                                      disabled={isApproving}
                                      className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs ${
                                        isApproving ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    >
                                      {isApproving ? "..." : "Approve"}
                                    </button>
                                    <button 
                                      onClick={() => handleRejectPayment(payment._id)}
                                      disabled={isRejecting}
                                      className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs ${
                                        isRejecting ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    >
                                      {isRejecting ? "..." : "Reject"}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded border border-gray-200">
                        <p className="text-gray-500">No payment history available for this tenant.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info sections */}
                {displayTenant.emergencyContact && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="font-semibold text-lg mb-4">Emergency Contact</h4>
                    <p className="text-gray-600">{displayTenant.emergencyContact}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t flex justify-end space-x-4">
                  <button 
                    onClick={handleMessageTenant}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-medium flex items-center"
                  >
                    <svg 
                      className="w-4 h-4 mr-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                      />
                    </svg>
                    Message
                  </button>
                  
                  {/* End Tenancy button with updated onClick handler */}
                  {displayTenant.apartment && (
                    <button 
                      onClick={handleEndTenancy}
                      disabled={isEndingTenancy}
                      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium flex items-center ${
                        isEndingTenancy ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isEndingTenancy ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'End Tenancy'
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
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

export default TenantDetailsModal;

/* 
  Example usage in parent component:
  <TenantDetailsModal 
    isOpen={showModal}
    onClose={handleCloseModal}
    tenant={selectedTenant}
    onTenancyEnded={fetchTenants} 
  />
*/