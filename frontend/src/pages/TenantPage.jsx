import React, { useState, useEffect } from "react";

const TenantPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tenants from API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tenants");
        if (!response.ok) throw new Error("Failed to fetch tenants");
        const data = await response.json();
        setTenants(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    console.log("Uploading:", selectedFile, "Details:", paymentDetails);
    alert("Payment QR uploaded successfully!");
    setShowModal(false);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.tenant_fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  className="bg-gray-900 text-white p-4 rounded-lg flex flex-col items-center w-40 shadow-md"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-blue-900 w-12 h-12 flex items-center justify-center rounded-full mb-2">
                    👤
                  </div>
                  <p className="font-bold">Room: {tenant.room}</p>
                  <p className="text-sm">{tenant.tenant_fullname}</p>
                  <p
                    className={`text-xs mt-1 px-2 py-1 rounded ${
                      tenant.status === "paid"
                        ? "bg-green-500"
                        : tenant.status === "overdue"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    } text-white`}
                  >
                    {tenant.status}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-100 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 text-lg"
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
                className="bg-gray-500 text-white px-4 py-2 rounded-md mb-4 cursor-pointer"
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
    </div>
  );
};

export default TenantPage;
