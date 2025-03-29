import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTenantStore } from "../../store/tenantStore";

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
    uploadPaymentQR
  } = useTenantStore();

  // Fetch tenants when the component mounts
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);
  
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
      alert("Failed to upload QR code: " + error.message);
    }
  };

  const handleTenantClick = async (tenant) => {
    try {
      await getTenantById(tenant._id);
      setShowProfileModal(true);
    } catch (error) {
      alert("Failed to fetch tenant details: " + error.message);
    }
  };

  const handleStatusChange = async (tenantId, newStatus) => {
    try {
      await updateTenantStatus(tenantId, newStatus);
      alert(`Tenant status updated to ${newStatus}`);
    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.tenant_fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  // Rest of the component stays the same...
  return (
    <div className="p-10 flex flex-col w-full items-center min-h-screen bg-gray-900">
      {/* Title and Search Bar */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <h2 className="text-4xl text-white font-bold">Tenant Management</h2>
        <input
          type="text"
          placeholder="Search tenant by name or room"
          className="border p-2 rounded-lg w-80"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white
               transition-all duration-300 group hover:bg-black hover:bg-none rounded px-4 py-2 rounded-md hover:bg-blue-500 transition"
          onClick={() => setShowModal(true)}
        >
          Add Payment QR
        </button>
      </div>

      {/* Tenant Cards */}
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-7xl">
        {loading ? (
          <p className="text-gray-500 text-center">Loading tenants...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <div
                  key={tenant._id}
                  className="bg-gray-900 text-white p-4 rounded-lg flex flex-col items-center w-48 shadow-md hover:shadow-lg cursor-pointer transform transition hover:scale-105"
                  onClick={() => handleTenantClick(tenant)}
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white w-14 h-14 flex items-center justify-center rounded-full mb-2 text-xl">
                    {tenant.tenant_fullname?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <p className="font-bold text-center">{tenant.tenant_fullname}</p>
                  <p className="text-sm mt-1">Room: {tenant.room || "Not Assigned"}</p>
                  <p className="text-sm">Rent: ₱{tenant.rent?.toLocaleString() || 0}</p>
                  <p
                    className={`text-xs mt-2 px-2 py-1 rounded ${getStatusClass(tenant.status)} text-white`}
                  >
                    {tenant.status || "pending"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tenants found.</p>
            )}
          </div>
        )}
      </div>

      {/* Payment QR Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-black bg-white p-3 rounded-t-lg">
              Upload Payment QR
            </h3>
            <div className="flex flex-col items-center mt-4 p-6 bg-gray-100 rounded-lg">
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
                className="bg-gray-500 text-white px-4 py-2 rounded-md mb-4 cursor-pointer hover:bg-gray-600"
              >
                {selectedFile ? selectedFile.name : "Select File"}
              </label>

              {/* Payment Details Input */}
              <input
                type="text"
                placeholder="Add Payment Details"
                className="border p-2 rounded-lg w-full text-center mb-4"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
              />

              {/* Upload Button */}
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white
               transition-all duration-300 group hover:bg-black hover:bg-none rounded px-4 py-2 rounded-md"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Profile Modal */}
      {showProfileModal && selectedTenant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg"
              onClick={() => setShowProfileModal(false)}
            >
              ✕
            </button>
            
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Tenant Avatar */}
              <div className="flex flex-col items-center mb-4 md:mb-0 md:mr-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white w-24 h-24 flex items-center justify-center rounded-full mb-2 text-4xl">
                  {selectedTenant.tenant_fullname?.charAt(0).toUpperCase() || "T"}
                </div>
                <p className="text-white font-bold text-lg">{selectedTenant.tenant_fullname}</p>
                <div className={`mt-2 px-3 py-1 rounded ${getStatusClass(selectedTenant.status)} text-white`}>
                  {selectedTenant.status || "pending"}
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
              <div className="flex-1 text-white">
                <h3 className="text-xl font-bold border-b pb-2 mb-4">Tenant Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p>{selectedTenant.tenant_email}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p>{selectedTenant.tenant_phone || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Room</p>
                    <p>{selectedTenant.room || "Not Assigned"}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Rent</p>
                    <p>₱{selectedTenant.rent?.toLocaleString() || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Due Date</p>
                    <p>
                      {selectedTenant.due_date 
                        ? new Date(selectedTenant.due_date).toLocaleDateString() 
                        : "Not set"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p>{new Date(selectedTenant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* Payment History (placeholder for future implementation) */}
                <div className="mt-6">
                  <h4 className="font-bold border-b pb-2 mb-2">Payment History</h4>
                  <p className="text-sm text-gray-400">Payment history will be shown here in future updates.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPage;
