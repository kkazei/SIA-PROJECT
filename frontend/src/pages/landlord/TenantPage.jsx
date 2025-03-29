import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTenantStore } from "../../store/tenantStore";
import LandlordSideNav from "../../components/layout/LandlordSideNav";
import { motion } from "framer-motion";

const TenantPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState("");

  const { user } = useAuthStore();
  const { 
    tenants, 
    selectedTenant,
    loading, 
    error, 
    fetchTenants, 
    getTenantById, 
    updateTenantStatus,
    uploadPaymentQR,
    clearMessages
  } = useTenantStore();

  // Fetch tenants when the component mounts
  useEffect(() => {
    fetchTenants();
    
    return () => {
      clearMessages(); // Clean up on unmount
    };
  }, [fetchTenants, clearMessages]);
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    try {
      await uploadPaymentQR(selectedFile, paymentDetails);
      alert("Payment QR uploaded successfully!");
      setShowModal(false);
      setSelectedFile(null);
      setPaymentDetails("");
    } catch (error) {
      alert("Failed to upload QR code: " + (error.message || "Unknown error"));
    }
  };

  const handleTenantClick = async (tenant) => {
    try {
      await getTenantById(tenant._id);
      setShowProfileModal(true);
    } catch (error) {
      alert("Failed to fetch tenant details: " + (error.message || "Unknown error"));
    }
  };

  const handleStatusChange = async (tenantId, newStatus) => {
    try {
      await updateTenantStatus(tenantId, newStatus);
      alert(`Tenant status updated to ${newStatus}`);
    } catch (error) {
      alert("Failed to update status: " + (error.message || "Unknown error"));
    }
  };

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.apartment?.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    if (!status) return "bg-yellow-500";
    
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <LandlordSideNav className="hidden lg:block" />
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="p-4 lg:p-6 bg-blue-50 min-h-screen w-full lg:ml-64"
      >
        {/* Title and Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-0">Tenant Management</h2>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search tenant by name or room"
              className="border p-2 rounded-lg w-full sm:w-80 mb-2 sm:mb-0"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="sm:ml-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={() => setShowModal(true)}
            >
              Add Payment QR
            </button>
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
                    onClick={() => handleTenantClick(tenant)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3">
                        {tenant.name?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <h3 className="font-medium text-lg text-center">
                        {tenant.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Room: {tenant.apartment?.room || "Not Assigned"}</p>
                      <p className="text-sm text-gray-600">Rent: ₱{tenant.apartment?.rent?.toLocaleString() || 0}</p>
                      <span
                        className={`text-xs mt-2 px-2 py-1 rounded ${getStatusClass(tenant.status)} text-white`}
                      >
                        {tenant.status || "Pending"}
                      </span>
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

        {/* Payment QR Modal */}
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
                {/* File Upload Button */}
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

                {/* Payment Details Input */}
                <input
                  type="text"
                  placeholder="Add Payment Details"
                  className="border p-2 rounded-lg w-full mb-4"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />

                {/* Upload Button */}
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

        {/* Tenant Profile Modal */}
        {showProfileModal && selectedTenant && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
              
              <div className="flex flex-col md:flex-row items-center md:items-start">
                {/* Tenant Avatar */}
                <div className="flex flex-col items-center mb-4 md:mb-0 md:mr-6">
                  <div className="bg-blue-600 text-white w-24 h-24 flex items-center justify-center rounded-full mb-2 text-4xl">
                    {selectedTenant.name?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <p className="font-bold text-lg">{selectedTenant.name}</p>
                  <div className={`mt-2 px-3 py-1 rounded ${getStatusClass(selectedTenant.status)} text-white`}>
                    {selectedTenant.status || "Pending"}
                  </div>
                  
                  {/* Status Change Buttons */}
                  <div className="mt-4 flex flex-col space-y-2">
                    <button 
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                      onClick={() => handleStatusChange(selectedTenant._id, "paid")}
                    >
                      Mark as Paid
                    </button>
                    <button 
                      className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleStatusChange(selectedTenant._id, "pending")}
                    >
                      Mark as Pending
                    </button>
                    <button 
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                      onClick={() => handleStatusChange(selectedTenant._id, "overdue")}
                    >
                      Mark as Overdue
                    </button>
                  </div>
                </div>
                
                {/* Tenant Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold border-b pb-2 mb-4">Tenant Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p>{selectedTenant.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Room</p>
                      <p>{selectedTenant.apartment?.room || "Not Assigned"}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Rent</p>
                      <p>₱{selectedTenant.apartment?.rent?.toLocaleString() || 0}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Joined</p>
                      <p>{selectedTenant.createdAt ? new Date(selectedTenant.createdAt).toLocaleDateString() : "Unknown"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Last Login</p>
                      <p>{selectedTenant.lastLogin ? new Date(selectedTenant.lastLogin).toLocaleDateString() : "Never"}</p>
                    </div>
                  </div>
                  
                  {/* Payment History (placeholder for future implementation) */}
                  <div className="mt-6">
                    <h4 className="font-bold border-b pb-2 mb-2">Payment History</h4>
                    <p className="text-sm text-gray-500">Payment history will be shown here in future updates.</p>
                  </div>
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