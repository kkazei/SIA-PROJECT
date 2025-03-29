import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { useAnnouncementStore } from "../../store/announcementStore";
import InquiriesModal from "../../components/Tenant-Dashboard/InquiriesModal";
import LeaseAgreementModal from "../../components/Tenant-Dashboard/LeaseAgreementModal";
import LandlordAnnouncementModal from "../../components/Tenant-Dashboard/LandlordAnnouncementModal";
import PaymentHistoryModal from "../../components/Tenant-Dashboard/PaymentHistoryModal";
import PaymentProofModal from "../../components/Tenant-Dashboard/PaymentProofModal";
import BrowseApartmentsModal from "../../components/Tenant-Dashboard/BrowseApartmentsModal";

// Main Dashboard Component
const TenantDashboard = () => {
  const [isInquiriesModalOpen, setIsInquiriesModalOpen] = useState(false);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isLandlordAnnouncementModalOpen, setIsLandlordAnnouncementModalOpen] = useState(false);
  const [isBrowseApartmentsModalOpen, setIsBrowseApartmentsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  
  const { user, logout } = useAuthStore();
  const { 
    getTenantApartment, 
    currentApartment, 
    isLoading: apartmentLoading,
    getAvailableApartments,
    apartments: availableApartments,
  } = useApartmentStore();
  const { getTenantAnnouncements } = useAnnouncementStore();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tenantDetails, setTenantDetails] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [paymentQR, setPaymentQR] = useState(null);
  
  // Mock payment history (will be replaced by actual API calls later)
  const [paymentHistory, setPaymentHistory] = useState([
    {
      _id: "pay1",
      amount: 10000,
      status: "approved",
      paymentDate: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
      referenceNumber: "REF123456",
      proofImage: "/image/payment-proof-sample.jpg"
    }
  ]);

  // Fetch tenant's apartment and payment details
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        // Fetch the apartment assigned to the tenant
        await getTenantApartment();
        
        // Generate a QR code for payment
        setPaymentQR(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Tenant:${user?.id || "unknown"}`);
        
        // Fetch real announcements from API
        try {
          const announcementsData = await getTenantAnnouncements();
          setAnnouncements(announcementsData || []);
        } catch (announcementError) {
          console.error("Error fetching announcements:", announcementError);
          // If there's an error fetching announcements, use placeholder data
          setAnnouncements([
            {
              _id: "placeholder1",
              title: "No Announcements Available",
              content: "There was an issue loading announcements. Please try again later.",
              createdAt: new Date().toISOString(),
              important: false
            }
          ]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tenant data:", err);
        setError("Unable to load your dashboard. Please try again later.");
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTenantData();
    }
  }, [user, getTenantApartment, getTenantAnnouncements]);

  // Update tenant details when apartment data changes
  useEffect(() => {
    if (currentApartment) {
      // Get payment info from the apartment
      const paymentInfo = currentApartment.paymentInfo || {};
      const nextDueDate = paymentInfo.nextDueDate ? new Date(paymentInfo.nextDueDate) : null;
      
      // Use payment status from backend, or calculate it
      let paymentStatus = paymentInfo.paymentStatus || 'pending';
      let daysRemaining = null;
      
      if (nextDueDate) {
        // Calculate days remaining
        const today = new Date();
        const diffTime = nextDueDate - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If backend hasn't updated status but date is past due, set to overdue
        if (paymentStatus === 'pending' && daysRemaining < 0) {
          paymentStatus = 'overdue';
        }
      }
      
      // Set tenant details with the apartment information including payment info
      setTenantDetails({
        tenant_fullname: user?.name,
        room: currentApartment.room,
        rent: currentApartment.rent,
        status: paymentStatus,
        due_date: nextDueDate ? nextDueDate.toISOString() : null,
        daysRemaining: daysRemaining,
        landlord: currentApartment.landlord_id || {
          name: "Your Landlord",
          email: "contact@landlord.com",
          phone: "Please contact property management"
        }
      });
    }
  }, [currentApartment, user]);

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
  
  // New functions for browsing apartments
  const openBrowseApartmentsModal = async () => {
    try {
      // Fetch available apartments
      await getAvailableApartments();
      setIsBrowseApartmentsModalOpen(true);
      document.body.classList.add("overflow-hidden");
    } catch (error) {
      console.error("Error fetching available apartments:", error);
      setError("Unable to load available apartments. Please try again later.");
    }
  };
  
  const closeBrowseApartmentsModal = () => {
    setIsBrowseApartmentsModalOpen(false);
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

  // Submit inquiry
  const submitInquiry = async (data) => {
    console.log("Submitting inquiry:", data);
    setSuccess("Inquiry submitted successfully!");
    return { success: true };
  };

  // Fetch payment history - temporary mock implementation
  const fetchPaymentHistory = async () => {
    return paymentHistory || [];
  };

  // Submit payment proof - temporary implementation without payment store
  const submitPayment = async (data) => {
    try {
      console.log("Payment data:", data);
      
      // Create a new payment record (mock implementation)
      const newPayment = {
        _id: `pay${Date.now()}`,
        amount: currentApartment.rent,
        status: "pending", // Initially pending until approved
        paymentDate: new Date().toISOString(),
        referenceNumber: data.referenceNumber,
        proofImage: selectedFile ? URL.createObjectURL(selectedFile) : null
      };
      
      // Add to payment history
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // After successful payment submission, update the tenant details
      // The due date should be updated to next month
      const newDueDate = new Date();
      newDueDate.setMonth(newDueDate.getMonth() + 1);
      
      // Update payment info locally (backend will handle the real update)
      setTenantDetails(prev => ({
        ...prev,
        due_date: newDueDate.toISOString(),
        daysRemaining: 30, // Approximately
        status: 'pending' // Reset to pending for the new payment cycle
      }));
      
      // In a real implementation, you would refresh apartment data here
      // to get the updated payment info from the backend
      
      setSuccess("Payment proof submitted successfully!");
      closePaymentProofModal();
      return { success: true };
    } catch (error) {
      setError("Failed to submit payment. Please try again.");
      return { success: false };
    }
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

  if (loading || apartmentLoading) {
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

  // If tenant has no assigned apartment yet
  if (!currentApartment) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}</h2>
        <p className="mb-4 text-gray-600">You don't have any assigned apartment yet.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
          <button
            onClick={openBrowseApartmentsModal}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Browse Available Apartments
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {/* Browse Apartments Modal */}
        <BrowseApartmentsModal 
          isOpen={isBrowseApartmentsModalOpen}
          closeModal={closeBrowseApartmentsModal}
          apartments={availableApartments}
          hasApartment={false}
        />
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
          onClick={openBrowseApartmentsModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">🏘️</span>
          <p className="mt-2">Browse Apartments</p>
        </div>

        <div
          onClick={handleLogout}
          className="bg-red-500 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-red-600 transition duration-200"
        >
          <span className="text-3xl">👋</span>
          <p className="mt-2">Logout</p>
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
        tenantId={user?.id}
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

      {/* Browse Apartments Modal */}
      <BrowseApartmentsModal 
        isOpen={isBrowseApartmentsModalOpen}
        closeModal={closeBrowseApartmentsModal}
        apartments={availableApartments}
        hasApartment={true}
      />
    </div>
  );
};

export default TenantDashboard;