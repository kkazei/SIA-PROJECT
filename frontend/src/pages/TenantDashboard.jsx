import React, { useState } from "react";
import InquiriesModal from "../components/Tenant-Dashboard/InquiriesModal";
import LeaseAgreementModal from "../components/Tenant-Dashboard/LeaseAgreementModal";
import LandlordAnnouncementModal from "../components/Tenant-Dashboard/LandlordAnnouncementModal";
import PaymentHistoryModal from "../components/Tenant-Dashboard/PaymentHistoryModal";
import PaymentProofModal from "../components/Tenant-Dashboard/PaymentProofModal";

// Main Dashboard Component
const TenantDashboard = () => {
  const [isInquiriesModalOpen, setIsInquiriesModalOpen] = useState(false);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] =
    useState(false);
  const [isLandlordAnnouncementModalOpen, setIsLandlordAnnouncementModalOpen] =
    useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Declare once
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

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

  const openPaymentProofModal = () => {
    setIsPaymentProofModalOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closePaymentProofModal = () => {
    setIsPaymentProofModalOpen(false);
    setSelectedFile(null);
    setReferenceNumber("");
    document.body.classList.remove("overflow-hidden");
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/tenant-login";
  };

  const removeFile = () => setSelectedFile(null);

  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mx-auto">
      <div className="bg-green-100 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
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
          <button
            onClick={openPaymentProofModal}
            className="bg-green-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-green-600 transition duration-200"
          >
            PAY NOW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
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

        <div
          onClick={logout}
          className="bg-green-500 text-white py-2 px-4 w-full sm:w-32 rounded-lg mt-2 hover:bg-red-600 transition duration-200 text-center"
        >
          <p>Logout</p>
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

      <PaymentProofModal
        isOpen={isPaymentProofModalOpen}
        closeModal={closePaymentProofModal}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
        referenceNumber={referenceNumber}
        setReferenceNumber={setReferenceNumber}
      />
    </div>
  );
};

export default TenantDashboard;