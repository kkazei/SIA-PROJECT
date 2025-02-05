import React, { useState } from "react";

// Modal Component with open/close effects
const InquiriesModal = ({
  isOpen,
  closeModal,
  handleFileChange,
  selectedFile,
  removeFile,
}) => {
  const renderFilePreview = () => {
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        const fileUrl = URL.createObjectURL(selectedFile);
        return (
          <div className="relative mt-4">
            <img
              src={fileUrl}
              alt="Preview"
              className="max-w-[500px] h-auto rounded-lg mx-auto shadow-lg"
            />
            {/* Remove File Button */}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white font-bold text-xl p-2 w-8 h-8 rounded-md hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        );
      } else {
        return (
          <div className="mt-4 text-gray-700 flex justify-between items-center">
            <p>File: {selectedFile.name}</p>
            <button
              onClick={removeFile}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white p-6 rounded-lg w-[600px] max-h-[80%] overflow-y-auto shadow-xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900">Inquiries</h2>

        {/* Dropdown and Category */}
        <div className="flex justify-between items-center space-x-4 mt-4">
          <select className="w-full p-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select Category</option>
            <option value="general">General Inquiry</option>
            <option value="maintenance">Maintenance</option>
            <option value="payment">Payment Issue</option>
          </select>
          <span className="text-lg font-semibold text-white bg-green-500 py-2 px-4 rounded-lg">
            Category
          </span>
        </div>

        {/* Inquiry Text Field */}
        <textarea
          className="w-full p-4 mt-4 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe your inquiry..."
          rows="5"
        />

        {/* Photo Upload */}
        <label className="flex items-center space-x-2 cursor-pointer text-green-500 mt-4">
          <span>Upload Photo</span>
          <input
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* File Preview */}
        {renderFilePreview()}

        {/* Send Button */}
        <button className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200">
          Send Inquiry
        </button>

        {/* Close Button Right-Aligned at Bottom */}
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="text-sm text-red-500 mt-4 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const TenantDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Open modal with effect
  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add("overflow-hidden"); // Prevent background scroll
  };

  // Close modal with effect
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null); // Clear selected file
    document.body.classList.remove("overflow-hidden"); // Restore scroll
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  // Remove selected file
  const removeFile = () => setSelectedFile(null);

  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
      <div className="bg-green-100 p-6 rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">JUAN DELA CRUZ</h1>
          <p className="text-gray-600">1-A</p>
          <p className="text-sm text-gray-500 mt-1">
            As of{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
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
          <p className="text-2xl font-bold text-gray-800">PHP 15,000.00</p>
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-green-600 transition duration-200">
            PAY NOW
          </button>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200">
          <span className="text-3xl">👤</span>
          <p className="mt-2">Profile</p>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200">
          <span className="text-3xl">📄</span>
          <p className="mt-2">Payment History</p>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200">
          <span className="text-3xl">🏠</span>
          <p className="mt-2">Lease Agreement</p>
        </div>

        <div
          onClick={openModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">✉️</span>
          <p className="mt-2">Inquiries</p>
        </div>
      </div>

      <InquiriesModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        removeFile={removeFile}
      />
    </div>
  );
};

export default TenantDashboard;
