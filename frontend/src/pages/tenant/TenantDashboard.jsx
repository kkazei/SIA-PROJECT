import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useInquiryStore } from "../../store/inquiryStore";
import { useQRImageStore } from "../../store/qrImageStore"; // Import QR image store
import { usePaymentStore, processImagePath } from "../../store/paymentStore"; // Import processImagePath helper
import TenantSideNav from "../../components/layout/TenantSideNav";
import { 
  FaFileInvoiceDollar, 
  FaFileContract, 
  FaCalendarAlt, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaBell,
  FaChartLine,
  FaRegBuilding,
  FaEnvelope
} from 'react-icons/fa';

// Import your modals
import InquiriesModal from "../../components/Tenant-Dashboard/InquiriesModal";
import LeaseAgreementModal from "../../components/Tenant-Dashboard/LeaseAgreementModal";
import LandlordAnnouncementModal from "../../components/Tenant-Dashboard/LandlordAnnouncementModal";
import PaymentHistoryModal from "../../components/Tenant-Dashboard/PaymentHistoryModal";
import PaymentProofModal from "../../components/Tenant-Dashboard/PaymentProofModal";
import BrowseApartmentsModal from "../../components/Tenant-Dashboard/BrowseApartmentsModal";
import ApplicationsModal from "../../components/Tenant-Dashboard/ApplicationsModal";
import NoApartmentView from "../../components/Tenant-Dashboard/NoApartmentView";

// Improve the formatDate function where it's defined
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
    return "Invalid date";
  }
};

