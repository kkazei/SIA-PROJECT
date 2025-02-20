import React, { useState } from "react";
import PaymentProofModal from "./PaymentProofModal";

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
export default LeaseAgreementModal;