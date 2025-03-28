import React, { useState, useEffect } from "react";
import { useTenantDashboardStore } from "../../store/tenantuserStore";
import { useAuthStore } from "../../store/authStore";
import InquiriesModal from "../../components/Tenant-Dashboard/InquiriesModal";
import LeaseAgreementModal from "../../components/Tenant-Dashboard/LeaseAgreementModal";
import LandlordAnnouncementModal from "../../components/Tenant-Dashboard/LandlordAnnouncementModal";
import PaymentHistoryModal from "../../components/Tenant-Dashboard/PaymentHistoryModal";
import PaymentProofModal from "../../components/Tenant-Dashboard/PaymentProofModal";

// Main Dashboard Component
const TenantDashboard = () => {
  const [isInquiriesModalOpen, setIsInquiriesModalOpen] = useState(false);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isLandlordAnnouncementModalOpen, setIsLandlordAnnouncementModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const { user } = useAuthStore();
  
  // Get data and functions from tenantDashboardStore
  const { 
    tenantDetails, 
    announcements, 
    paymentQR,
    loading, 
    error,
    success,
    fetchTenantDetails, 
    fetchAnnouncements,
    clearError,
    clearSuccess
  } = useTenantDashboardStore();

  // Fetch tenant details including apartment information
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchTenantDetails();
        await fetchAnnouncements();
      } catch (err) {
        // Error handling is done within the store
      }
    };
    
    fetchData();
  }, [fetchTenantDetails, fetchAnnouncements]);

  // Modal control functions
  const openInquiriesModal = () => {
    setIsInquiriesModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeInquiriesModal = () => {
    setIsInquiriesModalOpen(false);
    setSelectedFile(null);
    document.body.classList.remove("overflow-hidden");
  };

  const openLeaseModal = () => {
    setIsLeaseModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeLeaseModal = () => {
    setIsLeaseModalOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const openPaymentHistoryModal = () => {
    setIsPaymentHistoryModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closePaymentHistoryModal = () => {
    setIsPaymentHistoryModalOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const openLandlordAnnouncementModal = () => {
    setIsLandlordAnnouncementModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeLandlordAnnouncementModal = () => {
    setIsLandlordAnnouncementModalOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  const openPaymentProofModal = () => {
    setIsPaymentProofModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closePaymentProofModal = () => {
    setIsPaymentProofModalOpen(false);
    setSelectedFile(null);
    setReferenceNumber("");
    document.body.classList.remove("overflow-hidden");
  };

  const logout = () => {
    // Reset the tenant dashboard store on logout
    useTenantDashboardStore.getState().resetStore();
    localStorage.removeItem("token");
    window.location.href = "/tenant-login";
  };

  const removeFile = () => setSelectedFile(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color based on payment status
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => {
            clearError();
            fetchTenantDetails();
            fetchAnnouncements();
          }}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mx-auto px-4">
      {success && (
        <div className="bg-green-500 text-white p-3 rounded-md mb-4 flex justify-between">
          <p>{success}</p>
          <button onClick={clearSuccess} className="text-white">✕</button>
        </div>
      )}
      
      <div className="bg-green-100 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">{tenantDetails?.tenant_fullname || user?.tenant_fullname}</h1>
          <p className="text-gray-600">{tenantDetails?.room || "Room not assigned"}</p>
          <p className="text-sm text-gray-500 mt-1">
            As of{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            ,{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Outstanding Balance</p>
          <p className="text-2xl font-bold text-gray-800">
            PHP {tenantDetails?.rent ? tenantDetails.rent.toLocaleString() : "0.00"}
          </p>
          <p className={`text-sm ${getStatusColor(tenantDetails?.status)}`}>
            Status: {tenantDetails?.status || "Not set"}
          </p>
          {tenantDetails?.due_date && (
            <p className="text-sm text-gray-600 mt-1">
              Due: {formatDate(tenantDetails.due_date)}
              {tenantDetails.daysRemaining !== null && (
                <span className={tenantDetails.daysRemaining < 5 ? "text-red-500" : "text-gray-600"}>
                  {" "}({tenantDetails.daysRemaining > 0 ? `${tenantDetails.daysRemaining} days left` : "Overdue"})
                </span>
              )}
            </p>
          )}
          <button
            onClick={openPaymentProofModal}
            className="bg-green-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-green-600 transition duration-200"
          >
            PAY NOW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div
          onClick={openLandlordAnnouncementModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">📢</span>
          <p className="mt-2">Landlord Announcements</p>
          {announcements.length > 0 && (
            <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute -mt-2 ml-10">
              {announcements.length}
            </div>
          )}
        </div>

        <div
          onClick={openPaymentHistoryModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">📄</span>
          <p className="mt-2">Payment History</p>
        </div>

        <div
          onClick={openLeaseModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">🏠</span>
          <p className="mt-2">Lease Agreement</p>
        </div>

        <div
          onClick={openInquiriesModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">✉️</span>
          <p className="mt-2">Inquiries</p>
        </div>

        <div
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 w-full sm:w-32 rounded-lg mt-2 hover:bg-red-600 transition duration-200 text-center"
        >
          <p>Logout</p>
        </div>
      </div>

      {/* Landlord Information Section */}
      {tenantDetails?.landlord && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg border-b pb-2 mb-2">Landlord Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{tenantDetails.landlord.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact</p>
              <p className="font-medium">{tenantDetails.landlord.email}</p>
              <p className="font-medium">{tenantDetails.landlord.phone || "No phone provided"}</p>
            </div>
          </div>
        </div>
      )}

      <LandlordAnnouncementModal
        isOpen={isLandlordAnnouncementModalOpen}
        closeModal={closeLandlordAnnouncementModal}
        announcements={announcements}
      />

      <InquiriesModal
        isOpen={isInquiriesModalOpen}
        closeModal={closeInquiriesModal}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        removeFile={removeFile}
        landlordId={tenantDetails?.landlord?._id}
        submitInquiry={useTenantDashboardStore.getState().submitInquiry}
      />

      <LeaseAgreementModal
        isOpen={isLeaseModalOpen}
        closeModal={closeLeaseModal}
        tenantDetails={tenantDetails}
      />

      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        closeModal={closePaymentHistoryModal}
        tenantId={tenantDetails?._id}
        fetchPaymentHistory={useTenantDashboardStore.getState().fetchPaymentHistory}
      />

      <PaymentProofModal
        isOpen={isPaymentProofModalOpen}
        closeModal={closePaymentProofModal}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        referenceNumber={referenceNumber}
        setReferenceNumber={setReferenceNumber}
        paymentQR={paymentQR}
        tenantDetails={tenantDetails}
        submitPayment={useTenantDashboardStore.getState().submitPayment}
      />
    </div>
  );
};

export default TenantDashboard;