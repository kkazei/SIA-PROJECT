import React, { useState } from "react";

// Payment Proof Modal Component
const PaymentProofModal = ({
  isOpen,
  closeModal,
  handleFileChange,
  selectedFile,
  referenceNumber,
  setReferenceNumber,
}) => {
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
        {/* Profile and Outstanding Balance Section */}
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
          </div>
        </div>

        {/* Add Attachment Box */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Attach Proof of Payment
          </h3>
          <label className="mt-3 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg w-full h-40 cursor-pointer hover:border-blue-500 transition-all">
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Proof of Payment"
                className="max-w-full h-full rounded-lg object-cover"
              />
            ) : (
              <span className="text-gray-500">Add Attachment</span>
            )}
            <input
              type="file"
              accept=".png, .jpeg, .jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Reference Number Input */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Reference Number
          </h3>
          <input
            type="text"
            placeholder="Enter Reference Number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full p-3 mt-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={closeModal}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-700 transition duration-200"
          >
            Cancel Payment
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200">
            Send Proof of Payment
          </button>
        </div>
      </div>
    </div>
  );
};
export default PaymentProofModal;
