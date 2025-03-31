import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useInquiryStore } from "../../store/inquiryStore";
import TenantSideNav from "../../components/layout/TenantSideNav";
import { FaFileInvoiceDollar, FaFileContract } from 'react-icons/fa';

// Import your modals
import InquiriesModal from "../../components/Tenant-Dashboard/InquiriesModal";
import LeaseAgreementModal from "../../components/Tenant-Dashboard/LeaseAgreementModal";
import LandlordAnnouncementModal from "../../components/Tenant-Dashboard/LandlordAnnouncementModal";
import PaymentHistoryModal from "../../components/Tenant-Dashboard/PaymentHistoryModal";
import PaymentProofModal from "../../components/Tenant-Dashboard/PaymentProofModal";
import BrowseApartmentsModal from "../../components/Tenant-Dashboard/BrowseApartmentsModal";
import ApplicationsModal from "../../components/Tenant-Dashboard/ApplicationsModal";
import { formatDate } from "../../components/utils/date";

const TenantDashboard = () => {
  // State declarations
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

  // Unified modal state
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
  const {
    inquiries,
    getTenantInquiries,
    loading: inquiriesLoading,
    error: inquiriesError
  } = useInquiryStore();

  // Unified modal handlers
  const handleModalOpen = (modalId) => {
    setModals(prev => ({ ...prev, [modalId]: true }));
    document.body.classList.add("overflow-hidden");

    // Additional actions for specific modals
    if (modalId === 'browseApartments') {
      getAvailableApartments();
    }
    if (modalId === 'inquiries') {
      loadTenantInquiries();
    }
  };

  const handleModalClose = (modalId) => {
    setModals(prev => ({ ...prev, [modalId]: false }));
    document.body.classList.remove("overflow-hidden");
  };

  // Data fetching function
  const loadTenantInquiries = async () => {
    try {
      await getTenantInquiries();
    } catch (err) {
      console.error("Error fetching tenant inquiries:", err);
      setError("Unable to load your inquiries. Please try again later.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        await getTenantApartment();
        setPaymentQR(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Tenant:${user?.id || "unknown"}`);
        
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
  }, [getTenantApartment, getTenantAnnouncements, user?.id]);

  // Handle errors
  useEffect(() => {
    if (inquiriesError) {
      setError(inquiriesError);
    }
  }, [inquiriesError]);

  // File handling
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  // Payment functions
  const fetchPaymentHistory = async () => {
    return paymentHistory || [];
  };

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
      setSuccess("Payment proof submitted successfully!");
      handleModalClose('paymentProof');
      return { success: true };
    } catch (error) {
      setError("Failed to submit payment. Please try again.");
      return { success: false };
    }
  };

  // Loading state
  if (loading || apartmentLoading || inquiriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <TenantSideNav 
        onToggle={setSidebarCollapsed} 
        onModalOpen={handleModalOpen}
      />

      {/* Main content */}
      <motion.div className={`p-4 lg:p-6 bg-blue-50 min-h-screen w-full transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Welcome Section */}
        <div className='bg-white shadow-md rounded-lg p-4 lg:p-6 mt-0'>
          <h2 className='text-xl lg:text-2xl font-bold text-gray-800'>
            Welcome, {user?.name || 'Tenant'}
          </h2>
          <p className='text-gray-600'>{formatDate(new Date())}</p>
        </div>

        {/* Quick Actions Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4 lg:mt-6'>
          <div className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'>
            <h3 className="text-lg lg:text-xl font-bold text-white">Quick Actions</h3>
            <div className='grid grid-cols-2 gap-2 lg:gap-4 mt-4'>
              <button 
                onClick={() => handleModalOpen('applications')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center">
                <img src="/image/application.png" alt="Applications" className="w-8 h-8 lg:w-12 lg:h-12"/>
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Applications</span>
              </button>
              <button 
                onClick={() => handleModalOpen('payments')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center">
                <FaFileInvoiceDollar className="w-8 h-8 lg:w-12 lg:h-12" />
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Pay Rent</span>
              </button>
              <button 
                onClick={() => handleModalOpen('inquiries')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center">
                <img src="/image/envelope.png" alt="Inquiries" className="w-8 h-8 lg:w-12 lg:h-12"/>
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Inquiries</span>
              </button>
              <button 
                onClick={() => handleModalOpen('lease')}
                className="p-4 lg:p-6 bg-gray-800 cursor-pointer hover:bg-gray-700 transition duration-200 text-white rounded-lg shadow-md flex flex-col items-center justify-center">
                <FaFileContract className="w-8 h-8 lg:w-12 lg:h-12" />
                <span className="mt-2 lg:mt-3 text-sm lg:text-lg font-semibold">Lease</span>
              </button>
            </div>
          </div>

          {/* Payment Status Section */}
          <div className='bg-gray-900 shadow-md rounded-lg p-4 lg:p-6'>
            <h3 className="text-lg lg:text-xl font-bold text-white">Payment Status</h3>
            <div className="mt-4 space-y-4">
              {currentApartment ? (
                <>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-white">Room: {currentApartment.room}</p>
                    <p className="text-green-400 font-semibold">
                      Rent: ₱{currentApartment.rent?.toLocaleString()}/month
                    </p>
                    <p className="text-gray-400">
                      Next Due Date: {currentApartment?.nextDueDate ? 
                        formatDate(currentApartment.nextDueDate) : 
                        "Not set"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <p>No active lease found</p>
                  <button 
                    onClick={() => handleModalOpen('browseApartments')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Browse Apartments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-600 p-4 rounded-lg text-white text-center">
            <h4 className="text-lg font-bold">Last Payment</h4>
            <p className="text-sm mt-2">₱{currentApartment?.rent?.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-blue-900 p-4 rounded-lg text-white text-center">
            <h4 className="text-lg font-bold">Due Date</h4>
            <p className="text-sm mt-2">
              {currentApartment?.nextDueDate ? 
                formatDate(currentApartment.nextDueDate) : 
                "Not set"}
            </p>
          </div>
          <div className="bg-green-600 p-4 rounded-lg text-white text-center">
            <h4 className="text-lg font-bold">Contract Status</h4>
            <p className="text-sm mt-2">Active</p>
          </div>
        </div>

        {/* Modals */}
        <InquiriesModal
          isOpen={modals.inquiries}
          closeModal={() => handleModalClose('inquiries')}
        />
        <LeaseAgreementModal
          isOpen={modals.lease}
          closeModal={() => handleModalClose('lease')}
        />
        <LandlordAnnouncementModal
          isOpen={modals.announcements}
          closeModal={() => handleModalClose('announcements')}
        />
        <PaymentHistoryModal
          isOpen={modals.paymentHistory}
          closeModal={() => handleModalClose('paymentHistory')}
        />
        <PaymentProofModal
          isOpen={modals.payments}
          closeModal={() => handleModalClose('payments')}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          referenceNumber={referenceNumber}
          setReferenceNumber={setReferenceNumber}
          paymentQR={paymentQR}
          tenantDetails={currentApartment}
        />
        <BrowseApartmentsModal
          isOpen={modals.browseApartments}
          closeModal={() => handleModalClose('browseApartments')}
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