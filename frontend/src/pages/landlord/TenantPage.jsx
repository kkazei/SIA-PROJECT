import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTenantStore } from "../../store/tenantStore";
import { useApartmentStore } from "../../store/apartmentStore";
import { useQRImageStore } from "../../store/qrImageStore"; // Import QR image store
import LandlordSideNav from "../../components/layout/LandlordSideNav";
import TenantModal from "../../components/TenantModal";
import { motion } from "framer-motion";

const TenantPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // For Payment QR
  const [showAssignModal, setShowAssignModal] = useState(false); // For Assign Tenant
  const [collapsed, setCollapsed] = useState(true); // Track sidebar state
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState("");

  const { user } = useAuthStore();
  const {
    tenants,
    loading,
    error,
    fetchTenants,
    clearMessages,
  } = useTenantStore();
  
  // Import the createQRImage function from the QR image store
  const { 
    createQRImage, 
    loading: qrLoading, 
    error: qrError,
    message: qrMessage,
    clearMessage 
  } = useQRImageStore();

  const { getApartments, fetchUnassignedTenants } = useApartmentStore();

  // Fetch tenants when the component mounts
  useEffect(() => {
    fetchTenants();
    return () => {
      clearMessages(); // Clean up tenant store messages
      clearMessage(); // Clean up QR store messages
    };
  }, [fetchTenants, clearMessages, clearMessage]);

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.apartment?.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    if (!paymentDetails || paymentDetails.trim() === '') {
      alert("Please enter payment details.");
      return;
    }

    try {
      // Create form data for QR image upload
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('details', paymentDetails);
      
      // Use the createQRImage function from the QR image store
      await createQRImage(formData);
      
      alert("Payment QR uploaded successfully!");
      setShowModal(false);
      setSelectedFile(null);
      setPaymentDetails("");
    } catch (error) {
      alert("Failed to upload QR code: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <LandlordSideNav
        onToggle={(isCollapsed) => setCollapsed(isCollapsed)} // Update collapsed state
        className="hidden lg:block"
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className={`p-4 lg:p-6 bg-blue-50 min-h-screen w-full transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {/* Title and Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-0">
            Tenant Management
          </h2>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search tenant by name or room"
              className="border p-2 rounded-lg w-full sm:w-80"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => setShowModal(true)}
              >
                Add Payment QR
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={() => {
                  setShowAssignModal(true); // Open the Assign Tenant modal
                  fetchUnassignedTenants(); // Fetch unassigned tenants
                  getApartments(); // Fetch apartments
                }}
              >
                Assign Tenant
              </button>
            </div>
          </div>
        </div>

        {/* Tenant Cards */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <div
                    key={tenant._id}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3 overflow-hidden">
                        {tenant.avatar ? (
                          <img
                            src={tenant.avatar}
                            alt={tenant.name || "Tenant"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/image/avatar-placeholder.png"; // Fallback avatar
                            }}
                          />
                        ) : (
                          <span>
                            {tenant.name?.charAt(0).toUpperCase() || "T"}
                          </span>
                        )}
                      </div>
                      {/* Tenant Details */}
                      <h3 className="font-medium text-lg text-center">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Room: {tenant.apartment?.room || "Not Assigned"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rent: ₱{tenant.apartment?.rent?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {tenants.length === 0
                    ? "You don't have any tenants yet."
                    : "No tenants match your search."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assign Tenant Modal */}
        <TenantModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
        />

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Upload Payment QR
              </h3>
              <div className="flex flex-col">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="fileInput"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="fileInput"
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mb-4 cursor-pointer hover:bg-gray-300 text-center"
                >
                  {selectedFile ? selectedFile.name : "Select File"}
                </label>
                <input
                  type="text"
                  placeholder="Add Payment Details"
                  className="border p-2 rounded-lg w-full mb-4"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={handleUpload}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TenantPage;