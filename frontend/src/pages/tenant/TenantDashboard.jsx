import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { useAnnouncementStore } from "../../store/announcementStore";

// Component imports
import InquiriesModal from "../../components/Tenant-Dashboard/InquiriesModal";
import LeaseAgreementModal from "../../components/Tenant-Dashboard/LeaseAgreementModal";
import LandlordAnnouncementModal from "../../components/Tenant-Dashboard/LandlordAnnouncementModal";
import PaymentHistoryModal from "../../components/Tenant-Dashboard/PaymentHistoryModal";
import PaymentProofModal from "../../components/Tenant-Dashboard/PaymentProofModal";
import BrowseApartmentsModal from "../../components/Tenant-Dashboard/BrowseApartmentsModal";
import ApplicationsModal from "../../components/Tenant-Dashboard/ApplicationsModal";

// Dashboard sections
import TenantHeader from "../../components/Tenant-Dashboard/TenantHeader";
import TenantMenu from "../../components/Tenant-Dashboard/TenantMenu";
import LandlordInfo from "../../components/Tenant-Dashboard/LandlordInfo";
import NoApartmentView from "../../components/Tenant-Dashboard/NoApartmentView";

// Main Dashboard Component
const TenantDashboard = () => {
  // Modal states
  const [modals, setModals] = useState({
    inquiries: false,
    lease: false,
    paymentHistory: false,
    landlordAnnouncement: false,
    browseApartments: false,
    paymentProof: false,
    applications: false
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  
  // Store hooks
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
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Toggle modal functions
  const toggleModal = (modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: !prev[modalName]
    }));
    
    // Additional actions for specific modals
    if (modalName === 'browseApartments' && !modals.browseApartments) {
      getAvailableApartments();
    }
    
    // Handle body overflow
    if (!modals[modalName]) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  };

  // Fetch tenant's apartment and payment details
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        await getTenantApartment();
        
        // Generate a QR code for payment
        setPaymentQR(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Tenant:${user?.id || "unknown"}`);
        
        // Fetch announcements
        try {
          const announcementsData = await getTenantAnnouncements();
          setAnnouncements(announcementsData || []);
        } catch (announcementError) {
          console.error("Error fetching announcements:", announcementError);
          setAnnouncements([{
            _id: "placeholder1",
            title: "No Announcements Available",
            content: "There was an issue loading announcements. Please try again later.",
            createdAt: new Date().toISOString(),
            important: false
          }]);
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
        
        if (paymentStatus === 'pending' && daysRemaining < 0) {
          paymentStatus = 'overdue';
        }
      }
      
      // Set tenant details with the apartment information
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
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

  // Submit payment proof - temporary implementation
  const submitPayment = async (data) => {
    try {
      const newPayment = {
        _id: `pay${Date.now()}`,
        amount: currentApartment.rent,
        status: "pending",
        paymentDate: new Date().toISOString(),
        referenceNumber: data.referenceNumber,
        proofImage: selectedFile ? URL.createObjectURL(selectedFile) : null
      };
      
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // Update due date locally
      const newDueDate = new Date();
      newDueDate.setMonth(newDueDate.getMonth() + 1);
      
      setTenantDetails(prev => ({
        ...prev,
        due_date: newDueDate.toISOString(),
        daysRemaining: 30,
        status: 'pending'
      }));
      
      setSuccess("Payment proof submitted successfully!");
      toggleModal('paymentProof');
      return { success: true };
    } catch (error) {
      setError("Failed to submit payment. Please try again.");
      return { success: false };
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

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
      <NoApartmentView 
        userName={user?.name}
        onBrowseClick={() => toggleModal('browseApartments')}
        onApplicationsClick={() => toggleModal('applications')}
        onLogout={logout}
      >
        <BrowseApartmentsModal 
          isOpen={modals.browseApartments}
          closeModal={() => toggleModal('browseApartments')}
          apartments={availableApartments}
          hasApartment={false}
        />
        <ApplicationsModal
          isOpen={modals.applications}
          closeModal={() => toggleModal('applications')}
        />
      </NoApartmentView>
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
      
      <TenantHeader 
        tenantDetails={tenantDetails}
        onPaymentClick={() => toggleModal('paymentProof')}
      />

      <TenantMenu 
        announcements={announcements} 
        onOpenModal={toggleModal}
        onLogout={logout}
      />

      {tenantDetails?.landlord && (
        <LandlordInfo landlord={tenantDetails.landlord} />
      )}

      {/* All modals */}
      <LandlordAnnouncementModal
        isOpen={modals.landlordAnnouncement}
        closeModal={() => toggleModal('landlordAnnouncement')}
      />

      <InquiriesModal
        isOpen={modals.inquiries}
        closeModal={() => toggleModal('inquiries')}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        removeFile={removeFile}
        landlordId={tenantDetails?.landlord?._id}
        submitInquiry={submitInquiry}
      />

      <LeaseAgreementModal
        isOpen={modals.lease}
        closeModal={() => toggleModal('lease')}
        tenantDetails={tenantDetails}
      />

      <PaymentHistoryModal
        isOpen={modals.paymentHistory}
        closeModal={() => toggleModal('paymentHistory')}
        tenantId={user?.id}
        fetchPaymentHistory={fetchPaymentHistory}
      />

      <PaymentProofModal
        isOpen={modals.paymentProof}
        closeModal={() => toggleModal('paymentProof')}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        referenceNumber={referenceNumber}
        setReferenceNumber={setReferenceNumber}
        paymentQR={paymentQR}
        tenantDetails={tenantDetails}
        submitPayment={submitPayment}
      />

      <BrowseApartmentsModal 
        isOpen={modals.browseApartments}
        closeModal={() => toggleModal('browseApartments')}
        apartments={availableApartments}
        hasApartment={true}
      />
      
      <ApplicationsModal
        isOpen={modals.applications}
        closeModal={() => toggleModal('applications')}
      />
    </div>
  );
};

export default TenantDashboard;