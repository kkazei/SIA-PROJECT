import React, { useState } from "react";

// Inquiries Modal Component
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
        <h2 className="text-2xl font-bold text-gray-900">Inquiries</h2>

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

        <textarea
          className="w-full p-4 mt-4 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe your inquiry..."
          rows="5"
        />

        <label className="flex items-center space-x-2 cursor-pointer text-green-500 mt-4">
          <span>Upload Photo</span>
          <input
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {renderFilePreview()}

        <button className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200">
          Send Inquiry
        </button>

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

// Lease Agreement Modal Component
const LeaseAgreementModal = ({ isOpen, closeModal }) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white p-6 rounded-lg w-[1000px] max-h-[80%] overflow-y-auto shadow-xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900">Lease Agreement</h2>

        <div className="bg-green-100 p-6 rounded-lg flex justify-between items-center mt-4">
          <div>
            <h1 className="text-2xl font-bold">JUAN DELA CRUZ</h1>
            <p className="text-gray-600">1-A</p>
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
            <p className="text-2xl font-bold text-gray-800">PHP 15,000.00</p>
            <button className="bg-green-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-green-600 transition duration-200">
              PAY NOW
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Lease Agreement Images
          </h3>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-500 italic">No lease images available</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="px-6 py-3 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment History Modal Component
const PaymentHistoryModal = ({ isOpen, closeModal }) => {
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
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>

        <div className="mt-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4">January 5, 2025</td>
                <td className="py-2 px-4">PHP 5,000.00</td>
                <td className="py-2 px-4 text-green-500">Paid</td>
              </tr>
              <tr>
                <td className="py-2 px-4">December 15, 2024</td>
                <td className="py-2 px-4">PHP 10,000.00</td>
                <td className="py-2 px-4 text-red-500">Pending</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="px-6 py-3 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Landlord Announcement Modal Component
const LandlordAnnouncementModal = ({ isOpen, closeModal, announcement }) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white p-6 rounded-lg w-[700px] max-h-[80%] overflow-y-auto shadow-xl transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 text-left">
          Landlord Announcement
        </h2>
        {announcement?.image ? (
          <div className="mt-4 text-center">
            <img
              src={announcement.image}
              alt="Announcement"
              className="max-w-full rounded-lg mx-auto shadow-lg"
            />
          </div>
        ) : (
          <p className="text-center mt-4 text-gray-500">
            No announcement available
          </p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={closeModal}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
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
  const [isInquiriesModalOpen, setIsInquiriesModalOpen] = useState(false);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] =
    useState(false);
  const [isLandlordAnnouncementModalOpen, setIsLandlordAnnouncementModalOpen] =
    useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

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
          <p className="text-2xl font-bold text-gray-800">PHP 15,000.00</p>
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-green-600 transition duration-200">
            PAY NOW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div
          onClick={openLandlordAnnouncementModal}
          className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-800 transition duration-200"
        >
          <span className="text-3xl">📢</span>
          <p className="mt-2">Landlord Announcements</p>
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
      </div>

      <LandlordAnnouncementModal
        isOpen={isLandlordAnnouncementModalOpen}
        closeModal={closeLandlordAnnouncementModal}
        announcement={announcement}
      />

      <InquiriesModal
        isOpen={isInquiriesModalOpen}
        closeModal={closeInquiriesModal}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        removeFile={removeFile}
      />

      <LeaseAgreementModal
        isOpen={isLeaseModalOpen}
        closeModal={closeLeaseModal}
      />

      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        closeModal={closePaymentHistoryModal}
      />
    </div>
  );
};

export default TenantDashboard;
 