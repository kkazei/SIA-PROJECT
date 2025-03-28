import React, { useState, useEffect } from "react";
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
  const { user, logout } = useAuthStore();
  
  // Static data for tenant dashboard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tenantDetails, setTenantDetails] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [paymentQR, setPaymentQR] = useState("https://example.com/payment-qr.png");

  // Simulate data loading
  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setTenantDetails({
        tenant_fullname: user?.name || "John Doe",
        room: "Room 101",
        rent: 5000,
        status: "pending",
        due_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        daysRemaining: 7,
        landlord: {
          _id: "landlord123",
          name: "Jane Smith",
          email: "landlord@example.com",
          phone: "123-456-7890"
        }
      });
      
      setAnnouncements([
        {
          _id: "ann1",
          title: "Building Maintenance",
          content: "Water will be shut off for maintenance on Saturday from 10am-2pm.",
          createdAt: new Date().toISOString(),
          important: true
        },
        {
          _id: "ann2",
          title: "Rent Increase Notice",
          content: "Please be advised that rent will increase by 5% starting next month due to increased utility costs.",
          createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
          important: true
        },
        {
          _id: "ann3",
          title: "Holiday Schedule",
          content: "The management office will be closed during the holidays from Dec 24-26.",
          createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
          important: false
        }
      ]);

      setPaymentQR("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PaymentDetails12345");
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

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

  const handleLogout = () => {
    logout();
  };

  const removeFile = () => setSelectedFile(null);

  // Mock functions for actions
  const submitInquiry = async (data) => {
    console.log("Submitting inquiry:", data);
    setSuccess("Inquiry submitted successfully!");
    return { success: true };
  };

  const fetchPaymentHistory = async () => {
    return [
      {
        _id: "payment1",
        amount: 5000,
        date: new Date().toISOString(),
        status: "paid",
        referenceNumber: "REF123456"
      },
      {
        _id: "payment2",
        amount: 5000,
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        status: "paid",
        referenceNumber: "REF789012"
      },
      {
        _id: "payment3",
        amount: 5000,
        date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
        status: "paid",
        referenceNumber: "REF345678"
      }
    ];
  };

  const submitPayment = async (data) => {
    console.log("Submitting payment:", data);
    setSuccess("Payment proof submitted successfully!");
    closePaymentProofModal();
    return { success: true };
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

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
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
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
          <h1 className="text-2xl font-bold">{tenantDetails?.tenant_fullname || user?.name}</h1>
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
          onClick={handleLogout}
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
        submitInquiry={submitInquiry}
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
        fetchPaymentHistory={fetchPaymentHistory}
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
        submitPayment={submitPayment}
      />
    </div>
  );
};

export default TenantDashboard;