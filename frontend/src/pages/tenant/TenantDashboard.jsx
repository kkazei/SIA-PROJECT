import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useInquiryStore } from "../../store/inquiryStore";
import { useQRImageStore } from "../../store/qrImageStore"; // Import QR image store
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
import { formatDate } from "../../components/utils/date";
import NoApartmentView from "../../components/Tenant-Dashboard/NoApartmentView";

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

  const renderQRImage = () => {
    if (qrLoading) {
      return (
        <div className="w-32 h-32 bg-white p-2 rounded-lg mb-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (qrImages && qrImages.length > 0) {
      const latestQR = qrImages[0];
      let imagePath = latestQR.image_path;
      const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '';
      if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith(BASE_URL)) {
        imagePath = `${BASE_URL}${imagePath}`;
      }
      
      return (
        <div className="bg-white p-2 rounded-lg mb-3">
          {imagePath ? (
            <img 
              src={imagePath} 
              alt="Payment QR Code" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                console.log("QR image failed to load:", imagePath);
                e.target.src = paymentQR || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23999' dominant-baseline='middle'%3EQR Image%3C/text%3E%3C/svg%3E";
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

  // Loading state - updated to match DashboardPage style
  if (loading || apartmentLoading || inquiriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center p-8 rounded-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
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
    <div className="flex flex-col lg:flex-row">
      <TenantSideNav 
        onToggle={setSidebarCollapsed} 
        onModalOpen={handleModalOpen}
      />

      {/* Main content - updated to match DashboardPage styles */}
      <motion.div 
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className={`p-4 lg:p-6 bg-blue-50 min-h-screen w-full transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Error/Success Alerts */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">⚠️</div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
              <button 
                className="ml-auto text-red-700" 
                onClick={() => setError(null)}
              >
                ✖
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">✅</div>
              <div className="ml-3">
                <p>{success}</p>
              </div>
              <button 
                className="ml-auto text-green-700" 
                onClick={() => setSuccess(null)}
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section - Updated to match DashboardPage */}
        <div className='bg-white shadow-md rounded-lg p-4 lg:p-6 mt-0'>
          <h2 className='text-xl lg:text-2xl font-bold text-gray-800'>Welcome, {user?.name || 'Tenant'}</h2>
          <p className='text-gray-600'>{formatDate(new Date())}</p>
          
          <div className={`mt-2 inline-block ${paymentStatusColor[paymentStatus]} text-white py-1 px-3 rounded-full shadow-sm text-sm`}>
            <div className="font-semibold flex items-center">
              {paymentStatus === 'good' && <FaCheckCircle className="mr-1" />}
              {paymentStatus === 'soon' && <FaCalendarAlt className="mr-1" />}
              {paymentStatus === 'overdue' && <FaBell className="mr-1 animate-pulse" />}
              {paymentStatusText[paymentStatus]}
            </div>
          </div>
        </div>

        {/* Quick Actions Box - Similar to DashboardPage */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 lg:mt-6'>
          <div className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'>
            <h3 className="text-lg lg:text-xl font-bold text-white">Quick Actions</h3>
            <div className='grid grid-cols-2 gap-2 lg:gap-4 mt-4'>
              <button 
                onClick={() => handleModalOpen('applications')} 
                className="p-4 lg:p-6 bg-gray-800 hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center"
                type="button"
              >
                <img src="/image/application.png" alt="Applications" className="w-8 h-8 lg:w-12 lg:h-12"/> 
                <span className="mt-2 lg:mt-3 text-sm lg:text-base font-semibold">Applications</span> 
              </button>
              
              <button 
                onClick={() => handleModalOpen('paymentHistory')}
                className="p-4 lg:p-6 bg-gray-800 hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center"
                type="button"
              >
                <FaMoneyBillWave className="w-8 h-8 lg:w-12 lg:h-12 text-green-400"/> 
                <span className="mt-2 lg:mt-3 text-sm lg:text-base font-semibold">Payment History</span> 
              </button>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleModalOpen('inquiries');
                }}
                className="p-4 lg:p-6 bg-gray-800 hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center"
                type="button"
              >
                <FaEnvelope className="w-8 h-8 lg:w-12 lg:h-12 text-purple-400"/>
                <span className="mt-2 lg:mt-3 text-sm lg:text-base font-semibold">Inquiries</span> 
              </button>
              
              <button 
                onClick={() => handleModalOpen('announcements')}
                className="p-4 lg:p-6 bg-gray-800 hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center"
                type="button"
              >
                <FaBell className="w-8 h-8 lg:w-12 lg:h-12 text-amber-400"/> 
                <span className="mt-2 lg:mt-3 text-sm lg:text-base font-semibold">Announcements</span> 
              </button>
            </div>
          </div>

          {/* Apartment Details - Updated to match DashboardPage style */}
          <div className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6 text-white'>
            <h3 className="text-lg lg:text-xl font-bold">Your Apartment</h3>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <div className="h-32 bg-gray-700 rounded-lg overflow-hidden">
                  {currentApartment?.images && currentApartment.images.length > 0 ? (
                    <img
                      src={currentApartment.images[0]}
                      alt={`${currentApartment.room}`}
                      className="w-full h-full object-cover"
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
                <h4 className="text-lg font-bold">{currentApartment.room}</h4>
                <p className="text-green-400 font-semibold">₱{currentApartment.rent?.toLocaleString()}/month</p>
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">{currentApartment.description || "No description available."}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleModalOpen('lease')}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                    type="button"
                  >
                    View Lease
                  </button>
                  <button 
                    onClick={() => handleModalOpen('payments')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm"
                    type="button"
                  >
                    Pay Rent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Cards - Similar to DashboardPage */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mt-4 lg:mt-6">
          <div className='bg-blue-900 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
            <h4 className='text-sm lg:text-lg font-bold'>
              {formatDate(currentApartment?.moveInDate || new Date())}
            </h4>
            <p className='text-xs lg:text-base'>Move-in Date</p>
          </div>
          
          <div className='bg-green-600 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
            <h4 className='text-sm lg:text-lg font-bold'>
              {currentApartment?.nextDueDate ? formatDate(currentApartment.nextDueDate) : "Not set"}
            </h4>
            <p className='text-xs lg:text-base'>Next Due Date</p>
          </div>
          
          <div className={`${paymentStatusColor[paymentStatus]} text-white p-2 lg:p-4 rounded-lg text-center shadow-md`}>
            <h4 className='text-sm lg:text-lg font-bold flex items-center justify-center'>
              {paymentStatus === 'good' && <FaCheckCircle className="mr-1" />}
              {paymentStatus === 'soon' && <FaCalendarAlt className="mr-1" />}
              {paymentStatus === 'overdue' && <FaBell className="mr-1 animate-pulse" />}
              {paymentStatusText[paymentStatus]}
            </h4>
            <p className='text-xs lg:text-base'>Payment Status</p>
          </div>
          
          <div className='bg-blue-900 text-white p-2 lg:p-4 rounded-lg text-center shadow-md'>
            <h4 className='text-sm lg:text-lg font-bold'>₱{currentApartment.rent?.toLocaleString()}</h4>
            <p className='text-xs lg:text-base'>Monthly Rent</p>
          </div>
        </div>

        {/* Payment Section */}
        <div className='bg-gray-900 shadow-md rounded-lg p-6 mt-6'>
          <h3 className='text-xl font-bold text-white'>Payment</h3>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-bold mb-2">Quick Payment</h4>
              <p className="text-gray-400 text-sm mb-4">Scan the QR code or make a payment directly</p>
              
              <div className="flex flex-col items-center">
                {renderQRImage()}
                
                <button
                  onClick={() => handleModalOpen('payments')}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full flex justify-center items-center"
                  type="button"
                >
                  <FaMoneyBillWave className="mr-2" /> Pay Rent
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-bold mb-2">Payment History</h4>
              <p className="text-gray-400 text-sm mb-4">View your previous payments and status</p>
              
              <div>
                {paymentHistory && paymentHistory.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {paymentHistory.slice(0, 3).map(payment => (
                      <div key={payment._id} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm">{formatDate(payment.paymentDate)}</p>
                          <p className="text-green-400">₱{payment.amount?.toLocaleString()}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'approved' ? 'bg-green-900 text-green-300' :
                          payment.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No payment history available</p>
                )}
                
                <button
                  onClick={() => handleModalOpen('paymentHistory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full mt-3 flex justify-center items-center"
                  type="button"
                >
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </div>

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