const TenantDashboard = () => {
  // State declarations - keep your existing state
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tenantDetails, setTenantDetails] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [paymentQR, setPaymentQR] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [structuredTenantDetails, setStructuredTenantDetails] = useState(null); // Structured tenant details

  // Your existing unified modal state
  const [modals, setModals] = useState({
    inquiries: false,
    lease: false,
    paymentHistory: false,
    landlordAnnouncement: false,
    browseApartments: false,
    paymentProof: false,
    applications: false,
    payments: false,
    announcements: false
  });

  // Store hooks - keep your existing hooks
  const { user, logout } = useAuthStore();
  const { 
    getTenantApartment, 
    currentApartment, 
    isLoading: apartmentLoading,
    getAvailableApartments,
    apartments: availableApartments,
  } = useApartmentStore();
  const { getTenantAnnouncements } = useAnnouncementStore();
  const {
    inquiries,
    getTenantInquiries,
    loading: inquiriesLoading,
    error: inquiriesError
  } = useInquiryStore();
  const { qrImages, loading: qrLoading, getTenantQRImages } = useQRImageStore(); // Add QR image state and functions
  const { payments, getTenantPayments } = usePaymentStore(); // Add payment store hooks

  // Keep all your existing handlers and functions
  const handleModalOpen = (modalId) => {
    setModals(prev => ({ ...prev, [modalId]: true }));
    document.body.classList.add("overflow-hidden");

    if (modalId === 'browseApartments') {
      getAvailableApartments();
    }
    if (modalId === 'inquiries') {
      loadTenantInquiries();
    }
    // Reset payment form when opening payment modal
    if (modalId === 'payments') {
      setSelectedFile(null);
      setReferenceNumber("");
    }
  };

  const handleModalClose = (modalId) => {
    setModals(prev => ({ ...prev, [modalId]: false }));
    document.body.classList.remove("overflow-hidden");
  };

  const loadTenantInquiries = async () => {
    try {
      await getTenantInquiries();
    } catch (err) {
      console.error("Error fetching tenant inquiries:", err);
      setError("Unable to load your inquiries. Please try again later.");
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Keep your existing useEffects and add QR image fetching
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const apartmentData = await getTenantApartment();
        
        await getTenantQRImages(); // Fetch QR images
        
        const announcementsData = await getTenantAnnouncements();
        setAnnouncements(announcementsData || []);
        await loadTenantInquiries();
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tenant data:", err);
        setError("Unable to load your dashboard. Please try again later.");
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [getTenantApartment, getTenantAnnouncements, getTenantQRImages, user?.id]);

  // Update when user or apartment data changes
  useEffect(() => {
    if (user && currentApartment) {
      setStructuredTenantDetails({
        userId: user.id,
        fullName: user.name,
        email: user.email,
        apartmentId: currentApartment._id,
        apartmentName: currentApartment.room || "Unknown Room",
        rent: currentApartment.rent || 0
      });
    }
  }, [user, currentApartment]);

  // Add effect to fetch payments when user ID is available
  useEffect(() => {
    if (user?.id) {
      getTenantPayments(user.id);
    }
  }, [user?.id, getTenantPayments]);

  // Handle successful payment submission
  const handlePaymentSuccess = async (newPayment) => {
    // Show success message with enhanced styling
    setSuccess("Payment proof submitted successfully!");
    
    // Add confetti animation effect
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);
    
    // Remove confetti after animation
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 3000);
    
    // Refresh payment history
    if (user?.id) {
      await getTenantPayments(user.id);
    }
  };
  
  // Format date for display with enhanced styling
  const formatPaymentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString || 'Unknown date';
    }
  };

  // Keep all your other functions
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  const fetchPaymentHistory = async () => {
    return paymentHistory || [];
  };

  const submitPayment = async (data) => {
    try {
      // Log the information being sent (for debugging)
      console.log("Submitting payment with data:", {
        tenantDetails: structuredTenantDetails,
        referenceNumber: data.referenceNumber,
        fileInfo: selectedFile ? { name: selectedFile.name, size: selectedFile.size } : null
      });
      
      const newPayment = {
        _id: `pay${Date.now()}`,
        amount: currentApartment.rent,
        status: "pending",
        paymentDate: new Date().toISOString(),
        referenceNumber: data.referenceNumber,
        proofImage: selectedFile ? URL.createObjectURL(selectedFile) : null
      };
      
      setPaymentHistory(prev => [newPayment, ...prev]);
      setSuccess("Payment proof submitted successfully!");
      handleModalClose('payments');
      return { success: true };
    } catch (error) {
      console.error("Payment submission error:", error);
      setError("Failed to submit payment. Please try again.");
      return { success: false };
    }
  };

  // Simplified QR image rendering
  const renderQRImage = () => {
    if (qrLoading) {
      return (
        <div className="w-32 h-32 bg-white flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-500 rounded-full border-t-transparent"></div>
        </div>
      );
    }

    if (qrImages && qrImages.length > 0) {
      const latestQR = qrImages[0];
      const imagePath = processImagePath(latestQR.image_path);
      
      return (
        <div className="bg-white">
          {imagePath ? (
            <img 
              src={imagePath} 
              alt="Payment QR Code" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                console.log("QR image failed to load:", imagePath);
                e.target.onerror = null;
                e.target.onerror = null;
              }}
            />
          ) : (
            paymentQR ? <img src={paymentQR} alt="Payment QR Code" className="w-32 h-32 object-contain" /> : (
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-sm text-center">No QR code available</span>
              </div>
            )
          )}
        </div>
      );
    }

    return paymentQR ? (
      <img 
        src={paymentQR} 
        alt="Payment QR Code" 
        className="w-32 h-32 bg-white p-2 rounded-lg mb-3"
      />
    ) : (
      <div className="w-32 h-32 bg-white p-2 rounded-lg mb-3 flex items-center justify-center">
        <span className="text-gray-500 text-sm">No QR available</span>
      </div>
    );
  };

  // Loading state with enhanced animation
  if (loading || apartmentLoading || inquiriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center p-8 rounded-lg">
          <div className="loader">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <div className="animate-pulse mt-6 bg-blue-100 rounded-full h-2 w-24 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
        <style>{`
          .loader {
            position: relative;
          }
          .loader:before {
            content: "";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 20px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0% { transform: translateX(-50%) scale(1); opacity: 1; }
            100% { transform: translateX(-50%) scale(3); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // Check if tenant has an apartment
  const hasApartment = currentApartment && Object.keys(currentApartment).length > 0;

  // If tenant doesn't have an apartment, show NoApartmentView
  if (!hasApartment) {
    return (
      <NoApartmentView
        userName={user?.name || "Tenant"}
        onBrowseClick={() => handleModalOpen('browseApartments')}
        onApplicationsClick={() => handleModalOpen('applications')}
        onLogout={handleLogout}
      >
        <BrowseApartmentsModal
          isOpen={modals.browseApartments}
          closeModal={() => handleModalClose('browseApartments')}
          apartments={availableApartments || []}
          hasApartment={false}
        />
        <ApplicationsModal
          isOpen={modals.applications}
          closeModal={() => handleModalClose('applications')}
        />
      </NoApartmentView>
    );
  }

  // Determine payment status and colors
  const paymentDue = currentApartment?.nextDueDate ? new Date(currentApartment.nextDueDate) : null;
  const today = new Date();
  const daysToDue = paymentDue ? Math.ceil((paymentDue - today) / (1000 * 60 * 60 * 24)) : null;
  
  const paymentStatus = 
    !paymentDue ? "unknown" :
    daysToDue < 0 ? "overdue" :
    daysToDue < 5 ? "soon" : "good";

  const paymentStatusColor = {
    unknown: "bg-gray-500",
    overdue: "bg-red-600",
    soon: "bg-yellow-500",
    good: "bg-green-500"
  };

  const paymentStatusText = {
    unknown: "Unknown",
    overdue: "Overdue!",
    soon: `Due Soon (${daysToDue} days)`,
    good: "Up to Date"
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-white min-h-screen">
      <TenantSideNav 
        onToggle={setSidebarCollapsed} 
        onModalOpen={handleModalOpen}
      />

      {/* Main content - updated with enhanced styling */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`p-4 lg:p-8 w-full transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Error/Success Alerts with enhanced styling */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button 
                className="ml-auto bg-red-100 text-red-700 rounded-full p-1 hover:bg-red-200 transition-colors duration-200"
                onClick={() => setError(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{success}</p>
              </div>
              <button 
                className="ml-auto bg-green-100 text-green-700 rounded-full p-1 hover:bg-green-200 transition-colors duration-200"
                onClick={() => setSuccess(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Welcome Section - Updated to match landlord dashboard style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-md rounded-lg p-4 lg:p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className='text-xl lg:text-2xl font-bold text-gray-800'>
                Welcome, {user?.name || 'Tenant'}
              </h2>
              <p className='text-gray-600'>{formatDate(new Date())}</p>
            
              <div className={`mt-3 inline-flex items-center ${paymentStatusColor[paymentStatus]} text-white py-1.5 px-4 rounded-full shadow-md`}>
                <div className="font-semibold flex items-center">
                  {paymentStatus === 'good' && <FaCheckCircle className="mr-2" />}
                  {paymentStatus === 'soon' && <FaCalendarAlt className="mr-2" />}
                  {paymentStatus === 'overdue' && <FaBell className="mr-2 animate-pulse" />}
                  {paymentStatusText[paymentStatus]}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Box - Updated to match landlord dashboard style */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 lg:mt-6'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'
          >
            <h3 className="text-lg lg:text-xl font-bold text-white">Quick Actions</h3>
            <div className='grid grid-cols-2 gap-2 lg:gap-4 mt-4'>
              <button 
                onClick={() => handleModalOpen('applications')} 
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full"
              >
                <img src="/image/application.png" alt="Applications" className="w-8 h-8 lg:w-12 lg:h-12"/> 
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Applications</span> 
              </button>
              
              <button 
                onClick={() => handleModalOpen('paymentHistory')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full"
              >
                <FaMoneyBillWave className="w-8 h-8 lg:w-12 lg:h-12 text-green-400"/> 
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Payment History</span> 
              </button>
              
              <button 
                onClick={() => handleModalOpen('inquiries')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full"
              >
                <FaEnvelope className="w-8 h-8 lg:w-12 lg:h-12 text-purple-400"/>
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Inquiries</span> 
              </button>
              
              <button 
                onClick={() => handleModalOpen('announcements')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center w-full"
              >
                <FaBell className="w-8 h-8 lg:w-12 lg:h-12 text-amber-400"/> 
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Announcements</span> 
              </button>
            </div>
          </motion.div>

          {/* Apartment Details - Updated to match landlord dashboard style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'
          >
            <h3 className="text-lg lg:text-xl font-bold text-white">Your Apartment</h3>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <div className="h-36 bg-gray-800 rounded-lg overflow-hidden shadow-md">
                  {currentApartment?.images && currentApartment.images.length > 0 ? (
                    <img
                      src={processImagePath(currentApartment.images[0])}
                      alt={`${currentApartment.room}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/image/apartment-placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src="/image/apartment-placeholder.jpg"
                        alt="No apartment image"
                        className="w-12 h-12 opacity-30"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <h4 className="text-lg font-bold text-white">{currentApartment.room}</h4>
                <p className="text-green-400 font-semibold">₱{currentApartment.rent?.toLocaleString()}/month</p>
                <p className="text-gray-400 text-sm line-clamp-2 my-2">{currentApartment.description || "No description available."}</p>
                
                <div className="flex gap-3 mt-3">
                  <button 
                    onClick={() => handleModalOpen('lease')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center"
                    type="button"
                  >
                    <FaFileContract className="mr-2" />
                    View Lease
                  </button>
                  <button 
                    onClick={() => handleModalOpen('payments')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center"
                    type="button"
                  >
                    <FaMoneyBillWave className="mr-2" />
                    Pay Rent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Status Cards - Updated to match landlord dashboard style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mt-4 lg:mt-6"
        >
          <div className='bg-blue-900 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
            <h4 className='text-sm lg:text-lg font-bold'>
              {currentApartment?.moveInDate 
                ? formatDate(currentApartment.moveInDate) 
                : currentApartment?.createdAt 
                  ? formatDate(currentApartment.createdAt) 
                  : "Not set"}
            </h4>
            <p className='text-xs lg:text-base'>Move-in Date</p>
          </div>
          
          <div className='bg-green-600 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
            <h4 className='text-sm lg:text-lg font-bold'>
              {currentApartment?.nextDueDate ? formatDate(currentApartment.nextDueDate) : "Not set"}
            </h4>
            <p className='text-xs lg:text-base'>Next Due Date</p>
          </div>
          
          <div className={`${
              paymentStatus === 'good' ? 'bg-green-600' :
              paymentStatus === 'soon' ? 'bg-yellow-500' :
              'bg-red-600'
            } text-white p-2 lg:p-4 rounded-lg text-center shadow-md`}>
            <h4 className='text-sm lg:text-lg font-bold'>
              {paymentStatusText[paymentStatus]}
            </h4>
            <p className='text-xs lg:text-base'>Payment Status</p>
          </div>
          
          <div className='bg-blue-900 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
            <h4 className='text-sm lg:text-lg font-bold'>₱{currentApartment.rent?.toLocaleString()}</h4>
            <p className='text-xs lg:text-base'>Monthly Rent</p>
          </div>
        </motion.div>

        {/* Payment Section - Updated to match landlord dashboard style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6 mt-4 lg:mt-6'
        >
          <h3 className='text-lg lg:text-xl font-bold text-white'>Payment</h3>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-gray-800 p-4 lg:p-5 rounded-lg shadow-md">
              <h4 className="text-white font-bold mb-2">Quick Payment</h4>
              <p className="text-gray-400 text-sm mb-4">Scan the QR code or make a payment directly</p>
              
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg shadow-md mb-4">
                  {renderQRImage()}
                </div>
                
                <button
                  onClick={() => handleModalOpen('payments')}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-lg w-full flex justify-center items-center font-medium"
                  type="button"
                >
                  <FaMoneyBillWave className="mr-2" /> Pay Rent
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 lg:p-5 rounded-lg shadow-md">
              <h4 className="text-white font-bold mb-2">Payment History</h4>
              <p className="text-gray-400 text-sm mb-4">View your previous payments and status</p>
              
              <div>
                {payments && payments.length > 0 ? (
                  <div className="space-y-3 max-h-52 overflow-y-auto scrollbar-thin pr-2">
                    {payments.slice(0, 3).map(payment => (
                      <div key={payment._id} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex justify-between items-center transition-colors">
                        <div>
                          <p className="text-white text-sm font-medium">{formatPaymentDate(payment.createdAt)}</p>
                          <p className="text-green-400 font-semibold">
                            ₱{payment.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-300 mt-0.5">#{payment.reference_number}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'approved' ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500' :
                          payment.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500' :
                          'bg-red-500 bg-opacity-20 text-red-300 border border-red-500'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8 bg-gray-700 rounded-lg border border-dashed border-gray-600">
                    <svg className="w-12 h-12 mx-auto text-gray-500 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No payment history available</p>
                  </div>
                )}
                
                <button
                  onClick={() => handleModalOpen('paymentHistory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg w-full mt-4 flex justify-center items-center font-medium"
                  type="button"
                >
                  <FaChartLine className="mr-2" />
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Include all your modals at the end of the component */}
        <InquiriesModal
          isOpen={modals.inquiries}
          closeModal={() => handleModalClose('inquiries')}
          inquiries={inquiries || []}
        />

        <LeaseAgreementModal
          isOpen={modals.lease}
          closeModal={() => handleModalClose('lease')}
          apartment={currentApartment}
        />

        <LandlordAnnouncementModal
          isOpen={modals.announcements}
          closeModal={() => handleModalClose('announcements')}
          announcements={announcements || []}
        />

        <PaymentHistoryModal
          isOpen={modals.paymentHistory}
          closeModal={() => handleModalClose('paymentHistory')}
          paymentHistory={paymentHistory || []}
        />

        <PaymentProofModal
          isOpen={modals.payments}
          closeModal={() => handleModalClose('payments')}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          referenceNumber={referenceNumber}
          setReferenceNumber={setReferenceNumber}
          paymentQR={paymentQR}
          tenantDetails={structuredTenantDetails}
          apartment={currentApartment}
          onPaymentSuccess={handlePaymentSuccess}
        />

        <BrowseApartmentsModal
          isOpen={modals.browseApartments}
          closeModal={() => handleModalClose('browseApartments')}
          apartments={availableApartments || []}
          hasApartment={!!currentApartment}
        />

        <ApplicationsModal
          isOpen={modals.applications}
          closeModal={() => handleModalClose('applications')}
        />
      </motion.div>
    </div>
  );
};

export default TenantDashboard;